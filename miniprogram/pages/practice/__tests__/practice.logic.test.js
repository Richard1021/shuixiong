const {
  buildPracticeState,
  isCloudFileId,
  buildPracticePhase,
  buildRecordingState,
  buildSubmittingState,
  buildNextTargetState,
  buildErrorRecoveryState,
  classifyAdvanceResult,
  buildPreviewAudioPlan,
  buildPlaybackProgressText,
  buildPromptPlayingPhase
} = require('../practice.logic')

describe('buildPracticeState', () => {
  test('falls back to current child name when query childName is missing', () => {
    const state = buildPracticeState(
      { sessionId: 'session_1' },
      { currentChild: { nickname: '小明' } }
    )

    expect(state.childName).toBe('小明')
  })

  test('decodes encoded chinese title', () => {
    const state = buildPracticeState({
      displayTitle: encodeURIComponent('S1 启蒙单词')
    })

    expect(state.displayTitle).toBe('S1 启蒙单词')
  })

  test('marks autoplay when startAudioUrl exists', () => {
    const state = buildPracticeState({
      startAudioUrl: encodeURIComponent('cloud://demo/start.mp3')
    })

    expect(state.startAudioUrl).toBe('cloud://demo/start.mp3')
    expect(state.shouldAutoPlay).toBe(true)
  })

  test('marks temp url conversion for cloud file ids', () => {
    const state = buildPracticeState({
      startAudioUrl: encodeURIComponent('cloud://demo/start.mp3')
    })

    expect(isCloudFileId(state.startAudioUrl)).toBe(true)
    expect(state.requiresTempUrl).toBe(true)
  })

  test('does not require temp conversion for https audio url from server', () => {
    const state = buildPracticeState({
      startAudioUrl: encodeURIComponent('https://tmp.example.com/start.mp3')
    })

    expect(isCloudFileId(state.startAudioUrl)).toBe(false)
    expect(state.requiresTempUrl).toBe(false)
    expect(state.shouldAutoPlay).toBe(true)
  })

  test('builds storybook presentation data for child friendly screen', () => {
    const state = buildPracticeState(
      {
        displayTitle: encodeURIComponent('Brown Bear'),
        startAudioUrl: encodeURIComponent('https://tmp.example.com/start.mp3')
      },
      {
        currentChild: { nickname: 'Lucas' }
      }
    )

    expect(state.heroTitle).toBe('Brown Bear')
    expect(state.heroSubtitle).toBe('小熊正在给 Lucas 讲故事')
    expect(state.storyHint).toBe('轻轻听，小熊马上开始')
    expect(state.showControls).toBe(false)
  })

  test('adds decorative visual tokens for enhanced storybook scene', () => {
    const state = buildPracticeState({
      displayTitle: encodeURIComponent('Dear Zoo')
    })

    expect(state.bookEmoji).toBe('🦁')
    expect(state.skyTone).toBe('golden')
    expect(state.decorations).toEqual(['☁️', '✨', '🌈'])
  })

  test('prefers real cover image when optional coverImageUrl is provided', () => {
    const state = buildPracticeState({
      displayTitle: encodeURIComponent('Dear Zoo'),
      coverImageUrl: encodeURIComponent('https://img.example.com/dear-zoo.jpg')
    })

    expect(state.coverImageUrl).toBe('https://img.example.com/dear-zoo.jpg')
    expect(state.hasCoverImage).toBe(true)
  })

  test('falls back to illustration cover when optional coverImageUrl is absent', () => {
    const state = buildPracticeState({
      displayTitle: encodeURIComponent('Dear Zoo')
    })

    expect(state.coverImageUrl).toBe('')
    expect(state.hasCoverImage).toBe(false)
  })

  test('uses single full segment when preview duration is missing', () => {
    const state = buildPracticeState({
      startAudioUrl: encodeURIComponent('https://tmp.example.com/start.mp3')
    })

    expect(state.previewAudioPlan).toEqual({
      segments: [{ startTime: 0, endTime: 0 }],
      needsTailSeek: false,
      shouldAutoAdvance: true,
      requiresCanplayGuard: false
    })
  })

  test('builds preview intro copy before playback starts', () => {
    const state = buildPracticeState({
      startAudioUrl: encodeURIComponent('https://tmp.example.com/start.mp3'),
      startAudioDurationMs: 18000
    })

    expect(state.playbackProgressText).toBe('正在播放第 0 段 / 共 2 段 · 共 18 秒')
  })
})

