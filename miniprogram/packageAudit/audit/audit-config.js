'use strict';

/**
 * 🔍 审计配置常量
 *
 * 定义微信小程序官方限制和项目推荐阈值
 * 用于审计系统检测性能问题和优化机会
 *
 * @module audit-config
 * @created 2025-01-XX
 * @purpose 飞行工具箱全面审查与优化项目 - 审计阈值常量定义
 *
 * @example
 * var AuditConfig = require('./audit-config.js');
 * if (size > AuditConfig.WeChatMiniProgramLimits.MAIN_PACKAGE_MAX) {
 *   console.error('主包超过2MB限制！');
 * }
 */

/**
 * 微信小程序官方限制（2025-2026）
 * ⚠️ 这些是硬性限制，必须严格遵守
 *
 * @constant {Object}
 * @property {number} MAIN_PACKAGE_MAX - 主包最大2MB
 * @property {number} SINGLE_SUBPACKAGE_MAX - 单个分包最大2MB
 * @property {number} TOTAL_SIZE_MAX - 总包最大30MB（普通小程序）
 * @property {number} TOTAL_SIZE_MAX_SERVICE - 总包最大20MB（服务商代开发）
 * @property {number} PRELOAD_QUOTA_PER_PAGE - 单页面预下载额度2MB
 * @property {number} STORAGE_SINGLE_KEY_MAX - 单key最大1MB
 * @property {number} STORAGE_TOTAL_MAX - 总存储最大10MB
 * @property {number} HALF_SCREEN_MINI_PROGRAM_MAX - 半屏打开小程序上限100个
 */
var WeChatMiniProgramLimits = {
  // 体积限制
  MAIN_PACKAGE_MAX: 2 * 1024 * 1024,        // 主包最大2MB
  SINGLE_SUBPACKAGE_MAX: 2 * 1024 * 1024,   // 单个分包最大2MB
  TOTAL_SIZE_MAX: 30 * 1024 * 1024,         // 总包最大30MB（普通小程序）
  TOTAL_SIZE_MAX_SERVICE: 20 * 1024 * 1024, // 总包最大20MB（服务商代开发）

  // 预下载限制
  PRELOAD_QUOTA_PER_PAGE: 2 * 1024 * 1024,  // 单页面预下载额度2MB

  // 存储限制
  STORAGE_SINGLE_KEY_MAX: 1 * 1024 * 1024,  // 单key最大1MB
  STORAGE_TOTAL_MAX: 10 * 1024 * 1024,      // 总存储最大10MB

  // 其他限制
  HALF_SCREEN_MINI_PROGRAM_MAX: 100         // 半屏打开小程序上限100个
};

/**
 * 本项目推荐阈值（比官方限制更保守）
 * 留有余量以确保安全和良好的用户体验
 *
 * @constant {Object}
 * @property {number} MAIN_PACKAGE_RECOMMENDED - 主包建议1.5MB
 * @property {number} SINGLE_SUBPACKAGE_RECOMMENDED - 单分包建议1.8MB
 * @property {number} PRELOAD_QUOTA_RECOMMENDED - 预下载建议1.8MB
 * @property {number} SETDATA_PAYLOAD_MAX - setData建议1024KB
 * @property {number} SETDATA_PAYLOAD_WARNING - setData警告100KB
 */
var RecommendedThresholds = {
  // 体积阈值（留有余量）
  MAIN_PACKAGE_RECOMMENDED: 1.5 * 1024 * 1024,      // 主包建议1.5MB
  SINGLE_SUBPACKAGE_RECOMMENDED: 1.8 * 1024 * 1024, // 单分包建议1.8MB
  PRELOAD_QUOTA_RECOMMENDED: 1.8 * 1024 * 1024,     // 预下载建议1.8MB

  // setData性能阈值
  SETDATA_PAYLOAD_MAX: 1024 * 1024,                 // setData建议1024KB上限
  SETDATA_PAYLOAD_WARNING: 100 * 1024,              // setData警告100KB

  // 批量操作阈值
  SETDATA_BATCH_INTERVAL: 50,                       // 50ms内应合并setData
  HIGH_FREQ_THROTTLE_INTERVAL: 500,                 // 高频数据（GPS等）500ms节流
  SENSOR_THROTTLE_INTERVAL: 300                     // 传感器数据300ms节流
};

/**
 * 长列表优化阈值
 *
 * @constant {Object}
 * @property {number} VIRTUAL_LIST_THRESHOLD - 超过此数量启用虚拟列表
 * @property {number} PAGINATION_THRESHOLD - 超过此数量建议分页
 * @property {number} DEFAULT_PAGE_SIZE - 默认分页大小
 * @property {number} PRELOAD_COUNT - 预加载数量
 */
