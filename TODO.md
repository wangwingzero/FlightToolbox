# 微信小程序最小化广告集成方案 TODO 清单

## 📋 基于Context7最佳实践 - 离线用户友好型

### 🎯 用户需求分析

- **离线用户为主**：核心功能必须离线可用，广告不能影响离线体验
- **无服务器环境**：避免复杂的服务器端数据分析和管理
- **用户对广告敏感**：最小化干扰，优雅的用户体验

### 🎯 广告位信息

您的广告位ID配置：

- **横幅3单图**: `adunit-4e68875624a88762` ✅ 已开启
- **横幅2左文右图**: `adunit-3b2e78fbdab16389` ✅ 已开启
- **横幅1左图右文**: `adunit-2f5afef0d27dc863` ✅ 已开启
- **格子1-多格子**: `adunit-735d7d24032d4ca8` ✅ 已开启
- **横幅卡片3-上文下图拼接**: `adunit-d6c8a55bd3cb4fd1` ✅ 已开启
- **横幅卡片2-上图下文叠加A**: `adunit-d7a3b71f5ce0afca` ✅ 已开启
- **横幅卡片1-上图下文叠加B**: `adunit-3a1bf3800fa937a2` ✅ 已开启

---

## 🚀 最小化集成策略

### 💡 设计原则

1. **离线优先**：广告失败不影响核心功能
2. **最小干扰**：用户主动选择查看广告位置
3. **优雅降级**：网络不佳时自动隐藏广告
4. **无服务器**：纯客户端实现，无需后端支持

---

## 🚀 阶段一：核心广告组件 (最小实现)

### ✅ 1. 通用广告组件 (ad-template)

- [ ] **创建统一广告组件**

  - [ ] `components/ad-template/index.js`
  - [ ] `components/ad-template/index.wxml`
  - [ ] `components/ad-template/index.wxss`
  - [ ] `components/ad-template/index.json`
- [ ] **最小化实现** (基于官方文档)

  ```xml
  <!-- 基础组件结构 - 支持多种广告类型 -->
  <view class="ad-container" wx:if="{{ showAd && !adError }}">
    <!-- 原生模板广告 (主要使用) -->
    <ad-custom 
      wx:if="{{ adType === 'custom' }}"
      unit-id="{{ unitId }}"
      bindload="onAdLoad"
      binderror="onAdError"
      bindclose="onAdClose"
      bindhide="onAdHide"
      ad-intervals="{{ adIntervals }}"
    />

    <!-- Banner广告 (备用) -->
    <ad 
      wx:elif="{{ adType === 'banner' }}"
      unit-id="{{ unitId }}"
      bindload="onAdLoad"
      binderror="onAdError"
    />

    <!-- 加载状态 -->
    <view wx:else class="ad-loading">
      <text>广告加载中...</text>
    </view>
  </view>

  <!-- 优雅降级：广告失败时显示空白 -->
  <view wx:elif="{{ adError }}" class="ad-placeholder"></view>
  ```
- [ ] **样式设计** (Context7移动端最佳实践)

  ```css
  /* 最小化干扰设计 */
  .ad-container {
    width: 100%;
    margin: 20rpx 0;
    border-radius: 12rpx;
    overflow: hidden;
    background: #f8f9fa;
    transition: opacity 0.3s ease;
  }

  .ad-loading {
    height: 120rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    font-size: 24rpx;
  }

  .ad-placeholder {
    height: 0; /* 失败时不占用空间 */
    opacity: 0;
  }

  /* 广告容器淡入效果 */
  .ad-container.loaded {
    opacity: 1;
  }
  ```
