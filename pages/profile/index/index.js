// pages/profile/index/index.js
const app = getApp();

Page({
  data: {
    userInfo: null,
    stats: {
      bookCount: 0,
      borrowCount: 0,
      historyCount: 0
    },
    loading: true
  },

  onLoad() {
    this.loadUserInfo();
    this.loadStats();
  },

  onShow() {
    if (app.globalData.userInfo !== this.data.userInfo) {
      this.loadUserInfo();
    }
  },

  async loadUserInfo() {
    this.setData({
      userInfo: app.globalData.userInfo,
      loading: false
    });
  },

  async loadStats() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'profile',
        data: {
          action: 'stats',
          userId: app.globalData.userInfo._id,
          dormitory: app.globalData.userInfo.dormitory
        }
      });
      
      if (res.result.code === 200) {
        this.setData({ stats: res.result.data });
      }
    } catch (err) {
      console.error('获取统计信息失败:', err);
    }
  },

  navigateTo(e) {
    const url = e.currentTarget.dataset.url;
    wx.navigateTo({ url });
  },

  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userInfo');
          app.globalData.userInfo = null;
          wx.reLaunch({ url: '/pages/auth/login/index' });
        }
      }
    });
  }
});
