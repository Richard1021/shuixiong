const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 语音指令映射表
const VOICE_COMMANDS = {
  // 播放控制
  '下一首': { action: 'next', type: 'control' },
  '下一曲': { action: 'next', type: 'control' },
  '上一首': { action: 'prev', type: 'control' },
  '上一曲': { action: 'prev', type: 'control' },
  '暂停': { action: 'pause', type: 'control' },
  '继续': { action: 'resume', type: 'control' },
  '播放': { action: 'resume', type: 'control' },
  '再听一遍': { action: 'replay', type: 'control' },
  '再来一次': { action: 'replay', type: 'control' },

  // 循环控制
  '循环播放': { action: 'setLoop', loop: true, type: 'loop' },
  '不要循环了': { action: 'setLoop', loop: false, type: 'loop' },
  '单曲循环': { action: 'setLoop', loop: 'single', type: 'loop' },
  '列表循环': { action: 'setLoop', loop: 'list', type: 'loop' },

  // 难度调节
  '太难了': { action: 'decreaseDifficulty', type: 'difficulty' },
  '简单一点': { action: 'decreaseDifficulty', type: 'difficulty' },
  '换一个': { action: 'skip', type: 'control' },
};

// 模糊匹配语音指令
function matchVoiceCommand(text) {
  if (!text) return null;

  // 精确匹配
  if (VOICE_COMMANDS[text]) {
    return VOICE_COMMANDS[text];
  }

  // 模糊匹配（包含关键词）
  for (const [command, mapping] of Object.entries(VOICE_COMMANDS)) {
    if (text.includes(command)) {
      return mapping;
    }
  }

  // 检测"我想听 XXX"模式
  const match = text.match(/我想听 (.+)/);
  if (match && match[1]) {
    return {
      action: 'playSpecific',
      songName: match[1],
      type: 'specific'
    };
  }

  return null;
}

exports.main = async (event, context) => {
  const { audioFile, voiceText } = event;

  if (!voiceText) {
    return {
      success: false,
      data: null,
      message: '未识别到语音内容'
    };
  }

  try {
    // 匹配语音指令
    const command = matchVoiceCommand(voiceText);

    if (command) {
      console.log('识别到语音指令:', voiceText, '=>', command);
      return {
        success: true,
        data: {
          recognized: true,
          command: command,
          originalText: voiceText
        },
        message: '语音指令识别成功'
      };
    } else {
      console.log('未匹配到已知指令:', voiceText);
      return {
        success: true,
        data: {
          recognized: false,
          originalText: voiceText
        },
        message: '未匹配到已知指令'
      };
    }
  } catch (error) {
    console.error('语音识别失败:', error);
    return {
      success: false,
      data: null,
      message: '语音识别失败：' + error.message
    };
  }
};
