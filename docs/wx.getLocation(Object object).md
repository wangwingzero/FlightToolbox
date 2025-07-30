# wx.getLocation(Object object)

## 功能描述
获取当前的地理位置、速度

## 权限要求
- 需要用户授权 `scope.userLocation`
- 支持Promise风格调用
- 需在app.json中声明使用该接口
- 需要申请开通接口权限

## 参数 (Object object)

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|:---|:---|:---|:---|:---|
| `type` | string | `wgs84` | 否 | `wgs84`返回GPS坐标，`gcj02`返回可用于wx.openLocation的坐标 |
| `altitude` | boolean | `false` | 否 | 传入true会返回高度信息，会减慢接口返回速度 |
| `isHighAccuracy` | boolean | `false` | 否 | 开启高精度定位 |
| `highAccuracyExpireTime` | number | | 否 | 高精度定位超时时间(ms)，该值3000ms以上高精度定位才有效果 |
| `success` | function | | 否 | 接口调用成功的回调函数 |
| `fail` | function | | 否 | 接口调用失败的回调函数 |
| `complete` | function | | 否 | 接口调用结束的回调函数 |

## success 回调参数 (Object res)

| 属性 | 类型 | 说明 |
|:---|:---|:---|
| `latitude` | number | 纬度，范围为-90~90，负数表示南纬 |
| `longitude` | number | 经度，范围为-180~180，负数表示西经 |
| `speed` | number | 速度，单位m/s |
| `accuracy` | number | 位置的精确度，10即与真实位置相差10m，越小越精确 |
| `altitude` | number | 高度，单位m |
| `verticalAccuracy` | number | 垂直精度，单位m（Android无法获取，返回0） |
| `horizontalAccuracy` | number | 水平精度，单位m |

## fail 回调错误码

| errMsg | 说明 |
|:---|:---|
| `getLocation:fail auth deny` | 用户拒绝授权 |
| `getLocation:fail:ERROR_NOCELL&WIFI_LOCATIONSWITCHOFF` | 定位开关未开启 |
| `getLocation:fail system permission denied` | 系统拒绝授权 |
| `getLocation:fail:timeout` | 获取位置超时 |

## 示例代码

```javascript
wx.getLocation({
  type: 'gcj02',
  isHighAccuracy: true,
  highAccuracyExpireTime: 5000,
  success (res) {
    const latitude = res.latitude
    const longitude = res.longitude
    const speed = res.speed
    const accuracy = res.accuracy
    console.log('位置:', latitude, longitude)
  },
  fail(err) {
    console.error('获取位置失败:', err)
  }
})
```

## 注意事项

- 从2.17.0版本开始，增加了调用频率限制
- 高频率调用会导致耗电，建议使用`wx.onLocationChange`持续定位
- 地图相关使用的坐标格式应为`gcj02`
- 开发者工具中定位使用IP定位，仅支持`gcj02`坐标
- 当用户离开小程序后，此接口无法调用