- [ ] **智能逻辑** (离线友好)

  ```javascript
  Component({
    properties: {
      unitId: {
        type: String,
        value: 'adunit-4e68875624a88762' // 默认横幅3单图
      },
      adType: {
        type: String,
        value: 'custom' // 优先使用原生模板
      },
      adIntervals: {
        type: Number,
        value: 60 // 60秒刷新，减少频繁请求
      }
    },

    data: {
      showAd: false,
      adError: false,
      adLoaded: false
    },

    lifetimes: {
      attached() {
        this.checkNetworkAndShowAd();
      }
    },

    methods: {
      // 检查网络状态决定是否显示广告
      checkNetworkAndShowAd() {
        wx.getNetworkType({
          success: (res) => {
            const networkType = res.networkType;
            // 只在有网络时显示广告
            if (networkType !== 'none') {
              this.setData({ showAd: true });
            }
          },
          fail: () => {
            // 网络检查失败，不显示广告
            console.log('网络检查失败，跳过广告显示');
          }
        });
      },

      onAdLoad() {
        console.log('广告加载成功');
        this.setData({ 
          adLoaded: true, 
          adError: false 
        });
        this.triggerEvent('adload');
      },

      onAdError(err) {
        console.log('广告加载失败，优雅降级', err);
        this.setData({ 
          adError: true, 
          showAd: false 
        });
        this.triggerEvent('aderror', err);
      },

      onAdClose() {
        console.log('用户关闭广告');
        this.setData({ showAd: false });
        this.triggerEvent('adclose');
      },

      onAdHide() {
        console.log('广告被隐藏');
        this.triggerEvent('adhide');
      }
    }
  });
  ```

---

## 🚀 阶段二：智能广告管理器 (无服务器)

### ✅ 2. 本地广告管理器

- [ ] **创建本地管理器**

  - [ ] `utils/ad-manager.js`
- [ ] **本地智能策略** (基于Context7用户体验原则)

  ```javascript
  class AdManager {
    constructor() {
      this.adUnits = [
        { id: 'adunit-4e68875624a88762', type: 'custom', priority: 1 },
        { id: 'adunit-3b2e78fbdab16389', type: 'custom', priority: 2 },
        { id: 'adunit-2f5afef0d27dc863', type: 'custom', priority: 3 },
        { id: 'adunit-735d7d24032d4ca8', type: 'custom', priority: 4 }
      ];
      this.adHistory = this.getAdHistory();
      this.userPreferences = this.getUserPreferences();
    }

    // 获取最适合的广告单元
    getBestAdUnit(context = 'default') {
      // 检查网络状态
      if (!this.isNetworkAvailable()) {
        return null;
      }

      // 检查用户偏好 (用户可以选择减少广告)
      if (this.userPreferences.reduceAds) {
        return this.getReducedAdUnit();
      }

      // 基于上下文选择广告
      return this.selectAdByContext(context);
    }

    // 检查网络可用性
    isNetworkAvailable() {
      try {
        const networkType = wx.getStorageSync('lastNetworkType') || 'unknown';
        return networkType !== 'none';
      } catch (e) {
        return false; // 网络检查失败，不显示广告
      }
    }

    // 基于上下文选择广告
    selectAdByContext(context) {
      const contextMap = {
        'list': this.adUnits[0], // 列表页面 - 横幅3单图
        'detail': this.adUnits[1], // 详情页面 - 横幅2左文右图
        'tool': this.adUnits[2], // 工具页面 - 横幅1左图右文
        'default': this.adUnits[0]
      };

      return contextMap[context] || contextMap['default'];
    }

    // 减少广告模式 (用户敏感友好)
    getReducedAdUnit() {
      const lastShown = this.getLastAdTime();
      const now = Date.now();
      const interval = 10 * 60 * 1000; // 10分钟间隔

      if (now - lastShown < interval) {
        return null; // 间隔时间未到，不显示广告
      }

      return this.adUnits[0]; // 只显示优先级最高的广告
    }

    // 记录广告显示
    recordAdShown(unitId) {
      const history = this.getAdHistory();
      history.push({
        unitId,
        timestamp: Date.now(),
        context: 'shown'
      });

      // 只保留最近50条记录
      if (history.length > 50) {
        history.splice(0, history.length - 50);
      }

      wx.setStorageSync('adHistory', history);
      wx.setStorageSync('lastAdTime', Date.now());
    }

    // 获取广告历史
    getAdHistory() {
      try {
        return wx.getStorageSync('adHistory') || [];
      } catch (e) {
        return [];
      }
    }

    // 获取用户偏好
    getUserPreferences() {
      try {
        return wx.getStorageSync('userAdPreferences') || {
          reduceAds: false,
          allowPersonalized: true
        };
      } catch (e) {
        return { reduceAds: false, allowPersonalized: true };
      }
    }

    // 更新用户偏好
    updateUserPreferences(preferences) {
      wx.setStorageSync('userAdPreferences', preferences);
      this.userPreferences = preferences;
    }

    // 获取最后广告显示时间
    getLastAdTime() {
      try {
        return wx.getStorageSync('lastAdTime') || 0;
      } catch (e) {
        return 0;
      }
    }
  }

  module.exports = AdManager;
  ```