var ListOptimizationThresholds = {
  VIRTUAL_LIST_THRESHOLD: 100,    // 超过100项启用虚拟列表
  PAGINATION_THRESHOLD: 50,       // 超过50项建议分页
  DEFAULT_PAGE_SIZE: 20,          // 默认分页大小
  PRELOAD_COUNT: 5                // 预加载数量
};

/**
 * 内存管理阈值
 *
 * @constant {Object}
 * @property {number} MAX_AUDIO_INSTANCES - 音频实例最大数量（单例）
 * @property {number} TIMER_WARNING_COUNT - 定时器警告数量
 * @property {number} LISTENER_WARNING_COUNT - 事件监听器警告数量
 */
var MemoryManagementThresholds = {
  MAX_AUDIO_INSTANCES: 1,         // 音频单例
  TIMER_WARNING_COUNT: 5,         // 单页面超过5个定时器警告
  LISTENER_WARNING_COUNT: 10      // 单页面超过10个监听器警告
};

/**
 * 图片资源阈值
 *
 * @constant {Object}
 * @property {number} IMAGE_SIZE_WARNING - 图片大小警告阈值
 * @property {number} IMAGE_SIZE_MAX - 图片大小最大阈值
 * @property {Array<string>} RECOMMENDED_FORMATS - 推荐的图片格式
 */
var ImageResourceThresholds = {
  IMAGE_SIZE_WARNING: 50 * 1024,  // 50KB警告
  IMAGE_SIZE_MAX: 100 * 1024,     // 100KB最大建议
  RECOMMENDED_FORMATS: ['webp', 'png', 'jpg', 'jpeg']
};

/**
 * UI/无障碍设计阈值
 *
 * @constant {Object}
 * @property {number} MIN_TOUCH_TARGET_SIZE - 最小触摸目标大小（rpx）
 * @property {number} MIN_FONT_SIZE - 最小字体大小（rpx）
 * @property {number} WCAG_AA_CONTRAST_RATIO - WCAG AA对比度要求
 * @property {number} WCAG_AAA_CONTRAST_RATIO - WCAG AAA对比度要求
 */
var AccessibilityThresholds = {
  MIN_TOUCH_TARGET_SIZE: 88,      // 44pt = 88rpx
  MIN_FONT_SIZE: 24,              // 最小24rpx
  WCAG_AA_CONTRAST_RATIO: 4.5,    // WCAG AA标准
  WCAG_AAA_CONTRAST_RATIO: 7      // WCAG AAA标准
};

/**
 * 加载状态阈值
 *
 * @constant {Object}
 * @property {number} LOADING_INDICATOR_DELAY - 加载指示器显示延迟
 * @property {number} SKELETON_DISPLAY_TIME - 骨架屏显示时间
 * @property {number} NETWORK_TIMEOUT_WARNING - 网络超时警告
 */
var LoadingStateThresholds = {
  LOADING_INDICATOR_DELAY: 100,   // 100ms内显示加载指示器
  SKELETON_DISPLAY_TIME: 100,     // 100ms内显示骨架屏
  NETWORK_TIMEOUT_WARNING: 3000   // 3秒网络超时警告
};

/**
 * 审计问题严重级别
 *
 * @constant {Object}
 * @property {string} CRITICAL - 严重问题，必须修复
 * @property {string} MAJOR - 主要问题，强烈建议修复
 * @property {string} MINOR - 次要问题，建议修复
 * @property {string} INFO - 信息提示，可选优化
 */
var AuditSeverity = {
  CRITICAL: 'critical',   // 严重问题，必须修复
  MAJOR: 'major',         // 主要问题，强烈建议修复
  MINOR: 'minor',         // 次要问题，建议修复
  INFO: 'info'            // 信息提示，可选优化
};

/**
 * 审计问题分类
 *
 * @constant {Object}
 * @property {string} PERFORMANCE - 性能问题
 * @property {string} UI - UI/样式问题
 * @property {string} BUG - Bug/错误
 * @property {string} ACCESSIBILITY - 无障碍问题
 * @property {string} CODE_QUALITY - 代码质量问题
 */
var AuditCategory = {
  PERFORMANCE: 'performance',     // 性能问题
  UI: 'ui',                       // UI/样式问题
  BUG: 'bug',                     // Bug/错误
  ACCESSIBILITY: 'accessibility', // 无障碍问题
  CODE_QUALITY: 'code_quality'    // 代码质量问题
};

/**
 * 审计问题类型
 *
 * @constant {Object}
 */
