function sanitizeText(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

function buildTtsCacheKey({ voiceType, text }) {
  return `${voiceType}::${String(text || '').trim()}`
}

function buildTtsFilePath({ voiceType, text }) {
  return `tts/${voiceType}/${sanitizeText(text)}.mp3`
}

function buildPromptAudioPayload({ targetText, promptText, promptAudioUrl }) {
  return {
    targetText,
    promptText,
    promptAudioUrl: promptAudioUrl || ''
  }
}

module.exports = {
  buildTtsCacheKey,
  buildTtsFilePath,
  buildPromptAudioPayload
}
