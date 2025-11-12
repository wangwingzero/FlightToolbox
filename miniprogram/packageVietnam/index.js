// miniprogram/packageVietnam/index.js
// 越南胡志明/河内机场音频分包入口文件

/**
 * 分包基本信息
 * @description 越南胡志明市新山一国际机场 (Tan Son Nhat Intl, VVTS)
 *              河内内排国际机场 (Noi Bai Intl, VVNB)
 *              真实陆空通话录音，包含东航、南航、深航等中国航空公司往返越南的完整飞行流程
 * @features
 *   - 完整的离场程序（Kilo Departure, KADOM 2 等标准仪表离场）
 *   - 详细的进场程序（Hotel Arrival, Ringgu Transition）
 *   - ILS/RNP精密进近程序（跑道25L/25R, 07L）
 *   - 复飞程序（Go-around）及原因沟通
 *   - 天气绕飞许可（Weather Deviation）
 *   - 地面滑行程序（Follow-me Car, 跑道穿越）
 *   - 跨国管制移交（胡志明↔河内区调）
 * @coverage
 *   - 东方航空7261/7262（上海-胡志明往返）
 *   - 南方航空8473/A473（广州-胡志明往返）
 *   - 深圳航空8473/8474/872（深圳-胡志明往返）
 *   - 多家国际航空公司（韩亚、日航、新航等）
 */

module.exports = {
  name: 'vietnamAudioPackage',
  description: '越南胡志明/河内机场真实陆空通话录音',
  version: '1.0.0',
  audioCount: 115,
  lastUpdated: '2025-10-27'
};

