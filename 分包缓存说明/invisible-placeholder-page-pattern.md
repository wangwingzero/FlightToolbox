# 隐形占位页面模式：分包加载的用户无感知方案

> 更新时间：2025-12-06
> 
> 本文档记录如何利用"隐形占位页面"实现分包数据加载，同时最大程度减少用户感知

---

## 📋 FlightToolbox 项目实施记录

**实施日期**: 2025-12-06

### 已改造的分包

#### 1. 绕机检查图片分包（5个）
- `packageWalkaroundImages1/pages/placeholder/`
- `packageWalkaroundImages2/pages/placeholder/`
- `packageWalkaroundImages3/pages/placeholder/`
- `packageWalkaroundImages4/pages/placeholder/`
- `packageWalkaroundImagesShared/pages/placeholder/`

#### 2. 音频分包（31个）
直接改造了各分包根目录的 `index` 页面为隐形占位页：
- `packageJapan/index`
- `packagePhilippines/index`
- `packageKorean/index`
- ... （共31个国家/地区音频分包）

### 调用方式
```javascript
// 传递 autoBack=true 参数，页面加载后自动返回
wx.navigateTo({ url: '/packageJapan/index?autoBack=true' });
```

### 相关文件改动
- `utils/audio-package-loader.js` - 添加 `?autoBack=true` 参数
- `packageWalkaround/pages/index/index.js` - 使用隐形占位页模式

---

## 一、问题背景

### 1.1 微信小程序分包限制

微信小程序存在以下限制：
- 主包大小限制（2MB）
- 分包大小限制（单个 2MB，总计 20MB）
- **跨分包 require 不支持**（开发者工具和真机表现不一致）

### 1.2 核心矛盾

**分包代码只有在"访问分包页面"时才会执行**，但：
- `wx.loadSubpackage` API：只下载分包，**不执行代码**
- `require.async`：在开发者工具中不稳定
- 真机调试模式：`wx.loadSubpackage` API 可能不可用

**唯一可靠的方式**：通过 `wx.navigateTo` 导航到分包页面，触发代码执行。

### 1.3 用户体验问题

导航到分包页面会导致：
- 页面闪烁
- 用户看到"加载中"等无关界面
- 体验割裂

---

## 二、解决方案：隐形占位页面

### 2.1 核心思路

创建一个**视觉上完全不可见**的占位页面：
1. 页面内容为空或隐藏
2. 导航栏隐藏
3. 加载完成后立即返回

### 2.2 实现步骤

#### Step 1：创建占位页面

**目录结构**：
```
packageC/
├── pages/
│   └── borders/           # 占位页面目录
│       ├── index.js       # 页面逻辑
│       ├── index.json     # 页面配置
│       ├── index.wxml     # 页面模板
│       └── index.wxss     # 页面样式（可选）
└── ...                    # 其他分包资源
```

#### Step 2：配置页面为"隐形"

**index.json** - 隐藏导航栏：
```json
{
  "navigationBarTitleText": "",
  "navigationStyle": "custom",
  "disableScroll": true
}
```

关键配置说明：
- `navigationBarTitleText: ""` - 清空标题
- `navigationStyle: "custom"` - 使用自定义导航栏（即不显示）
- `disableScroll: true` - 禁止滚动（防止意外交互）

**index.wxml** - 隐藏页面内容：
```xml
<!-- 分包数据加载页面 - 仅用于加载数据，无需显示内容 -->
<view style="display:none;"></view>
```

#### Step 3：页面逻辑实现

