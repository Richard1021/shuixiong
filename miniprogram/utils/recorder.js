const recorderManager = wx.getRecorderManager();

class RecorderManager {
  constructor() {
    this.isRecording = false;
    this.tempFilePath = '';
    this.onStopCallback = null;

    recorderManager.onStart(() => {
      console.log('录音开始');
      this.isRecording = true;
    });

    recorderManager.onStop((res) => {
      console.log('录音结束', res);
      this.isRecording = false;
      this.tempFilePath = res.tempFilePath;

      if (this.onStopCallback) {
        this.onStopCallback(res);
      }
    });

    recorderManager.onError((err) => {
      console.error('录音错误:', err);
      this.isRecording = false;
    });
  }

  // 开始录音
  start(options = {}) {
    if (this.isRecording) {
      return;
    }

    const defaultOptions = {
      duration: 10000,  // 最长 10 秒
      sampleRate: 44100,
      numberOfChannels: 1,
      encodeBitRate: 192000,
      format: 'aac',
    };

    recorderManager.start({
      ...defaultOptions,
      ...options,
    });

    this.isRecording = true;
  }

  // 停止录音
  stop(onStop) {
    this.onStopCallback = onStop;
    recorderManager.stop();
  }

  // 获取录音文件路径
  getFilePath() {
    return this.tempFilePath;
  }
}

export default new RecorderManager();
