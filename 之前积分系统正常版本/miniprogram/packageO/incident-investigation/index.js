var BasePage = require('../../utils/base-page.js');

var pageConfig = {
  data: {
    // 搜索相关
    searchValue: '',
    activeTab: 'all',
    loading: false,
    
    // 原始数据
    incidentsData: [],
    emergencyEventsData: [], // 新增紧急事件数据
    generalEventsData: [],
    definitionsData: [],
    allData: [], // 全部数据的合并
    
    // 筛选后的数据
    filteredIncidents: [],
    filteredEmergencyEvents: [], // 新增筛选后的紧急事件数据
    filteredGeneralEvents: [],
    filteredDefinitions: [],
    filteredAll: [],
    
    // 子分类过滤
    selectedSubcategory: 'all',
    incidentSubcategories: [],
    emergencyEventSubcategories: [], // 新增紧急事件子分类
    generalEventSubcategories: [],
    
    // 详情弹窗
    showDetailPopup: false,
    detailData: {},
    detailType: '',
    
    // 浏览历史功能
    viewHistory: [], // 浏览历史栈
    canGoBack: false, // 是否可以返回
    
    // 相关定义匹配
    relatedDefinitions: []
  },

  customOnLoad: function(options) {
    this.loadAllData();
  },

  // 加载所有数据
  loadAllData: function() {
    var self = this;
    self.setData({ loading: true });
    
    try {
      // 加载定义数据
      var definitions = require('../../data/incident-investigation/definitions.js');
      var definitionsArray = [];
      for (var term in definitions.terms) {
        var item = definitions.terms[term];
        definitionsArray.push({
          term: term,
          title: item.title, // 使用中文标题
          definition: item.definition,
          shortDefinition: item.definition.length > 50 ? item.definition.substring(0, 50) + '...' : item.definition,
          relatedTerms: item.relatedTerms || [],
          reference: item.reference || ''
        });
      }
      
      
      // 加载征候数据
      var incidents = require('../../data/incident-investigation/incidents.js');
      var incidentsArray = [];
      if (incidents.subcategories) {
        incidents.subcategories.forEach(function(subcategory) {
          if (subcategory.items) {
            subcategory.items.forEach(function(item) {
              incidentsArray.push({
                code: item.code,
                title: item.title,
                content: item.content,
                examples: item.examples || [],
                category: subcategory.name
              });
            });
          }
        });
      }
      
      // 加载紧急事件数据
      var emergencyEventData = require('../../data/incident-investigation/emergency-event.js');
      var emergencyEventsArray = [];
      
      // 适配原始数据结构：aviationEventData.transport_aviation
      if (emergencyEventData && emergencyEventData.transport_aviation) {
        var transportAviation = emergencyEventData.transport_aviation;
        
        // 加载紧急事件（使用新的subcategories结构）
        if (transportAviation.emergency_events && transportAviation.emergency_events.subcategories) {
          transportAviation.emergency_events.subcategories.forEach(function(subcategory) {
            if (subcategory.items) {
              subcategory.items.forEach(function(item) {
                emergencyEventsArray.push({
                  code: item.code,
                  title: item.title,
                  content: item.content,
                  examples: item.examples || [],
                  relatedTerms: item.relatedTerms || [],
                  note: item.note || '',
                  category: subcategory.name || '运输航空紧急事件样例',
                  urgencyLevel: '紧急事件', // 新增紧急级别字段
                  businessCategory: '紧急事件' // 业务分类
                });
              });
            }
          });
        }
        
        // 加载非紧急事件（使用subcategories结构）
        if (transportAviation.non_emergency_events && transportAviation.non_emergency_events.subcategories) {
          transportAviation.non_emergency_events.subcategories.forEach(function(subcategory) {
            if (subcategory.items) {
              subcategory.items.forEach(function(item) {
                emergencyEventsArray.push({
                  code: item.code,
                  title: item.title,
                  content: item.content,
                  examples: item.examples || [],
                  relatedTerms: item.relatedTerms || [],
                  note: item.note || '',
                  category: subcategory.name || '运输航空非紧急事件样例',
                  urgencyLevel: '非紧急事件', // 新增紧急级别字段
                  businessCategory: subcategory.name || '其他' // 业务分类
                });
              });
            }
          });
        }
        
        // 加载通用航空紧急事件（使用新的subcategories结构）
        if (emergencyEventData.general_aviation && emergencyEventData.general_aviation.emergency_events && emergencyEventData.general_aviation.emergency_events.subcategories) {
          emergencyEventData.general_aviation.emergency_events.subcategories.forEach(function(subcategory) {
            if (subcategory.items) {
              subcategory.items.forEach(function(item) {
                emergencyEventsArray.push({
                  code: item.code,
                  title: item.title,
                  content: item.content,
                  examples: item.examples || [],
                  relatedTerms: item.relatedTerms || [],
                  note: item.note || '',
                  category: subcategory.name || '通用航空紧急事件样例',
                  urgencyLevel: '紧急事件', // 新增紧急级别字段
                  businessCategory: '紧急事件' // 业务分类
                });
              });
            }
          });
        }
        
        // 加载通用航空非紧急事件
        if (emergencyEventData.general_aviation && emergencyEventData.general_aviation.non_emergency_events && emergencyEventData.general_aviation.non_emergency_events.subcategories) {
          emergencyEventData.general_aviation.non_emergency_events.subcategories.forEach(function(subcategory) {
            if (subcategory.items) {
              subcategory.items.forEach(function(item) {
                emergencyEventsArray.push({
                  code: item.code,
                  title: item.title,
                  content: item.content,
                  examples: item.examples || [],
                  relatedTerms: item.relatedTerms || [],
                  note: item.note || '',
                  category: subcategory.name || '通用航空非紧急事件样例',
                  urgencyLevel: '非紧急事件', // 新增紧急级别字段
                  businessCategory: subcategory.name || '其他' // 业务分类
                });
              });
            }
          });
        }
      }
      
      console.log('事件样例数据结构:', emergencyEventData);
      console.log('处理后的事件样例数组:', emergencyEventsArray);
      
      // 加载一般事件数据
      var generalEvents = require('../../data/incident-investigation/general-events.js');
      var generalEventsArray = [];
      if (generalEvents.subcategories) {
        generalEvents.subcategories.forEach(function(subcategory) {
          if (subcategory.items) {
            subcategory.items.forEach(function(item) {
              generalEventsArray.push({
                code: item.code,
                title: item.title,
                content: item.content,
                examples: item.examples || [],
                category: subcategory.name
              });
            });
          }
        });
      }
      
      // 合并所有数据到allData
      var allDataArray = [];
      
      // 添加征候数据
      incidentsArray.forEach(function(item) {
        allDataArray.push({
          type: 'incident',
          title: item.title,
          content: item.content,
          category: item.category,
          examples: item.examples,
          originalData: item
        });
      });
      
      // 添加紧急事件数据
      emergencyEventsArray.forEach(function(item) {
        allDataArray.push({
          type: 'emergency_event',
          title: item.title,
          content: item.content,
          category: item.category,
          examples: item.examples,
          relatedTerms: item.relatedTerms,
          note: item.note,
          originalData: item
        });
      });
      
      // 添加一般事件数据
      generalEventsArray.forEach(function(item) {
        allDataArray.push({
          type: 'general_event',
          title: item.title,
          content: item.content,
          category: item.category,
          examples: item.examples,
          originalData: item
        });
      });
      
      // 提取子分类
      var incidentSubs = self.extractSubcategories(incidents, 'incidents');
      var emergencyEventSubs = self.extractSubcategories(emergencyEventData, 'emergency_events');
      var generalEventSubs = self.extractSubcategories(generalEvents, 'general_events');
      
      // 合并所有子分类供全部标签页使用
      var allSubs = [{ id: 'all', name: '全部' }];
      // 添加所有不重复的子分类
      var allSubNames = {};
      incidentSubs.concat(emergencyEventSubs).concat(generalEventSubs).forEach(function(sub) {
        if (sub.id !== 'all' && !allSubNames[sub.name]) {
          allSubNames[sub.name] = true;
          allSubs.push(sub);
        }
      });
      
      console.log('✅ 所有数据加载成功');
      console.log('紧急事件数据数量:', emergencyEventsArray.length);
      console.log('紧急事件子分类数量:', emergencyEventSubs.length);
      
      self.setData({
        definitionsData: definitionsArray,
        incidentsData: incidentsArray,
        emergencyEventsData: emergencyEventsArray,
        generalEventsData: generalEventsArray,
        allData: allDataArray,
        filteredDefinitions: definitionsArray,
        filteredIncidents: incidentsArray,
        filteredEmergencyEvents: emergencyEventsArray,
        filteredGeneralEvents: generalEventsArray,
        filteredAll: allDataArray,
        incidentSubcategories: incidentSubs,
        emergencyEventSubcategories: emergencyEventSubs,
        generalEventSubcategories: generalEventSubs,
        allSubcategories: allSubs,
        loading: false
      });
      
      
    } catch (error) {
      console.error('❌ 数据加载失败:', error);
      self.setData({ 
        loading: false,
        definitionsData: [],
        incidentsData: [],
        emergencyEventsData: [],
        generalEventsData: [],
        filteredDefinitions: [],
        filteredIncidents: [],
        filteredEmergencyEvents: [],
        filteredGeneralEvents: []
      });
    }
  },

  // 提取子分类方法
  extractSubcategories: function(dataSource, type) {
    var subcategories = [{ id: 'all', name: '全部' }];
    
    if (type === 'emergency_events') {
      // 新的分类逻辑：紧急事件、非紧急事件、然后按业务领域分类
      
      // 1. 紧急事件分类（包含所有紧急事件）
      subcategories.push({
        id: 'emergency_all',
        name: '紧急事件'
      });
      
      // 2. 非紧急事件分类（包含所有非紧急事件）
      subcategories.push({
        id: 'non_emergency_all',
        name: '非紧急事件'
      });
      
      // 3. 按业务领域分类（包含紧急+非紧急）
      var businessCategories = [
        '航空器运行',
        '航空器维修', 
        '地面保障',
        '机场运行',
        '空管保障'
      ];
      
      businessCategories.forEach(function(categoryName) {
        subcategories.push({
          id: 'business_' + categoryName,
          name: categoryName
        });
      });
    } else if (dataSource && dataSource.subcategories) {
      // 处理其他标准数据结构
      dataSource.subcategories.forEach(function(sub) {
        subcategories.push({
          id: sub.id,
          name: sub.name
        });
      });
    }
    
    return subcategories;
  },

  // 标签页切换
  onTabChange: function(event) {
    var activeTab = event.detail.name;
    this.setData({
      activeTab: activeTab,
      selectedSubcategory: 'all'
    });
    
    // 重置子分类过滤
    this.resetToOriginalData();
  },

  // 子分类切换
  onSubcategoryChange: function(event) {
    var subcategoryId = event.currentTarget.dataset.id;
    this.setData({
      selectedSubcategory: subcategoryId
    });
    
    this.filterBySubcategory(subcategoryId);
  },

  // 按子分类过滤数据
  filterBySubcategory: function(subcategoryId) {
    var self = this;
    var activeTab = self.data.activeTab;
    
    if (subcategoryId === 'all') {
      self.resetToOriginalData();
      return;
    }
    
    if (activeTab === 'incidents') {
      var filtered = self.data.incidentsData.filter(function(item) {
        return item.category === self.getSubcategoryName(subcategoryId, 'incidents');
      });
      self.setData({ filteredIncidents: filtered });
      
    } else if (activeTab === 'emergency_events') {
      var filtered;
      
      if (subcategoryId === 'emergency_all') {
        // 显示所有紧急事件
        filtered = self.data.emergencyEventsData.filter(function(item) {
          return item.urgencyLevel === '紧急事件';
        });
      } else if (subcategoryId === 'non_emergency_all') {
        // 显示所有非紧急事件
        filtered = self.data.emergencyEventsData.filter(function(item) {
          return item.urgencyLevel === '非紧急事件';
        });
      } else if (subcategoryId.indexOf('business_') === 0) {
        // 显示特定业务领域的事件（包含紧急+非紧急）
        var businessCategory = subcategoryId.replace('business_', '');
        filtered = self.data.emergencyEventsData.filter(function(item) {
          return item.businessCategory === businessCategory;
        });
      } else {
        // 其他情况，按名称匹配
        var subcategoryName = self.getSubcategoryName(subcategoryId, 'emergency_events');
        filtered = self.data.emergencyEventsData.filter(function(item) {
          return item.category === subcategoryName;
        });
      }
      
      self.setData({ filteredEmergencyEvents: filtered });
      
    } else if (activeTab === 'general_events') {
      var filtered = self.data.generalEventsData.filter(function(item) {
        return item.category === self.getSubcategoryName(subcategoryId, 'general_events');
      });
      self.setData({ filteredGeneralEvents: filtered });
      
    } else if (activeTab === 'all') {
      var filtered = self.data.allData.filter(function(item) {
        return item.category === self.getSubcategoryName(subcategoryId, 'all');
      });
      self.setData({ filteredAll: filtered });
    }
  },

  // 获取子分类名称
  getSubcategoryName: function(subcategoryId, type) {
    var self = this;
    var subcategories = [];
    
    if (type === 'incidents') subcategories = self.data.incidentSubcategories;
    else if (type === 'emergency_events') subcategories = self.data.emergencyEventSubcategories;
    else if (type === 'general_events') subcategories = self.data.generalEventSubcategories;
    else if (type === 'all') subcategories = self.data.allSubcategories;
    
    var found = subcategories.find(function(sub) {
      return sub.id === subcategoryId;
    });
    
    return found ? found.name : '';
  },

  // 搜索功能
  onSearch: function(event) {
    var keyword = event.detail;
    this.performSearch(keyword);
  },

  onSearchChange: function(event) {
    var keyword = event.detail;
    this.setData({
      searchValue: keyword
    });
    
    if (keyword.trim()) {
      this.performSearch(keyword);
    } else {
      this.resetToOriginalData();
    }
  },

  onSearchClear: function() {
    this.setData({
      searchValue: ''
    });
    this.resetToOriginalData();
  },

  // 执行搜索
  performSearch: function(keyword) {
    var self = this;
    var lowerKeyword = keyword.toLowerCase();
    
    // 搜索征候
    var filteredIncidents = self.data.incidentsData.filter(function(item) {
      return item.title.toLowerCase().indexOf(lowerKeyword) > -1 ||
             item.content.toLowerCase().indexOf(lowerKeyword) > -1;
    });
    
    // 搜索紧急事件
    var filteredEmergencyEvents = self.data.emergencyEventsData.filter(function(item) {
      return item.title.toLowerCase().indexOf(lowerKeyword) > -1 ||
             item.content.toLowerCase().indexOf(lowerKeyword) > -1;
    });
    
    // 搜索一般事件
    var filteredGeneralEvents = self.data.generalEventsData.filter(function(item) {
      return item.title.toLowerCase().indexOf(lowerKeyword) > -1 ||
             item.content.toLowerCase().indexOf(lowerKeyword) > -1;
    });
    
    // 搜索术语定义
    var filteredDefinitions = self.data.definitionsData.filter(function(item) {
      return item.term.toLowerCase().indexOf(lowerKeyword) > -1 ||
             item.definition.toLowerCase().indexOf(lowerKeyword) > -1;
    });
    
    // 搜索全部数据
    var filteredAll = self.data.allData.filter(function(item) {
      return item.title.toLowerCase().indexOf(lowerKeyword) > -1 ||
             item.content.toLowerCase().indexOf(lowerKeyword) > -1;
    });
    
    self.setData({
      filteredIncidents: filteredIncidents,
      filteredEmergencyEvents: filteredEmergencyEvents,
      filteredGeneralEvents: filteredGeneralEvents,
      filteredDefinitions: filteredDefinitions,
      filteredAll: filteredAll
    });
  },

  // 重置为原始数据
  resetToOriginalData: function() {
    this.setData({
      filteredIncidents: this.data.incidentsData,
      filteredEmergencyEvents: this.data.emergencyEventsData,
      filteredGeneralEvents: this.data.generalEventsData,
      filteredDefinitions: this.data.definitionsData,
      filteredAll: this.data.allData
    });
  },

  // 显示详情弹窗的通用方法
  showDetailPopup: function(data, type, addToHistory) {
    var self = this;
    
    // 如果需要添加到历史记录（非返回操作）
    if (addToHistory !== false && self.data.showDetailPopup) {
      self.data.viewHistory.push({
        detailData: self.data.detailData,
        detailType: self.data.detailType
      });
    }
    
    self.setData({
      detailData: data,
      detailType: type,
      showDetailPopup: true,
      canGoBack: self.data.viewHistory.length > 0
    });
  },

  // 查看征候详情
  viewIncidentDetail: function(event) {
    var item = event.currentTarget.dataset.item;
    var processedItem = this.processItemForDisplay(item);
    this.showDetailPopup(processedItem, 'incident', true);
  },

  // 查看紧急事件详情
  viewEmergencyEventDetail: function(event) {
    var item = event.currentTarget.dataset.item;
    var processedItem = this.processItemForDisplay(item);
    this.showDetailPopup(processedItem, 'emergency_event', true);
  },

  // 查看一般事件详情
  viewGeneralEventDetail: function(event) {
    var item = event.currentTarget.dataset.item;
    var processedItem = this.processItemForDisplay(item);
    this.showDetailPopup(processedItem, 'general_event', true);
  },

  // 查看术语定义详情
  viewDefinitionDetail: function(event) {
    var item = event.currentTarget.dataset.item;
    var processedItem = this.processItemForDisplay(item);
    this.showDetailPopup(processedItem, 'definition', true);
  },

  // 查看全部标签页项目详情
  viewAllItemDetail: function(event) {
    var item = event.currentTarget.dataset.item;
    var processedItem = this.processItemForDisplay(item.originalData);
    this.showDetailPopup(processedItem, item.type, true);
  },

  // 关闭详情弹窗
  closeDetailPopup: function() {
    this.setData({
      showDetailPopup: false,
      detailData: {},
      detailType: '',
      viewHistory: [], // 清空历史记录
      canGoBack: false
    });
  },

  // 返回上一个详情页面
  goBackInHistory: function() {
    var self = this;
    
    if (self.data.viewHistory.length > 0) {
      var previousView = self.data.viewHistory.pop();
      
      self.setData({
        detailData: previousView.detailData,
        detailType: previousView.detailType,
        canGoBack: self.data.viewHistory.length > 0
      });
    }
  },


  // 智能识别内容中的术语并标记 - 改用结构化数据方案
  processTermsInContent: function(content) {
    if (!content) return { 
      content: content,
      hasTerms: false,
      termMap: {}
    };
    
    var self = this;
    var definitionsData = self.data.definitionsData || [];
    
    // 创建术语标题到术语key的映射
    var termTitleMap = {};
    definitionsData.forEach(function(def) {
      if (def.title) {
        termTitleMap[def.title] = def.term;
      }
    });
    
    // 按长度排序术语，优先匹配长的术语
    var sortedTerms = Object.keys(termTitleMap).sort(function(a, b) {
      return b.length - a.length;
    });
    
    var processedContent = content;
    var termMap = {};
    var hasTerms = false;
    
    // 查找并标记术语，避免重复标记
    var alreadyMarked = [];
    
    sortedTerms.forEach(function(termTitle) {
      var termKey = termTitleMap[termTitle];
      
      // 检查是否已经被较长的术语包含
      var shouldSkip = false;
      for (var i = 0; i < alreadyMarked.length; i++) {
        if (alreadyMarked[i].indexOf(termTitle) > -1) {
          shouldSkip = true;
          break;
        }
      }
      
      if (!shouldSkip && processedContent.indexOf(termTitle) > -1) {
        hasTerms = true;
        termMap[termTitle] = termKey;
        alreadyMarked.push(termTitle);
        
        // 标记术语但不使用HTML，使用特殊标记符
        var markStart = '[[TERM_START:' + termKey + ']]';
        var markEnd = '[[TERM_END]]';
        
        // 为了ES5兼容性，使用简单但安全的替换
        // 检查是否尚未被标记
        if (processedContent.indexOf(markStart) === -1 || processedContent.indexOf(termTitle) < processedContent.indexOf(markStart)) {
          var parts = processedContent.split(termTitle);
          if (parts.length > 1) {
            processedContent = parts.join(markStart + termTitle + markEnd);
          }
        }
      }
    });
    
    return {
      content: processedContent,
      hasTerms: hasTerms,
      termMap: termMap,
      originalContent: content
    };
  },

  // 处理项目数据用于显示
  processItemForDisplay: function(item) {
    if (!item) return item;
    
    var processedItem = Object.assign({}, item);
    
    // 处理content字段的术语识别
    if (processedItem.content) {
      var termData = this.processTermsInContent(processedItem.content);
      processedItem.termData = termData;
      
      // 预处理术语组件数据用于模板
      processedItem.contentParts = this.parseContentWithTerms(processedItem.content);
      
      // 为了兼容现有模板，保留简单的高亮版本
      if (termData.hasTerms) {
        var highlightedContent = termData.content;
        for (var termTitle in termData.termMap) {
          var termKey = termData.termMap[termTitle];
          var markStart = '\\[\\[TERM_START:' + termKey + '\\]\\]';
          var markEnd = '\\[\\[TERM_END\\]\\]';
          var regex = new RegExp(markStart + '(.*?)' + markEnd, 'g');
          highlightedContent = highlightedContent.replace(regex, '<span class="term-highlight">$1</span>');
        }
        processedItem.highlightedContent = highlightedContent;
      }
    }
    
    // 处理definition字段的术语识别
    if (processedItem.definition) {
      var termData = this.processTermsInContent(processedItem.definition);
      processedItem.definitionTermData = termData;
      
      // 预处理术语组件数据用于模板
      processedItem.definitionParts = this.parseContentWithTerms(processedItem.definition);
      
      if (termData.hasTerms) {
        var highlightedDefinition = termData.content;
        for (var termTitle in termData.termMap) {
          var termKey = termData.termMap[termTitle];
          var markStart = '\\[\\[TERM_START:' + termKey + '\\]\\]';
          var markEnd = '\\[\\[TERM_END\\]\\]';
          var regex = new RegExp(markStart + '(.*?)' + markEnd, 'g');
          highlightedDefinition = highlightedDefinition.replace(regex, '<span class="term-highlight">$1</span>');
        }
        processedItem.highlightedDefinition = highlightedDefinition;
      }
    }
    
    return processedItem;
  },

  // 解析文本并创建可点击的术语组件
  parseContentWithTerms: function(content) {
    if (!content) return [];
    
    var termData = this.processTermsInContent(content);
    
    if (!termData.hasTerms) {
      return [{ type: 'text', text: content }];
    }
    
    var parts = [];
    var processedContent = termData.content;
    var lastIndex = 0;
    
    // 使用正则表达式分割内容
    var termRegex = /\[\[TERM_START:(.*?)\]\](.*?)\[\[TERM_END\]\]/g;
    var match;
    
    while ((match = termRegex.exec(processedContent)) !== null) {
      // 添加术语前的普通文本
      if (match.index > lastIndex) {
        var beforeText = processedContent.substring(lastIndex, match.index);
        if (beforeText) {
          parts.push({ type: 'text', text: beforeText });
        }
      }
      
      // 添加术语部分
      parts.push({
        type: 'term',
        text: match[2],
        termKey: match[1]
      });
      
      lastIndex = termRegex.lastIndex;
    }
    
    // 添加剩余的普通文本
    if (lastIndex < processedContent.length) {
      var remainingText = processedContent.substring(lastIndex);
      if (remainingText) {
        parts.push({ type: 'text', text: remainingText });
      }
    }
    
    return parts;
  },

  // 点击术语
  onTermClick: function(event) {
    var termKey = event.currentTarget.dataset.term;
    var self = this;
    
    if (termKey) {
      // 在术语定义中查找
      var foundTerm = self.data.definitionsData.find(function(item) {
        return item.term === termKey;
      });
      
      if (foundTerm) {
        // 处理找到的术语数据，确保包含可点击的术语信息
        var processedTerm = self.processItemForDisplay(foundTerm);
        
        // 使用通用方法显示，会自动添加到历史记录
        self.showDetailPopup(processedTerm, 'definition', true);
      } else {
        // 如果未找到，显示提示
        wx.showToast({
          title: '未找到相关定义',
          icon: 'none',
          duration: 2000
        });
      }
    }
  }
};

Page(BasePage.createPage(pageConfig));