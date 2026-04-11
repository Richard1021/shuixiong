const cloud = require('wx-server-sdk')
const { recognizeAudio } = require('./asr-adapter')
const {
  buildSessionEventRecord,
  buildSubmitPracticeResultResponse
} = require('./submit-practice-result.logic')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const SESSION_COLLECTION = 'session'
const EVENT_COLLECTION = 'session_event'

exports.main = async (event = {}) => {
  const sessionId = event.sessionId
  const targetId = event.targetId
  const audioFileId = event.audioFileId

  if (!sessionId) {
    throw new Error('sessionId is required')
  }

  if (!targetId) {
    throw new Error('targetId is required')
  }

  if (!audioFileId) {
    throw new Error('audioFileId is required')
  }

  const now = Date.now()
  const asrResult = await recognizeAudio({ audioFileId, targetId })
  const eventRecord = buildSessionEventRecord({
    sessionId,
    targetId,
    audioFileId,
    responseType: asrResult.responseType,
    recognizedText: asrResult.recognizedText,
    now
  })

  await db.collection(EVENT_COLLECTION).add({
    data: eventRecord
  })

  const sessionResult = await db.collection(SESSION_COLLECTION).where({ sessionId }).get()
  const session = sessionResult.data && sessionResult.data[0]

  if (session && session._id) {
    await db.collection(SESSION_COLLECTION).doc(session._id).update({
      data: {
        updatedAt: now
      }
    })
  }

  return buildSubmitPracticeResultResponse(asrResult)
}
