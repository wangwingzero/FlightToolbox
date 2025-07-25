# 优雅ICAO通话术语卡片设计

## WXML 结构代码

```xml
<!-- 优雅的ICAO通话术语卡片 -->
<view class="elegant-icao-card">
  <!-- 卡片头部区域 -->
  <view class="card-header-elegant">
    <!-- 左侧优先级指示器 -->
    <view class="priority-indicators-left">
      <view wx:if="{{ item.isEmergency }}" class="priority-badge-elegant emergency">特情</view>
    </view>
    
    <!-- 右侧ICAO标签 -->
    <view class="icao-tag-container">
      <view class="icao-tag {{ item.type }}">
        <text class="icao-tag-icon">{{ item.type === 'emergency' ? '🚨' : '📻' }}</text>
        <text class="icao-tag-text">{{ item.type === 'emergency' ? '应急' : 'ICAO' }}</text>
      </view>
    </view>
  </view>
  
  <!-- 主要内容区域 -->
  <view class="card-main-content">
    <!-- 中文内容 -->
    <view class="chinese-content-elegant">
      <view class="content-label">中文</view>
      <view class="content-text">{{ item.chinese }}</view>
    </view>
    
    <!-- 英文内容 -->
    <view class="english-content-elegant">
      <view class="content-label">English</view>
      <view class="content-text">{{ item.english }}</view>
    </view>
  </view>
  
  <!-- 卡片底部 -->
  <view class="card-footer-elegant">
    <!-- 章节标签 -->
    <view class="chapter-tag">
      <text class="chapter-icon">📖</text>
      <text class="chapter-text">{{ item.category }}</text>
    </view>
    
    <!-- 操作按钮 -->
    <view class="action-buttons">
      <view class="action-btn copy-btn" bind:tap="copyContent" data-content="{{ item.chinese + ' / ' + item.english }}">
        <text class="action-icon">📋</text>
      </view>
      <view class="action-btn detail-btn" bind:tap="showDetail" data-item="{{ item }}">
        <text class="action-icon">👁️</text>
      </view>
    </view>
  </view>
  
  <!-- 精美装饰线 -->
  <view class="decoration-line"></view>
</view>
```

## WXSS 样式代码

