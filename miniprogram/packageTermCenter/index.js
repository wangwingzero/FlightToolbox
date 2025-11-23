var BasePage = require('../utils/base-page.js');
var dataManager = require('../utils/data-manager.js');

var pageConfig = {
  data: {
    activeTab: 'all',
    searchValue: '',
    isLoading: true,
    loadError: '',
    pageSize: 30,
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
    this.loadAllData();
  },

  loadAllData: function() {
    var self = this;
    this.setData({
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

      self.setData({
        isLoading: false,
        abbreviationCount: abbreviations.length,
        definitionCount: definitions.length,
        iosaCount: iosa.length
      });

      self.applyFilter(true);
    }).catch(function(error) {
      console.warn('术语中心数据加载失败:', error);
      self.setData({
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
    this.setData({
      activeTab: tab
    });
    this.applyFilter(true);
  },

  onSearchChange: function(e) {
    this.setData({
      searchValue: e.detail || ''
    });
    this.applyFilter(true);
  },

  onSearchClear: function() {
    this.setData({
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

  buildDefinitionItem: function(raw, index) {
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
      id: 'definition_' + uniqueKey,
      type: 'definition',
      title: title,
      subtitle: subtitle,
      description: description,
      source: source,
      raw: raw
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
    var alreadyMarked = [];

    for (var i = 0; i < cachedSortedTerms.length; i++) {
      var termName = cachedSortedTerms[i];

      if (excludeTermName && termName === excludeTermName) {
        continue;
      }

      var termDef = cachedTermNameMap[termName];
      var shouldSkip = false;

      for (var j = 0; j < alreadyMarked.length; j++) {
        if (alreadyMarked[j].indexOf(termName) > -1) {
          shouldSkip = true;
          break;
        }
      }

      if (!shouldSkip && processedContent.indexOf(termName) > -1) {
        hasTerms = true;
        termMap[termName] = termDef;
        alreadyMarked.push(termName);

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

  applyFilter: function(resetPage) {
    var abbreviations = this._abbreviations || [];
    var definitions = this._definitions || [];
    var iosaTerms = this._iosaTerms || [];

    if (!abbreviations.length && !definitions.length && !iosaTerms.length) {
      return;
    }

    var activeTab = this.data.activeTab;
    var keyword = (this.data.searchValue || '').toLowerCase().trim();
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
          results.push(this.buildAbbreviationItem(abbr, i));
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
          results.push(this.buildDefinitionItem(def, j));
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
          results.push(this.buildIOSAItem(term, k));
        }
      }
    }

    var typePriority = {
      abbreviation: 1,
      definition: 2,
      iosa: 3
    };

    results.sort(function(a, b) {
      var pa = typePriority[a.type] || 99;
      var pb = typePriority[b.type] || 99;
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

    this.setData({
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
    this.setData({
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
    this.setData({
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
    if (current) {
      this._detailHistory.push(current);
    }

    var item = this.buildDefinitionItem(target);
    var processed = this.processDefinitionItemForDisplay(item);

    this.setData({
      selectedItem: processed,
      canGoBack: this._detailHistory.length > 0
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
    if (current) {
      this._detailHistory.push(current);
    }

    var item = this.buildIOSAItem(target);
    var processed = this.processIOSAItemForDisplay(item);

    this.setData({
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

    this.setData({
      selectedItem: previous,
      canGoBack: history.length > 0
    });
  },

  closeDetailPopup: function() {
    this._detailHistory = [];
    this.setData({
      showDetailPopup: false,
      selectedItem: null,
      canGoBack: false
    });
  }
};

Page(BasePage.createPage(pageConfig));
