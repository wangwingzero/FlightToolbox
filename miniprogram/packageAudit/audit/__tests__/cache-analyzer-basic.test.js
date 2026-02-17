'use strict';

/**
 * 缓存模式分析器基础测试
 *
 * 测试 CacheAnalyzer 的核心功能
 *
 * @module cache-analyzer-basic.test
 */

var CacheAnalyzer = require('../cache-analyzer.js');
var AuditConfig = require('../audit-config.js');

describe('CacheAnalyzer Basic Tests', function() {

  describe('Constants', function() {
    it('should have STORAGE_API_PATTERNS defined', function() {
      expect(CacheAnalyzer.STORAGE_API_PATTERNS).toBeDefined();
      expect(CacheAnalyzer.STORAGE_API_PATTERNS.SYNC_GET).toBeDefined();
      expect(CacheAnalyzer.STORAGE_API_PATTERNS.ASYNC_GET).toBeDefined();
    });

    it('should have CRITICAL_CACHE_KEY_PATTERNS defined', function() {
      expect(CacheAnalyzer.CRITICAL_CACHE_KEY_PATTERNS).toBeDefined();
      expect(CacheAnalyzer.CRITICAL_CACHE_KEY_PATTERNS.length).toBeGreaterThan(0);
      expect(CacheAnalyzer.CRITICAL_CACHE_KEY_PATTERNS).toContain('cache');
      expect(CacheAnalyzer.CRITICAL_CACHE_KEY_PATTERNS).toContain('config');
    });

    it('should have VERSION_MANAGER_PATTERNS defined', function() {
      expect(CacheAnalyzer.VERSION_MANAGER_PATTERNS).toBeDefined();
      expect(CacheAnalyzer.VERSION_MANAGER_PATTERNS.IMPORT).toBeDefined();
      expect(CacheAnalyzer.VERSION_MANAGER_PATTERNS.GET_VERSIONED_KEY).toBeDefined();
    });
  });

  describe('checkVersionManagerUsage', function() {
    it('should detect version manager import', function() {
      var code = [
        "var VersionManager = require('../../utils/version-manager.js');",
        "var key = VersionManager.getVersionedKey('my_cache');",
        "wx.setStorageSync(key, data);"
      ].join('\n');

      var result = CacheAnalyzer.checkVersionManagerUsage({
        code: code,
        filePath: 'test/file1.js'
      });

      expect(result.filesWithVersionManager.length).toBe(1);
      expect(result.filesWithVersionedKeys.length).toBe(1);
      expect(result.versionedKeyUsageCount).toBe(1);
    });

    it('should detect missing version manager for critical cache keys', function() {
      var code = [
        "function saveData() {",
        "  wx.setStorageSync('user_cache_data', data);",
        "}"
      ].join('\n');

      var result = CacheAnalyzer.checkVersionManagerUsage({
        code: code,
        filePath: 'test/file2.js'
      });

      expect(result.filesWithVersionManager.length).toBe(0);
      expect(result.filesWithStorageButNoVersioning.length).toBe(1);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('should not flag files without storage operations', function() {
      var code = [
        "function doSomething() {",
        "  console.log('hello');",
        "}"
      ].join('\n');

      var result = CacheAnalyzer.checkVersionManagerUsage({
        code: code,
        filePath: 'test/file3.js'
      });

      expect(result.filesWithStorageButNoVersioning.length).toBe(0);
      expect(result.issues.length).toBe(0);
    });

    it('should detect getEnvScopedKey usage', function() {
      var code = [
        "var VersionManager = require('../../utils/version-manager.js');",
        "var key = VersionManager.getEnvScopedKey('settings');",
        "wx.setStorageSync(key, settings);"
      ].join('\n');

      var result = CacheAnalyzer.checkVersionManagerUsage({
        code: code,
        filePath: 'test/file4.js'
      });

      expect(result.filesWithVersionedKeys.length).toBe(1);
      expect(result.versionedKeyUsageCount).toBe(1);
    });
  });

  describe('detectSyncStorageOperations', function() {
    it('should detect sync storage operations', function() {
      var code = [
        "function onLoad() {",
        "  var data = wx.getStorageSync('my_key');",
        "  console.log(data);",
        "}"
      ].join('\n');

      var result = CacheAnalyzer.detectSyncStorageOperations({
        code: code,
        filePath: 'test/file.js'
      });

      expect(result.syncOperationCount).toBe(1);
      expect(result.syncOperations.length).toBe(1);
      expect(result.syncOperations[0].api).toBe('wx.getStorageSync');
    });

    it('should detect async storage operations', function() {
      var code = [
        "function saveData() {",
        "  wx.setStorage({",
        "    key: 'async_key',",
        "    data: { foo: 'bar' },",
        "    success: function() {},",
        "    fail: function(err) { console.error(err); }",
        "  });",
        "}"
      ].join('\n');

      var result = CacheAnalyzer.detectSyncStorageOperations({
        code: code,
        filePath: 'test/file.js'
      });

      expect(result.asyncOperationCount).toBe(1);
    });

    it('should identify convertible sync operations', function() {
      var code = [
        "function saveUserData() {",
        "  wx.setStorageSync('user_data', userData);",
        "}"
      ].join('\n');

      var result = CacheAnalyzer.detectSyncStorageOperations({
        code: code,
        filePath: 'test/file.js'
      });

      expect(result.convertibleOperations.length).toBe(1);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('should not flag sync operations in onLaunch as convertible', function() {
      var code = [
        "App({",
        "  onLaunch: function() {",
        "    var config = wx.getStorageSync('app_config');",
        "    this.globalData.config = config;",
        "  }",
        "});"
      ].join('\n');

      var result = CacheAnalyzer.detectSyncStorageOperations({
        code: code,
        filePath: 'app.js'
      });

      expect(result.syncOperationCount).toBe(1);
      expect(result.acceptableSyncOperations.length).toBe(1);
      expect(result.convertibleOperations.length).toBe(0);
    });

    it('should detect all sync API types', function() {
      var code = [
        "function test() {",
        "  wx.getStorageSync('key1');",
        "  wx.setStorageSync('key2', data);",
        "  wx.removeStorageSync('key3');",
        "  wx.clearStorageSync();",
        "  wx.getStorageInfoSync();",
        "}"
      ].join('\n');

      var result = CacheAnalyzer.detectSyncStorageOperations({
        code: code,
        filePath: 'test/file.js'
      });

      expect(result.syncOperationCount).toBe(5);
    });
  });

  describe('checkStorageQuotaMonitoring', function() {
    it('should detect quota monitoring implementation', function() {
      var code = [
        "function checkStorage() {",
        "  var info = wx.getStorageInfoSync();",
        "  var usagePercent = info.currentSize / info.limitSize * 100;",
        "  if (usagePercent > 80) {",
        "    cleanupOldCache();",
        "  }",
        "}"
      ].join('\n');

      var result = CacheAnalyzer.checkStorageQuotaMonitoring({
        code: code,
        filePath: 'test/file.js'
      });

      expect(result.hasQuotaMonitoring).toBe(true);
    });

    it('should detect cleanup mechanism', function() {
      var code = [
        "function cleanupOldCache() {",
        "  wx.removeStorageSync('old_data');",
        "}"
      ].join('\n');

      var result = CacheAnalyzer.checkStorageQuotaMonitoring({
        code: code,
        filePath: 'test/file.js'
      });

      expect(result.hasCleanupMechanism).toBe(true);
    });

    it('should detect LRU strategy', function() {
      var code = [
        "function evictLRU() {",
        "  var cacheIndex = wx.getStorageSync('cache_index');",
        "  // Sort by lastAccess time",
        "  var sorted = Object.keys(cacheIndex).sort(function(a, b) {",
        "    return cacheIndex[a].lastAccess - cacheIndex[b].lastAccess;",
        "  });",
        "  // Remove oldest",
        "  wx.removeStorageSync(sorted[0]);",
        "}"
      ].join('\n');

      var result = CacheAnalyzer.checkStorageQuotaMonitoring({
        code: code,
        filePath: 'test/file.js'
      });

      expect(result.hasLRUStrategy).toBe(true);
    });

    it('should flag missing quota monitoring', function() {
      var code = [
        "function saveData() {",
        "  wx.setStorageSync('data', value);",
        "}"
      ].join('\n');

      var result = CacheAnalyzer.checkStorageQuotaMonitoring({
        code: code,
        filePath: 'test/file.js'
      });

      expect(result.hasQuotaMonitoring).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe('checkStorageErrorHandling', function() {
    it('should detect try-catch error handling for sync operations', function() {
      var code = [
        "function getData() {",
        "  try {",
        "    var data = wx.getStorageSync('key');",
        "    return data;",
        "  } catch (e) {",
        "    console.error('Storage error:', e);",
        "    return null;",
        "  }",
        "}"
      ].join('\n');

      var result = CacheAnalyzer.checkStorageErrorHandling({
        code: code,
        filePath: 'test/file.js'
      });

      expect(result.operationsWithTryCatch.length).toBe(1);
      expect(result.operationsWithoutHandling.length).toBe(0);
    });

    it('should detect fail callback for async operations', function() {
      var code = [
        "function saveData() {",
        "  wx.setStorage({",
        "    key: 'my_key',",
        "    data: value,",
        "    success: function() { console.log('saved'); },",
        "    fail: function(err) { console.error(err); }",
        "  });",
        "}"
      ].join('\n');

      var result = CacheAnalyzer.checkStorageErrorHandling({
        code: code,
        filePath: 'test/file.js'
      });

      expect(result.operationsWithFailCallback.length).toBe(1);
      expect(result.operationsWithoutHandling.length).toBe(0);
    });

    it('should flag operations without error handling', function() {
      var code = [
        "function getData() {",
        "  var data = wx.getStorageSync('key');",
        "  return data;",
        "}"
      ].join('\n');

      var result = CacheAnalyzer.checkStorageErrorHandling({
        code: code,
        filePath: 'test/file.js'
      });

      expect(result.operationsWithoutHandling.length).toBe(1);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe('scanAll', function() {
    it('should return comprehensive analysis result', function() {
      var code = [
        "var VersionManager = require('../../utils/version-manager.js');",
        "",
        "function onLoad() {",
        "  try {",
        "    var key = VersionManager.getVersionedKey('user_data');",
        "    var data = wx.getStorageSync(key);",
        "    return data;",
        "  } catch (e) {",
        "    console.error(e);",
        "    return null;",
        "  }",
        "}",
        "",
        "function checkQuota() {",
        "  var info = wx.getStorageInfoSync();",
        "  if (info.currentSize / info.limitSize > 0.8) {",
        "    cleanup();",
        "  }",
        "}"
      ].join('\n');

      var result = CacheAnalyzer.scanAll({
        code: code,
        filePath: 'test/file.js'
      });

      expect(result.versionManager).toBeDefined();
      expect(result.syncOperations).toBeDefined();
      expect(result.quotaMonitoring).toBeDefined();
      expect(result.errorHandling).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.allIssues).toBeDefined();
      expect(result.allRecommendations).toBeDefined();
    });
  });

  describe('generateReport', function() {
    it('should generate markdown report', function() {
      var code = [
        "function saveData() {",
        "  wx.setStorageSync('cache_data', data);",
        "}"
      ].join('\n');

      var scanResult = CacheAnalyzer.scanAll({
        code: code,
        filePath: 'test/file.js'
      });

      var report = CacheAnalyzer.generateReport(scanResult);

      expect(report).toContain('# 缓存模式分析报告');
      expect(report).toContain('## 📊 问题统计');
      expect(report).toContain('## 🔐 版本管理器使用情况');
      expect(report).toContain('## ⚡ 同步存储操作');
    });

    it('should handle null input', function() {
      var report = CacheAnalyzer.generateReport(null);
      expect(report).toContain('无分析结果');
    });
  });

});
