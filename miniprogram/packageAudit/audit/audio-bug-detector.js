'use strict';

/**
 * 🎵 音频功能Bug检测器
 *
 * 检测微信小程序中音频相关的问题和潜在Bug
 * 包括单例模式、iOS兼容性、状态管理和错误处理
 *
 * @module audio-bug-detector
 * @created 2025-01-XX
 * @purpose 飞行工具箱全面审查与优化项目 - 音频Bug检测
 *
 * ⚠️ 基于Google AI搜索的2025-2026最佳实践：
 * - 必须设置obeyMuteSwitch: false解决iOS静音模式问题
 * - 自动播放受限，必须在用户交互回调中调用play()
 * - 后台播放需使用BackgroundAudioManager并配置requiredBackgroundModes
 * - 音频格式必须是标准.mp3，URL必须是HTTPS
 * - 单例模式管理InnerAudioContext，避免重复创建
 * - 必须注册onError监听器捕获错误码
 * - 使用wx.setInnerAudioOption全局配置（基础库2.3.0+）
 *
 * @example
 * var AudioBugDetector = require('./audio-bug-detector.js');
 * var singletonIssues = AudioBugDetector.checkSingletonPattern({ code: jsCode, filePath: 'pages/audio/index.js' });
 * var iosIssues = AudioBugDetector.checkiOSCompatibility({ code: jsCode, filePath: 'pages/audio/index.js' });
 */

var AuditConfig = require('./audit-config.js');
var AuditReport = require('./audit-report.js');

/**
 * 音频相关API常量
 * @constant {Object}
 */
var AUDIO_APIS = {
  CREATE: ['createInnerAudioContext', 'createAudioContext'],
  GLOBAL_CONFIG: 'setInnerAudioOption',
  CLEANUP: ['destroy', 'stop'],
  PLAYBACK: ['play', 'pause', 'stop', 'seek'],
  EVENTS: ['onPlay', 'onPause', 'onStop', 'onEnded', 'onError', 'onCanplay', 'onWaiting', 'onSeeking', 'onSeeked', 'onTimeUpdate'],
  ERROR_EVENTS: ['onError'],
  INTERRUPTION_EVENTS: ['onInterruptionBegin', 'onInterruptionEnd']
};

/**
 * iOS兼容性关键配置
 * @constant {Object}
 */
var IOS_CRITICAL_CONFIG = {
  obeyMuteSwitch: false,  // 必须为false才能在静音模式下播放
  speakerOn: true         // 通过扬声器播放
};


/**
 * 音频Bug检测器
 * @namespace AudioBugDetector
 */
