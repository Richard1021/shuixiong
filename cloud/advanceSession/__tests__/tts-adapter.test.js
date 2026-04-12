const {
  resolvePromptAudio,
  buildTtsRequestPayload,
  buildTtsRequestHeaders,
  synthesizePromptAudio
} = require('../tts-adapter')

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

  test('builds tts request payload for mixed chinese guidance and english word', () => {
    expect(buildTtsRequestPayload({ text: '跟我一起念，lion' })).toEqual(expect.objectContaining({
      Text: '跟我一起念，lion',
      PrimaryLanguage: 1,
      VoiceType: 1001,
      Codec: 'mp3'
    }))
  })

  test('builds tts request payload for gentle female voice', () => {
    expect(buildTtsRequestPayload({ text: 'apple' })).toEqual({
      Text: 'apple',
      SessionId: 'apple',
      ModelType: 1,
      Volume: 0,
      Speed: 0,
      ProjectId: 0,
      VoiceType: 1001,
      PrimaryLanguage: 1,
      SampleRate: 16000,
      Codec: 'mp3'
    })
  })

  test('builds signed tts request headers', () => {
    const headers = buildTtsRequestHeaders({
      body: JSON.stringify({ Text: 'apple' }),
      timestamp: 1700000000,
      secretId: 'id',
      secretKey: 'key'
    })

    expect(headers.Authorization).toContain('TC3-HMAC-SHA256')
    expect(headers['X-TC-Action']).toBe('TextToVoice')
    expect(headers['X-TC-Version']).toBe('2019-08-23')
    expect(headers['X-TC-Timestamp']).toBe('1700000000')
    expect(headers.Host).toBe('tts.tencentcloudapi.com')
  })

  test('synthesizes prompt audio from tencent api response', async () => {
    process.env.TENCENT_TTS_APP_ID = 'app'
    process.env.TENCENT_TTS_SECRET_ID = 'id'
    process.env.TENCENT_TTS_SECRET_KEY = 'key'

    const request = jest.fn((options, callback) => {
      const response = {
        statusCode: 200,
        on: jest.fn()
      }
      callback(response)
      response.on.mock.calls.find(([event]) => event === 'data')[1](Buffer.from(JSON.stringify({
        Response: {
          Audio: Buffer.from('mp3-binary').toString('base64')
        }
      })))
      response.on.mock.calls.find(([event]) => event === 'end')[1]()

      return {
        on: jest.fn(),
        write: jest.fn(),
        end: jest.fn()
      }
    })

    const uploadFile = jest.fn(() => Promise.resolve({
      fileID: 'cloud://tts/gentle_female/apple.mp3'
    }))
    const getTempFileURL = jest.fn(() => Promise.resolve({
      fileList: [{ tempFileURL: 'https://tmp.example.com/apple.mp3' }]
    }))

    await expect(synthesizePromptAudio(
      { text: 'apple', voiceType: 'gentle_female' },
      { request, uploadFile, getTempFileURL, now: () => 1700000000000 }
    )).resolves.toBe('https://tmp.example.com/apple.mp3')

    expect(request).toHaveBeenCalledTimes(1)
    expect(uploadFile).toHaveBeenCalledWith(expect.objectContaining({
      cloudPath: 'tts/gentle_female/apple-1f3870be.mp3'
    }))
    expect(getTempFileURL).toHaveBeenCalledWith({
      fileList: ['cloud://tts/gentle_female/apple.mp3']
    })
  })

  test('returns empty string when tencent api response misses audio', async () => {
    process.env.TENCENT_TTS_APP_ID = 'app'
    process.env.TENCENT_TTS_SECRET_ID = 'id'
    process.env.TENCENT_TTS_SECRET_KEY = 'key'

    const request = jest.fn((options, callback) => {
      const response = {
        statusCode: 200,
        on: jest.fn()
      }
      callback(response)
      response.on.mock.calls.find(([event]) => event === 'data')[1](Buffer.from(JSON.stringify({ Response: {} })))
      response.on.mock.calls.find(([event]) => event === 'end')[1]()

      return {
        on: jest.fn(),
        write: jest.fn(),
        end: jest.fn()
      }
    })

    await expect(synthesizePromptAudio(
      { text: 'apple', voiceType: 'gentle_female' },
      { request, now: () => 1700000000000 }
    )).resolves.toBe('')
  })

  test('logs tencent api error detail when response contains error', async () => {
    process.env.TENCENT_TTS_APP_ID = 'app'
    process.env.TENCENT_TTS_SECRET_ID = 'id'
    process.env.TENCENT_TTS_SECRET_KEY = 'key'

    const request = jest.fn((options, callback) => {
      const response = {
        statusCode: 200,
        on: jest.fn()
      }
      callback(response)
      response.on.mock.calls.find(([event]) => event === 'data')[1](Buffer.from(JSON.stringify({
        Response: {
          Error: {
            Code: 'AuthFailure.SignatureFailure',
            Message: 'signature invalid'
          },
          RequestId: 'req-1'
        }
      })))
      response.on.mock.calls.find(([event]) => event === 'end')[1]()

      return {
        on: jest.fn(),
        write: jest.fn(),
        end: jest.fn()
      }
    })

    const logger = jest.fn()

    await expect(synthesizePromptAudio(
      { text: 'apple', voiceType: 'gentle_female' },
      { request, logger, now: () => 1700000000000 }
    )).resolves.toBe('')

    expect(logger).toHaveBeenCalledWith('[advanceSession][tts] response error', {
      text: 'apple',
      error: {
        Code: 'AuthFailure.SignatureFailure',
        Message: 'signature invalid'
      },
      requestId: 'req-1'
    })
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

  test('returns empty string when temp file url is missing after upload', async () => {
    process.env.TENCENT_TTS_APP_ID = 'app'
    process.env.TENCENT_TTS_SECRET_ID = 'id'
    process.env.TENCENT_TTS_SECRET_KEY = 'key'

    const request = jest.fn((options, callback) => {
      const response = {
        statusCode: 200,
        on: jest.fn()
      }
      callback(response)
      response.on.mock.calls.find(([event]) => event === 'data')[1](Buffer.from(JSON.stringify({
        Response: {
          Audio: Buffer.from('mp3-binary').toString('base64')
        }
      })))
      response.on.mock.calls.find(([event]) => event === 'end')[1]()

      return {
        on: jest.fn(),
        write: jest.fn(),
        end: jest.fn()
      }
    })

    const uploadFile = jest.fn(() => Promise.resolve({
      fileID: 'cloud://tts/gentle_female/apple.mp3'
    }))
    const getTempFileURL = jest.fn(() => Promise.resolve({ fileList: [{}] }))
    const logger = jest.fn()

    await expect(synthesizePromptAudio(
      { text: 'apple', voiceType: 'gentle_female' },
      { request, uploadFile, getTempFileURL, logger, now: () => 1700000000000 }
    )).resolves.toBe('')

    expect(logger).toHaveBeenCalledWith('[advanceSession][tts] temp url missing', {
      cloudPath: 'tts/gentle_female/apple-1f3870be.mp3',
      fileID: 'cloud://tts/gentle_female/apple.mp3'
    })
  })

  test('returns empty prompt audio url when provider throws', async () => {
    process.env.TENCENT_TTS_APP_ID = 'app'
    process.env.TENCENT_TTS_SECRET_ID = 'id'
    process.env.TENCENT_TTS_SECRET_KEY = 'key'

    await expect(resolvePromptAudio(
      { text: 'apple', voiceType: 'gentle_female' },
      { synthesize: () => Promise.reject(new Error('boom')) }
    )).resolves.toEqual({
      promptAudioUrl: '',
      cacheKey: 'gentle_female::apple'
    })
  })
})
