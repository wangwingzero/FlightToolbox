/**
 * 广告管理器 - 离线友好的本地广告管理（增强版）
 * 基于Context7最佳实践，专为离线用户设计
 * 修复：激励视频广告改为页面级别管理
 */
class AdManager {
  constructor() {
    // 🎯 修复：移除全局激励视频广告初始化
    // 激励视频广告必须在页面级别创建和管理
    
    // 🎯 基于Context7最佳实践：7个广告位平均分配
    this.adUnits = [
      // 横幅卡片类（收入最高）- 用于重要页面
      { id: 'adunit-d6c8a55bd3cb4fd1', type: 'custom', context: 'search-results', priority: 'high', format: 'card-banner' },
      { id: 'adunit-d7a3b71f5ce0afca', type: 'custom', context: 'detail-page', priority: 'high', format: 'card-overlay-a' },
      { id: 'adunit-3a1bf3800fa937a2', type: 'custom', context: 'list-page', priority: 'high', format: 'card-overlay-b' },
      
      // 横幅类（中等收入）- 用于一般页面
      { id: 'adunit-4e68875624a88762', type: 'custom', context: 'tool', priority: 'medium', format: 'banner-single' },
      { id: 'adunit-3b2e78fbdab16389', type: 'custom', context: 'secondary-page', priority: 'medium', format: 'banner-left-text' },
      { id: 'adunit-2f5afef0d27dc863', type: 'custom', context: 'tertiary-page', priority: 'medium', format: 'banner-left-image' },
      
      // 格子类（体积小）- 用于补充位置
      { id: 'adunit-735d7d24032d4ca8', type: 'custom', context: 'grid', priority: 'low', format: 'grid-multi' }
    ];
    
    // 🎯 激励视频广告位配置（用于页面级别创建）
    this.rewardedAdUnits = [
      { id: 'adunit-316c5630d7a1f9ef', name: '获得积分', status: 'enabled', priority: 1 }
    ];
    
    // 广告显示历史记录
    this.adHistory = this.getAdHistory();

    console.log('AdManager初始化完成，共配置', this.adUnits.length, '个自定义广告位和', this.rewardedAdUnits.length, '个激励视频广告位');
    
    // 🎯 设置为全局单例
    AdManager.instance = this;
  }

