/**
 * 微信小程序WXSS语法自动修复工具
 * 自动修复常见的语法问题，如通配符选择器等
 */

const fs = require('fs');
const path = require('path');

class WXSSAutoFixer {
  constructor() {
    this.fixedFiles = [];
    this.fixes = [];
  }

  /**
   * 修复单个文件
   * @param {string} filePath - WXSS文件路径
   */
  fixFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fixedContent = this.fixContent(content, filePath);
      
      if (content !== fixedContent) {
        // 备份原文件
        const backupPath = filePath + '.backup';
        fs.writeFileSync(backupPath, content, 'utf8');
        
        // 写入修复后的内容
        fs.writeFileSync(filePath, fixedContent, 'utf8');
        
        this.fixedFiles.push({
          file: filePath,
          backup: backupPath,
          fixes: this.fixes.filter(fix => fix.file === filePath)
        });
        
        console.log(`✅ 已修复: ${filePath}`);
        console.log(`📁 备份: ${backupPath}`);
      }
    } catch (error) {
      console.error(`❌ 修复失败 ${filePath}:`, error.message);
    }
  }

  /**
   * 修复WXSS内容
   * @param {string} content - 原始内容
   * @param {string} filePath - 文件路径
   * @returns {string} - 修复后的内容
   */
  fixContent(content, filePath) {
    let fixedContent = content;
    const lines = content.split('\n');
    
    // 修复通配符选择器
    fixedContent = this.fixUniversalSelectors(fixedContent, filePath);
    
    // 修复CSS变量（替换为静态值）
    fixedContent = this.fixCSSVariables(fixedContent, filePath);
    
    // 修复:has()选择器
    fixedContent = this.fixHasSelectors(fixedContent, filePath);
    
    return fixedContent;
  }

  /**
   * 修复通配符选择器
   */
  fixUniversalSelectors(content, filePath) {
    const fixes = [
      // * .class -> .class
      {
        pattern: /^\s*\*\s+(\.[a-zA-Z][\w-]*)/gm,
        replacement: '$1',
        description: '移除通配符选择器前缀'
      },
      // *, * .class -> .class
      {
        pattern: /,\s*\*\s+(\.[a-zA-Z][\w-]*)/g,
        replacement: ', $1',
        description: '移除选择器列表中的通配符'
      },
      // * { -> 删除整个规则（因为通常是重置样式，小程序不需要）
      {
        pattern: /^\s*\*\s*\{[^}]*\}/gm,
        replacement: '/* 已移除通配符重置样式 */',
        description: '移除通配符重置样式'
      }
    ];

    let fixedContent = content;
    fixes.forEach(fix => {
      const matches = fixedContent.match(fix.pattern);
      if (matches) {
        fixedContent = fixedContent.replace(fix.pattern, fix.replacement);
        this.fixes.push({
          file: filePath,
          type: 'UNIVERSAL_SELECTOR',
          description: fix.description,
          matches: matches.length
        });
      }
    });

    return fixedContent;
  }

  /**
   * 修复CSS变量（简单替换为常用值）
   */
  fixCSSVariables(content, filePath) {
    const commonVariables = {
      '--primary-color': '#1989fa',
      '--success-color': '#52c41a',
      '--warning-color': '#faad14',
      '--error-color': '#ff4d4f',
      '--text-color': '#333333',
      '--border-color': '#ebedf0',
      '--background-color': '#ffffff'
    };

    let fixedContent = content;
    const variablePattern = /var\((--[\w-]+)(?:,\s*([^)]+))?\)/g;
    
    const matches = content.match(variablePattern);
    if (matches) {
      matches.forEach(match => {
        const varMatch = match.match(/var\((--[\w-]+)(?:,\s*([^)]+))?\)/);
        if (varMatch) {
          const varName = varMatch[1];
          const fallback = varMatch[2];
          const replacement = commonVariables[varName] || fallback || '#000000';
          
          fixedContent = fixedContent.replace(match, replacement);
        }
      });

      this.fixes.push({
        file: filePath,
        type: 'CSS_VARIABLES',
        description: '替换CSS变量为静态值',
        matches: matches.length
      });
    }

    return fixedContent;
  }

  /**
   * 修复:has()选择器（移除或替换）
   */
  fixHasSelectors(content, filePath) {
    const hasPattern = /:has\([^)]+\)/g;
    const matches = content.match(hasPattern);
    
    if (matches) {
      let fixedContent = content;
      
      // 简单移除:has()选择器
      fixedContent = fixedContent.replace(hasPattern, '');
      
      // 清理可能产生的空规则
      fixedContent = fixedContent.replace(/[^{},]*\{\s*\}/g, '');
      
      this.fixes.push({
        file: filePath,
        type: 'HAS_SELECTOR',
        description: '移除:has()选择器',
        matches: matches.length
      });
      
      return fixedContent;
    }

    return content;
  }

  /**
   * 修复整个项目
   */
  fixProject(projectPath) {
    this.scanAndFix(projectPath);
    return this.getReport();
  }

  /**
   * 扫描并修复目录中的WXSS文件
   */
  scanAndFix(dirPath) {
    try {
      const items = fs.readdirSync(dirPath);
      
      items.forEach(item => {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          this.scanAndFix(fullPath);
        } else if (item.endsWith('.wxss')) {
          this.fixFile(fullPath);
        }
      });
    } catch (error) {
      console.error(`扫描目录失败 ${dirPath}:`, error.message);
    }
  }

  /**
   * 获取修复报告
   */
  getReport() {
    return {
      fixedFiles: this.fixedFiles,
      totalFixes: this.fixes.length,
      fixTypes: [...new Set(this.fixes.map(f => f.type))],
      summary: {
        filesFixed: this.fixedFiles.length,
        totalFixes: this.fixes.length,
        backupsCreated: this.fixedFiles.length
      }
    };
  }

  /**
   * 打印修复报告
   */
  printReport() {
    const report = this.getReport();
    
    console.log('\n=== 微信小程序WXSS自动修复报告 ===\n');
    
    if (report.fixedFiles.length > 0) {
      console.log('🔧 已修复的文件:');
      report.fixedFiles.forEach(file => {
        console.log(`  ✅ ${file.file}`);
        file.fixes.forEach(fix => {
          console.log(`    - ${fix.description} (${fix.matches}处)`);
        });
        console.log(`    📁 备份: ${file.backup}`);
        console.log('');
      });
    } else {
      console.log('✅ 未发现需要修复的WXSS语法问题');
    }
    
    console.log(`总计: 修复了 ${report.summary.filesFixed} 个文件，${report.summary.totalFixes} 处问题\n`);
    
    if (report.summary.backupsCreated > 0) {
      console.log('💡 提示: 原文件已备份为 .backup 文件，如有问题可以恢复');
    }
    
    return report;
  }

  /**
   * 恢复所有备份文件
   */
  restoreBackups() {
    let restored = 0;
    
    this.fixedFiles.forEach(file => {
      try {
        if (fs.existsSync(file.backup)) {
          const backupContent = fs.readFileSync(file.backup, 'utf8');
          fs.writeFileSync(file.file, backupContent, 'utf8');
          fs.unlinkSync(file.backup);
          console.log(`✅ 已恢复: ${file.file}`);
          restored++;
        }
      } catch (error) {
        console.error(`❌ 恢复失败 ${file.file}:`, error.message);
      }
    });
    
    console.log(`\n总计恢复了 ${restored} 个文件`);
    return restored;
  }
}

// 导出修复器
module.exports = WXSSAutoFixer;

// 如果直接运行此脚本，修复当前项目
if (require.main === module) {
  const fixer = new WXSSAutoFixer();
  const projectPath = path.join(__dirname, '..');
  
  console.log('开始自动修复微信小程序WXSS语法问题...');
  const report = fixer.fixProject(projectPath);
  fixer.printReport();
} 