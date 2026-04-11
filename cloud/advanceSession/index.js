const cloud = require('wx-server-sdk')
const { resetTargetPool } = require('./session-state')
const { resolvePromptAudio } = require('./tts-adapter')

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
    promptText: '跟着说 apple',
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

  const promptAudio = await resolvePromptAudio({
    text: selection.target.text || selection.target.targetText || '',
    voiceType: 'gentle_female'
  })

  await db.collection(SESSION_COLLECTION).doc(session._id).update({
    data: {
      _cache: selection.cache,
      updatedAt: Date.now()
    }
  })

  return buildAdvanceSessionResult({
    ...selection.target,
    promptAudioUrl: promptAudio.promptAudioUrl
  })
}
