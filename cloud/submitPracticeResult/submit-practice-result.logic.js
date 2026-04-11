function buildSessionEventRecord(payload = {}) {
  return {
    sessionId: payload.sessionId,
    targetId: payload.targetId,
    audioFileId: payload.audioFileId,
    eventType: 'practice_result',
    responseType: payload.responseType || 'asr_unavailable',
    recognizedText: payload.recognizedText || '',
    createdAt: payload.now
  }
}

function buildSubmitPracticeResultResponse(result = {}) {
  return {
    responseType: result.responseType || 'asr_unavailable',
    recognizedText: result.recognizedText || '',
    shouldEncourage: (result.responseType || 'asr_unavailable') !== 'responded'
  }
}

module.exports = {
  buildSessionEventRecord,
  buildSubmitPracticeResultResponse
}
