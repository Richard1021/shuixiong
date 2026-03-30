const app = getApp();

Page({
  data: {
    userInfo: null,
    userId: '等待登录',
    stats: {
      studyDays: 0,
      readCount: 0,
      stars: 0
    }
  },

  onLoad: function () {
    this.loadUserInfo();
    this.loadStats();
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = app.globalData.userInfo;
    if (userInfo) {
      this.setData({
        userInfo,
        userId: userInfo.cloudId || '未登录'
      });
    }
  },

  async onGetUserProfile() {
    try {
      const { userInfo } = await wx.getUserProfile({
        desc: '用于展示用户信息',
        lang: 'zh_CN'
      });
      app.globalData.userInfo = userInfo;
      this.setData({
        userInfo,
        userId: userInfo.cloudId || '未登录'
      });
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  },

  // 加载学习统计
  async loadStats() {
    try {
      if (!wx.cloud) {
        throw new Error('cloud not available');
      }
      const { result } = await wx.cloud.callFunction({
        name: 'getUserStats',
        data: {}
      });

      if (result.success) {
        this.setData({ stats: result.data });
      }
    } catch (error) {
      console.error('加载统计失败:', error);
      // 使用默认值
      this.setData({
        stats: {
          studyDays: 0,
          readCount: 0,
          stars: 0
        }
      });
    }
  },

  // 跳转到首页
  goToHome: function () {
    wx.switchTab({
      url: '/pages/home/home'
    });
  },

  // 跳转到设置
  goToSettings: function () {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  // 跳转到关于
  goToAbout: function () {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  }
});
