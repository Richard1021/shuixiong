const { getCurrentChild, getChildProfiles, setCurrentChild, pickCurrentChildFromProfiles, initSession } = require('../../utils/api')

Page({
  data: {
    currentChild: null,
    loading: false
  },
  onShow() {
    this.syncCurrentChild()
  },
  syncCurrentChild() {
    const currentChild = getCurrentChild()
    this.setData({ currentChild })

    if (currentChild && currentChild.childId) {
      return
    }

    getChildProfiles()
      .then((result) => {
        const fallbackChild = pickCurrentChildFromProfiles(result.profiles || [])
        if (fallbackChild) {
          setCurrentChild(fallbackChild)
          this.setData({ currentChild: fallbackChild })
        }
      })
      .catch(() => {})
  },
  handleManageChild() {
    wx.navigateTo({
      url: '/pages/child-profile/child-profile'
    })
  },
  handleStart() {
    const currentChild = getCurrentChild()
    if (!currentChild || !currentChild.childId) {
      wx.navigateTo({
        url: '/pages/child-profile/child-profile?source=start'
      })
      return
    }

    this.setData({ loading: true })
    initSession({ childId: currentChild.childId })
      .then((result) => {
        const query = [
          `sessionId=${encodeURIComponent(result.sessionId || '')}`,
          `contentId=${encodeURIComponent(result.contentId || '')}`,
          `displayTitle=${encodeURIComponent(result.displayTitle || '')}`,
          `startAudioUrl=${encodeURIComponent(result.startAudioUrl || '')}`,
          `startAudioDurationMs=${encodeURIComponent(result.startAudioDurationMs || 0)}`,
          `coverImageUrl=${encodeURIComponent(result.coverImageUrl || '')}`,
          `childName=${encodeURIComponent(currentChild.nickname || '')}`
        ].join('&')

        wx.navigateTo({
          url: `/pages/practice/practice?${query}`
        })
      })
      .catch(() => {
        wx.showToast({ title: '启动失败，请稍后再试', icon: 'none' })
      })
      .finally(() => {
        this.setData({ loading: false })
      })
  }
})
