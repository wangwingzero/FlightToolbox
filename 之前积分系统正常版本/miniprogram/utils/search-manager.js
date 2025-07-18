// 高性能搜索管理器 - 参考规章搜索技术
// 为缩写、定义、机场、通信等数据提供优化的搜索功能

/**
 * 搜索索引类 - 为不同数据类型创建搜索索引
 */
class SearchIndex {
  constructor() {
    this.indexes = new Map() // 存储不同数据类型的索引
    this.caches = new Map()  // 搜索结果缓存
    this.cacheExpiry = 5 * 60 * 1000 // 缓存5分钟
  }

  /**
   * 为缩写数据创建索引
   */
  createAbbreviationIndex(dataList) {
    console.log('🔍 开始创建缩写搜索索引...')
    const startTime = Date.now()
    
    const index = {
      byAbbreviation: new Map(),
      byEnglish: new Map(),
      byChinese: new Map(),
      byPrefix: new Map(),
      dataList: dataList
    }

    dataList.forEach((item, idx) => {
      // 缩写索引
      if (item.abbreviation) {
        const abbr = item.abbreviation.toLowerCase()
        this.addToIndex(index.byAbbreviation, abbr, idx)
        // 前缀索引
        for (let i = 1; i <= abbr.length; i++) {
          this.addToIndex(index.byPrefix, abbr.substring(0, i), idx)
        }
      }

      // 英文全称索引
      if (item.english_full) {
        const english = item.english_full.toLowerCase()
        this.addToIndex(index.byEnglish, english, idx)
        // 单词索引
        english.split(/\s+/).forEach(word => {
          if (word.length > 1) {
            this.addToIndex(index.byEnglish, word, idx)
          }
        })
      }

      // 中文翻译索引
      if (item.chinese_translation) {
        const chinese = item.chinese_translation.toLowerCase()
        this.addToIndex(index.byChinese, chinese, idx)
      }
    })

    this.indexes.set('abbreviations', index)
    const endTime = Date.now()
    console.log(`✅ 缩写索引创建完成，耗时 ${endTime - startTime}ms`)
  }

  /**
   * 为定义数据创建索引
   */
  createDefinitionIndex(dataList) {
    console.log('🔍 开始创建定义搜索索引...')
    const startTime = Date.now()
    
    const index = {
      byChinese: new Map(),
      byEnglish: new Map(),
      byDefinition: new Map(),
      bySource: new Map(),
      dataList: dataList
    }

    dataList.forEach((item, idx) => {
      // 中文名称索引
      if (item.chinese_name) {
        const chinese = item.chinese_name.toLowerCase()
        this.addToIndex(index.byChinese, chinese, idx)
      }

      // 英文名称索引
      if (item.english_name) {
        const english = item.english_name.toLowerCase()
        this.addToIndex(index.byEnglish, english, idx)
        // 单词索引
        english.split(/\s+/).forEach(word => {
          if (word.length > 1) {
            this.addToIndex(index.byEnglish, word, idx)
          }
        })
      }

      // 定义内容索引
      if (item.definition) {
        const definition = item.definition.toLowerCase()
        this.addToIndex(index.byDefinition, definition, idx)
      }

      // 来源索引
      if (item.source) {
        const source = item.source.toLowerCase()
        this.addToIndex(index.bySource, source, idx)
      }
    })

    this.indexes.set('definitions', index)
    const endTime = Date.now()
    console.log(`✅ 定义索引创建完成，耗时 ${endTime - startTime}ms`)
  }

