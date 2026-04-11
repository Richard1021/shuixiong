const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const COLLECTION = 'child_profile'

function buildCurrentChild(record) {
  return {
    childId: record.childId || record._id,
    nickname: record.nickname,
    currentStage: record.currentStage,
    isCurrent: true
  }
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const now = Date.now()
  const childId = event.childId
  const setCurrent = event.setCurrent !== false

  if (setCurrent) {
    const currentList = await db.collection(COLLECTION)
      .where({
        parentOpenId: OPENID,
        isCurrent: 1,
        status: 'active'
      })
      .get()

    await Promise.all((currentList.data || []).map((item) => db.collection(COLLECTION).doc(item._id).update({
      data: {
        isCurrent: 0,
        updatedAt: now
      }
    })))
  }

  if (childId) {
    const target = await db.collection(COLLECTION).doc(childId).get()
    await db.collection(COLLECTION).doc(childId).update({
      data: {
        isCurrent: setCurrent ? 1 : target.data.isCurrent || 0,
        updatedAt: now
      }
    })

    return {
      currentChild: buildCurrentChild({
        ...target.data,
        childId,
        isCurrent: setCurrent ? 1 : target.data.isCurrent || 0
      })
    }
  }

  const record = {
    parentOpenId: OPENID,
    childId: `child_${now}`,
    nickname: event.nickname,
    currentStage: event.currentStage || 'S1',
    isCurrent: setCurrent ? 1 : 0,
    status: 'active',
    createdAt: now,
    updatedAt: now
  }

  await db.collection(COLLECTION).add({ data: record })

  return {
    currentChild: buildCurrentChild(record)
  }
}
