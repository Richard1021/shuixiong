async function requestAsrRecognition() {
  throw new Error('asr request not implemented')
}

async function recognizeAudio(payload = {}, dependencies = {}) {
  if (!process.env.TENCENT_ASR_APP_ID || !process.env.TENCENT_ASR_SECRET_ID || !process.env.TENCENT_ASR_SECRET_KEY) {
    return {
      responseType: 'asr_unavailable',
      recognizedText: ''
    }
  }

  const provider = dependencies.requestAsrRecognition || requestAsrRecognition

  try {
    const result = await provider(payload)
    const recognizedText = String(result && result.recognizedText ? result.recognizedText : '').trim()

    if (!recognizedText) {
      return {
        responseType: 'no_response',
        recognizedText: ''
      }
    }

    return {
      responseType: 'responded',
      recognizedText
    }
  } catch (error) {
    return {
      responseType: 'asr_failed',
      recognizedText: ''
    }
  }
}

module.exports = {
  recognizeAudio,
  requestAsrRecognition
}
