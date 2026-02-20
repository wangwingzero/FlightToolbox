/**
 * PackageCCAR 通用工具函数
 * 消除重复的工具代码
 */

var CCARConfig = require('./config.js');

var CCARUtils = {
  
  /**
   * 复制链接到剪贴板
   * @param {Object} item - 包含url字段的对象
   * @param {Function} successCallback - 成功回调
   * @param {Function} failCallback - 失败回调
   */
  copyLink: function(item, successCallback, failCallback) {
    if (item && item.url) {
      wx.setClipboardData({
        data: item.url,
        success: function() {
          wx.showToast({
            title: CCARConfig.MESSAGES.COPY_SUCCESS,
            icon: 'success',
            duration: 1500
          });
          if (successCallback) successCallback();
        },
        fail: function() {
          wx.showToast({
            title: CCARConfig.MESSAGES.COPY_FAIL,
            icon: 'none',
            duration: 1500
          });
          if (failCallback) failCallback();
        }
      });
    } else {
      wx.showToast({
        title: CCARConfig.MESSAGES.LINK_UNAVAILABLE,
        icon: 'none',
        duration: 1500
      });
    }
  },

  /**
   * 将 URL 统一转换为 https，避免 http 在部分环境下被拦截
   * @param {string} url - 原始链接
   * @returns {string} 规范化后的链接
   */
  normalizeUrl: function(url) {
    if (!url || typeof url !== 'string') return '';
    var normalized = url.trim();
    if (normalized.indexOf('//') === 0) {
      return 'https:' + normalized;
    }
    if (normalized.indexOf('http://') === 0) {
      return 'https://' + normalized.substring(7);
    }
    return normalized;
  },

  /**
   * 将相对路径拼接为完整 URL
   * @param {string} link - 可能为相对路径的链接
   * @param {string} baseUrl - 详情页链接
   * @returns {string} 完整 URL
   */
  buildFullUrl: function(link, baseUrl) {
    if (!link || typeof link !== 'string') return '';
    var cleaned = link.trim().replace(/&amp;/g, '&');
    if (!cleaned || cleaned.indexOf('javascript:') === 0) return '';

    // 处理形如 https:\/\/example.com 的转义格式
    cleaned = cleaned.replace(/\\\//g, '/');

    if (cleaned.indexOf('http://') === 0 || cleaned.indexOf('https://') === 0) {
      return this.normalizeUrl(cleaned);
    }

    var normalizedBase = this.normalizeUrl(baseUrl || '');
    var originMatch = normalizedBase.match(/^https?:\/\/[^\/]+/i);
    var origin = originMatch ? originMatch[0] : 'https://www.caac.gov.cn';

    if (cleaned.indexOf('//') === 0) {
      return 'https:' + cleaned;
    }

    if (cleaned.charAt(0) === '/') {
      return origin + cleaned;
    }

    // 相对路径：基于详情页目录拼接
    // 去掉 ./ 前缀（语义等同于当前目录）
    if (cleaned.indexOf('./') === 0) {
      cleaned = cleaned.substring(2);
    }
    var baseDir = normalizedBase.replace(/\/[^\/?#]*([?#].*)?$/, '/');
    return baseDir + cleaned;
  },

  /**
   * 从详情页 HTML 中提取附件链接（pdf/doc/docx/txt）
   * @param {string} html - 页面 HTML
   * @param {string} pageUrl - 详情页 URL（用于补全相对路径）
   * @returns {string} 附件完整链接，找不到返回空字符串
   */
  extractAttachmentUrlFromHtml: function(html, pageUrl) {
    if (!html || typeof html !== 'string') return '';

    var candidates = [];
    var patterns = [
      /(?:https?:\/\/[^"'\\s>]+(?:\.pdf|\.doc|\.docx|\.txt)(?:\?[^"'\\s>]*)?)/ig,
      /(?:\.\/[^"'\\s>]+(?:\.pdf|\.doc|\.docx|\.txt)(?:\?[^"'\\s>]*)?)/ig,
      /(?:\/[^"'\\s>]+(?:\.pdf|\.doc|\.docx|\.txt)(?:\?[^"'\\s>]*)?)/ig,
      /(?:https?:\\\/\\\/[^"'\\s>]+(?:\.pdf|\.doc|\.docx|\.txt)(?:\?[^"'\\s>]*)?)/ig,
      /(?:\\\/[^"'\\s>]+(?:\.pdf|\.doc|\.docx|\.txt)(?:\?[^"'\\s>]*)?)/ig
    ];

    for (var i = 0; i < patterns.length; i++) {
      var matched = html.match(patterns[i]);
      if (matched && matched.length) {
        candidates = candidates.concat(matched);
      }
    }

    if (!candidates.length) return '';

    // 去重并按优先级排序：优先 XXGK 路径和 P 开头附件
    var map = {};
    var list = [];
    candidates.forEach(function(link) {
      var normalized = (link || '').replace(/\\\//g, '/').replace(/&amp;/g, '&');
      if (!map[normalized]) {
        map[normalized] = true;
        list.push(normalized);
      }
    });

    list.sort(function(a, b) {
      var score = function(link) {
        var s = 0;
        if (link.indexOf('/XXGK/') !== -1) s += 4;
        if (link.indexOf('/P0') !== -1 || link.indexOf('/P1') !== -1 || link.indexOf('/P2') !== -1) s += 3;
        if (/\.pdf(\?|$)/i.test(link)) s += 2;
        // 显式相对路径 ./ 优先于被截断的绝对路径
        if (link.indexOf('./') === 0) s += 1;
        return s;
      };
      return score(b) - score(a);
    });

    return this.buildFullUrl(list[0], pageUrl);
  },

  /**
   * 清洗文件名片段，去除系统不支持字符
   * @param {string} text - 原始文本
   * @returns {string} 清洗后的文本
   */
  sanitizeFileNamePart: function(text) {
    if (text === undefined || text === null) return '';
    return String(text)
      .trim()
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
      .replace(/\s+/g, ' ')
      .replace(/[. ]+$/g, '');
  },

  /**
   * 获取响应头（忽略大小写）
   * @param {Object} headers - 响应头对象
   * @param {string} key - 目标key
   * @returns {string} 响应头值
   */
  getHeaderValue: function(headers, key) {
    if (!headers || !key) return '';
    if (headers[key]) return String(headers[key]);
    var lowerKey = key.toLowerCase();
    var keys = Object.keys(headers);
    for (var i = 0; i < keys.length; i++) {
      if (String(keys[i]).toLowerCase() === lowerKey) {
        return String(headers[keys[i]]);
      }
    }
    return '';
  },

  /**
   * 从 URL 或文件名中提取扩展名
   * @param {string} pathOrUrl - 路径或URL
   * @returns {string} 形如 ".pdf" 的扩展名
   */
  extractExtension: function(pathOrUrl) {
    if (!pathOrUrl || typeof pathOrUrl !== 'string') return '';
    var cleaned = pathOrUrl.split('#')[0].split('?')[0];
    try {
      cleaned = decodeURIComponent(cleaned);
    } catch (e) {}
    var match = cleaned.match(/\.([a-zA-Z0-9]{1,8})$/);
    return match ? ('.' + match[1].toLowerCase()) : '';
  },

  /**
   * 从 Content-Disposition 提取文件名
   * @param {string} contentDisposition - 响应头内容
   * @returns {string} 文件名
   */
  parseContentDispositionFilename: function(contentDisposition) {
    if (!contentDisposition || typeof contentDisposition !== 'string') return '';

    var utf8Match = contentDisposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
    if (utf8Match && utf8Match[1]) {
      try {
        return decodeURIComponent(utf8Match[1].replace(/^"(.*)"$/, '$1').trim());
      } catch (e) {}
    }

    var basicMatch = contentDisposition.match(/filename\s*=\s*"?([^";]+)"?/i);
    if (basicMatch && basicMatch[1]) {
      return basicMatch[1].trim();
    }

    return '';
  },

  /**
   * 推断下载文件扩展名
   * @param {string} downloadUrl - 下载地址
   * @param {Object} headers - 下载响应头
   * @returns {string} 扩展名
   */
  inferDownloadExtension: function(downloadUrl, headers) {
    var extFromUrl = this.extractExtension(downloadUrl);
    if (extFromUrl) return extFromUrl;

    var contentDisposition = this.getHeaderValue(headers, 'content-disposition');
    var headerFileName = this.parseContentDispositionFilename(contentDisposition);
    var extFromHeaderName = this.extractExtension(headerFileName);
    if (extFromHeaderName) return extFromHeaderName;

    var contentType = this.getHeaderValue(headers, 'content-type').toLowerCase();
    if (contentType.indexOf('pdf') !== -1) return '.pdf';
    if (contentType.indexOf('wordprocessingml.document') !== -1) return '.docx';
    if (contentType.indexOf('msword') !== -1) return '.doc';
    if (contentType.indexOf('text/plain') !== -1) return '.txt';

    return '.pdf';
  },

  /**
   * 按 CCAR-workflow 规则生成文件名
   * 规则：{validity!}{doc_number}{title}{ext}（validity=有效 时不加前缀）
   * @param {Object} item - 文档对象
   * @param {string} downloadUrl - 下载地址
   * @param {Object} headers - 下载响应头
   * @returns {string} 文件名
   */
  generateOfficialFileName: function(item, downloadUrl, headers) {
    var validity = this.sanitizeFileNamePart((item && item.validity) || '');
    var docNumber = this.sanitizeFileNamePart((item && item.doc_number) || '');
    var title = this.sanitizeFileNamePart((item && item.title) || '') || '未命名文件';

    var parts = [];
    if (validity && validity !== '有效') {
      parts.push(validity + '!');
    }
    if (docNumber) {
      parts.push(docNumber);
    }
    parts.push(title);

    var ext = this.inferDownloadExtension(downloadUrl, headers);
    var extTail = ext ? ext.replace(/^\./, '') : '';
    var filename = parts.join('');
    if (extTail) {
      filename = filename + '.' + extTail;
    }

    if (filename.length > 200) {
      var base = parts.join('');
      if (extTail) {
        var maxBaseLen = Math.max(1, 200 - 4 - extTail.length);
        filename = base.substring(0, maxBaseLen) + '....' + extTail;
      } else {
        filename = base.substring(0, 200);
      }
    }

    return filename;
  },

  /**
   * 保存下载文件到持久目录（自动命名）
   * @param {Object} item - 文档对象
   * @param {string} downloadUrl - 下载地址
   * @param {string} tempFilePath - 临时文件路径
   * @param {Object} headers - 下载响应头
   * @param {Function} successCallback - 成功回调，参数为保存后的路径
   * @param {Function} failCallback - 失败回调
   */
  saveDownloadedDocumentWithName: function(item, downloadUrl, tempFilePath, headers, successCallback, failCallback) {
    if (!tempFilePath) {
      if (failCallback) failCallback(new Error('临时文件路径为空'));
      return;
    }
    if (!wx.getFileSystemManager || !wx.env || !wx.env.USER_DATA_PATH) {
      if (failCallback) failCallback(new Error('当前环境不支持文件系统持久化'));
      return;
    }

    var self = this;
    var fs = wx.getFileSystemManager();
    var downloadDir = wx.env.USER_DATA_PATH + '/ccar-downloads';
    var fileName = self.generateOfficialFileName(item, downloadUrl, headers || {});
    var targetPath = downloadDir + '/' + fileName;

    var copyToTarget = function() {
      fs.copyFile({
        srcPath: tempFilePath,
        destPath: targetPath,
        success: function() {
          if (successCallback) successCallback(targetPath);
        },
        fail: function(err) {
          if (failCallback) failCallback(err || new Error('文件复制失败'));
        }
      });
    };

    var ensureDirAndSave = function() {
      // 同名文件覆盖，保证每次下载文件名稳定
      fs.access({
        path: targetPath,
        success: function() {
          fs.unlink({
            filePath: targetPath,
            success: function() {
              copyToTarget();
            },
            fail: function() {
              // 无法删除时退化为直接复制，避免中断主流程
              copyToTarget();
            }
          });
        },
        fail: function() {
          copyToTarget();
        }
      });
    };

    fs.access({
      path: downloadDir,
      success: function() {
        ensureDirAndSave();
      },
      fail: function() {
        fs.mkdir({
          dirPath: downloadDir,
          recursive: true,
          success: function() {
            ensureDirAndSave();
          },
          fail: function(err) {
            if (failCallback) failCallback(err || new Error('创建下载目录失败'));
          }
        });
      }
    });
  },

  /**
   * 解析官方附件下载链接
   * 优先使用 item.download_url / item.pdf_url，否则请求详情页提取附件链接
   * @param {Object} item - 文档对象
   * @param {Function} successCallback - 成功回调，参数为下载链接
   * @param {Function} failCallback - 失败回调
   */
  resolveOfficialDownloadUrl: function(item, successCallback, failCallback) {
    var self = this;

    if (!item || !item.url) {
      if (failCallback) failCallback(new Error('链接不可用'));
      return;
    }

    var pageUrl = self.normalizeUrl(item.url);

    // 链接本身就是可下载文件
    if (/\.(pdf|doc|docx|txt)(\?|$)/i.test(pageUrl)) {
      if (successCallback) successCallback(pageUrl);
      return;
    }

    // R2 镜像作为降级备选
    var r2Url = item.download_url || item.pdf_url || item.file_url || '';

    // 优先从局方官网抓取附件
    wx.request({
      url: pageUrl,
      method: 'GET',
      timeout: 15000,
      success: function(res) {
        if (res.statusCode === 200) {
          var html = res.data;
          if (typeof html !== 'string') {
            html = String(html || '');
          }
          var attachmentUrl = self.extractAttachmentUrlFromHtml(html, pageUrl);
          if (attachmentUrl) {
            if (successCallback) successCallback(attachmentUrl);
            return;
          }
        }
        // 局方未找到附件，降级 R2
        if (r2Url) {
          if (successCallback) successCallback(self.normalizeUrl(r2Url));
        } else if (failCallback) {
          failCallback(new Error('未找到附件链接'));
        }
      },
      fail: function() {
        // 局方网络不可用（飞行模式等），降级 R2
        if (r2Url) {
          if (successCallback) successCallback(self.normalizeUrl(r2Url));
        } else if (failCallback) {
          failCallback(new Error('请求失败'));
        }
      }
    });
  },

  /**
   * 直接下载并打开官方文档（优先附件）
   * @param {Object} item - 文档对象
   * @param {Object} options - 配置项
   */
  downloadOfficialDocument: function(item, options) {
    var self = this;
    var config = Object.assign({
      fallbackCopy: true
    }, options || {});

    if (!item || !item.url) {
      wx.showToast({
        title: CCARConfig.MESSAGES.LINK_UNAVAILABLE,
        icon: 'none',
        duration: 1500
      });
      return;
    }

    wx.showLoading({
      title: '解析附件中...'
    });

    self.resolveOfficialDownloadUrl(item, function(downloadUrl) {
      wx.hideLoading();
      wx.showLoading({
        title: '下载中...'
      });

      wx.downloadFile({
        url: downloadUrl,
        timeout: 30000,
        success: function(res) {
          wx.hideLoading();
          if (res.statusCode === 200 && res.tempFilePath) {
            self.saveDownloadedDocumentWithName(
              item,
              downloadUrl,
              res.tempFilePath,
              res.header || {},
              function(savedFilePath) {
                wx.openDocument({
                  filePath: savedFilePath,
                  showMenu: true,
                  fail: function() {
                    wx.showModal({
                      title: '已下载',
                      content: '文件已按规则命名保存，但当前设备无法直接预览。是否复制下载链接？',
                      confirmText: '复制链接',
                      success: function(modalRes) {
                        if (modalRes.confirm) {
                          wx.setClipboardData({
                            data: downloadUrl
                          });
                        }
                      }
                    });
                  }
                });
              },
              function() {
                // 持久化失败时，回退到临时文件预览
                wx.openDocument({
                  filePath: res.tempFilePath,
                  showMenu: true,
                  fail: function() {
                    wx.showModal({
                      title: '已下载',
                      content: '文件已下载，但当前设备无法直接预览。是否复制下载链接？',
                      confirmText: '复制链接',
                      success: function(modalRes) {
                        if (modalRes.confirm) {
                          wx.setClipboardData({
                            data: downloadUrl
                          });
                        }
                      }
                    });
                  }
                });
              }
            );
          } else {
            wx.showModal({
              title: '下载失败',
              content: '当前无法直接下载，是否复制局方页面链接？',
              confirmText: '复制链接',
              success: function(modalRes) {
                if (modalRes.confirm) {
                  self.copyLink(item);
                }
              }
            });
          }
        },
        fail: function() {
          wx.hideLoading();
          wx.showModal({
            title: '下载失败',
            content: '当前网络或域名限制导致下载失败，是否复制局方页面链接？',
            confirmText: '复制链接',
            success: function(modalRes) {
              if (modalRes.confirm) {
                self.copyLink(item);
              }
            }
          });
        }
      });
    }, function() {
      wx.hideLoading();
      if (config.fallbackCopy) {
        wx.showModal({
          title: '未找到附件',
          content: '该条目可能没有独立附件，是否复制局方页面链接？',
          confirmText: '复制链接',
          success: function(res) {
            if (res.confirm) {
              self.copyLink(item);
            }
          }
        });
      } else {
        wx.showToast({
          title: '未找到可下载附件',
          icon: 'none',
          duration: 1800
        });
      }
    });
  },

  /**
   * 显示文件详情弹窗
   * @param {Object} item - 文件对象
   * @param {Object} options - 可选配置
   */
  showFileDetail: function(item, options) {
    if (!item) return;
    
    var config = Object.assign({
      showCancel: true,
      cancelText: '关闭',
      confirmText: '复制链接'
    }, options || {});

    var content = '文件名：' + item.title + '\n' +
                 '发布日期：' + (item.publish_date || '未知') + '\n' +
                 '负责司局：' + (item.office_unit || '未知') + '\n' +
                 '文件状态：' + (item.validity || '未知');

    wx.showModal({
      title: '文件详情',
      content: content,
      showCancel: config.showCancel,
      cancelText: config.cancelText,
      confirmText: config.confirmText,
      success: function(res) {
        if (res.confirm && item.url) {
          CCARUtils.copyLink(item);
        }
      }
    });
  },

  /**
   * 创建统一的有效性筛选器
   * @returns {Object} 筛选器对象，包含各种筛选方法
   */
  createValidityFilter: function() {
    return {
      // 显示全部数据
      all: function(data) {
        return data || [];
      },
      
      // 筛选有效数据
      valid: function(data) {
        if (!data || !Array.isArray(data)) return [];
        return data.filter(function(item) {
          return item.validity === CCARConfig.VALIDITY_STATUS.VALID;
        });
      },
      
      // 筛选失效数据
      invalid: function(data) {
        if (!data || !Array.isArray(data)) return [];
        return data.filter(function(item) {
          return item.validity === CCARConfig.VALIDITY_STATUS.INVALID_EXPIRED ||
                 item.validity === CCARConfig.VALIDITY_STATUS.INVALID_ABOLISHED;
        });
      }
    };
  },

  /**
   * 统一的有效性筛选方法（推荐使用）
   * @param {Array} data - 待筛选的数据
   * @param {string} filter - 筛选条件: 'all', 'valid', 'invalid'
   * @returns {Array} 筛选后的数据
   */
  filterByValidity: function(data, filter) {
    var filters = this.createValidityFilter();
    var filterMethod = filters[filter];
    
    if (!filterMethod) {
      console.warn('无效的筛选条件:', filter, '使用默认筛选');
      return filters.all(data);
    }
    
    return filterMethod(data);
  },

};

module.exports = CCARUtils;
