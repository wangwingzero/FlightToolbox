# 新用户引导功能说明

## 功能概述

新用户引导功能为首次使用飞行工具箱的用户提供了友好的功能介绍，主要针对积分系统、签到、广告观看等核心功能进行引导。

## 主要特性

### 1. 智能触发
- 首次启动应用时自动显示
- 积分为0的用户会收到引导提示
- 支持手动重新查看引导

### 2. 交互式引导
- 高亮目标功能区域
- 箭头指向具体位置
- 支持直接体验功能
- 流畅的动画过渡

### 3. 引导步骤

#### 步骤1：积分系统介绍
- **目标位置**：积分显示区域 (`.points-display`)
- **说明**：介绍积分的作用和重要性
- **体验功能**：点击查看积分详情

#### 步骤2：每日签到
- **目标位置**：签到按钮 (`.signin-button`)
- **说明**：介绍每日签到获取积分的方法
- **体验功能**：直接进行签到操作

#### 步骤3：观看广告
- **目标位置**：观看广告按钮 (`.watch-ad-button`)
- **说明**：介绍通过观看视频广告快速获取积分
- **体验功能**：直接观看广告

#### 步骤4：积分规则
- **目标位置**：积分规则按钮 (`.points-rules-button`)
- **说明**：介绍如何查看详细的积分规则
- **体验功能**：打开积分规则页面

### 4. 奖励机制
- 完成引导后获得100积分奖励
- 只有首次完成引导的用户可获得奖励
- 奖励会立即到账并显示提示

## 技术实现

### 组件结构
```
components/user-guide/
├── index.js     # 组件逻辑
├── index.json   # 组件配置
├── index.wxml   # 组件模板
└── index.wxss   # 组件样式
```

### 核心功能
1. **位置计算**：自动计算目标元素位置并调整引导框位置
2. **响应式适配**：支持不同屏幕尺寸的适配
3. **深色模式**：支持深色模式下的样式适配
4. **动画效果**：流畅的高亮和过渡动画

### 数据存储
- `user_guide_completed`：是否已完成引导
- `app_first_launch`：是否为首次启动
- `new_user_reward_given`：是否已发放新用户奖励
- `guide_start_time`：引导开始时间

## 使用方法

### 在页面中集成
1. 在页面JSON中注册组件：
```json
{
  "usingComponents": {
    "user-guide": "../../components/user-guide/index"
  }
}
```

2. 在WXML中使用组件：
```xml
<user-guide 
  show="{{ showUserGuide }}"
  guide-type="{{ guideType }}"
  bind:complete="onGuideComplete"
  bind:hide="onGuideHide"
  bind:tryFeature="onGuideTryFeature">
</user-guide>
```

3. 在页面逻辑中处理事件：
```javascript
// 检查是否需要显示引导
checkUserGuide() {
  // 实现逻辑
}

// 引导完成回调
onGuideComplete(event) {
  // 处理完成事件
}
```

## 测试方法

### 开发环境测试
1. 在开发者工具中打开小程序
2. 点击页面底部版本号
3. 输入测试指令：
   - `reset_guide`：重置引导状态
   - `show_guide`：手动显示引导

### 真机测试
1. 清除小程序数据
2. 重新进入小程序
3. 应该会自动显示引导

## 自定义配置

### 修改引导步骤
在 `components/user-guide/index.js` 中修改 `guideSteps` 数组：

```javascript
guideSteps: [
  {
    id: 'custom_step',
    title: '自定义步骤',
    description: '步骤描述',
    icon: '🎯',
    targetSelector: '.custom-selector',
    position: 'bottom',
    content: '详细说明内容'
  }
]
```

### 修改样式
在 `components/user-guide/index.wxss` 中自定义样式：
- 修改引导卡片样式
- 调整动画效果
- 适配不同主题

## 注意事项

1. **性能优化**：引导组件只在需要时加载，避免影响页面性能
2. **用户体验**：支持跳过引导，不强制用户完成
3. **兼容性**：支持不同版本的微信小程序
4. **错误处理**：目标元素不存在时使用默认位置

## 未来扩展

1. **多语言支持**：支持国际化
2. **个性化引导**：根据用户行为定制引导内容
3. **数据分析**：收集引导完成率和用户反馈
4. **A/B测试**：测试不同引导方案的效果