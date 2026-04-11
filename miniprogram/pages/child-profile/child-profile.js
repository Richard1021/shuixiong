const { getChildProfiles, saveChildProfile, setCurrentChild } = require('../../utils/api')

Page({
  data: {
    profiles: [],
    nickname: '',
    currentStage: 'S1',
    loading: false,
    saving: false
  },
  onShow() {
    this.loadProfiles()
  },
  loadProfiles() {
    this.setData({ loading: true })
    getChildProfiles()
      .then((result) => {
        this.setData({
          profiles: result.profiles || []
        })
      })
      .catch(() => {
        wx.showToast({ title: '获取孩子失败', icon: 'none' })
      })
      .finally(() => {
        this.setData({ loading: false })
      })
  },
  handleNicknameInput(event) {
    this.setData({
      nickname: event.detail.value
    })
  },
  handleStageChange(event) {
    const stages = ['S1', 'S2', 'S3']
    this.setData({
      currentStage: stages[event.detail.value] || 'S1'
    })
  },
  handleSetCurrent(event) {
    const child = event.currentTarget.dataset.child
    if (!child || !child.childId) {
      return
    }

    this.setData({ saving: true })
    saveChildProfile({ childId: child.childId, setCurrent: true })
      .then((result) => {
        if (result.currentChild) {
          setCurrentChild(result.currentChild)
        }
        this.loadProfiles()
        wx.showToast({ title: '已切换孩子', icon: 'success' })
      })
      .finally(() => {
        this.setData({ saving: false })
      })
  },
  handleSubmit() {
    if (!this.data.nickname.trim()) {
      wx.showToast({ title: '请输入孩子昵称', icon: 'none' })
      return
    }

    this.setData({ saving: true })
    saveChildProfile({
      nickname: this.data.nickname.trim(),
      currentStage: this.data.currentStage,
      setCurrent: true
    })
      .then((result) => {
        if (result.currentChild) {
          setCurrentChild(result.currentChild)
        }
        this.setData({ nickname: '' })
        this.loadProfiles()
        wx.showToast({ title: '保存成功', icon: 'success' })
      })
      .finally(() => {
        this.setData({ saving: false })
      })
  }
})
