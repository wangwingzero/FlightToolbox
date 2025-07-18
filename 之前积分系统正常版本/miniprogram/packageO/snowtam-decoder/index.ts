// 雪情通告解码器页面
// 工具管理器将在需要时动态引入

Page({
  data: {
    // 雪情通告相关数据
    grfSnowTamInput: '',
    grfDecodedResult: null,
    grfError: '',
    
    // UI状态
    isLoading: false,
    showSuccess: false,
    successMessage: '',
    isDarkMode: false,
    
    // 界面显示状态
    showDecoderInterface: false,
    showLearningInterface: false,
    currentStep: 1
  },

  onLoad() {
    console.log('雪情通告解码器页面加载完成');
    
    // 检查系统主题
    this.checkSystemTheme();
  },

  // 检查系统主题
  checkSystemTheme() {
    const systemInfo = wx.getSystemInfoSync();
    const isDark = systemInfo.theme === 'dark';
    this.setData({ isDarkMode: isDark });
  },

  // 显示解码器界面
  showDecoder() {
    this.setData({ 
      showDecoderInterface: true,
      showLearningInterface: false,
      currentStep: 1
    });
    
    // 平滑滚动到解码器界面
    setTimeout(() => {
      wx.pageScrollTo({
        selector: '.decoder-interface',
        duration: 500
      });
    }, 100);
  },

  // 显示学习材料界面
  showLearning() {
    this.setData({ 
      showLearningInterface: true,
      showDecoderInterface: false
    });
    
    // 平滑滚动到学习界面
    setTimeout(() => {
      wx.pageScrollTo({
        selector: '.learning-interface',
        duration: 500
      });
    }, 100);
  },

  // SNOWTAM输入变化处理
  onGrfSnowTamInputChange(event: any) {
    const inputText = event.detail.value || event.detail;
    
    this.setData({ 
      grfSnowTamInput: inputText,
      grfError: '',
      currentStep: inputText.trim() ? 2 : 1
    });
    
    // 实时解析（可选）
    if (inputText.trim()) {
      this.parsePartialSnowTam(inputText);
    } else {
      this.setData({ grfDecodedResult: null });
    }
  },

  // 输入框获取焦点
  onInputFocus() {
    console.log('输入框获取焦点');
  },

  // 输入框失去焦点
  onInputBlur() {
    console.log('输入框失去焦点');
  },

  // 填入示例数据
  fillExample() {
    const exampleData = 'ZBAA 02170230 16L 2/5/3 100/50/75 04/03/04 SLUSH/DRY SNOW/WET SNOW';
    this.setData({ 
      grfSnowTamInput: exampleData,
      currentStep: 2
    });
    this.parsePartialSnowTam(exampleData);
    this.showSuccessMessage('示例数据已填入');
  },

  // 清空输入
  clearInput() {
    this.setData({ 
      grfSnowTamInput: '',
      grfDecodedResult: null,
      grfError: '',
      currentStep: 1
    });
    this.showSuccessMessage('已清空输入');
  },

  // 从剪贴板粘贴
  pasteFromClipboard() {
    wx.getClipboardData({
      success: (res) => {
        if (res.data && res.data.trim()) {
          this.setData({ 
            grfSnowTamInput: res.data.trim(),
            currentStep: 2
          });
          this.parsePartialSnowTam(res.data.trim());
          this.showSuccessMessage('已从剪贴板粘贴');
        } else {
          wx.showToast({
            title: '剪贴板为空',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '读取剪贴板失败',
          icon: 'none'
        });
      }
    });
  },

  // 解析SNOWTAM
  parseSnowTam() {
    // 设置加载状态
    this.setData({ 
      isLoading: true,
      currentStep: 2
    });
    
    // 参数验证函数
    const validateParams = () => {
      const input = this.data.grfSnowTamInput.trim();
      if (!input) {
        this.setData({ isLoading: false, currentStep: 1 });
        return { valid: false, message: '请输入SNOWTAM报文内容' };
      }
      
      return { valid: true };
    };

    // 实际解析逻辑
    const performParsing = () => {
      this.performSnowTamParsing();
    };

    // 使用扣费管理器执行解析
    const buttonChargeManager = require('../../utils/button-charge-manager.js');
    buttonChargeManager.executeCalculateWithCharge(
      'snowtam-decode',
      validateParams,
      'SNOWTAM报文解码',
      performParsing
    );
  },

  // 分离出来的实际SNOWTAM解析逻辑
  performSnowTamParsing() {
    const input = this.data.grfSnowTamInput.trim();
    
    this.setData({ 
      grfError: '',
      grfDecodedResult: null 
    });

    try {
      const result = this.parseSnowTamText(input);
      this.setData({ 
        grfDecodedResult: {
          ...result,
          isPartial: false
        },
        grfError: '',
        isLoading: false,
        currentStep: 3
      });
      this.showSuccessMessage('解析完成');
      
      // 滚动到结果区域
      setTimeout(() => {
        wx.pageScrollTo({
          selector: '.result-section',
          duration: 500
        });
      }, 200);
    } catch (error) {
      this.setData({ 
        grfError: (error as Error).message || '解析失败',
        grfDecodedResult: null,
        isLoading: false,
        currentStep: 2
      });
    }
  },

  // 解析SNOWTAM文本
  parseSnowTamText(text: string) {
    console.log('parseSnowTamText 输入:', text);
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    // 查找机场代码和观测时间
    let airportCode = '';
    let observationTime = '';
    const allRunways = []; // 存储所有跑道的数据
    
    const processedLines = []; // 记录已处理的行，避免重复处理
    
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      // 跳过已处理的行
      if (processedLines.indexOf(lineIndex) !== -1) {
        continue;
      }
      
      const line = lines[lineIndex];
      console.log(`处理行 ${lineIndex + 1}:`, line);
      
      // 方法1: 匹配完整简化报头格式: SWZB0151 ZBAA 02170230
      const headerMatch = line.match(/SW[A-Z]{2}\d{4}\s+([A-Z]{4})\s+(\d{8})/);
      if (headerMatch) {
        airportCode = headerMatch[1];
        observationTime = headerMatch[2];
        console.log('方法1匹配报头:', { airportCode, observationTime });
        continue;
      }
      
      // 方法2: 匹配机场代码和时间的独立行: ZBAA 02170155 或时间
      if (!airportCode || !observationTime) {
        const airportTimeMatch = line.match(/^([A-Z]{4})\s+(\d{6,8})$/);
        if (airportTimeMatch) {
          airportCode = airportTimeMatch[1];
          observationTime = airportTimeMatch[2];
          console.log('方法2匹配机场时间:', { airportCode, observationTime });
          continue;
        }
      }
      
      // 方法3: 匹配独立行的机场代码（标准格式）
      if (!airportCode && line.match(/^[A-Z]{4}$/)) {
        airportCode = line;
        console.log('方法3匹配独立机场代码:', airportCode);
        continue;
      }
      
      // 方法3B: 提取机场代码（如果还没有）
      if (!airportCode) {
        const codeMatch = line.match(/\b([A-Z]{4})\b/);
        if (codeMatch && line.indexOf('/') === -1) { // 避免匹配跑道数据行
          airportCode = codeMatch[1];
          console.log('方法3B提取机场代码:', airportCode);
        }
      }
      
      // 方法4: 提取时间戳（如果还没有）
      if (!observationTime) {
        const timeMatch = line.match(/\b(\d{6,8})\b/);
        if (timeMatch && line.indexOf('/') === -1) { // 避免匹配跑道数据行
          observationTime = timeMatch[1];
          console.log('方法4提取时间:', observationTime);
        }
      }
      
      // 方法5: 匹配跑道数据行 - 更严格的匹配
      // 格式1: 02170155 16L 2/5/3 100/50/75 04/03/04 SLUSH/DRY SNOW/WET SNOW
      // 格式2: 16L 2/5/3 100/50/75 04/03/04 SLUSH/DRY SNOW/WET SNOW
      // 格式3: 02170230 16R 2/5/3 75/100/100 04/03/NR SLUSH/SLUSH/SLUSH 50
      // 格式4: 02170225 01L 5/5/5 100/100/100 02/05/10 (污染物状况在下一行)
      
      // 先检查这行是否包含机场代码，如果是则跳过作为跑道数据处理
      const isAirportLine = line.match(/^[A-Z]{4}\s+\d{6,8}/);
      
      if (!isAirportLine) {
        // 方法5A: 尝试解析连续的多跑道数据（特殊格式）
        const continuousRunwayMatch = line.match(/SNOWTAM\s+\d+[A-Z]{4}(\d{8})\s+(.+)/);
        if (continuousRunwayMatch) {
          const timeFromSnowTam = continuousRunwayMatch[1];
          const runwayDataStr = continuousRunwayMatch[2];
          
          if (!observationTime) {
            observationTime = timeFromSnowTam;
          }
          
          console.log('检测到连续多跑道格式，开始解析:', runwayDataStr);
          
          // 解析连续的跑道数据
          const parsedRunways = this.parseContinuousRunwayData(runwayDataStr);
          allRunways.push(...parsedRunways);
          continue;
        }
        
        // 方法5B: 常规跑道数据匹配
        // 排除明语说明中的内容（包含CONTAMINANT、UPGRADED、DOWNGRADED等关键词）
        const isPlainLanguageLine = line.match(/CONTAMINANT|UPGRADED|DOWNGRADED|TAKEOFF|SIGNIFICANT|POOR|NOT\s+IN\s+USE|REMARK/i);
        
        if (!isPlainLanguageLine) {
          // 方法5B1: 匹配带机场代码的跑道数据行（变体格式）
          // 格式：EADD 02170345 09L 5/5/5 100/100/100 NR/NR/NR
          const airportRunwayMatch = line.match(/^([A-Z]{4})\s+(\d{6,8})\s+([0-9]{1,2}[LRC]?)\s+([\d\/]+)\s+([\d\/NR]+)\s+([\d\/NR]+)(?:\s+(.+))?$/);
          
          if (airportRunwayMatch) {
            const lineAirportCode = airportRunwayMatch[1];
            const timeInLine = airportRunwayMatch[2];
            const runway = airportRunwayMatch[3];
            const rwyccStr = airportRunwayMatch[4];
            const coverageStr = airportRunwayMatch[5];
            const depthStr = airportRunwayMatch[6];
            let conditionStr = airportRunwayMatch[7] || '';
            
            // 更新机场代码和观测时间
            if (!airportCode) {
              airportCode = lineAirportCode;
            }
            if (!observationTime) {
              observationTime = timeInLine;
            }
            
            // 检查下一行是否包含污染物状况
            if (lineIndex < lines.length - 1) {
              const nextLine = lines[lineIndex + 1].trim();
              
              // 如果下一行看起来像污染物描述（包含斜线或污染物关键词）
              if (nextLine && (nextLine.indexOf('/') !== -1 || nextLine.match(/WET|DRY|SLUSH|SNOW|ICE|WATER|FROST/i)) && 
                  !nextLine.match(/^[A-Z]{4}\s+\d{6,8}/) && !nextLine.match(/DRIFTING|RWY|TWY|APRON/i)) {
                conditionStr = nextLine;
                console.log('从下一行获取污染物状况:', conditionStr);
                // 标记下一行已被处理，避免重复处理
                processedLines.push(lineIndex + 1);
              }
            }
            
            console.log('方法5B1匹配带机场代码的跑道数据:', { lineAirportCode, timeInLine, runway, rwyccStr, coverageStr, depthStr, conditionStr });
            
            // 解析这个跑道的数据
            const runwayData = this.parseRunwayData(runway, rwyccStr, coverageStr, depthStr, conditionStr, '');
            if (runwayData) {
              allRunways.push(runwayData);
            }
            continue;
          }
          
          // 方法5B2: 标准跑道数据匹配
          // 优化的跑道数据匹配，支持标准格式：时间戳 跑道号 RWYCC 覆盖率 深度 污染物状况
          const runwayMatch = line.match(/^(\d{6,8})\s+([0-9]{1,2}[LRC]?)\s+([\d\/]+)\s+([\d\/NR]+)\s+([\d\/NR]+)\s+(.+)$/) || 
                             line.match(/^([0-9]{1,2}[LRC]?)\s+([\d\/]+)\s+([\d\/NR]+)\s+([\d\/NR]+)\s+(.+)$/);
          if (runwayMatch) {
            // 判断是否有时间戳（第一个匹配模式）
            let timeInLine, runway, rwyccStr, coverageStr, depthStr, conditionStr;
            
            if (runwayMatch[1] && runwayMatch[1].match(/^\d{6,8}$/)) {
              // 有时间戳的格式：时间戳 跑道号 RWYCC 覆盖率 深度 污染物状况
              timeInLine = runwayMatch[1];
              runway = runwayMatch[2];
              rwyccStr = runwayMatch[3];
              coverageStr = runwayMatch[4];
              depthStr = runwayMatch[5];
              conditionStr = runwayMatch[6];
            } else {
              // 无时间戳的格式：跑道号 RWYCC 覆盖率 深度 污染物状况
              timeInLine = null;
              runway = runwayMatch[1];
              rwyccStr = runwayMatch[2];
              coverageStr = runwayMatch[3];
              depthStr = runwayMatch[4];
              conditionStr = runwayMatch[5];
            }
            
            // 验证RWYCC格式
            if (!rwyccStr || rwyccStr.indexOf('/') === -1) {
              continue;
            }
          
            // 如果这行包含时间，更新观测时间
            if (timeInLine && !observationTime) {
              observationTime = timeInLine;
            }
            
            console.log('方法5B2匹配跑道数据:', { runway, rwyccStr, coverageStr, depthStr, conditionStr });
            
            // 解析这个跑道的数据
            const runwayData = this.parseRunwayData(runway, rwyccStr, coverageStr, depthStr, conditionStr, '');
            if (runwayData) {
              allRunways.push(runwayData);
            }
          }
        }
      }
    }
        
    // 如果是6位时间，前面补当前月份
    if (observationTime && observationTime.length === 6) {
      const currentMonth = new Date().getMonth() + 1;
      observationTime = (currentMonth < 10 ? '0' : '') + currentMonth.toString() + observationTime;
    }
        
    console.log('解析结果汇总:', { airportCode, observationTime, allRunways });

    if (allRunways.length === 0) {
      throw new Error('未找到有效的跑道数据。支持格式：\n1. 完整SNOWTAM格式\n2. 简化格式：机场代码 时间 跑道号 RWYCC\n3. 最简格式：跑道号 RWYCC代码\n4. 多跑道格式：每行一个跑道数据');
    }

    // 使用改进的明语说明提取函数
    const plainLanguage = this.extractPlainLanguageFromInput(text);
    console.log('🔍 提取的明语说明:', plainLanguage);

    // 生成多跑道标准雪情通告翻译
    const formattedObsTime = observationTime ? this.formatObservationTime(String(observationTime)) : '未知';
    const translationResult = this.generateMultiRunwaySafetyAdvice(allRunways, airportCode || '未知', formattedObsTime, plainLanguage);
    
    // 返回第一个跑道的数据作为主要显示（保持兼容性），同时包含所有跑道数据
    const primaryRunway = allRunways[0];
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
    };
  },

  // 部分解析SNOWTAM文本（用于实时解析）
  parsePartialSnowTam(_inputText: string) {
    try {
      const result = {
        isPartial: true,
        airport: '',
        observationTime: '',
        runway: '',
        segments: [],
        runwayWidth: null,
        plainLanguage: '',
        safetyAdvice: '',
        translationLines: []
      };
      
      this.setData({
        grfDecodedResult: result,
        grfError: ''
      });
    } catch (error) {
      this.setData({ 
        grfError: (error as Error).message || '解析失败',
        grfDecodedResult: null 
      });
    }
  },

  // 解析连续的多跑道数据（特殊格式）
  parseContinuousRunwayData(dataStr: string): any[] {
    console.log('开始解析连续跑道数据:', dataStr);
    const runways = [];
    
    // 先按照时间戳+污染物的模式分割数据
    // 例如: WET/WET/WET SNOW02170135 -> 分割点
    // 或者: SLUSH/SLUSH02170225 -> 分割点
    
    // 找到所有的分割点（污染物+时间戳+跑道号的模式）
    // 匹配类似 "WET/WET/WET SNOW02170135 09R" 或 "SLUSH/SLUSH02170225 09C" 的模式
    const splitPattern = /(SNOW|SLUSH|ICE|WET)(\d{8})\s+([0-9]{1,2}[LRC]?)/g;
    const segments = [];
    let lastIndex = 0;
    let match;
    
    // 收集所有分割点
    const splitPoints = [];
    while ((match = splitPattern.exec(dataStr)) !== null) {
      splitPoints.push({
        index: match.index,
        endIndex: match.index + match[0].length,
        contaminant: match[1],
        timestamp: match[2],
        runway: match[3]
      });
    }
    
    console.log('找到分割点:', splitPoints);
    
    // 如果没有找到分割点，尝试简单的跑道数据匹配
    if (splitPoints.length === 0) {
      // 尝试匹配单个跑道数据
      const simpleMatch = dataStr.match(/([0-9]{1,2}[LRC]?)\s+([\d\/]+)\s+([\d\/NR]+)\s+([\d\/NR]+)\s+(.+)/);
      if (simpleMatch) {
        const runway = simpleMatch[1];
        const rwyccStr = simpleMatch[2];
        const coverageStr = simpleMatch[3];
        const depthStr = simpleMatch[4];
        const conditionStr = simpleMatch[5];
        
        console.log('简单匹配跑道数据:', { runway, rwyccStr, coverageStr, depthStr, conditionStr });
        
        const runwayData = this.parseRunwayData(runway, rwyccStr, coverageStr, depthStr, conditionStr, '');
        if (runwayData) {
          runways.push(runwayData);
        }
      }
      return runways;
    }
    
    // 处理第一段数据（从开始到第一个分割点）
    if (splitPoints.length > 0) {
      const firstSegment = dataStr.substring(0, splitPoints[0].index);
      console.log('处理第一段:', firstSegment);
      
      const firstMatch = firstSegment.match(/([0-9]{1,2}[LRC]?)\s+([\d\/]+)\s+([\d\/NR]+)\s+([\d\/NR]+)\s+(.+)/);
      if (firstMatch) {
        const runway = firstMatch[1];
        const rwyccStr = firstMatch[2];
        const coverageStr = firstMatch[3];
        const depthStr = firstMatch[4];
        let conditionStr = firstMatch[5];
        
        // 添加分割点处的污染物类型
        conditionStr = conditionStr.trim() + '/' + splitPoints[0].contaminant;
        
        console.log('第一段跑道数据:', { runway, rwyccStr, coverageStr, depthStr, conditionStr });
        
        const runwayData = this.parseRunwayData(runway, rwyccStr, coverageStr, depthStr, conditionStr, '');
        if (runwayData) {
          runways.push(runwayData);
        }
      }
    }
    
    // 处理中间和最后的段落
    for (let i = 0; i < splitPoints.length; i++) {
      const currentSplit = splitPoints[i];
      const nextSplit = splitPoints[i + 1];
      
      // 确定这一段的开始和结束位置
      const segmentStart = currentSplit.endIndex;
      const segmentEnd = nextSplit ? nextSplit.index : dataStr.length;
      
      const segment = dataStr.substring(segmentStart, segmentEnd);
      console.log(`处理第${i + 2}段:`, segment);
      
      // 匹配这一段的跑道数据
      const segmentMatch = segment.match(/([\d\/]+)\s+([\d\/NR]+)\s+([\d\/NR]+)\s+(.+)/);
      if (segmentMatch) {
        const runway = currentSplit.runway;
        const rwyccStr = segmentMatch[1];
        const coverageStr = segmentMatch[2];
        const depthStr = segmentMatch[3];
        let conditionStr = segmentMatch[4];
        
        // 如果有下一个分割点，添加其污染物类型
        if (nextSplit) {
          conditionStr = conditionStr.trim() + '/' + nextSplit.contaminant;
        }
        
        console.log(`第${i + 2}段跑道数据:`, { runway, rwyccStr, coverageStr, depthStr, conditionStr });
        
        const runwayData = this.parseRunwayData(runway, rwyccStr, coverageStr, depthStr, conditionStr, '');
        if (runwayData) {
          runways.push(runwayData);
        }
      }
    }
    
    console.log(`连续跑道数据解析完成，共解析 ${runways.length} 个跑道`);
    return runways;
  },

  // 解析跑道数据
  parseRunwayData(runway: string, rwyccStr: string, coverageStr: string, depthStr: string, conditionStr: string, runwayWidth: string) {
    const rwyccCodes = rwyccStr.split('/').map(code => parseInt(code));
    const coverages = coverageStr.split('/').map(coverage => {
      if (coverage === 'NR') return 'NR';
      return parseInt(coverage);
    });
    const depths = depthStr.split('/');
    
    // 处理污染物条件字符串
    let conditions = ['NR', 'NR', 'NR'];
    if (conditionStr && conditionStr !== 'NR/NR/NR' && conditionStr !== 'NR') {
      console.log('处理污染物条件字符串:', conditionStr);
      
      // 处理末尾可能的跑道宽度数字或特殊标记（如SNOW50）
      let cleanConditionStr = conditionStr.trim();
      const widthMatch = cleanConditionStr.match(/(.+?)\s*(\d+)$/);
      if (widthMatch) {
        cleanConditionStr = widthMatch[1];
        if (!runwayWidth) runwayWidth = widthMatch[2];
      }
      
      // 处理特殊格式如 "WET/WET/WET SNOW50"
      const specialMatch = cleanConditionStr.match(/^([^0-9]+?)(\s+SNOW\d+)?$/);
      if (specialMatch) {
        cleanConditionStr = specialMatch[1].trim();
      }
        
      if (cleanConditionStr.indexOf('/') !== -1) {
        // 直接按斜线分割
        conditions = cleanConditionStr.split('/').map(c => c.trim());
        console.log('按斜线分割的污染物条件:', conditions);
      } else {
        // 智能分割复合污染物名称
        const parts = cleanConditionStr.split(/\s+/);
        conditions = [];
        let currentCondition = '';
        
        for (const part of parts) {
          if (part.indexOf('SNOW') !== -1 || part.indexOf('ICE') !== -1 || part.indexOf('WATER') !== -1 ||
              part.indexOf('WET') !== -1 || part.indexOf('DRY') !== -1 || part.indexOf('SLUSH') !== -1 ||
              part.indexOf('FROST') !== -1 || part.indexOf('COMPACTED') !== -1) {
            if (currentCondition) {
              conditions.push(currentCondition.trim());
            }
            currentCondition = part;
          } else {
            currentCondition += (currentCondition ? ' ' : '') + part;
          }
        }
        if (currentCondition) {
          conditions.push(currentCondition.trim());
        }
        console.log('智能分割的污染物条件:', conditions);
      }
        
      // 确保有3个条件
      while (conditions.length < 3) {
        conditions.push(conditions[conditions.length - 1] || 'NR');
      }
      conditions = conditions.slice(0, 3);
      console.log('最终的污染物条件:', conditions);
    }

    const segments = [];
    for (let i = 0; i < 3; i++) {
      segments.push({
        rwycc: rwyccCodes[i] || 6,
        rwyCcDescription: this.getRwyccDescription(rwyccCodes[i]),
        coverage: coverages[i] || 'NR',
        depth: depths[i] || 'NR',
        condition: (conditions[i] && conditions[i].trim()) || 'NR'
      });
    }

    return {
      runway: runway,
      segments: segments,
      runwayWidth: runwayWidth || null
    };
  },

  // 格式化观测时间
  formatObservationTime(timeStr: string): string {
    if (!timeStr || timeStr.length < 6) return timeStr;
    
    const day = timeStr.substring(0, 2);
    const hour = timeStr.substring(2, 4);
    const minute = timeStr.substring(4, 6);
    
    return `${day}日 ${hour}:${minute}`;
  },

  // 生成多跑道标准雪情通告翻译
  generateMultiRunwaySafetyAdvice(allRunways: any[], airportCode: string, observationTime: string, plainLanguage?: string) {
    const translationLines = [];
    
    // 飞机性能计算部分翻译
    translationLines.push(this.createTranslationLine('『飞机性能计算部分』', true));
    translationLines.push(this.createTranslationLine(''));
    
    // A项 - 发生地
    translationLines.push(this.createTranslationLine(`A) 发生地：`, false, [
      { text: 'A) 发生地：', isHighlight: false },
      { text: airportCode, isHighlight: true }
    ]));
    
    // B项 - 观测时间  
    translationLines.push(this.createTranslationLine(`B) 观测时间：`, false, [
      { text: 'B) 观测时间：', isHighlight: false },
      { text: observationTime, isHighlight: true }
    ]));
    
    // 为每个跑道生成详细信息
    allRunways.forEach((runwayData, _runwayIndex) => {
      const { runway, segments, runwayWidth } = runwayData;
      
      if (allRunways.length > 1) {
        translationLines.push(this.createTranslationLine(''));
        translationLines.push(this.createTranslationLine(`━━━ 跑道 ${runway} ━━━`, true));
      }
      
      // C项 - 跑道号码
      translationLines.push(this.createTranslationLine(`C) 跑道号码：`, false, [
        { text: 'C) 跑道号码：', isHighlight: false },
        { text: runway, isHighlight: true }
      ]));
      
      // D项 - 跑道状况代码
      const rwyccCodes = segments.map((seg: any) => seg.rwycc).join('/');
      translationLines.push(this.createTranslationLine(`D) 跑道状况代码：`, false, [
        { text: 'D) 跑道状况代码：', isHighlight: false },
        { text: rwyccCodes, isHighlight: true }
      ]));
      
      // 详细的RWYCC说明
      segments.forEach((seg: any, index: number) => {
        const segmentNames = ['接地段(1/3)', '中间段(1/3)', '滑跑段(1/3)'];
        const prefixes = ['   ├─ ', '   ├─ ', '   └─ '];
        translationLines.push(this.createTranslationLine('', false, [
          { text: prefixes[index], isHighlight: false },
          { text: segmentNames[index] + '：', isHighlight: false },
          { text: seg.rwycc.toString(), isHighlight: false },
          { text: ` (${this.getRwyccDescription(seg.rwycc)})`, isHighlight: false }
        ]));
      });
      
      // E项 - 跑道污染物覆盖范围
      const coverages = segments.map((seg: any) => seg.coverage === 'NR' ? 'NR' : `${seg.coverage}%`).join('/');
      translationLines.push(this.createTranslationLine(`E) 跑道污染物覆盖范围：`, false, [
        { text: 'E) 跑道污染物覆盖范围：', isHighlight: false },
        { text: coverages, isHighlight: true }
      ]));
      
      segments.forEach((seg: any, index: number) => {
        const segmentNames = ['接地段', '中间段', '滑跑段'];
        const prefixes = ['   ├─ ', '   ├─ ', '   └─ '];
        const coverageDesc = seg.coverage === 'NR' ? '无报告' : `覆盖${seg.coverage}%`;
        translationLines.push(this.createTranslationLine('', false, [
          { text: prefixes[index], isHighlight: false },
          { text: segmentNames[index] + '：', isHighlight: false },
          { text: coverageDesc, isHighlight: false }
        ]));
      });
      
      // F项 - 跑道污染物深度
      const depths = segments.map((seg: any) => seg.depth === 'NR' ? 'NR' : `${seg.depth}mm`).join('/');
      translationLines.push(this.createTranslationLine(`F) 跑道污染物深度：`, false, [
        { text: 'F) 跑道污染物深度：', isHighlight: false },
        { text: depths, isHighlight: true }
      ]));
      
      segments.forEach((seg: any, index: number) => {
        const segmentNames = ['接地段', '中间段', '滑跑段'];
        const prefixes = ['   ├─ ', '   ├─ ', '   └─ '];
        const depthDesc = seg.depth === 'NR' ? '无报告' : `深度${seg.depth}毫米`;
        translationLines.push(this.createTranslationLine('', false, [
          { text: prefixes[index], isHighlight: false },
          { text: segmentNames[index] + '：', isHighlight: false },
          { text: depthDesc, isHighlight: false }
        ]));
      });
      
      // G项 - 跑道状况说明
      const conditions = segments.map((seg: any) => this.translateCondition(seg.condition)).join(' / ');
      translationLines.push(this.createTranslationLine(`G) 跑道状况说明：`, false, [
        { text: 'G) 跑道状况说明：', isHighlight: false },
        { text: conditions, isHighlight: true }
      ]));
      
      segments.forEach((seg: any, index: number) => {
        const segmentNames = ['接地段', '中间段', '滑跑段'];
        const prefixes = ['   ├─ ', '   ├─ ', '   └─ '];
        const conditionDesc = this.translateCondition(seg.condition);
        translationLines.push(this.createTranslationLine('', false, [
          { text: prefixes[index], isHighlight: false },
          { text: segmentNames[index] + '：', isHighlight: false },
          { text: conditionDesc, isHighlight: false }
        ]));
      });
      
      // H项 - 跑道状况代码对应的跑道宽度
      if (runwayWidth) {
        translationLines.push(this.createTranslationLine(`H) 跑道状况代码对应的跑道宽度：`, false, [
          { text: 'H) 跑道状况代码对应的跑道宽度：', isHighlight: false },
          { text: `${runwayWidth}米`, isHighlight: true }
        ]));
        translationLines.push(this.createTranslationLine('   └─ 说明：清理宽度小于公布跑道宽度'));
      } else {
        translationLines.push(this.createTranslationLine('H) 跑道状况代码对应的跑道宽度：【未报告】'));
        translationLines.push(this.createTranslationLine('   └─ 说明：使用公布的跑道宽度'));
      }
    });
    
    // 情景意识部分
    if (plainLanguage && plainLanguage.trim()) {
      translationLines.push(this.createTranslationLine(''));
      translationLines.push(this.createTranslationLine('『情景意识部分』', true));
      
      // 详细翻译明语说明中的各项内容
      const translatedItems = this.translatePlainLanguageItems(plainLanguage);
      if (translatedItems.length > 0) {
        translatedItems.forEach((item, index) => {
          translationLines.push(this.createTranslationLine('', false, [
            { text: `${item.code}) 【${item.title}】：`, isHighlight: false },
            { text: item.content, isHighlight: true }
          ]));
          translationLines.push(this.createTranslationLine(`   └─ 注意事项：${item.note}`));
          if (index < translatedItems.length - 1) {
            translationLines.push(this.createTranslationLine(''));
          }
        });
      }
    }
    
    return { translationLines };
  },

  // 创建翻译行的辅助方法
  createTranslationLine(text: string, isTitle: boolean = false, customParts?: any[]) {
    if (customParts) {
      return { parts: customParts };
    }
    
    if (!text.trim()) {
      return { parts: [{ text: '', isHighlight: false, isTitle: false }] };
    }
    
    return {
      parts: [{ text: text, isHighlight: false, isTitle: isTitle }]
    };
  },

  // 将翻译行转换为纯文本
  convertTranslationLinesToText(translationLines: any[]): string {
    return translationLines.map(line => {
      return line.parts.map((part: any) => part.text).join('');
    }).join('\n');
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
    };
    return descriptions[rwycc] || '未知';
  },

  // 翻译污染物条件
  translateCondition(condition: string): string {
    // 根据ICAO标准术语对照表进行翻译
    const translations: { [key: string]: string } = {
      // 标准污染物状况术语
      'COMPACTED SNOW': '压实的雪',
      'DRY SNOW': '干雪',
      'FROST': '霜',
      'ICE': '冰',
      'SLUSH': '雪浆',
      'STANDING WATER': '积水',
      'WET ICE': '湿冰',
      'WET SNOW': '湿雪',
      'DAMP': '润湿',
      'WET': '潮湿',
      
      // 简化术语
      'DRY': '干燥',
      'SNOW': '雪',
      'WATER': '积水',
      'COMPACTED': '压实',
      'LOOSE': '松散',
      
      // 代码形式
      'NR': '无报告',
      'CLR': '干燥',
      'DMP': '润湿',
      'SNW': '雪',
      'SLU': '雪浆',
      'STD': '积雪',
      'FRZ': '冰冻'
    };
    
    // 先尝试匹配完整的组合术语（如 WET SNOW）
    for (const key in translations) {
      if (translations.hasOwnProperty(key)) {
        const value = translations[key];
        if (condition.toUpperCase().indexOf(key) !== -1) {
          return value;
        }
      }
    }
    
    // 如果没有匹配到，返回原文
    return condition;
  },

  // 从输入中提取明语说明
  extractPlainLanguageFromInput(input: string): string {
    const lines = input.split('\n').map(line => line.trim()).filter(line => line);
    let plainLanguage = '';
    
    for (const line of lines) {
      // 检查是否包含明语说明关键词
      if (line.match(/CONTAMINANT|UPGRADED|DOWNGRADED|TAKEOFF|SIGNIFICANT|POOR|NOT\s+IN\s+USE|REMARK|REDUCED|DRIFTING|LOOSE|CHEMICALLY|SNOWBANK|ADJ/i)) {
        // 排除纯数据行
        if (!line.match(/[\d\/]{10,}/) && !line.match(/^[A-Z]{4}\s+\d{6,8}/)) {
          plainLanguage += line + ' ';
        }
      }
    }
    
    return plainLanguage.trim();
  },

  // 翻译明语说明项目
  translatePlainLanguageItems(plainLanguage: string): any[] {
    const items = [];
    let remainingContent = plainLanguage;
    
    // 按优先级处理各种情景意识内容，避免重复
    
    // 1. 处理跑道长度变短 (I项)
    const reducedMatches = remainingContent.match(/RWY\s+\w+\s+REDUCED\s+TO\s+\d+[^.]*/gi) || [];
    reducedMatches.forEach(match => {
      items.push({
        code: 'I',
        title: '跑道长度变短',
        content: this.translatePlainLanguageContent(match),
        note: '请检查性能计算中使用的跑道距离是否正确'
      });
      remainingContent = remainingContent.replace(match, '');
    });
    
    // 2. 处理吹积雪堆 (J项)
    if (remainingContent.match(/DRIFTING\s+SNOW/i)) {
      items.push({
        code: 'J',
        title: '跑道上有吹积的雪堆',
        content: '跑道上有吹积的雪堆',
        note: '注意侧风条件下产生的"移动跑道"视错觉'
      });
      remainingContent = remainingContent.replace(/DRIFTING\s+SNOW[^.]*/gi, '');
    }
    
    // 3. 处理散沙 (K项)
    const looseSandMatches = remainingContent.match(/RWY\s+\w+\s+LOOSE\s+SAND[^.]*/gi) || [];
    looseSandMatches.forEach(match => {
      items.push({
        code: 'K',
        title: '跑道上有散沙',
        content: this.translatePlainLanguageContent(match),
        note: '如果使用反推，发动机会吸入沙子'
      });
      remainingContent = remainingContent.replace(match, '');
    });
    
    // 4. 处理化学处理 (L项)
    const chemicalMatches = remainingContent.match(/RWY\s+\w+\s+CHEMICALLY\s+TREATED[^.]*/gi) || [];
    chemicalMatches.forEach(match => {
      items.push({
        code: 'L',
        title: '跑道的化学处理',
        content: this.translatePlainLanguageContent(match),
        note: '可能会造成刹车磨损'
      });
      remainingContent = remainingContent.replace(match, '');
    });
    
    // 5. 处理雪堤 (M/N/O项)
    const snowbankMatches = remainingContent.match(/RWY\s+\w+\s+SNOWBANK[^.]*/gi) || [];
    const twySnowbankMatches = remainingContent.match(/TWY\s+\w+\s+SNOWBANK[^.]*/gi) || [];
    const adjSnowbankMatches = remainingContent.match(/RWY\s+\w+\s+ADJ\s+SNOWBANK[^.]*/gi) || [];
    
    snowbankMatches.forEach(match => {
      items.push({
        code: 'M',
        title: '跑道上有雪堤',
        content: this.translatePlainLanguageContent(match),
        note: '存在失去方向控制或将雪吸入发动机的危险'
      });
      remainingContent = remainingContent.replace(match, '');
    });
    
    twySnowbankMatches.forEach(match => {
      items.push({
        code: 'N',
        title: '滑行道上有雪堤',
        content: this.translatePlainLanguageContent(match),
        note: '滑行时避免吸入雪'
      });
      remainingContent = remainingContent.replace(match, '');
    });
    
    adjSnowbankMatches.forEach(match => {
      items.push({
        code: 'O',
        title: '跑道附近有雪堤',
        content: this.translatePlainLanguageContent(match),
        note: '滑行时避免吸入雪'
      });
      remainingContent = remainingContent.replace(match, '');
    });
    
    // 6. 处理滑行道状况 (P项)
    const twyPoorMatches = remainingContent.match(/TWY\s+\w+\s+POOR[^.]*|ALL\s+TWY\s+POOR[^.]*/gi) || [];
    twyPoorMatches.forEach(match => {
      items.push({
        code: 'P',
        title: '滑行道状况',
        content: this.translatePlainLanguageContent(match),
        note: '相应地调整滑行速度和滑行技术'
      });
      remainingContent = remainingContent.replace(match, '');
    });
    
    // 7. 处理停机坪状况 (R项)
    const apronPoorMatches = remainingContent.match(/APRON\s+\w+\s+POOR[^.]*|ALL\s+APRON\s+POOR[^.]*/gi) || [];
    apronPoorMatches.forEach(match => {
      items.push({
        code: 'R',
        title: '停机坪状况',
        content: this.translatePlainLanguageContent(match),
        note: '相应地调整滑行速度和滑行技术'
      });
      remainingContent = remainingContent.replace(match, '');
    });
    
    // 8. 处理剩余内容作为T项明语说明，智能分类
    if (remainingContent.trim()) {
      // 根据内容特征进行智能分类
      if (remainingContent.match(/UPGRADED/i) && remainingContent.match(/DOWNGRADED/i)) {
        // 同时包含升级和降级，作为综合状况变化
        items.push({
          code: 'T',
          title: '跑道状况变化',
          content: this.translateUpgradeDowngradeContent(remainingContent),
          note: '跑道状况发生变化，请注意最新的跑道状况代码'
        });
      } else if (remainingContent.match(/UPGRADED/i)) {
        // 只有升级
        items.push({
          code: 'T',
          title: '跑道状况升级',
          content: this.translateUpgradeDowngradeContent(remainingContent),
          note: '跑道状况已改善，请注意最新的跑道状况代码'
        });
      } else if (remainingContent.match(/DOWNGRADED/i)) {
        // 只有降级
        items.push({
          code: 'T',
          title: '跑道状况降级',
          content: this.translateUpgradeDowngradeContent(remainingContent),
          note: '跑道状况已恶化，请特别注意安全操作'
        });
      } else if (remainingContent.match(/CONTAMINANT/i)) {
        // 污染物信息
        items.push({
          code: 'T',
          title: '污染物信息',
          content: this.translateContaminantContent(remainingContent),
          note: '注意跑道污染物对飞行安全的影响'
        });
      } else if (remainingContent.match(/TAKEOFF/i)) {
        // 起飞相关信息
        items.push({
          code: 'T',
          title: '起飞相关信息',
          content: this.translateTakeoffContent(remainingContent),
          note: '起飞时请特别注意相关限制和要求'
        });
      } else {
        // 其他明语说明
        items.push({
          code: 'T',
          title: '明语说明',
          content: this.translatePlainLanguageContent(remainingContent),
          note: '对机场运行具有重要意义的雪情状况'
        });
      }
    }
    
    return items;
  },

  // 翻译跑道升级/降级内容
  translateUpgradeDowngradeContent(content: string): string {
    let translated = content;
    
    // 基本翻译
    translated = translated.replace(/RWY/gi, '跑道');
    translated = translated.replace(/UPGRADED/gi, '已升级');
    translated = translated.replace(/DOWNGRADED/gi, '已降级');
    translated = translated.replace(/CC/gi, '状况代码');
    translated = translated.replace(/FIRST\s+PART/gi, '第一段');
    translated = translated.replace(/SECOND\s+PART/gi, '第二段');
    translated = translated.replace(/THIRD\s+PART/gi, '第三段');
    translated = translated.replace(/PART/gi, '段');
    
    // 处理跑道号码
    translated = translated.replace(/(\d{1,2}[LRC]?)/g, '$1');
    
    return translated.trim();
  },

  // 翻译污染物内容
  translateContaminantContent(content: string): string {
    let translated = content;
    
    translated = translated.replace(/CONTAMINANT/gi, '污染物');
    translated = translated.replace(/THIN/gi, '薄层');
    translated = translated.replace(/THICK/gi, '厚层');
    translated = translated.replace(/RWY/gi, '跑道');
    translated = translated.replace(/SNOW/gi, '雪');
    translated = translated.replace(/ICE/gi, '冰');
    translated = translated.replace(/WATER/gi, '水');
    translated = translated.replace(/SLUSH/gi, '雪泥');
    
    return translated.trim();
  },

  // 翻译起飞相关内容
  translateTakeoffContent(content: string): string {
    let translated = content;
    
    translated = translated.replace(/TAKEOFF/gi, '起飞');
    translated = translated.replace(/SIGNIFICANT/gi, '重要');
    translated = translated.replace(/RWY/gi, '跑道');
    translated = translated.replace(/PERFORMANCE/gi, '性能');
    translated = translated.replace(/RESTRICTION/gi, '限制');
    
    return translated.trim();
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
      // 升级/降级相关
      'UPGRADED': '已升级',
      'DOWNGRADED': '已降级',
      'CC': '状况代码',
      'FIRST PART': '第一段',
      'SECOND PART': '第二段',
      'THIRD PART': '第三段',
      'PART': '段',
      'CONTAMINANT': '污染物',
      'THIN': '薄层',
      'THICK': '厚层',
      'TAKEOFF': '起飞',
      'SIGNIFICANT': '重要',
      'CONDITION': '状况',
      'CHANGE': '变化',
      'PERFORMANCE': '性能',
      'RESTRICTION': '限制',
      'NOT IN USE': '不可用',
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
    };
    
    let translated = content;
    
    // 先处理特殊短语（较长的优先）
    const sortedKeys = Object.keys(translations).sort((a, b) => b.length - a.length);
    for (const english of sortedKeys) {
      const chinese = translations[english];
      translated = translated.replace(new RegExp(english, 'gi'), chinese);
    }
    
    // 处理跑道号码格式 (如 16L, 03R)
    translated = translated.replace(/(\d{1,2}[LRC]?)/g, '$1');
    
    // 处理距离格式 (如 20M, 30M)
    translated = translated.replace(/(\d+)米/g, '$1米');
    
    return translated.trim();
  },

  // 复制结果
  copyResult() {
    if (!this.data.grfDecodedResult) return;
    
    const resultText = this.convertTranslationLinesToText(this.data.grfDecodedResult.translationLines);
    
    wx.setClipboardData({
      data: resultText,
      success: () => {
        this.showSuccessMessage('结果已复制到剪贴板');
      },
      fail: () => {
        wx.showToast({
          title: '复制失败',
          icon: 'error'
        });
      }
    });
  },

  // 分享结果
  shareResult() {
    if (!this.data.grfDecodedResult) return;
    
    const resultText = this.convertTranslationLinesToText(this.data.grfDecodedResult.translationLines);
    const shareText = `雪情通告解析结果：\n\n${resultText}\n\n-- 来自飞行小工具`;
    
    wx.setClipboardData({
      data: shareText,
      success: () => {
        this.showSuccessMessage('分享内容已复制，可粘贴分享');
      }
    });
  },

  // 清除错误
  clearError() {
    this.setData({ grfError: '' });
  },

  // 显示成功消息
  showSuccessMessage(message: string) {
    this.setData({ 
      showSuccess: true,
      successMessage: message
    });
    
    setTimeout(() => {
      this.setData({ showSuccess: false });
    }, 2000);
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '飞行小工具 - 雪情通告解码器',
      path: '/packageO/snowtam-decoder/index'
    };
  },

  onShareTimeline() {
    return {
      title: '飞行小工具 - 雪情通告解码器'
    };
  }
});