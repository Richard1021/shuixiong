const { buildTtsCacheKey } = require('./tts.logic')

async function synthesizePromptAudio() {
  throw new Error('tts synthesize not implemented')
}

async function resolvePromptAudio(payload = {}, dependencies = {}) {
  const cacheKey = buildTtsCacheKey({
    voiceType: payload.voiceType,
    text: payload.text
  })

  if (!process.env.TENCENT_TTS_APP_ID || !process.env.TENCENT_TTS_SECRET_ID || !process.env.TENCENT_TTS_SECRET_KEY) {
    return {
      promptAudioUrl: '',
      cacheKey
    }
  }

  const synthesize = dependencies.synthesize || synthesizePromptAudio
  const promptAudioUrl = await synthesize(payload)

  return {
    promptAudioUrl: promptAudioUrl || '',
    cacheKey
  }
}

module.exports = {
  resolvePromptAudio,
  synthesizePromptAudio
}
