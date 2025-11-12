#!/usr/bin/env node

/**
 * 版本号自动生成脚本
 * 从package.json读取版本号，生成miniprogram/utils/version.js
 *
 * 使用方法：
 * 1. 手动运行: node miniprogram/scripts/generate-version.js
 * 2. npm scripts: npm run generate-version
 * 3. 开发时自动: 在package.json的postversion或precompile中调用
 */

const fs = require('fs');
const path = require('path');

// 读取package.json
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// 获取版本号
const version = packageJson.version;
const buildDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD格式

// 生成version.js内容
const versionContent = `/**
 * 自动生成的版本信息文件
 * 请勿手动修改此文件！
 * 由 scripts/generate-version.js 自动生成
 *
 * 更新方式：
 * 1. 修改 package.json 中的 version 字段
 * 2. 运行 npm run generate-version
 */

module.exports = {
  /** 应用版本号（来自package.json） */
  version: '${version}',

  /** 构建日期（自动生成） */
  buildDate: '${buildDate}',

  /** 获取完整版本信息 */
  getVersionInfo: function() {
    return {
      version: this.version,
      buildDate: this.buildDate,
      fullVersion: this.version + ' (' + this.buildDate + ')'
    };
  }
};
`;

// 写入version.js文件
const versionFilePath = path.join(__dirname, '../utils/version.js');
fs.writeFileSync(versionFilePath, versionContent, 'utf8');

console.log('✅ 版本号文件已生成:');
console.log('   版本号:', version);
console.log('   构建日期:', buildDate);
console.log('   文件路径:', versionFilePath);
