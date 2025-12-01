module.exports = {
  "name": "SNOWTAM",
  "description": "雪情通告 - 基于GRF全球报告格式的跑道表面状况报告",
  "structure": {
    "performance_calculation": {
      "name": "性能计算部分",
      "description": "A-I项为必填项，用于飞行性能计算",
      "required": true
    },
    "situational_awareness": {
      "name": "情景意识部分", 
      "description": "J-T项为选填项，提供额外的情景意识信息",
      "required": false
    }
  },
  "format": "性能计算部分: A)机场代码 B)评估日期时间 C)跑道 D)跑道状况代码 E)污染物覆盖百分比 F)松散污染物深度 G)污染物状况说明 H)跑道宽度 I)跑道长度变短 + 情景意识部分: J)吹积雪堆 K)散沙 L)化学处理 M)跑道雪堤 N)滑行道雪堤 O)跑道附近雪堤 P)滑行道状况 R)机坪状况 S)摩擦系数 T)明语说明",
  "notice": "本编码器完全符合ICAO全球报告格式(GRF)和中国民航规〔2021〕32号通知要求",
  "fields": {
    "location_indicator": {
      "label": "A) 机场位置指示器",
      "description": "四字母ICAO机场代码",
      "format": "XXXX",
      "required": true,
      "example": "ZBAA",
      "help": "输入四位ICAO机场代码，如北京首都机场为ZBAA"
    },
    "date_time": {
      "label": "B) 评估日期时间",
      "description": "跑道表面状况评估结束时间(北京时间)",
      "format": "MMDDHHMM",
      "required": true,
      "example": "12081200",
      "help": "格式：月月日日小时小时分分，如12月08日12点00分为12081200（北京时间）"
    },
    "runway": {
      "label": "C) 跑道代号",
      "description": "跑道识别代码(较小编号)",
      "format": "DD[L/R/C]",
      "required": true,
      "examples": [
        { "code": "01", "desc": "跑道01" },
        { "code": "01L", "desc": "跑道01左" },
        { "code": "01R", "desc": "跑道01右" },
        { "code": "01C", "desc": "跑道01中央" }
      ],
      "help": "输入跑道较小编号，必要时加上L/R/C标识"
    },
    "runway_condition_code": {
      "label": "D) 跑道状况代码",
      "description": "跑道每三分之一段的状况代码(RWYCC)",
      "format": "R/R/R",
      "required": true,
      "positions": ["跑道1/3", "跑道2/3", "跑道3/3"],
      "codes": {
        "6": "干",
        "5": "霜/湿/雪浆≤3mm/干雪≤3mm/湿雪≤3mm",
        "4": "压实雪(≤-15°C)/干雪≤3mm/湿雪≤3mm",
        "3": "湿滑/压实雪上有雪/干雪>3mm/湿雪>3mm/压实雪(>-15°C)",
        "2": "积水>3mm/雪浆>3mm",
        "1": "冰",
        "0": "湿冰/压实雪上有水/冰上有雪"
      },
      "examples": [
        { "code": "5/5/5", "desc": "全段湿润或轻微雪覆盖" },
        { "code": "3/2/1", "desc": "接地段湿滑/中间段雪浆/跑道末段结冰" },
        { "code": "6/6/6", "desc": "全段干燥清洁" }
      ],
      "help": "按中国民航规定选择每段跑道的状况代码，从跑道较小编号端开始"
    },
    "contamination_coverage": {
      "label": "E) 污染物覆盖百分比",
      "description": "跑道每三分之一段污染物覆盖百分比",
      "format": "CC/CC/CC",
      "required": true,
      "positions": ["跑道头1/3", "跑道中间段1/3", "跑道尾1/3"],
      "note": "当跑道状况代码为6或跑道状况为干时，填入'无'。如果有三分之一段跑道道面干燥或覆盖的污染物少于10%，填入'无'",
      "values": {
        "无": "道面干燥或覆盖的污染物少于10%",
        "25": "污染物覆盖10%-25%",
        "50": "污染物覆盖26%-50%", 
        "75": "污染物覆盖51%-75%",
        "100": "污染物覆盖76%-100%"
      },
      "examples": [
        { "code": "100/100/75", "desc": "头中间段全覆盖/跑道末段大部分覆盖" },
        { "code": "25/50/100", "desc": "接地段轻微/中间段一半/跑道末段全覆盖" },
        { "code": "无/无/无", "desc": "全段干燥或轻微污染" }
      ],
      "help": "按中国民航规定报告污染物覆盖百分比，小于10%填'无'"
    },
    "loose_contamination_depth": {
      "label": "F) 松散污染物深度",
      "description": "跑道每三分之一段的松散污染物深度",
      "format": "DD/DD/DD",
      "required": true,
      "unit": "毫米",
      "note": "只在污染物类型为干雪、湿雪、雪浆和积水时提供这项信息",
      "minimum_values": {
        "积水": "4毫米（3毫米及以下视为'湿'）",
        "雪浆": "3毫米",
        "湿雪": "3毫米", 
        "干雪": "3毫米"
      },
      "significant_change_thresholds": {
        "积水": "3毫米",
        "雪浆": "3毫米",
        "湿雪": "5毫米",
        "干雪": "20毫米"
      },
      "values": {
        "03-99": "实际深度（毫米）",
        "无": "不适用或深度小于通报最低值"
      },
      "examples": [
        { "code": "04/06/09", "desc": "接地段4mm/中间段6mm/跑道末段9mm" },
        { "code": "15/20/25", "desc": "接地段15mm/中间段20mm/跑道末段25mm" },
        { "code": "无/05/08", "desc": "接地段不适用/中间段5mm/跑道末段8mm" }
      ],
      "help": "按中国民航规定报告松散污染物深度，积水≥4mm、雪浆/雪≥3mm才报告"
    },
    "surface_condition_description": {
      "label": "G) 污染物状况说明",
      "description": "跑道每三分之一段的污染物种类",
      "format": "状况/状况/状况",
      "required": true,
      "positions": ["跑道头1/3", "跑道中间段1/3", "跑道尾1/3"],
      "contamination_types": {
        "干": "无任何污染物",
        "霜": "霜由温度低于冰点的表面上的空中潮气所形成的冰晶",
        "湿": "表面覆盖有任何明显的湿气或深度不超过3毫米的水",
        "湿滑": "湿滑跑道（摩擦特性显著变差的湿跑道）",
        "干雪": "不容易形成雪球的雪",
        "湿雪": "所含水分足以能够滚出一个压得很实的实心雪球但却挤不出水分的雪",
        "雪浆": "水分饱和度非常高，使得用手捧起时水将从中流出的雪",
        "压实的雪": "已被压成固态状的雪，使得航空器轮胎碾压后不会进一步大幅压实表面",
        "压实的雪面上有干雪": "压实雪表面覆盖干雪（任何深度）",
        "压实的雪面上有湿雪": "压实雪表面覆盖湿雪（任何深度）",
        "压实的雪面上有水": "压实雪表面有水",
        "冰": "已结成冰的水或在寒冷且干燥条件下已转变成冰的压实雪",
        "湿冰": "表面有水的冰或者正在融化的冰",
        "冰面上有干雪": "冰表面覆盖干雪",
        "冰面上有湿雪": "冰表面覆盖湿雪",
        "积水": "深度超过3毫米的水",
        "无": "覆盖的污染物少于10%，不通报污染物类型"
      },
      "examples": [
        { "code": "湿雪/雪浆/积水", "desc": "接地段湿雪/中间段雪浆/跑道末段积水" },
        { "code": "压实的雪/压实的雪面上有干雪/冰", "desc": "接地段压实雪/中间段压实雪上干雪/跑道末段结冰" },
        { "code": "干/干/干", "desc": "全段干燥无污染" }
      ],
      "help": "按中国民航规定选择污染物类型，如道面干燥填'干'，轻微污染填'无'"
    },
    "runway_width": {
      "label": "H) 跑道宽度",
      "description": "跑道状况代码所指跑道的宽度(米)",
      "format": "WW",
      "required": false,
      "unit": "米",
      "note": "如果跑道状况代码适用宽度小于公布的跑道宽度时填写",
      "examples": [
        { "code": "40", "desc": "适用宽度40米" },
        { "code": "45", "desc": "适用宽度45米" },
        { "code": "60", "desc": "适用宽度60米" }
      ],
      "help": "只有当跑道状况代码适用宽度小于公布跑道宽度时才需要填写"
    },
    "runway_length_reduction": {
      "label": "I) 跑道长度变短",
      "description": "跑道可用长度减少情况",
      "format": "RWY XX 变短至XXXX",
      "required": false,
      "unit": "米",
      "examples": [
        { "code": "01L 变短至3600", "desc": "跑道01L变短至3600米" },
        { "code": "16R 变短至2800", "desc": "跑道16R变短至2800米" }
      ],
      "help": "当跑道可用长度因雪情减少时填写"
    },
    
    // 情景意识部分 (选填)
    "drift_snow": {
      "label": "J) 跑道上有吹积的雪堆",
      "description": "跑道上吹积雪堆情况",
      "format": "RWY XX 有吹积雪堆",
      "required": false,
      "examples": [
        { "code": "01L 有吹积雪堆", "desc": "跑道01L上有吹积雪堆" },
        { "code": "16R 有吹积雪堆", "desc": "跑道16R上有吹积雪堆" }
      ],
      "help": "当跑道上存在吹积雪堆时填写"
    },
    
    "loose_sand": {
      "label": "K) 跑道上有散沙",
      "description": "跑道上散沙情况",
      "format": "RWY XX 有散沙",
      "required": false,
      "examples": [
        { "code": "01L 有散沙", "desc": "跑道01L上有散沙" },
        { "code": "16R 有散沙", "desc": "跑道16R上有散沙" }
      ],
      "help": "当跑道上存在散沙时填写"
    },
    
    "chemical_treatment": {
      "label": "L) 跑道上的化学处理",
      "description": "跑道化学处理情况",
      "format": "RWY XX 有化学处理",
      "required": false,
      "examples": [
        { "code": "01L 有化学处理", "desc": "跑道01L进行了化学处理" },
        { "code": "16R 有化学处理", "desc": "跑道16R进行了化学处理" }
      ],
      "help": "当跑道进行了除冰化学处理时填写"
    },
    
    "runway_snow_banks": {
      "label": "M) 跑道上有雪堤",
      "description": "跑道边缘雪堤情况",
      "format": "RWY XX 左侧/右侧/两侧 XX米距跑道中线",
      "required": false,
      "options": ["左侧", "右侧", "两侧"],
      "unit": "米",
      "examples": [
        { "code": "01L 左侧 30米距跑道中线", "desc": "跑道01L左侧30米处有雪堤" },
        { "code": "16R 两侧 25米距跑道中线", "desc": "跑道16R两侧25米处有雪堤" }
      ],
      "help": "当跑道边缘有雪堤时填写位置和距离"
    },
    
    "taxiway_snow_banks": {
      "label": "N) 滑行道上有雪堤",
      "description": "滑行道雪堤情况",
      "format": "TWY X上有雪堤",
      "required": false,
      "examples": [
        { "code": "G上有雪堤", "desc": "滑行道G上有雪堤" },
        { "code": "A上有雪堤", "desc": "滑行道A上有雪堤" }
      ],
      "help": "当滑行道上有雪堤时填写滑行道编号"
    },
    
    "adjacent_snow_banks": {
      "label": "O) 跑道附近有雪堤",
      "description": "跑道附近雪堤情况",
      "format": "RWY XX 附近有雪堤",
      "required": false,
      "examples": [
        { "code": "01L 附近有雪堤", "desc": "跑道01L附近有雪堤" },
        { "code": "16R 附近有雪堤", "desc": "跑道16R附近有雪堤" }
      ],
      "help": "当跑道附近有影响运行的雪堤时填写"
    },
    
    "taxiway_condition": {
      "label": "P) 滑行道状况",
      "description": "滑行道表面状况",
      "format": "TWY XX 差 或 ALL TWYS 差",
      "required": false,
      "conditions": ["差"],
      "examples": [
        { "code": "A 差", "desc": "滑行道A状况差" },
        { "code": "ALL TWYS 差", "desc": "所有滑行道状况差" }
      ],
      "help": "当滑行道状况差时填写"
    },
    
    "apron_condition": {
      "label": "R) 机坪状况",
      "description": "机坪表面状况",
      "format": "APRON XX 差 或 ALL APRONS 差",
      "required": false,
      "conditions": ["差"],
      "examples": [
        { "code": "P3 差", "desc": "机坪P3状况差" },
        { "code": "ALL APRONS 差", "desc": "所有机坪状况差" }
      ],
      "help": "当机坪状况差时填写机坪编号"
    },
    
    "measured_friction": {
      "label": "S) 测定的摩擦系数",
      "description": "实测跑道摩擦系数",
      "format": "XX.XX",
      "required": false,
      "note": "机场管理机构无需填写，由航空情报单位填写",
      "range": "0.00-1.00",
      "help": "实测摩擦系数值（通常由航空情报部门填写）"
    },
    
    "plain_language": {
      "label": "T) 明语说明",
      "description": "补充说明信息",
      "format": "自由文本",
      "required": false,
      "max_length": 200,
      "examples": [
        { "code": "01L跑道入口至350米处被4毫米的雪浆覆盖", "desc": "具体位置的污染情况" },
        { "code": "跑道中线灯部分被雪覆盖影响可见度", "desc": "灯光系统受影响情况" }
      ],
      "help": "用于提供额外的补充说明信息"
    }
  },
  "examples": [
    {
      "code": "A)ZBAA B)12081200 C)01L D)5/5/2 E)100/100/75 F)04/03/04 G)雪浆/干雪/湿雪 H)40 I)01L 变短至3600 J) K) L)01L 有化学处理 M)01L 左侧 30米距跑道中线 N) O) P) R) S) T)跑道接地段进行了除冰处理",
      "explanation": "北京首都机场01L跑道完整GRF雪情报告：包含性能计算部分和情景意识部分",
      "type": "完整报告",
      "breakdown": {
        "performance_section": {
          "A": "ZBAA - 北京首都机场",
          "B": "12081200 - 12月8日12:00评估时间(北京时间)",
          "C": "01L - 跑道01左",
          "D": "5/5/2 - 跑道状况代码：头中间段5(湿/雪浆≤3mm)，跑道末段2(雪浆>3mm)",
          "E": "100/100/75 - 污染物覆盖百分比：头中间段100%，跑道末段75%",
          "F": "04/03/04 - 松散污染物深度：4/3/4毫米",
          "G": "雪浆/干雪/湿雪 - 污染物状况说明",
          "H": "40 - 跑道状况代码适用宽度40米",
          "I": "01L 变短至3600 - 跑道长度变短至3600米"
        },
        "situational_section": {
          "J": " - 无吹积雪堆",
          "K": " - 无散沙",
          "L": "01L 有化学处理 - 跑道进行了化学除冰处理",
          "M": "01L 左侧 30米距跑道中线 - 跑道左侧30米处有雪堤",
          "N": " - 滑行道无雪堤",
          "O": " - 跑道附近无雪堤",
          "P": " - 滑行道状况正常",
          "R": " - 机坪状况正常",
          "S": " - 未测定摩擦系数",
          "T": "跑道接地段进行了除冰处理 - 补充说明"
        }
      }
    },
    {
      "code": "A)ZSSS B)01151800 C)16R D)2/1/0 E)100/100/100 F)06/12/09 G)雪浆/冰/压实的雪面上有水 H) I) J)16R 有吹积雪堆 K) L) M)16R 两侧 25米距跑道中线 N) O)16R 附近有雪堤 P)ALL TWYS 差 R) S) T)跑道及周边积雪严重，建议谨慎运行",
      "explanation": "上海浦东机场16R跑道严重雪情报告：包含多项情景意识警告",
      "type": "严重雪情",
      "breakdown": {
        "performance_section": {
          "A": "ZSSS - 上海浦东机场",
          "B": "01151800 - 1月15日18:00评估时间(北京时间)",
          "C": "16R - 跑道16右",
          "D": "2/1/0 - 跑道状况代码：接地段2(雪浆>3mm)，中间段1(冰)，跑道末段0(压实雪上有水)",
          "E": "100/100/100 - 污染物覆盖百分比：全段100%覆盖",
          "F": "06/12/09 - 松散污染物深度：6/12/9毫米",
          "G": "雪浆/冰/压实的雪面上有水 - 污染物状况说明",
          "H": " - 跑道宽度无特殊限制",
          "I": " - 跑道长度无变化"
        },
        "situational_section": {
          "J": "16R 有吹积雪堆 - 跑道上有吹积雪堆",
          "K": " - 无散沙",
          "L": " - 无化学处理",
          "M": "16R 两侧 25米距跑道中线 - 跑道两侧25米处有雪堤",
          "N": " - 滑行道无雪堤",
          "O": "16R 附近有雪堤 - 跑道附近有雪堤",
          "P": "ALL TWYS 差 - 所有滑行道状况差",
          "R": " - 机坪状况正常",
          "S": " - 未测定摩擦系数",
          "T": "跑道及周边积雪严重，建议谨慎运行 - 重要安全提醒"
        }
      }
    },
    {
      "code": "A)ZYHB B)02280600 C)09 D)6/6/6 E)无/无/无 F)无/无/无 G)干/干/干 H) I) J) K) L) M) N) O) P) R) S) T)",
      "explanation": "哈尔滨机场09跑道清洁状态报告：仅性能计算部分，情景意识部分全部为空",
      "type": "清洁状态",
      "breakdown": {
        "performance_section": {
          "A": "ZYHB - 哈尔滨机场",
          "B": "02280600 - 2月28日06:00评估时间(北京时间)",
          "C": "09 - 跑道09",
          "D": "6/6/6 - 跑道状况代码：全段6(干)",
          "E": "无/无/无 - 污染物覆盖百分比：全段干燥或污染物<10%",
          "F": "无/无/无 - 松散污染物深度：不适用",
          "G": "干/干/干 - 污染物状况说明：全段干燥",
          "H": " - 跑道宽度无特殊限制",
          "I": " - 跑道长度无变化"
        },
        "situational_section": {
          "note": "清洁状态下情景意识部分全部为空，表示无特殊情况"
        }
      }
    }
  ],
  "validation_rules": {
    "location_indicator": {
      "pattern": "^[A-Z]{4}$",
      "message": "必须是4位大写字母的ICAO代码"
    },
    "date_time": {
      "pattern": "^(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])([01][0-9]|2[0-3])([0-5][0-9])$",
      "message": "格式：MMDDHHMM，如12081200（北京时间）"
    },
    "runway": {
      "pattern": "^(0[1-9]|[12][0-9]|3[0-6])[LRC]?$",
      "message": "跑道号01-36，可选L/R/C（较小编号）"
    },
    "runway_condition_code": {
      "pattern": "^[0-6]/[0-6]/[0-6]$",
      "message": "格式：R/R/R，每段一个数字0-6"
    },
    "contamination_coverage": {
      "options": ["无", "25", "50", "75", "100"],
      "message": "必须选择：无、25、50、75、100之一"
    },
    "loose_contamination_depth": {
      "pattern": "^(无|[0-9]{2})/(无|[0-9]{2})/(无|[0-9]{2})$",
      "message": "格式：XX/XX/XX，每段两位数字或'无'"
    },
    "surface_condition_description": {
      "contamination_types": ["干", "霜", "湿", "湿滑", "干雪", "湿雪", "雪浆", "压实的雪", "压实的雪面上有干雪", "压实的雪面上有湿雪", "压实的雪面上有水", "冰", "湿冰", "冰面上有干雪", "冰面上有湿雪", "积水", "无"],
      "message": "必须选择规定的污染物类型"
    },
    "runway_width": {
      "pattern": "^[0-9]{2}$",
      "message": "两位数字表示宽度（米）"
    },
    "runway_length_reduction": {
      "pattern": "^(0[1-9]|[12][0-9]|3[0-6])[LRC]? 变短至[0-9]{4}$",
      "message": "格式：跑道号 变短至长度，如'01L 变短至3600'"
    }
  },
  "grf_compliance": {
    "version": "GRF 2021",
    "standard": "ICAO全球报告格式",
    "china_regulation": "中国民航规〔2021〕32号",
    "implementation_date": "2021年11月4日",
    "key_changes": [
      "新的跑道状况代码(RWYCC)系统",
      "污染物覆盖百分比标准化",
      "松散污染物深度通报规则",
      "跑道表面状况评估矩阵(RCAM)",
      "SNOWTAM最大有效期8小时"
    ]
  }
};