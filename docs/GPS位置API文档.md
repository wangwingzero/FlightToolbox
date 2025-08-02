### `wx.getLocation(Object object)`

# wx.getLocation(Object object)

## 功能描述
获取当前的地理位置、速度。

## 权限要求
- 需要用户授权 `scope.userLocation`。
- 支持 Promise 风格调用。
- 需在 `app.json` 中声明 `requiredPrivateInfos`。
- 使用前需要在小程序管理后台申请开通接口权限。

## 参数 (Object object)

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|:---|:---|:---|:---|:---|
| `type` | string | `wgs84` | 否 | `wgs84` 返回 GPS 坐标，`gcj02` 返回可用于 `wx.openLocation` 的坐标。 |
| `altitude` | boolean | `false` | 否 | 传入 `true` 会返回高度信息，但会减慢接口返回速度。 |
| `isHighAccuracy` | boolean | `false` | 否 | 开启高精度定位。 |
| `highAccuracyExpireTime`| number | | 否 | 高精度定位超时时间(ms)，需在 `isHighAccuracy` 为 `true` 时生效，建议设置为 3000ms 以上。 |
| `success` | function | | 否 | 接口调用成功的回调函数。 |
| `fail` | function | | 否 | 接口调用失败的回调函数。 |
| `complete` | function | | 否 | 接口调用结束的回调函数。 |

## success 回调参数 (Object res)

| 属性 | 类型 | 说明 |
|:---|:---|:---|
| `latitude` | number | 纬度，范围为-90~90，负数表示南纬。 |
| `longitude` | number | 经度，范围为-180~180，负数表示西经。 |
| `speed` | number | 速度，单位 m/s。 |
| `accuracy` | number | 位置的精确度，单位 m。 |
| `altitude` | number | 高度，单位 m (当 `altitude` 参数为 `true` 时返回)。 |
| `verticalAccuracy` | number | 垂直精度，单位 m (Android 无法获取，返回 0；当 `altitude` 参数为 `true` 时返回)。 |
| `horizontalAccuracy` | number | 水平精度，单位 m。 |

## fail 回调错误码

| errMsg | 说明 |
|:---|:---|
| `getLocation:fail auth deny` | 用户拒绝授权。 |
| `getLocation:fail:ERROR_NOCELL&WIFI_LOCATIONSWITCHOFF` | 手机定位服务未开启。 |
| `getLocation:fail system permission denied` | 系统权限未开启（如 iOS 的定位权限）。 |
| `getLocation:fail:timeout` | 获取位置超时。 |

## app.json 配置
```json
{
  "requiredPrivateInfos": ["getLocation"]
}
```

## 示例代码
```javascript
wx.getLocation({
  type: 'gcj02',
  altitude: true, // 请求返回高度信息
  isHighAccuracy: true,
  highAccuracyExpireTime: 5000,
  success (res) {
    console.log('纬度:', res.latitude)
    console.log('经度:', res.longitude)
    console.log('速度:', res.speed)
    console.log('精确度:', res.accuracy)
    console.log('高度:', res.altitude)
  },
  fail(err) {
    console.error('获取位置失败:', err)
  }
})
```

## 注意事项
### getLocation增加调用频率限制
- 当前小程序频繁调用wx.getLocation接口会导致用户手机电量消耗较快，请开发者改为使用持续定位接口wx.onLocationChange，该接口会固定频率回调，使用效果与跟频繁调用getLocation一致。
- 从基础库2.17.0版本起（预计发布时间2021.4.9），将对getLocation接口增加频率限制，包括：
- 在开发版或体验版中，30秒内调用getLocation，仅第一次有效，剩余返回与第一次定位相同的信息。
- 正式版中，为保证小程序正常运行同时不过度消耗用户电量，一定时间内（根据设备情况判断）调用getLocation，仅第一次会返回实时定位信息，剩余返回与第一次定位相同的信息

---

### `wx.chooseLocation(Object object)` (核验无误)

# wx.chooseLocation(Object object)

## 功能描述
打开地图选择位置。

## 权限要求
- 支持 Promise 风格调用。
- 自 2022 年 6 月 13 日起，**不再需要**用户授权 `scope.userLocation`。
- 需在 `app.json` 中声明 `requiredPrivateInfos`。
- 需要在小程序管理后台申请开通该接口权限。

## 参数 (Object object)

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|:---|:---|:---|:---|:---|
| `latitude` | number | | 否 | 目标地纬度，地图打开后将以此为中心。 |
| `longitude` | number | | 否 | 目标地经度，地图打开后将以此为中心。 |
| `success` | function | | 否 | 接口调用成功的回调函数。 |
| `fail` | function | | 否 | 接口调用失败的回调函数。 |
| `complete` | function | | 否 | 接口调用结束的回调函数。 |

## success 回调参数 (Object res)

| 属性 | 类型 | 说明 |
|:---|:---|:---|
| `name` | string | 位置名称。 |
| `address` | string | 详细地址 (在 Android 上可能返回空字符串)。 |
| `latitude` | number | 纬度，使用 `gcj02` 国测局坐标系。 |
| `longitude` | number | 经度，使用 `gcj02` 国测局坐标系。 |

## fail 回调错误码

| errMsg | 说明 |
|:---|:---|
| `chooseLocation:fail cancel` | 用户取消选择。 |
| `chooseLocation:fail auth deny` | 用户禁止了地理位置权限 (历史版本)。 |
| `chooseLocation:fail:auth denied` | 用户在授权弹窗中选择了"不允许"。 |

