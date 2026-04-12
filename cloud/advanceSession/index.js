const cloud = require('wx-server-sdk')
const { resetTargetPool } = require('./session-state')
const { resolvePromptAudio } = require('./tts-adapter')
const {
  buildAdvanceSessionResult,
  buildAdvanceSessionEndResult,
  pickSessionTarget
} = require('./advance-session.logic')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const SESSION_COLLECTION = 'session'
const TARGET_COLLECTION = 'content_target'

function buildFallbackTarget() {
  return {
    nextPhase: 'practice',
    currentMode: 'word',
    targetId: 'target_demo_s1',
    targetText: 'apple',
    targetType: 'word',
    promptText: '跟我一起念，apple',
    promptAudioUrl: '',
    sessionCompleted: false
  }
}

exports.main = async (event = {}) => {
  const sessionId = event.sessionId

  if (!sessionId) {
    throw new Error('sessionId is required')
  }

  const sessionResult = await db.collection(SESSION_COLLECTION).where({ sessionId }).get()
  const session = sessionResult.data && sessionResult.data[0]

  if (!session || !session._id) {
    throw new Error('session not found')
  }

  const targetResult = await db.collection(TARGET_COLLECTION).where({
    contentId: session.contentId,
    status: 'active'
  }).get()
  const targetList = targetResult.data || []

  if (!targetList.length) {
    return buildFallbackTarget()
  }

  const allIds = targetList.map((item) => item.targetId)
  const cache = session._cache && Array.isArray(session._cache.remainingIds)
    ? session._cache
    : resetTargetPool(allIds)
  const selection = pickSessionTarget(targetList, cache)

  if (!selection.target) {
    await db.collection(SESSION_COLLECTION).doc(session._id).update({
      data: {
        completed: true,
        endedAt: Date.now(),
        updatedAt: Date.now()
      }
    })

    return buildAdvanceSessionEndResult()
  }

  const result = buildAdvanceSessionResult({
    ...selection.target,
    promptAudioUrl: ''
  })

  const promptText = result.promptText
  console.log('[advanceSession] selected target', {
    sessionId,
    targetId: selection.target.targetId,
    targetText: selection.target.text || selection.target.targetText || '',
    promptText,
    cacheRemaining: selection.cache && selection.cache.remainingIds
      ? selection.cache.remainingIds.length
      : 0
  })

  const promptAudio = await resolvePromptAudio({
    text: result.promptText,
    voiceType: 'gentle_female'
  })

  console.log('[advanceSession] prompt audio resolved', {
    sessionId,
    targetId: selection.target.targetId,
    promptAudioUrl: promptAudio.promptAudioUrl,
    hasPromptAudio: Boolean(promptAudio.promptAudioUrl),
    cacheKey: promptAudio.cacheKey
  })

  await db.collection(SESSION_COLLECTION).doc(session._id).update({
    data: {
      _cache: selection.cache,
      updatedAt: Date.now()
    }
  })

  return buildAdvanceSessionResult({
    ...selection.target,
    promptAudioUrl: promptAudio.promptAudioUrl,
    ttsText: result.promptText
  })
}
