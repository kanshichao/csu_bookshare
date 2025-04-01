// pages/auth/reset-password/index.js
Page({
  data: {
    studentId: '',
    verifyCode: '',
    newPassword: '',
    countdown: 0,
    loading: false
  },

  handleInputChange(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({ [field]: e.detail.value });
  },

  async sendVerifyCode() {
    const { studentId } = this.data;
    if (!studentId) {
      wx.showToast({ title: '请输入学号', icon: 'none' });
      return;
    }

    this.setData({ countdown: 60 });
    const timer = setInterval(() => {
      if (this.data.countdown <= 0) {
        clearInterval(timer);
        return;
      }
      this.setData({ countdown: this.data.countdown - 1 });
    }, 1000);

    try {
      wx.showLoading({ title: '发送中...' });
      const res = await wx.cloud.callFunction({
        name: 'auth',
        data: {
          action: 'send_verify_code',
          studentId: studentId
        }
      });
      wx.hideLoading();
      if (res.result.code === 200) {
        wx.showToast({ title: '验证码已发送' });
      } else {
        wx.showToast({ title: res.result.message, icon: 'none' });
      }
    } catch (err) {
      console.error('发送验证码失败:', err);
      wx.hideLoading();
      wx.showToast({ title: '发送验证码失败', icon: 'none' });
    }
  },

  async handleReset() {
    const { studentId, verifyCode, newPassword } = this.data;
    
    if (!studentId || !verifyCode || !newPassword) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }
    
    if (newPassword.length < 6) {
      wx.showToast({ title: '密码至少6位', icon: 'none' });
      return;
    }
    
    this.setData({ loading: true });
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'auth',
        data: {
          action: 'reset_password',
          studentId: studentId,
          verifyCode: verifyCode,
          newPassword: newPassword
        }
      });
      
      if (res.result.code === 200) {
        wx.showToast({ title: '密码重置成功' });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        wx.showToast({ title: res.result.message, icon: 'none' });
      }
    } catch (err) {
      console.error('重置密码失败:', err);
      wx.showToast({ title: '重置密码失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  }
});
