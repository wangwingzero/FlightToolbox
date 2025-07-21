// 通信失效页面逻辑
Page({
  data: {
  },

  onLoad() {
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: '通信失效处理程序'
    });
    
    // 页面初始化完成
  },

  onShow() {
    // 页面显示时的操作
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
    } else if (type === 'pacific') {
      // 跳转到太平洋地区通信差异页面
      wx.navigateTo({
        url: '/pages/communication-failure/regions/pacific/index'
      });
    } else if (type === 'eastern_europe') {
      // 跳转到东欧地区通信差异页面
      wx.navigateTo({
        url: '/pages/communication-failure/regions/eastern-europe/index'
      });
    } else if (type === 'europe') {
      // 跳转到欧洲地区通信差异页面
      wx.navigateTo({
        url: '/pages/communication-failure/regions/europe/index'
      });
    } else if (type === 'middle_east') {
      // 跳转到中东地区通信差异页面
      wx.navigateTo({
        url: '/pages/communication-failure/regions/middle-east/index'
      });
    } else if (type === 'north_america') {
      // 跳转到北美地区通信差异页面
      wx.navigateTo({
        url: '/pages/communication-failure/regions/north-america/index'
      });
    } else if (type === 'south_america') {
      // 跳转到南美地区通信差异页面
      wx.navigateTo({
        url: '/pages/communication-failure/regions/south-america/index'
      });
    } else if (type === 'africa') {
      // 跳转到非洲地区通信差异页面
      wx.navigateTo({
        url: '/pages/communication-failure/regions/africa/index'
      });
    }
  }
});