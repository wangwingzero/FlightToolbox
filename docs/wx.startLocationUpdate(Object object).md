# wx.startLocationUpdate(Object object)

**最低版本：2.8.0**

## 功能描述
开启小程序进入前台时接收位置消息

## 权限要求
- 需要用户授权 `scope.userLocation`
- 支持Promise风格调用
- 需要在app.json中声明使用该接口

## 参数 (Object object)

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|:---|:---|:---|:---|:---|
| `type` | string | `wgs84` | 否 | `wgs84`返回gps坐标，`gcj02`返回可用于wx.openLocation的坐标 |
| `success` | function | | 否 | 接口调用成功的回调函数 |
| `fail` | function | | 否 | 接口调用失败的回调函数 |
| `complete` | function | | 否 | 接口调用结束的回调函数 |

## fail 回调错误码

| errMsg | 说明 |
|:---|:---|
| `startLocationUpdate:fail:system permission denied` | 未给予定位权限 |
| `startLocationUpdate:fail:background permission denied` | 未开启后台定位权限 |
| `startLocationUpdate:fail:is starting` | 正在持续定位 |
| `startLocationUpdate:fail:not supported` | 暂不支持此接口 |

## app.json配置

自2022年7月14日后发布的小程序，若使用该接口，需要在app.json中进行声明：

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
  },
  fail: (res) => {
    console.log('开启后台定位失败', res.errMsg)
  }
})
```

## 注意事项

- 需结合 `wx.onLocationChange` 监听位置变化事件
- 当用户离开小程序后，此接口无法调用
- 微信Windows版和Mac版支持