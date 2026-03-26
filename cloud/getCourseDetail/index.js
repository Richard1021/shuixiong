const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { courseId } = event;

  if (!courseId) {
    return {
      success: false,
      data: null,
      message: '课程 ID 不能为空'
    };
  }

  try {
    const result = await db.collection('courses').doc(courseId).get();

    if (!result.data) {
      return {
        success: false,
        data: null,
        message: '课程不存在'
      };
    }

    return {
      success: true,
      data: result.data,
      message: '获取课程详情成功'
    };
  } catch (error) {
    console.error('获取课程详情失败:', error);
    return {
      success: false,
      data: null,
      message: '获取课程详情失败：' + error.message
    };
  }
};
