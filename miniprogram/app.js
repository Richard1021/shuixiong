App({
  globalData: {
    currentChild: null,
    latestSession: null
  },
  onLaunch() {
    if (wx.cloud) {
      wx.cloud.init({ 
        env: 'cloud1-1gl7ogzw38dfbb44',
        traceUser: true
      })
    }

    try {
      const currentChild = wx.getStorageSync('currentChild')
      if (currentChild) {
        this.globalData.currentChild = currentChild
      }
    } catch (error) {}
  },
  setCurrentChild(child) {
    this.globalData.currentChild = child || null
    wx.setStorageSync('currentChild', this.globalData.currentChild)
  },
  setLatestSession(session) {
    this.globalData.latestSession = session || null
    wx.setStorageSync('latestSession', this.globalData.latestSession)
  }
})
