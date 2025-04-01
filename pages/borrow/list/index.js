// pages/borrow/list/index.js
const app = getApp();

Page({
  data: {
    borrows: [],
    loading: true,
    tabs: [
      { name: '当前借阅', value: 'current' },
      { name: '历史记录', value: 'history' }
    ],
    activeTab: 'current'
  },

  onLoad() {
    this.loadBorrows();
  },

  onTabChange(e) {
    const tab = e.currentTarget.dataset.value;
    this.setData({ activeTab: tab }, () => {
      this.loadBorrows();
    });
  },

  async loadBorrows() {
    this.setData({ loading: true });
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'borrow',
        data: {
          action: this.data.activeTab === 'current' ? 'current' : 'history',
          userId: app.globalData.userInfo._id
        }
      });
      
      this.setData({
        borrows: res.result.data,
        loading: false
      });
    } catch (err) {
      console.error('获取借阅记录失败:', err);
      wx.showToast({ title: '获取借阅记录失败', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  navigateToDetail(e) {
    const bookId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/books/detail?id=${bookId}`
    });
  }
});
