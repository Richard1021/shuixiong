import audioManager from '../../utils/audio';
import recorderManager from '../../utils/api';
import { submitRecording, recognizeVoice } from '../../utils/api';

const app = getApp();

Page({
  data: {
    courseInfo: null,
    segments: [],
    currentIndex: 0,
    currentSegment: {},
    isPlaying: false,
    isRecording: false,
    mascotEmotion: 'normal',
    mascotSpeech: '',
    hintText: '',
    showScore: false,
    scoreData: {},
  },

  onLoad: function (options) {
    const { courseId } = options;
    this.loadCourseDetail(courseId);
  },

  // 加载课程详情
  async loadCourseDetail(courseId) {
    wx.showLoading({ title: '加载中...' });

    try {
      const result = await wx.cloud.callFunction({
        name: 'getCourseDetail',
        data: { courseId }
      });

      if (result.result.success) {
        const course = result.result.data;
        this.setData({
          courseInfo: course,
          segments: course.segments || [],
          currentIndex: 0,
          currentSegment: course.segments?.[0] || {}
        });

        // 自动播放第一句
        this.playCurrentSegment();
      } else {
        wx.showToast({ title: result.result.message, icon: 'none' });
      }
    } catch (error) {
      console.error('加载课程失败:', error);
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  // 播放当前句子
  playCurrentSegment() {
    const segment = this.data.currentSegment;
    if (!segment?.audioUrl) return;

    this.setData({ isPlaying: true, mascotEmotion: 'listening' });

    audioManager.play(segment.audioUrl, () => {
      this.setData({
        isPlaying: false,
        mascotEmotion: 'normal',
        hintText: '该你跟读啦!'
      });
    });
  },

  // 切换播放/暂停
  togglePlay() {
    if (this.data.isPlaying) {
      audioManager.pause();
      this.setData({ isPlaying: false });
    } else {
      this.playCurrentSegment();
    }
  },

  // 切换录音
  toggleRecord() {
    if (this.data.isRecording) {
      this.stopRecord();
    } else {
      this.startRecord();
    }
  },

  // 开始录音
  startRecord() {
    this.setData({
      isRecording: true,
      mascotEmotion: 'normal',
      hintText: '正在听你说...'
    });

    recorderManager.start({
      duration: 10000
    });

    recorderManager.onStop = async (res) => {
      // 上传录音并获取评分
      await this.submitRecording(res.tempFilePath);
    };
  },

  // 停止录音
  stopRecord() {
    recorderManager.stop();
    this.setData({ isRecording: false });
  },

  // 提交录音
  async submitRecording(filePath) {
    wx.showLoading({ title: '评分中...' });

    try {
      // 上传文件
      const fileResult = await wx.cloud.uploadFile({
        filePath,
        cloudPath: `recordings/${Date.now()}.aac`
      });

      // 提交评分
      const result = await submitRecording({
        courseId: this.data.courseInfo._id,
        segmentId: this.data.currentSegment.id,
        audioFile: fileResult.fileID
      });

      if (result.success) {
        this.setData({
          showScore: true,
          scoreData: result.data.score,
          mascotEmotion: result.data.feedback.emotion,
          mascotSpeech: result.data.feedback.audioText
        });

        // 播放鼓励语音
        this.playEncouragement(result.data.feedback.audioText);
      }
    } catch (error) {
      console.error('提交录音失败:', error);
    } finally {
      wx.hideLoading();
    }
  },

  // 播放鼓励语音
  playEncouragement(text) {
    // TODO: 调用 TTS 生成鼓励语音
    setTimeout(() => {
      this.setData({
        showScore: false,
        mascotEmotion: 'happy',
        mascotSpeech: ''
      });
    }, 3000);
  },

  // 上一句
  prevSegment() {
    const index = Math.max(0, this.data.currentIndex - 1);
    this.updateSegment(index);
  },

  // 下一句
  nextSegment() {
    const index = Math.min(this.data.segments.length - 1, this.data.currentIndex + 1);
    this.updateSegment(index);
  },

  // 重听
  replaySegment() {
    this.playCurrentSegment();
  },

  // 更新句子
  updateSegment(index) {
    this.setData({
      currentIndex: index,
      currentSegment: this.data.segments[index],
      showScore: false,
      mascotEmotion: 'normal',
      mascotSpeech: '',
      hintText: ''
    });

    this.playCurrentSegment();
  },

  // 返回
  goBack() {
    audioManager.stop();
    wx.navigateBack();
  },

  onUnload() {
    audioManager.destroy();
  }
});
