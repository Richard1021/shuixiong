const app = getApp();

Page({
  data: {
    userInfo: null,
    courseList: [],
    currentTab: 'all',
    loading: false
  },

  onLoad: function () {
    this.loadUserInfo();
    this.loadCourses();
  },

  loadUserInfo() {
    const userInfo = app.globalData.userInfo;
    if (userInfo) {
      this.setData({ userInfo });
    }
  },

  async loadCourses() {
    this.setData({ loading: true });

    try {
      const result = await wx.cloud.callFunction({
        name: 'getCourseList',
        data: {
          stage: 'S1',
          type: this.data.currentTab === 'all' ? null : this.data.currentTab
        }
      });

      if (result.result.success) {
        this.setData({ courseList: result.result.data });
      } else {
        wx.showToast({ title: result.result.message, icon: 'none' });
      }
    } catch (error) {
      console.error('加载课程失败:', error);
      wx.showToast({ title: '加载失败，请重试', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 切换分类 Tab
  switchTab: function (e) {
    const { type } = e.currentTarget.dataset;
    this.setData({ currentTab: type });
    this.loadCourses();
  },

  // 跳转到播放页
  goToPlayer: function (e) {
    const { course } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/player/player?courseId=${course._id}`,
      success: () => {
        app.globalData.currentCourse = course;
      }
    });
  },

  // 跳转到个人中心
  goToProfile: function () {
    wx.navigateTo({
      url: '/pages/profile/profile'
    });
  }
});
