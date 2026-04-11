const { recognizeAudio } = require('../asr-adapter')

describe('asr adapter', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = {
      ...originalEnv
    }
    delete process.env.TENCENT_ASR_APP_ID
    delete process.env.TENCENT_ASR_SECRET_ID
    delete process.env.TENCENT_ASR_SECRET_KEY
  })

  afterAll(() => {
    process.env = originalEnv
  })

  test('returns unavailable when env is missing', async () => {
    await expect(recognizeAudio({ audioFileId: 'cloud://demo/audio.mp3' })).resolves.toEqual({
      responseType: 'asr_unavailable',
      recognizedText: ''
    })
  })

  test('returns failed when provider throws', async () => {
    process.env.TENCENT_ASR_APP_ID = 'app'
    process.env.TENCENT_ASR_SECRET_ID = 'id'
    process.env.TENCENT_ASR_SECRET_KEY = 'key'

    await expect(recognizeAudio(
      { audioFileId: 'cloud://demo/audio.mp3' },
      { requestAsrRecognition: () => Promise.reject(new Error('boom')) }
    )).resolves.toEqual({
      responseType: 'asr_failed',
      recognizedText: ''
    })
  })

  test('returns no response when provider gives empty text', async () => {
    process.env.TENCENT_ASR_APP_ID = 'app'
    process.env.TENCENT_ASR_SECRET_ID = 'id'
    process.env.TENCENT_ASR_SECRET_KEY = 'key'

    await expect(recognizeAudio(
      { audioFileId: 'cloud://demo/audio.mp3' },
      { requestAsrRecognition: () => Promise.resolve({ recognizedText: '' }) }
    )).resolves.toEqual({
      responseType: 'no_response',
      recognizedText: ''
    })
  })

  test('returns responded when provider gives text', async () => {
    process.env.TENCENT_ASR_APP_ID = 'app'
    process.env.TENCENT_ASR_SECRET_ID = 'id'
    process.env.TENCENT_ASR_SECRET_KEY = 'key'

    await expect(recognizeAudio(
      { audioFileId: 'cloud://demo/audio.mp3' },
      { requestAsrRecognition: () => Promise.resolve({ recognizedText: 'apple' }) }
    )).resolves.toEqual({
      responseType: 'responded',
      recognizedText: 'apple'
    })
  })
})
