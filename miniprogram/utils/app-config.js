/**
 * 应用全局配置
 * 包含广告、API等配置信息
 */

var AppConfig = {
  // 广告配置
  // 所有广告位ID已获微信授权，严格使用以下配置
  ad: {
    // 插屏广告（Interstitial Ad）
    interstitialAdUnitId: 'adunit-1a29f1939a1c7864',  // 通用插屏广告，所有TabBar页面复用

    // 激励视频广告（Rewarded Video Ad）
    rewardedVideoAdUnitId: 'adunit-079d7e04aeba0625',  // 激励视频广告，观看后获得全天无广告

    // 横幅广告（Banner Ad）- 7个授权广告位
    bannerAdUnitIds: {
      banner1: 'adunit-2f5afef0d27dc863',  // 横幅1左图右文
      banner2: 'adunit-3b2e78fbdab16389',  // 横幅2左文右图
      banner3: 'adunit-4e68875624a88762',  // 横幅3单图
      bannerCard1: 'adunit-3a1bf3800fa937a2',  // 横幅卡片1-上图下文叠加B
      bannerCard2: 'adunit-d7a3b71f5ce0afca',  // 横幅卡片2-上图下文叠加A（当前使用：我的首页底部）
      bannerCard3: 'adunit-d6c8a55bd3cb4fd1',  // 横幅卡片3-上文下图拼接
    },

    // 格子广告（Grid Ad）
    gridAdUnitIds: {
      grid1: 'adunit-735d7d24032d4ca8',  // 格子1-多格子
    },

    // 广告刷新间隔（秒）
    adRefreshInterval: 30,

    // 插屏广告展示策略
    interstitialAdStrategy: {
      minInterval: 120000,  // 最小间隔：2分钟（TabBar页面优化）
      maxDailyCount: 20     // 每日最多展示20次
    }
  },

  // 其他配置...
};

module.exports = AppConfig;