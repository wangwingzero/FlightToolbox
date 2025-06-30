/**
 * 全局主题管理器 - 基于Context7最佳实践
 * 解决微信小程序深色模式在不同页面间的同步问题
 */

class ThemeManager {
  constructor() {
    this.currentTheme = 'auto'; // auto, light, dark
    this.isDarkMode = false;
    this.listeners = new Set();
    this.init();
  }

  // 初始化主题管理器
  init() {
    try {
      // 从本地存储获取用户的主题偏好，新用户默认为'auto'
      const savedTheme = wx.getStorageSync('user_theme_mode');
      
      if (!savedTheme) {
        // 🎯 新用户：默认设置为跟随系统主题
        this.currentTheme = 'auto';
        wx.setStorageSync('user_theme_mode', 'auto');
        console.log('🌙 新用户默认设置为跟随系统主题');
      } else {
        this.currentTheme = savedTheme;
      }
      
      // 检测系统当前的深色模式状态
      this.updateDarkModeStatus();
      
      console.log('🌙 全局主题管理器初始化:', {
        savedTheme: this.currentTheme,
        isDarkMode: this.isDarkMode,
        isNewUser: !savedTheme
      });
      
    } catch (error) {
      console.error('❌ 主题管理器初始化失败:', error);
      this.currentTheme = 'auto';
      this.isDarkMode = false;
    }
  }

  // 更新深色模式状态
  updateDarkModeStatus() {
    let isSystemDark = false;
    
    try {
      // 使用兼容性工具获取系统设置
      const systemInfoHelper = require('./system-info-helper.js');
      const systemSetting = systemInfoHelper.getSystemSetting();
      isSystemDark = systemSetting.theme === 'dark';
    } catch (error) {
      console.warn('⚠️ 无法获取系统主题信息:', error);
    }
    
    // 计算最终的深色模式状态
    this.isDarkMode = this.currentTheme === 'dark' || 
                     (this.currentTheme === 'auto' && isSystemDark);
    
    console.log('🎨 主题状态更新:', {
      currentTheme: this.currentTheme,
      isSystemDark,
      isDarkMode: this.isDarkMode
    });
  }

  // 设置主题模式
  setTheme(themeMode) {
    if (!['auto', 'light', 'dark'].includes(themeMode)) {
      console.warn('⚠️ 无效的主题模式:', themeMode);
      return;
    }

    this.currentTheme = themeMode;
    this.updateDarkModeStatus();
    
    // 保存到本地存储
    wx.setStorageSync('user_theme_mode', themeMode);
    wx.setStorageSync('current_theme', this.isDarkMode ? 'dark' : 'light');
    
    // 🎯 触发小程序主题切换 - 使用正确的API
    try {
      // 使用 wx.setTabBarStyle 设置 TabBar 样式
      const targetTheme = this.isDarkMode ? 'dark' : 'light';
      
             // 方法1：尝试使用 wx.setTabBarStyle（如果支持）
       if (wx.setTabBarStyle) {
         wx.setTabBarStyle({
           color: this.isDarkMode ? '#94a3b8' : '#666666',
           selectedColor: this.isDarkMode ? '#60a5fa' : '#1989fa',
           backgroundColor: this.isDarkMode ? '#1e293b' : '#ffffff',
           borderStyle: this.isDarkMode ? 'white' : 'black'
         });
         console.log('🎨 TabBar样式已更新:', targetTheme);
       }
       
       // 方法1.5：尝试单独设置每个TabBar图标（针对深色模式优化）
       if (this.isDarkMode && wx.setTabBarItem) {
         // 为深色模式优化飞行速算图标
         wx.setTabBarItem({
           index: 2, // 飞行速算是第3个（索引2）
           iconPath: 'images/tab-flight-calc.png',
           selectedIconPath: 'images/tab-flight-calc-active.png'
         });
         console.log('🎨 飞行速算图标已针对深色模式优化');
       }
      
      // 方法2：尝试触发系统主题切换
      if (typeof wx.setTheme === 'function') {
        wx.setTheme({
          theme: targetTheme
        });
        console.log('🎨 系统主题已切换:', targetTheme);
      }
      
    } catch (error) {
      console.warn('⚠️ TabBar主题切换失败:', error);
      console.log('💡 TabBar可能需要系统级深色模式才能生效');
    }
    
    // 通知所有监听器
    this.notifyListeners();
    
    console.log('🌙 主题模式已切换:', themeMode, '深色模式:', this.isDarkMode);
  }

  // 获取当前主题信息
  getThemeInfo() {
    return {
      themeMode: this.currentTheme,
      isDarkMode: this.isDarkMode,
      themeClass: this.isDarkMode ? 'dark' : 'light'
    };
  }

  // 添加主题变化监听器
  addListener(callback) {
    if (typeof callback === 'function') {
      this.listeners.add(callback);
      
      // 立即调用一次，让页面获取当前主题状态
      callback(this.getThemeInfo());
    }
  }