  /**
   * 🎯 新增：为指定页面创建激励视频广告实例
   * 解决 "you can only invoke show() on the page where rewardedVideoAd is created" 问题
   * @param {Object} pageInstance - 页面实例
   * @returns {Object} 激励视频广告管理对象
   */
  createPageRewardedAd(pageInstance) {
    try {
      // 🔧 新增：检查是否已经为该页面创建过激励视频广告实例
      if (pageInstance.data && pageInstance.data.pageRewardedAdManager) {
        console.log('🔧 该页面已存在激励视频广告实例，跳过重复创建');
        return pageInstance.data.pageRewardedAdManager;
      }

      // 检查API支持
      if (!wx.createRewardedVideoAd) {
        console.log('❌ 当前环境不支持激励视频广告API');
        return null;
      }

      // 选择第一个可用的广告位
      const currentAdUnit = this.rewardedAdUnits.find(function(unit) { return unit.status === 'enabled'; });
      if (!currentAdUnit) {
        console.log('❌ 没有可用的激励视频广告位');
        return null;
      }

      console.log('🎬 为页面创建激励视频广告，广告位:', currentAdUnit);

      // 创建激励视频广告实例
      const rewardedVideoAd = wx.createRewardedVideoAd({
        adUnitId: currentAdUnit.id
      });

      // 创建管理对象
      const adManager = {
        rewardedVideoAd: rewardedVideoAd,
        currentAdUnit: currentAdUnit,
        pageInstance: pageInstance,
        isLoaded: false, // 🎯 添加加载状态标记
        
        // 预加载广告
        preload: function() {
          var self = this;
          console.log('🔄 开始预加载激励视频广告...');
          
          return this.rewardedVideoAd.load()
            .then(function() {
              console.log('✅ 激励视频广告预加载成功');
              self.isLoaded = true;
              return true;
            })
            .catch(function(err) {
              console.error('❌ 激励视频广告预加载失败:', err);
              self.isLoaded = false;
              
              // 🎯 预加载失败时，延迟重试
              setTimeout(function() {
                console.log('🔄 预加载失败，3秒后自动重试...');
                self.preload();
              }, 3000);
              
              return false;
            });
        },
        
        // 显示广告
        show: function(options) {
          var self = this;
          options = options || {};
          
          return new Promise(function(resolve, reject) {
            console.log('🎬 开始显示激励视频广告...', options);
            
            // 🎯 检查广告是否需要重新加载
            function attemptShow(retryCount) {
              retryCount = retryCount || 0;
              
              self.rewardedVideoAd.show()
                .then(function() {
                  console.log('✅ 激励视频广告显示成功');
                  resolve({
                    success: true,
                    adUnit: self.currentAdUnit.name
                  });
                })
                .catch(function(error) {
                  console.error('❌ 显示激励视频广告失败:', error);
                  
                  // 🎯 如果是广告数据未加载完成，且还有重试次数
                  if (error.errMsg && error.errMsg.includes('no advertisement data available') && retryCount < 2) {
                    console.log('🔄 广告数据未就绪，尝试重新加载...');
                    
                    // 重新加载广告
                    self.rewardedVideoAd.load()
                      .then(function() {
                        console.log('✅ 广告重新加载成功，准备重试显示...');
                        // 等待一小段时间确保广告完全加载
                        setTimeout(function() {
                          attemptShow(retryCount + 1);
                        }, 500);
                      })
                      .catch(function(loadError) {
                        console.error('❌ 广告重新加载失败:', loadError);
                        resolve({
                          success: false,
                          reason: self.getErrorMessage(error.errCode || error.code),
                          error: error
                        });
                      });
                  } else {
                    // 其他错误或重试次数用完
                    resolve({
                      success: false,
                      reason: self.getErrorMessage(error.errCode || error.code),
                      error: error
                    });
                  }
                });
            }
            
            // 开始尝试显示
            attemptShow(0);
          });
        },
        
        // 获取错误信息
        getErrorMessage: function(errCode) {
          const errorMap = {
            1000: '后端接口调用失败',
            1001: '参数错误',
            1002: '广告单元无效',
            1003: '内部错误',
            1004: '无合适的广告',
            1005: '广告组件审核中',
            1006: '广告组件被驳回',
            1007: '广告组件被封禁',
            1008: '广告单元已关闭',
            2001: '广告未加载完成',
            2002: '广告正在加载中',
            2003: '广告加载失败',
            2004: '广告已过期'
          };
          
          return errorMap[errCode] || ('广告错误 (' + errCode + ')');
        },
        
        // 设置事件监听器
        setupListeners: function() {
          var self = this;
          
          // 🔧 修复：在绑定新事件前先解绑之前的事件监听器，避免重复绑定
          if (this.rewardedVideoAd) {
            try {
              this.rewardedVideoAd.offLoad();
              this.rewardedVideoAd.offError();
              this.rewardedVideoAd.offClose();
              console.log('🔧 已清除之前的事件监听器');
            } catch (error) {
              console.log('🔧 清除事件监听器时出错（可能是首次绑定）:', error);
            }
          }
          
          // 广告加载成功
          this.rewardedVideoAd.onLoad(function() {
            console.log('✅ 激励视频广告加载成功');
            self.isLoaded = true; // 🎯 更新加载状态
          });

          // 广告加载失败
          this.rewardedVideoAd.onError(function(err) {
            console.error('❌ 激励视频广告加载失败:', err);
            self.isLoaded = false; // 🎯 更新加载状态
          });

          // 广告关闭
          this.rewardedVideoAd.onClose(function(res) {
            console.log('🎬 激励视频广告关闭:', res);
            
            if (res && res.isEnded) {
              console.log('✅ 用户观看完整广告，发放奖励');
              self.handleAdReward();
            } else {
              console.log('❌ 用户未观看完整广告，不发放奖励');
              wx.showToast({
                title: '需要观看完整广告才能获得奖励',
                icon: 'none',
                duration: 2000
              });
            }

            // 广告关闭后重新预加载
            setTimeout(function() {
              self.preload();
            }, 1000);
          });
        },
        
                 // 处理广告奖励
         handleAdReward: function() {
           try {
             // 调用积分系统发放奖励
             const pointsManagerUtil = require('./points-manager.js');
             
             // 使用正确的异步方法
             pointsManagerUtil.watchAdReward()
               .then(function(result) {
                 console.log('✅ 积分奖励发放成功:', result);
                 
                 // 🎯 立即设置积分更新标记，确保页面能检测到更新
                 wx.setStorageSync('points_updated', Date.now());
                 
                                 // 🎯 新增：立即通知页面实例刷新积分显示
                if (adManager.pageInstance && typeof adManager.pageInstance.refreshPointsSystem === 'function') {
                  console.log('🔄 立即刷新页面积分显示...');
                  setTimeout(() => {
                    adManager.pageInstance.refreshPointsSystem();
                    console.log('✅ 页面积分显示已刷新');
                  }, 100); // 100ms延迟确保积分数据已完全更新
                }
                 
                 // 🎯 新增：发送全局事件，通知其他可能的监听器
                 try {
                   const pages = getCurrentPages();
                   const currentPage = pages[pages.length - 1];
                   if (currentPage && typeof currentPage.onPointsUpdated === 'function') {
                     currentPage.onPointsUpdated(result);
                   }
                 } catch (e) {
                   console.log('发送积分更新事件失败:', e);
                 }
                 
                 // 显示详细的奖励信息
                 const nextInfo = result.remainingToday > 0 ? 
                   `，今日还可观看 ${result.remainingToday} 次` : 
                   '，今日观看次数已满';
                 
                 wx.showModal({
                   title: '观看广告成功',
                   content: `恭喜获得 ${result.reward} 积分！${nextInfo}`,
                   showCancel: false,
                   confirmText: '好的'
                 });
               })
               .catch(function(error) {
                 console.error('❌ 积分奖励发放失败:', error);
                 
                 if (error.message && error.message.includes('今日观看次数已用完')) {
                   wx.showToast({
                     title: '今日观看次数已用完',
                     icon: 'none',
                     duration: 2000
                   });
                 } else {
                   wx.showToast({
                     title: '奖励发放失败',
                     icon: 'none',
                     duration: 2000
                   });
                 }
               });
           } catch (error) {
             console.error('❌ 处理广告奖励时出错:', error);
             wx.showToast({
               title: '奖励处理失败',
               icon: 'none',
               duration: 2000
             });
           }
         },
        
        // 销毁广告实例
        destroy: function() {
          if (this.rewardedVideoAd) {
            try {
              this.rewardedVideoAd.offLoad();
              this.rewardedVideoAd.offError();
              this.rewardedVideoAd.offClose();
              console.log('✅ 激励视频广告实例已销毁');
            } catch (error) {
              console.warn('⚠️ 销毁激励视频广告实例时出错:', error);
            }
            this.rewardedVideoAd = null;
          }
        }
      };

      // 设置事件监听器
      adManager.setupListeners();
      
      // 预加载广告
      adManager.preload();

      return adManager;
    } catch (error) {
      console.error('❌ 创建页面激励视频广告失败:', error);
      return null;
    }
  }