var AuditIssueType = {
  // 性能相关
  MAIN_PACKAGE_SIZE: 'main_package_size',
  SUBPACKAGE_SIZE: 'subpackage_size',
  PRELOAD_QUOTA_EXCEEDED: 'preload_quota_exceeded',
  SETDATA_LARGE_PAYLOAD: 'setdata_large_payload',
  SETDATA_FREQUENT_CALLS: 'setdata_frequent_calls',
  SETDATA_UNBOUND_DATA: 'setdata_unbound_data',
  LONG_LIST_NO_VIRTUAL: 'long_list_no_virtual',
  SYNC_STORAGE_OPERATION: 'sync_storage_operation',

  // 内存相关
  TIMER_NOT_CLEARED: 'timer_not_cleared',
  LISTENER_NOT_REMOVED: 'listener_not_removed',
  AUDIO_NOT_DESTROYED: 'audio_not_destroyed',
  LOCATION_NOT_STOPPED: 'location_not_stopped',
  MEMORY_LEAK_CLOSURE: 'memory_leak_closure',

  // 图片相关
  IMAGE_TOO_LARGE: 'image_too_large',
  IMAGE_WRONG_FORMAT: 'image_wrong_format',
  IMAGE_MISSING_DIMENSIONS: 'image_missing_dimensions',
  IMAGE_DUPLICATE: 'image_duplicate',

  // UI相关
  STYLE_INCONSISTENT: 'style_inconsistent',
  COLOR_LOW_CONTRAST: 'color_low_contrast',
  TOUCH_TARGET_TOO_SMALL: 'touch_target_too_small',
  FONT_SIZE_TOO_SMALL: 'font_size_too_small',
  VANT_USAGE_INCONSISTENT: 'vant_usage_inconsistent',

  // 加载状态相关
  MISSING_LOADING_STATE: 'missing_loading_state',
  MISSING_ERROR_STATE: 'missing_error_state',

  // 音频相关
  AUDIO_NOT_SINGLETON: 'audio_not_singleton',
  AUDIO_IOS_MUTE_SWITCH: 'audio_ios_mute_switch',
  AUDIO_RACE_CONDITION: 'audio_race_condition',
  AUDIO_MISSING_ERROR_HANDLER: 'audio_missing_error_handler',

  // 代码质量相关
  NOT_USING_BASEPAGE: 'not_using_basepage',
  DUPLICATE_CODE: 'duplicate_code',
  ES5_VIOLATION: 'es5_violation',
  UNUSED_IMPORT: 'unused_import',
  EMPTY_CATCH_BLOCK: 'empty_catch_block',
  MISSING_ERROR_HANDLER: 'missing_error_handler'
};

/**
 * 设计系统规范
 * 用于UI一致性审计
 *
 * @constant {Object}
 */
var DesignSystem = {
  // 颜色规范
  colors: {
    primary: '#1989fa',
    success: '#07c160',
    warning: '#ff976a',
    danger: '#ee0a24',
    textPrimary: '#323233',
    textSecondary: '#969799',
    background: '#f7f8fa',
    border: '#ebedf0'
  },

  // 间距规范
  spacing: {
    xs: '8rpx',
    sm: '16rpx',
    md: '24rpx',
    lg: '32rpx',
    xl: '48rpx'
  },

  // 圆角规范
  borderRadius: {
    sm: '8rpx',
    md: '12rpx',
    lg: '16rpx',
    round: '999rpx'
  },

  // 字体规范
  typography: {
    minSize: '24rpx',
    bodySize: '28rpx',
    titleSize: '32rpx',
    headingSize: '36rpx'
  },

  // 触摸目标
  touchTarget: {
    minSize: '88rpx'  // 44pt = 88rpx
  }
};

/**
 * 错误码定义
 *
 * @constant {Object}
 */
var AuditErrorCodes = {
  // 文件操作错误 (1xxx)
  FILE_NOT_FOUND: 1001,
  FILE_READ_ERROR: 1002,
  FILE_WRITE_ERROR: 1003,

  // 解析错误 (2xxx)
  JSON_PARSE_ERROR: 2001,
  WXML_PARSE_ERROR: 2002,
  WXSS_PARSE_ERROR: 2003,
  JS_PARSE_ERROR: 2004,

  // 分析错误 (3xxx)
  ANALYSIS_TIMEOUT: 3001,
  MEMORY_EXCEEDED: 3002,
  DEPENDENCY_CYCLE: 3003,

  // 优化错误 (4xxx)
  OPTIMIZATION_FAILED: 4001,
  ROLLBACK_FAILED: 4002,
  VALIDATION_FAILED: 4003
};

// 导出所有配置
module.exports = {
  // 官方限制
  WeChatMiniProgramLimits: WeChatMiniProgramLimits,

  // 推荐阈值
  RecommendedThresholds: RecommendedThresholds,
  ListOptimizationThresholds: ListOptimizationThresholds,
  MemoryManagementThresholds: MemoryManagementThresholds,
  ImageResourceThresholds: ImageResourceThresholds,
  AccessibilityThresholds: AccessibilityThresholds,
  LoadingStateThresholds: LoadingStateThresholds,

  // 审计分类
  AuditSeverity: AuditSeverity,
  AuditCategory: AuditCategory,
  AuditIssueType: AuditIssueType,

  // 设计系统
  DesignSystem: DesignSystem,

  // 错误码
  AuditErrorCodes: AuditErrorCodes
};
