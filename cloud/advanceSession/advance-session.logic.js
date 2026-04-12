const { pickNextTarget, advanceTargetPool } = require('./session-state')

function buildPromptText(targetType, text) {
  const normalizedText = String(text || '').trim()

  if (targetType === 'phrase') {
    return `跟我说一说，${normalizedText}`
  }

  return `跟我一起念，${normalizedText}`
}

function buildAdvanceSessionResult(target = {}) {
  const targetText = target.text || target.targetText || ''

  return {
    nextPhase: 'practice',
    currentMode: target.targetType || 'word',
    targetId: target.targetId,
    targetText,
    targetType: target.targetType || 'word',
    promptText: target.ttsText || buildPromptText(target.targetType, targetText),
    promptAudioUrl: target.promptAudioUrl || '',
    sessionCompleted: false
  }
}

function buildAdvanceSessionEndResult() {
  return {
    nextPhase: 'end',
    sessionCompleted: true
  }
}

function pickSessionTarget(targetList = [], cache = {}) {
  const nextTargetId = pickNextTarget(cache.remainingIds || [], cache.recentIds || [])

  if (!nextTargetId) {
    return {
      target: null,
      cache
    }
  }

  const target = targetList.find((item) => item.targetId === nextTargetId) || null

  return {
    target,
    cache: advanceTargetPool(cache, nextTargetId)
  }
}

module.exports = {
  buildAdvanceSessionResult,
  buildAdvanceSessionEndResult,
  pickSessionTarget,
  buildPromptText
}
