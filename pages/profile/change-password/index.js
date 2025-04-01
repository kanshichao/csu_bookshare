// pages/profile/change-password/index.js
Page({
  data: {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    loading: false
  },

  handleInputChange(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({ [field]: e.detail.value });
  },

  async handleSubmit() {
    const { oldPassword, newPassword, confirmPassword } = this.data;
    
    if (!oldPassword || !newPassword || !confirmPassword) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      wx.showToast({ title: '两次密码不一致', icon: 'none' });
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
          action: 'change_password',
          oldPassword: oldPassword,
          newPassword: newPassword
        }
      });
      
      if (res.result.code === 200) {
        wx.showToast({ title: '密码修改成功' });
        wx.navigateBack();
      } else {
        wx.showToast({ title: res.result.message, icon: 'none' });
      }
    } catch (err) {
      console.error('修改密码失败:', err);
      wx.showToast({ title: '修改密码失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  }
});
