// pages/borrow/history/index.js
const app = getApp();

Page({
  data: {
    historyList: [],
    loading: true,
    hasMore: true,
    page: 1,
    pageSize: 10
  },

  onLoad() {
    this.loadHistory();
  },

  async loadHistory() {
    if (!this.data.hasMore) return;
    
    this.setData({ loading: true });
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'borrow',
        data: {
          action: 'history',
          userId: app.globalData.userInfo._id,
          page: this.data.page,
          pageSize: this.data.pageSize
        }
      });
      
      const newList = this.data.page === 1 ? 
        res.result.data : [...this.data.historyList, ...res.result.data];
      
      this.setData({
        historyList: newList,
        loading: false,
        hasMore: res.result.data.length >= this.data.pageSize
      });
    } catch (err) {
      console.error('获取借阅历史失败:', err);
      wx.showToast({ title: '获取借阅历史失败', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  onReachBottom() {
    if (!this.data.loading && this.data.hasMore) {
      this.setData({ page: this.data.page + 1 }, () => {
        this.loadHistory();
      });
    }
  },

  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true }, () => {
      this.loadHistory().finally(() => {
        wx.stopPullDownRefresh();
      });
    });
  },

  navigateToDetail(e) {
    const bookId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/books/detail?id=${bookId}`
    });
  }
});
