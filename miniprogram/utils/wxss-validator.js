/**
 * 微信小程序WXSS语法验证工具
 * 用于检查不支持的CSS语法，避免编译错误
 */

const fs = require('fs');
const path = require('path');

class WXSSValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * 验证WXSS文件
   * @param {string} filePath - WXSS文件路径
   */
  validateFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      this.validateContent(content, filePath);
    } catch (error) {
      console.error(`无法读取文件 ${filePath}:`, error.message);
    }
  }

  /**
   * 验证WXSS内容
   * @param {string} content - WXSS文件内容
   * @param {string} filePath - 文件路径（用于错误报告）
   */
  validateContent(content, filePath = '') {
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      
      // 检查通配符选择器
      this.checkUniversalSelector(line, lineNumber, filePath);
      
      // 检查其他不支持的语法
      this.checkUnsupportedSyntax(line, lineNumber, filePath);
    });
  }

  /**
   * 检查通配符选择器
   */
  checkUniversalSelector(line, lineNumber, filePath) {
    // 移除注释后检查
    const cleanLine = line.replace(/\/\*.*?\*\//g, '').trim();
    
    // 检查各种通配符选择器模式
    const universalPatterns = [
      /^\s*\*\s*[{,]/,           // * { 或 *,
      /^\s*\*\s+\./,             // * .class
      /^\s*\*\s+[a-zA-Z]/,       // * element
      /,\s*\*\s*[{,]/,           // , * {
      /,\s*\*\s+\./,             // , * .class
    ];

    universalPatterns.forEach(pattern => {
      if (pattern.test(cleanLine)) {
        this.errors.push({
          type: 'UNIVERSAL_SELECTOR',
          file: filePath,
          line: lineNumber,
          content: line.trim(),
          message: '微信小程序不支持通配符选择器 (*)'
        });
      }
    });
  }

  /**
   * 检查其他不支持的语法
   */
  checkUnsupportedSyntax(line, lineNumber, filePath) {
    const cleanLine = line.replace(/\/\*.*?\*\//g, '').trim();
    
    // 检查CSS Grid（部分支持有限）
    if (/display:\s*grid/i.test(cleanLine)) {
      this.warnings.push({
        type: 'CSS_GRID',
        file: filePath,
        line: lineNumber,
        content: line.trim(),
        message: 'CSS Grid在微信小程序中支持有限，建议使用flex布局'
      });
    }

    // 检查CSS变量（不支持）
    if (/var\(--/.test(cleanLine)) {
      this.errors.push({
        type: 'CSS_VARIABLES',
        file: filePath,
        line: lineNumber,
        content: line.trim(),
        message: '微信小程序不支持CSS变量'
      });
    }

    // 检查:has()选择器（不支持）
    if (/:has\(/.test(cleanLine)) {
      this.errors.push({
        type: 'HAS_SELECTOR',
        file: filePath,
        line: lineNumber,
        content: line.trim(),
        message: '微信小程序不支持:has()选择器'
      });
    }
  }

  /**
   * 验证整个项目的WXSS文件
   * @param {string} projectPath - 项目根路径
   */
  validateProject(projectPath) {
    this.scanDirectory(projectPath);
    return this.getReport();
  }

  /**
   * 扫描目录中的WXSS文件
   */
  scanDirectory(dirPath) {
    try {
      const items = fs.readdirSync(dirPath);
      
      items.forEach(item => {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          this.scanDirectory(fullPath);
        } else if (item.endsWith('.wxss')) {
          this.validateFile(fullPath);
        }
      });
    } catch (error) {
      console.error(`扫描目录失败 ${dirPath}:`, error.message);
    }
  }

  /**
   * 获取验证报告
   */
  getReport() {
    return {
      errors: this.errors,
      warnings: this.warnings,
      hasErrors: this.errors.length > 0,
      hasWarnings: this.warnings.length > 0,
      summary: {
        totalErrors: this.errors.length,
        totalWarnings: this.warnings.length,
        errorTypes: [...new Set(this.errors.map(e => e.type))],
        warningTypes: [...new Set(this.warnings.map(w => w.type))]
      }
    };
  }

  /**
   * 打印报告
   */
  printReport() {
    const report = this.getReport();
    
    console.log('\n=== 微信小程序WXSS验证报告 ===\n');
    
    if (report.hasErrors) {
      console.log('🔴 错误:');
      report.errors.forEach(error => {
        console.log(`  ${error.file}:${error.line}`);
        console.log(`    ${error.message}`);
        console.log(`    代码: ${error.content}`);
        console.log('');
      });
    }
    
    if (report.hasWarnings) {
      console.log('🟡 警告:');
      report.warnings.forEach(warning => {
        console.log(`  ${warning.file}:${warning.line}`);
        console.log(`    ${warning.message}`);
        console.log(`    代码: ${warning.content}`);
        console.log('');
      });
    }
    
    if (!report.hasErrors && !report.hasWarnings) {
      console.log('✅ 未发现WXSS语法问题');
    }
    
    console.log(`总计: ${report.summary.totalErrors} 个错误, ${report.summary.totalWarnings} 个警告\n`);
    
    return report;
  }

  /**
   * 清除所有错误和警告
   */
  clear() {
    this.errors = [];
    this.warnings = [];
  }
}

// 导出验证器
module.exports = WXSSValidator;

// 如果直接运行此脚本，验证当前项目
if (require.main === module) {
  const validator = new WXSSValidator();
  const projectPath = path.join(__dirname, '..');
  
  console.log('开始验证微信小程序WXSS文件...');
  const report = validator.validateProject(projectPath);
  validator.printReport();
  
  // 如果有错误，退出码为1
  if (report.hasErrors) {
    process.exit(1);
  }
} 