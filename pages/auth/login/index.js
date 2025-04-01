// pages/auth/login/index.js
Page({
  data: {
    studentId: '',
    password: '',
    loading: false
  },

  handleInputChange(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({ [field]: e.detail.value });
  },

  async handleLogin() {
    const { studentId, password } = this.data;
    
    if (!studentId || !password) {
      wx.showToast({ title: '请输入学号和密码', icon: 'none' });
      return;
    }
    
    this.setData({ loading: true });
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'auth',
        data: {
          action: 'login',
          studentId: studentId,
          password: password
        }
      });
      
      if (res.result.code === 200) {
        wx.setStorageSync('userInfo', res.result.data);
        getApp().globalData.userInfo = res.result.data;
        wx.showToast({ title: '登录成功' });
        wx.switchTab({ url: '/pages/books/list' });
      } else {
        wx.showToast({ title: res.result.message, icon: 'none' });
      }
    } catch (err) {
      console.error('登录失败:', err);
      wx.showToast({ title: '登录失败，请重试', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  navigateToReset() {
    wx.navigateTo({ url: '/pages/auth/reset-password' });
  }
});