**index.js** - 加载数据并立即返回：
```javascript
const app = getApp();

// 在分包内部 require 数据（这是关键！）
const dataModules = {
  module1: require('../../data1.js'),
  module2: require('../../data2.js'),
  // ...
};

/**
 * 加载所有数据到 globalData
 */
function loadAllDataToGlobal() {
  if (!app.globalData) app.globalData = {};
  if (!app.globalData.dataCache) app.globalData.dataCache = {};
  
  let loadedCount = 0;
  for (const [key, module] of Object.entries(dataModules)) {
    try {
      app.globalData.dataCache[key] = module;
      loadedCount++;
    } catch (error) {
      console.warn(`加载 ${key} 失败:`, error);
    }
  }
  
  // 标记分包数据已加载（重要！）
  app.globalData.packageDataLoaded = true;
  
  return loadedCount;
}

Page({
  onLoad: function(options) {
    // 加载数据到 globalData
    const count = loadAllDataToGlobal();
    console.log(`分包数据加载完成: ${count} 个模块`);
    
    // 如果是自动触发的，立即返回
    if (options && options.autoBack === 'true') {
      wx.navigateBack({ 
        delta: 1,
        fail: () => {
          // 如果返回失败（页面栈只有一个页面），重定向到首页
          wx.reLaunch({ url: '/pages/index/index' });
        }
      });
    }
  }
});
```

#### Step 4：触发加载

**在需要数据的地方触发导航**：
```javascript
function triggerPackageLoad() {
  return new Promise((resolve) => {
    wx.navigateTo({
      url: '/packageC/pages/borders/index?autoBack=true',
      success: () => {
        console.log('分包页面导航成功');
      },
      fail: (err) => {
        console.log('导航失败:', err.errMsg);
      }
    });
    
    // 轮询检查数据是否加载完成
    const checkLoaded = () => {
      if (app.globalData.packageDataLoaded) {
        resolve(true);
        return;
      }
      setTimeout(checkLoaded, 100);
    };
    checkLoaded();
  });
}
```

---

## 三、进一步优化：永久缓存 + Storage

### 3.1 问题

即使页面隐形，**首次加载时仍会触发导航**。如何避免重复加载？

### 3.2 解决方案：带版本号的永久缓存

```javascript
// 缓存版本号（数据更新时递增）
const CACHE_VERSION = 'v15';
const STORAGE_KEY = `data_cache_${CACHE_VERSION}`;

/**
 * 从 Storage 恢复缓存
 */
function loadFromStorage() {
  try {
    const cached = wx.getStorageSync(STORAGE_KEY);
    if (cached && typeof cached === 'object') {
      let count = 0;
      for (const [key, data] of Object.entries(cached)) {
        if (data) {
          DATA_CACHE[key] = data;
          count++;
        }
      }
      return count;
    }
  } catch (e) {
    console.warn('Storage 读取失败:', e);
  }
  return 0;
}

/**
 * 保存缓存到 Storage
 */
function saveToStorage() {
  try {
    wx.setStorageSync(STORAGE_KEY, DATA_CACHE);
  } catch (e) {
    console.warn('Storage 保存失败:', e);
  }
}
```

### 3.3 加载优先级（关键！）

**正确的加载顺序**：
```javascript
async function loadData() {
  // 1️⃣ 优先从 Storage 恢复缓存
  const storageCount = loadFromStorage();
  if (storageCount >= EXPECTED_COUNT) {
    console.log('从 Storage 恢复完成，跳过分包加载');
    return; // ✅ 不触发导航！
  }
  
  // 2️⃣ 检查 globalData 是否已有数据
  if (app.globalData.packageDataLoaded) {
    // 从 globalData 加载...
    return;
  }
  
  // 3️⃣ 只有缓存不足时，才触发导航加载
  await triggerPackageLoad();
  
  // 4️⃣ 加载完成后保存到 Storage
  saveToStorage();
}
```

**⚠️ 常见错误**：把 Storage 检查放在导航触发之后，导致每次都触发导航。

---

## 四、最佳实践清单

### 4.1 页面配置
- [ ] `navigationStyle: "custom"` - 隐藏导航栏
- [ ] `navigationBarTitleText: ""` - 清空标题
- [ ] `disableScroll: true` - 禁止滚动

### 4.2 页面模板
- [ ] 使用 `display:none` 或空内容
- [ ] 不要有任何可见元素

### 4.3 返回逻辑
- [ ] 检查 `options.autoBack === 'true'`
- [ ] 立即调用 `wx.navigateBack`（不要加延迟）
- [ ] 处理返回失败的情况（使用 `wx.reLaunch`）

