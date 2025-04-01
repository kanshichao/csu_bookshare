// pages/books/add/index.js
const app = getApp();

Page({
  data: {
    form: {
      isbn: '',
      title: '',
      author: '',
      publisher: '',
      mainCategory: '',
      subCategory: '',
      specialZone: '',
      description: ''
    },
    categories: [
      { name: '文学类', value: '文学类', subs: ['经典文学', '当代小说', '诗歌散文', '戏剧剧本'] },
      { name: '科普类', value: '科普类', subs: ['天文地理', '生物医学', '人工智能', '社会科学'] },
      { name: '历史类', value: '历史类', subs: ['中国通史', '世界文明史', '人物传记', '考古发现'] },
      { name: '生活类', value: '生活类', subs: ['摄影艺术', '美食烹饪', '旅行指南', '心理健康'] },
      { name: '青年读物', value: '青年读物', subs: ['成长励志', '教育心理', '职场技能', '校园文学'] }
    ],
    zones: ['中南专区', '诺贝尔奖著作', '湖湘文化特藏', '校园推荐'],
    subCategories: [],
    coverUrl: '',
    loading: false
  },

  onLoad() {
    // 如果有ISBN参数，自动填充
    const options = getCurrentPages()[getCurrentPages().length - 1].options;
    if (options.isbn) {
      this.setData({ 'form.isbn': options.isbn });
      this.handleScanIsbn();
    }
  },

  handleInputChange(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({ [`form.${field}`]: e.detail.value });
  },

  onMainCategoryChange(e) {
    const index = e.detail.value;
    const selectedCategory = this.data.categories[index];
    
    this.setData({
      'form.mainCategory': selectedCategory.value,
      subCategories: selectedCategory.subs,
      'form.subCategory': '',
      'form.specialZone': ''
    });
  },

  onSubCategoryChange(e) {
    this.setData({ 'form.subCategory': this.data.subCategories[e.detail.value] });
  },

  onZoneChange(e) {
    this.setData({ 
      'form.specialZone': this.data.zones[e.detail.value],
      'form.mainCategory': '',
      'form.subCategory': ''
    });
  },

  async handleChooseCover() {
    try {
      const res = await wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['album', 'camera']
      });
      
      if (res.tempFiles && res.tempFiles[0]) {
        wx.showLoading({ title: '上传中...' });
        const uploadRes = await wx.cloud.uploadFile({
          cloudPath: `book-covers/${Date.now()}-${Math.floor(Math.random() * 1000)}.jpg`,
          filePath: res.tempFiles[0].tempFilePath
        });
        
        this.setData({ coverUrl: uploadRes.fileID });
        wx.hideLoading();
      }
    } catch (err) {
      console.error('选择封面失败:', err);
      wx.hideLoading();
      wx.showToast({ title: '选择封面失败', icon: 'none' });
    }
  },

  async handleScanIsbn() {
    try {
      const res = await wx.scanCode({
        onlyFromCamera: false,
        scanType: ['barCode', 'qrCode']
      });
      
      if (res.result) {
        this.setData({ 'form.isbn': res.result });
        this.fetchBookInfo(res.result);
      }
    } catch (err) {
      console.error('扫码失败:', err);
      if (err.errMsg !== 'scanCode:fail cancel') {
        wx.showToast({ title: '扫码失败', icon: 'none' });
      }
    }
  },

  async fetchBookInfo(isbn) {
    wx.showLoading({ title: '查询中...' });
    try {
      const res = await wx.cloud.callFunction({
        name: 'books',
        data: {
          action: 'fetch_by_isbn',
          isbn: isbn
        }
      });
      
      if (res.result.code === 200 && res.result.data) {
        const bookInfo = res.result.data;
        this.setData({
          'form.title': bookInfo.title || '',
          'form.author': bookInfo.author || '',
          'form.publisher': bookInfo.publisher || ''
        });
      } else {
        wx.showToast({ title: '未找到图书信息', icon: 'none' });
      }
    } catch (err) {
      console.error('获取图书信息失败:', err);
      wx.showToast({ title: '获取图书信息失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  async handleSubmit() {
    const { form, coverUrl } = this.data;
    const { isbn, title, author } = form;
    
    if (!isbn || !title || !author) {
      wx.showToast({ title: '请填写ISBN、书名和作者', icon: 'none' });
      return;
    }
    
    this.setData({ loading: true });
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'books',
        data: {
          action: 'add',
          book: {
            ...form,
            cover: coverUrl,
            dormitory: app.globalData.userInfo.dormitory,
            owner_id: app.globalData.userInfo._id,
            status: 'available'
          }
        }
      });
      
      if (res.result.code === 200) {
        wx.showToast({ title: '添加成功' });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        wx.showToast({ title: res.result.message, icon: 'none' });
      }
    } catch (err) {
      console.error('添加图书失败:', err);
      wx.showToast({ title: '添加图书失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  }
});
