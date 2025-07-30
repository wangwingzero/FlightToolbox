# wx.chooseLocation(Object object)

## 功能描述
打开地图选择位置

## 权限要求
- 支持Promise风格调用
- 自2022年6月13日起，使用该接口不再需要用户授权 `scope.userLocation`
- 需要在app.json中声明使用该接口

## 参数 (Object object)

| 属性 | 类型 | 默认值 | 必填 | 说明 |
|:---|:---|:---|:---|:---|
| `latitude` | number | | 否 | 目标地纬度 |
| `longitude` | number | | 否 | 目标地经度 |
| `success` | function | | 否 | 接口调用成功的回调函数 |
| `fail` | function | | 否 | 接口调用失败的回调函数 |
| `complete` | function | | 否 | 接口调用结束的回调函数 |

## success 回调参数 (Object res)

| 属性 | 类型 | 说明 |
|:---|:---|:---|
| `name` | string | 位置名称 |
| `address` | string | 详细地址 |
| `latitude` | number | 纬度，使用 `gcj02` 国测局坐标系 |
| `longitude` | number | 经度，使用 `gcj02` 国测局坐标系 |

## fail 回调错误码

| errMsg | 说明 |
|:---|:---|
| `chooseLocation:fail cancel` | 用户取消选择 |
| `chooseLocation:fail auth deny` | 用户禁止了地理位置权限 |
| `chooseLocation:fail:auth denied` | 用户在授权弹窗中选择了"不允许" |

## 示例代码

```javascript
wx.chooseLocation({
  success: function(res) {
    console.log(res.name);      // 位置名称
    console.log(res.address);   // 详细地址
    console.log(res.latitude);  // 纬度
    console.log(res.longitude); // 经度
  },
  fail: function(err) {
    console.error('选择位置失败:', err);
  }
})
```

## app.json配置

需要在app.json中声明使用该接口：

```json
{
  "requiredPrivateInfos": ["chooseLocation"]
}
```

## 注意事项

- `address` 字段在iOS上有效，在Android上会返回空字符串
- 开发者工具上返回的res为固定值
- 需要在小程序管理后台申请开通该接口权限
- 暂只针对具备与地理位置强相关的使用场景的小程序开放