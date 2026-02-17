#!/usr/bin/env node

/**
 * 版本号自动生成脚本
 * 从package.json读取版本号，从更新说明目录提取changelog，生成miniprogram/utils/version.js
 *
 * 使用方法：
 * 1. 手动运行: node miniprogram/scripts/generate-version.js
 * 2. npm scripts: npm run generate-version
 * 3. CI自动: 在GitHub Actions上传前自动运行
 */

const fs = require('fs');
const path = require('path');

// 读取package.json
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// 获取版本号
const version = packageJson.version;
const buildDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD格式

// 从更新说明目录提取当前版本的changelog摘要
function extractChangelog(ver) {
  const changelogDir = path.join(__dirname, '../../更新说明');
  if (!fs.existsSync(changelogDir)) {
    return '';
  }

  // 查找匹配当前版本的更新说明文件
  const targetFile = `版本更新说明_v${ver}.md`;
  const targetPath = path.join(changelogDir, targetFile);

  let mdPath = null;
  if (fs.existsSync(targetPath)) {
    mdPath = targetPath;
  } else {
    // 找不到精确匹配时，取最新的更新说明文件
    const files = fs.readdirSync(changelogDir)
      .filter(f => f.startsWith('版本更新说明_v') && f.endsWith('.md'))
      .sort();
    if (files.length > 0) {
      mdPath = path.join(changelogDir, files[files.length - 1]);
    }
  }

  if (!mdPath) {
    return '';
  }

  const content = fs.readFileSync(mdPath, 'utf8');
  // 提取"## 这版主要改了啥？"或首个 ## 段落下的要点列表
  const lines = content.split('\n');
  const bullets = [];
  let inSection = false;

  for (const line of lines) {
    // 进入第一个 ## 段落
    if (!inSection && line.startsWith('## ')) {
      inSection = true;
      continue;
    }
    // 遇到下一个 ## 段落则停止
    if (inSection && line.startsWith('## ')) {
      break;
    }
    if (inSection && line.startsWith('- ')) {
      // 提取纯文本，去掉markdown加粗
      const text = line.replace(/^-\s*/, '').replace(/\*\*/g, '').trim();
      if (text) {
        bullets.push(text);
      }
    }
  }

  return bullets.join('\\n');
}

const changelog = extractChangelog(version);

// 生成version.js内容
const versionContent = `/**
 * 自动生成的版本信息文件
 * 请勿手动修改此文件！
 * 由 scripts/generate-version.js 自动生成
 *
 * 更新方式：
 * 1. 修改 package.json 中的 version 字段
 * 2. 在 更新说明/ 目录添加对应版本的md文件
 * 3. 运行 npm run generate-version（或由CI自动执行）
 */

module.exports = {
  /** 应用版本号（来自package.json） */
  version: '${version}',

  /** 构建日期（自动生成） */
  buildDate: '${buildDate}',

  /** 更新内容摘要（来自更新说明目录） */
  changelog: '${changelog}',

  /** 获取完整版本信息 */
  getVersionInfo: function() {
    return {
      version: this.version,
      buildDate: this.buildDate,
      changelog: this.changelog,
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
console.log('   更新内容:', changelog || '(无)');
console.log('   文件路径:', versionFilePath);
