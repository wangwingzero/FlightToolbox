# wx.onLocationChange(function callback)

**最低版本：2.8.1**

## 功能描述
监听实时地理位置变化事件，需配合 `wx.startLocationUpdate` 使用

## 权限要求
- 需要用户授权 `scope.userLocation`
- 支持Windows版和Mac版微信
- 需要在app.json中声明使用该接口

## 参数 (function callback)

回调函数参数 (Object res)：

| 属性 | 类型 | 说明 | 最低版本 |
|:---|:---|:---|:---|
| `latitude` | number | 纬度，范围为-90~90，负数表示南纬 | |
| `longitude` | number | 经度，范围为-180~180，负数表示西经 | |
| `speed` | number | 速度，单位m/s | |
| `accuracy` | number | 位置的精确度，10即与真实位置相差10m，越小越精确 | |
| `altitude` | number | 高度，单位m | 1.2.0 |
| `verticalAccuracy` | number | 垂直精度，单位m（Android无法获取，返回0） | 1.2.0 |
| `horizontalAccuracy` | number | 水平精度，单位m | 1.2.0 |

## 示例代码

```javascript
// 必须先开启位置更新
wx.startLocationUpdate({
  success() {
    // 监听位置变化
    wx.onLocationChange((res) => {
      console.log('位置变化:', res.latitude, res.longitude)
      console.log('速度:', res.speed, 'm/s')
      console.log('精度:', res.accuracy, 'm')
    })
  },
  fail(err) {
    console.error('开启位置更新失败:', err)
  }
})
```

```javascript
// 取消监听
wx.offLocationChange()
```

## app.json配置

需要在app.json中声明使用该接口：

```json
{
  "requiredPrivateInfos": ["startLocationUpdate"]
}
```

## 配套API
- `wx.startLocationUpdate()` - 开启位置更新
- `wx.stopLocationUpdate()` - 关闭位置更新  
- `wx.offLocationChange()` - 取消监听位置变化

## 注意事项
- 必须先调用 `wx.startLocationUpdate()` 才能正常使用此监听器
- 适合需要频繁获取位置信息的场景，比单独调用 `wx.getLocation()` 更节能
- 当用户离开小程序后，此监听器会停止工作
- 位置变化的频率由系统决定，通常在1-3秒之间