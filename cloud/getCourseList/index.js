const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { stage = 'S1', type = null } = event;

  try {
    let query = db.collection('courses').where({
      stage: stage
    });

    // 如果指定了类型，添加过滤条件
    if (type) {
      query = query.and({
        type: type
      });
    }

    const result = await query.orderBy('createdAt', 'desc').get();

    return {
      success: true,
      data: result.data,
      message: '获取课程列表成功'
    };
  } catch (error) {
    console.error('获取课程列表失败:', error);
    return {
      success: false,
      data: [],
      message: '获取课程列表失败：' + error.message
    };
  }
};
