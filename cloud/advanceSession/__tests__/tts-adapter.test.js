const { resolvePromptAudio } = require('../tts-adapter')

describe('advance session tts adapter', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = {
      ...originalEnv
    }
    delete process.env.TENCENT_TTS_APP_ID
    delete process.env.TENCENT_TTS_SECRET_ID
    delete process.env.TENCENT_TTS_SECRET_KEY
  })

  afterAll(() => {
    process.env = originalEnv
  })

  test('returns empty prompt audio url when env is missing', async () => {
    await expect(resolvePromptAudio({
      text: 'apple',
      voiceType: 'gentle_female'
    })).resolves.toEqual({
      promptAudioUrl: '',
      cacheKey: 'gentle_female::apple'
    })
  })

  test('returns generated prompt audio url when provider succeeds', async () => {
    process.env.TENCENT_TTS_APP_ID = 'app'
    process.env.TENCENT_TTS_SECRET_ID = 'id'
    process.env.TENCENT_TTS_SECRET_KEY = 'key'

    await expect(resolvePromptAudio(
      { text: 'apple', voiceType: 'gentle_female' },
      { synthesize: () => Promise.resolve('https://tmp.example.com/apple.mp3') }
    )).resolves.toEqual({
      promptAudioUrl: 'https://tmp.example.com/apple.mp3',
      cacheKey: 'gentle_female::apple'
    })
  })
})
