function safeDecode(value) {
  if (!value) {
    return ''
  }

  try {
    return decodeURIComponent(value)
  } catch (error) {
    return value
  }
}

function isCloudFileId(url) {
  return typeof url === 'string' && url.startsWith('cloud://')
}

function buildHeroSubtitle(childName) {
  if (!childName) {
    return '小熊正在给你讲故事'
  }

  return `小熊正在给 ${childName} 讲故事`
}

function pickBookEmoji(title) {
  const normalizedTitle = String(title || '').toLowerCase()

  if (normalizedTitle.includes('bear')) {
    return '🐻'
  }

  if (normalizedTitle.includes('zoo')) {
    return '🦁'
  }

  if (normalizedTitle.includes('brown')) {
    return '🧸'
  }

  return '📖'
}

function buildPreviewAudioPlan(durationMs = 0) {
  const normalizedDurationMs = Math.max(0, Number(durationMs || 0))
  const durationSeconds = Math.floor(normalizedDurationMs / 1000)

  if (!normalizedDurationMs) {
    return {
      segments: [{ startTime: 0, endTime: 0 }],
      needsTailSeek: false,
      shouldAutoAdvance: true,
      requiresCanplayGuard: false
    }
  }

  if (durationSeconds <= 10) {
    return {
      segments: [{ startTime: 0, endTime: durationSeconds }],
      needsTailSeek: false,
      shouldAutoAdvance: false,
      requiresCanplayGuard: false
    }
  }

  return {
    segments: [
      { startTime: 0, endTime: 5 },
      { startTime: Math.max(durationSeconds - 5, 5), endTime: durationSeconds }
    ],
    needsTailSeek: true,
    shouldAutoAdvance: false,
    requiresCanplayGuard: true
  }
}

function buildPlaybackProgressText(currentSegment = 0, totalSegments = 0, totalDurationSeconds = 0, finished = false) {
  if (finished) {
    return `故事播放完啦 · 共 ${totalDurationSeconds || 0} 秒`
  }

  if (!totalSegments) {
    return totalDurationSeconds ? `故事马上开始 · 共 ${totalDurationSeconds} 秒` : '故事马上开始'
  }

  return `正在播放第 ${currentSegment} 段 / 共 ${totalSegments} 段 · 共 ${totalDurationSeconds || 0} 秒`
}

function buildPracticeState(options = {}, context = {}) {
  const latestSession = context.latestSession || {}
  const currentChild = context.currentChild || {}
  const sessionId = options.sessionId || latestSession.sessionId || ''
  const contentId = options.contentId || latestSession.contentId || ''
  const displayTitle = safeDecode(options.displayTitle) || latestSession.displayTitle || ''
  const startAudioUrl = safeDecode(options.startAudioUrl) || latestSession.startAudioUrl || ''
  const startAudioDurationMs = Number(options.startAudioDurationMs || latestSession.startAudioDurationMs || 0)
  const childName = safeDecode(options.childName) || currentChild.nickname || ''
  const coverImageUrl = safeDecode(options.coverImageUrl) || latestSession.coverImageUrl || ''
  const previewAudioPlan = buildPreviewAudioPlan(startAudioDurationMs)

  return {
    sessionId,
    contentId,
    displayTitle,
    startAudioUrl,
    startAudioDurationMs,
    childName,
    coverImageUrl,
    hasCoverImage: Boolean(coverImageUrl),
    shouldAutoPlay: Boolean(startAudioUrl),
    requiresTempUrl: isCloudFileId(startAudioUrl),
    heroTitle: displayTitle || '故事时间',
    heroSubtitle: buildHeroSubtitle(childName),
    storyHint: '轻轻听，小熊马上开始',
    showControls: false,
    bookEmoji: pickBookEmoji(displayTitle),
    skyTone: 'golden',
    decorations: ['☁️', '✨', '🌈'],
    phase: 'loading',
    currentMode: 'word',
    targetId: '',
    targetText: '',
    targetType: '',
    promptText: '',
    promptAudioUrl: '',
    stateHint: '轻轻听，小熊马上开始',
    showRecordButton: false,
    sessionCompleted: false,
    practiceCount: 0,
    responseType: '',
    recognizedText: '',
    previewAudioPlan,
    playbackProgressText: buildPlaybackProgressText(0, previewAudioPlan.segments.length, Math.floor(startAudioDurationMs / 1000))
  }
}

function buildPracticePhase(phase, target = {}) {
  return {
    phase,
    currentMode: target.currentMode || target.targetType || 'word',
    targetId: target.targetId || '',
    targetText: target.targetText || '',
    targetType: target.targetType || '',
    promptText: target.promptText || '',
    promptAudioUrl: target.promptAudioUrl || '',
    showRecordButton: phase === 'practice',
    stateHint: phase === 'practice' ? '跟着水熊宝说一说' : '准备一下'
  }
}

function buildRecordingState(current = {}) {
  return {
    ...current,
    phase: 'recording',
    showRecordButton: false,
    stateHint: '水熊宝在听'
  }
}

function buildSubmittingState(current = {}) {
  return {
    ...current,
    phase: 'submitting',
    showRecordButton: false,
    stateHint: '水熊宝在想'
  }
}

function classifyAdvanceResult(advanceResult = {}) {
  if (advanceResult.nextPhase === 'parent_guidance') {
    return 'guidance'
  }

  if (advanceResult.nextPhase === 'end') {
    return 'end'
  }

  return 'practice'
}

function buildNextTargetState(current = {}, advanceResult = {}) {
  if (classifyAdvanceResult(advanceResult) === 'end') {
    return {
      ...current,
      phase: 'end',
      sessionCompleted: Boolean(advanceResult.sessionCompleted),
      showRecordButton: false,
      stateHint: '今天练习完成啦'
    }
  }

  return {
    ...current,
    ...buildPracticePhase('practice', advanceResult),
    currentMode: advanceResult.currentMode || current.currentMode || 'word',
    sessionCompleted: false,
    practiceCount: Number(current.practiceCount || 0) + 1
  }
}

function buildErrorRecoveryState(current = {}) {
  return {
    ...current,
    phase: 'practice',
    autoPlayError: false,
    showRecordButton: Boolean(current.targetId),
    stateHint: '我们继续试试看'
  }
}

module.exports = {
  buildPracticeState,
  isCloudFileId,
  buildPracticePhase,
  buildRecordingState,
  buildSubmittingState,
  buildNextTargetState,
  buildErrorRecoveryState,
  classifyAdvanceResult,
  buildPreviewAudioPlan,
  buildPlaybackProgressText
}
