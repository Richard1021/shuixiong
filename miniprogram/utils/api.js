// 调用云函数封装
function callCloudFunction(name, data = {}) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name,
      data,
      success: (res) => {
        resolve(res.result);
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
}

// 获取课程列表
export function getCourseList(stage = 'S1', type = null) {
  return callCloudFunction('getCourseList', { stage, type });
}

// 获取课程详情
export function getCourseDetail(courseId) {
  return callCloudFunction('getCourseDetail', { courseId });
}

// 提交录音
export function submitRecording(data) {
  return callCloudFunction('submitRecording', data);
}

// 语音识别
export function recognizeVoice(data) {
  return callCloudFunction('recognizeVoice', data);
}

// 上传文件到云存储
export function uploadFile(filePath) {
  return new Promise((resolve, reject) => {
    wx.cloud.uploadFile({
      filePath,
      cloudPath: `recordings/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.aac`,
      success: (res) => {
        resolve(res.fileID);
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
}
