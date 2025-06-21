// ad-template组件 - 离线友好的广告组件
Component({
  /**
   * 组件属性
   */
  properties: {
    // 广告单元ID
    unitId: {
      type: String,
      value: 'adunit-4e68875624a88762' // 默认横幅3单图
    },
    // 广告类型：custom(原生模板) | banner(横幅)
    adType: {
      type: String,
      value: 'custom' // 优先使用原生模板
    },
    // 广告刷新间隔（秒）
    adIntervals: {
      type: Number,
      value: 60 // 60秒刷新，减少频繁请求
    },
    // 上下文信息，用于选择合适的广告
    context: {
      type: String,
      value: 'default'
    }
  },

  /**
   * 组件数据
   */
  data: {
    showAd: false,      // 是否显示广告
    adError: false,     // 广告加载是否出错
    adLoaded: false,    // 广告是否加载成功
    networkType: 'none' // 网络类型
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached() {
      console.log('ad-template组件初始化', {
        unitId: this.properties.unitId,
        adType: this.properties.adType,
        context: this.properties.context
      });
      
      this.checkNetworkAndShowAd();
    },

    detached() {
      // 组件销毁时清理定时器
      if (this.adTimer) {
        clearInterval(this.adTimer);
        this.adTimer = null;
      }
      console.log('ad-template组件销毁，已清理资源');
    }
  },

  /**
   * 组件方法
   */
  methods: {
    /**
     * 检查网络状态并决定是否显示广告
     */
    checkNetworkAndShowAd() {
      wx.getNetworkType({
        success: (res) => {
          const networkType = res.networkType;
          console.log('网络状态检查:', networkType);
          
          this.setData({ networkType });
          
          // 只在有网络时显示广告
          if (networkType !== 'none') {
            this.setData({ showAd: true });
            console.log('网络可用，显示广告');
          } else {
            console.log('无网络连接，跳过广告显示');
          }
        },
        fail: (err) => {
          console.log('网络检查失败，跳过广告显示:', err);
          // 网络检查失败，保守处理，不显示广告
        }
      });
    },

    /**
     * 广告加载成功
     */
    onAdLoad(event) {
      console.log('广告加载成功:', {
        unitId: this.properties.unitId,
        adType: this.properties.adType
      });
      
      this.setData({ 
        adLoaded: true, 
        adError: false 
      });

      // 添加加载成功的样式类
      this.addLoadedClass();
      
      // 触发父组件事件
      this.triggerEvent('adload', {
        unitId: this.properties.unitId,
        adType: this.properties.adType,
        context: this.properties.context
      });
    },

    /**
     * 广告加载失败
     */
    onAdError(err) {
      console.log('广告加载失败，优雅降级:', {
        unitId: this.properties.unitId,
        error: err
      });
      
      this.setData({ 
        adError: true, 
        showAd: false,
        adLoaded: false
      });
      
      // 触发父组件事件
      this.triggerEvent('aderror', {
        unitId: this.properties.unitId,
        error: err,
        context: this.properties.context
      });
    },

    /**
     * 用户关闭广告
     */
    onAdClose(event) {
      console.log('用户关闭广告:', this.properties.unitId);
      
      this.setData({ showAd: false });
      
      // 触发父组件事件
      this.triggerEvent('adclose', {
        unitId: this.properties.unitId,
        context: this.properties.context
      });
    },

    /**
     * 添加加载成功的样式类
     */
    addLoadedClass() {
      try {
        // 🎯 基于Context7最佳实践：简化样式处理，避免复杂的DOM操作
        console.log('广告加载成功，容器样式已就绪');
        
        // 如果需要特殊样式处理，可以通过setData更新样式类
        this.setData({
          adLoadedClass: 'ad-loaded'
        });
      } catch (error) {
        console.log('样式更新失败，不影响广告显示:', error);
      }
    },

    /**
     * 手动刷新广告
     */
    refreshAd() {
      console.log('手动刷新广告');
      this.setData({
        showAd: false,
        adError: false,
        adLoaded: false
      });
      
      // 延迟重新显示，避免频繁刷新
      setTimeout(() => {
        this.checkNetworkAndShowAd();
      }, 1000);
    }
  }
}); 