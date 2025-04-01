// pages/books/list/index.js
const app = getApp();

Page({
  data: {
    books: [],
    loading: true,
    refreshing: false,
    categories: [
      { name: '全部', value: '' },
      { name: '文学类', value: '文学类' },
      { name: '科普类', value: '科普类' },
      { name: '历史类', value: '历史类' },
      { name: '生活类', value: '生活类' }
    ],
    activeCategory: '',
    searchValue: ''
  },

  onLoad() {
    this.loadBooks();
  },

  async loadBooks() {
    const { activeCategory, searchValue } = this.data;
    
    this.setData({ loading: true });
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'books',
        data: {
          action: 'list',
          dormitory: app.globalData.userInfo.dormitory,
          category: activeCategory,
          search: searchValue
        }
      });
      
      this.setData({
        books: res.result.data,
        loading: false,
        refreshing: false
      });
    } catch (err) {
      console.error('获取图书失败:', err);
      wx.showToast({ title: '获取图书失败', icon: 'none' });
      this.setData({ loading: false, refreshing: false });
    }
  },

  onCategoryChange(e) {
    const category = e.currentTarget.dataset.value;
    this.setData({ activeCategory: category }, () => {
      this.loadBooks();
    });
  },

  onSearch(e) {
    this.setData({ searchValue: e.detail.value }, () => {
      this.loadBooks();
    });
  },

  onRefresh() {
    this.setData({ refreshing: true });
    this.loadBooks();
  },

  navigateToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/books/detail?id=${id}`
    });
  }
});
