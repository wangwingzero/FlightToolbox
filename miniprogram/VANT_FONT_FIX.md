# Vant Weapp字体离线化修复说明

## 问题背景

FlightToolbox要求完全离线运行（飞行模式），但Vant Weapp组件库默认从阿里云CDN加载字体文件，导致以下错误：

```
Failed to load font http://at.alicdn.com/t/c/font_2553510_kfwma2yq1rs.woff2
net::ERR_CACHE_MISS

updateTextView:fail 32768 not found
updateTextView:fail 32818 not found
```

## 解决方案

### 1. 下载字体文件到本地

字体文件已保存在：
```
miniprogram/assets/fonts/vant-icon.woff2  (27KB)
miniprogram/assets/fonts/vant-icon.woff   (32KB)
```

### 2. 修改Vant组件字体引用

修改文件：`miniprogram/miniprogram_npm/@vant/weapp/icon/index.wxss`

**原代码**：
```css
@font-face{
  font-family:vant-icon;
  src:url(//at.alicdn.com/t/c/font_2553510_kfwma2yq1rs.woff2?t=1694918397022) format("woff2"),
      url(//at.alicdn.com/t/c/font_2553510_kfwma2yq1rs.woff?t=1694918397022) format("woff")
}
```

**修改后**：
```css
@font-face{
  font-family:vant-icon;
  src:url(/assets/fonts/vant-icon.woff2) format("woff2"),
      url(/assets/fonts/vant-icon.woff) format("woff")
}
```

## 验证步骤

1. 在微信开发者工具中开启**飞行模式模拟**
2. 刷新小程序
3. 进入以下页面验证van-tag组件显示正常：
   - 页面/计算工具（pages/flight-calculator/index）
   - 页面/我的首页（pages/home/index）
   - 页面/通信（pages/operations/index）
4. 检查控制台，确认**没有字体加载错误**

## ⚠️ 重要提示

**问题**：此修改位于 `miniprogram_npm` 目录中，运行 `npm install` 或 `npm update` 后会被覆盖。

**解决方案**：创建自动化脚本在npm构建后应用修复

### 自动化脚本（推荐）

创建 `miniprogram/scripts/fix-vant-fonts.js`：

```javascript
const fs = require('fs');
const path = require('path');

const iconWxssPath = path.join(__dirname, '../miniprogram_npm/@vant/weapp/icon/index.wxss');

function fixVantFonts() {
  try {
    let content = fs.readFileSync(iconWxssPath, 'utf8');

    // 替换字体URL
    const cdnPattern = /url\(\/\/at\.alicdn\.com\/t\/c\/font_2553510_kfwma2yq1rs\.woff2\?t=\d+\)/g;
    const cdnPatternWoff = /url\(\/\/at\.alicdn\.com\/t\/c\/font_2553510_kfwma2yq1rs\.woff\?t=\d+\)/g;

    content = content.replace(cdnPattern, 'url(/assets/fonts/vant-icon.woff2)');
    content = content.replace(cdnPatternWoff, 'url(/assets/fonts/vant-icon.woff)');

    fs.writeFileSync(iconWxssPath, content);
    console.log('✅ Vant字体路径已修复为本地路径');
  } catch (error) {
    console.error('❌ 修复Vant字体失败:', error);
  }
}

fixVantFonts();
```

在 `miniprogram/package.json` 中添加：
```json
{
  "scripts": {
    "postinstall": "node scripts/fix-vant-fonts.js"
  }
}
```

这样每次运行 `npm install` 后会自动应用修复。

## 影响范围

- **受益页面**：所有使用 `van-tag` 组件的页面（13个页面）
- **性能提升**：消除网络请求，加快首屏加载
- **离线保障**：完全符合飞行模式使用要求

## 相关文件

- 字体文件：`miniprogram/assets/fonts/vant-icon.*`
- 修改文件：`miniprogram/miniprogram_npm/@vant/weapp/icon/index.wxss`
- 受影响组件：`van-tag`, `van-icon`

## 参考资料

- [微信小程序离线优先设计](https://developers.weixin.qq.com/miniprogram/)
- [Vant Weapp官方文档](https://vant-contrib.gitee.io/vant-weapp/)