### ✅ 3. 广告预加载 (最小化版本)

- [ ] **简化预加载策略**
  ```javascript
  // utils/ad-preloader.js - 基于官方wx.preloadAd接口
  class AdPreloader {
    static preloadCoreAds() {
      // 检查基础库版本
      if (!this.isSupportPreload()) {
        console.log('当前版本不支持广告预加载');
        return;
      }

      // 只预加载核心广告位 (减少资源消耗)
      wx.preloadAd([
        {
          unitId: 'adunit-4e68875624a88762', // 主要广告位
          type: 'custom'
        },
        {
          unitId: 'adunit-3b2e78fbdab16389', // 备用广告位
          type: 'custom'
        }
      ]);
    }

    static isSupportPreload() {
      const systemInfo = wx.getSystemInfoSync();
      const version = systemInfo.SDKVersion;
      return this.compareVersion(version, '2.14.1') >= 0;
    }

    static compareVersion(v1, v2) {
      const arr1 = v1.split('.');
      const arr2 = v2.split('.');
      const length = Math.max(arr1.length, arr2.length);

      for (let i = 0; i < length; i++) {
        const num1 = parseInt(arr1[i] || 0);
        const num2 = parseInt(arr2[i] || 0);
        if (num1 > num2) return 1;
        if (num1 < num2) return -1;
      }
      return 0;
    }
  }

  module.exports = AdPreloader;
  ```

---

## 🚀 阶段三：页面级集成 (最小干扰)

### ✅ 4. 主要页面广告集成

- [ ] **实用工具页面** (`pages/others/index`)

  ```xml
  <!-- 在页面底部适当位置显示广告 -->
  <view class="page-content">
    <!-- 原有内容 -->

    <!-- 广告区域 - 用户友好位置 -->
    <view class="ad-section" wx:if="{{ showAd }}">
      <text class="ad-label">广告</text>
      <ad-template 
        unit-id="{{ adUnitId }}"
        ad-type="custom"
        bind:adload="onAdLoad"
        bind:aderror="onAdError"
      />
    </view>
  </view>
  ```
- [ ] **万能查询页面** (`pages/abbreviations/index`)

  ```xml
  <!-- 在搜索结果下方显示广告 -->
  <view wx:if="{{ filteredList.length > 0 && showAd }}">
    <view class="search-ad-container">
      <ad-template 
        unit-id="{{ adUnitId }}"
        context="list"
        bind:adload="onAdLoad"
      />
    </view>
  </view>
  ```
- [ ] **页面逻辑优化**

  ```javascript
  // 在页面JS中添加
  const AdManager = require('../../utils/ad-manager');

  Page({
    data: {
      showAd: false,
      adUnitId: ''
    },

    onLoad() {
      this.initAd();
    },

    initAd() {
      const adManager = new AdManager();
      const adUnit = adManager.getBestAdUnit('tool'); // 根据页面类型

      if (adUnit) {
        this.setData({
          showAd: true,
          adUnitId: adUnit.id
        });
      }
    },

    onAdLoad() {
      console.log('页面广告加载成功');
      const adManager = new AdManager();
      adManager.recordAdShown(this.data.adUnitId);
    },

    onAdError() {
      console.log('页面广告加载失败，隐藏广告区域');
      this.setData({ showAd: false });
    }
  });
  ```

---

## 🚀 阶段四：用户控制功能

### ✅ 5. 广告偏好设置

- [ ] **在实用工具页面添加广告设置**

  ```xml
  <!-- 在others页面添加用户控制选项 -->
  <van-cell-group title="广告设置">
    <van-cell 
      title="减少广告显示" 
      label="开启后将减少广告展示频率"
    >
      <van-switch 
        checked="{{ adPreferences.reduceAds }}"
        bind:change="onReduceAdsChange"
      />
    </van-cell>
  </van-cell-group>
  ```
