/**
 * 应用全局配置
 * 包含广告、API等配置信息
 */

var AppConfig = {
  // 广告配置
  ad: {
    // 激励视频广告单元ID列表（支持多个广告位轮换）
    rewardVideoIds: [
      'adunit-079d7e04aeba0625',  // 激励视频广告位1
      'adunit-190474fb7b19f51e',  // 激励视频广告位2
      'adunit-316c5630d7a1f9ef',  // 激励视频广告位3
      'adunit-fd97a5da07ddbd0c',  // 激励视频广告位4
      'adunit-a08edd4e60e36fd7',  // 激励视频广告位5
      'adunit-db1eff6d7d44a6d1'   // 激励视频广告位6
    ],
    // 当前使用的广告单元ID（默认使用第一个）
    rewardVideoId: 'adunit-079d7e04aeba0625',

    // 是否在开发环境显示测试广告
    useTestAd: false  // 改为false，使用真实广告
  },

  // 其他配置...
};

module.exports = AppConfig;