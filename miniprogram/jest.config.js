/**
 * Jest 配置文件
 * 用于运行审计工具的属性测试
 */
module.exports = {
  // 测试环境
  testEnvironment: 'node',

  // 测试文件匹配模式
  testMatch: [
    '**/utils/audit/__tests__/**/*.test.js'
  ],

  // 忽略的目录
  testPathIgnorePatterns: [
    '/node_modules/',
    '/miniprogram_npm/'
  ],

  // 超时设置（属性测试可能需要更长时间）
  testTimeout: 60000,

  // 详细输出
  verbose: true,

  // 覆盖率配置
  collectCoverageFrom: [
    'utils/audit/**/*.js',
    '!utils/audit/__tests__/**'
  ],

  // 模块路径映射
  moduleDirectories: ['node_modules'],

  // 根目录
  rootDir: '.',

  // 转换配置（ES5兼容）
  transform: {}
};
