const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const CONTENT_COLLECTION = 'content_map'
const SESSION_COLLECTION = 'session'

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

async function resolvePlayableFileUrl(fileId) {
  if (!fileId || !String(fileId).startsWith('cloud://')) {
    return fileId || ''
  }

  try {
    const result = await cloud.getTempFileURL({
      fileList: [fileId]
    })
    const file = result.fileList && result.fileList[0]

    if (file && file.tempFileURL) {
      return file.tempFileURL
    }
  } catch (error) {}

  return ''
}

exports.main = async (event) => {
  const now = Date.now()
  const childId = event.childId

  if (!childId) {
    throw new Error('childId is required')
  }

  let contentList = []

  try {
    const contentResult = await db.collection(CONTENT_COLLECTION)
      .where({
        stage: 'S1',
        status: 'active'
      })
      .get()
    contentList = contentResult.data || []
  } catch (error) {}

  const fallbackContent = {
    contentId: 'content_demo_s1',
    displayTitle: 'S1 启蒙单词',
    startAudioUrl: '',
    startAudioDurationMs: 3200,
    coverImageUrl: ''
  }

  const selectedContent = contentList.length ? pickRandom(contentList) : fallbackContent
  const playableStartAudioUrl = await resolvePlayableFileUrl(selectedContent.startAudioUrl)
  const playableCoverImageUrl = await resolvePlayableFileUrl(selectedContent.coverImageUrl)
  const sessionRecord = {
    sessionId: `session_${now}`,
    childId,
    contentId: selectedContent.contentId,
    currentMode: 'word',
    startedAt: now,
    completed: false,
    partialResultFlag: 0,
    createdAt: now,
    updatedAt: now
  }

  await db.collection(SESSION_COLLECTION).add({
    data: sessionRecord
  })

  return {
    sessionId: sessionRecord.sessionId,
    contentId: selectedContent.contentId,
    displayTitle: selectedContent.displayTitle,
    startAudioUrl: playableStartAudioUrl,
    startAudioDurationMs: selectedContent.startAudioDurationMs || 0,
    coverImageUrl: playableCoverImageUrl
  }
}
