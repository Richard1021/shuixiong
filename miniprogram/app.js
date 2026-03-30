App({
  onLaunch: function () {
    if (wx.cloud) {
      wx.cloud.init({
        env: 'cloud1-1gl7ogzw38dfbb44',
        traceUser: true,
      });
    }

    this.globalData = {
      userInfo: null,
      currentCourse: null,
      isPlaying: false,
    };
  },

  globalData: {
    userInfo: null,
    currentCourse: null,
    isPlaying: false,
  },
});