  /**
   * 为机场数据创建索引
   */
  createAirportIndex(dataList) {
    console.log('🔍 开始创建机场搜索索引...')
    const startTime = Date.now()
    
    const index = {
      byICAO: new Map(),
      byIATA: new Map(),
      byShortName: new Map(),
      byCountry: new Map(),
      byEnglishName: new Map(),
      dataList: dataList
    }

    dataList.forEach((item, idx) => {
      // ICAO代码索引（精确匹配优先）
      if (item.ICAOCode) {
        const icao = item.ICAOCode.toLowerCase()
        this.addToIndex(index.byICAO, icao, idx)
      }

      // IATA代码索引（精确匹配优先）
      if (item.IATACode) {
        const iata = item.IATACode.toLowerCase()
        this.addToIndex(index.byIATA, iata, idx)
      }

      // 机场简称索引
      if (item.ShortName) {
        const shortName = item.ShortName.toLowerCase()
        this.addToIndex(index.byShortName, shortName, idx)
      }

      // 国家名称索引
      if (item.CountryName) {
        const country = item.CountryName.toLowerCase()
        this.addToIndex(index.byCountry, country, idx)
      }

      // 英文名称索引
      if (item.EnglishName) {
        const english = item.EnglishName.toLowerCase()
        this.addToIndex(index.byEnglishName, english, idx)
        // 单词索引
        english.split(/\s+/).forEach(word => {
          if (word.length > 1) {
            this.addToIndex(index.byEnglishName, word, idx)
          }
        })
      }
    })

    this.indexes.set('airports', index)
    const endTime = Date.now()
    console.log(`✅ 机场索引创建完成，耗时 ${endTime - startTime}ms`)
  }

  /**
   * 为通信数据创建索引
   */
  createCommunicationIndex(dataList) {
    console.log('🔍 开始创建通信搜索索引...')
    const startTime = Date.now()
    
    const index = {
      byEnglish: new Map(),
      byChinese: new Map(),
      byChapter: new Map(),
      dataList: dataList
    }

    dataList.forEach((item, idx) => {
      // 英文内容索引
      if (item.english) {
        const english = item.english.toLowerCase()
        this.addToIndex(index.byEnglish, english, idx)
        // 单词索引
        english.split(/\s+/).forEach(word => {
          if (word.length > 2) {
            this.addToIndex(index.byEnglish, word, idx)
          }
        })
      }

      // 中文内容索引
      if (item.chinese) {
        const chinese = item.chinese.toLowerCase()
        this.addToIndex(index.byChinese, chinese, idx)
      }

      // 章节索引
      if (item.chapter) {
        const chapter = item.chapter.toLowerCase()
        this.addToIndex(index.byChapter, chapter, idx)
      }
    })

    this.indexes.set('communications', index)
    const endTime = Date.now()
    console.log(`✅ 通信索引创建完成，耗时 ${endTime - startTime}ms`)
  }

  /**
   * 添加到索引的辅助方法
   */
  addToIndex(indexMap, key, value) {
    if (!indexMap.has(key)) {
      indexMap.set(key, new Set())
    }
    indexMap.get(key).add(value)
  }

