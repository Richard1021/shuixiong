const {
  buildAdvanceSessionResult,
  buildAdvanceSessionEndResult,
  pickSessionTarget
} = require('../advance-session.logic')

describe('advance session logic', () => {
  const targetList = [
    { targetId: 'target_1', text: 'apple', targetType: 'word' },
    { targetId: 'target_2', text: 'banana', targetType: 'word' }
  ]

  test('picks first available target from cache', () => {
    const result = pickSessionTarget(targetList, {
      remainingIds: ['target_1', 'target_2'],
      recentIds: []
    })

    expect(result.target.targetId).toBe('target_1')
    expect(result.cache.remainingIds).toEqual(['target_2'])
  })

  test('builds practice result payload from target with prompt audio url', () => {
    expect(buildAdvanceSessionResult({
      targetId: 'target_1',
      text: 'apple',
      targetType: 'word',
      promptAudioUrl: 'https://tmp.example.com/apple.mp3'
    })).toEqual({
      nextPhase: 'practice',
      currentMode: 'word',
      targetId: 'target_1',
      targetText: 'apple',
      targetType: 'word',
      promptText: '跟着说 apple',
      promptAudioUrl: 'https://tmp.example.com/apple.mp3',
      sessionCompleted: false
    })
  })

  test('builds end result payload', () => {
    expect(buildAdvanceSessionEndResult()).toEqual({
      nextPhase: 'end',
      sessionCompleted: true
    })
  })
})