- [ ] **用户控制逻辑**

  ```javascript
  // 在others页面添加
  onReduceAdsChange(event) {
    const reduceAds = event.detail;
    const adManager = new AdManager();

    adManager.updateUserPreferences({
      ...adManager.getUserPreferences(),
      reduceAds
    });

    this.setData({
      'adPreferences.reduceAds': reduceAds
    });

    wx.showToast({
      title: reduceAds ? '已减少广告显示' : '已恢复正常显示',
      icon: 'success'
    });
  }
  ```

### ✅ 6. 广告状态监控 (开发调试)

- [ ] **在实用工具页面添加广告状态查看**
  ```xml
  <!-- 开发模式下显示广告状态 -->
  <van-cell-group title="广告状态" wx:if="{{ isDev }}">
    <van-cell 
      title="广告加载状态" 
      value="{{ adStatus.loaded ? '正常' : '失败' }}"
    />
    <van-cell 
      title="最后显示时间" 
      value="{{ adStatus.lastShown }}"
    />
    <van-cell 
      title="显示次数" 
      value="{{ adStatus.count }}"
    />
  </van-cell-group>
  ```

---

## 🚀 阶段五：性能优化

### ✅ 7. 网络状态监听

- [ ] **在app.js中添加网络监听**
  ```javascript
  // app.js
  const AdPreloader = require('./utils/ad-preloader');

  App({
    onLaunch() {
      // 监听网络状态变化
      wx.onNetworkStatusChange((res) => {
        wx.setStorageSync('lastNetworkType', res.networkType);

        if (res.isConnected && res.networkType !== 'none') {
          // 网络恢复时预加载广告
          AdPreloader.preloadCoreAds();
        }
      });

      // 应用启动时预加载
      AdPreloader.preloadCoreAds();
    }
  });
  ```

### ✅ 8. 内存优化

- [ ] **广告组件自动清理**
  ```javascript
  // 在ad-template组件中添加
  lifetimes: {
    detached() {
      // 组件销毁时清理定时器
      if (this.adTimer) {
        clearInterval(this.adTimer);
      }
    }
  }
  ```

---

## 🚀 阶段六：测试与上线

### ✅ 9. 测试清单

- [ ] **功能测试**

  - [ ] 有网络环境下广告正常显示
  - [ ] 无网络环境下广告优雅隐藏
  - [ ] 用户设置"减少广告"后生效
  - [ ] 广告加载失败时不影响页面功能
  - [ ] 广告预加载在支持的版本上正常工作
- [ ] **性能测试**

  - [ ] 页面加载速度不受广告影响
  - [ ] 内存使用正常，无泄漏
  - [ ] 离线功能完全不受影响

### ✅ 10. 配置更新

- [ ] **更新页面配置**
  ```json
  // 需要显示广告的页面的index.json
  {
    "usingComponents": {
      "ad-template": "../../components/ad-template/index"
    }
  }
  ```

---

## 📊 成功指标

### 技术指标

- [ ] 离线功能100%可用
- [ ] 广告加载失败不影响核心功能
- [ ] 用户可控制广告显示频率
- [ ] 页面加载性能不下降

### 用户体验指标

- [ ] 广告显示不干扰核心操作流程
- [ ] 用户投诉率保持低水平
- [ ] 核心功能使用率不下降

---

## 🔧 最小化技术栈

### 必需组件

- **ad-custom**: 原生模板广告 (主要)
- **ad**: Banner广告 (备用)
- **本地存储**: 用户偏好和广告历史

### 可选功能

- **wx.preloadAd**: 广告预加载 (基础库2.14.1+)
- **网络状态监听**: 智能显示控制

---

## 📝 最终注意事项

### 用户友好原则

1. **离线优先**：广告永远不能影响离线功能
2. **用户控制**：提供减少广告的选项
3. **优雅降级**：广告失败时无感知
4. **最小干扰**：广告位置和时机要合理

### 技术实现原则

1. **无服务器依赖**：纯客户端实现
2. **本地数据管理**：使用微信小程序本地存储
3. **网络检测**：根据网络状态智能调整
4. **版本兼容**：低版本优雅降级

---

**🎯 基于Context7最佳实践，这套方案专为离线用户和广告敏感用户设计，确保最小化干扰的同时实现必要的商业化需求！**
