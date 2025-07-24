// 机场数据工具函数
// 严格ES5语法，确保真机兼容性

var AirportUtils = {
  
  // 搜索机场数据
  searchAirports: function(airports, keyword, options) {
    if (!keyword || !keyword.trim()) {
      return airports;
    }
    
    var searchKeyword = keyword.toLowerCase().trim();
    var searchOptions = options || {};
    var maxResults = searchOptions.maxResults || 100;
    
    var results = [];
    var resultCount = 0;
    
    for (var i = 0; i < airports.length && resultCount < maxResults; i++) {
      var airport = airports[i];
      
      if (this.matchesSearch(airport, searchKeyword)) {
        // 添加匹配高亮信息
        var highlightedAirport = this.addHighlight(airport, searchKeyword);
        results.push(highlightedAirport);
        resultCount++;
      }
    }
    
    // 按匹配度排序
    return this.sortSearchResults(results, searchKeyword);
  },
  
  // 检查机场是否匹配搜索关键字
  matchesSearch: function(airport, keyword) {
    var searchFields = [
      airport.ICAOCode,
      airport.IATACode, 
      airport.ShortName,
      airport.EnglishName,
      airport.CountryName,
      airport.searchKeywords
    ];
    
    for (var i = 0; i < searchFields.length; i++) {
      var field = searchFields[i];
      if (field && typeof field === 'string') {
        if (field.toLowerCase().indexOf(keyword) !== -1) {
          return true;
        }
      }
    }
    
    return false;
  },
  
  // 添加搜索高亮
  addHighlight: function(airport, keyword) {
    // ES5兼容的对象复制方式
    var highlighted = {};
    for (var key in airport) {
      if (airport.hasOwnProperty(key)) {
        highlighted[key] = airport[key];
      }
    }
    var highlightFields = ['ICAOCode', 'IATACode', 'ShortName', 'EnglishName'];
    
    // 确保基础字段的完整性，避免组件属性错误
    highlighted.ICAOCode = highlighted.ICAOCode || '';
    highlighted.IATACode = highlighted.IATACode || '';
    highlighted.ShortName = highlighted.ShortName || '';
    highlighted.EnglishName = highlighted.EnglishName || '';
    highlighted.CountryName = highlighted.CountryName || '';
    
    // 计算匹配分数
    highlighted.matchScore = this.calculateMatchScore(airport, keyword);
    
    // 添加高亮信息
    for (var i = 0; i < highlightFields.length; i++) {
      var field = highlightFields[i];
      var value = airport[field];
      
      if (value && typeof value === 'string') {
        var lowerValue = value.toLowerCase();
        var lowerKeyword = keyword.toLowerCase();
        
        if (lowerValue.indexOf(lowerKeyword) !== -1) {
          highlighted[field + '_highlighted'] = this.highlightText(value, keyword);
          highlighted.primaryMatch = field; // 记录主要匹配字段
        }
      }
    }
    
    return highlighted;
  },
  
  // 高亮文本
  highlightText: function(text, keyword) {
    if (!text || !keyword) return text;
    
    var regex = new RegExp('(' + this.escapeRegExp(keyword) + ')', 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  },
  
  // 转义正则表达式特殊字符
  escapeRegExp: function(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  },
  
  // 计算匹配分数（用于排序）
  calculateMatchScore: function(airport, keyword) {
    var score = 0;
    var lowerKeyword = keyword.toLowerCase();
    
    // ICAO代码完全匹配得分最高
    if (airport.ICAOCode && airport.ICAOCode.toLowerCase() === lowerKeyword) {
      score += 100;
    } else if (airport.ICAOCode && airport.ICAOCode.toLowerCase().indexOf(lowerKeyword) === 0) {
      score += 80;
    } else if (airport.ICAOCode && airport.ICAOCode.toLowerCase().indexOf(lowerKeyword) !== -1) {
      score += 60;
    }
    
    // IATA代码匹配
    if (airport.IATACode && airport.IATACode.toLowerCase() === lowerKeyword) {
      score += 90;
    } else if (airport.IATACode && airport.IATACode.toLowerCase().indexOf(lowerKeyword) === 0) {
      score += 70;
    } else if (airport.IATACode && airport.IATACode.toLowerCase().indexOf(lowerKeyword) !== -1) {
      score += 50;
    }
    
    // 机场名称匹配
    if (airport.ShortName && airport.ShortName.toLowerCase().indexOf(lowerKeyword) === 0) {
      score += 40;
    } else if (airport.ShortName && airport.ShortName.toLowerCase().indexOf(lowerKeyword) !== -1) {
      score += 30;
    }
    
    // 英文名称匹配
    if (airport.EnglishName && airport.EnglishName.toLowerCase().indexOf(lowerKeyword) === 0) {
      score += 35;
    } else if (airport.EnglishName && airport.EnglishName.toLowerCase().indexOf(lowerKeyword) !== -1) {
      score += 25;
    }
    
    // 国家名称匹配
    if (airport.CountryName && airport.CountryName.toLowerCase().indexOf(lowerKeyword) === 0) {
      score += 20;
    } else if (airport.CountryName && airport.CountryName.toLowerCase().indexOf(lowerKeyword) !== -1) {
      score += 10;
    }
    
    return score;
  },
  
  // 搜索结果排序
  sortSearchResults: function(results, keyword) {
    return results.sort(function(a, b) {
      // 首先按匹配分数排序
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      
      // 然后按机场名称排序
      var aName = a.ShortName || a.EnglishName || '';
      var bName = b.ShortName || b.EnglishName || '';
      
      return aName.localeCompare(bName);
    });
  },
  
  // 按国家/地区分组
  groupByCountry: function(airports) {
    var groups = {};
    
    for (var i = 0; i < airports.length; i++) {
      var airport = airports[i];
      var country = airport.CountryName || '未知';
      
      if (!groups[country]) {
        groups[country] = [];
      }
      
      groups[country].push(airport);
    }
    
    // 转换为数组格式并排序
    var groupArray = [];
    for (var country in groups) {
      if (groups.hasOwnProperty(country)) {
        groupArray.push({
          country: country,
          airports: groups[country],
          count: groups[country].length
        });
      }
    }
    
    // 按机场数量排序
    groupArray.sort(function(a, b) {
      return b.count - a.count;
    });
    
    return groupArray;
  },
  
  // 验证ICAO代码格式
  validateICAOCode: function(code) {
    if (!code || typeof code !== 'string') {
      return false;
    }
    
    var pattern = /^[A-Z]{4}$/;
    return pattern.test(code.toUpperCase());
  },
  
  // 验证IATA代码格式
  validateIATACode: function(code) {
    if (!code || typeof code !== 'string') {
      return false;
    }
    
    var pattern = /^[A-Z]{3}$/;
    return pattern.test(code.toUpperCase());
  },
  
  // 计算两个坐标点之间的距离（千米）
  calculateDistance: function(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) {
      return 0;
    }
    
    var R = 6371; // 地球半径（千米）
    var dLat = this.deg2rad(lat2 - lat1);
    var dLon = this.deg2rad(lon2 - lon1);
    
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var distance = R * c;
    
    return Math.round(distance);
  },
  
  // 角度转弧度
  deg2rad: function(deg) {
    return deg * (Math.PI / 180);
  },
  
  // 格式化坐标显示
  formatCoordinate: function(coordinate, type) {
    if (!coordinate || coordinate === 0) {
      return type === 'latitude' ? '0°N' : '0°E';
    }
    
    var abs = Math.abs(coordinate);
    var degrees = Math.floor(abs);
    var minutes = Math.floor((abs - degrees) * 60);
    var seconds = Math.round(((abs - degrees) * 60 - minutes) * 60);
    
    var direction = '';
    if (type === 'latitude') {
      direction = coordinate >= 0 ? 'N' : 'S';
    } else {
      direction = coordinate >= 0 ? 'E' : 'W';
    }
    
    return degrees + '°' + minutes + '\'' + seconds + '\"' + direction;
  },
  
  // 错误处理帮助函数
  handleError: function(error, context) {
    console.error('机场数据处理错误:', context, error);
    
    return {
      success: false,
      error: error.message || '未知错误',
      context: context || '机场数据处理'
    };
  }
};

module.exports = AirportUtils;