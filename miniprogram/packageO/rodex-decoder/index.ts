/// <reference path="../../typings/index.d.ts" />

// 引入RODEX数据
const rodexData = require('../../data/rodex.js');

interface DecodedPart {
  title: string;
  code: string;
  description: string;
  type?: string;
}

interface DecodeResult {
  parts: DecodedPart[];
  russiaNote?: string;
}

Page({
  data: {
    rodexInput: '',
    russiaMode: false,
    decodeResult: null as DecodeResult | null,
    activeCollapseItems: [] as string[],
    examples: [
      {
        code: 'R99/421594',
        explanation: '重复之前报告：干雪覆盖11-25%跑道；深度15mm；刹车效应中等偏好',
        category: '常用格式'
      },
      {
        code: 'R27/521235',
        explanation: '跑道27：湿雪覆盖26-50%跑道；深度12mm；摩擦系数0.35',
        category: '标准格式'
      },
      {
        code: 'R14L/3//99',
        explanation: '跑道14L：霜/雾凇；深度不明显或无法测量；刹车效应不可靠',
        category: '特殊情况'
      },
      {
        code: 'R14L/CLRD//',
        explanation: '跑道14L污染已清除，无需进一步报告',
        category: '清除状态'
      },
      {
        code: 'R88///////',
        explanation: '所有跑道都有污染但报告不可用',
        category: '报告不可用'
      },
      {
        code: 'R09/820330',
        explanation: '跑道09：压实雪覆盖11-25%跑道；深度30cm；摩擦系数0.30',
        category: '俄罗斯格式'
      }
    ]
  },

  onLoad() {
    console.log('RODEX解码器页面加载');
  },

  // 输入框变化事件
  onRodexInputChange(event: any) {
    const value = (event.detail && event.detail.value) || event.detail || '';
    this.setData({
      rodexInput: value.toString().toUpperCase()
    });
  },

  // 俄罗斯模式切换
  onRussiaModeChange(event: any) {
    this.setData({
      russiaMode: event.detail
    });
    
    // 如果已有解码结果，重新解码以应用俄罗斯模式
    if (this.data.rodexInput && this.data.decodeResult) {
      this.decodeRodex();
    }
  },

  // 折叠面板变化
  onCollapseChange(event: any) {
    this.setData({
      activeCollapseItems: event.detail
    });
  },

  // 填充示例代码
  fillExample(event: any) {
    const code = event.currentTarget.dataset.code;
    this.setData({
      rodexInput: code
    });
  },

  // 解码RODEX
  decodeRodex() {
    const input = this.data.rodexInput.trim();
    if (!input) {
      wx.showToast({
        title: '请输入RODEX代码',
        icon: 'none'
      });
      return;
    }

    try {
      const result = this.parseRodex(input);
      this.setData({
        decodeResult: result
      });
    } catch (error) {
      wx.showToast({
        title: '解码失败，请检查格式',
        icon: 'none'
      });
      console.error('RODEX解码错误:', error);
    }
  },

  // 解析RODEX代码
  parseRodex(code: string): DecodeResult {
    const parts: DecodedPart[] = [];
    let russiaNote = '';

    // 去除空格和特殊字符，确保输入安全
    const cleanCode = (code || '').toString().replace(/\s+/g, '').toUpperCase();

    // 检查基本格式
    if (!cleanCode || !cleanCode.startsWith('R')) {
      throw new Error('RODEX代码必须以R开头');
    }

    // 解析跑道代码 (RDRDR)
    const runwayMatch = cleanCode.match(/^R(\d{2}[LCR]?|88|99)/);
    if (runwayMatch) {
      const runwayCode = runwayMatch[1];
      let runwayDesc = '';
      
      if (runwayCode === '88') {
        runwayDesc = '🛬 所有跑道';
      } else if (runwayCode === '99') {
        runwayDesc = '🔄 重复之前的跑道状态报告';
      } else {
        runwayDesc = `🛬 跑道 ${runwayCode}`;
      }
      
      parts.push({
        title: '跑道识别',
        code: 'R' + runwayCode,
        description: runwayDesc,
        type: 'primary'
      });
    }

    // 检查是否为清除状态
    if (cleanCode.includes('CLRD')) {
      parts.push({
        title: '跑道状态',
        code: 'CLRD',
        description: '✅ 污染已清除，跑道可正常使用',
        type: 'success'
      });
      return { parts, russiaNote: this.data.russiaMode ? this.getRussiaNote() : undefined };
    }

    // 解析剩余部分
    const mainPart = cleanCode.substring(runwayMatch ? runwayMatch[0].length : 1);
    
    if (mainPart.startsWith('/')) {
      const segments = mainPart.substring(1).split('');
      
      if (segments.length >= 2) {
        // 跑道沉积物类型
        const depositType = segments[0];
        if (depositType !== '/') {
          const depositDesc = this.getDepositDescription(depositType);
          parts.push({
            title: '污染物类型',
            code: depositType,
            description: `❄️ ${depositDesc}`,
            type: 'warning'
          });
        }

        // 污染程度
        const contaminationExtent = segments[1];
        if (contaminationExtent !== '/') {
          const contaminationDesc = this.getContaminationDescription(contaminationExtent);
          parts.push({
            title: '污染覆盖范围',
            code: contaminationExtent,
            description: `📏 ${contaminationDesc}`,
            type: 'warning'
          });
        }

        // 沉积物深度
        if (segments.length >= 4) {
          const depthCode = segments[2] + segments[3];
          if (depthCode !== '//') {
            const depthDesc = this.getDepthDescription(depthCode);
            parts.push({
              title: '污染物深度',
              code: depthCode,
              description: `📐 ${depthDesc}`,
              type: 'info'
            });
          }
        }

        // 刹车效应
        if (segments.length >= 6) {
          const brakingCode = segments[4] + segments[5];
          if (brakingCode !== '//') {
            const brakingDesc = this.getBrakingDescription(brakingCode);
            parts.push({
              title: '刹车效应',
              code: brakingCode,
              description: `🚨 ${brakingDesc}`,
              type: 'danger'
            });
          }
        }
      }
    }

    // 添加俄罗斯特殊说明
    if (this.data.russiaMode) {
      russiaNote = this.getRussiaNote();
    }

    return { parts, russiaNote };
  },

  // 获取沉积物类型描述
  getDepositDescription(code: string): string {
    if (!rodexData || !rodexData.components || !rodexData.components.runway_deposits) {
      return '数据加载中...';
    }
    const deposits = rodexData.components.runway_deposits.values;
    return deposits[code] || '未知污染物类型';
  },

  // 获取污染程度描述
  getContaminationDescription(code: string): string {
    if (!rodexData || !rodexData.components || !rodexData.components.extent_of_contamination) {
      return '数据加载中...';
    }
    const contamination = rodexData.components.extent_of_contamination.values;
    return contamination[code] || '未知污染程度';
  },

  // 获取深度描述
  getDepthDescription(code: string): string {
    if (!rodexData || !rodexData.components || !rodexData.components.depth_of_deposit) {
      return '数据加载中...';
    }
    const depths = rodexData.components.depth_of_deposit.values;
    return depths[code] || '未知深度';
  },

  // 获取刹车效应描述
  getBrakingDescription(code: string): string {
    if (!rodexData || !rodexData.components || !rodexData.components.braking_action) {
      return '数据加载中...';
    }
    const braking = rodexData.components.braking_action;
    
    // 检查摩擦系数
    const coefficient = parseInt(code);
    if (coefficient >= 0 && coefficient <= 90) {
      const coefficientValue = coefficient / 100;
      let description = `摩擦系数 ${coefficientValue.toFixed(2)}`;
      
      // 添加刹车效应对应说明
      const brakingActionDesc = this.getBrakingActionFromCoefficient(coefficientValue);
      if (brakingActionDesc) {
        description += ` (${brakingActionDesc})`;
      }
      
      // 如果开启俄罗斯模式，添加规范值说明
      if (this.data.russiaMode) {
        const estimatedMeasured = this.convertNormativeToMeasured(coefficientValue);
        if (estimatedMeasured !== null) {
          description += `\n🇷🇺 俄罗斯规范值，对应测量值约 ${estimatedMeasured.toFixed(2)}`;
        } else {
          description += `\n🇷🇺 俄罗斯规范值（高于国际标准）`;
        }
      }
      
      return description;
    }
    
    // 检查估算刹车效应
    const estimatedBraking = braking.estimated_braking_action;
    if (estimatedBraking[code]) {
      return estimatedBraking[code];
    }
    
    // 检查特殊代码
    const specialCodes = braking.special_codes;
    if (specialCodes[code]) {
      return specialCodes[code];
    }
    
    return '未知刹车效应';
  },

  // 根据摩擦系数获取刹车效应描述 - 修复后的版本
  getBrakingActionFromCoefficient(coefficient: number): string | null {
    if (!rodexData || !rodexData.components || !rodexData.components.braking_action) {
      return null;
    }
    
    // 如果是俄罗斯模式，输入的是Normative值，使用俄罗斯专用表格
    if (this.data.russiaMode && rodexData.regional_variations && rodexData.regional_variations.Russia) {
      const russiaTable = rodexData.regional_variations.Russia.braking_action_table.table;
      for (const entry of russiaTable) {
        if (coefficient >= entry.normative_min && coefficient <= entry.normative_max) {
          return entry.braking_action;
        }
      }
      return null;
    }
    
    // 其他国家模式，输入的是Measured值，使用标准表格
    const brakingAction = rodexData.components.braking_action;
    const table = brakingAction.braking_action_from_coefficient_table && 
        brakingAction.braking_action_from_coefficient_table.table;
    
    if (!table) return null;
    
    for (const entry of table) {
      if (coefficient >= entry.measured_coefficient_min && coefficient <= entry.measured_coefficient_max) {
        return entry.estimated_braking_action;
      }
    }
    
    return null;
  },

  // 将俄罗斯规范值转换为估算的测量值
  convertNormativeToMeasured(normativeValue: number): number | null {
    if (!rodexData || !rodexData.regional_variations || !rodexData.regional_variations.Russia) {
      return null;
    }
    
    const brakingTable = rodexData.regional_variations.Russia.braking_action_table.table;
    
    // 查找符合规范值范围的条目
    for (const entry of brakingTable) {
      if (normativeValue >= entry.normative_min && normativeValue <= entry.normative_max) {
        // 返回对应的测量值范围的中点
        return (entry.measured_min + entry.measured_max) / 2;
      }
    }
    
    return null;
  },

  // 获取俄罗斯特殊说明
  getRussiaNote(): string {
    if (!rodexData || !rodexData.regional_variations || !rodexData.regional_variations.Russia) {
      return '俄罗斯数据加载中...';
    }
    const russiaData = rodexData.regional_variations.Russia;
    return `${russiaData.description}\n\n操作说明：\n${russiaData.operational_notes.join('\n')}`;
  }
});