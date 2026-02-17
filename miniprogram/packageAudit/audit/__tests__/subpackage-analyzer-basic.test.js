'use strict';

/**
 * Basic tests for SubpackageAnalyzer
 * Validates the core functionality of the subpackage analyzer
 */

var SubpackageAnalyzer = require('../subpackage-analyzer.js');

describe('SubpackageAnalyzer Basic Tests', function() {
  describe('Constants', function() {
    it('should have correct LIMITS values', function() {
      expect(SubpackageAnalyzer.LIMITS.SINGLE_PACKAGE_MAX).toBe(2 * 1024 * 1024);
      expect(SubpackageAnalyzer.LIMITS.TOTAL_SIZE_MAX).toBe(30 * 1024 * 1024);
      expect(SubpackageAnalyzer.LIMITS.PRELOAD_QUOTA_PER_PAGE).toBe(2 * 1024 * 1024);
    });

    it('should have correct RECOMMENDED values', function() {
      expect(SubpackageAnalyzer.RECOMMENDED.SINGLE_PACKAGE).toBe(1.5 * 1024 * 1024);
      expect(SubpackageAnalyzer.RECOMMENDED.PRELOAD_QUOTA).toBe(1.9 * 1024 * 1024);
    });

    it('should have 31 audio packages', function() {
      expect(SubpackageAnalyzer.AUDIO_PACKAGES.length).toBe(31);
    });

    it('should have 5 walkaround image packages', function() {
      expect(SubpackageAnalyzer.WALKAROUND_IMAGE_PACKAGES.length).toBe(5);
    });
  });

  describe('analyzePackageSizes', function() {
    it('should detect exceeding packages', function() {
      var result = SubpackageAnalyzer.analyzePackageSizes({
        appJson: {
          subPackages: [
            { root: 'pkgA', name: 'testPackage', pages: ['index'] }
          ]
        },
        packageSizes: {
          mainPackage: 1.5 * 1024 * 1024,
          subpackages: {
            'pkgA': 2.1 * 1024 * 1024
          }
        }
      });

      expect(result.exceedingPackages.length).toBe(1);
      expect(result.exceedingPackages[0].name).toBe('pkgA');
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('should detect warning packages', function() {
      var result = SubpackageAnalyzer.analyzePackageSizes({
        appJson: {
          subPackages: [
            { root: 'pkgA', name: 'testPackage', pages: ['index'] }
          ]
        },
        packageSizes: {
          mainPackage: 1.0 * 1024 * 1024,
          subpackages: {
            'pkgA': 1.6 * 1024 * 1024
          }
        }
      });

      expect(result.warningPackages.length).toBe(1);
      expect(result.exceedingPackages.length).toBe(0);
    });

    it('should calculate total size correctly', function() {
      var mainSize = 1 * 1024 * 1024;
      var pkgASize = 500 * 1024;
      var pkgBSize = 500 * 1024;
      var expectedTotal = mainSize + pkgASize + pkgBSize;

      var result = SubpackageAnalyzer.analyzePackageSizes({
        appJson: {
          subPackages: [
            { root: 'pkgA', pages: ['index'] },
            { root: 'pkgB', pages: ['index'] }
          ]
        },
        packageSizes: {
          mainPackage: mainSize,
          subpackages: {
            'pkgA': pkgASize,
            'pkgB': pkgBSize
          }
        }
      });

      expect(result.totalSize).toBe(expectedTotal);
    });

    it('should identify audio packages', function() {
      var result = SubpackageAnalyzer.analyzePackageSizes({
        appJson: {
          subPackages: [
            { root: 'packageJapan', pages: ['index'] }
          ]
        },
        packageSizes: {
          mainPackage: 1 * 1024 * 1024,
          subpackages: {
            'packageJapan': 500 * 1024
          }
        }
      });

      expect(result.subpackages[0].isAudioPackage).toBe(true);
    });
  });

  describe('analyzePreloadRules', function() {
    it('should detect exceeding preload quota', function() {
      var result = SubpackageAnalyzer.analyzePreloadRules({
        appJson: {
          subPackages: [
            { root: 'pkgA', pages: ['index'] },
            { root: 'pkgB', pages: ['index'] }
          ],
          preloadRule: {
            'pages/home/index': {
              network: 'all',
              packages: ['pkgA', 'pkgB']
            }
          }
        },
        packageSizes: {
          mainPackage: 1 * 1024 * 1024,
          subpackages: {
            'pkgA': 1.2 * 1024 * 1024,
            'pkgB': 1.0 * 1024 * 1024
          }
        }
      });

      expect(result.length).toBe(1);
      expect(result[0].exceedsQuota).toBe(true);
      expect(result[0].issues.length).toBeGreaterThan(0);
    });

    it('should not flag preload within quota', function() {
      var result = SubpackageAnalyzer.analyzePreloadRules({
        appJson: {
          subPackages: [
            { root: 'pkgA', pages: ['index'] }
          ],
          preloadRule: {
            'pages/home/index': {
              network: 'all',
              packages: ['pkgA']
            }
          }
        },
        packageSizes: {
          mainPackage: 1 * 1024 * 1024,
          subpackages: {
            'pkgA': 500 * 1024
          }
        }
      });

      expect(result.length).toBe(1);
      expect(result[0].exceedsQuota).toBe(false);
    });
  });


  describe('checkPlaceholderPages', function() {
    it('should detect placeholder pages', function() {
      var result = SubpackageAnalyzer.checkPlaceholderPages({
        appJson: {
          subPackages: [
            { root: 'packageWalkaroundImages1', pages: ['pages/placeholder/index'] },
            { root: 'packageJapan', pages: ['index'] }
          ]
        }
      });

      expect(result.length).toBe(2);
      expect(result[0].hasPlaceholder).toBe(true);
      expect(result[1].hasPlaceholder).toBe(false);
    });

    it('should flag missing placeholder for walkaround image packages', function() {
      var result = SubpackageAnalyzer.checkPlaceholderPages({
        appJson: {
          subPackages: [
            { root: 'packageWalkaroundImages1', pages: ['index'] }
          ]
        }
      });

      expect(result[0].isWalkaroundImagePackage).toBe(true);
      expect(result[0].hasPlaceholder).toBe(false);
      expect(result[0].issues.length).toBeGreaterThan(0);
    });
  });

  describe('checkVersionedCacheKeys', function() {
    it('should detect unversioned cache keys', function() {
      var result = SubpackageAnalyzer.checkVersionedCacheKeys({
        files: [{
          path: 'utils/cache.js',
          code: 'wx.setStorageSync("image_cache_index", data);'
        }]
      });

      expect(result.length).toBe(1);
      expect(result[0].storageKey).toBe('image_cache_index');
      expect(result[0].looksLikeCacheKey).toBe(true);
    });

    it('should not flag versioned keys', function() {
      var result = SubpackageAnalyzer.checkVersionedCacheKeys({
        files: [{
          path: 'utils/cache.js',
          code: 'var key = VersionManager.getVersionedKey("my_cache"); wx.setStorageSync(key, data);'
        }]
      });

      expect(result.length).toBe(0);
    });

    it('should ignore system keys', function() {
      var result = SubpackageAnalyzer.checkVersionedCacheKeys({
        files: [{
          path: 'utils/cache.js',
          code: 'wx.setStorageSync("system_config", data);'
        }]
      });

      expect(result.length).toBe(0);
    });
  });

  describe('checkIndependentPackages', function() {
    it('should identify independent packages', function() {
      var result = SubpackageAnalyzer.checkIndependentPackages({
        appJson: {
          subPackages: [
            { root: 'pkgA', independent: true, pages: ['index'] },
            { root: 'pkgB', pages: ['index'] }
          ]
        }
      });

      expect(result.length).toBe(2);
      expect(result[0].isIndependent).toBe(true);
      expect(result[1].isIndependent).toBe(false);
    });

    it('should not suggest audio packages as independent', function() {
      var result = SubpackageAnalyzer.checkIndependentPackages({
        appJson: {
          subPackages: [
            { root: 'packageJapan', pages: ['index'] }
          ]
        }
      });

      expect(result[0].canBeIndependent).toBe(false);
    });
  });

  describe('Helper Functions', function() {
    it('should correctly identify audio packages', function() {
      expect(SubpackageAnalyzer.isAudioPackage('packageJapan')).toBe(true);
      expect(SubpackageAnalyzer.isAudioPackage('packageA')).toBe(false);
    });

    it('should correctly identify walkaround image packages', function() {
      expect(SubpackageAnalyzer.isWalkaroundImagePackage('packageWalkaroundImages1')).toBe(true);
      expect(SubpackageAnalyzer.isWalkaroundImagePackage('packageA')).toBe(false);
    });

    it('should correctly get package type', function() {
      expect(SubpackageAnalyzer.getPackageType('packageJapan')).toBe('audio');
      expect(SubpackageAnalyzer.getPackageType('packageWalkaroundImages1')).toBe('walkaround_image');
      expect(SubpackageAnalyzer.getPackageType('packageA')).toBe('functional');
    });

    it('should format sizes correctly', function() {
      expect(SubpackageAnalyzer._formatSize(0)).toBe('0 B');
      expect(SubpackageAnalyzer._formatSize(1024)).toBe('1.00 KB');
      expect(SubpackageAnalyzer._formatSize(1024 * 1024)).toBe('1.00 MB');
      expect(SubpackageAnalyzer._formatSize(2 * 1024 * 1024)).toBe('2.00 MB');
    });
  });

  describe('generateOptimizationSuggestions', function() {
    it('should generate suggestions for exceeding packages', function() {
      var result = SubpackageAnalyzer.generateOptimizationSuggestions({
        appJson: {
          subPackages: [
            { root: 'pkgA', pages: ['index'] }
          ]
        },
        packageSizes: {
          mainPackage: 1 * 1024 * 1024,
          subpackages: {
            'pkgA': 2.5 * 1024 * 1024
          }
        }
      });

      expect(result.length).toBeGreaterThan(0);
      var criticalSuggestion = result.find(function(s) { return s.type === 'size_critical'; });
      expect(criticalSuggestion).toBeDefined();
      expect(criticalSuggestion.priority).toBe('high');
    });
  });

  describe('analyzeAll', function() {
    it('should return comprehensive report', function() {
      var result = SubpackageAnalyzer.analyzeAll({
        appJson: {
          subPackages: [
            { root: 'pkgA', pages: ['index'] }
          ],
          preloadRule: {}
        },
        packageSizes: {
          mainPackage: 1 * 1024 * 1024,
          subpackages: {
            'pkgA': 500 * 1024
          }
        }
      });

      expect(result.timestamp).toBeDefined();
      expect(result.packageSizes).toBeDefined();
      expect(result.preloadRules).toBeDefined();
      expect(result.placeholderPages).toBeDefined();
      expect(result.suggestions).toBeDefined();
      expect(typeof result.totalIssues).toBe('number');
    });
  });

  describe('generateSummaryText', function() {
    it('should generate readable summary', function() {
      var report = SubpackageAnalyzer.analyzeAll({
        appJson: {
          subPackages: [
            { root: 'pkgA', pages: ['index'] }
          ],
          preloadRule: {}
        },
        packageSizes: {
          mainPackage: 1 * 1024 * 1024,
          subpackages: {
            'pkgA': 500 * 1024
          }
        }
      });

      var summary = SubpackageAnalyzer.generateSummaryText(report);

      expect(typeof summary).toBe('string');
      expect(summary).toContain('分包配置分析报告');
      expect(summary).toContain('体积统计');
    });

    it('should handle null report', function() {
      var summary = SubpackageAnalyzer.generateSummaryText(null);
      expect(summary).toBe('无分析报告');
    });
  });
});
