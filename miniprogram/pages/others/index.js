// 简化测试版本 - 用于排查问题
console.log('🚨 简化测试版本加载');

Page({
  data: {
    greeting: '测试版本'
  },
  
  onLoad: function(options) {
    console.log('🚨 简化版onLoad被调用');
    console.log('🐛 方法检查:');
    console.log('- openSnowtamEncoder:', typeof this.openSnowtamEncoder);
    console.log('- testSnowtamNavigation:', typeof this.testSnowtamNavigation);
  },
  
  openSnowtamEncoder: function() {
    console.log('🌨️ 简化版openSnowtamEncoder被调用！');
    wx.showToast({
      title: '方法调用成功！',
      icon: 'success'
    });
    
    setTimeout(function() {
      wx.navigateTo({
        url: '/packageO/snowtam-encoder/index'
      });
    }, 1000);
  },
  
  testSnowtamNavigation: function() {
    console.log('🧪 简化版testSnowtamNavigation被调用！');
    wx.showToast({
      title: 'TEST成功！',
      icon: 'success'
    });
    
    wx.navigateTo({
      url: '/packageO/snowtam-encoder/index'
    });
  }
});

console.log('🚨 简化测试版本Page()调用完成');