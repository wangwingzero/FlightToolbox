var audioLibraryVersion = require('./audio-library-version.js');

// 统一的航线录音缓存key生成工具
// 规则需与 pages/audio-player/index.ts 中的 generateAudioCacheKey 保持一致
// cacheKey 形如：AUDIO_LIBRARY_VERSION_regionId_mp3File
// 或兼容旧数据：AUDIO_LIBRARY_VERSION_regionId_airportCode_clipIndex
// 最后兜底：AUDIO_LIBRARY_VERSION_regionId_clip_clipIndex

function generateAudioCacheKey(options) {
  options = options || {};
  var regionId = options.regionId || 'unknown';
  var mp3File = options.mp3File || '';
  var airportCode = options.airportCode || '';
  var clipIndex = typeof options.clipIndex === 'number' ? options.clipIndex : 0;

  var libraryVersion = (audioLibraryVersion && audioLibraryVersion.AUDIO_LIBRARY_VERSION) || 'v1';
  var baseKey;

  if (mp3File) {
    baseKey = regionId + '_' + mp3File;
  } else if (airportCode) {
    baseKey = regionId + '_' + airportCode + '_' + clipIndex;
  } else {
    baseKey = regionId + '_clip_' + clipIndex;
  }

  return libraryVersion + '_' + baseKey;
}

module.exports = {
  generateAudioCacheKey: generateAudioCacheKey
};
