/**
 * 激励广告管理器 - 重构版本
 * 规则：每100次点击弹框询问，看广告后下次300次才询问，不看则100次后再问
 * 支持多个广告位轮换
 */

var AdManager = {
  // 配置
  config: {
    defaultInterval: 300,    // 新用户首次默认间隔（300次）
    rewardInterval: 300,     // 看了广告的奖励间隔（已废弃，保留兼容性）
    adUnitIds: [             // 多个广告位ID，支持轮换 (全部可用广告位)
      'adunit-079d7e04aeba0625',  // 激励视频广告位1
      'adunit-190474fb7b19f51e',  // 激励视频广告位2
      'adunit-316c5630d7a1f9ef',  // 激励视频广告位3
      'adunit-fd97a5da07ddbd0c',  // 激励视频广告位4
      'adunit-a08edd4e60e36fd7',  // 激励视频广告位5
      'adunit-db1eff6d7d44a6d1'   // 激励视频广告位6
    ],
    currentAdIndex: 0,       // 当前使用的广告位索引
    storageKeys: {
      clickCount: 'ad_card_click_count',
      nextThreshold: 'ad_next_threshold',
      totalAdsWatched: 'ad_total_watched',
      lastAdTime: 'ad_last_watch_time',
      currentAdIndex: 'ad_current_index'
    }
  },

  // 广告实例
  videoAd: null,
  isInitialized: false,
  isShowingAd: false,
  isVideoReady: false,
  isLoadingVideo: false,
  preloadTimer: null,

  // 调试模式
  debugMode: false,

  // 网络状态
  isOnline: true,
  loadingTimeout: null,

  // 🔧 新增：防止onClose重复触发的标记
  _adCloseHandled: false,

  // 初始化广告管理器
  init: function(options) {
    options = options || {};

    // 允许自定义广告ID
    if (options.adUnitIds && options.adUnitIds.length > 0) {
      this.config.adUnitIds = options.adUnitIds;
    }

    this.debugMode = options.debug || false;

    // 恢复上次使用的广告位索引
    this.config.currentAdIndex = wx.getStorageSync(this.config.storageKeys.currentAdIndex) || 0;

    // 初始化网络状态监听（只需初始化一次）
    if (!this.isInitialized) {
      this.initNetworkMonitor();
      this.isInitialized = true;
    }

    this.log('[AdManager] 初始化开始，广告位数量:', this.config.adUnitIds.length);
    this.log('[AdManager] 当前广告位索引:', this.config.currentAdIndex);
    this.log('[AdManager] 网络状态:', this.isOnline ? '在线' : '离线');
  },

  // 🔧 新增：广告预热机制（增强版）
  warmupAd: function(retryCount) {
    var self = this;
    retryCount = retryCount || 0;

    // 🚀 关键修复：移除网络检查，让广告SDK自己处理
    if (!this.videoAd) {
      this.log('[AdManager] 广告预热跳过：实例不存在');
      return;
    }

    if (this.isLoadingVideo) {
      this.log('[AdManager] 广告预热跳过：已有加载任务进行中');
      return;
    }

    this.log('[AdManager] 开始广告预热（尝试', retryCount + 1, '次）...');
    this.isLoadingVideo = true;

    // 静默预加载广告素材，不显示loading
    this.videoAd.load()
      .then(function() {
        self.isVideoReady = true;
        self.isLoadingVideo = false;
        self.log('[AdManager] ✅ 广告预热成功，首次播放将更快');
      })
      .catch(function(err) {
        self.isLoadingVideo = false;
        self.isVideoReady = false;
        self.log('[AdManager] ❌ 广告预热失败:', err.errMsg || err);

        // 🚀 预热失败后自动重试（最多3次）
        if (retryCount < 2) {
          self.log('[AdManager] 预热失败，', (2000 * (retryCount + 1)), 'ms后自动重试...');
          setTimeout(function() {
            self.warmupAd(retryCount + 1);
          }, 2000 * (retryCount + 1)); // 递增等待时间：2s, 4s
        } else {
          // 3次预热都失败，尝试切换广告位
          self.log('[AdManager] 预热失败达到上限，尝试切换广告位');
          if (self.config.adUnitIds.length > 1) {
            self.tryNextAdUnit();
          }
        }
      });
  },

  scheduleAdWarmup: function(delay) {
    var self = this;

    if (this.preloadTimer) {
      clearTimeout(this.preloadTimer);
      this.preloadTimer = null;
    }

    if (!this.videoAd) {
      this.log('[AdManager] 预热调度时没有可用的广告实例');
      return;
    }

    var wait = typeof delay === 'number' ? Math.max(delay, 0) : 1200;

    this.preloadTimer = setTimeout(function() {
      self.preloadTimer = null;

      if (self.isShowingAd) {
        return;
      }

      self.warmupAd();
    }, wait);
  },

  // 初始化网络状态监听
  initNetworkMonitor: function() {
    var self = this;
    
    // 获取当前网络状态
    wx.getNetworkType({
      success: function(res) {
        self.isOnline = res.networkType !== 'none';
        self.log('[AdManager] 初始网络状态:', res.networkType, self.isOnline ? '在线' : '离线');
      },
      fail: function() {
        // 获取失败时，假设有网络（保守策略）
        self.isOnline = true;
        self.log('[AdManager] 无法获取网络状态，假设有网络');
      }
    });
    
    // 监听网络状态变化
    wx.onNetworkStatusChange(function(res) {
      var wasOnline = self.isOnline;
      self.isOnline = res.isConnected && res.networkType !== 'none';
      
      if (wasOnline !== self.isOnline) {
        self.log('[AdManager] 网络状态变化:', self.isOnline ? '恢复在线' : '转为离线');
        
        // 如果从离线转为在线，且正在显示广告，可能需要重新尝试
        if (self.isOnline && self.isShowingAd) {
          self.log('[AdManager] 网络恢复，广告可能可以加载了');
        }
      }
    });
  },

  // 检查网络状态
  checkNetworkStatus: function() {
    var self = this;
    return new Promise(function(resolve) {
      wx.getNetworkType({
        success: function(res) {
          var isOnline = res.networkType !== 'none';
          self.isOnline = isOnline;
          self.log('[AdManager] 实时网络检查:', res.networkType, isOnline ? '在线' : '离线');
          resolve(isOnline);
        },
        fail: function() {
          // 检查失败时，使用缓存的状态
          self.log('[AdManager] 网络状态检查失败，使用缓存状态:', self.isOnline ? '在线' : '离线');
          resolve(self.isOnline);
        }
      });
    });
  },

  // 创建激励视频广告
  createVideoAd: function() {
    // 检查是否支持激励视频广告
    if (!wx.createRewardedVideoAd) {
      this.log('[AdManager] 当前环境不支持激励视频广告');
      return false;
    }

    // 获取当前要使用的广告位ID
    var currentAdUnitId = this.getCurrentAdUnitId();
    this.log('[AdManager] 创建激励视频广告, ID:', currentAdUnitId);

    try {
      // 销毁旧的广告实例
      this.destroyVideoAd();

      // 创建新的广告实例
      this.videoAd = wx.createRewardedVideoAd({
        adUnitId: currentAdUnitId
      });

      this.isVideoReady = false;
      this.isLoadingVideo = false;

      // 绑定事件
      this.bindAdEvents();

      this.log('[AdManager] ✅ 广告实例创建成功');
      // 🚀 移除延迟预热，由调用方控制
      return true;
    } catch (error) {
      this.log('[AdManager] ❌ 创建广告失败:', error);
      this.tryNextAdUnit();
      return false;
    }
  },

  // 获取当前广告位ID
  getCurrentAdUnitId: function() {
    var index = this.config.currentAdIndex % this.config.adUnitIds.length;
    return this.config.adUnitIds[index];
  },

  // 尝试下一个广告位
  tryNextAdUnit: function() {
    this.config.currentAdIndex = (this.config.currentAdIndex + 1) % this.config.adUnitIds.length;
    wx.setStorageSync(this.config.storageKeys.currentAdIndex, this.config.currentAdIndex);
    this.log('[AdManager] 切换到下一个广告位，索引:', this.config.currentAdIndex);
    
    // 重新创建广告
    setTimeout(() => {
      this.createVideoAd();
    }, 1000);
  },

  // 绑定广告事件
  bindAdEvents: function() {
    if (!this.videoAd) return;

    var self = this;

    // 🔧 修复：先清除所有旧监听器，避免重复触发
    this.videoAd.offLoad && this.videoAd.offLoad();
    this.videoAd.offError && this.videoAd.offError();
    this.videoAd.offClose && this.videoAd.offClose();

    // 🔧 使用命名函数，便于调试和追踪
    this._onAdLoadHandler = function() {
      self.isLoadingVideo = false;
      self.isVideoReady = true;
      self.log('[AdManager] 广告加载成功');
    };

    this._onAdErrorHandler = function(err) {
      self.isLoadingVideo = false;
      self.isVideoReady = false;
      self.log('[AdManager] 广告错误:', err);

      // 过滤可忽略的错误
      if (self.isIgnorableError(err)) {
        self.log('[AdManager] 可忽略的广告错误，不处理');
        return;
      }

      // 尝试下一个广告位
      self.tryNextAdUnit();
    };

    this._onAdCloseHandler = function(res) {
      self.clearLoadingTimeout(); // 清除可能存在的超时计时器
      self.isShowingAd = false;
      self.log('[AdManager] 广告关闭, 用户行为:', res);

      // 🚀 防止重复触发：检查是否已处理
      if (self._adCloseHandled) {
        self.log('[AdManager] ⚠️ 广告关闭事件重复触发，已忽略');
        return;
      }
      self._adCloseHandled = true;

      if (res && res.isEnded) {
        // 🚀 用户完整观看：增加300次
        self.onAdWatchComplete();
      } else {
        // 🚀 用户中途退出：上限保护50次
        self.onAdSkippedMidway();
      }

      // 🔧 延迟重置标记，允许下次广告播放
      setTimeout(function() {
        self._adCloseHandled = false;
      }, 500);
    };

    // 广告加载成功
    this.videoAd.onLoad(this._onAdLoadHandler);

    // 广告加载失败
    this.videoAd.onError(this._onAdErrorHandler);

    // 广告关闭
    this.videoAd.onClose(this._onAdCloseHandler);

    this.log('[AdManager] ✅ 广告事件已绑定（已清除旧监听器）');
  },

  // 判断是否为可忽略的错误
  isIgnorableError: function(err) {
    if (!err || !err.errMsg) return false;
    
    var ignorableErrors = [
      'TextView',
      'insertTextView', 
      'updateTextView',
      'removeTextView',
      'removeImageView',
      'insertImageView',
      'updateImageView',
      'operateWXDataForAd',
      'updateVideoPlayer',
      'navigateBackInterceptionHandler'
    ];
    
    return ignorableErrors.some(function(errorType) {
      return err.errMsg.includes(errorType);
    });
  },

  // 销毁广告实例
  destroyVideoAd: function() {
    if (this.videoAd) {
      try {
        // 🔧 增强：先停止所有相关操作
        this.clearLoadingTimeout();
        this.isShowingAd = false;
        
        // 移除事件监听
        this.videoAd.offLoad && this.videoAd.offLoad();
        this.videoAd.offError && this.videoAd.offError();
        this.videoAd.offClose && this.videoAd.offClose();
        
        // 🔧 延迟销毁：给视图时间完成清理
        var videoAdInstance = this.videoAd;
        this.videoAd = null; // 立即清空引用
        if (this.preloadTimer) {
          clearTimeout(this.preloadTimer);
          this.preloadTimer = null;
        }
        this.isVideoReady = false;
        this.isLoadingVideo = false;
        
        setTimeout(function() {
          try {
            videoAdInstance.destroy && videoAdInstance.destroy();
          } catch (e) {
            // 静默处理销毁错误，避免控制台噪音
          }
        }, 100); // 100ms延迟销毁
        
        this.log('[AdManager] 广告实例已标记销毁');
      } catch (e) {
        this.log('[AdManager] 销毁广告实例时出错:', e);
      }
    }
  },

  // 获取点击次数
  getClickCount: function() {
    return wx.getStorageSync(this.config.storageKeys.clickCount) || 0;
  },

  // 增加点击次数
  incrementClick: function() {
    var count = this.getClickCount() + 1;
    wx.setStorageSync(this.config.storageKeys.clickCount, count);
    return count;
  },

  // 获取下次触发阈值
  getNextThreshold: function() {
    return wx.getStorageSync(this.config.storageKeys.nextThreshold) || this.config.defaultInterval;
  },

  // 设置下次触发阈值
  setNextThreshold: function(value) {
    wx.setStorageSync(this.config.storageKeys.nextThreshold, value);
  },

  // 获取总观看次数
  getTotalAdsWatched: function() {
    return wx.getStorageSync(this.config.storageKeys.totalAdsWatched) || 0;
  },

  // 记录广告观看
  recordAdWatch: function() {
    var total = this.getTotalAdsWatched() + 1;
    wx.setStorageSync(this.config.storageKeys.totalAdsWatched, total);
    wx.setStorageSync(this.config.storageKeys.lastAdTime, Date.now());
    return total;
  },

  // 检查是否应该触发广告（不直接显示弹窗）
  checkShouldShowAd: function() {
    if (!this.isInitialized) {
      this.log('[AdManager] 未初始化，自动初始化');
      this.init();
    }

    var clicks = this.incrementClick();
    var threshold = this.getNextThreshold();
    
    this.log('[AdManager] 当前点击次数:', clicks, '触发阈值:', threshold);
    
    var shouldTrigger = clicks >= threshold;
    
    // 🔧 修复：只有在标准阈值下才设置临时阈值，避免与调试功能冲突
    if (shouldTrigger && (threshold % 100 === 0)) {
      // 只对标准阈值（100的倍数）设置临时缓冲
      var tempThreshold = clicks + 5; // 缓冲5次点击
      this.setNextThreshold(tempThreshold);
      this.log('[AdManager] 标准触发，设置临时缓冲阈值:', tempThreshold);
    } else if (shouldTrigger) {
      // 非标准阈值（如调试设置的），不修改阈值
      this.log('[AdManager] 自定义阈值触发，保持原阈值不变');
    }
    
    return shouldTrigger;
  },

  // 自动打开激励作者卡片
  openSupportAuthorCard: function() {
    this.log('[AdManager] 自动打开激励作者卡片');
    
    // 🔧 移除：不要在这里立即更新阈值，应该在用户操作后再更新
    // var currentCount = this.getClickCount();
    // var nextThreshold = currentCount + this.config.defaultInterval;
    // this.setNextThreshold(nextThreshold);
    
    // 显示提示消息
    wx.showToast({
      title: '🎯 点击底部"激励作者"支持开发',
      icon: 'none',
      duration: 2000
    });

    // 可选择：添加一些视觉提示效果
    // 比如让激励作者卡片闪烁或高亮
    this.highlightSupportCard();
  },

  // 高亮显示激励作者卡片
  highlightSupportCard: function() {
    try {
      // 获取当前页面实例
      var pages = getCurrentPages();
      if (pages.length > 0) {
        var currentPage = pages[pages.length - 1];
        
        // 如果在首页，触发卡片高亮动画
        if (currentPage.route === 'pages/home/index') {
          // 让激励作者卡片有一个明显的提示效果
          if (currentPage.highlightSupportCard) {
            currentPage.highlightSupportCard();
          }
        }
      }
    } catch (e) {
      this.log('[AdManager] 高亮卡片时出错:', e);
    }
  },

  // 检查并重定向到激励作者卡片（用于非激励卡片的点击）
  checkAndRedirect: function() {
    if (this.checkShouldShowAd()) {
      // 触发条件满足，引导用户到激励作者卡片
      this.openSupportAuthorCard();
      return true;
    }
    return false;
  },

  // 检查并显示广告（仅用于激励作者卡片）
  checkAndShow: function(options) {
    options = options || {};

    var self = this;

    this.log('[AdManager] 用户点击鼓励作者卡片');

    // 🚀 新增:停止所有页面的卡片闪烁
    this.stopAllCardsBlink();

    // 🚀 核心修复：先检查网络，离线直接返回，避免创建广告实例
    this.checkNetworkStatus().then(function(isOnline) {
      if (!isOnline) {
        // 🚀 离线状态：显示感谢并增加50次间隔，不创建广告实例
        wx.showToast({
          title: '感谢支持！\n当前无网络\n已为您延长50次使用',
          icon: 'none',
          duration: 3000
        });

        self.onAdSkippedOffline();
        return;
      }

      // 🚀 有网络：销毁旧实例并创建新实例
      self.log('[AdManager] 创建页面级广告实例');
      self.destroyVideoAd();

      // 🔧 修复:等待旧实例完全销毁后再创建新实例
      setTimeout(function() {
        // 创建新实例
        if (!self.createVideoAd()) {
          wx.showToast({
            title: '广告初始化失败\n请稍后重试',
            icon: 'none',
            duration: 2000
          });
          self.onAdSkipped();
          return false;
        }

        // 直接播放广告
        self.log('[AdManager] 用户点击卡片，直接播放广告');
        self.showVideoAdWithRetry();
      }, 150); // 等待150ms确保旧实例完全销毁
    });

    return true;
  },

  // 🚀 新增：开始预加载广告（点击卡片时调用）
  startPreloadingAd: function() {
    var self = this;

    if (!this.videoAd) {
      this.log('[AdManager] 广告实例不存在，先创建');
      if (!this.createVideoAd()) {
        return;
      }
      // 🚀 创建后立即预热
      this.warmupAd();
      return;
    }

    // 如果已经准备好或正在加载，跳过
    if (this.isVideoReady) {
      this.log('[AdManager] 广告已准备好，无需重复加载');
      return;
    }

    if (this.isLoadingVideo) {
      this.log('[AdManager] 广告正在加载中，跳过重复加载');
      return;
    }

    this.log('[AdManager] 🚀 开始预加载广告...');
    this.isLoadingVideo = true;

    this.videoAd.load()
      .then(function() {
        self.isVideoReady = true;
        self.isLoadingVideo = false;
        self.log('[AdManager] ✅ 广告预加载成功，可以直接播放');
      })
      .catch(function(err) {
        self.isLoadingVideo = false;
        self.isVideoReady = false;
        self.log('[AdManager] ❌ 广告预加载失败:', err.errMsg || err);
      });
  },

  // 🚀 删除不再使用的showAdDialog方法（已改为直接播放）
  // showAdDialog 已废弃，点击卡片直接播放广告

  // 🔧 新增：带重试机制的广告显示
  showVideoAdWithRetry: function(retryCount) {
    var self = this;
    retryCount = retryCount || 0;

    this.log('[AdManager] 尝试显示广告，重试次数:', retryCount);

    // 检查广告实例状态
    if (!this.videoAd) {
      this.log('[AdManager] 广告实例不存在');
      this.showAdFailedMessage();
      this.onAdSkipped();
      return;
    }

    // 直接加载并显示
    this.preloadAdAndShow(retryCount);
  },

  // 🚀 新增：直接展示已准备好的广告
  directShowAd: function(retryCount) {
    var self = this;
    retryCount = retryCount || 0;

    if (this.isShowingAd) {
      this.log('[AdManager] 广告正在展示中');
      return;
    }

    this.isShowingAd = true;

    this.videoAd.show()
      .then(function() {
        self.log('[AdManager] 广告直接展示成功');
        self.isVideoReady = false;
      })
      .catch(function(err) {
        self.log('[AdManager] 直接展示失败，尝试重新加载:', err);
        self.isShowingAd = false;
        self.preloadAdAndShow(retryCount);
      });
  },

  // 🚀 优化：预加载广告并显示（智能等待加载完成）
  preloadAdAndShow: function(retryCount) {
    var self = this;
    retryCount = retryCount || 0;

    if (!this.videoAd) {
      this.log('[AdManager] 当前没有可用的广告实例，取消展示');
      this.isShowingAd = false;
      this.showAdFailedMessage();
      this.onAdSkipped();
      return;
    }

    if (this.isShowingAd) {
      this.log('[AdManager] 广告正在展示中');
      return;
    }

    this.isShowingAd = true;

    // 🚀 显示"广告准备中"提示
    wx.showLoading({
      title: '广告准备中...',
      mask: true
    });

    // 🚀 设置15秒超时（给慢网络足够时间）
    self.loadingTimeout = setTimeout(function() {
      self.log('[AdManager] ❌ 广告加载超时（15秒）');
      wx.hideLoading();
      self.isShowingAd = false;
      self.isLoadingVideo = false;
      self.loadingTimeout = null;

      // 显示加载失败提示
      wx.showToast({
        title: '广告加载超时\n网络可能较慢\n请稍后重试',
        icon: 'none',
        duration: 3000
      });

      self.onAdSkipped();
    }, 15000);

    self.isLoadingVideo = true;

    // 🚀 先尝试直接播放（如果已经预加载好）
    self.videoAd.show()
      .then(function() {
        // ✅ 直接播放成功
        self.clearLoadingTimeout();
        wx.hideLoading();
        self.isLoadingVideo = false;
        self.isVideoReady = false;
        self.log('[AdManager] ✅ 广告直接播放成功');
      })
      .catch(function(err) {
        // ❌ 直接播放失败，需要先加载
        self.log('[AdManager] 直接播放失败，开始加载广告...', err);
        self.isVideoReady = false;

        return self.videoAd.load()
          .then(function() {
            self.log('[AdManager] 广告加载完成，立即播放');
            self.isLoadingVideo = false;
            self.isVideoReady = true;
            // 🚀 加载完成后自动播放
            return self.videoAd.show();
          })
          .then(function() {
            // ✅ 加载后播放成功
            self.clearLoadingTimeout();
            wx.hideLoading();
            self.isVideoReady = false;
            self.log('[AdManager] ✅ 广告加载完成并播放成功');
          })
          .catch(function(loadErr) {
            // ❌ 加载或播放失败
            self.clearLoadingTimeout();
            wx.hideLoading();
            self.isLoadingVideo = false;
            self.isShowingAd = false;
            self.log('[AdManager] ❌ 广告加载或播放失败:', loadErr);

            // 判断是否可以重试
            if (self.isRetryableError(loadErr) && retryCount < 2) {
              self.log('[AdManager] 准备重试（', retryCount + 1, '/2）');
              setTimeout(function() {
                self.showVideoAdWithRetry(retryCount + 1);
              }, 1000);
            } else {
              self.handleShowError(loadErr);
            }
          });
      });
  },

  // 🔧 新增：判断是否为可重试的错误
  isRetryableError: function(err) {
    if (!err || !err.errMsg) return false;
    
    var retryableErrors = [
      'load fail',
      'show fail',
      'network error',
      'timeout',
      'not ready',
      'system busy'
    ];
    
    var errMsg = err.errMsg.toLowerCase();
    return retryableErrors.some(function(errorType) {
      return errMsg.indexOf(errorType) !== -1;
    });
  },

  // 显示激励视频广告
  showVideoAd: function() {
    if (this.isShowingAd) {
      this.log('[AdManager] 广告正在展示中');
      return;
    }

    if (!this.videoAd) {
      this.log('[AdManager] 广告实例不存在，重新创建');
      if (!this.createVideoAd()) {
        this.showAdFailedMessage();
        return;
      }
      
      // 等待广告创建完成
      setTimeout(() => {
        this.showVideoAd();
      }, 1500);
      return;
    }

    this.isShowingAd = true;
    this.log('[AdManager] 开始展示广告');

    var self = this;
    
    // 先检查网络状态
    this.checkNetworkStatus().then(function(isOnline) {
      if (!isOnline) {
        // 离线状态，直接显示离线提示
        self.showOfflineMessage();
        self.isShowingAd = false;
        self.onAdSkipped();
        return;
      }
      
      // 有网络，继续加载广告
      self.loadAndShowAd();
    });
  },

  // 加载并显示广告（带超时机制）
  loadAndShowAd: function() {
    var self = this;
    
    // 显示加载提示
    wx.showLoading({
      title: '广告加载中...',
      mask: true
    });

    // 设置超时计时器（6秒）
    this.loadingTimeout = setTimeout(function() {
      self.log('[AdManager] 广告加载超时');
      wx.hideLoading();
      self.isShowingAd = false;
      self.loadingTimeout = null;
      
      // 显示超时提示
      self.showAdTimeoutMessage();
      self.onAdSkipped();
    }, 6000);

    // 尝试直接显示
    this.videoAd.show()
      .then(() => {
        self.clearLoadingTimeout();
        wx.hideLoading();
        self.log('[AdManager] 广告展示成功');
      })
      .catch((err) => {
        self.log('[AdManager] 直接展示失败，尝试先加载:', err);
        
        // 尝试先加载再展示
        return self.videoAd.load()
          .then(() => {
            self.log('[AdManager] 广告加载成功，开始展示');
            return self.videoAd.show();
          })
          .then(() => {
            self.clearLoadingTimeout();
            wx.hideLoading();
            self.log('[AdManager] 广告展示成功');
          });
      })
      .catch((err) => {
        self.clearLoadingTimeout();
        wx.hideLoading();
        self.isShowingAd = false;
        self.log('[AdManager] 广告展示失败:', err);
        self.handleShowError(err);
      });
  },

  // 清除加载超时计时器
  clearLoadingTimeout: function() {
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
      this.loadingTimeout = null;
      this.log('[AdManager] 清除加载超时计时器');
    }
  },

  // 处理广告展示失败
  handleShowError: function(err) {
    this.log('[AdManager] 处理广告展示失败:', err);
    
    // 如果是可忽略的错误，直接返回
    if (this.isIgnorableError(err)) {
      this.log('[AdManager] 忽略的错误，不做处理');
      return;
    }
    
    // 🔧 改进：根据错误类型显示不同的提示
    if (this.isNetworkError(err)) {
      // 网络错误，显示网络提示
      wx.showToast({
        title: '网络连接异常\n请检查网络后重试',
        icon: 'none',
        duration: 3000
      });
    } else if (this.isSystemBusyError(err)) {
      // 系统繁忙，显示稍后重试
      wx.showToast({
        title: '系统繁忙\n请稍后再试',
        icon: 'none',
        duration: 2000
      });
    } else {
      // 其他错误，显示通用提示
      this.showAdFailedMessage();
    }
    
    // 尝试下一个广告位（如果有多个）
    if (this.config.adUnitIds.length > 1) {
      this.tryNextAdUnit();
    }
    
    // 按跳过处理
    this.onAdSkipped();
  },

  // 🔧 新增：判断是否为网络错误
  isNetworkError: function(err) {
    if (!err || !err.errMsg) return false;
    
    var networkErrors = ['network', 'timeout', 'connect'];
    var errMsg = err.errMsg.toLowerCase();
    
    return networkErrors.some(function(errorType) {
      return errMsg.indexOf(errorType) !== -1;
    });
  },

  // 🔧 新增：判断是否为系统繁忙错误  
  isSystemBusyError: function(err) {
    if (!err || !err.errMsg) return false;
    
    var busyErrors = ['system busy', 'server busy', 'too many requests'];
    var errMsg = err.errMsg.toLowerCase();
    
    return busyErrors.some(function(errorType) {
      return errMsg.indexOf(errorType) !== -1;
    });
  },

  // 显示广告失败消息
  showAdFailedMessage: function() {
    // 🔧 改进：更智能的环境判断
    var isDevTool = typeof __wxConfig !== 'undefined' && 
                    (__wxConfig.debug || __wxConfig.platform === 'devtools');
    
    // 🔧 修复：开发工具环境下不显示"功能受限"，而是显示实际状态                
    if (isDevTool) {
      wx.showToast({
        title: '广告加载失败\n可能需要真机环境测试',
        icon: 'none',
        duration: 3000
      });
    } else {
      wx.showToast({
        title: '广告暂时无法加载\n请稍后重试或检查网络',
        icon: 'none',
        duration: 3000
      });
    }
  },

  // 显示离线提示消息
  showOfflineMessage: function() {
    wx.showToast({
      title: '当前处于离线状态\n广告需要网络连接才能播放\n感谢您的理解！',
      icon: 'none',
      duration: 3000
    });
    this.log('[AdManager] 显示离线提示');
  },

  // 显示广告加载超时消息
  showAdTimeoutMessage: function() {
    wx.showToast({
      title: '广告加载超时\n可能网络不佳\n请稍后重试',
      icon: 'none',
      duration: 3000
    });
    this.log('[AdManager] 显示超时提示');
  },

  // 广告观看完成
  onAdWatchComplete: function() {
    this.log('[AdManager] 用户完整观看了广告');

    var totalWatched = this.recordAdWatch();
    var currentCount = this.getClickCount();
    var currentThreshold = this.getNextThreshold();

    // 🚀 修正逻辑：在原剩余次数基础上 +200
    var currentRemaining = Math.max(0, currentThreshold - currentCount);
    var newRemaining = currentRemaining + 200;
    var finalThreshold = currentCount + newRemaining;

    this.setNextThreshold(finalThreshold);

    wx.showToast({
      title: '感谢您的支持！\n已延长200次使用',
      icon: 'success',
      duration: 2000
    });

    this.log('[AdManager] 观看总数:', totalWatched, '原剩余:', currentRemaining, '增加200次，新剩余:', newRemaining, '最终阈值:', finalThreshold);

    // 🔧 新增：通知所有页面更新广告计数显示
    this.notifyPagesUpdateAdDisplay();
    this.scheduleAdWarmup(1500);
  },

  // 🚀 新增：离线模式跳过（上限保护50次）
  onAdSkippedOffline: function() {
    this.log('[AdManager] 离线模式，上限保护50次');

    var currentCount = this.getClickCount();
    var currentThreshold = this.getNextThreshold();

    // 🚀 修正逻辑：如果剩余<50则提升到50，如果≥50则保持不变
    var currentRemaining = Math.max(0, currentThreshold - currentCount);
    var newRemaining = Math.max(50, currentRemaining); // 保证至少50次，但不增加已有剩余
    var finalThreshold = currentCount + newRemaining;

    this.setNextThreshold(finalThreshold);

    this.log('[AdManager] 离线模式，原剩余:', currentRemaining, '新剩余:', newRemaining, '最终阈值:', finalThreshold);

    // 🔧 新增：通知所有页面更新广告计数显示
    this.notifyPagesUpdateAdDisplay();

    // 🔧 修复：离线模式下不预热广告（没有广告实例）
    // this.scheduleAdWarmup(1500); // 离线模式下不需要预热
  },

  // 🚀 新增：广告播放到一半退出（上限保护50次）
  onAdSkippedMidway: function() {
    this.log('[AdManager] 用户中途退出广告，上限保护50次');

    var currentCount = this.getClickCount();
    var currentThreshold = this.getNextThreshold();

    // 🚀 修正逻辑：如果剩余<50则提升到50，如果≥50则保持不变
    var currentRemaining = Math.max(0, currentThreshold - currentCount);
    var newRemaining = Math.max(50, currentRemaining); // 保证至少50次，但不增加已有剩余
    var finalThreshold = currentCount + newRemaining;

    this.setNextThreshold(finalThreshold);

    this.log('[AdManager] 中途退出，原剩余:', currentRemaining, '新剩余:', newRemaining, '最终阈值:', finalThreshold);

    // 🔧 新增：通知所有页面更新广告计数显示
    this.notifyPagesUpdateAdDisplay();
    this.scheduleAdWarmup(1500);
  },

  // 广告被跳过（在线模式，广告加载失败等，上限保护50次）
  onAdSkipped: function() {
    this.log('[AdManager] 广告加载失败或其他原因跳过，上限保护50次');

    var currentCount = this.getClickCount();
    var currentThreshold = this.getNextThreshold();

    // 🚀 修正逻辑：如果剩余<50则提升到50，如果≥50则保持不变
    var currentRemaining = Math.max(0, currentThreshold - currentCount);
    var newRemaining = Math.max(50, currentRemaining); // 保证至少50次，但不增加已有剩余
    var finalThreshold = currentCount + newRemaining;

    this.setNextThreshold(finalThreshold);

    this.log('[AdManager] 加载失败，原剩余:', currentRemaining, '新剩余:', newRemaining, '最终阈值:', finalThreshold);

    // 🔧 新增：通知所有页面更新广告计数显示
    this.notifyPagesUpdateAdDisplay();
    this.scheduleAdWarmup(1500);
  },

  // 🔧 新增:通知所有页面更新广告显示
  notifyPagesUpdateAdDisplay: function() {
    try {
      var pages = getCurrentPages();
      var self = this;

      this.log('[AdManager] 开始同步更新', pages.length, '个页面的广告显示');

      // 🚀 新增:获取剩余点击次数,判断是否需要闪烁
      var clickCount = this.getClickCount();
      var threshold = this.getNextThreshold();
      var clicksRemaining = Math.max(0, threshold - clickCount);
      var shouldBlink = clicksRemaining === 0;

      this.log('[AdManager] 剩余点击次数:', clicksRemaining, '是否闪烁:', shouldBlink);

      pages.forEach(function(page, index) {
        if (page && typeof page.updateAdClicksRemaining === 'function') {
          try {
            // 🔧 修复:立即同步更新,避免异步竞态
            page.updateAdClicksRemaining();
            self.log('[AdManager] 页面', index, '广告显示已更新');
          } catch (updateError) {
            self.log('[AdManager] 页面', index, '更新失败:', updateError);
          }
        }

        // 🚀 新增:如果剩余次数为0,触发卡片闪烁
        if (shouldBlink && page && typeof page.startSupportCardBlink === 'function') {
          try {
            page.startSupportCardBlink();
            self.log('[AdManager] 页面', index, '激励卡片开始闪烁');
          } catch (blinkError) {
            self.log('[AdManager] 页面', index, '闪烁触发失败:', blinkError);
          }
        }
      });

      this.log('[AdManager] 所有页面广告显示更新完成');
    } catch (e) {
      this.log('[AdManager] 通知页面更新时出错:', e);
    }
  },

  // 🚀 新增:停止所有页面的卡片闪烁
  stopAllCardsBlink: function() {
    try {
      var pages = getCurrentPages();
      var self = this;

      this.log('[AdManager] 停止所有页面卡片闪烁');

      pages.forEach(function(page, index) {
        if (page && typeof page.stopSupportCardBlink === 'function') {
          try {
            page.stopSupportCardBlink();
            self.log('[AdManager] 页面', index, '卡片闪烁已停止');
          } catch (error) {
            self.log('[AdManager] 页面', index, '停止闪烁失败:', error);
          }
        }
      });
    } catch (e) {
      this.log('[AdManager] 停止卡片闪烁时出错:', e);
    }
  },

  // 获取统计信息
  getStatistics: function() {
    // 🔧 修复：每次都实时计算，确保数据最新
    var clickCount = this.getClickCount();
    var nextThreshold = this.getNextThreshold();
    var clicksUntilNext = Math.max(0, nextThreshold - clickCount);
    
    return {
      clickCount: clickCount,
      nextThreshold: nextThreshold,
      totalAdsWatched: this.getTotalAdsWatched(),
      lastAdTime: wx.getStorageSync(this.config.storageKeys.lastAdTime) || 0,
      clicksUntilNext: clicksUntilNext,
      currentAdUnitId: this.getCurrentAdUnitId(),
      currentAdIndex: this.config.currentAdIndex,
      totalAdUnits: this.config.adUnitIds.length,
      // 🔧 新增：添加时间戳，便于调试数据同步问题
      timestamp: Date.now()
    };
  },

  // 重置统计数据
  resetStatistics: function() {
    var keys = this.config.storageKeys;
    Object.keys(keys).forEach((key) => {
      wx.removeStorageSync(keys[key]);
    });
    this.config.currentAdIndex = 0;
    this.log('[AdManager] 统计数据已重置');
  },

  // 手动播放广告（调试用）
  playTestAd: function() {
    this.log('[AdManager] 手动播放测试广告');
    this.showVideoAd();
  },

  // 调试信息
  debugInfo: function() {
    var stats = this.getStatistics();
    
    console.log('=== AdManager 调试信息 ===');
    console.log('初始化状态:', this.isInitialized);
    console.log('广告实例:', !!this.videoAd);
    console.log('当前广告ID:', stats.currentAdUnitId);
    console.log('广告位索引:', stats.currentAdIndex + '/' + stats.totalAdUnits);
    console.log('点击统计:', stats.clickCount);
    console.log('触发阈值:', stats.nextThreshold);
    console.log('剩余点击:', stats.clicksUntilNext);
    console.log('观看总数:', stats.totalAdsWatched);
    console.log('支持广告API:', !!wx.createRewardedVideoAd);
    console.log('=== 调试信息结束 ===');
    
    return stats;
  },

  // 日志输出
  log: function() {
    if (this.debugMode || typeof __wxConfig !== 'undefined') {
      console.log.apply(console, arguments);
    }
  }
};

module.exports = AdManager;