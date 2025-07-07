/**
 * 广告管理器 - 激励广告专用版本
 * 基于Context7最佳实践，专为激励广告设计
 */
class AdManager {
  constructor() {
    // 🎯 激励视频广告位配置（用于页面级别创建）
    this.rewardedAdUnits = [
      { id: 'adunit-316c5630d7a1f9ef', name: '获得积分', status: 'enabled', priority: 1 }
    ];

    console.log('AdManager初始化完成，共配置', this.rewardedAdUnits.length, '个激励视频广告位');
    
    // 🎯 设置为全局单例
    AdManager.instance = this;
  }

  /**
   * 🎯 为指定页面创建激励视频广告实例
   * 解决 "you can only invoke show() on the page where rewardedVideoAd is created" 问题
   * @param {Object} pageInstance - 页面实例
   * @returns {Object} 激励视频广告管理对象
   */
  createPageRewardedAd(pageInstance) {
    try {
      // 🔧 检查是否已经为该页面创建过激励视频广告实例
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
          
          // 🔧 在绑定新事件前先解绑之前的事件监听器，避免重复绑定
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
          
          // 绑定加载成功事件
          this.rewardedVideoAd.onLoad(function() {
            console.log('✅ 激励视频广告加载成功');
            self.isLoaded = true;
          });
          
          // 绑定加载失败事件
          this.rewardedVideoAd.onError(function(err) {
            console.error('❌ 激励视频广告加载失败:', err);
            self.isLoaded = false;
          });
          
          // 绑定关闭事件
          this.rewardedVideoAd.onClose(function(res) {
            console.log('🎬 激励视频广告关闭', res);
            
            // 通知页面广告观看结果
            if (self.pageInstance && self.pageInstance.onRewardedAdClose) {
              self.pageInstance.onRewardedAdClose(res);
            }
            
            // 重新预加载下一次的广告
            setTimeout(function() {
              self.preload();
            }, 1000);
          });
        },
        
        // 销毁广告实例
        destroy: function() {
          if (this.rewardedVideoAd) {
            try {
              this.rewardedVideoAd.offLoad();
              this.rewardedVideoAd.offError();
              this.rewardedVideoAd.offClose();
              console.log('🔧 激励视频广告事件监听器已清理');
            } catch (error) {
              console.log('🔧 清理激励视频广告事件监听器时出错:', error);
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
      console.error('❌ 创建激励视频广告实例失败:', error);
      return null;
    }
  }

  /**
   * 检查是否支持激励视频广告
   * @returns {boolean}
   */
  isRewardedAdSupported() {
    return !!wx.createRewardedVideoAd;
  }

  /**
   * 销毁广告管理器
   */
  destroy() {
    console.log('🔧 AdManager 销毁');
  }
}

// 导出类
module.exports = AdManager; 