const { buildTtsCacheKey, buildTtsFilePath, buildPromptAudioPayload } = require('../tts.logic')

describe('advance session tts logic', () => {
  test('builds stable cache key for gentle female voice and text', () => {
    expect(buildTtsCacheKey({ voiceType: 'gentle_female', text: 'apple' })).toBe('gentle_female::apple')
  })

  test('builds cloud storage path for cached prompt audio', () => {
    expect(buildTtsFilePath({ voiceType: 'gentle_female', text: 'apple' })).toBe('tts/gentle_female/apple.mp3')
  })

  test('builds prompt audio payload with returned audio url', () => {
    expect(buildPromptAudioPayload({
      targetText: 'apple',
      promptText: '跟着说 apple',
      promptAudioUrl: 'https://tmp.example.com/apple.mp3'
    })).toEqual({
      targetText: 'apple',
      promptText: '跟着说 apple',
      promptAudioUrl: 'https://tmp.example.com/apple.mp3'
    })
  })
})
