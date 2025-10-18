// SNOWTAM解码器 - 单行固定格式输入版本（使用BasePage基类）
var BasePage = require('../../utils/base-page.js');

var pageConfig = {
  data: {
    // 页面视图控制
    currentView: 'input', // 'input' | 'result'

    // 格式化后的显示字符数组（包含分隔符）
    displayChars: [],

    // 当前输入的字符数组（不包含分隔符）
    inputChars: [],

    // 表面状况的完整英文存储（每段最多50个字符）
    surfaceConditions: ['', '', ''],

    // 当前输入位置（在inputChars中的索引）
    currentPosition: 0,

    // 最大输入长度
    maxLength: 24, // 跑道3 + RWYCC3 + 覆盖9 + 深度6 + 表面3（段索引）

    // 格式说明
    formatHint: '格式: 09L 5/5/5 100/100/100 NR/NR/03 WET/WET/WET',

    // 当前应该输入的内容提示
    currentHint: '',

    // 是否可以解码
    canDecode: false,

    // 解码后的数据
    analysis: null,

    // 示例数据
    examples: [
      { desc: '湿润跑道', code: '09L555100100100NRNR03WETWETWET' },
      { desc: '积雪跑道', code: '27R210100507506120SLUICEWAT' },
      { desc: '干燥跑道', code: '16L666NRNRNRNRNRNRDRYDRYDRY' },
      { desc: '混合污染', code: '08332751001000406WETSNWSNSLU' }
    ],

    // 输入位置到字段的映射
    positionMap: {
      runway: [0, 1, 2],           // 位置0-2: 跑道号
      rwycc: [3, 4, 5],            // 位置3-5: RWYCC
      coverage: [6, 7, 8, 9, 10, 11, 12, 13, 14],  // 位置6-14: 覆盖率
      depth: [15, 16, 17, 18, 19, 20],            // 位置15-20: 深度
      surface: [21, 22, 23] // 位置21-23: 表面状况段索引
    },

    // 键盘相关
    currentKeyboard: 'number',
    keyboardKeys: [],
    keyboardTitle: '',
    keyboardClass: ''
  },

  /**
   * 页面加载时初始化
   */
  customOnLoad: function(options) {
    console.log('📄 SNOWTAM解码器页面加载');
    this.initializeInput();
    this.updateDisplay();
    this.updateKeyboard();
  },

  /**
   * 页面卸载时清理资源
   */
  customOnUnload: function() {
    console.log('🧹 SNOWTAM解码器页面卸载，清理资源');

    // 清理大数组和对象，帮助垃圾回收
    this.setData({
      inputChars: [],
      displayChars: [],
      surfaceConditions: [],
      keyboardKeys: [],
      analysis: null
    });

    // BasePage会自动清理定时器和传感器，无需手动处理
  },

  // 初始化输入
  initializeInput: function() {
    // 用下划线初始化所有位置（包括表面状况占位）
    var chars = [];
    for (var i = 0; i < 24; i++) { // 包括21-23的表面状况占位
      chars.push('_');
    }
    // 使用safeSetData防止页面销毁时的错误
    this.safeSetData({
      inputChars: chars,
      surfaceConditions: ['', '', ''],
      currentPosition: 0
    }, null, {
      throttleKey: 'input-init',
      priority: 'normal'
    });
    // 立即更新显示
    this.updateDisplay();
  },

  // 更新显示值
  updateDisplay: function() {
    var chars = this.data.inputChars;
    if (!chars || chars.length === 0) {
      return;
    }

    var displayChars = [];
    var displayToInputMap = [];  // 动态记录显示位置到输入位置的映射
    var currentPos = this.data.currentPosition;

    // 格式: ### #/#/# ###/###/### ##/##/## ###/###/###
    // 第一行：跑道号 + RWYCC + 覆盖率
    // 跑道号 - 处理空格字符
    for (var i = 0; i < 3; i++) {
      if (chars[i] === ' ') {
        displayChars.push(' ');  // 空格直接显示为空格
      } else {
        displayChars.push(chars[i]);  // 其他字符正常显示（包括下划线）
      }
      displayToInputMap.push(i);  // 记录映射关系
    }
    displayChars.push(' ');
    displayToInputMap.push(-1);  // 分隔符

    // RWYCC
    displayChars.push(chars[3]);
    displayToInputMap.push(3);
    displayChars.push('/');
    displayToInputMap.push(-1);
    displayChars.push(chars[4]);
    displayToInputMap.push(4);
    displayChars.push('/');
    displayToInputMap.push(-1);
    displayChars.push(chars[5]);
    displayToInputMap.push(5);
    displayChars.push(' ');
    displayToInputMap.push(-1);

    // 覆盖率 - 处理空格字符
    for (var segment = 0; segment < 3; segment++) {
      var baseIdx = 6 + segment * 3;
      for (var j = 0; j < 3; j++) {
        if (chars[baseIdx + j] === ' ') {
          // 空格不显示（直接跳过）
          // 不push任何内容，让覆盖率紧凑显示
        } else {
          displayChars.push(chars[baseIdx + j]);
          displayToInputMap.push(baseIdx + j);  // 记录映射关系
        }
      }
      if (segment < 2) {
        displayChars.push('/');
        displayToInputMap.push(-1);
      }
    }

    // 添加换行标记
    displayChars.push('\n');
    displayToInputMap.push(-1);

    // 第二行：深度 + 表面状况
    // 深度
    displayChars.push(chars[15]);
    displayToInputMap.push(15);
    displayChars.push(chars[16]);
    displayToInputMap.push(16);
    displayChars.push('/');
    displayToInputMap.push(-1);
    displayChars.push(chars[17]);
    displayToInputMap.push(17);
    displayChars.push(chars[18]);
    displayToInputMap.push(18);
    displayChars.push('/');
    displayToInputMap.push(-1);
    displayChars.push(chars[19]);
    displayToInputMap.push(19);
    displayChars.push(chars[20]);
    displayToInputMap.push(20);
    displayChars.push(' ');
    displayToInputMap.push(-1);

    // 表面状况 - 显示完整英文或下划线
    for (var segment = 0; segment < 3; segment++) {
      var condition = this.data.surfaceConditions[segment];
      if (condition) {
        // 显示完整英文
        var condChars = condition.split('');
        for (var j = 0; j < condChars.length; j++) {
          displayChars.push(condChars[j]);
          displayToInputMap.push(21 + segment);  // 所有字符都映射到对应段的输入位置
        }
      } else {
        // 显示下划线占位符
        displayChars.push('_');
        displayToInputMap.push(21 + segment);
      }
      if (segment < 2) {
        displayChars.push('/');
        displayToInputMap.push(-1);
      }
    }

    // 为每个字符创建样式类
    var displayCharsWithClass = displayChars.map(function(char, index) {
      if (char === '\n') {
        return {
          char: '',
          className: 'line-break',
          index: index,
          inputPos: -1
        };
      }

      var inputPos = displayToInputMap[index];
      var className = 'format-char';

      if (char === ' ' || char === '/') {
        className += ' char-separator';
      } else if (inputPos === currentPos) {
        className += ' char-active';
      } else if (char === '_') {
        className += ' char-empty';
      } else {
        className += ' char-filled';
      }

      return {
        char: char,
        className: className,
        index: index,
        inputPos: inputPos  // 保存映射关系供点击使用
      };
    });

    // 使用safeSetData并添加节流，优化高频显示更新
    this.safeSetData({
      displayChars: displayCharsWithClass
    }, null, {
      throttleKey: 'display-update',
      priority: 'high'  // 用户输入反馈为高优先级
    });

    this.validateInput();
  },

  // 更新键盘
  updateKeyboard: function() {
    var pos = this.data.currentPosition;
    var keyboard = 'number';
    var keys = [];
    var title = '';
    var keyboardClass = '';

    if (pos <= 1) {
      // 跑道号前两位：数字
      keyboard = 'number';
      keys = ['0','1','2','3','4','5','6','7','8','9'].map(function(k) {
        return { char: k, display: k };
      });
      title = '输入跑道号第' + (pos + 1) + '位数字';
      keyboardClass = 'keyboard-number';
    } else if (pos === 2) {
      // 跑道号第三位：L/R/C或留空
      keyboard = 'direction';
      keys = [
        { char: 'L', display: 'L' },
        { char: 'R', display: 'R' },
        { char: 'C', display: 'C' },
        { char: ' ', display: '空' }  // 改为空格字符而不是下划线
      ];
      title = '输入跑道方向：L(左)/R(右)/C(中)或留空';
      keyboardClass = 'keyboard-special';
    } else if (pos >= 3 && pos <= 5) {
      // RWYCC：0-6
      keyboard = 'rwycc';
      keys = [
        { char: '0', display: '0', desc: '湿冰' },
        { char: '1', display: '1', desc: '冰' },
        { char: '2', display: '2', desc: '积水/雪浆' },
        { char: '3', display: '3', desc: '湿滑/雪' },
        { char: '4', display: '4', desc: '压实雪' },
        { char: '5', display: '5', desc: '湿润/霜' },
        { char: '6', display: '6', desc: '干燥' }
      ];
      title = '输入第' + (pos - 2) + '段RWYCC (0-6)';
      keyboardClass = 'keyboard-rwycc';
    } else if (pos >= 6 && pos <= 14) {
      // 覆盖率：只有NR/25/50/75/100这5个选项
      keyboard = 'coverage';

      // 直接显示5个快捷选项
      keys = [
        { char: 'NR', display: 'NR', value: 'NR_' },
        { char: '25', display: '25%', value: '25_' },
        { char: '50', display: '50%', value: '50_' },
        { char: '75', display: '75%', value: '75_' },
        { char: '100', display: '100%', value: '100' }
      ];

      var segment = Math.floor((pos - 6) / 3) + 1;
      title = '选择第' + segment + '段覆盖率';
      keyboardClass = 'keyboard-coverage-quick';
    } else if (pos >= 15 && pos <= 20) {
      // 深度：数字或NR
      keyboard = 'depth';
      keys = [
        { char: 'NR', display: 'NR' }  // NR作为一个整体
      ];
      for (var i = 0; i <= 9; i++) {
        keys.push({ char: i.toString(), display: i.toString() });  // 只显示数字，不带单位
      }
      var segment = Math.floor((pos - 15) / 2) + 1;
      title = '输入第' + segment + '段深度 (mm或NR)';
      keyboardClass = 'keyboard-depth';
    } else if (pos >= 21 && pos <= 23) {
      // 表面状况：使用完整英文描述
      keyboard = 'surface';
      keys = [
        { char: 'COMPACTED SNOW', display: 'COMPACTED SNOW' },
        { char: 'DRY SNOW', display: 'DRY SNOW' },
        { char: 'DRY SNOW ON TOP OF COMPACTED SNOW', display: 'DSN ON CSN' },
        { char: 'DRY SNOW ON TOP OF ICE', display: 'DSN ON ICE' },
        { char: 'FROST', display: 'FROST' },
        { char: 'ICE', display: 'ICE' },
        { char: 'SLUSH', display: 'SLUSH' },
        { char: 'STANDING WATER', display: 'STANDING WATER' },
        { char: 'WATER ON TOP OF COMPACTED SNOW', display: 'WAT ON CSN' },
        { char: 'WET', display: 'WET' },
        { char: 'WET ICE', display: 'WET ICE' },
        { char: 'WET SNOW', display: 'WET SNOW' },
        { char: 'WET SNOW ON TOP OF COMPACTED SNOW', display: 'WSN ON CSN' },
        { char: 'WET SNOW ON TOP OF ICE', display: 'WSN ON ICE' },
        { char: 'DRY', display: 'DRY' },
        { char: 'NR', display: 'NR' }
      ];
      var segment = pos - 21 + 1;
      title = '选择第' + segment + '段表面状况';
      keyboardClass = 'keyboard-surface-quick';
    }

    // 使用safeSetData并添加节流，优化键盘更新
    this.safeSetData({
      currentKeyboard: keyboard,
      keyboardKeys: keys,
      keyboardTitle: title,
      keyboardClass: keyboardClass,
      currentHint: title
    }, null, {
      throttleKey: 'keyboard-update',
      priority: 'normal'
    });
  },

  // 点击显示区域，设置输入位置
  handleDisplayClick: function(event) {
    // 获取点击的字符的inputPos（从displayChars中获取）
    var index = event.target.dataset.index;
    if (index === undefined) return;

    // 从displayChars中直接获取inputPos
    var displayChars = this.data.displayChars;
    if (index >= 0 && index < displayChars.length) {
      var inputPosition = displayChars[index].inputPos;

      // 只有有效的输入位置才能跳转
      if (inputPosition >= 0 && inputPosition <= 23) {
        // 使用safeSetData优化位置跳转
        this.safeSetData({
          currentPosition: inputPosition
        }, null, {
          throttleKey: 'position-jump',
          priority: 'high'
        });
        this.updateDisplay();
        this.updateKeyboard();
      }
    }
  },

  // 注：getInputPositionFromDisplay 已废弃，位置映射现在在 updateDisplay 中动态生成
  // 每个 displayChars 项都包含 inputPos 属性，直接使用该属性即可

  // 获取按键样式类
  getKeyClass: function(key) {
    var keyboard = this.data.currentKeyboard;
    var baseClass = 'key-' + keyboard;

    if (keyboard === 'rwycc') {
      return baseClass + ' key-rwycc-' + key;
    }
    if (keyboard === 'direction' && key === '_') {
      return baseClass + ' key-empty';
    }
    return baseClass;
  },

  // 获取RWYCC描述
  getRWYCCDesc: function(code) {
    var descriptions = {
      '6': '干燥',
      '5': '湿润/霜',
      '4': '压实雪',
      '3': '湿滑/雪',
      '2': '积水/雪浆',
      '1': '冰',
      '0': '湿冰'
    };
    return descriptions[code] || '';
  },

  // 获取按键显示文本
  getKeyDisplay: function(key) {
    if (key === '_') return '空';
    if (key === 'N' || key === 'R') return key;

    var keyboard = this.data.currentKeyboard;
    if (keyboard === 'coverage' && key !== 'N' && key !== 'R') {
      return key + '%';
    }
    if (keyboard === 'depth' && key !== 'N' && key !== 'R') {
      return key + 'mm';
    }
    return key;
  },

  // 输入字符
  inputChar: function(event) {
    var char = event.currentTarget.dataset.char;
    var pos = this.data.currentPosition;

    if (pos > 23) {
      return;
    }

    // 特殊处理覆盖率快捷输入
    if (pos >= 6 && pos <= 14 && (char === 'NR' || char === '25' || char === '50' || char === '75' || char === '100')) {
      var segmentStart = Math.floor((pos - 6) / 3) * 3 + 6;
      var chars = this.data.inputChars.slice();

      // 根据输入值填充3个位置
      if (char === 'NR') {
        chars[segmentStart] = 'N';
        chars[segmentStart + 1] = 'R';
        chars[segmentStart + 2] = ' ';  // 使用空格而不是下划线
      } else if (char === '25') {
        chars[segmentStart] = '2';
        chars[segmentStart + 1] = '5';
        chars[segmentStart + 2] = ' ';  // 使用空格
      } else if (char === '50') {
        chars[segmentStart] = '5';
        chars[segmentStart + 1] = '0';
        chars[segmentStart + 2] = ' ';  // 使用空格
      } else if (char === '75') {
        chars[segmentStart] = '7';
        chars[segmentStart + 1] = '5';
        chars[segmentStart + 2] = ' ';  // 使用空格
      } else if (char === '100') {
        chars[segmentStart] = '1';
        chars[segmentStart + 1] = '0';
        chars[segmentStart + 2] = '0';  // 100是3位数，不需要空格
      }

      // 移动到下一个段的开始位置
      var nextPos = segmentStart + 3;
      if (nextPos >= this.data.maxLength) {
        nextPos = this.data.maxLength - 1;
      }

      var self = this;
      // 使用safeSetData优化覆盖率输入
      this.safeSetData({
        inputChars: chars,
        currentPosition: nextPos
      }, function() {
        self.updateDisplay();
        self.updateKeyboard();
      }, {
        throttleKey: 'coverage-input',
        priority: 'high'  // 用户输入为高优先级
      });
      return;
    }

    // 特殊处理深度的NR输入
    if (pos >= 15 && pos <= 20 && char === 'NR') {
      var segmentStart = Math.floor((pos - 15) / 2) * 2 + 15;
      var chars = this.data.inputChars.slice();

      // 填充NR两个字符
      chars[segmentStart] = 'N';
      chars[segmentStart + 1] = 'R';

      // 移动到下一个段的开始位置
      var nextPos = segmentStart + 2;
      if (nextPos >= 21) {
        nextPos = 21;  // 跳到表面状况部分
      }

      var self = this;
      // 使用safeSetData优化深度输入
      this.safeSetData({
        inputChars: chars,
        currentPosition: nextPos
      }, function() {
        self.updateDisplay();
        self.updateKeyboard();
      }, {
        throttleKey: 'depth-input',
        priority: 'high'
      });
      return;
    }

    // 特殊处理表面状况的快捷输入
    if (pos >= 21 && pos <= 23 && (
        char === 'DRY' || char === 'WET' || char === 'STANDING WATER' ||
        char === 'FROST' || char === 'ICE' || char === 'WET ICE' ||
        char === 'COMPACTED SNOW' || char === 'DRY SNOW' || char === 'WET SNOW' ||
        char === 'SLUSH' || char === 'DRY SNOW ON TOP OF COMPACTED SNOW' ||
        char === 'DRY SNOW ON TOP OF ICE' || char === 'WATER ON TOP OF COMPACTED SNOW' ||
        char === 'WET SNOW ON TOP OF COMPACTED SNOW' || char === 'WET SNOW ON TOP OF ICE' ||
        char === 'NR')) {

      var segmentIndex = pos - 21;
      var surfaceConditions = this.data.surfaceConditions.slice();
      surfaceConditions[segmentIndex] = char;

      // 移动到下一个段
      var nextPos = pos + 1;
      if (nextPos > 23) {
        nextPos = 23;
      }

      var self = this;
      // 使用safeSetData优化表面状况输入
      this.safeSetData({
        surfaceConditions: surfaceConditions,
        currentPosition: nextPos
      }, function() {
        self.updateDisplay();
        self.updateKeyboard();
      }, {
        throttleKey: 'surface-input',
        priority: 'high'
      });
      return;
    }

    // 普通字符输入
    var chars = this.data.inputChars.slice();
    chars[pos] = char;

    // 自动移动到下一个位置，但不超过最大长度
    var nextPos = pos + 1;
    if (nextPos >= 21) {
      // 如果到了表面状况部分，跳到21
      nextPos = 21;
    }

    var self = this;
    // 使用safeSetData优化普通字符输入
    this.safeSetData({
      inputChars: chars,
      currentPosition: nextPos
    }, function() {
      // 在setData完成后更新显示
      self.updateDisplay();
      self.updateKeyboard();
    }, {
      throttleKey: 'char-input',
      priority: 'high'
    });
  },

  // 删除字符
  deleteChar: function() {
    var pos = this.data.currentPosition;

    // 如果在表面状况区域
    if (pos >= 21 && pos <= 23) {
      if (pos > 21) {
        // 移到上一个表面状况段
        pos = pos - 1;
        var surfaceConditions = this.data.surfaceConditions.slice();
        surfaceConditions[pos - 21] = '';

        var self = this;
        // 使用safeSetData优化删除操作
        this.safeSetData({
          surfaceConditions: surfaceConditions,
          currentPosition: pos
        }, function() {
          self.updateDisplay();
          self.updateKeyboard();
        }, {
          throttleKey: 'delete-surface',
          priority: 'high'
        });
      } else if (pos === 21) {
        // 从表面状况第一段退回到深度最后一位
        pos = 20;
        var self = this;
        // 使用safeSetData优化位置移动
        this.safeSetData({
          currentPosition: pos
        }, function() {
          self.updateDisplay();
          self.updateKeyboard();
        }, {
          throttleKey: 'delete-back',
          priority: 'high'
        });
      }
      return;
    }

    // 普通字符删除
    if (pos > 0) {
      pos = pos - 1;
      var chars = this.data.inputChars.slice(); // 创建副本
      chars[pos] = '_';

      var self = this;
      // 使用safeSetData优化删除字符
      this.safeSetData({
        inputChars: chars,
        currentPosition: pos
      }, function() {
        self.updateDisplay();
        self.updateKeyboard();
      }, {
        throttleKey: 'delete-char',
        priority: 'high'
      });
    }
  },

  // 清除所有
  clearAll: function() {
    this.initializeInput();
    this.updateDisplay();
    this.updateKeyboard();
  },

  // 快速填充示例
  loadExample: function(event) {
    var index = event.currentTarget.dataset.index;
    var exampleStr = this.data.examples[index].code;
    var chars = exampleStr.split('');

    // 确保长度正确
    while (chars.length < this.data.maxLength) {
      chars.push('_');
    }

    var self = this;
    // 使用safeSetData优化示例加载，添加防抖保护
    this.safeSetData({
      inputChars: chars,
      currentPosition: this.data.maxLength
    }, function() {
      self.updateDisplay();
      self.updateKeyboard();
    }, {
      throttleKey: 'load-example',
      priority: 'normal'
    });
  },

  /**
   * 验证输入数据的完整性
   * @description
   * 1. canDecode: 检查最低解码条件（跑道号前两位+RWYCC）
   * 2. isComplete: 检查所有必填项是否完整
   *    - 跑道号: 3位（数字+方向或空格）
   *    - RWYCC: 3位（0-6）
   *    - 覆盖率: 9位（3段，每段NR/25/50/75/100，不含空格占位符）
   *    - 深度: 6位（3段，每段2位数字或NR）
   *    - 表面状况: 3段（每段一个英文描述）
   */
  validateInput: function() {
    var chars = this.data.inputChars;
    var canDecode = false;
    var isComplete = false;

    // 至少需要跑道号前两位和RWYCC（最低解码条件）
    if (chars[0] !== '_' && chars[1] !== '_' &&
        chars[3] !== '_' && chars[4] !== '_' && chars[5] !== '_') {
      canDecode = true;
    }

    // 检查输入是否完成（所有必填项都已填写）
    // 1. 跑道号3位都不是下划线（空格允许）
    var runwayComplete = chars[0] !== '_' && chars[1] !== '_' && chars[2] !== '_';

    // 2. RWYCC 3位都不是下划线
    var rwyccComplete = chars[3] !== '_' && chars[4] !== '_' && chars[5] !== '_';

    // 3. 覆盖率9位都不是下划线且不是空格（修复：空格占位符判断）
    var coverageComplete = true;
    for (var i = 6; i < 15; i++) {
      if (chars[i] === '_' || chars[i] === ' ') {
        coverageComplete = false;
        break;
      }
    }

    // 4. 深度6位都不是下划线
    var depthComplete = true;
    for (var i = 15; i < 21; i++) {
      if (chars[i] === '_') {
        depthComplete = false;
        break;
      }
    }

    // 5. 表面状况3个段都已填写
    var surfaceComplete = this.data.surfaceConditions[0] !== '' &&
                          this.data.surfaceConditions[1] !== '' &&
                          this.data.surfaceConditions[2] !== '';

    // 所有项都完成时，输入完成
    isComplete = runwayComplete && rwyccComplete && coverageComplete &&
                 depthComplete && surfaceComplete;

    // 使用safeSetData更新验证状态
    this.safeSetData({
      canDecode: canDecode,
      isComplete: isComplete
    }, null, {
      throttleKey: 'validate-update',
      priority: 'low'  // 验证状态更新优先级较低
    });
  },

  // 解码SNOWTAM
  decodeSNOWTAM: function() {
    if (!this.data.canDecode) {
      // 使用BasePage提供的错误提示方法
      this.showError('请至少输入跑道号和RWYCC', 2000);
      return;
    }

    try {
      var analysis = this.analyzeSNOWTAM();

      // 使用safeSetData防止页面销毁时的错误
      this.safeSetData({
        currentView: 'result',
        analysis: analysis
      });
    } catch (error) {
      console.error('❌ SNOWTAM解码失败:', error);
      // 使用BasePage统一错误处理
      this.handleError(error, 'SNOWTAM解码');
      this.showError('解码失败，请检查输入格式', 2000);
    }
  },

  // 分析SNOWTAM
  analyzeSNOWTAM: function() {
    var chars = this.data.inputChars;

    // 提取各字段
    var runway = chars.slice(0, 3).join('').replace(/_/g, '');
    var rwycc = [chars[3], chars[4], chars[5]];

    var coverage = [
      chars.slice(6, 9).join('').replace(/_/g, '') || 'NR',
      chars.slice(9, 12).join('').replace(/_/g, '') || 'NR',
      chars.slice(12, 15).join('').replace(/_/g, '') || 'NR'
    ];

    var depth = [
      chars.slice(15, 17).join('').replace(/_/g, '') || 'NR',
      chars.slice(17, 19).join('').replace(/_/g, '') || 'NR',
      chars.slice(19, 21).join('').replace(/_/g, '') || 'NR'
    ];

    var surface = [];
    for (var i = 0; i < 3; i++) {
      surface[i] = this.data.surfaceConditions[i] || 'NR';
    }

    var analysis = {
      runway: runway,
      originalCode: this.data.displayChars.map(function(item) { return item.char; }).join('').replace(/_/g, ''),
      segments: [],
      performanceAssessment: null,
      warnings: []
    };

    var segmentNames = ['接地段(前1/3)', '中间段(中1/3)', '跑道末段(后1/3)'];

    // 分析每个跑道段
    for (var i = 0; i < 3; i++) {
      var segment = {
        name: segmentNames[i],
        rwycc: this.getRWYCCInfo(rwycc[i]),
        coverage: this.getCoverageInfo(coverage[i]),
        depth: this.getDepthInfo(depth[i]),
        surface: this.getSurfaceInfo(surface[i]),
        performance: this.assessSegmentPerformance(rwycc[i])
      };
      analysis.segments.push(segment);
    }

    // 总体性能评估
    analysis.performanceAssessment = this.assessOverallPerformance(rwycc);

    // 生成警告信息
    analysis.warnings = this.generateWarnings(rwycc, coverage, depth, surface);

    return analysis;
  },

  // 获取RWYCC信息
  getRWYCCInfo: function(code) {
    var rwyccData = {
      '6': { name: '干燥', level: 'DRY', color: '#52c41a', description: '跑道干燥，刹车效应正常' },
      '5': { name: '湿润/霜', level: 'WET/FROST', color: '#73d13d', description: '跑道湿润或有霜，刹车效应良好' },
      '4': { name: '压实雪', level: 'COMPACTED SNOW', color: '#fadb14', description: '压实的雪(-15°C以下)，刹车效应中等偏好' },
      '3': { name: '湿滑/雪', level: 'SLIPPERY WET', color: '#fa8c16', description: '湿滑表面或雪，刹车效应中等' },
      '2': { name: '积水/雪浆', level: 'STANDING WATER/SLUSH', color: '#ff4d4f', description: '积水或雪浆(>3mm)，刹车效应中等偏差' },
      '1': { name: '冰', level: 'ICE', color: '#cf1322', description: '结冰，刹车效应差' },
      '0': { name: '湿冰', level: 'WET ICE', color: '#820014', description: '湿冰或压实雪上有水，刹车效应极差' },
      '_': { name: '未输入', level: 'N/A', color: '#999', description: '未输入' }
    };

    return rwyccData[code] || rwyccData['_'];
  },

  // 获取覆盖率信息
  getCoverageInfo: function(code) {
    if (!code || code === 'NR') {
      return { code: 'NR', description: '不适用' };
    }

    var value = parseInt(code);
    if (!isNaN(value)) {
      if (value === 10) return { code: code, description: '小于10%' };
      if (value === 25) return { code: code, description: '10-25%' };
      if (value === 50) return { code: code, description: '26-50%' };
      if (value === 75) return { code: code, description: '51-75%' };
      if (value === 100) return { code: code, description: '76-100%' };
      return { code: code, description: code + '%' };
    }

    return { code: code, description: code };
  },

  // 获取深度信息
  getDepthInfo: function(code) {
    if (!code || code === 'NR') {
      return { code: 'NR', description: '不适用' };
    }

    var depth = parseInt(code);
    if (!isNaN(depth)) {
      if (depth <= 3) {
        return { code: code, description: '≤3mm（轻微）' };
      } else if (depth <= 6) {
        return { code: code, description: depth + 'mm（中等）' };
      } else if (depth <= 12) {
        return { code: code, description: depth + 'mm（较厚）' };
      } else {
        return { code: code, description: depth + 'mm（严重）' };
      }
    }

    return { code: code, description: code };
  },

  // 获取表面状况信息
  getSurfaceInfo: function(surface) {
    if (!surface || surface === 'NR') {
      return { code: 'NR', description: '未报告' };
    }

    // 直接返回完整英文
    return {
      code: surface,
      description: surface
    };
  },

  // 评估跑道段性能
  assessSegmentPerformance: function(rwycc) {
    if (rwycc === '_') {
      return { level: 'UNKNOWN', description: '未知', color: '#999' };
    }

    var code = parseInt(rwycc);
    if (code >= 5) {
      return { level: 'GOOD', description: '性能良好', color: '#52c41a' };
    } else if (code >= 3) {
      return { level: 'MEDIUM', description: '性能中等', color: '#fadb14' };
    } else if (code >= 1) {
      return { level: 'POOR', description: '性能差', color: '#ff4d4f' };
    } else {
      return { level: 'VERY_POOR', description: '性能极差', color: '#820014' };
    }
  },

  // 评估总体性能
  assessOverallPerformance: function(rwycc) {
    var validCodes = [];
    var segmentNames = ['接地段', '中间段', '跑道末段'];

    // 收集有效的RWYCC及其位置
    for (var i = 0; i < rwycc.length; i++) {
      if (rwycc[i] !== '_') {
        validCodes.push({
          code: parseInt(rwycc[i]),
          segment: i,
          name: segmentNames[i]
        });
      }
    }

    if (validCodes.length === 0) {
      return {
        minCode: '-',
        minSegment: '-',
        recommendation: '数据不完整',
        level: 'UNKNOWN'
      };
    }

    // 找出最低的RWYCC及其位置
    var minData = validCodes[0];
    for (var i = 1; i < validCodes.length; i++) {
      if (validCodes[i].code < minData.code) {
        minData = validCodes[i];
      }
    }

    var assessment = {
      minCode: minData.code,
      minSegment: minData.name,
      recommendation: ''
    };

    if (minData.code === 0) {
      assessment.recommendation = '⚠️ 极度危险：' + minData.name + '有湿冰或压实雪上有水，建议避免使用';
      assessment.level = 'CRITICAL';
    } else if (minData.code === 1) {
      assessment.recommendation = '⚠️ 危险：' + minData.name + '有冰，刹车效应差，需要特别谨慎';
      assessment.level = 'DANGEROUS';
    } else if (minData.code === 2) {
      assessment.recommendation = '⚠️ 警告：' + minData.name + '有积水或雪浆，可能影响刹车和方向控制';
      assessment.level = 'WARNING';
    } else if (minData.code >= 3 && minData.code <= 4) {
      assessment.recommendation = '📋 注意：' + minData.name + '状况中等，需要调整性能计算';
      assessment.level = 'CAUTION';
    } else {
      assessment.recommendation = '✅ 正常：跑道状况良好，可以正常运行';
      assessment.level = 'NORMAL';
    }

    return assessment;
  },

  // 生成警告信息
  generateWarnings: function(rwycc, coverage, depth, surface) {
    var warnings = [];
    var segmentNames = ['接地段(前1/3)', '中间段(中1/3)', '跑道末段(后1/3)'];

    // 检查RWYCC不一致
    var validRwycc = rwycc.filter(function(c) { return c !== '_'; });
    if (validRwycc.length > 1 && (validRwycc[0] !== validRwycc[1] || validRwycc[1] !== validRwycc[2])) {
      warnings.push({
        type: 'INFO',
        message: '跑道不同段落状况不一致，注意着陆点选择'
      });
    }

    // 检查危险状况
    for (var i = 0; i < 3; i++) {
      if (parseInt(rwycc[i]) <= 1) {
        warnings.push({
          type: 'DANGER',
          message: segmentNames[i] + '有冰或湿冰，极度危险'
        });
      }

      if (parseInt(depth[i]) > 12) {
        warnings.push({
          type: 'WARNING',
          message: segmentNames[i] + '污染物深度超过12mm'
        });
      }
    }

    // 检查接地段状况
    if (parseInt(rwycc[0]) <= 2) {
      warnings.push({
        type: 'CRITICAL',
        message: '接地段刹车效应差，着陆距离将显著增加'
      });
    }

    return warnings;
  },

  // 返回输入页面
  backToInput: function() {
    // 使用safeSetData优化视图切换
    this.safeSetData({
      currentView: 'input'
    }, null, {
      throttleKey: 'view-switch',
      priority: 'high'
    });
  },

  // 新建解码
  newDecode: function() {
    this.initializeInput();
    this.updateDisplay();
    this.updateKeyboard();

    // 使用safeSetData优化视图切换
    this.safeSetData({
      currentView: 'input'
    }, null, {
      throttleKey: 'view-switch',
      priority: 'high'
    });
  }
};

// 使用BasePage创建页面实例
Page(BasePage.createPage(pageConfig));