  /**
   * 🎯 移除原有的全局激励视频广告相关方法
   * 这些方法现在由页面级别的广告管理对象提供
   */

  /**
   * 记录广告显示时间
   * @param {string} unitId - 广告单元ID
   */
  recordAdShown(unitId) {
    try {
      const history = this.getAdHistory();
      history[unitId] = (history[unitId] || 0) + 1;
      wx.setStorageSync('adDisplayHistory', history);
      wx.setStorageSync('lastAdTime', Date.now());
    } catch (e) {
      console.log('记录广告显示失败:', e);
    }
  }

  /**
   * 🎯 新增：获取最佳广告单元（支持激励视频）
   * @param {string} context - 页面上下文：reward表示激励视频广告
   * @returns {object|null} 广告单元配置或null
   */
  getBestAdUnit(context = 'default', pageType = 'primary') {
    // 🎯 处理激励视频广告请求
    if (context === 'reward' || context === 'rewarded') {
      return this.currentAdUnit ? {
        id: this.currentAdUnit.id,
        type: 'rewarded',
        name: this.currentAdUnit.name,
        priority: this.currentAdUnit.priority
      } : null;
    }
    
    // 🎯 处理自定义广告请求（原有逻辑）
    if (!this.isNetworkAvailable()) return null;
  
    const userPrefs = this.getUserPreferences();
    if (userPrefs.reduceAds && !this.canShowAd()) return null;
  
    // 根据页面类型和上下文选择广告
    let candidates = this.selectCandidatesByContext(context, pageType);
    
    if (candidates.length === 0) {
      // 兜底：使用默认广告
      candidates = this.adUnits.filter(function(unit) { return unit.priority === 'medium'; });
    }
    
    // 平均分配算法：选择最少使用的广告单元
    return this.selectLeastUsedAd(candidates);
  }

