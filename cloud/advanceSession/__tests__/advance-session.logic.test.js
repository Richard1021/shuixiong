const {
  buildAdvanceSessionResult,
  buildAdvanceSessionEndResult,
  pickSessionTarget,
  buildPromptText
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

  test('builds guided prompt text for word target', () => {
    expect(buildPromptText('word', 'bear')).toBe('跟我一起念，bear')
  })

  test('builds guided prompt text for phrase target', () => {
    expect(buildPromptText('phrase', 'I see a bear')).toBe('跟我说一说，I see a bear')
  })

  test('falls back to word guidance when target type is missing', () => {
    expect(buildPromptText('', 'bear')).toBe('跟我一起念，bear')
  })

  test('builds practice result payload from word target with guided prompt audio text', () => {
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
      promptText: '跟我一起念，apple',
      promptAudioUrl: 'https://tmp.example.com/apple.mp3',
      sessionCompleted: false
    })
  })

  test('builds practice result payload from phrase target with guided prompt audio text', () => {
    expect(buildAdvanceSessionResult({
      targetId: 'target_3',
      text: 'I see a bear',
      targetType: 'phrase',
      promptAudioUrl: 'https://tmp.example.com/phrase.mp3'
    })).toEqual({
      nextPhase: 'practice',
      currentMode: 'phrase',
      targetId: 'target_3',
      targetText: 'I see a bear',
      targetType: 'phrase',
      promptText: '跟我说一说，I see a bear',
      promptAudioUrl: 'https://tmp.example.com/phrase.mp3',
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