### 4.4 缓存策略
- [ ] 优先检查 Storage 缓存
- [ ] 缓存版本号控制
- [ ] 缓存足够时跳过导航

### 4.5 app.json 配置
```json
{
  "subPackages": [
    {
      "root": "packageC",
      "name": "borderPackage",
      "pages": ["pages/borders/index"]
    }
  ],
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["borderPackage"]
    }
  }
}
```

---

## 五、完整示例代码

### 5.1 占位页面完整代码

**packageC/pages/borders/index.json**
```json
{
  "navigationBarTitleText": "",
  "navigationStyle": "custom",
  "disableScroll": true
}
```

**packageC/pages/borders/index.wxml**
```xml
<!-- 分包数据加载页面 - 仅用于加载数据，无需显示内容 -->
<view style="display:none;"></view>
```

**packageC/pages/borders/index.js**
```javascript
const app = getApp();

// 分包内部加载数据模块
const borderModules = {
  prehistoric: require('../../prehistoric.geojson.js'),
  xia: require('../../xia.geojson.js'),
  // ... 其他数据
};

function loadAllBorderDataToGlobal() {
  if (!app.globalData) app.globalData = {};
  if (!app.globalData.borderCache) app.globalData.borderCache = {};
  
  let loadedCount = 0;
  for (const [key, module] of Object.entries(borderModules)) {
    try {
      app.globalData.borderCache[key] = module;
      loadedCount++;
    } catch (error) {
      console.warn(`加载 ${key} 失败:`, error);
    }
  }
  
  app.globalData.packageCBorderLoaded = true;
  return loadedCount;
}

Page({
  onLoad: function(options) {
    console.log('[PackageC] 疆域边界分包页面加载');
    
    const count = loadAllBorderDataToGlobal();
    
    if (options && options.autoBack === 'true') {
      wx.navigateBack({ 
        delta: 1,
        fail: () => {
          wx.reLaunch({ url: '/pages/index/index' });
        }
      });
    }
  }
});
```

### 5.2 数据管理器核心逻辑

```javascript
const CACHE_VERSION = 'v15';
const STORAGE_KEY = `border_cache_${CACHE_VERSION}`;

async function loadPackageCBorders() {
  if (packageCLoaded) return;
  
  // 1️⃣ 优先从 Storage 恢复
  const storageCount = loadFromStorage();
  if (storageCount >= 20) {
    console.log(`从 Storage 恢复 ${storageCount} 个时期，跳过分包加载`);
    packageCLoaded = true;
    return;
  }
  
  // 2️⃣ 检查 globalData
  if (isPackageCDataLoadedInGlobal()) {
    // 从 globalData 加载...
    saveToStorage();
    return;
  }
  
  // 3️⃣ 触发导航加载
  await triggerPackageCLoad();
  
  // 4️⃣ 再次检查并保存
  if (isPackageCDataLoadedInGlobal()) {
    // 从 globalData 加载...
    saveToStorage();
  }
}
```

---

## 六、调试技巧

### 6.1 查看是否触发导航
在控制台搜索关键日志：
```
[border-manager] 尝试通过导航触发分包加载
[border-manager] ✅ 从 Storage 恢复 XX 个时期，跳过分包加载
```

### 6.2 清除缓存测试
```javascript
// 在控制台执行
wx.removeStorageSync('border_cache_v15')
```

### 6.3 验证页面隐形
在真机预览时观察：
- 是否有页面闪烁
- 是否看到导航栏标题
- 返回是否立即执行

---

## 七、总结

| 问题 | 解决方案 |
|------|----------|
| 分包代码不执行 | 导航到占位页面触发执行 |
| 页面闪烁 | 隐藏导航栏 + 空内容 + 立即返回 |
| 重复加载 | Storage 永久缓存 + 版本号控制 |
| 加载顺序错误 | **先检查缓存，再触发导航** |

**核心原则**：用户不应该感知到分包加载过程，一切都应该在"后台"静默完成。
