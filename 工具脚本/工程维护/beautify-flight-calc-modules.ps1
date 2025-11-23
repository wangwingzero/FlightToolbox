# 飞行计算工具子页面批量美化脚本
# 根据功能类型应用不同的颜色主题

# 设置UTF-8编码
chcp 65001 > $null
$PSDefaultParameterValues['Out-File:Encoding'] = 'utf8'

# 定义模块分类
$meteoModules = @('crosswind', 'pressure', 'temperature', 'isa')  # 天气类 - 橙色
$flightModules = @('descent', 'glideslope', 'gradient', 'turn')   # 飞行几何类 - 蓝色
$convertModules = @('distance', 'speed', 'weight')                # 单位换算类 - 绿色

# 基础路径
$basePath = "d:\FlightToolbox\miniprogram\packageO\flight-calc-modules"

# 通用样式模板 - 天气类（橙色）
$meteoStyles = @"
/* ========== 天气主题（橙色系）========== */

/* 页面容器 */
.container {
  min-height: 100vh;
  background: #F2F2F7;
  position: relative;
  overflow-x: hidden;
  padding: 0;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

/* 顶部渐变装饰 */
.container::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 200rpx;
  background: linear-gradient(180deg, rgba(255, 149, 0, 0.08) 0%, transparent 100%);
  pointer-events: none;
  z-index: 0;
}

/* 计算模块样式 */
.calculation-module {
  margin: 24rpx 32rpx;
  background: #FFFFFF;
  border-radius: 28rpx;
  overflow: hidden;
  box-shadow:
    0 2rpx 12rpx rgba(0, 0, 0, 0.06),
    0 1rpx 4rpx rgba(0, 0, 0, 0.04);
  position: relative;
  z-index: 10;
}

/* 输入区域样式 */
.input-section {
  padding: 36rpx 32rpx 24rpx 32rpx;
}

.input-group {
  margin-bottom: 28rpx;
}

.input-group:last-child {
  margin-bottom: 0;
}

.input-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #000000;
  margin-bottom: 14rpx;
  display: flex;
  align-items: center;
  letter-spacing: 0.2rpx;
}

.unit-label {
  font-size: 28rpx;
  color: #8E8E93;
  margin-right: 16rpx;
  font-weight: 500;
}

/* 按钮区域样式 */
.action-buttons {
  padding: 24rpx 32rpx 36rpx 32rpx;
  display: flex;
  gap: 20rpx;
  background: linear-gradient(180deg, rgba(242, 242, 247, 0) 0%, rgba(242, 242, 247, 0.5) 100%);
}

.action-buttons .van-button {
  flex: 1;
  height: 96rpx !important;
  border-radius: 20rpx !important;
  font-size: 30rpx;
  font-weight: 600;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.12);
}

.action-buttons .van-button--primary {
  background: linear-gradient(135deg, #FF9500 0%, #C76A00 100%) !important;
  border: none !important;
}

.action-buttons .van-button--default {
  background: #F2F2F7 !important;
  color: #000000 !important;
  border: none !important;
}

/* 结果区域样式 */
.result-section {
  margin-top: 0;
  padding: 36rpx 32rpx;
  background: linear-gradient(135deg, rgba(255, 149, 0, 0.06) 0%, rgba(255, 149, 0, 0.02) 100%);
  border-top: 1rpx solid rgba(0, 0, 0, 0.06);
}

.result-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #000000;
  margin-bottom: 28rpx;
  text-align: center;
  letter-spacing: 0.2rpx;
}

.result-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.result-item {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  text-align: center;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2rpx solid rgba(255, 149, 0, 0.1);
}

.result-label {
  font-size: 24rpx;
  color: #8E8E93;
  margin-bottom: 12rpx;
  font-weight: 500;
}

.result-value {
  font-size: 32rpx;
  font-weight: 700;
  color: #FF9500;
  word-break: break-word;
}

/* 广告容器样式 */
.ad-banner-container {
  position: relative;
  z-index: 10;
  padding: 24rpx 32rpx 40rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.ad-banner-container ad {
  width: 100%;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

/* 响应式适配 */
@media (max-width: 375px) {
  .calculation-module {
    margin: 20rpx 28rpx;
    border-radius: 24rpx;
  }

  .input-section {
    padding: 32rpx 28rpx 20rpx 28rpx;
  }

  .input-label {
    font-size: 26rpx;
    margin-bottom: 12rpx;
  }

  .action-buttons {
    padding: 20rpx 28rpx 32rpx 28rpx;
    gap: 16rpx;
  }

  .action-buttons .van-button {
    height: 88rpx !important;
    font-size: 28rpx;
  }

  .result-section {
    padding: 32rpx 28rpx;
  }

  .result-title {
    font-size: 30rpx;
    margin-bottom: 24rpx;
  }

  .result-grid {
    gap: 16rpx;
  }

  .result-item {
    padding: 20rpx;
    border-radius: 16rpx;
  }

  .result-label {
    font-size: 22rpx;
  }

  .result-value {
    font-size: 28rpx;
  }
}
"@

Write-Host "飞行计算工具子页面批量美化脚本"
Write-Host "================================"
Write-Host ""
Write-Host "本脚本将美化以下模块："
Write-Host "- 天气类（橙色）: $($meteoModules -join ', ')"
Write-Host "- 飞行几何类（蓝色）: $($flightModules -join ', ')"
Write-Host "- 单位换算类（绿色）: $($convertModules -join ', ')"
Write-Host ""

# 显示提示
Write-Host "提示: 由于模块较多，建议手动使用Cascade逐个美化。"
Write-Host "此脚本仅作为参考，展示天气类（橙色主题）的样式模板。"
Write-Host ""
Write-Host "天气类样式模板已准备完成。"
