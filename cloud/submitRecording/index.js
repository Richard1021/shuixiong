const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 评分权重配置
const SCORE_WEIGHTS = {
  pronunciation: 0.4,  // 发音准确度 40%
  fluency: 0.3,        // 流利度 30%
  completeness: 0.3    // 完整度 30%
};

// 鼓励式反馈策略
function getEncouragingFeedback(score) {
  if (score >= 80) {
    return {
      text: "Wow! You did it! Great job!",
      audioText: "Wow! You did it!",
      emotion: "happy"
    };
  } else if (score >= 60) {
    return {
      text: "Good try! Let's do it again!",
      audioText: "Great job! Let's try one more!",
      emotion: "encourage"
    };
  } else {
    return {
      text: "You're doing great! One more time!",
      audioText: "You're doing great! One more time!",
      emotion: "cheer"
    };
  }
}

exports.main = async (event, context) => {
  const {
    courseId,
    segmentId,
    audioFile,      // 云文件 ID
    voicePrint,     // 语音识别结果（base64 或文本）
    userId
  } = event;

  if (!courseId || !segmentId || !audioFile) {
    return {
      success: false,
      data: null,
      message: '参数不完整'
    };
  }

  try {
    // 1. 调用微信语音识别 API（这里模拟评分，实际需接入同声传译）
    // TODO: 接入微信同声传译插件获取真实评分
    const mockScores = {
      pronunciation: Math.floor(Math.random() * 30) + 70,  // 70-100
      fluency: Math.floor(Math.random() * 30) + 70,
      completeness: Math.floor(Math.random() * 30) + 70
    };

    // 2. 计算总分
    const totalScore = Math.floor(
      mockScores.pronunciation * SCORE_WEIGHTS.pronunciation +
      mockScores.fluency * SCORE_WEIGHTS.fluency +
      mockScores.completeness * SCORE_WEIGHTS.completeness
    );

    // 3. 获取鼓励式反馈
    const feedback = getEncouragingFeedback(totalScore);

    // 4. 保存学习记录
    const recordId = await db.collection('learningRecords').add({
      data: {
        userId: userId || context.OPENID,
        courseId,
        segmentId,
        audioUrl: audioFile,
        userRecordingUrl: audioFile,  // 实际应为录音文件 URL
        score: {
          total: totalScore,
          pronunciation: mockScores.pronunciation,
          fluency: mockScores.fluency,
          completeness: mockScores.completeness
        },
        feedback: feedback.audioText,
        emotion: feedback.emotion,
        createdAt: db.serverDate()
      }
    });

    return {
      success: true,
      data: {
        recordId: recordId._id,
        score: {
          total: totalScore,
          ...mockScores
        },
        feedback: feedback
      },
      message: '提交成功'
    };
  } catch (error) {
    console.error('提交录音失败:', error);
    return {
      success: false,
      data: null,
      message: '提交录音失败：' + error.message
    };
  }
};
