// 通信失效页面逻辑
Page({
  data: {
    isDarkMode: false
  },

  onLoad() {
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: '通信失效处理程序'
    });
    
    // 检查主题状态
    this.checkThemeStatus();
  },

  onShow() {
    // 每次显示页面时检查主题状态
    this.checkThemeStatus();
  },

  // 检查主题状态
  checkThemeStatus() {
    const isDarkMode = wx.getStorageSync('isDarkMode') || false;
    this.setData({ isDarkMode });
  },

  // 选择程序类型
  selectProcedure(e: any) {
    const type = e.currentTarget.dataset.type;
    
    if (type === 'domestic') {
      // 跳转到国内通信失效程序页面
      wx.navigateTo({
        url: '/pages/communication-failure/domestic/index'
      });
    } else if (type === 'international') {
      // 跳转到国际通信失效程序页面
      wx.navigateTo({
        url: '/pages/communication-failure/international/index'
      });
    }
  }
});