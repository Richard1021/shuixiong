const innerAudioContext = wx.createInnerAudioContext();

class AudioManager {
  constructor() {
    this.isPlaying = false;
    this.currentSrc = '';
    this.onEndedCallback = null;

    innerAudioContext.onEnded(() => {
      this.isPlaying = false;
      if (this.onEndedCallback) {
        this.onEndedCallback();
      }
    });

    innerAudioContext.onError((res) => {
      console.error('音频播放失败:', res);
      this.isPlaying = false;
    });
  }

  // 播放音频
  play(src, onEnded) {
    if (this.isPlaying) {
      this.stop();
    }

    this.onEndedCallback = onEnded;
    innerAudioContext.src = src;
    innerAudioContext.play();
    this.isPlaying = true;
    this.currentSrc = src;
  }

  // 暂停
  pause() {
    innerAudioContext.pause();
    this.isPlaying = false;
  }

  // 恢复
  resume() {
    innerAudioContext.resume();
    this.isPlaying = true;
  }

  // 停止
  stop() {
    innerAudioContext.stop();
    this.isPlaying = false;
    this.currentSrc = '';
  }

  // 跳转位置
  seek(position) {
    innerAudioContext.seek(position);
  }

  // 销毁
  destroy() {
    innerAudioContext.destroy();
  }
}

export default new AudioManager();
