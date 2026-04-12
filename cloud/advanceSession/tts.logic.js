const crypto = require('crypto')

function sanitizeText(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

function buildPromptFingerprint(text) {
  return crypto.createHash('md5').update(String(text || '').trim()).digest('hex').slice(0, 8)
}

function buildTtsCacheKey({ voiceType, text }) {
  return `${voiceType}::${String(text || '').trim()}`
}

function buildTtsFilePath({ voiceType, text }) {
  const normalizedText = String(text || '').trim()
  return `tts/${voiceType}/${sanitizeText(normalizedText)}-${buildPromptFingerprint(normalizedText)}.mp3`
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
