/**
 * 简化主题管理器 - 仅支持浅色模式
 * 移除所有深色模式相关代码，保留基本接口兼容性
 */

class ThemeManager {
  constructor() {
    this.currentTheme = 'light';
    this.init();
  }

  // 初始化主题管理器
  init() {
    try {
      this.currentTheme = 'light';
      console.log('💡 主题管理器初始化完成（浅色模式）');
    } catch (error) {
      console.error('❌ 主题管理器初始化失败:', error);
      this.currentTheme = 'light';
    }
  }

  // 获取当前主题信息
  getThemeInfo() {
    return {
      themeMode: 'light',
      themeClass: 'light'
    };
  }

  // 应用主题到页面（简化版）
  applyThemeToPage(page) {
    if (!page || !page.setData) {
      console.warn('⚠️ 无效的页面对象');
      return;
    }

    // 设置浅色模式
    page.setData({
      themeMode: 'light',
      themeClass: 'light'
    });
  }

  // 页面初始化方法
  initPageTheme(page) {
    this.applyThemeToPage(page);
    return () => {
      // 无需清理
    };
  }
}

// 创建全局实例
const themeManager = new ThemeManager();

// 导出接口
module.exports = {
  getInstance: () => themeManager,
  getThemeInfo: () => themeManager.getThemeInfo(),
  applyThemeToPage: (page) => themeManager.applyThemeToPage(page),
  initPageTheme: (page) => themeManager.initPageTheme(page),
  
  // 兼容性方法 - 返回固定浅色模式
  switchThemeMode: () => ({
    mode: 'light',
    name: '浅色模式',
    emoji: '☀️'
  }),
  
  // 兼容性方法 - 空实现
  setTheme: () => {},
  addListener: () => {},
  removeListener: () => {}
};