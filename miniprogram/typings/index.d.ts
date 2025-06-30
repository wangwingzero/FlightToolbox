/// <reference path="./types/index.d.ts" />

interface IAppOption {
  globalData: {
    userInfo?: WechatMiniprogram.UserInfo,
    theme: string,
    dataPreloadStarted: boolean,
    dataPreloadCompleted: boolean
  }
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback,
  preloadQueryData(): Promise<void>,
  isDataPreloaded(): boolean,
  getPreloadStatus(): {
    started: boolean,
    completed: boolean,
    cacheStatus: any
  }
}