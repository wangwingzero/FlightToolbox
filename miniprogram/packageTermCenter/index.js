var BasePage = require('../utils/base-page.js');
var dataManager = require('../utils/data-manager.js');

// ===== 常量定义（避免魔法数字）=====
var CONSTANTS = {
  PAGE_SIZE: 30,                    // 每页显示条数
  SEARCH_DEBOUNCE_DELAY: 300,       // 搜索防抖延迟（毫秒）
  MAX_HISTORY_DEPTH: 10,            // 术语跳转历史最大深度
  SORT_PRIORITY: {                  // 类型排序优先级
    abbreviation: 1,
    definition: 2,
    iosa: 3
  }
};

var pageConfig = {
  data: {
    activeTab: 'all',
    activeSourceFilter: 'all',
    searchValue: '',
    isLoading: true,
    loadError: '',
    pageSize: CONSTANTS.PAGE_SIZE,
    currentPage: 0,
    hasMore: true,
    totalCount: 0,
    abbreviationCount: 0,
    definitionCount: 0,
    iosaCount: 0,
    displayResults: [],
    showDetailPopup: false,
    selectedItem: null,
    canGoBack: false
  },

  customOnLoad: function() {
    this._abbreviations = [];
    this._definitions = [];
    this._iosaTerms = [];
    this._allResults = [];
    this._definitionTermNameMap = {};
    this._definitionSortedTerms = [];
    this._detailHistory = [];
    this._searchDebounceTimer = null;  // 搜索防抖定时器
    this.loadAllData();
  },

  customOnUnload: function() {
    // 清理搜索防抖定时器，防止内存泄漏
    if (this._searchDebounceTimer) {
      clearTimeout(this._searchDebounceTimer);
      this._searchDebounceTimer = null;
    }
    // 清理历史栈
    this._detailHistory = [];
  },

  loadAllData: function() {
    var self = this;
    this.safeSetData({
      isLoading: true,
      loadError: ''
    });

    Promise.all([
      dataManager.loadAbbreviationsData(),
      dataManager.loadDefinitionsData(),
      dataManager.loadIOSAData()
    ]).then(function(results) {
      var abbreviations = results[0] || [];
      var definitions = results[1] || [];
      var iosa = results[2] || [];

      self._abbreviations = abbreviations;
      self._definitions = definitions;
      self._iosaTerms = iosa;

      self.buildDefinitionTermNameMap(definitions);

      self.safeSetData({
        isLoading: false,
        abbreviationCount: abbreviations.length,
        definitionCount: definitions.length,
        iosaCount: iosa.length
      });

      self.applyFilter(true);
    }).catch(function(error) {
      console.warn('术语中心数据加载失败:', error);
      self.safeSetData({
        isLoading: false,
        loadError: '数据加载失败，请稍后重试'
      });
    });
  },

  onTabChange: function(e) {
    var tab = e.currentTarget.dataset.tab;
    if (!tab || tab === this.data.activeTab) {
      return;
    }
    this.safeSetData({
      activeTab: tab
    });
    this.applyFilter(true);
  },

  onSourceFilterTap: function(e) {
    var filter = e.currentTarget.dataset.filter || 'all';
    if (filter === this.data.activeSourceFilter) {
      return;
    }
    this.safeSetData({
      activeSourceFilter: filter
    });
    this.applyFilter(true);
  },

  onSearchChange: function(e) {
    var self = this;
    var keyword = e.detail || '';

    // 立即更新输入框显示
    this.safeSetData({
      searchValue: keyword
    });

    // 清除之前的防抖定时器
    if (this._searchDebounceTimer) {
      clearTimeout(this._searchDebounceTimer);
      this._searchDebounceTimer = null;
    }

    // 使用防抖延迟执行搜索
    this._searchDebounceTimer = setTimeout(function() {
      self._searchDebounceTimer = null;
      self.applyFilter(true);
    }, CONSTANTS.SEARCH_DEBOUNCE_DELAY);
  },

  onSearchClear: function() {
    // 清除防抖定时器
    if (this._searchDebounceTimer) {
      clearTimeout(this._searchDebounceTimer);
      this._searchDebounceTimer = null;
    }

    this.safeSetData({
      searchValue: ''
    });
    this.applyFilter(true);
  },

  buildAbbreviationItem: function(raw, index) {
    var title = raw.abbreviation || '';
    var subtitle = raw.chinese_translation || raw.english_full || '';
    var description = raw.english_full || '';
    var source = raw.source || '';

    var keyParts = [
      raw.id || '',
      title,
      raw.english_full || '',
      raw.chinese_translation || '',
      source,
      (typeof index === 'number' ? index : '')
    ];
    var uniqueKey = keyParts.join('_');

    return {
      id: 'abbreviation_' + uniqueKey,
      type: 'abbreviation',
      title: title,
      subtitle: subtitle,
      description: description,
      source: source,
      raw: raw
    };
  },

  getDefinitionSourceCategory: function(source) {
    var text = source || '';
    if (!text) {
      return 'other';
    }
    if (text.indexOf('CCAR') !== -1) {
      return 'ccar';
    }
    if (text.indexOf('AC-') !== -1 || text.indexOf('AC ') !== -1 || text.indexOf('咨询通告') !== -1) {
      return 'ac';
    }
    if (text.indexOf('Jeppesen') !== -1) {
      return 'jeppesen';
    }
    if (text.indexOf('ICAO') !== -1 || text.indexOf('国际民用航空公约') !== -1) {
      return 'icao';
    }
    return 'other';
  },

  getDefinitionSourceCategoryLabel: function(category) {
    if (category === 'ccar') {
      return 'CCAR';
    }
    if (category === 'ac') {
      return 'AC';
    }
    if (category === 'icao') {
      return 'ICAO';
    }
    if (category === 'jeppesen') {
      return 'Jeppesen';
    }
    return '其他';
  },

  buildDefinitionItem: function(raw, index) {
    var title = raw.chinese_name || raw.english_name || '';
    var subtitle = raw.english_name || '';
    var description = raw.definition || '';
    var source = raw.source || '';

    var sourceCategory = this.getDefinitionSourceCategory(source);
    var sourceCategoryLabel = this.getDefinitionSourceCategoryLabel(sourceCategory);

    var keyParts = [
      raw.id || '',
      title,
      raw.english_name || '',
      source,
      (typeof index === 'number' ? index : '')
    ];
    var uniqueKey = keyParts.join('_');

    return {
      id: 'definition_' + uniqueKey,
      type: 'definition',
      title: title,
      subtitle: subtitle,
      description: description,
      source: source,
      raw: raw,
      sourceCategory: sourceCategory,
      sourceCategoryLabel: sourceCategoryLabel
    };
  },

  buildIOSAItem: function(raw, index) {
    var title = raw.chinese_name || raw.english_name || '';
    var subtitle = raw.english_name || '';
    var description = raw.definition || '';
    var source = raw.source || '';

    var keyParts = [
      raw.id || '',
      title,
      raw.english_name || '',
      source,
      (typeof index === 'number' ? index : '')
    ];
    var uniqueKey = keyParts.join('_');

    return {
      id: 'iosa_' + uniqueKey,
      type: 'iosa',
      title: title,
      subtitle: subtitle,
      description: description,
      source: source,
      raw: raw
    };
  },

  buildDefinitionTermNameMap: function(allDefinitions) {
    var map = {};
    if (allDefinitions && allDefinitions.length) {
      for (var i = 0; i < allDefinitions.length; i++) {
        var item = allDefinitions[i];
        if (item && item.chinese_name) {
          map[item.chinese_name] = item;
        }
      }
    }
    this._definitionTermNameMap = map;
    this._definitionSortedTerms = Object.keys(map).sort(function(a, b) {
      return b.length - a.length;
    });
  },

  processDefinitionTermsInContent: function(content, excludeTermName) {
    if (!content) {
      return {
        content: content,
        hasTerms: false,
        termMap: {},
        originalContent: content
      };
    }

    var cachedTermNameMap = this._definitionTermNameMap || {};
    var cachedSortedTerms = this._definitionSortedTerms || [];

    if (!cachedSortedTerms.length) {
      return {
        content: content,
        hasTerms: false,
        termMap: {},
        originalContent: content
      };
    }

    var processedContent = content;
    var termMap = {};
    var hasTerms = false;
    // 优化：使用对象存储已标记的术语，查找从O(n)降为O(1)
    var markedTermsSet = {};
    var markedTermsList = [];

    for (var i = 0; i < cachedSortedTerms.length; i++) {
      var termName = cachedSortedTerms[i];

      if (excludeTermName && termName === excludeTermName) {
        continue;
      }

      var termDef = cachedTermNameMap[termName];
      var shouldSkip = false;

      // 优化：检查当前术语是否被已标记的更长术语包含
      // 由于术语按长度降序排列，只需检查已标记的术语
      for (var j = 0; j < markedTermsList.length; j++) {
        if (markedTermsList[j].indexOf(termName) > -1) {
          shouldSkip = true;
          break;
        }
      }

      if (!shouldSkip && processedContent.indexOf(termName) > -1) {
        hasTerms = true;
        termMap[termName] = termDef;
        markedTermsSet[termName] = true;
        markedTermsList.push(termName);

        var markStart = '[[TERM_START:' + termName + ']]';
        var markEnd = '[[TERM_END]]';

        if (processedContent.indexOf(markStart) === -1 || processedContent.indexOf(termName) < processedContent.indexOf(markStart)) {
          var parts = processedContent.split(termName);
          if (parts.length > 1) {
            processedContent = parts.join(markStart + termName + markEnd);
          }
        }
      }
    }

    return {
      content: processedContent,
      hasTerms: hasTerms,
      termMap: termMap,
      originalContent: content
    };
  },

  parseDefinitionContentWithTerms: function(content, excludeTermName) {
    if (!content) {
      return [];
    }

    var termData = this.processDefinitionTermsInContent(content, excludeTermName);

    if (!termData.hasTerms) {
      return [{
        type: 'text',
        text: content
      }];
    }

    var parts = [];
    var processedContent = termData.content;
    var lastIndex = 0;
    var termRegex = /\[\[TERM_START:(.*?)\]\](.*?)\[\[TERM_END\]\]/g;
    var match;

    while ((match = termRegex.exec(processedContent)) !== null) {
      if (match.index > lastIndex) {
        var beforeText = processedContent.substring(lastIndex, match.index);
        if (beforeText) {
          parts.push({
            type: 'text',
            text: beforeText
          });
        }
      }

      parts.push({
        type: 'term',
        text: match[2],
        termName: match[1]
      });

      lastIndex = termRegex.lastIndex;
    }

    if (lastIndex < processedContent.length) {
      var remainingText = processedContent.substring(lastIndex);
      if (remainingText) {
        parts.push({
          type: 'text',
          text: remainingText
        });
      }
    }

    return parts;
  },

  processDefinitionItemForDisplay: function(item) {
    if (!item || !item.raw) {
      return item;
    }

    var cloned = JSON.parse(JSON.stringify(item));

    if (cloned.raw.definition) {
      cloned.definitionParts = this.parseDefinitionContentWithTerms(cloned.raw.definition, cloned.raw.chinese_name);
    }

    return cloned;
  },

  processIOSAItemForDisplay: function(item) {
    if (!item || !item.raw) {
      return item;
    }

    var cloned = JSON.parse(JSON.stringify(item));
    var raw = cloned.raw || {};

    var equivalentArray = [];
    if (raw.equivalent_terms && raw.equivalent_terms.trim) {
      var eqParts = raw.equivalent_terms.split(',');
      for (var i = 0; i < eqParts.length; i++) {
        var term = eqParts[i];
        if (term && term.trim()) {
          equivalentArray.push(term.trim());
        }
      }
    }

    var seeAlsoArray = [];
    if (raw.see_also_array && raw.see_also_array.length) {
      for (var j = 0; j < raw.see_also_array.length; j++) {
        var seeTerm = raw.see_also_array[j];
        if (seeTerm && seeTerm.trim && seeTerm.trim()) {
          seeAlsoArray.push(seeTerm.trim());
        }
      }
    } else if (raw.see_also && raw.see_also.trim) {
      var seeParts = raw.see_also.split(',');
      for (var k = 0; k < seeParts.length; k++) {
        var s = seeParts[k];
        if (s && s.trim()) {
          seeAlsoArray.push(s.trim());
        }
      }
    }

    cloned.equivalentTermsArray = equivalentArray;
    cloned.seeAlsoArray = seeAlsoArray;

    return cloned;
  },

  buildHighlightParts: function(text, keyword) {
    var content = text || '';
    if (!keyword) {
      return null;
    }

    var lowerContent = String(content).toLowerCase();
    var lowerKeyword = String(keyword).toLowerCase();

    if (!lowerKeyword || lowerContent.indexOf(lowerKeyword) === -1) {
      return null;
    }

    var parts = [];
    var startIndex = 0;
    var matchIndex = lowerContent.indexOf(lowerKeyword);
    var keywordLength = lowerKeyword.length;

    while (matchIndex !== -1) {
      if (matchIndex > startIndex) {
        parts.push({
          text: content.substring(startIndex, matchIndex),
          highlight: false
        });
      }

      parts.push({
        text: content.substr(matchIndex, keywordLength),
        highlight: true
      });

      startIndex = matchIndex + keywordLength;
      matchIndex = lowerContent.indexOf(lowerKeyword, startIndex);
    }

    if (startIndex < content.length) {
      parts.push({
        text: content.substring(startIndex),
        highlight: false
      });
    }

    return parts;
  },

  applyFilter: function(resetPage) {
    var abbreviations = this._abbreviations || [];
    var definitions = this._definitions || [];
    var iosaTerms = this._iosaTerms || [];

    if (!abbreviations.length && !definitions.length && !iosaTerms.length) {
      return;
    }

    var activeTab = this.data.activeTab;
    var rawKeyword = (this.data.searchValue || '').trim();
    var keyword = rawKeyword.toLowerCase();
    var activeSourceFilter = this.data.activeSourceFilter || 'all';
    var results = [];

    function matchText(text) {
      if (!keyword) {
        return true;
      }
      if (text === null || text === undefined) {
        return false;
      }
      return String(text).toLowerCase().indexOf(keyword) !== -1;
    }

    if (activeTab === 'all' || activeTab === 'abbreviation') {
      for (var i = 0; i < abbreviations.length; i++) {
        var abbr = abbreviations[i];
        if (!keyword ||
          matchText(abbr.abbreviation) ||
          matchText(abbr.english_full) ||
          matchText(abbr.chinese_translation)) {
          var abbrItem = this.buildAbbreviationItem(abbr, i);
          if (rawKeyword) {
            abbrItem.titleParts = this.buildHighlightParts(abbrItem.title, rawKeyword) || null;
            abbrItem.subtitleParts = this.buildHighlightParts(abbrItem.subtitle, rawKeyword) || null;
            abbrItem.descriptionParts = this.buildHighlightParts(abbrItem.description, rawKeyword) || null;
            abbrItem.sourceParts = this.buildHighlightParts(abbrItem.source, rawKeyword) || null;
          }
          results.push(abbrItem);
        }
      }
    }

    if (activeTab === 'all' || activeTab === 'definition') {
      for (var j = 0; j < definitions.length; j++) {
        var def = definitions[j];
        if (!keyword ||
          matchText(def.chinese_name) ||
          matchText(def.english_name) ||
          matchText(def.definition) ||
          matchText(def.source)) {
          var defItem = this.buildDefinitionItem(def, j);
          var passesSourceFilter = true;
          if (activeTab === 'definition' && activeSourceFilter && activeSourceFilter !== 'all') {
            passesSourceFilter = defItem.sourceCategory === activeSourceFilter;
          }
          if (!passesSourceFilter) {
            continue;
          }
          if (rawKeyword) {
            defItem.titleParts = this.buildHighlightParts(defItem.title, rawKeyword) || null;
            defItem.subtitleParts = this.buildHighlightParts(defItem.subtitle, rawKeyword) || null;
            defItem.descriptionParts = this.buildHighlightParts(defItem.description, rawKeyword) || null;
            defItem.sourceParts = this.buildHighlightParts(defItem.source, rawKeyword) || null;
          }
          results.push(defItem);
        }
      }
    }

    if (activeTab === 'all' || activeTab === 'iosa') {
      for (var k = 0; k < iosaTerms.length; k++) {
        var term = iosaTerms[k];
        if (!keyword ||
          matchText(term.chinese_name) ||
          matchText(term.english_name) ||
          matchText(term.definition) ||
          matchText(term.equivalent_terms)) {
          var iosaItem = this.buildIOSAItem(term, k);
          if (rawKeyword) {
            iosaItem.titleParts = this.buildHighlightParts(iosaItem.title, rawKeyword) || null;
            iosaItem.subtitleParts = this.buildHighlightParts(iosaItem.subtitle, rawKeyword) || null;
            iosaItem.descriptionParts = this.buildHighlightParts(iosaItem.description, rawKeyword) || null;
            iosaItem.sourceParts = this.buildHighlightParts(iosaItem.source, rawKeyword) || null;
          }
          results.push(iosaItem);
        }
      }
    }

    // 使用 CONSTANTS 中定义的排序优先级，避免重复定义
    results.sort(function(a, b) {
      var pa = CONSTANTS.SORT_PRIORITY[a.type] || 99;
      var pb = CONSTANTS.SORT_PRIORITY[b.type] || 99;
      if (pa !== pb) {
        return pa - pb;
      }
      var ta = (a.title || '').toLowerCase();
      var tb = (b.title || '').toLowerCase();
      if (ta < tb) {
        return -1;
      }
      if (ta > tb) {
        return 1;
      }
      return 0;
    });

    this._allResults = results;
    this.updateDisplayResults(resetPage);
  },

  updateDisplayResults: function(resetPage) {
    var all = this._allResults || [];
    var pageSize = this.data.pageSize;
    var currentPage = resetPage ? 0 : this.data.currentPage;
    var endIndex = (currentPage + 1) * pageSize;

    if (endIndex > all.length) {
      endIndex = all.length;
    }

    var newList = all.slice(0, endIndex);
    var hasMore = endIndex < all.length;

    this.safeSetData({
      displayResults: newList,
      currentPage: currentPage,
      hasMore: hasMore,
      totalCount: all.length
    });
  },

  onLoadMore: function() {
    if (!this.data.hasMore) {
      return;
    }
    var nextPage = this.data.currentPage + 1;
    this.safeSetData({
      currentPage: nextPage
    });
    this.updateDisplayResults(false);
  },

  onResultTap: function(e) {
    var index = e.currentTarget.dataset.index;
    var list = this.data.displayResults || [];
    var item = list[index];
    if (!item) {
      return;
    }

    if (item.type === 'definition') {
      item = this.processDefinitionItemForDisplay(item);
    } else if (item.type === 'iosa') {
      item = this.processIOSAItemForDisplay(item);
    }

    this._detailHistory = [];
    this.safeSetData({
      selectedItem: item,
      showDetailPopup: true,
      canGoBack: false
    });
  },

  onDefinitionTermClick: function(e) {
    var termName = e.currentTarget.dataset.term;
    if (!termName) {
      return;
    }

    var map = this._definitionTermNameMap || {};
    var target = map[termName];

    if (!target) {
      wx.showToast({
        title: '未找到相关定义',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    var current = this.data.selectedItem;
    if (!this._detailHistory) {
      this._detailHistory = [];
    }

    // 限制历史栈深度，防止内存泄漏
    if (this._detailHistory.length >= CONSTANTS.MAX_HISTORY_DEPTH) {
      this._detailHistory.shift();  // 移除最早的记录
    }

    if (current) {
      this._detailHistory.push(current);
    }

    var item = this.buildDefinitionItem(target);
    var processed = this.processDefinitionItemForDisplay(item);

    this.safeSetData({
      selectedItem: processed,
      canGoBack: this._detailHistory.length > 0
    });
  },

  onDefinitionContentTap: function() {
    var item = this.data.selectedItem;
    if (!item || (item.type !== 'definition' && item.type !== 'iosa')) {
      return;
    }

    var text = '';
    if (item.raw && item.raw.definition) {
      text = item.raw.definition;
    } else if (item.definitionParts && item.definitionParts.length) {
      for (var i = 0; i < item.definitionParts.length; i++) {
        var part = item.definitionParts[i];
        if (part && part.text) {
          text += part.text;
        }
      }
    }

    if (!text) {
      wx.showToast({
        title: '暂无可复制的定义',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    wx.setClipboardData({
      data: text,
      success: function() {
        wx.showToast({
          title: '定义已复制',
          icon: 'success',
          duration: 1500
        });
      },
      fail: function() {
        wx.showToast({
          title: '复制失败，请重试',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  findIOSATermByName: function(termName) {
    var cleanTermName = termName ? termName.trim() : '';
    if (!cleanTermName) {
      return null;
    }

    var definitions = this._iosaTerms || [];
    var currentRaw = this.data.selectedItem && this.data.selectedItem.raw ? this.data.selectedItem.raw : null;

    var exactMatch = null;
    var equivalentMatch = null;
    var seeAlsoMatch = null;
    var englishContainsMatch = null;

    for (var i = 0; i < definitions.length; i++) {
      var def = definitions[i];

      if (currentRaw && def.chinese_name === currentRaw.chinese_name && def.english_name === currentRaw.english_name) {
        continue;
      }

      if (!exactMatch && (def.english_name === cleanTermName || def.chinese_name === cleanTermName)) {
        exactMatch = def;
        continue;
      }

      if (!equivalentMatch && def.equivalent_terms && def.equivalent_terms.indexOf(cleanTermName) !== -1) {
        equivalentMatch = def;
      }

      if (!seeAlsoMatch && def.see_also_array && def.see_also_array.indexOf(cleanTermName) !== -1) {
        seeAlsoMatch = def;
      }

      if (!englishContainsMatch && def.english_name && def.english_name.indexOf(cleanTermName) !== -1) {
        englishContainsMatch = def;
      }
    }

    return exactMatch || equivalentMatch || seeAlsoMatch || englishContainsMatch || null;
  },

  onIOSAEquivalentClick: function(e) {
    var termName = e.currentTarget.dataset.term;
    if (!termName) {
      return;
    }

    var target = this.findIOSATermByName(termName);
    if (!target) {
      wx.showToast({
        title: '暂未收录术语',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    var current = this.data.selectedItem;
    if (!this._detailHistory) {
      this._detailHistory = [];
    }

    // 限制历史栈深度，防止内存泄漏
    if (this._detailHistory.length >= CONSTANTS.MAX_HISTORY_DEPTH) {
      this._detailHistory.shift();  // 移除最早的记录
    }

    if (current) {
      this._detailHistory.push(current);
    }

    var item = this.buildIOSAItem(target);
    var processed = this.processIOSAItemForDisplay(item);

    this.safeSetData({
      selectedItem: processed,
      canGoBack: this._detailHistory.length > 0
    });
  },

  onDetailBackTap: function() {
    var history = this._detailHistory || [];
    if (!history.length) {
      return;
    }

    var previous = history.pop();
    this._detailHistory = history;

    this.safeSetData({
      selectedItem: previous,
      canGoBack: history.length > 0
    });
  },

  closeDetailPopup: function() {
    this._detailHistory = [];
    this.safeSetData({
      showDetailPopup: false,
      selectedItem: null,
      canGoBack: false
    });
  }
};

Page(BasePage.createPage(pageConfig));
