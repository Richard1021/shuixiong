const { buildSubmitPracticeResultResponse, buildSessionEventRecord } = require('../submit-practice-result.logic')

describe('submit practice result logic', () => {
  test('builds encourage=true for unavailable response', () => {
    expect(buildSubmitPracticeResultResponse({
      responseType: 'asr_unavailable',
      recognizedText: ''
    })).toEqual({
      responseType: 'asr_unavailable',
      recognizedText: '',
      shouldEncourage: true
    })
  })

  test('builds encourage=false for responded response', () => {
    expect(buildSubmitPracticeResultResponse({
      responseType: 'responded',
      recognizedText: 'apple'
    })).toEqual({
      responseType: 'responded',
      recognizedText: 'apple',
      shouldEncourage: false
    })
  })

  test('builds session event record', () => {
    expect(buildSessionEventRecord({
      sessionId: 'session_1',
      targetId: 'target_1',
      audioFileId: 'cloud://demo/audio.mp3',
      responseType: 'responded',
      recognizedText: 'apple',
      now: 123
    })).toEqual({
      sessionId: 'session_1',
      targetId: 'target_1',
      audioFileId: 'cloud://demo/audio.mp3',
      eventType: 'practice_result',
      responseType: 'responded',
      recognizedText: 'apple',
      createdAt: 123
    })
  })
})