  /**
   * 🎯 新增：获取广告状态
   * @returns {object} 广告状态信息
   */
  getAdStatus() {
    if (!this.rewardedVideoAd || !this.currentAdUnit) {
      return {
        canShow: false,
        isReady: false,
        isLoading: false,
        error: '广告未初始化'
      };
    }

    // 🎯 根据官方文档：广告默认是隐藏的，调用show()时才显示
    return {
      canShow: true,
      isReady: true,
      isLoading: false,
      currentAdUnit: this.currentAdUnit.name
    };
  }

  /**
   * 检查网络可用性 - 🎯 增强离线友好提示
   * @returns {boolean} 网络是否可用
   */
  isNetworkAvailable() {
    try {
      const networkType = wx.getStorageSync('lastNetworkType') || 'unknown';
      const isOnline = networkType !== 'none';
      
      if (!isOnline) {
        console.log('🛩️ 离线模式：核心功能仍可正常使用');
      }
      
      return isOnline;
    } catch (e) {
      console.log('网络状态检查失败:', e);
      return false; // 保守处理，网络检查失败时不显示广告
    }
  }

  /**
   * 根据上下文选择候选广告
   * @param {string} context - 页面上下文
   * @returns {array} 广告单元配置
   */
  selectCandidatesByContext(context, pageType) {
    const contextMap = {
      // 万能查询页面相关
      'search-results': ['search-results', 'list-page'],
      'letter-groups': ['list-page', 'grid'],
      'letter-items': ['secondary-page', 'detail-page'],
      'detail-view': ['detail-page', 'tertiary-page'],
      'st-middle': ['secondary-page', 'list-page'],
      'definition-ij': ['secondary-page', 'detail-page'],
      'definition-bottom': ['detail-page', 'tool'],
      'airport-mn': ['secondary-page', 'list-page'],
      'airport-bottom': ['detail-page', 'grid'],
      'communication-middle': ['secondary-page', 'tertiary-page'],
      'communication-bottom': ['detail-page', 'tool'],
      'normative-bottom': ['tool', 'detail-page'],
      
      // 我的首页页面相关
      'tool': ['tool', 'banner-single'],
      'calculator': ['tool', 'detail-page'],
      'converter': ['tool', 'secondary-page'],
      'calculation': ['tool', 'detail-page'],
      'a350-b737-middle': ['secondary-page', 'tertiary-page'],
      'departure-arrival-middle': ['search-results', 'tool'],
      'sunrise-bottom': ['detail-page', 'tool'],
      'event-report': ['list-page', 'search-results'],
      'flight-time-share': ['tool', 'calculator'],
      'personal-checklist': ['list-page', 'management'],
      'qualification-manager': ['management', 'list-page'],
      'snowtam-decoder': ['detail-page', 'tool'],
      
      // 其他页面类型
      'list': ['list-page', 'search-results'],
      'grid': ['grid', 'list-page']
    };
    
    const relevantContexts = contextMap[context] || [context];
    
    return this.adUnits.filter(function(unit) {
      return relevantContexts.includes(unit.context) ||
             relevantContexts.includes(unit.format);
    });
  }

  /**
   * 选择最少使用的广告单元（平均分配）
   * @param {array} candidates - 候选广告单元
   * @returns {object|null} 选择的广告单元配置或null
   */
  selectLeastUsedAd(candidates) {
    if (candidates.length === 0) return null;
    
    // 获取每个广告单元的使用次数
    const usageCounts = candidates.map(function(unit) {
      return {
        unit: unit,
        count: this.adHistory[unit.id] || 0
      };
    }.bind(this));
    
    // 找到使用次数最少的广告单元
    const counts = usageCounts.map(function(item) { return item.count; });
    const minCount = Math.min.apply(Math, counts);
    const leastUsedAds = usageCounts.filter(function(item) { return item.count === minCount; });
    
    // 如果有多个最少使用的，随机选择一个
    const randomIndex = Math.floor(Math.random() * leastUsedAds.length);
    return leastUsedAds[randomIndex].unit;
  }

  /**
   * 获取广告显示历史
   * @returns {object} 广告历史记录
   */
  getAdHistory() {
    try {
      return wx.getStorageSync('adDisplayHistory') || {};
    } catch (e) {
      console.log('获取广告历史失败:', e);
      return {};
    }
  }

