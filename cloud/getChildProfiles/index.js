const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command
const COLLECTION = 'child_profile'

exports.main = async () => {
  const { OPENID } = cloud.getWXContext()
  const result = await db.collection(COLLECTION)
    .where({
      parentOpenId: OPENID,
      status: 'active'
    })
    .orderBy('updatedAt', 'desc')
    .get()

  return {
    profiles: result.data || []
  }
}
