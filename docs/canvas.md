# canvas

> 基础库 1.0.0 开始支持，低版本需做兼容处理。
>
> **微信 Windows 版**：支持
> **微信 Mac 版**：支持
> **微信鸿蒙OS 版**：支持
>
> **相关文档**: [画布指南](https://developers.weixin.qq.com/miniprogram/dev/framework/canvas/canvas-guide.html)、[Canvas 接口](https://developers.weixin.qq.com/miniprogram/dev/api/canvas/createCanvasContext.html)、[旧版画布迁移指南](https://developers.weixin.qq.com/miniprogram/dev/framework/canvas/canvas-migrate.html)
>
> **渲染框架支持情况**：Skyline （使用最新Nightly 工具调试）、WebView

## 功能描述

画布。自版本 2.9.0 起，`canvas` 组件支持一套新的 Canvas 2D 接口（需要指定 `type` 属性），并支持同层渲染。原有的接口将不再维护。旧版本用户可以参考[旧版画布迁移指南](https://developers.weixin.qq.com/miniprogram/dev/framework/canvas/canvas-migrate.html)进行迁移。

## 属性说明

| 属性 | 类型 | 默认值 | 必填 | 说明 | 最低版本 |
| --- | --- | --- | --- | --- | --- |
| type | string | | 否 | 指定 canvas 类型，支持 `2d` (2.9.0) 和 `webgl` (2.7.0)。 | 2.7.0 |
| canvas-id | string | | 否 | canvas 组件的唯一标识符，若指定了 `type` 则无需再指定该属性。 | 1.0.0 |
| disable-scroll | boolean | false | 否 | 当在 canvas 中移动时且有绑定手势事件时，禁止屏幕滚动以及下拉刷新。 | 1.0.0 |
| bindtouchstart | eventhandle | | 否 | 手指触摸动作开始。 | 1.0.0 |
| bindtouchmove | eventhandle | | 否 | 手指触摸后移动。 | 1.0.0 |
| bindtouchend | eventhandle | | 否 | 手指触摸动作结束。 | 1.0.0 |
| bindtouchcancel | eventhandle | | 否 | 手指触摸动作被打断，如来电提醒，弹窗。 | 1.0.0 |
| bindlongtap | eventhandle | | 否 | 手指长按 500ms 之后触发，触发了长按事件后进行移动不会触发屏幕的滚动。 | 1.0.0 |
| binderror | eventhandle | | 否 | 当发生错误时触发 error 事件，detail = {errMsg}。 | 1.0.0 |

## Bug & Tip

*   `tip`: `canvas` 标签默认宽度 300px、高度 150px。
*   `tip`: 同一页面中的 `canvas-id` 不可重复，如果使用一个已经出现过的 `canvas-id`，该 `canvas` 标签对应的画布将被隐藏并不再正常工作。
*   `tip`: 请注意[原生组件使用限制](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/native-component.html)。
*   `tip`: 开发者工具中默认关闭了 GPU 硬件加速，可在开发者工具的设置中开启“硬件加速”提高 WebGL 的渲染性能。
*   `tip`: WebGL 支持通过 `getContext('webgl', { alpha: true })` 获取透明背景的画布。
*   `tip`: WebGL 暂不支持真机调试，建议使用真机预览。
*   `tip`: Canvas 2D（新接口）需要显式设置画布宽高，默认： 300\*150 ，最大： 1365\*1365。
*   `bug`: 避免设置过大的宽高，在安卓下会有 crash 的问题。
*   `tip`: iOS 暂不支持 `pointer-events`。
*   `tip`: 在mac 或windows 小程序下，若当前组件所在的页面或全局开启了 `enablePassiveEvent` 配置项，该内置组件可能会出现非预期表现（详情参考 `enablePassiveEvent` 文档）。
*   `tip`: 鸿蒙OS 下暂不支持外接纹理。

## Canvas 2D 示例代码

**canvas.wxml**
```xml
<canvas type="2d" id="myCanvas"></canvas>
```

**canvas.js**
```javascript
Page({
  onReady() {
    const query = wx.createSelectorQuery()
    query.select('#myCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')

        const dpr = wx.getSystemInfoSync().pixelRatio
        canvas.width = res[0].width * dpr
        canvas.height = res[0].height * dpr
        ctx.scale(dpr, dpr)

        ctx.fillRect(0, 0, 100, 100)
      })
  }
})
```

## WebGL 示例代码

**canvas.wxml**
```xml
<canvas type="webgl" id="myCanvas"></canvas>
```

**canvas.js**
```javascript
Page({
  onReady() {
    const query = wx.createSelectorQuery()
    query.select('#myCanvas').node().exec((res) => {
      const canvas = res[0].node
      const gl = canvas.getContext('webgl')
      gl.clearColor(1, 0, 1, 1)
      gl.clear(gl.COLOR_BUFFER_BIT)
    })
  }
})
```

## 示例代码（旧的接口）

**canvas.wxml**
```xml
<canvas style="width: 300px; height: 200px;" canvas-id="firstCanvas"></canvas>

<!-- 当使用绝对定位时，文档流后边的canvas 的显示层级高于前边的canvas -->
<canvas style="width: 400px; height: 500px;" canvas-id="secondCanvas"></canvas>

<!-- 因为canvas-id 与前一个canvas 重复，该canvas 不会显示，并会发送一个错误事件到AppService -->
<canvas style="width: 400px; height: 500px;" canvas-id="secondCanvas" binderror="canvasIdErrorCallback"></canvas>
```

**canvas.js**
```javascript
Page({
  canvasIdErrorCallback: function (e) {
    console.error(e.detail.errMsg)
  },
  onReady: function (e) {
    // 使用wx.createContext 获取绘图上下文context
    var context = wx.createCanvasContext('firstCanvas')

    context.setStrokeStyle("#00ff00")
    context.setLineWidth(5)
    context.rect(0, 0, 200, 200)
    context.stroke()

    context.setStrokeStyle("#ff0000")
    context.setLineWidth(2)
    context.moveTo(160, 100)
    context.arc(100, 100, 60, 0, 2 * Math.PI, true)
    context.moveTo(140, 100)
    context.arc(100, 100, 40, 0, Math.PI, false)
    context.moveTo(85, 80)
    context.arc(80, 80, 5, 0, 2 * Math.PI, true)
    context.moveTo(125, 80)
    context.arc(120, 80, 5, 0, 2 * Math.PI, true)
    context.stroke()

    context.draw()
  }
})
```