  // 移除监听器
  removeListener(callback) {
    this.listeners.delete(callback);
  }

  // 通知所有监听器
  notifyListeners() {
    const themeInfo = this.getThemeInfo();
    this.listeners.forEach(callback => {
      try {
        callback(themeInfo);
      } catch (error) {
        console.error('❌ 主题监听器回调失败:', error);
      }
    });
  }

  // 应用主题到页面
  applyThemeToPage(page) {
    if (!page || !page.setData) {
      console.warn('⚠️ 无效的页面对象');
      return;
    }

    const themeInfo = this.getThemeInfo();
    
    // 更新页面数据
    page.setData({
      isDarkMode: themeInfo.isDarkMode,
      themeMode: themeInfo.themeMode,
      themeClass: themeInfo.themeClass
    });

    // 设置导航栏颜色
    wx.nextTick(() => {
      try {
        if (themeInfo.isDarkMode) {
          // 深色模式导航栏 - 使用深蓝色背景
          wx.setNavigationBarColor({
            frontColor: '#ffffff',
            backgroundColor: '#1e293b',
            animation: {
              duration: 300,
              timingFunc: 'easeInOut'
            }
          });
        } else {
          // 浅色模式导航栏
          wx.setNavigationBarColor({
            frontColor: '#000000',
            backgroundColor: '#ffffff',
            animation: {
              duration: 300,
              timingFunc: 'easeInOut'
            }
          });
        }
        
        console.log('🎨 导航栏颜色已设置:', themeInfo.isDarkMode ? '深色模式' : '浅色模式');
      } catch (error) {
        console.warn('⚠️ 导航栏颜色设置失败:', error);
      }
    });
  }

  // 为页面提供的便捷初始化方法
  initPageTheme(page) {
    // 立即应用当前主题
    this.applyThemeToPage(page);
    
    // 添加监听器，当主题变化时自动更新页面
    const listener = (themeInfo) => {
      if (page && page.setData) {
        // 更新页面数据
        page.setData({
          isDarkMode: themeInfo.isDarkMode,
          themeMode: themeInfo.themeMode,
          themeClass: themeInfo.themeClass
        });
        
        // 同时设置导航栏颜色
        wx.nextTick(() => {
          try {
            if (themeInfo.isDarkMode) {
              // 深色模式导航栏 - 使用深蓝色背景
              wx.setNavigationBarColor({
                frontColor: '#ffffff',
                backgroundColor: '#1e293b',
                animation: {
                  duration: 300,
                  timingFunc: 'easeInOut'
                }
              });
            } else {
              // 浅色模式导航栏
              wx.setNavigationBarColor({
                frontColor: '#000000',
                backgroundColor: '#ffffff',
                animation: {
                  duration: 300,
                  timingFunc: 'easeInOut'
                }
              });
            }
            
            console.log('🎨 监听器导航栏颜色已设置:', themeInfo.isDarkMode ? '深色模式' : '浅色模式');
          } catch (error) {
            console.warn('⚠️ 监听器导航栏颜色设置失败:', error);
          }
        });
      }
    };
    
    this.addListener(listener);
    
    // 返回清理函数
    return () => {
      this.removeListener(listener);
    };
  }
}

// 创建全局实例
const themeManager = new ThemeManager();

// 导出接口
module.exports = {
  // 获取主题管理器实例
  getInstance: () => themeManager,
  
  // 便捷方法
  setTheme: (themeMode) => themeManager.setTheme(themeMode),
  getThemeInfo: () => themeManager.getThemeInfo(),
  addListener: (callback) => themeManager.addListener(callback),
  removeListener: (callback) => themeManager.removeListener(callback),
  applyThemeToPage: (page) => themeManager.applyThemeToPage(page),
  initPageTheme: (page) => themeManager.initPageTheme(page),
  
  // 兼容性方法 - 供"我的首页"调用
  switchThemeMode: (targetMode) => {
    if (targetMode) {
      themeManager.setTheme(targetMode);
    } else {
      // 循环切换逻辑
      const modes = ['auto', 'light', 'dark'];
      const currentIndex = modes.indexOf(themeManager.currentTheme);
      const nextIndex = (currentIndex + 1) % modes.length;
      themeManager.setTheme(modes[nextIndex]);
    }
    
    // 返回主题信息用于显示Toast
    const themeInfo = themeManager.getThemeInfo();
    const modeNames = {
      'auto': '跟随系统',
      'light': '强制白天', 
      'dark': '强制夜航'
    };
    const modeEmojis = {
      'auto': '⚙️',
      'light': '☀️',
      'dark': '🌙'
    };
    
    return {
      mode: themeInfo.themeMode,
      name: modeNames[themeInfo.themeMode],
      emoji: modeEmojis[themeInfo.themeMode],
      isDarkMode: themeInfo.isDarkMode
    };
  }
}; 