const { buildTtsCacheKey, buildTtsFilePath, buildPromptAudioPayload } = require('../tts.logic')

describe('advance session tts logic', () => {
  test('builds stable cache key for guided prompt text', () => {
    expect(buildTtsCacheKey({ voiceType: 'gentle_female', text: '跟我一起念，apple' })).toBe('gentle_female::跟我一起念，apple')
  })

  test('builds cloud storage path using guided prompt text fingerprint', () => {
    expect(buildTtsFilePath({ voiceType: 'gentle_female', text: '跟我一起念，apple' })).not.toBe('tts/gentle_female/apple.mp3')
  })

  test('builds stable cache key for gentle female voice and text', () => {
    expect(buildTtsCacheKey({ voiceType: 'gentle_female', text: 'apple' })).toBe('gentle_female::apple')
  })

  test('builds cloud storage path for cached prompt audio', () => {
    expect(buildTtsFilePath({ voiceType: 'gentle_female', text: 'apple' })).toBe('tts/gentle_female/apple-1f3870be.mp3')
  })

  test('builds prompt audio payload with returned audio url', () => {
    expect(buildPromptAudioPayload({
      targetText: 'apple',
      promptText: '跟我一起念，apple',
      promptAudioUrl: 'https://tmp.example.com/apple.mp3'
    })).toEqual({
      targetText: 'apple',
      promptText: '跟我一起念，apple',
      promptAudioUrl: 'https://tmp.example.com/apple.mp3'
    })
  })
})