var AudioBugDetector = {
  /**
   * 音频API常量
   */
  AUDIO_APIS: AUDIO_APIS,

  /**
   * iOS关键配置
   */
  IOS_CRITICAL_CONFIG: IOS_CRITICAL_CONFIG,

  /**
   * 检查单例模式实现
   * 验证InnerAudioContext是否按单例模式管理
   *
   * @param {Object} options - 检查选项
   * @param {string} options.code - 文件代码
   * @param {string} options.filePath - 文件路径
   * @returns {Array} 单例问题列表
   *
   * **Validates: Requirements 10.1, 10.4**
   *
   * @example
   * var issues = AudioBugDetector.checkSingletonPattern({
   *   code: jsCode,
   *   filePath: 'pages/audio-player/index.js'
   * });
   */
  checkSingletonPattern: function(options) {
    var issues = [];
    options = options || {};

    if (!options.code || !options.filePath) {
      return issues;
    }

    try {
      var code = options.code;
      var filePath = options.filePath;
      var lines = code.split('\n');

      // 收集音频实例创建信息
      var audioCreates = [];
      var audioDestroys = [];
      var hasOnUnload = false;
      var onUnloadContent = '';

      // 扫描所有行
      for (var lineNum = 0; lineNum < lines.length; lineNum++) {
        var line = lines[lineNum];

        // 检测onUnload函数
        if (/onUnload\s*[:(]/.test(line) || /customOnUnload\s*[:(]/.test(line)) {
          hasOnUnload = true;
          onUnloadContent = this._extractFunctionContent(lines, lineNum);
        }

        // 检测音频实例创建
        var createMatch = this._detectAudioCreate(line, lineNum);
        if (createMatch) {
          audioCreates.push(createMatch);
        }

        // 检测destroy调用
        var destroyMatch = this._detectAudioDestroy(line, lineNum);
        if (destroyMatch) {
          audioDestroys.push(destroyMatch);
        }
      }

      // 分析单例模式问题
      // 1. 检查是否有多个音频实例创建（非单例）
      if (audioCreates.length > 1) {
        // 检查是否在同一个函数中多次创建
        var createLocations = audioCreates.map(function(c) { return c.variableName; });
        var uniqueVars = [];
        for (var i = 0; i < createLocations.length; i++) {
          if (createLocations[i] && uniqueVars.indexOf(createLocations[i]) === -1) {
            uniqueVars.push(createLocations[i]);
          }
        }

        if (uniqueVars.length > 1) {
          issues.push(AuditReport.createIssue({
            category: AuditConfig.AuditCategory.BUG,
            severity: AuditConfig.AuditSeverity.MAJOR,
            type: AuditConfig.AuditIssueType.AUDIO_NOT_SINGLETON,
            file: filePath,
            line: audioCreates[1].line,
            description: '页面中存在多个音频实例变量（' + uniqueVars.join(', ') + '），违反单例模式',
            suggestion: '使用单一音频实例管理所有播放，切换音频时先stop()再更换src',
            autoFixable: false,
            metadata: {
              instanceCount: uniqueVars.length,
              instances: uniqueVars
            }
          }));
        }
      }

      // 2. 检查每个音频实例是否正确管理
      for (var j = 0; j < audioCreates.length; j++) {
        var audioCreate = audioCreates[j];
        var issue = this._analyzeSingletonCompliance(audioCreate, audioDestroys, hasOnUnload, onUnloadContent, filePath, code);
        if (issue) {
          issues.push(issue);
        }
      }

      // 3. 检查是否在循环或频繁调用的函数中创建音频实例
      var loopCreateIssue = this._checkLoopCreation(code, filePath, audioCreates);
      if (loopCreateIssue) {
        issues.push(loopCreateIssue);
      }

    } catch (error) {
      console.error('❌ 单例模式检查失败:', error);
    }

    return issues;
  },


  /**
   * 检查iOS兼容性配置
   * 验证obeyMuteSwitch等关键配置是否正确
   *
   * @param {Object} options - 检查选项
   * @param {string} options.code - 文件代码
   * @param {string} options.filePath - 文件路径
   * @returns {Object} iOS配置分析结果
   *
   * **Validates: Requirements 10.2**
   *
   * @example
   * var result = AudioBugDetector.checkiOSCompatibility({
   *   code: jsCode,
   *   filePath: 'pages/audio-player/index.js'
   * });
   */
  checkiOSCompatibility: function(options) {
    var result = {
      obeyMuteSwitch: null,           // 是否正确设置为false
      mixWithOther: null,             // 混音配置
      speakerOn: null,                // 扬声器配置
      hasUserInteractionTrigger: false, // 是否在用户交互中触发
      hasGlobalConfig: false,         // 是否使用全局配置wx.setInnerAudioOption
      hasInstanceConfig: false,       // 是否在实例上配置
      issues: []
    };

    options = options || {};

    if (!options.code || !options.filePath) {
      return result;
    }

    try {
      var code = options.code;
      var filePath = options.filePath;
      var lines = code.split('\n');

      // 1. 检查全局配置 wx.setInnerAudioOption
      var globalConfigMatch = this._detectGlobalAudioConfig(code);
      if (globalConfigMatch) {
        result.hasGlobalConfig = true;
        result.obeyMuteSwitch = globalConfigMatch.obeyMuteSwitch;
        result.mixWithOther = globalConfigMatch.mixWithOther;
        result.speakerOn = globalConfigMatch.speakerOn;
      }

      // 2. 检查实例配置
      var instanceConfigMatch = this._detectInstanceAudioConfig(code);
      if (instanceConfigMatch) {
        result.hasInstanceConfig = true;
        // 实例配置优先级低于全局配置
        if (result.obeyMuteSwitch === null) {
          result.obeyMuteSwitch = instanceConfigMatch.obeyMuteSwitch;
        }
      }

      // 3. 检查是否在用户交互中触发播放
      result.hasUserInteractionTrigger = this._detectUserInteractionTrigger(code);

      // 4. 生成问题报告
      // 检查obeyMuteSwitch配置
      if (!result.hasGlobalConfig && !result.hasInstanceConfig) {
        result.issues.push(AuditReport.createIssue({
          category: AuditConfig.AuditCategory.BUG,
          severity: AuditConfig.AuditSeverity.CRITICAL,
          type: AuditConfig.AuditIssueType.AUDIO_IOS_MUTE_SWITCH,
          file: filePath,
          description: '未配置obeyMuteSwitch，iOS静音模式下音频将无法播放',
          suggestion: '在app.js的onLaunch中调用wx.setInnerAudioOption({ obeyMuteSwitch: false })进行全局配置',
          autoFixable: false,
          metadata: {
            hasGlobalConfig: false,
            hasInstanceConfig: false
          }
        }));
      } else if (result.obeyMuteSwitch !== false) {
        result.issues.push(AuditReport.createIssue({
          category: AuditConfig.AuditCategory.BUG,
          severity: AuditConfig.AuditSeverity.CRITICAL,
          type: AuditConfig.AuditIssueType.AUDIO_IOS_MUTE_SWITCH,
          file: filePath,
          description: 'obeyMuteSwitch未设置为false，iOS静音模式下音频将无法播放',
          suggestion: '将obeyMuteSwitch设置为false：wx.setInnerAudioOption({ obeyMuteSwitch: false })',
          autoFixable: false,
          metadata: {
            currentValue: result.obeyMuteSwitch,
            requiredValue: false
          }
        }));
      }

      // 检查用户交互触发
      if (!result.hasUserInteractionTrigger && this._hasAudioPlayCall(code)) {
        result.issues.push(AuditReport.createIssue({
          category: AuditConfig.AuditCategory.BUG,
          severity: AuditConfig.AuditSeverity.MAJOR,
          type: AuditConfig.AuditIssueType.AUDIO_IOS_MUTE_SWITCH,
          file: filePath,
          description: '音频播放可能未在用户交互回调中触发，iOS可能阻止自动播放',
          suggestion: '确保play()方法在bindtap、catchtap等用户交互事件的回调中调用',
          autoFixable: false,
          metadata: {
            hasUserInteractionTrigger: false
          }
        }));
      }

    } catch (error) {
      console.error('❌ iOS兼容性检查失败:', error);
      result.error = error.message;
    }

    return result;
  },


  /**
   * 检查音频状态管理
   * 检测潜在的竞态条件和状态管理问题
   *
   * @param {Object} options - 检查选项
   * @param {string} options.code - 文件代码
   * @param {string} options.filePath - 文件路径
   * @returns {Array} 状态管理问题列表
   *
   * **Validates: Requirements 10.3, 10.4, 10.5**
   *
   * @example
   * var issues = AudioBugDetector.checkStateManagement({
   *   code: jsCode,
   *   filePath: 'pages/audio-player/index.js'
   * });
   */
  checkStateManagement: function(options) {
    var issues = [];
    options = options || {};

    if (!options.code || !options.filePath) {
      return issues;
    }

    try {
      var code = options.code;
      var filePath = options.filePath;

      // 1. 检查是否有中断处理
      var hasInterruptionHandling = this._detectInterruptionHandling(code);
      if (!hasInterruptionHandling && this._hasAudioContext(code)) {
        issues.push(AuditReport.createIssue({
          category: AuditConfig.AuditCategory.BUG,
          severity: AuditConfig.AuditSeverity.MAJOR,
          type: AuditConfig.AuditIssueType.AUDIO_RACE_CONDITION,
          file: filePath,
          description: '未处理音频中断事件（电话、其他应用），可能导致播放状态不一致',
          suggestion: '注册onInterruptionBegin和onInterruptionEnd事件处理中断',
          autoFixable: false,
          metadata: {
            missingEvents: ['onInterruptionBegin', 'onInterruptionEnd']
          }
        }));
      }

      // 2. 检查播放状态标志管理
      var stateIssue = this._checkPlaybackStateManagement(code, filePath);
      if (stateIssue) {
        issues.push(stateIssue);
      }

      // 3. 检查切换音频时是否正确停止前一个
      var switchIssue = this._checkAudioSwitchPattern(code, filePath);
      if (switchIssue) {
        issues.push(switchIssue);
      }

      // 4. 检查异步操作的竞态条件
      var raceConditionIssues = this._detectRaceConditions(code, filePath);
      issues = issues.concat(raceConditionIssues);

    } catch (error) {
      console.error('❌ 状态管理检查失败:', error);
    }

    return issues;
  },

  /**
   * 检查错误处理
   * 验证是否有完善的错误处理和重试逻辑
   *
   * @param {Object} options - 检查选项
   * @param {string} options.code - 文件代码
   * @param {string} options.filePath - 文件路径
   * @returns {Array} 错误处理问题列表
   *
   * **Validates: Requirements 10.6**
   *
   * @example
   * var issues = AudioBugDetector.checkErrorHandling({
   *   code: jsCode,
   *   filePath: 'pages/audio-player/index.js'
   * });
   */
  checkErrorHandling: function(options) {
    var issues = [];
    options = options || {};

    if (!options.code || !options.filePath) {
      return issues;
    }

    try {
      var code = options.code;
      var filePath = options.filePath;

      // 检查是否有音频上下文
      if (!this._hasAudioContext(code)) {
        return issues;
      }

      // 1. 检查是否注册了onError事件
      var hasOnError = this._detectOnErrorHandler(code);
      if (!hasOnError) {
        issues.push(AuditReport.createIssue({
          category: AuditConfig.AuditCategory.BUG,
          severity: AuditConfig.AuditSeverity.MAJOR,
          type: AuditConfig.AuditIssueType.AUDIO_MISSING_ERROR_HANDLER,
          file: filePath,
          description: '音频实例未注册onError事件处理器，无法捕获播放错误',
          suggestion: '注册onError事件：audioContext.onError(function(res) { console.error(res.errMsg, res.errCode); })',
          autoFixable: false,
          metadata: {
            hasOnError: false
          }
        }));
      }

      // 2. 检查是否有重试逻辑
      var hasRetryLogic = this._detectRetryLogic(code);
      if (!hasRetryLogic && hasOnError) {
        issues.push(AuditReport.createIssue({
          category: AuditConfig.AuditCategory.BUG,
          severity: AuditConfig.AuditSeverity.MINOR,
          type: AuditConfig.AuditIssueType.AUDIO_MISSING_ERROR_HANDLER,
          file: filePath,
          description: '音频错误处理中未发现重试逻辑，加载失败时用户无法重试',
          suggestion: '在onError中提供重试选项，如显示重试按钮或自动重试',
          autoFixable: false,
          metadata: {
            hasOnError: true,
            hasRetryLogic: false
          }
        }));
      }

      // 3. 检查是否有用户友好的错误提示
      var hasUserFeedback = this._detectUserErrorFeedback(code);
      if (!hasUserFeedback && hasOnError) {
        issues.push(AuditReport.createIssue({
          category: AuditConfig.AuditCategory.BUG,
          severity: AuditConfig.AuditSeverity.MINOR,
          type: AuditConfig.AuditIssueType.AUDIO_MISSING_ERROR_HANDLER,
          file: filePath,
          description: '音频错误处理中未发现用户提示，用户可能不知道播放失败',
          suggestion: '在onError中使用wx.showToast或setData更新UI提示用户',
          autoFixable: false,
          metadata: {
            hasOnError: true,
            hasUserFeedback: false
          }
        }));
      }

    } catch (error) {
      console.error('❌ 错误处理检查失败:', error);
    }

    return issues;
  },


  /**
   * 综合音频审计
   * 执行所有音频相关检查并返回综合报告
   *
   * @param {Object} options - 审计选项
   * @param {string} options.code - 文件代码
   * @param {string} options.filePath - 文件路径
   * @returns {Object} 综合审计报告
   */
  auditAll: function(options) {
    var report = {
      timestamp: new Date().toISOString(),
      file: options.filePath,
      singletonPattern: null,
      iosCompatibility: null,
      stateManagement: null,
      errorHandling: null,
      summary: {
        totalIssues: 0,
        criticalIssues: 0,
        majorIssues: 0,
        minorIssues: 0,
        hasAudioCode: false
      },
      allIssues: [],
      recommendations: []
    };

    options = options || {};

    if (!options.code || !options.filePath) {
      return report;
    }

    try {
      // 检查是否有音频相关代码
      report.summary.hasAudioCode = this._hasAudioContext(options.code);

      if (!report.summary.hasAudioCode) {
        return report;
      }

      // 1. 检查单例模式
      var singletonIssues = this.checkSingletonPattern(options);
      report.singletonPattern = {
        issues: singletonIssues,
        passed: singletonIssues.length === 0
      };
      report.allIssues = report.allIssues.concat(singletonIssues);

      // 2. 检查iOS兼容性
      var iosResult = this.checkiOSCompatibility(options);
      report.iosCompatibility = iosResult;
      report.allIssues = report.allIssues.concat(iosResult.issues);

      // 3. 检查状态管理
      var stateIssues = this.checkStateManagement(options);
      report.stateManagement = {
        issues: stateIssues,
        passed: stateIssues.length === 0
      };
      report.allIssues = report.allIssues.concat(stateIssues);

      // 4. 检查错误处理
      var errorIssues = this.checkErrorHandling(options);
      report.errorHandling = {
        issues: errorIssues,
        passed: errorIssues.length === 0
      };
      report.allIssues = report.allIssues.concat(errorIssues);

      // 统计问题数量
      report.summary.totalIssues = report.allIssues.length;
      for (var i = 0; i < report.allIssues.length; i++) {
        var issue = report.allIssues[i];
        switch (issue.severity) {
          case AuditConfig.AuditSeverity.CRITICAL:
            report.summary.criticalIssues++;
            break;
          case AuditConfig.AuditSeverity.MAJOR:
            report.summary.majorIssues++;
            break;
          case AuditConfig.AuditSeverity.MINOR:
            report.summary.minorIssues++;
            break;
        }
      }

      // 生成建议
      report.recommendations = this._generateRecommendations(report);

    } catch (error) {
      console.error('❌ 综合音频审计失败:', error);
      report.error = error.message;
    }

    return report;
  },

  // ==================== 私有辅助方法 ====================

  /**
   * 提取函数内容
   * @private
   */
  _extractFunctionContent: function(lines, startLine) {
    var content = [];
    var braceCount = 0;
    var started = false;

    for (var i = startLine; i < lines.length; i++) {
      var line = lines[i];
      content.push(line);

      // 计算大括号
      for (var j = 0; j < line.length; j++) {
        if (line[j] === '{') {
          braceCount++;
          started = true;
        } else if (line[j] === '}') {
          braceCount--;
        }
      }

      // 函数结束
      if (started && braceCount === 0) {
        break;
      }
    }

    return content.join('\n');
  },

  /**
   * 检测音频实例创建
   * @private
   */
  _detectAudioCreate: function(line, lineNum) {
    var patterns = [
      // this.audio = wx.createInnerAudioContext()
      /this\.(\w+)\s*=\s*wx\.createInnerAudioContext\s*\(/,
      // var audio = wx.createInnerAudioContext()
      /var\s+(\w+)\s*=\s*wx\.createInnerAudioContext\s*\(/,
      // self.audio = wx.createInnerAudioContext()
      /self\.(\w+)\s*=\s*wx\.createInnerAudioContext\s*\(/,
      // const audio = wx.createInnerAudioContext() (TypeScript)
      /(?:const|let)\s+(\w+)\s*=\s*wx\.createInnerAudioContext\s*\(/,
      // 直接调用不保存
      /wx\.createInnerAudioContext\s*\(/
    ];

    for (var i = 0; i < patterns.length; i++) {
      var match = line.match(patterns[i]);
      if (match) {
        var isStored = i < 4;
        var varName = isStored ? match[1] : null;

        return {
          line: lineNum + 1,
          code: line.trim(),
          variableName: varName,
          isStored: isStored
        };
      }
    }

    return null;
  },

  /**
   * 检测音频destroy调用
   * @private
   */
  _detectAudioDestroy: function(line, lineNum) {
    var patterns = [
      /this\.(\w+)\.destroy\s*\(/,
      /self\.(\w+)\.destroy\s*\(/,
      /(\w+)\.destroy\s*\(/
    ];

    for (var i = 0; i < patterns.length; i++) {
      var match = line.match(patterns[i]);
      if (match) {
        return {
          line: lineNum + 1,
          code: line.trim(),
          variableName: match[1]
        };
      }
    }

    return null;
  },


  /**
   * 分析单例合规性
   * @private
   */
  _analyzeSingletonCompliance: function(audioCreate, audioDestroys, hasOnUnload, onUnloadContent, filePath, code) {
    var varName = audioCreate.variableName;

    // 如果音频实例没有保存，报告问题
    if (!audioCreate.isStored) {
      return AuditReport.createIssue({
        category: AuditConfig.AuditCategory.BUG,
        severity: AuditConfig.AuditSeverity.MAJOR,
        type: AuditConfig.AuditIssueType.AUDIO_NOT_SINGLETON,
        file: filePath,
        line: audioCreate.line,
        description: 'createInnerAudioContext调用未保存返回的实例，无法实现单例管理',
        suggestion: '将音频实例保存到this上：this.audioContext = wx.createInnerAudioContext()',
        autoFixable: false,
        metadata: {
          code: audioCreate.code
        }
      });
    }

    // 检查是否有destroy调用
    var hasDestroy = false;
    for (var i = 0; i < audioDestroys.length; i++) {
      if (audioDestroys[i].variableName === varName) {
        hasDestroy = true;
        break;
      }
    }

    // 检查onUnload中是否有清理
    var destroyInOnUnload = false;
    if (hasOnUnload && onUnloadContent) {
      var destroyPattern = new RegExp('(this\\.|self\\.)?(' + varName + ')\\.destroy\\s*\\(');
      destroyInOnUnload = destroyPattern.test(onUnloadContent);
    }

    // 如果没有destroy调用，报告问题
    if (!hasDestroy) {
      return AuditReport.createIssue({
        category: AuditConfig.AuditCategory.BUG,
        severity: AuditConfig.AuditSeverity.MAJOR,
        type: AuditConfig.AuditIssueType.AUDIO_NOT_SINGLETON,
        file: filePath,
        line: audioCreate.line,
        description: '音频实例 ' + varName + ' 未找到destroy()调用，页面卸载时可能导致内存泄漏',
        suggestion: '在onUnload中添加：if (this.' + varName + ') { this.' + varName + '.stop(); this.' + varName + '.destroy(); this.' + varName + ' = null; }',
        autoFixable: true,
        fixCode: this._generateAudioCleanupCode(varName),
        metadata: {
          variableName: varName
        }
      });
    }

    return null;
  },

  /**
   * 检查循环中创建音频实例
   * @private
   */
  _checkLoopCreation: function(code, filePath, audioCreates) {
    // 检查是否在循环或频繁调用的函数中创建
    var loopPatterns = [
      /for\s*\([^)]*\)\s*\{[^}]*createInnerAudioContext/,
      /while\s*\([^)]*\)\s*\{[^}]*createInnerAudioContext/,
      /\.forEach\s*\([^)]*\{[^}]*createInnerAudioContext/,
      /\.map\s*\([^)]*\{[^}]*createInnerAudioContext/
    ];

    for (var i = 0; i < loopPatterns.length; i++) {
      if (loopPatterns[i].test(code)) {
        return AuditReport.createIssue({
          category: AuditConfig.AuditCategory.BUG,
          severity: AuditConfig.AuditSeverity.CRITICAL,
          type: AuditConfig.AuditIssueType.AUDIO_NOT_SINGLETON,
          file: filePath,
          description: '在循环中创建InnerAudioContext实例，会导致严重的内存泄漏',
          suggestion: '在循环外创建单一音频实例，循环中只更换src属性',
          autoFixable: false,
          metadata: {
            pattern: 'loop_creation'
          }
        });
      }
    }

    return null;
  },

  /**
   * 检测全局音频配置
   * @private
   */
  _detectGlobalAudioConfig: function(code) {
    // 匹配 wx.setInnerAudioOption({ obeyMuteSwitch: false })
    var pattern = /wx\.setInnerAudioOption\s*\(\s*\{([^}]+)\}/;
    var match = code.match(pattern);

    if (!match) {
      return null;
    }

    var configStr = match[1];
    var result = {
      obeyMuteSwitch: null,
      mixWithOther: null,
      speakerOn: null
    };

    // 解析obeyMuteSwitch
    var obeyMatch = configStr.match(/obeyMuteSwitch\s*:\s*(true|false)/);
    if (obeyMatch) {
      result.obeyMuteSwitch = obeyMatch[1] === 'true';
    }

    // 解析mixWithOther
    var mixMatch = configStr.match(/mixWithOther\s*:\s*(true|false)/);
    if (mixMatch) {
      result.mixWithOther = mixMatch[1] === 'true';
    }

    // 解析speakerOn
    var speakerMatch = configStr.match(/speakerOn\s*:\s*(true|false)/);
    if (speakerMatch) {
      result.speakerOn = speakerMatch[1] === 'true';
    }

    return result;
  },

  /**
   * 检测实例音频配置
   * @private
   */
  _detectInstanceAudioConfig: function(code) {
    // 匹配 audioContext.obeyMuteSwitch = false
    var patterns = [
      /\.obeyMuteSwitch\s*=\s*(true|false)/,
      /obeyMuteSwitch\s*:\s*(true|false)/  // 在createInnerAudioContext参数中
    ];

    for (var i = 0; i < patterns.length; i++) {
      var match = code.match(patterns[i]);
      if (match) {
        return {
          obeyMuteSwitch: match[1] === 'true'
        };
      }
    }

    return null;
  },

  /**
   * 检测用户交互触发
   * @private
   */
  _detectUserInteractionTrigger: function(code) {
    // 检查play()是否在用户交互回调中
    var interactionPatterns = [
      /bindtap\s*=\s*["'][^"']*play/i,
      /catchtap\s*=\s*["'][^"']*play/i,
      /bind:tap\s*=\s*["'][^"']*play/i,
      /onTap\s*[:(][^)]*\.play\s*\(/,
      /handleTap\s*[:(][^)]*\.play\s*\(/,
      /onClick\s*[:(][^)]*\.play\s*\(/,
      /playAudio\s*[:(]/,  // 常见的播放函数名
      /handlePlay\s*[:(]/,
      /onPlayTap\s*[:(]/
    ];

    for (var i = 0; i < interactionPatterns.length; i++) {
      if (interactionPatterns[i].test(code)) {
        return true;
      }
    }

    return false;
  },

  /**
   * 检查是否有audio play调用
   * @private
   */
  _hasAudioPlayCall: function(code) {
    return /\.play\s*\(/.test(code);
  },

  /**
   * 检查是否有音频上下文
   * @private
   */
  _hasAudioContext: function(code) {
    return /createInnerAudioContext/.test(code) || /InnerAudioContext/.test(code);
  },


  /**
   * 检测中断处理
   * @private
   */
  _detectInterruptionHandling: function(code) {
    // 检查是否注册了中断事件
    var hasBegin = /onInterruptionBegin/.test(code);
    var hasEnd = /onInterruptionEnd/.test(code);
    return hasBegin && hasEnd;
  },

  /**
   * 检查播放状态管理
   * @private
   */
  _checkPlaybackStateManagement: function(code, filePath) {
    // 检查是否有播放状态标志
    var hasPlayingFlag = /isPlaying|playing|audioPlaying|playState/.test(code);
    var hasPlayCall = /\.play\s*\(/.test(code);
    var hasPauseCall = /\.pause\s*\(/.test(code);
    var hasStopCall = /\.stop\s*\(/.test(code);

    // 如果有播放控制但没有状态标志
    if ((hasPlayCall || hasPauseCall || hasStopCall) && !hasPlayingFlag) {
      return AuditReport.createIssue({
        category: AuditConfig.AuditCategory.BUG,
        severity: AuditConfig.AuditSeverity.MINOR,
        type: AuditConfig.AuditIssueType.AUDIO_RACE_CONDITION,
        file: filePath,
        description: '未发现播放状态标志变量，可能导致UI状态与实际播放状态不同步',
        suggestion: '使用isPlaying等状态变量跟踪播放状态，在onPlay/onPause/onStop事件中更新',
        autoFixable: false,
        metadata: {
          hasPlayingFlag: false
        }
      });
    }

    return null;
  },

  /**
   * 检查音频切换模式
   * @private
   */
  _checkAudioSwitchPattern: function(code, filePath) {
    // 检查是否在设置新src前停止当前播放
    var hasSrcAssignment = /\.src\s*=/.test(code);
    var hasStopBeforeSrc = /\.stop\s*\([^)]*\)[;\s]*[^;]*\.src\s*=/.test(code);

    // 如果有src赋值但没有先stop
    if (hasSrcAssignment && !hasStopBeforeSrc) {
      // 进一步检查是否有条件判断
      var hasConditionalStop = /if\s*\([^)]*\)\s*\{[^}]*\.stop\s*\(/.test(code);

      if (!hasConditionalStop) {
        return AuditReport.createIssue({
          category: AuditConfig.AuditCategory.BUG,
          severity: AuditConfig.AuditSeverity.MAJOR,
          type: AuditConfig.AuditIssueType.AUDIO_RACE_CONDITION,
          file: filePath,
          description: '切换音频时可能未先停止当前播放，可能导致音频重叠或状态混乱',
          suggestion: '在更换src前先调用stop()：this.audioContext.stop(); this.audioContext.src = newSrc;',
          autoFixable: false,
          metadata: {
            hasSrcAssignment: true,
            hasStopBeforeSrc: false
          }
        });
      }
    }

    return null;
  },

  /**
   * 检测竞态条件
   * @private
   */
  _detectRaceConditions: function(code, filePath) {
    var issues = [];

    // 1. 检查是否在异步回调中直接操作音频而没有检查实例是否存在
    var asyncPatterns = [
      /setTimeout\s*\([^)]*\.play\s*\(/,
      /Promise[^}]*\.play\s*\(/,
      /\.then\s*\([^)]*\.play\s*\(/
    ];

    for (var i = 0; i < asyncPatterns.length; i++) {
      if (asyncPatterns[i].test(code)) {
        // 检查是否有实例检查
        var hasInstanceCheck = /if\s*\(\s*this\.\w+\s*\)/.test(code);
        if (!hasInstanceCheck) {
          issues.push(AuditReport.createIssue({
            category: AuditConfig.AuditCategory.BUG,
            severity: AuditConfig.AuditSeverity.MINOR,
            type: AuditConfig.AuditIssueType.AUDIO_RACE_CONDITION,
            file: filePath,
            description: '在异步回调中操作音频实例前未检查实例是否存在，页面卸载后可能报错',
            suggestion: '在异步回调中操作前检查实例：if (this.audioContext) { this.audioContext.play(); }',
            autoFixable: false,
            metadata: {
              pattern: 'async_without_check'
            }
          }));
          break;
        }
      }
    }

    // 2. 检查是否有多个play调用可能同时执行
    var playCallCount = (code.match(/\.play\s*\(/g) || []).length;
    if (playCallCount > 3) {
      // 检查是否有防抖/节流
      var hasDebounce = /debounce|throttle|playLock|isPlaying/.test(code);
      if (!hasDebounce) {
        issues.push(AuditReport.createIssue({
          category: AuditConfig.AuditCategory.BUG,
          severity: AuditConfig.AuditSeverity.MINOR,
          type: AuditConfig.AuditIssueType.AUDIO_RACE_CONDITION,
          file: filePath,
          description: '存在多个play()调用点，可能存在重复播放的竞态条件',
          suggestion: '使用播放锁或状态检查防止重复播放：if (!this.isPlaying) { this.audioContext.play(); }',
          autoFixable: false,
          metadata: {
            playCallCount: playCallCount
          }
        }));
      }
    }

    return issues;
  },

  /**
   * 检测onError处理器
   * @private
   */
  _detectOnErrorHandler: function(code) {
    return /\.onError\s*\(/.test(code) || /onError\s*:/.test(code);
  },

  /**
   * 检测重试逻辑
   * @private
   */
  _detectRetryLogic: function(code) {
    var retryPatterns = [
      /retry/i,
      /重试/,
      /再试/,
      /重新播放/,
      /playAgain/i,
      /reloadAudio/i
    ];

    for (var i = 0; i < retryPatterns.length; i++) {
      if (retryPatterns[i].test(code)) {
        return true;
      }
    }

    return false;
  },

  /**
   * 检测用户错误反馈
   * @private
   */
  _detectUserErrorFeedback: function(code) {
    var feedbackPatterns = [
      /wx\.showToast/,
      /wx\.showModal/,
      /setData\s*\(\s*\{[^}]*error/i,
      /setData\s*\(\s*\{[^}]*fail/i,
      /setData\s*\(\s*\{[^}]*播放失败/,
      /showError/i
    ];

    for (var i = 0; i < feedbackPatterns.length; i++) {
      if (feedbackPatterns[i].test(code)) {
        return true;
      }
    }

    return false;
  },

  /**
   * 生成音频清理代码
   * @private
   */
  _generateAudioCleanupCode: function(varName) {
    return [
      '// 在onUnload中添加以下代码:',
      'if (this.' + varName + ') {',
      '  this.' + varName + '.stop();',
      '  this.' + varName + '.destroy();',
      '  this.' + varName + ' = null;',
      '}'
    ].join('\n');
  },

  /**
   * 生成建议
   * @private
   */
  _generateRecommendations: function(report) {
    var recommendations = [];

    // iOS兼容性建议
    if (report.iosCompatibility && !report.iosCompatibility.hasGlobalConfig) {
      recommendations.push({
        priority: 'high',
        title: '配置全局音频选项',
        description: '在app.js的onLaunch中调用wx.setInnerAudioOption({ obeyMuteSwitch: false, speakerOn: true })确保iOS静音模式下正常播放'
      });
    }

    // 单例模式建议
    if (report.singletonPattern && !report.singletonPattern.passed) {
      recommendations.push({
        priority: 'high',
        title: '实现音频单例模式',
        description: '每个页面只创建一个InnerAudioContext实例，切换音频时更换src而非创建新实例'
      });
    }

    // 错误处理建议
    if (report.errorHandling && !report.errorHandling.passed) {
      recommendations.push({
        priority: 'medium',
        title: '完善错误处理',
        description: '注册onError事件，提供用户友好的错误提示和重试选项'
      });
    }

    // 状态管理建议
    if (report.stateManagement && !report.stateManagement.passed) {
      recommendations.push({
        priority: 'medium',
        title: '优化状态管理',
        description: '使用状态变量跟踪播放状态，处理中断事件，防止竞态条件'
      });
    }

    return recommendations;
  }
};

// 导出模块
module.exports = AudioBugDetector;
