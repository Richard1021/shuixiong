const { pickNextTarget, advanceTargetPool } = require('./session-state')

function buildAdvanceSessionResult(target = {}) {
  return {
    nextPhase: 'practice',
    currentMode: target.targetType || 'word',
    targetId: target.targetId,
    targetText: target.text || target.targetText || '',
    targetType: target.targetType || 'word',
    promptText: target.ttsText || `跟着说 ${target.text || target.targetText || ''}`,
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
  pickSessionTarget
}
