/**
 * Cloudflare R2 配置
 *
 * 集中管理 R2 远程资源的配置和特性开关。
 * 开关关闭时，所有逻辑回到本地分包路径（零影响回滚）。
 *
 * ES5 only（微信小程序兼容性要求）
 */

var R2_BASE_URL = 'https://ccar.hudawang.cn';
var IMAGE_VERSION = 'v1';
var AUDIO_VERSION = 'v1';
var DATA_VERSION = 'v1';

var R2Config = {
  // ========== 特性开关 ==========
  // true = 从 R2 下载，false = 用本地分包（默认）
  useR2ForImages: true,
  useR2ForAudio: true,
  useR2ForData: true,

  // ========== URL 配置 ==========
  baseUrl: R2_BASE_URL,
  imageBaseUrl: R2_BASE_URL + '/walkaround/' + IMAGE_VERSION,
  audioBaseUrl: R2_BASE_URL + '/audio/' + AUDIO_VERSION,
  dataBaseUrl: R2_BASE_URL + '/data/' + DATA_VERSION,

  // 下载超时（毫秒）
  downloadTimeout: 30000,

  /**
   * 获取绕机检查图片的 R2 URL
   * @param {string} relativePath - 相对路径，如 'shared/wings/slat.png' 或 'images1/antennas.png'
   * @returns {string} 完整 R2 URL
   */
  getImageUrl: function(relativePath) {
    return this.imageBaseUrl + '/' + relativePath;
  },

  /**
   * 获取航线录音的 R2 URL
   * @param {string} packageRoot - 分包目录名，如 'packageKorean'
   * @param {string} filename - 文件名，如 'Air-Busan-705_Cleared-to-land-RWY16R.mp3'
   * @returns {string} 完整 R2 URL
   */
  getAudioUrl: function(packageRoot, filename) {
    return this.audioBaseUrl + '/' + packageRoot + '/' + filename;
  },

  /**
   * 获取法规数据 JSON 的 R2 URL
   * @param {string} type - 数据类型：'regulation' | 'normative' | 'specification'
   * @returns {string} 完整 R2 URL
   */
  getDataUrl: function(type) {
    return this.dataBaseUrl + '/' + type + '.json';
  },

  /**
   * 获取机场数据 JSON 的 R2 URL
   * @returns {string} 完整 R2 URL
   */
  getAirportDataUrl: function() {
    return this.dataBaseUrl + '/airports.json';
  }
};

module.exports = R2Config;
