// pages/books/detail/index.js
const app = getApp();

Page({
  data: {
    book: null,
    loading: true,
    isOwner: false,
    canBorrow: false,
    canReturn: false
  },

  onLoad(options) {
    this.loadBookDetail(options.id);
  },

  async loadBookDetail(bookId) {
    this.setData({ loading: true });
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'books',
        data: {
          action: 'detail',
          bookId: bookId
        }
      });
      
      const book = res.result.data;
      const isOwner = book.owner_id === app.globalData.userInfo._id;
      const canBorrow = !isOwner && book.status === 'available';
      const canReturn = book.status === 'borrowed' && 
                       book.current_borrower === app.globalData.userInfo._id;
      
      this.setData({
        book: book,
        isOwner: isOwner,
        canBorrow: canBorrow,
        canReturn: canReturn,
        loading: false
      });
    } catch (err) {
      console.error('获取图书详情失败:', err);
      wx.showToast({ title: '获取图书详情失败', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  async handleBorrow() {
    wx.showLoading({ title: '处理中...' });
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'borrow',
        data: {
          action: 'borrow',
          bookId: this.data.book._id,
          borrowerId: app.globalData.userInfo._id
        }
      });
      
      if (res.result.code === 200) {
        wx.showToast({ title: '借阅成功' });
        this.loadBookDetail(this.data.book._id);
      } else {
        wx.showToast({ title: res.result.message, icon: 'none' });
      }
    } catch (err) {
      console.error('借阅失败:', err);
      wx.showToast({ title: '借阅失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  async handleReturn() {
    wx.showLoading({ title: '处理中...' });
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'borrow',
        data: {
          action: 'return',
          bookId: this.data.book._id
        }
      });
      
      if (res.result.code === 200) {
        wx.showToast({ title: '归还成功' });
        this.loadBookDetail(this.data.book._id);
      } else {
        wx.showToast({ title: res.result.message, icon: 'none' });
      }
    } catch (err) {
      console.error('归还失败:', err);
      wx.showToast({ title: '归还失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  navigateToAdd() {
    wx.navigateTo({
      url: '/pages/books/add'
    });
  }
});
