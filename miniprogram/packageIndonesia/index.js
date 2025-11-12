// miniprogram/packageIndonesia/index.js
// 印度尼西亚雅加达国际机场音频分包入口文件

/**
 * 分包基本信息
 * @description 印度尼西亚雅加达国际机场（Soekarno–Hatta International Airport, WIII）
 *              真实陆空通话录音，包含东航、南航等中国航空公司往返雅加达的完整飞行流程
 * @features
 *   - 完整的离场程序（DOLTA 2C 等标准仪表离场）
 *   - 详细的进场程序（Amboy 2M 进场）
 *   - RNP精密进近程序（跑道24）
 *   - 地面滑行程序（跑道穿越、机坪管制）
 *   - 时隙管理和限制点通过（DUDIS点限制）
 *   - 跨国管制移交（新加坡、雅加达区调）
 * @coverage
 *   - 东方航空5069/5070（上海-雅加达往返）
 *   - 南方航空8353/8354（广州-雅加达往返）
 */

module.exports = {
  name: 'indonesiaAudioPackage',
  description: '印度尼西亚雅加达国际机场真实陆空通话录音',
  version: '1.0.0',
  audioCount: 53,
  lastUpdated: '2025-10-27'
};