describe('practice phase helpers', () => {
  test('enters prompt playing phase when prompt audio url exists', () => {
    const state = buildPromptPlayingPhase({
      targetId: 'target_1',
      targetText: 'apple',
      targetType: 'word',
      promptText: '跟我一起念，apple',
      promptAudioUrl: 'https://tmp.example.com/apple.mp3'
    })

    expect(state.phase).toBe('prompt-playing')
    expect(state.showRecordButton).toBe(false)
    expect(state.stateHint).toBe('一起听一听吧')
    expect(state.promptAudioUrl).toBe('https://tmp.example.com/apple.mp3')
  })

  test('builds practice phase for word target with inviting guidance', () => {
    const state = buildPracticePhase('practice', {
      targetId: 'target_1',
      targetText: 'apple',
      targetType: 'word',
      promptText: '跟我一起念，apple'
    })

    expect(state.phase).toBe('practice')
    expect(state.targetId).toBe('target_1')
    expect(state.targetText).toBe('apple')
    expect(state.showRecordButton).toBe(true)
    expect(state.stateHint).toBe('宝贝，你来说一说')
  })

  test('builds practice phase for phrase target with gentle encouragement', () => {
    const state = buildPracticePhase('practice', {
      targetId: 'target_2',
      targetText: 'I see a bear',
      targetType: 'phrase',
      promptText: '跟我说一说，I see a bear'
    })

    expect(state.phase).toBe('practice')
    expect(state.showRecordButton).toBe(true)
    expect(state.stateHint).toBe('慢慢说也可以哦')
  })

  test('falls back to word guidance when practice target type is missing', () => {
    const state = buildPracticePhase('practice', {
      targetId: 'target_1',
      targetText: 'apple'
    })

    expect(state.stateHint).toBe('宝贝，你来说一说')
  })

  test('switches to recording state and hides record button', () => {
    const state = buildRecordingState({
      targetId: 'target_1',
      targetText: 'apple',
      showRecordButton: true
    })

    expect(state.phase).toBe('recording')
    expect(state.targetText).toBe('apple')
    expect(state.showRecordButton).toBe(false)
    expect(state.stateHint).toBe('水熊宝在听')
  })

  test('switches to submitting state with waiting hint', () => {
    const state = buildSubmittingState({
      targetId: 'target_1',
      targetText: 'apple'
    })

    expect(state.phase).toBe('submitting')
    expect(state.stateHint).toBe('水熊宝在想')
    expect(state.showRecordButton).toBe(false)
  })

  test('maps next target payload into prompt playing state when prompt audio exists', () => {
    const state = buildNextTargetState(
      { targetId: 'target_1', targetText: 'apple' },
      {
        nextPhase: 'practice',
        currentMode: 'word',
        targetId: 'target_2',
        targetText: 'banana',
        targetType: 'word',
        promptText: '跟我一起念，banana',
        promptAudioUrl: 'https://tmp.example.com/banana.mp3'
      }
    )

    expect(state.phase).toBe('prompt-playing')
    expect(state.showRecordButton).toBe(false)
    expect(state.promptAudioUrl).toBe('https://tmp.example.com/banana.mp3')
  })

  test('maps next target payload into practice state when prompt audio is absent', () => {
    const state = buildNextTargetState(
      { targetId: 'target_1', targetText: 'apple' },
      {
        nextPhase: 'practice',
        currentMode: 'word',
        targetId: 'target_2',
        targetText: 'banana',
        targetType: 'word',
        promptText: '跟我一起念，banana'
      }
    )

    expect(state.phase).toBe('practice')
    expect(state.currentMode).toBe('word')
    expect(state.targetId).toBe('target_2')
    expect(state.targetText).toBe('banana')
    expect(state.showRecordButton).toBe(true)
  })

  test('maps end payload into completed state', () => {
    const state = buildNextTargetState(
      { targetId: 'target_1', targetText: 'apple' },
      { nextPhase: 'end', sessionCompleted: true }
    )

    expect(state.phase).toBe('end')
    expect(state.sessionCompleted).toBe(true)
    expect(state.stateHint).toBe('宝贝真棒，今天完成啦')
    expect(state.showRecordButton).toBe(false)
  })

  test('recovers from error while keeping current target', () => {
    const state = buildErrorRecoveryState(
      { targetId: 'target_1', targetText: 'apple', autoPlayError: true },
      'asr_failed'
    )

    expect(state.phase).toBe('practice')
    expect(state.targetId).toBe('target_1')
    expect(state.targetText).toBe('apple')
    expect(state.autoPlayError).toBe(false)
    expect(state.stateHint).toBe('我们继续试试看')
  })

  test('classifies advance result by next phase', () => {
    expect(classifyAdvanceResult({ nextPhase: 'practice' })).toBe('practice')
    expect(classifyAdvanceResult({ nextPhase: 'parent_guidance' })).toBe('guidance')
    expect(classifyAdvanceResult({ nextPhase: 'end' })).toBe('end')
  })
})

describe('buildPreviewAudioPlan', () => {
  test('plays first 5 seconds and last 5 seconds for long audio in debug mode', () => {
    const plan = buildPreviewAudioPlan(18000)

    expect(plan.segments).toEqual([
      { startTime: 0, endTime: 5 },
      { startTime: 13, endTime: 18 }
    ])
    expect(plan.needsTailSeek).toBe(true)
  })

  test('does not auto advance long audio before preview playback finishes', () => {
    const plan = buildPreviewAudioPlan(18000)

    expect(plan.shouldAutoAdvance).toBe(false)
    expect(plan.requiresCanplayGuard).toBe(true)
  })
})

describe('practice logging coverage', () => {
  test('builds prompt playing state with prompt audio url for runtime logging inspection', () => {
    const state = buildNextTargetState(
      { targetId: 'target_1', targetText: 'apple' },
      {
        nextPhase: 'practice',
        currentMode: 'word',
        targetId: 'target_2',
        targetText: 'banana',
        targetType: 'word',
        promptText: '跟着说 banana',
        promptAudioUrl: 'cloud://tts/gentle_female/banana.mp3'
      }
    )

    expect(state).toEqual(expect.objectContaining({
      phase: 'prompt-playing',
      promptAudioUrl: 'cloud://tts/gentle_female/banana.mp3',
      showRecordButton: false
    }))
  })
})