  /**
   * 获取用户偏好设置
   * @returns {object} 用户偏好配置
   */
  getUserPreferences() {
    try {
      const preferences = wx.getStorageSync('userAdPreferences') || {
        reduceAds: false,           // 是否减少广告显示
        allowPersonalized: true,    // 是否允许个性化广告
        lastUpdated: Date.now()     // 最后更新时间
      };
      
      // 检查减少广告功能是否过期
      if (preferences.reduceAds && preferences.reduceAdsExpireTime) {
        const currentTime = Date.now();
        if (currentTime >= preferences.reduceAdsExpireTime) {
          // 已过期，自动关闭减少广告功能
          console.log('🎯 减少广告功能已过期，自动关闭');
          preferences.reduceAds = false;
          preferences.reduceAdsExpireTime = 0;
          
          // 更新存储
          this.updateUserPreferences(preferences);
          
          // 清除过期时间存储
          wx.removeStorageSync('reduceAdsExpireTime');
        }
      }
      
      return preferences;
    } catch (e) {
      console.log('获取用户偏好失败:', e);
      return { 
        reduceAds: false, 
        allowPersonalized: true,
        lastUpdated: Date.now()
      };
    }
  }

  /**
   * 更新用户偏好设置
   * @param {object} preferences - 新的偏好设置
   */
  updateUserPreferences(preferences) {
    try {
      const currentPreferences = this.getUserPreferences();
      const updatedPreferences = Object.assign({}, currentPreferences, preferences, {
        lastUpdated: Date.now()
      });
      
      wx.setStorageSync('userAdPreferences', updatedPreferences);
      console.log('用户偏好已更新:', updatedPreferences);
      
      return true;
    } catch (e) {
      console.log('更新用户偏好失败:', e);
      return false;
    }
  }

  /**
   * 检查是否可以显示广告（减少广告模式下的时间间隔检查）
   * @returns {boolean} 是否可以显示广告
   */
  canShowAd() {
    try {
      const lastShown = wx.getStorageSync('lastAdTime') || 0;
      const now = Date.now();
      const interval = 10 * 60 * 1000; // 10分钟间隔
      
      const canShow = (now - lastShown) >= interval;
      console.log('广告显示间隔检查:', {
        lastShown: new Date(lastShown).toLocaleTimeString(),
        now: new Date(now).toLocaleTimeString(),
        intervalMinutes: interval / 60000,
        canShow
      });
      
      return canShow;
    } catch (e) {
      console.log('广告间隔检查失败:', e);
      return true; // 检查失败时允许显示
    }
  }

  /**
   * 获取广告状态信息（调试用）
   * @returns {object} 广告状态信息
   */
  getAdStats() {
    const history = this.getAdHistory();
    const stats = this.adUnits.map(function(unit) {
      return {
        id: unit.id,
        context: unit.context,
        format: unit.format,
        priority: unit.priority,
        displayCount: history[unit.id] || 0
      };
    });
    
    return {
      totalDisplays: Object.values(history).reduce(function(sum, count) { return sum + count; }, 0),
      adUnits: stats
    };
  }

  /**
   * 重置广告历史（用于测试）
   */
  resetAdHistory() {
    try {
      wx.removeStorageSync('adDisplayHistory');
      wx.removeStorageSync('lastAdTime');
    } catch (e) {
      console.log('重置广告历史失败:', e);
    }
  }

  /**
   * 🎯 基于Context7最佳实践：完全销毁广告管理器实例
   * 清理所有事件监听器和资源，防止内存泄漏
   */
  destroy() {
    try {
      console.log('🎯 开始销毁AdManager实例...');
      
      // 清理全局单例引用
      AdManager.instance = null;
      
      console.log('✅ AdManager实例销毁完成');
    } catch (error) {
      console.error('❌ 销毁AdManager实例时出错:', error);
    }
  }

  /**
   * 🎯 新增：显示积分不足引导界面
   * @param {number} requiredPoints 需要的积分数量
   * @param {number} currentPoints 当前积分数量
   */
  showInsufficientPointsGuide(requiredPoints, currentPoints) {
    const deficit = requiredPoints - currentPoints;
    
    wx.showModal({
      title: '积分不足',
      content: `当前积分：${currentPoints}\n需要积分：${requiredPoints}\n还差：${deficit}积分\n\n观看广告可获得积分！`,
      showCancel: true,
      cancelText: '稍后再说',
      confirmText: '观看广告',
      success: (res) => {
        if (res.confirm) {
          // 用户选择观看广告
          this.showRewardedAd({
            source: 'insufficient_points',
            context: 'points_guide'
          });
        }
      }
    });
  }
}

// 🎯 初始化静态属性
AdManager.instance = null;

module.exports = AdManager; 