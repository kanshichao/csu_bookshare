// app.js
App({
  onLaunch() {
    wx.cloud.init({
      env: 'your-env-id',
      traceUser: true
    });
    
    // 检查登录状态
    this.checkLogin();
  },
  
  globalData: {
    userInfo: null,
    isLoggedIn: false
  },
  
  checkLogin() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.globalData.userInfo = userInfo;
      this.globalData.isLoggedIn = true;
    }
  },
  
  checkAuth() {
    if (!this.globalData.isLoggedIn) {
      wx.redirectTo({
        url: '/pages/auth/login/index'
      });
      return false;
    }
    return true;
  }
});
