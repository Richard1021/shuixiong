const {
  buildPracticeState,
  buildPracticePhase,
  buildRecordingState,
  buildSubmittingState,
  buildNextTargetState,
  buildErrorRecoveryState,
  buildPlaybackProgressText,
  isCloudFileId
} = require('./practice.logic')
const { advanceSession, submitPracticeResult } = require('../../utils/api')
const { registerRecorderListeners, startRecord, stopRecord } = require('../../utils/recorder')

const APP = getApp()
const PREVIEW_GAP_MS = 600
const PROMPT_TIMEOUT_MS = 3000

Page({
  data: {
    sessionId: '',
    contentId: '',
    displayTitle: '',
    startAudioUrl: '',
    startAudioDurationMs: 0,
    childName: '',
    autoPlayError: false
  },
  onLoad(options) {
    const currentChild = APP.globalData.currentChild || wx.getStorageSync('currentChild') || null
    const latestSession = APP.globalData.latestSession || wx.getStorageSync('latestSession') || null
    const nextState = buildPracticeState(options, {
      currentChild,
      latestSession
    })

    console.log('[practice] onLoad state', nextState)
    this.setData(nextState)
    registerRecorderListeners({
      onStop: (result) => this.handleRecorderStop(result),
      onError: (error) => {
        console.error('[practice] recorder error', error)
        this.setData(buildErrorRecoveryState(this.data, 'record_failed'))
      }
    })
  },
  async onReady() {
    console.log('[practice] api exports', {
      advanceSessionType: typeof advanceSession,
      submitPracticeResultType: typeof submitPracticeResult
    })
    console.log('[practice] onReady', {
      shouldAutoPlay: this.data.shouldAutoPlay,
      startAudioUrl: this.data.startAudioUrl,
      startAudioDurationMs: this.data.startAudioDurationMs,
      previewAudioPlan: this.data.previewAudioPlan
    })

    if (!this.data.shouldAutoPlay || !this.data.startAudioUrl || !wx.createInnerAudioContext) {
      console.log('[practice] skip preview and load first target directly')
      this.loadFirstTarget('no-audio-or-api')
      return
    }

    if (this.data.previewAudioPlan && this.data.previewAudioPlan.shouldAutoAdvance) {
      console.log('[practice] auto advance by preview plan')
      this.loadFirstTarget('preview-plan-auto-advance')
      return
    }

    try {
      this.audioContext = wx.createInnerAudioContext()
      this.audioContext.src = this.data.startAudioUrl
      this.audioContext.autoplay = false
      this.audioContext.onError((error) => {
        console.error('[practice] audio error', error)
        this.setData({ autoPlayError: true })
        this.loadFirstTarget('audio-error')
      })
      this.audioContext.onCanplay(() => {
        console.log('[practice] audio canplay', {
          previewStarted: Boolean(this.previewStarted)
        })
        if (this.previewStarted) {
          return
        }

        this.previewStarted = true
        this.playPreviewSegments()
      })
      this.audioContext.onEnded(() => {
        console.log('[practice] audio ended')
      })
      this.audioContext.play()
    } catch (error) {
      console.error('[practice] onReady play failed', error)
      this.setData({ autoPlayError: true })
      this.loadFirstTarget('play-setup-failed')
    }
  },
  playPreviewSegments() {
    const plan = this.data.previewAudioPlan || { segments: [] }
    const segments = plan.segments || []

    console.log('[practice] playPreviewSegments', plan)

    if (!this.audioContext || !segments.length) {
      this.setData({ playbackProgressText: '故事播放完啦' })
      this.loadFirstTarget('no-preview-segments')
      return
    }

    this.previewSegmentIndex = 0
    this.runPreviewSegment(segments)
  },
  runPreviewSegment(segments) {
    const segment = segments[this.previewSegmentIndex]

    console.log('[practice] runPreviewSegment', {
      previewSegmentIndex: this.previewSegmentIndex,
      segment,
      totalSegments: segments.length
    })

    if (!segment || !this.audioContext) {
      this.loadFirstTarget('segment-missing-or-audio-disposed')
      return
    }

    this.setData({
      playbackProgressText: buildPlaybackProgressText(
        this.previewSegmentIndex + 1,
        segments.length,
        Math.floor((this.data.startAudioDurationMs || 0) / 1000)
      )
    })

    try {
      this.audioContext.seek(segment.startTime)
    } catch (error) {
      console.warn('[practice] audio seek failed', error)
    }

    this.audioContext.play()
    clearTimeout(this.previewTimer)
    this.previewTimer = setTimeout(() => {
      if (!this.audioContext) {
        console.warn('[practice] preview timer fired without audio context')
        return
      }

      this.audioContext.pause()
      this.previewSegmentIndex += 1

      if (this.previewSegmentIndex >= segments.length) {
        console.log('[practice] preview finished, loading first target')
        this.setData({
          playbackProgressText: buildPlaybackProgressText(
            segments.length,
            segments.length,
            Math.floor((this.data.startAudioDurationMs || 0) / 1000),
            true
          )
        })
        this.loadFirstTarget('preview-finished')
        return
      }

      setTimeout(() => {
        this.runPreviewSegment(segments)
      }, PREVIEW_GAP_MS)
    }, Math.max((segment.endTime - segment.startTime) * 1000, 500))
  },
  async loadFirstTarget(reason = 'unknown') {
    console.log('[practice] loadFirstTarget requested', {
      reason,
      loadingFirstTarget: Boolean(this.loadingFirstTarget),
      sessionId: this.data.sessionId
    })

    if (this.loadingFirstTarget) {
      return
    }

    this.loadingFirstTarget = true
    try {
      const result = await advanceSession({
        sessionId: this.data.sessionId,
        eventType: 'startPlaybackFinished'
      })
      console.log('[practice] loadFirstTarget success', result)
      const nextState = buildNextTargetState(this.data, result)
      console.log('[practice] loadFirstTarget nextState', {
        phase: nextState.phase,
        targetId: nextState.targetId,
        targetText: nextState.targetText,
        promptAudioUrl: nextState.promptAudioUrl,
        hasPromptAudio: Boolean(nextState.promptAudioUrl)
      })
      this.applyTargetState(nextState)
    } catch (error) {
      console.error('[practice] loadFirstTarget failed', error)
      this.setData(buildErrorRecoveryState(this.data, 'advance_failed'))
    } finally {
      this.loadingFirstTarget = false
    }
  },
  applyTargetState(nextState) {
    console.log('[practice] applyTargetState', {
      phase: nextState.phase,
      targetId: nextState.targetId,
      targetText: nextState.targetText,
      promptAudioUrl: nextState.promptAudioUrl,
      hasPromptAudio: Boolean(nextState.promptAudioUrl)
    })
    this.setData(nextState)

    if (nextState.phase === 'prompt-playing') {
      this.playPromptAudio(nextState.promptAudioUrl)
    }
  },
  async playPromptAudio(url) {
    console.log('[practice] prompt playing', {
      url,
      isCloudFileId: isCloudFileId(url),
      hasCloudApi: Boolean(wx.cloud && wx.cloud.getTempFileURL)
    })

    if (!url || !wx.createInnerAudioContext) {
      console.log('[practice] prompt fallback to practice phase')
      this.setData(buildPracticePhase('practice', this.data))
      return
    }

    if (this.audioContext) {
      try {
        this.audioContext.pause()
      } catch (error) {}
    }

    clearTimeout(this.promptTimer)
    if (this.promptAudioContext) {
      this.promptAudioContext.destroy()
      this.promptAudioContext = null
    }

    try {
      let playableUrl = url
      if (isCloudFileId(url) && wx.cloud && wx.cloud.getTempFileURL) {
        const tempResult = await wx.cloud.getTempFileURL({ fileList: [url] })
        const file = tempResult.fileList && tempResult.fileList[0]
        playableUrl = file && file.tempFileURL ? file.tempFileURL : url
        console.log('[practice] prompt temp url resolved', {
          originalUrl: url,
          playableUrl,
          hasTempFileURL: Boolean(file && file.tempFileURL)
        })
      }

      const ctx = wx.createInnerAudioContext()
      this.promptAudioContext = ctx
      ctx.src = playableUrl
      ctx.autoplay = false
      console.log('[practice] prompt ctx ready', {
        playableUrl,
        phase: this.data.phase
      })
      ctx.onEnded(() => {
        console.log('[practice] prompt ended')
        clearTimeout(this.promptTimer)
        this.setData(buildPracticePhase('practice', this.data))
      })
      ctx.onError((error) => {
        console.warn('[practice] prompt error', error)
        clearTimeout(this.promptTimer)
        this.setData(buildPracticePhase('practice', this.data))
      })
      this.promptTimer = setTimeout(() => {
        console.warn('[practice] prompt timeout fallback', {
          playableUrl,
          phase: this.data.phase
        })
        if (this.promptAudioContext) {
          this.promptAudioContext.stop()
        }
        this.setData(buildPracticePhase('practice', this.data))
      }, PROMPT_TIMEOUT_MS)
      console.log('[practice] prompt play invoke', { playableUrl })
      ctx.play()
    } catch (error) {
      console.warn('[practice] prompt setup failed', error)
      clearTimeout(this.promptTimer)
      this.setData(buildPracticePhase('practice', this.data))
    }
  },
  handleStartRecord() {
    try {
      startRecord()
      this.setData(buildRecordingState(this.data))
    } catch (error) {
      console.error('[practice] startRecord failed', error)
      this.setData(buildErrorRecoveryState(this.data, 'record_failed'))
    }
  },
  handleStopRecord() {
    try {
      stopRecord()
      this.setData(buildSubmittingState(this.data))
    } catch (error) {
      console.error('[practice] stopRecord failed', error)
      this.setData(buildErrorRecoveryState(this.data, 'record_failed'))
    }
  },
  async handleRecorderStop(result) {
    console.log('[practice] handleRecorderStop', result)
    if (!result || !result.tempFilePath) {
      this.setData(buildErrorRecoveryState(this.data, 'record_failed'))
      return
    }

    try {
      const uploadResult = await wx.cloud.uploadFile({
        cloudPath: `practice-recordings/${this.data.sessionId}-${Date.now()}.mp3`,
        filePath: result.tempFilePath
      })
      console.log('[practice] upload success', uploadResult)

      const submitResult = await submitPracticeResult({
        sessionId: this.data.sessionId,
        targetId: this.data.targetId,
        audioFileId: uploadResult.fileID
      })
      console.log('[practice] submitPracticeResult success', submitResult)

      const nextResult = await advanceSession({
        sessionId: this.data.sessionId,
        eventType: 'practiceResultSubmitted',
        responseType: submitResult.responseType
      })
      console.log('[practice] advanceSession after submit success', nextResult)

      const nextState = buildNextTargetState({
        ...this.data,
        responseType: submitResult.responseType,
        recognizedText: submitResult.recognizedText || ''
      }, nextResult)
      this.setData({
        responseType: submitResult.responseType,
        recognizedText: submitResult.recognizedText || ''
      })
      this.applyTargetState(nextState)
    } catch (error) {
      console.error('[practice] handleRecorderStop failed', error)
      this.setData(buildErrorRecoveryState(this.data, 'submit_failed'))
    }
  },
  onUnload() {
    clearTimeout(this.previewTimer)
    clearTimeout(this.promptTimer)
    if (this.audioContext) {
      this.audioContext.destroy()
      this.audioContext = null
    }
    if (this.promptAudioContext) {
      this.promptAudioContext.destroy()
      this.promptAudioContext = null
    }
  }
})