```css
/* 优雅ICAO卡片主容器 */
.elegant-icao-card {
  position: relative;
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 24rpx;
  padding: 0;
  margin-bottom: 24rpx;
  box-shadow: 
    0 8rpx 25rpx rgba(15, 23, 42, 0.08),
    0 3rpx 6rpx rgba(15, 23, 42, 0.06);
  border: 1px solid rgba(226, 232, 240, 0.8);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.elegant-icao-card:active {
  transform: translateY(1rpx) scale(0.995);
  box-shadow: 
    0 4rpx 15rpx rgba(15, 23, 42, 0.12),
    0 2rpx 4rpx rgba(15, 23, 42, 0.08);
}

/* 卡片头部区域 */
.card-header-elegant {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24rpx 28rpx 0;
  position: relative;
}

.priority-indicators-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.priority-badge-elegant {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 600;
  letter-spacing: 0.5rpx;
}

.priority-badge-elegant.emergency {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #dc2626;
  border: 1px solid rgba(220, 38, 38, 0.2);
}

/* 右上角ICAO标签 */
.icao-tag-container {
  position: relative;
}

.icao-tag {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 10rpx 18rpx;
  border-radius: 50rpx;
  font-size: 24rpx;
  font-weight: 600;
  letter-spacing: 0.5rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 2;
}

.icao-tag.icao900 {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}

.icao-tag.emergency {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.icao-tag-icon {
  font-size: 26rpx;
  filter: drop-shadow(0 1rpx 2rpx rgba(0, 0, 0, 0.1));
}

.icao-tag-text {
  font-size: 24rpx;
  font-weight: 700;
  text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
}

/* 主要内容区域 */
.card-main-content {
  padding: 28rpx;
  position: relative;
}

.chinese-content-elegant,
.english-content-elegant {
  margin-bottom: 24rpx;
  position: relative;
}

.english-content-elegant {
  margin-bottom: 0;
}

.content-label {
  font-size: 22rpx;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 8rpx;
  text-transform: uppercase;
  letter-spacing: 1rpx;
}

.chinese-content-elegant .content-text {
  font-size: 34rpx;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.5;
  padding: 16rpx 20rpx;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 16rpx;
  border-left: 4rpx solid #3b82f6;
  position: relative;
}

.english-content-elegant .content-text {
  font-size: 30rpx;
  font-weight: 500;
  color: #475569;
  line-height: 1.4;
  padding: 16rpx 20rpx;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16rpx;
  border-left: 4rpx solid #64748b;
  font-style: italic;
  position: relative;
}

/* 卡片底部 */
.card-footer-elegant {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 28rpx 24rpx;
  border-top: 1px solid rgba(226, 232, 240, 0.6);
  margin-top: 4rpx;
  padding-top: 20rpx;
}

.chapter-tag {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 10rpx 16rpx;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 20rpx;
  border: 1px solid rgba(56, 189, 248, 0.2);
  max-width: 400rpx;
}

.chapter-icon {
  font-size: 24rpx;
}

.chapter-text {
  font-size: 24rpx;
  font-weight: 500;
  color: #0369a1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 12rpx;
}

.action-btn {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.copy-btn {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.copy-btn:active {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  transform: scale(0.9);
}

.detail-btn {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.detail-btn:active {
  background: linear-gradient(135deg, #fef0a8 0%, #fcd34d 100%);
  transform: scale(0.9);
}

.action-icon {
  font-size: 24rpx;
  filter: grayscale(0.2);
}

/* 装饰线 */
.decoration-line {
  position: absolute;
  bottom: 0;
  left: 28rpx;
  right: 28rpx;
  height: 3rpx;
  background: linear-gradient(90deg, 
    transparent 0%, 
    #3b82f6 20%, 
    #06b6d4 50%, 
    #3b82f6 80%, 
    transparent 100%);
  border-radius: 2rpx;
  opacity: 0.6;
}

/* 微交互动画 */
@keyframes subtle-pulse {
  0%, 100% { 
    box-shadow: 0 8rpx 25rpx rgba(15, 23, 42, 0.08);
  }
  50% { 
    box-shadow: 0 12rpx 30rpx rgba(15, 23, 42, 0.12);
  }
}

.elegant-icao-card:hover {
  animation: subtle-pulse 2s ease-in-out infinite;
}

/* 响应式适配 */
@media (max-width: 750rpx) {
  .card-main-content {
    padding: 24rpx;
  }
  
  .chinese-content-elegant .content-text {
    font-size: 32rpx;
  }
  
  .english-content-elegant .content-text {
    font-size: 28rpx;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .elegant-icao-card {
    background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
    border-color: rgba(148, 163, 184, 0.2);
  }
  
  .chinese-content-elegant .content-text {
    background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
    color: #f1f5f9;
  }
  
  .english-content-elegant .content-text {
    background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
    color: #d1d5db;
  }
}
```

## 设计亮点

### 1. 视觉层次优化
- **ICAO标签右上角定位**：采用绝对定位配合渐变背景
- **内容区域分层**：中英文内容使用不同的背景色和边框色区分
- **装饰线点缀**：底部渐变装饰线增加精致感

### 2. 交互体验提升
- **微交互动画**：点击缩放、悬停脉动效果
- **操作按钮优化**：复制和详情按钮采用渐变背景
- **视觉反馈**：所有可点击元素都有明确的视觉反馈

### 3. 品质细节
- **渐变背景**：卡片、标签、按钮都使用精心调制的渐变
- **阴影层次**：多层阴影营造景深感
- **字体层次**：不同内容使用不同字重和颜色
- **圆角统一**：所有圆角保持一致的设计语言

### 4. 微信小程序适配
- **rpx单位**：完美适配不同屏幕尺寸
- **触摸优化**：按钮大小符合小程序触摸规范
- **性能友好**：使用硬件加速的CSS属性
- **无障碍友好**：保持良好的对比度和可读性

这个设计既保持了原有的功能性，又大幅提升了视觉美观度和用户体验，符合现代移动应用的设计趋势。