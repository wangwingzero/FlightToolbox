// 雪情通告解码器页面

Page({
  data: {
    // 雪情通告相关数据
    grfSnowTamInput: '',
    grfDecodedResult: null as any,
    grfError: ''
  },

  onLoad() {
    console.log('雪情通告解码器页面加载完成')
  },

  // SNOWTAM输入变化处理
  onGrfSnowTamInputChange(event: any) {
    const inputText = event.detail
    this.setData({ 
      grfSnowTamInput: inputText,
      grfError: ''
    })
    
    // 实时解析
    if (inputText.trim()) {
      this.parsePartialSnowTam(inputText)
    } else {
      this.setData({ grfDecodedResult: null })
    }
  },

  // 解析SNOWTAM
  parseSnowTam() {
    const input = this.data.grfSnowTamInput.trim()
    if (!input) {
      this.setData({ 
        grfError: '请输入SNOWTAM报文内容',
        grfDecodedResult: null 
      })
      return
    }

    try {
      const result = this.parseSnowTamText(input)
      this.setData({ 
        grfDecodedResult: {
          ...result,
          isPartial: false
        },
        grfError: '' 
      })
    } catch (error) {
      this.setData({ 
        grfError: (error as Error).message || '解析失败',
        grfDecodedResult: null 
      })
    }
  },

  // 解析SNOWTAM文本
  parseSnowTamText(text: string) {
    console.log('parseSnowTamText 输入:', text)
    const lines = text.split('\n').map(line => line.trim()).filter(line => line)
    
    // 查找机场代码和观测时间
    let airportCode = ''
    let observationTime = ''
    const allRunways = [] // 存储所有跑道的数据
    
    for (const line of lines) {
      console.log('处理行:', line)
      
      // 方法1: 匹配完整简化报头格式: SWZB0151 ZBAA 02170230
      const headerMatch = line.match(/SW[A-Z]{2}\d{4}\s+([A-Z]{4})\s+(\d{8})/)
      if (headerMatch) {
        airportCode = headerMatch[1]
        observationTime = headerMatch[2]
        console.log('方法1匹配报头:', { airportCode, observationTime })
        continue
      }
      
      // 方法2: 匹配机场代码和时间的独立行: ZBAA 02170155 或时间
      if (!airportCode || !observationTime) {
        const airportTimeMatch = line.match(/^([A-Z]{4})\s+(\d{6,8})$/)
        if (airportTimeMatch) {
          airportCode = airportTimeMatch[1]
          observationTime = airportTimeMatch[2]
          console.log('方法2匹配机场时间:', { airportCode, observationTime })
          continue
        }
      }
      
      // 方法3: 提取机场代码（如果还没有）
      if (!airportCode) {
        const codeMatch = line.match(/\b([A-Z]{4})\b/)
        if (codeMatch && line.indexOf('/') === -1) { // 避免匹配跑道数据行
          airportCode = codeMatch[1]
          console.log('方法3提取机场代码:', airportCode)
        }
      }
      
      // 方法4: 提取时间戳（如果还没有）
      if (!observationTime) {
        const timeMatch = line.match(/\b(\d{6,8})\b/)
        if (timeMatch && line.indexOf('/') === -1) { // 避免匹配跑道数据行
          observationTime = timeMatch[1]
          console.log('方法4提取时间:', observationTime)
        }
      }
      
      // 方法5: 匹配跑道数据行 - 更严格的匹配
      // 格式1: 02170155 16L 2/5/3 100/50/75 04/03/04 SLUSH/DRY SNOW/WET SNOW
      // 格式2: 16L 2/5/3 100/50/75 04/03/04 SLUSH/DRY SNOW/WET SNOW
      // 格式3: 02170230 16R 2/5/3 75/100/100 04/03/NR SLUSH/SLUSH/SLUSH 50
      // 格式4: 02170225 01L 5/5/5 100/100/100 02/05/10 (污染物状况在下一行)
      
      // 先检查这行是否包含机场代码，如果是则跳过作为跑道数据处理
      const isAirportLine = line.match(/^[A-Z]{4}\s+\d{6,8}/)
      
      if (!isAirportLine) {
        // 只对非机场代码行进行跑道数据匹配
        // 排除明语说明中的内容（包含CONTAMINANT、UPGRADED、DOWNGRADED等关键词）
        const isPlainLanguageLine = line.match(/CONTAMINANT|UPGRADED|DOWNGRADED|TAKEOFF|SIGNIFICANT|POOR|NOT\s+IN\s+USE|REMARK/i)
        
        if (!isPlainLanguageLine) {
          const runwayMatch = line.match(/(?:(\d{6,8})\s+)?([0-9]{1,2}[LRC]?)\s+([\d\/]+)(?:\s+([\d\/NR]+))?(?:\s+([\d\/NR]+))?(?:\s+(.+?))?(?:\s+(\d+))?$/)
          if (runwayMatch && runwayMatch[3] && runwayMatch[3].indexOf('/') !== -1) {
          const timeInLine = runwayMatch[1]
          const runway = runwayMatch[2]
          const rwyccStr = runwayMatch[3]
          let coverageStr = runwayMatch[4] || 'NR/NR/NR'
          let depthStr = runwayMatch[5] || 'NR/NR/NR'
          let conditionStr = runwayMatch[6] || 'NR/NR/NR'
          const runwayWidth = runwayMatch[7] || ''
          
          // 如果这行包含时间，更新观测时间
          if (timeInLine && !observationTime) {
            observationTime = timeInLine
          }
          
          // 检查是否污染物状况在下一行（如果当前行没有污染物描述，只有数字）
          const currentIndex = lines.indexOf(line)
          if (currentIndex >= 0 && currentIndex < lines.length - 1) {
            const nextLine = lines[currentIndex + 1]
            
            // 检查下一行是否包含污染物类型描述（包含字母和斜线）
            if (nextLine && nextLine.match(/[A-Z\/]+/) && !nextLine.match(/\d{6,8}/) && !nextLine.match(/\w+\s+[\d\/]+/)) {
              // 下一行可能包含污染物状况，检查格式
              const nextLineClean = nextLine.trim()
              
              // 如果下一行看起来像污染物描述
              if (nextLineClean.indexOf('/') !== -1 || nextLineClean.match(/WET|DRY|SLUSH|SNOW|ICE|WATER|FROST/)) {
                // 解析下一行的污染物信息
                const conditionMatch = nextLineClean.match(/^([A-Z\/\s]+?)(?:\s+SNOW(\d+))?$/)
                if (conditionMatch) {
                  conditionStr = conditionMatch[1]
                  const snowDepth = conditionMatch[2]
                  
                  // 如果有雪深度信息，可能需要调整深度数据
                  if (snowDepth) {
                    // SNOW50 表示特殊的雪深度信息，可以添加到明语说明中
                    console.log('发现雪深度信息:', snowDepth)
                  }
                } else {
                  conditionStr = nextLineClean
                }
              }
            }
          }
          
          console.log('方法5匹配跑道数据:', { runway, rwyccStr, coverageStr, depthStr, conditionStr, runwayWidth })
          
          // 解析这个跑道的数据
          const runwayData = this.parseRunwayData(runway, rwyccStr, coverageStr, depthStr, conditionStr, runwayWidth)
          if (runwayData) {
            allRunways.push(runwayData)
          }
          }
        }
      }
    }
        
        // 如果是6位时间，前面补当前月份
    if (observationTime && observationTime.length === 6) {
          const currentMonth = new Date().getMonth() + 1
          observationTime = (currentMonth < 10 ? '0' : '') + currentMonth.toString() + observationTime
        }
        
    console.log('解析结果汇总:', { airportCode, observationTime, allRunways })

    if (allRunways.length === 0) {
      throw new Error('未找到有效的跑道数据。支持格式：\n1. 完整SNOWTAM格式\n2. 简化格式：机场代码 时间 跑道号 RWYCC\n3. 最简格式：跑道号 RWYCC代码\n4. 多跑道格式：每行一个跑道数据')
    }

    // 使用改进的明语说明提取函数
    const plainLanguage = this.extractPlainLanguageFromInput(text)
    console.log('🔍 提取的明语说明:', plainLanguage)

    // 生成多跑道标准雪情通告翻译
    const formattedObsTime = observationTime ? this.formatObservationTime(String(observationTime)) : '未知'
    const translationResult = this.generateMultiRunwaySafetyAdvice(allRunways, airportCode || '未知', formattedObsTime, plainLanguage)
    
    // 返回第一个跑道的数据作为主要显示（保持兼容性），同时包含所有跑道数据
    const primaryRunway = allRunways[0]
    return {
      airport: airportCode || '未知',
      observationTime: formattedObsTime,
      runway: allRunways.map(r => r.runway).join(', '),
      segments: primaryRunway.segments,
      runwayWidth: primaryRunway.runwayWidth || null,
      plainLanguage: plainLanguage,
      safetyAdvice: this.convertTranslationLinesToText(translationResult.translationLines),
      translationLines: translationResult.translationLines,
      allRunways: allRunways // 新增：包含所有跑道的数据
    }
  },

  // 部分解析SNOWTAM文本（用于实时解析）
  parsePartialSnowTam(_inputText: string) {
    try {
      const result = {
        isPartial: true,
        airport: '',
        observationTime: '',
        runway: '',
        segments: [] as any[],
        runwayWidth: null,
        plainLanguage: '',
        safetyAdvice: '',
        translationLines: [] as any[]
      }
      
      this.setData({
        grfDecodedResult: result,
        grfError: ''
      })
        } catch (error) {
      this.setData({ 
        grfError: (error as Error).message || '解析失败',
        grfDecodedResult: null 
      })
    }
  },

  // 解析跑道数据
  parseRunwayData(runway: string, rwyccStr: string, coverageStr: string, depthStr: string, conditionStr: string, runwayWidth: string) {
      const rwyccCodes = rwyccStr.split('/').map(code => parseInt(code))
      const coverages = coverageStr.split('/').map(coverage => {
        if (coverage === 'NR') return 'NR'
        return parseInt(coverage)
      })
      const depths = depthStr.split('/')
      
      // 处理污染物条件字符串
      let conditions = ['NR', 'NR', 'NR']
    if (conditionStr && conditionStr !== 'NR/NR/NR' && conditionStr !== 'NR') {
      console.log('处理污染物条件字符串:', conditionStr)
      
      // 处理末尾可能的跑道宽度数字或特殊标记（如SNOW50）
        let cleanConditionStr = conditionStr.trim()
        const widthMatch = cleanConditionStr.match(/(.+?)\s*(\d+)$/)
        if (widthMatch) {
          cleanConditionStr = widthMatch[1]
          if (!runwayWidth) runwayWidth = widthMatch[2]
        }
      
      // 处理特殊格式如 "WET/WET/WET SNOW50"
      const specialMatch = cleanConditionStr.match(/^([^0-9]+?)(\s+SNOW\d+)?$/)
      if (specialMatch) {
        cleanConditionStr = specialMatch[1].trim()
      }
        
        if (cleanConditionStr.indexOf('/') !== -1) {
        // 直接按斜线分割
          conditions = cleanConditionStr.split('/').map(c => c.trim())
        console.log('按斜线分割的污染物条件:', conditions)
        } else {
          // 智能分割复合污染物名称
          const parts = cleanConditionStr.split(/\s+/)
          conditions = []
          let currentCondition = ''
          
          for (const part of parts) {
                        if (part.indexOf('SNOW') !== -1 || part.indexOf('ICE') !== -1 || part.indexOf('WATER') !== -1 ||
                part.indexOf('WET') !== -1 || part.indexOf('DRY') !== -1 || part.indexOf('SLUSH') !== -1 ||
                part.indexOf('FROST') !== -1 || part.indexOf('COMPACTED') !== -1) {
              if (currentCondition) {
                conditions.push(currentCondition.trim())
              }
              currentCondition = part
            } else {
              currentCondition += (currentCondition ? ' ' : '') + part
            }
          }
          if (currentCondition) {
            conditions.push(currentCondition.trim())
          }
        console.log('智能分割的污染物条件:', conditions)
        }
        
        // 确保有3个条件
        while (conditions.length < 3) {
        conditions.push(conditions[conditions.length - 1] || 'NR')
        }
        conditions = conditions.slice(0, 3)
      console.log('最终的污染物条件:', conditions)
      }

    const segments = []
      for (let i = 0; i < 3; i++) {
        segments.push({
          rwycc: rwyccCodes[i] || 6,
        rwyCcDescription: this.getRwyccDescription(rwyccCodes[i]),
          coverage: coverages[i] || 'NR',
          depth: depths[i] || 'NR',
          condition: (conditions[i] && conditions[i].trim()) || 'NR'
        })
    }

    return {
      runway: runway,
      segments: segments,
      runwayWidth: runwayWidth || null
    }
  },

  // 格式化观测时间
  formatObservationTime(timeStr: string): string {
    if (!timeStr || timeStr.length < 6) return timeStr
    
    const day = timeStr.substring(0, 2)
    const hour = timeStr.substring(2, 4)
    const minute = timeStr.substring(4, 6)
    
    return `${day}日 ${hour}:${minute}`
  },

  // 生成多跑道标准雪情通告翻译
  generateMultiRunwaySafetyAdvice(allRunways: any[], airportCode: string, observationTime: string, plainLanguage?: string) {
    const translationLines = []
    
    // 飞机性能计算部分翻译
    translationLines.push(this.createTranslationLine('『飞机性能计算部分』', true))
    translationLines.push(this.createTranslationLine(''))
    
    // A项 - 发生地
    translationLines.push(this.createTranslationLine(`A) 发生地：`, false, [
      { text: 'A) 发生地：', isHighlight: false },
      { text: airportCode, isHighlight: true }
    ]))
    
    // B项 - 观测时间  
    translationLines.push(this.createTranslationLine(`B) 观测时间：`, false, [
      { text: 'B) 观测时间：', isHighlight: false },
      { text: observationTime, isHighlight: true }
    ]))
    
    // 为每个跑道生成详细信息
    allRunways.forEach((runwayData, _runwayIndex) => {
      const { runway, segments, runwayWidth } = runwayData
      
      if (allRunways.length > 1) {
        translationLines.push(this.createTranslationLine(''))
        translationLines.push(this.createTranslationLine(`━━━ 跑道 ${runway} ━━━`, true))
      }
      
      // C项 - 跑道号码
      translationLines.push(this.createTranslationLine(`C) 跑道号码：`, false, [
        { text: 'C) 跑道号码：', isHighlight: false },
        { text: runway, isHighlight: true }
      ]))
      
      // D项 - 跑道状况代码
      const rwyccCodes = segments.map((seg: any) => seg.rwycc).join('/')
      translationLines.push(this.createTranslationLine(`D) 跑道状况代码：`, false, [
        { text: 'D) 跑道状况代码：', isHighlight: false },
        { text: rwyccCodes, isHighlight: true }
      ]))
      
      // 详细的RWYCC说明
      segments.forEach((seg: any, index: number) => {
        const segmentNames = ['接地段(1/3)', '中段(1/3)', '滑跑段(1/3)']
        const prefixes = ['   ├─ ', '   ├─ ', '   └─ ']
        translationLines.push(this.createTranslationLine('', false, [
          { text: prefixes[index], isHighlight: false },
          { text: segmentNames[index] + '：', isHighlight: false },
          { text: seg.rwycc.toString(), isHighlight: true },
          { text: ` (${this.getRwyccDescription(seg.rwycc)})`, isHighlight: false }
        ]))
      })
      
      // E项 - 跑道污染物覆盖范围
      const coverages = segments.map((seg: any) => seg.coverage === 'NR' ? 'NR' : `${seg.coverage}%`).join('/')
      translationLines.push(this.createTranslationLine(`E) 跑道污染物覆盖范围：`, false, [
        { text: 'E) 跑道污染物覆盖范围：', isHighlight: false },
        { text: coverages, isHighlight: true }
      ]))
      
      segments.forEach((seg: any, index: number) => {
        const segmentNames = ['接地段', '中段', '滑跑段']
        const prefixes = ['   ├─ ', '   ├─ ', '   └─ ']
        const coverageDesc = seg.coverage === 'NR' ? '无报告' : `覆盖${seg.coverage}%`
        translationLines.push(this.createTranslationLine('', false, [
          { text: prefixes[index], isHighlight: false },
          { text: segmentNames[index] + '：', isHighlight: false },
          { text: coverageDesc, isHighlight: seg.coverage !== 'NR' }
        ]))
      })
      
      // F项 - 跑道污染物深度
      const depths = segments.map((seg: any) => seg.depth === 'NR' ? 'NR' : `${seg.depth}mm`).join('/')
      translationLines.push(this.createTranslationLine(`F) 跑道污染物深度：`, false, [
        { text: 'F) 跑道污染物深度：', isHighlight: false },
        { text: depths, isHighlight: true }
      ]))
      
      segments.forEach((seg: any, index: number) => {
        const segmentNames = ['接地段', '中段', '滑跑段']
        const prefixes = ['   ├─ ', '   ├─ ', '   └─ ']
        const depthDesc = seg.depth === 'NR' ? '无报告' : `深度${seg.depth}毫米`
        translationLines.push(this.createTranslationLine('', false, [
          { text: prefixes[index], isHighlight: false },
          { text: segmentNames[index] + '：', isHighlight: false },
          { text: depthDesc, isHighlight: seg.depth !== 'NR' }
        ]))
      })
      
      // G项 - 跑道状况说明
      const conditions = segments.map((seg: any) => this.translateCondition(seg.condition)).join(' / ')
      translationLines.push(this.createTranslationLine(`G) 跑道状况说明：`, false, [
        { text: 'G) 跑道状况说明：', isHighlight: false },
        { text: conditions, isHighlight: true }
      ]))
      
      segments.forEach((seg: any, index: number) => {
        const segmentNames = ['接地段', '中段', '滑跑段']
        const prefixes = ['   ├─ ', '   ├─ ', '   └─ ']
        const conditionDesc = this.translateCondition(seg.condition)
        translationLines.push(this.createTranslationLine('', false, [
          { text: prefixes[index], isHighlight: false },
          { text: segmentNames[index] + '：', isHighlight: false },
          { text: conditionDesc, isHighlight: seg.condition !== 'NR' }
        ]))
      })
      
      // H项 - 跑道状况代码对应的跑道宽度
      if (runwayWidth) {
        translationLines.push(this.createTranslationLine(`H) 跑道状况代码对应的跑道宽度：`, false, [
          { text: 'H) 跑道状况代码对应的跑道宽度：', isHighlight: false },
          { text: `${runwayWidth}米`, isHighlight: true }
        ]))
        translationLines.push(this.createTranslationLine('   └─ 说明：清理宽度小于公布跑道宽度'))
      } else {
        translationLines.push(this.createTranslationLine('H) 跑道状况代码对应的跑道宽度：【未报告】'))
        translationLines.push(this.createTranslationLine('   └─ 说明：使用公布的跑道宽度'))
      }
    })
    
    // 情景意识部分
    if (plainLanguage && plainLanguage.trim()) {
      translationLines.push(this.createTranslationLine(''))
      translationLines.push(this.createTranslationLine('『情景意识部分』', true))
      
      // 详细翻译明语说明中的各项内容
      const translatedItems = this.translatePlainLanguageItems(plainLanguage)
      if (translatedItems.length > 0) {
        translatedItems.forEach((item, index) => {
          translationLines.push(this.createTranslationLine('', false, [
            { text: `${item.code}) 【${item.title}】：`, isHighlight: false },
            { text: item.content, isHighlight: true }
          ]))
          translationLines.push(this.createTranslationLine(`   └─ 注意事项：${item.note}`))
          if (index < translatedItems.length - 1) {
            translationLines.push(this.createTranslationLine(''))
          }
        })
      }
    }
    
    return { translationLines }
  },

  // 创建翻译行的辅助方法
  createTranslationLine(text: string, isTitle: boolean = false, customParts?: any[]) {
    if (customParts) {
      return { parts: customParts }
    }
    
    if (!text.trim()) {
      return { parts: [{ text: '', isHighlight: false, isTitle: false }] }
    }
    
    return {
      parts: [{ text: text, isHighlight: false, isTitle: isTitle }]
    }
  },

  // 将翻译行转换为纯文本
  convertTranslationLinesToText(translationLines: any[]): string {
    return translationLines.map(line => {
      return line.parts.map((part: any) => part.text).join('')
    }).join('\n')
  },

  // 解析翻译文本为结构化数据（保留用于兼容性）
  parseTranslationText(text: string) {
    const lines = text.split('\n')
    const translationLines = []
    
    for (const line of lines) {
      if (line.trim()) {
        const parts = []
        
        // 简化的文本解析
        const words = line.split(' ')
        for (const word of words) {
          parts.push({
            text: word,
            isHighlight: false,
            isTitle: false
          })
        }
        
        translationLines.push({ parts })
      }
    }
    
    return translationLines
  },

  // 获取RWYCC描述
  getRwyccDescription(rwycc: number): string {
    const descriptions: { [key: number]: string } = {
      0: '不可用',
      1: '差',
      2: '差到中等',
      3: '中等',
      4: '中等到好',
      5: '好',
      6: '好'
    }
    return descriptions[rwycc] || '未知'
  },

  // 翻译污染物条件
  translateCondition(condition: string): string {
    const translations: { [key: string]: string } = {
      'NR': '无报告',
      'CLR': '干燥',
      'DMP': '潮湿',
      'WET': '湿润',
      'ICE': '结冰',
      'SNW': '雪',
      'SLU': '雪泥',
      'STD': '积雪',
      'FRZ': '冰冻'
    }
    return translations[condition] || condition
  },

  // 从输入中提取明语说明
  extractPlainLanguageFromInput(input: string): string {
    const lines = input.split('\n').map(line => line.trim()).filter(line => line)
    let plainLanguage = ''
    
    for (const line of lines) {
      // 检查是否包含明语说明关键词
      if (line.match(/CONTAMINANT|UPGRADED|DOWNGRADED|TAKEOFF|SIGNIFICANT|POOR|NOT\s+IN\s+USE|REMARK|REDUCED|DRIFTING|LOOSE|CHEMICALLY|SNOWBANK|ADJ/i)) {
        // 排除纯数据行
        if (!line.match(/[\d\/]{10,}/) && !line.match(/^[A-Z]{4}\s+\d{6,8}/)) {
          plainLanguage += line + ' '
        }
      }
    }
    
    return plainLanguage.trim()
  },

  // 安全获取正则匹配结果
  safeMatch(text: string, regex: RegExp): string {
    const match = text.match(regex)
    return match && match[0] || ''
  },

  // 翻译明语说明项目
  translatePlainLanguageItems(plainLanguage: string): any[] {
    const items = []
    
    // 检查各种情景意识内容
    if (plainLanguage.match(/REDUCED|DRIFTING|LOOSE|CHEMICALLY|SNOWBANK|POOR|ADJ/i)) {
      // 根据内容类型确定具体的项目代码和标题
      if (plainLanguage.match(/REDUCED/i)) {
        items.push({
          code: 'I',
          title: '跑道长度变短',
          content: this.translatePlainLanguageContent(this.safeMatch(plainLanguage, /RWY\s+\w+\s+REDUCED\s+TO\s+\d+/gi)),
          note: '请检查性能计算中使用的跑道距离是否正确'
        })
      }
      
      if (plainLanguage.match(/DRIFTING\s+SNOW/i)) {
        items.push({
          code: 'J',
          title: '跑道上有吹积的雪堆',
          content: '跑道上有吹积的雪堆',
          note: '注意侧风条件下产生的"移动跑道"视错觉'
        })
      }
      
      if (plainLanguage.match(/LOOSE\s+SAND/i)) {
        items.push({
          code: 'K',
          title: '跑道上有散沙',
          content: this.translatePlainLanguageContent(this.safeMatch(plainLanguage, /RWY\s+\w+\s+LOOSE\s+SAND/gi)),
          note: '如果使用反推，发动机会吸入沙子'
        })
      }
      
      if (plainLanguage.match(/CHEMICALLY\s+TREATED/i)) {
        items.push({
          code: 'L',
          title: '跑道的化学处理',
          content: this.translatePlainLanguageContent(this.safeMatch(plainLanguage, /RWY\s+\w+\s+CHEMICALLY\s+TREATED/gi)),
          note: '可能会造成刹车磨损'
        })
      }
      
      if (plainLanguage.match(/SNOWBANK/i)) {
        const snowbankMatches = plainLanguage.match(/RWY\s+\w+\s+SNOWBANK[^.]+/gi) || []
        const twySnowbankMatches = plainLanguage.match(/TWY\s+\w+\s+SNOWBANK/gi) || []
        const adjSnowbankMatches = plainLanguage.match(/RWY\s+\w+\s+ADJ\s+SNOWBANK/gi) || []
        
        snowbankMatches.forEach(match => {
          items.push({
            code: 'M',
            title: '跑道上有雪堤',
            content: this.translatePlainLanguageContent(match),
            note: '存在失去方向控制或将雪吸入发动机的危险'
          })
        })
        
        twySnowbankMatches.forEach(match => {
          items.push({
            code: 'N',
            title: '滑行道上有雪堤',
            content: this.translatePlainLanguageContent(match),
            note: '滑行时避免吸入雪'
          })
        })
        
        adjSnowbankMatches.forEach(match => {
          items.push({
            code: 'O',
            title: '跑道附近有雪堤',
            content: this.translatePlainLanguageContent(match),
            note: '滑行时避免吸入雪'
          })
        })
      }
      
      if (plainLanguage.match(/TWY\s+\w+\s+POOR|ALL\s+TWY\s+POOR/i)) {
        items.push({
          code: 'P',
          title: '滑行道状况',
          content: this.translatePlainLanguageContent(this.safeMatch(plainLanguage, /TWY\s+\w+\s+POOR|ALL\s+TWY\s+POOR/gi)),
          note: '相应地调整滑行速度和滑行技术'
        })
      }
      
      if (plainLanguage.match(/APRON\s+\w+\s+POOR|ALL\s+APRON\s+POOR/i)) {
        items.push({
          code: 'R',
          title: '停机坪状况',
          content: this.translatePlainLanguageContent(this.safeMatch(plainLanguage, /APRON\s+\w+\s+POOR|ALL\s+APRON\s+POOR/gi)),
          note: '相应地调整滑行速度和滑行技术'
        })
      }
      
      // T)项：明语说明 - 其他未分类的内容
      const otherContent = plainLanguage.replace(/RWY\s+\w+\s+REDUCED\s+TO\s+\d+[^.]*\./gi, '')
                                      .replace(/DRIFTING\s+SNOW[^.]*\./gi, '')
                                      .replace(/RWY\s+\w+\s+LOOSE\s+SAND[^.]*\./gi, '')
                                      .replace(/RWY\s+\w+\s+CHEMICALLY\s+TREATED[^.]*\./gi, '')
                                      .replace(/RWY\s+\w+\s+SNOWBANK[^.]*\./gi, '')
                                      .replace(/TWY\s+\w+\s+SNOWBANK[^.]*\./gi, '')
                                      .replace(/RWY\s+\w+\s+ADJ\s+SNOWBANK[^.]*\./gi, '')
                                      .replace(/TWY\s+\w+\s+POOR[^.]*\./gi, '')
                                      .replace(/ALL\s+TWY\s+POOR[^.]*\./gi, '')
                                      .replace(/APRON\s+\w+\s+POOR[^.]*\./gi, '')
                                      .replace(/ALL\s+APRON\s+POOR[^.]*\./gi, '')
                                      .trim()
      
      if (otherContent) {
        items.push({
          code: 'T',
          title: '明语说明',
          content: this.translatePlainLanguageContent(otherContent),
          note: '对机场运行具有重要意义的雪情状况'
        })
      }
    } else if (plainLanguage.trim()) {
      // 如果没有匹配到特定的情景意识项目，但有内容，则归类为明语说明
      items.push({
        code: 'T',
        title: '明语说明',
        content: this.translatePlainLanguageContent(plainLanguage),
        note: '对机场运行具有重要意义的雪情状况'
      })
    }
    
    return items
  },

  // 翻译明语说明内容
  translatePlainLanguageContent(content: string): string {
    const translations: { [key: string]: string } = {
      // 基本词汇
      'RWY': '跑道',
      'TWY': '滑行道',
      'APRON': '停机坪',
      'REDUCED': '缩短',
      'TO': '至',
      'DRIFTING': '吹积',
      'SNOW': '雪',
      'LOOSE': '松散',
      'SAND': '沙',
      'CHEMICALLY': '化学',
      'TREATED': '处理',
      'SNOWBANK': '雪堤',
      'POOR': '状况差',
      'ADJ': '邻近',
      'ALL': '所有',
      'NORTH': '北',
      'SOUTH': '南',
      'EAST': '东',
      'WEST': '西',
      'LEFT': '左',
      'RIGHT': '右',
      'CENTER': '中央',
      'DEICING': '除冰',
      'WIDTH': '宽度',
      'AVBL': '可用',
      'FM': '距离',
      'RCL': '跑道中线',
      'CL': '中线',
      // 特殊短语
      'DRIFTING SNOW': '吹积雪堆',
      'LOOSE SAND': '松散沙土',
      'CHEMICALLY TREATED': '化学处理',
      'ALL TWY POOR': '所有滑行道状况差',
      'ALL APRON POOR': '所有停机坪状况差',
      'REDUCED TO': '缩短至',
      'SNOWBANK LR': '左右两侧雪堤',
      'SNOWBANK L': '左侧雪堤',
      'SNOWBANK R': '右侧雪堤',
      'ADJ SNOWBANK': '邻近雪堤',
      'FM CL': '距中线',
      // 数字单位
      'M': '米'
    }
    
    let translated = content
    
    // 先处理特殊短语（较长的优先）
    const sortedKeys = Object.keys(translations).sort((a, b) => b.length - a.length)
    for (const english of sortedKeys) {
      const chinese = translations[english]
      translated = translated.replace(new RegExp(english, 'gi'), chinese)
    }
    
    // 处理跑道号码格式 (如 16L, 03R)
    translated = translated.replace(/(\d{1,2}[LRC]?)/g, '$1')
    
    // 处理距离格式 (如 20M, 30M)
    translated = translated.replace(/(\d+)米/g, '$1米')
    
    return translated.trim()
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '飞行小工具 - 雪情通告解码器',
      path: '/pages/snowtam-decoder/index'
    }
  },

  onShareTimeline() {
    return {
      title: '飞行小工具 - 雪情通告解码器'
    }
  }
}) 