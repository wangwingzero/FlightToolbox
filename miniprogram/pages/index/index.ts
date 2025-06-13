// index.ts
// 获取应用实例
const app = getApp<IAppOption>()
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

// 引入 Vant Toast 组件
import Toast from '@vant/weapp/toast/toast';

Component({
  data: {
    motto: 'Hello World',
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '',
    },
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
    // Vant 组件相关数据
    fieldValue: '',
    showPopupFlag: false,
  },
  methods: {
    // 事件处理函数
    bindViewTap() {
      wx.navigateTo({
        url: '../logs/logs',
      })
    },
    onChooseAvatar(e: any) {
      const { avatarUrl } = e.detail
      const { nickName } = this.data.userInfo
      this.setData({
        "userInfo.avatarUrl": avatarUrl,
        hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
      })
    },
    onInputChange(e: any) {
      const nickName = e.detail.value
      const { avatarUrl } = this.data.userInfo
      this.setData({
        "userInfo.nickName": nickName,
        hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
      })
    },
    getUserProfile() {
      // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
      wx.getUserProfile({
        desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: (res) => {
          console.log(res)
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    },
    // Vant 组件相关方法
    onFieldChange(event: any) {
      this.setData({
        fieldValue: event.detail
      })
      // 显示 Toast 提示
      Toast('输入内容：' + event.detail)
    },
    showPopup() {
      this.setData({
        showPopupFlag: true
      })
    },
    onClosePopup() {
      this.setData({
        showPopupFlag: false
      })
    },

    // 转发功能
    onShareAppMessage() {
      return {
        title: '飞行工具箱',
        desc: '专业的航空计算工具集合，包含常用换算、特殊计算、万能查询等功能',
        path: '/pages/index/index'
      }
    },

    // 分享到朋友圈
    onShareTimeline() {
      return {
        title: '飞行工具箱 - 专业航空工具集合',
        query: 'from=timeline'
      }
    }
  },
})
