// 离线功能管理器 - 统一管理离线状态检测和用户提示
class OfflineManager {
  constructor() {
    this.isOnline = true;
    this.networkType = 'unknown';
    this.initNetworkMonitoring();
  }

  // 初始化网络监控
  initNetworkMonitoring() {
    // 获取当前网络状态
    wx.getNetworkType({
      success: (res) => {
        this.networkType = res.networkType;
        this.isOnline = res.networkType !== 'none';
        console.log('🌐 当前网络状态:', res.networkType, this.isOnline ? '在线' : '离线');
      },
      fail: () => {
        this.isOnline = false;
        this.networkType = 'none';
      }
    });

    // 监听网络状态变化
    wx.onNetworkStatusChange((res) => {
      const wasOnline = this.isOnline;
      this.isOnline = res.isConnected;
      this.networkType = res.networkType;
      
      console.log('🌐 网络状态变化:', {
        from: wasOnline ? '在线' : '离线',
        to: this.isOnline ? '在线' : '离线',
        networkType: this.networkType
      });

      // 状态变化时的用户提示
      if (!wasOnline && this.isOnline) {
        // 从离线恢复到在线
        wx.showToast({
          title: '网络已恢复',
          icon: 'success',
          duration: 2000
        });
      } else if (wasOnline && !this.isOnline) {
        // 从在线变为离线
        this.showOfflineNotification();
      }
    });
  }

  // 显示离线通知
  showOfflineNotification() {
    wx.showToast({
      title: '🛩️ 已切换到离线模式',
      icon: 'none',
      duration: 3000
    });
  }

  // 检查当前网络状态
  getCurrentNetworkStatus() {
    return {
      isOnline: this.isOnline,
      networkType: this.networkType
    };
  }

  // 检查功能是否需要网络
  checkFeatureRequiresNetwork(feature) {
    const networkRequiredFeatures = [
      'ad-watch',        // 观看广告
      'data-sync',       // 数据同步
      'update-check',    // 更新检查
      'crash-report'     // 崩溃报告
    ];
    
    return networkRequiredFeatures.includes(feature);
  }

  // 统一的离线功能提示
  showOfflineFriendlyMessage(feature) {
    const messages = {
      'ad-watch': {
        title: '🛩️ 离线模式',
        content: '当前处于离线状态，无法观看广告获取积分。\n\n所有核心功能（计算、查询、通信程序）仍可正常使用。\n\n恢复网络后可继续观看广告。'
      },
      'data-sync': {
        title: '🛩️ 离线模式',
        content: '当前处于离线状态，数据同步功能暂不可用。\n\n所有数据会保存在本地，恢复网络后自动同步。'
      },
      'default': {
        title: '🛩️ 离线模式',
        content: '当前处于离线状态，该功能需要网络连接。\n\n核心飞行工具仍可正常使用。'
      }
    };

    const message = messages[feature] || messages['default'];
    
    wx.showModal({
      title: message.title,
      content: message.content,
      showCancel: false,
      confirmText: '我知道了'
    });
  }

  // 数据加载失败的兜底处理
  handleDataLoadFailure(dataType, error) {
    console.error(`❌ ${dataType}数据加载失败:`, error);
    
    const fallbackData = this.getFallbackData(dataType);
    
    if (fallbackData) {
      console.log(`✅ 使用${dataType}兜底数据`);
      return fallbackData;
    } else {
      console.log(`⚠️ ${dataType}无兜底数据，返回空数组`);
      return [];
    }
  }

  // 获取兜底数据
  getFallbackData(dataType) {
    const fallbackData = {
      'event-categories': [
        {
          id: 'transport-urgent',
          name: '运输紧急事件',
          description: '影响飞行安全的紧急事件',
          color: '#FF4444',
          eventTypes: [
            {
              id: 'engine-failure',
              name: '发动机故障',
              urgency: '紧急',
              description: '发动机出现故障或异常'
            },
            {
              id: 'hydraulic-failure',
              name: '液压系统故障',
              urgency: '紧急',
              description: '液压系统失效'
            },
            {
              id: 'electrical-failure',
              name: '电气系统故障',
              urgency: '重要',
              description: '电气系统异常'
            }
          ]
        },
        {
          id: 'navigation-comm',
          name: '导航通信事件',
          description: '导航和通信相关事件',
          color: '#FF8800',
          eventTypes: [
            {
              id: 'radio-failure',
              name: '无线电故障',
              urgency: '重要',
              description: '通信设备故障'
            },
            {
              id: 'navigation-error',
              name: '导航偏差',
              urgency: '一般',
              description: '航行偏离计划航路'
            }
          ]
        }
      ],
      'dangerous-goods': [
        {
          item_name: "示例危险品",
          un_number: "UN0000",
          class: "示例类别",
          packing_group: "示例包装组",
          description: "离线模式 - 部分危险品数据",
          emergency_procedures: "请参考完整版危险品手册"
        }
      ]
    };

    return fallbackData[dataType] || null;
  }

  // 检查分包是否已加载
  checkSubpackageLoaded(packageName) {
    try {
      // 尝试加载分包中的模块来检查是否已加载
      const testModule = require(`../${packageName}/test.js`);
      return true;
    } catch (error) {
      return false;
    }
  }

  // 预加载关键分包
  async preloadCriticalSubpackages() {
    const criticalPackages = ['packageA', 'packageB', 'packageC', 'packageD', 'packageO'];
    const loadPromises = [];

    for (const packageName of criticalPackages) {
      if (!this.checkSubpackageLoaded(packageName)) {
        const loadPromise = new Promise((resolve, reject) => {
          wx.loadSubpackage({
            name: packageName,
            success: () => {
              console.log(`✅ 关键分包 ${packageName} 预加载成功`);
              resolve(packageName);
            },
            fail: (error) => {
              console.error(`❌ 关键分包 ${packageName} 预加载失败:`, error);
              reject(error);
            }
          });
        });
        loadPromises.push(loadPromise);
      }
    }

    try {
      const results = await Promise.allSettled(loadPromises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const total = loadPromises.length;
      
      console.log(`📦 关键分包预加载完成: ${successful}/${total}`);
      
      if (successful < total) {
        console.log('⚠️ 部分分包加载失败，使用兜底数据');
      }
      
      return { successful, total };
    } catch (error) {
      console.error('❌ 分包预加载过程中发生错误:', error);
      return { successful: 0, total: criticalPackages.length };
    }
  }
}

// 创建全局实例
const offlineManager = new OfflineManager();

module.exports = offlineManager;