## app.json 配置
```json
{
  "requiredPrivateInfos": ["chooseLocation"]
}
```

## 示例代码```javascript
wx.chooseLocation({
  success: function(res) {
    console.log('位置名称:', res.name);
    console.log('详细地址:', res.address);
    console.log('纬度:', res.latitude);
    console.log('经度:', res.longitude);
  },
  fail: function(err) {
    console.error('选择位置失败:', err);
  }
})
```

## 注意事项
- `address` 字段在 iOS 上返回有效地址，但在部分 Android 设备上会返回空字符串。
- 开发者工具上调用该接口返回的是固定的模拟数据。
- 该接口仅对与地理位置强相关场景（如地图、出行等）的小程序开放。

---

### `wx.startLocationUpdate(Object object)` (核验无误)

# wx.startLocationUpdate(Object object)

**最低版本：2.8.0**

## 功能描述
开启小程序进入前台时接收位置消息。此接口开启后，需要配合 `wx.onLocationChange` 才能获取到位置信息。

## 权限要求
- 需要用户授权 `scope.userLocation`。
- 支持 Promise 风格调用。
- 需在 `app.json` 中声明 `requiredPrivateInfos`。

## 参数 (Object object)

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|:---|:---|:---|:---|:---|
| `type` | string | `wgs84` | 否 | `wgs84` 返回 GPS 坐标，`gcj02` 返回可用于 `wx.openLocation` 的坐标。 |
| `success` | function | | 否 | 接口调用成功的回调函数。 |
| `fail` | function | | 否 | 接口调用失败的回调函数。 |
| `complete` | function | | 否 | 接口调用结束的回调函数。 |

## fail 回调错误码

| errMsg | 说明 |
|:---|:---|
| `startLocationUpdate:fail:system permission denied` | 未授予小程序定位权限。 |
| `startLocationUpdate:fail:background permission denied` | 未开启后台定位权限。 |
| `startLocationUpdate:fail:is starting` | 重复调用，已处于持续定位状态。 |
| `startLocationUpdate:fail:not supported` | 暂不支持此接口。 |

## app.json 配置
自 2022 年 7 月 14 日后发布的小程序，若使用该接口，需要在 `app.json` 中进行声明：
```json
{
  "requiredPrivateInfos": ["startLocationUpdate"]
}
```

## 示例代码
```javascript
wx.startLocationUpdate({
  type: 'gcj02',
  success: (res) => {
    console.log('开启后台定位成功', res)
    // 开启成功后，可以接着监听位置变化
    wx.onLocationChange((location) => {
      console.log('监听到位置更新', location)
    })
  },
  fail: (res) => {
    console.log('开启后台定位失败', res.errMsg)
  }
})
```

## 注意事项
- **必须**与 `wx.onLocationChange` 配合使用来监听位置变化事件。
- 当用户离开小程序后（例如按 Home 键），此接口将停止工作，无法在后台持续定位。
- 微信 Windows 版和 Mac 版支持此接口。

---

### `wx.onLocationChange(function listener)` (核验无误)

# wx.onLocationChange(function callback)

**最低版本：2.8.1**

## 功能描述
监听实时地理位置变化事件，需配合 `wx.startLocationUpdate` 使用。

## 权限要求
- 需要用户授权 `scope.userLocation`。
- 需先调用 `wx.startLocationUpdate`。
- 需在 `app.json` 中声明 `requiredPrivateInfos`。

## 参数 (function callback)
回调函数将收到一个 Object 类型的参数 `res`，包含以下属性：

| 属性 | 类型 | 说明 | 最低版本 |
|:---|:---|:---|:---|
| `latitude` | number | 纬度，范围为-90~90，负数表示南纬。 | |
| `longitude` | number | 经度，范围为-180~180，负数表示西经。 | |
| `speed` | number | 速度，单位 m/s。 | |
| `accuracy` | number | 位置的精确度，单位 m。 | |
| `altitude` | number | 高度，单位 m。 | 1.2.0 |
| `verticalAccuracy` | number | 垂直精度，单位 m (Android 无法获取，返回 0)。 | 1.2.0 |
| `horizontalAccuracy` | number | 水平精度，单位 m。 | 1.2.0 |

## app.json 配置
此接口的权限声明依赖于 `startLocationUpdate`：
```json
{
  "requiredPrivateInfos": ["startLocationUpdate"]
}
```

## 配套 API
- `wx.startLocationUpdate()` - **(必须)** 开启位置更新。
- `wx.stopLocationUpdate()` - 关闭位置更新，停止监听。
- `wx.offLocationChange()` - 移除位置变化监听函数。

## 示例代码
```javascript
// 1. 必须先开启位置更新
wx.startLocationUpdate({
  success() {
    // 2. 开启成功后，监听位置变化
    wx.onLocationChange((res) => {
      console.log('位置变化:', res.latitude, res.longitude)
    })
  },
  fail(err) {
    console.error('开启位置更新失败:', err)
  }
})

// 在不需要时，取消监听
function stopWatch() {
  wx.stopLocationUpdate() // 停止更新
  wx.offLocationChange() // 取消监听
}
```

## 注意事项
- **必须先成功调用 `wx.startLocationUpdate()`** 才能使用此监听器。
- 适合需要频繁获取位置信息的场景（如导航），比循环调用 `wx.getLocation()` 更节能高效。
- 位置信息更新的频率由操作系统决定，通常在 1-3 秒之间。
- 当用户离开小程序后，监听会停止。
- 支持微信 Windows 版和 Mac 版。