  /**
   * 高性能缩写搜索
   */
  searchAbbreviations(keyword, limit = 100) {
    const cacheKey = `abbr_${keyword}_${limit}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const startTime = Date.now()
    const index = this.indexes.get('abbreviations')
    if (!index) return []

    const keywordLower = keyword.toLowerCase()
    const matchedIndices = new Set()
    const results = []

    // 1. 精确匹配缩写（最高优先级）
    if (index.byAbbreviation.has(keywordLower)) {
      index.byAbbreviation.get(keywordLower).forEach(idx => {
        matchedIndices.add(idx)
        results.push({
          ...index.dataList[idx],
          matchType: 'exact_abbreviation',
          priority: 1
        })
      })
    }

    // 2. 前缀匹配缩写
    if (results.length < limit) {
      if (index.byPrefix.has(keywordLower)) {
        index.byPrefix.get(keywordLower).forEach(idx => {
          if (!matchedIndices.has(idx)) {
            matchedIndices.add(idx)
            results.push({
              ...index.dataList[idx],
              matchType: 'prefix_abbreviation',
              priority: 2
            })
          }
        })
      }
    }

    // 3. 英文全称匹配
    if (results.length < limit) {
      for (const [key, indices] of index.byEnglish) {
        if (key.includes(keywordLower)) {
          indices.forEach(idx => {
            if (!matchedIndices.has(idx) && results.length < limit) {
              matchedIndices.add(idx)
              results.push({
                ...index.dataList[idx],
                matchType: 'english_full',
                priority: 3
              })
            }
          })
        }
      }
    }

    // 4. 中文翻译匹配
    if (results.length < limit) {
      for (const [key, indices] of index.byChinese) {
        if (key.includes(keywordLower)) {
          indices.forEach(idx => {
            if (!matchedIndices.has(idx) && results.length < limit) {
              matchedIndices.add(idx)
              results.push({
                ...index.dataList[idx],
                matchType: 'chinese_translation',
                priority: 4
              })
            }
          })
        }
      }
    }

    // 按优先级和相关性排序
    results.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority
      }
      // 同优先级内按字母顺序
      return (a.abbreviation || '').localeCompare(b.abbreviation || '')
    })

    const finalResults = results.slice(0, limit)
    const endTime = Date.now()
    
    console.log(`🔍 缩写搜索完成: "${keyword}" -> ${finalResults.length}条结果, 耗时${endTime - startTime}ms`)
    
    this.setCache(cacheKey, finalResults)
    return finalResults
  }

  /**
   * 高性能定义搜索
   */
  searchDefinitions(keyword, limit = 100) {
    const cacheKey = `def_${keyword}_${limit}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const startTime = Date.now()
    const index = this.indexes.get('definitions')
    if (!index) return []

    const keywordLower = keyword.toLowerCase()
    const matchedIndices = new Set()
    const results = []

    // 1. 中文名称匹配（最高优先级）
    for (const [key, indices] of index.byChinese) {
      if (key.includes(keywordLower)) {
        indices.forEach(idx => {
          if (!matchedIndices.has(idx) && results.length < limit) {
            matchedIndices.add(idx)
            results.push({
              ...index.dataList[idx],
              matchType: 'chinese_name',
              priority: 1
            })
          }
        })
      }
    }

    // 2. 英文名称匹配
    if (results.length < limit) {
      for (const [key, indices] of index.byEnglish) {
        if (key.includes(keywordLower)) {
          indices.forEach(idx => {
            if (!matchedIndices.has(idx) && results.length < limit) {
              matchedIndices.add(idx)
              results.push({
                ...index.dataList[idx],
                matchType: 'english_name',
                priority: 2
              })
            }
          })
        }
      }
    }

    // 3. 定义内容匹配
    if (results.length < limit) {
      for (const [key, indices] of index.byDefinition) {
        if (key.includes(keywordLower)) {
          indices.forEach(idx => {
            if (!matchedIndices.has(idx) && results.length < limit) {
              matchedIndices.add(idx)
              results.push({
                ...index.dataList[idx],
                matchType: 'definition',
                priority: 3
              })
            }
          })
        }
      }
    }

    // 4. 来源匹配
    if (results.length < limit) {
      for (const [key, indices] of index.bySource) {
        if (key.includes(keywordLower)) {
          indices.forEach(idx => {
            if (!matchedIndices.has(idx) && results.length < limit) {
              matchedIndices.add(idx)
              results.push({
                ...index.dataList[idx],
                matchType: 'source',
                priority: 4
              })
            }
          })
        }
      }
    }

    // 排序
    results.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority
      }
      return (a.chinese_name || '').localeCompare(b.chinese_name || '')
    })

    const finalResults = results.slice(0, limit)
    const endTime = Date.now()
    
    console.log(`🔍 定义搜索完成: "${keyword}" -> ${finalResults.length}条结果, 耗时${endTime - startTime}ms`)
    
    this.setCache(cacheKey, finalResults)
    return finalResults
  }

  /**
   * 高性能机场搜索
   */
  searchAirports(keyword, limit = 100) {
    const cacheKey = `airport_${keyword}_${limit}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const startTime = Date.now()
    const index = this.indexes.get('airports')
    if (!index) return []

    const keywordLower = keyword.toLowerCase()
    const matchedIndices = new Set()
    const results = []

    // 1. ICAO代码精确匹配（最高优先级）
    if (index.byICAO.has(keywordLower)) {
      index.byICAO.get(keywordLower).forEach(idx => {
        matchedIndices.add(idx)
        results.push({
          ...index.dataList[idx],
          matchType: 'icao_exact',
          priority: 1
        })
      })
    }

    // 2. IATA代码精确匹配
    if (index.byIATA.has(keywordLower)) {
      index.byIATA.get(keywordLower).forEach(idx => {
        if (!matchedIndices.has(idx)) {
          matchedIndices.add(idx)
          results.push({
            ...index.dataList[idx],
            matchType: 'iata_exact',
            priority: 2
          })
        }
      })
    }

    // 3. 机场简称匹配
    if (results.length < limit) {
      for (const [key, indices] of index.byShortName) {
        if (key.includes(keywordLower)) {
          indices.forEach(idx => {
            if (!matchedIndices.has(idx) && results.length < limit) {
              matchedIndices.add(idx)
              results.push({
                ...index.dataList[idx],
                matchType: 'short_name',
                priority: 3
              })
            }
          })
        }
      }
    }

    // 4. 国家名称匹配
    if (results.length < limit) {
      for (const [key, indices] of index.byCountry) {
        if (key.includes(keywordLower)) {
          indices.forEach(idx => {
            if (!matchedIndices.has(idx) && results.length < limit) {
              matchedIndices.add(idx)
              results.push({
                ...index.dataList[idx],
                matchType: 'country',
                priority: 4
              })
            }
          })
        }
      }
    }

    // 5. 英文名称匹配
    if (results.length < limit) {
      for (const [key, indices] of index.byEnglishName) {
        if (key.includes(keywordLower)) {
          indices.forEach(idx => {
            if (!matchedIndices.has(idx) && results.length < limit) {
              matchedIndices.add(idx)
              results.push({
                ...index.dataList[idx],
                matchType: 'english_name',
                priority: 5
              })
            }
          })
        }
      }
    }

    // 排序
    results.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority
      }
      return (a.ICAOCode || a.IATACode || '').localeCompare(b.ICAOCode || b.IATACode || '')
    })

    const finalResults = results.slice(0, limit)
    const endTime = Date.now()
    
    console.log(`🔍 机场搜索完成: "${keyword}" -> ${finalResults.length}条结果, 耗时${endTime - startTime}ms`)
    
    this.setCache(cacheKey, finalResults)
    return finalResults
  }

  /**
   * 高性能通信搜索
   */
  searchCommunications(keyword, limit = 100) {
    const cacheKey = `comm_${keyword}_${limit}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const startTime = Date.now()
    const index = this.indexes.get('communications')
    if (!index) return []

    const keywordLower = keyword.toLowerCase()
    const matchedIndices = new Set()
    const results = []

    // 1. 英文内容匹配
    for (const [key, indices] of index.byEnglish) {
      if (key.includes(keywordLower)) {
        indices.forEach(idx => {
          if (!matchedIndices.has(idx) && results.length < limit) {
            matchedIndices.add(idx)
            results.push({
              ...index.dataList[idx],
              matchType: 'english',
              priority: 1
            })
          }
        })
      }
    }

    // 2. 中文内容匹配
    if (results.length < limit) {
      for (const [key, indices] of index.byChinese) {
        if (key.includes(keywordLower)) {
          indices.forEach(idx => {
            if (!matchedIndices.has(idx) && results.length < limit) {
              matchedIndices.add(idx)
              results.push({
                ...index.dataList[idx],
                matchType: 'chinese',
                priority: 2
              })
            }
          })
        }
      }
    }

    // 按章节分组排序
    results.sort((a, b) => {
      if (a.chapter !== b.chapter) {
        return a.chapter.localeCompare(b.chapter)
      }
      return a.priority - b.priority
    })

    const finalResults = results.slice(0, limit)
    const endTime = Date.now()
    
    console.log(`🔍 通信搜索完成: "${keyword}" -> ${finalResults.length}条结果, 耗时${endTime - startTime}ms`)
    
    this.setCache(cacheKey, finalResults)
    return finalResults
  }

  /**
   * 缓存管理
   */
  setCache(key, value) {
    this.caches.set(key, {
      value,
      timestamp: Date.now()
    })
  }

  getFromCache(key) {
    const cached = this.caches.get(key)
    if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
      return cached.value
    }
    this.caches.delete(key)
    return null
  }

  clearCache() {
    this.caches.clear()
    console.log('🗑️ 搜索缓存已清空')
  }
}

// 创建全局搜索管理器实例
const searchManager = new SearchIndex()

module.exports = {
  searchManager,
  SearchIndex
} 