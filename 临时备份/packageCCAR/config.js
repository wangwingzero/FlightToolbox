/**
 * PackageCCAR 配置文件
 * 统一管理常量和配置项
 */

var CCARConfig = {
  // 分页配置
  PAGE_SIZE: 20,
  
  // 搜索配置
  SEARCH_DEBOUNCE_DELAY: 300,
  SEARCH_FIELDS: {
    REGULATION: ['title', 'doc_number', 'office_unit'],
    NORMATIVE: ['title', 'doc_number', 'office_unit', 'publish_date']
  },
  
  // 加载配置
  LOADING_DELAY: 100,
  LOADING_TEXT: {
    CATEGORIES: '正在加载规章数据...',
    REGULATIONS: '正在加载规章列表...',
    NORMATIVES: '正在加载规范性文件...'
  },
  
  // 有效性筛选选项
  VALIDITY_FILTERS: {
    ALL: 'all',
    VALID: 'valid', 
    INVALID: 'invalid'
  },
  
  // 有效性状态映射
  VALIDITY_STATUS: {
    VALID: '有效',
    INVALID_EXPIRED: '失效',
    INVALID_ABOLISHED: '废止'
  },
  
  // 消息提示
  MESSAGES: {
    COPY_SUCCESS: '链接已复制',
    COPY_FAIL: '复制失败',
    LINK_UNAVAILABLE: '链接不可用',
    DATA_LOAD_ERROR: '数据加载失败'
  }
};

module.exports = CCARConfig;