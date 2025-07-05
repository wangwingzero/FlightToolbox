const landAirCommunicationsData = {
  "documentTitle": "虎大王编写的学习资料",
  "organization": "虎大王",
  "metadata": {
    "code": "FGBRTF",
    "date": "240401",
    "version": "01-00",
    "type": "学习资料之通信" 
  },
  "chapters": [
    {
      "chapter_id": "第一章",
      "title": "总则",
      "sections": [
        {
          "section_id": "1.3",
          "title": "通话用语要求",
          "subsections": [
            {
              "subsection_id": "1.3.1",
              "title": "通话概述",
              "content": [
                "空中交通无线电通话用语应用于空中交通服务单位与航空器之间的话音联络。",
                "它有自己特殊的发音规则,语言简洁、严谨,经过严格的缩减程序,通常为祈使句。",
                "陆空通话中应使用汉语普通话或英语,时间采用UTC(协调世界时)。" 
              ]
            },
            {
              "subsection_id": "1.3.2",
              "title": "通话结构",
              "rules": [
                {
                  "condition": "首次联系时,空中交通管制员采用的通话结构为",
                  "structure": "对方呼号+己方呼号+通话内容。" 
                },
                {
                  "condition": "首次通话以后的各次通话,空中交通管制员采用的通话结构为",
                  "structure": "对方呼号+通话内容。" 
                },
                {
                  "condition": "航空器驾驶员采用的通话结构为",
                  "structure": "对方呼号+己方完整呼号+通话内容。" 
                },
                {
                  "condition": "空中交通管制员确认航空器驾驶员复诵的内容正确时,通话结构应为",
                  "structure": "对方呼号+“(复诵)正确”",
                  "english_structure": "aircraft call sign + \"(READ BACK) CORRECT\"" 
                }
              ],
              "note": "航空器驾驶员应以完整呼号终止复诵。" 
            },
            {
              "subsection_id": "1.3.3",
              "title": "通话技巧",
              "tips": [
                "发话前,应仔细守听使用频率,确保没有来自其他电台的干扰。",
                "应熟练掌握送话器使用技巧。",
                "使用正常通话语调,通话时每个单词发音应清楚、明白。",
                "发话速度应保持平稳,建议一分钟控制在200(中文)个字/120(英语)个词左右。在发送须记录的信息时应降低速率。",
                "发话音量应保持在恒定的水平。",
                "在通话中的数字前应稍作停顿,以便于理解。",
                "应避免使用“啊、哦”等犹豫不决的词。",
                "应熟悉麦克风的操作技巧,特别是在没有恒定水平调节器时应与麦克风保持一定距离。",
                "如果需要把头从麦克风上移开,应暂停通话。",
                "应在开始通话前按下发送开关,待发话完毕后再将其松开,这有助于通话内容的完整性。",
                "发送较长通话内容应不时地做短暂停顿,以便发话人确认使用的频率清晰,并在必要时方便收话人申请重复没有接收到的部分。" 
              ]
            }
          ]
        },
        {
          "section_id": "1.4",
          "title": "发音",
          "subsections": [
            {
              "subsection_id": "1.4.1",
              "title": "数字的一般读法",
              "parts": [
                {
                  "part_id": "1.4.1.1",
                  "title": "数字的标准读法",
                  "table": {
                    "name": "表1数字的标准读法",
                    "note": "黑体部分应重读",
                    "data": [
                      { "数字": "0", "汉语读法": "洞", "英语读法": "ZE-RO" },
                      { "数字": "1", "汉语读法": "幺", "英语读法": "WUN" },
                      { "数字": "2", "汉语读法": "两", "英语读法": "TOO" },
                      { "数字": "3", "汉语读法": null, "英语读法": "TREE" },
                      { "数字": "4", "汉语读法": "四", "英语读法": "FOW-er" },
                      { "数字": "5", "汉语读法": "五", "英语读法": "FIFE" },
                      { "数字": "6", "汉语读法": "六", "英语读法": "SIX" },
                      { "数字": "7", "汉语读法": "拐", "英语读法": "SEV-en" },
                      { "数字": "8", "汉语读法": "八", "英语读法": "AIT" },
                      { "数字": "9", "汉语读法": "九", "英语读法": "NIN-er" },
                      { "数字": ".", "汉语读法": "点", "英语读法": "DAY-SEE-MAL 或 POINT (point只用于mach)" },
                      { "数字": "100", "汉语读法": "百", "英语读法": "HUN-dred" },
                      { "数字": "1000", "汉语读法": "千", "英语读法": "TOU-SAND" } 
                    ]
                  }
                },
                {
                  "part_id": "1.4.1.2",
                  "title": "数字组合的一般读法",
                  "description": [
                    "数字组合的汉语读法一般根据数字的汉语发音按顺序逐位读出;整百、整千或整千整百组合的数字也可读出数字,后面加上百、千或千百。",
                    "基于汉语的发音习惯,1位数或者2位数的数值中含有0,1,2,7时,按数字的标准读法(表1数字的标准读法)分别读出。其它的数值按照日常读法读出,个别数值的发音参见示例。",
                    "数字组合的英语读法一般根据数字的英语发音按顺序逐位读出;整百、整千或整千整百组合的数字通常读出数字,后面加上百、千或千百的英语标准读法(表1数字的标准读法)。" 
                  ],
                  "table": {
                    "name": "表2数字组合的一般读法",
                    "data": [
                      { "数字": "10", "汉语读法": "幺洞", "英语读法": "WUN ZE-RO" },
                      { "数字": "34 47", "汉语读法": "三十四 四拐", "英语读法": "TREE FOW-er FOW-er SEV-en" },
                      { "数字": "300 8000 4500", "汉语读法": "三百/三洞洞 八千 四千五百", "英语读法": "TREE HUN-dred/TREE ZE-RO ZE-RO AIT TOU-SAND FOW-er TOU-SAND FIFE HUN-dred" },
                      { "数字": "360", "汉语读法": "三六洞", "英语读法": "TREE SIX ZE-RO" },
                      { "数字": "7141", "汉语读法": "拐么四幺", "英语读法": "SEV-en WUN FOW-er WUN" },
                      { "数字": "36089", "汉语读法": "三六洞八九", "英语读法": "TREE SIX ZE-RO AIT NIN-er" } 
                    ]
                  }
                }
              ]
            },
            {
              "subsection_id": "1.4.2",
              "title": "数字组合的特殊读法",
              "parts": [
                {
                  "part_id": "1.4.2.1",
                  "title": "高度的读法",
                  "rules": [
                    {
                      "type": "我国高度层配备标准",
                      "tables": [
                        {
                          "name": "表3我国高度层标准读法",
                          "note": "RVSM 空域高度范围从8900米到12500米。",
                          "data": [
                            { "高度层": "600m", "汉语读法": "六百", "英语读法": "SIX HUN-dred METERS" },
                            { "高度层": "900m", "汉语读法": "九百", "英语读法": "NIN-er HUN-dred METERS" },
                            { "高度层": "1200m", "汉语读法": "幺两", "英语读法": "WUN TOU-SAND TOO HUN-dred METERS" },
                            { "高度层": "1500m", "汉语读法": "幺五", "英语读法": "WUN TOU-SAND FIFE HUN-dred METERS" },
                            { "高度层": "1800m", "汉语读法": "么八", "英语读法": "WUN TOU-SAND AIT HUN-dred METERS" },
                            { "高度层": "2100m", "汉语读法": "两幺", "英语读法": "TOO TOU-SAND WUN HUN-dred METERS" },
                            { "高度层": "2400m", "汉语读法": "两千四", "英语读法": "TOO TOU-SAND FOW-er HUN-dred METERS" },
                            { "高度层": "2700m", "汉语读法": "两拐", "英语读法": "TOO TOU-SAND SEV-en HUN-dred METERS" },
                            { "高度层": "3000m", "汉语读法": "三千", "英语读法": "TREE TOU-SAND METERS" },
                            { "高度层": "3300m", "汉语读法": "三千三", "英语读法": "TREE TOU-SAND TREE HUN-dred METERS" },
                            { "高度层": "3600m", "汉语读法": "三千六", "英语读法": "TREE TOU-SAND SIX HUN-dred METERS" },
                            { "高度层": "3900m", "汉语读法": "三千九", "英语读法": "TREE TOU-SAND NIN-er HUN-dred METERS" },
                            { "高度层": "4200m", "汉语读法": "四两", "英语读法": "FOW-er TOU-SAND TOO HUN-dred METERS" },
                            { "高度层": "4500m", "汉语读法": "四千五", "英语读法": "FOW-er TOU-SAND FIFE HUN-dred METERS" },
                            { "高度层": "4800m", "汉语读法": "四千八", "英语读法": "FOW-er TOU-SAND AIT HUN-dred METERS" },
                            { "高度层": "5100m", "汉语读法": "五幺", "英语读法": "FIFE TOU-SAND WUN HUN-dred METERS" },
                            { "高度层": "5400m", "汉语读法": "五千四", "英语读法": "FIFE TOU-SAND FOW-er HUN-dred METERS" },
                            { "高度层": "5700m", "汉语读法": "五拐", "英语读法": "FIFE TOU-SAND SEV-en HUN-dred METERS" },
                            { "高度层": "6000m", "汉语读法": "六千", "英语读法": "SIX TOU-SAND METERS" },
                            { "高度层": "6300m", "汉语读法": "六千三", "英语读法": "SIX TOU-SAND TREE HUN-dred METERS" },
                            { "高度层": "6600m", "汉语读法": "六千六", "英语读法": "SIX TOU-SAND SIX HUN-dred METERS" },
                            { "高度层": "6900m", "汉语读法": "六千九", "英语读法": "SIX TOU-SAND NIN-er HUN-dred METERS" },
                            { "高度层": "7200m", "汉语读法": "拐两", "英语读法": "SEV-en TOU-SAND TOO HUN-dred METERS" },
                            { "高度层": "7500m", "汉语读法": "拐五", "英语读法": "SEV-en TOU-SAND FIFE HUN-dred METERS" },
                            { "高度层": "7800m", "汉语读法": "拐八", "英语读法": "SEV-en TOU-SAND AIT HUN-dred METERS" },
                            { "高度层": "8100m", "汉语读法": "八么", "英语读法": "AIT TOU-SAND WUN HUN-dred METERS" },
                            { "高度层": "8400m", "汉语读法": "八千四", "英语读法": "AIT TOU-SAND FOW-er HUN-dred METERS" },
                            { "高度层": "8900m", "汉语读法": "八千九", "英语读法": "AIT TOU-SAND NIN-er HUN-dred METERS" },
                            { "高度层": "9200m", "汉语读法": "九千二", "英语读法": "NIN-er TOU-SAND TOO HUN-dred METERS" },
                            { "高度层": "9500m", "汉语读法": "九千五", "英语读法": "NIN-er TOU-SAND FIFE HUN-dred METERS" },
                            { "高度层": "9800m", "汉语读法": "九千八", "英语读法": "NIN-er TOU-SAND AIT HUN-dred METERS" },
                            { "高度层": "10100m", "汉语读法": "幺洞幺", "英语读法": "WUN ZE-RO TOU-SAND WUN HUN-dred METERS" },
                            { "高度层": "10400m", "汉语读法": "幺洞四", "英语读法": "WUN ZE-RO TOU-SAND FOW-er HUN-dred METERS" },
                            { "高度层": "10700m", "汉语读法": "幺洞拐", "英语读法": "WUN ZE-RO TOU-SAND SEV-en HUN-dred METERS" },
                            { "高度层": "11000m", "汉语读法": "幺幺洞", "英语读法": "WUN WUN TOU-SAND METERS" },
                            { "高度层": "11300m", "汉语读法": "幺幺三", "英语读法": "WUN WUN TOU-SAND TREE HUN-dred METERS" },
                            { "高度层": "11600m", "汉语读法": "幺么六", "英语读法": "WUN WUN TOU-SAND SIX HUN-dred METERS" },
                            { "高度层": "11900m", "汉语读法": "幺幺九", "英语读法": "WUN WUN TOU-SAND NIN-er HUN-dred METERS" },
                            { "高度层": "12200m", "汉语读法": "幺两两", "英语读法": "WUN TOO TOU-SAND TOO HUN-dred METERS" },
                            { "高度层": "12500m", "汉语读法": "幺两五", "英语读法": "WUN TOO TOU-SAND FIFE HUN-dred METERS" },
                            { "高度层": "13100m 13700m", "汉语读法": "幺三幺 幺三拐", "英语读法": "WUN TREE TOU-SAND WUN HUN-dred METERS WUN TREE TOU-SAND SEV-en HUN-dred METERS" },
                            { "高度层": "14300m", "汉语读法": "幺四三", "英语读法": "WUN FOW-er TOU-SAND TREE HUN-dred METERS" },
                            { "高度层": "14900m", "汉语读法": "幺四九", "英语读法": "WUN FOW-er TOU-SAND NIN-er HUN-dred METERS" },
                            { "高度层": "15500m", "汉语读法": "幺五五", "英语读法": "WUN FIFE TOU-SAND FIFE HUN-dred METERS" } 
                          ]
                        }
                      ]
                    },
                    {
                      "type": "英制高度层配备标准",
                      "table": {
                        "name": "表4英制高度层读法",
                        "data": [
                          { "高度层": "3000ft", "汉语读法": "三千英尺", "英语读法": "TREE TOUSAND FEET" },
                          { "高度层": "5900ft", "汉语读法": "五千九百英尺", "英语读法": "FIFE TOUSAND NIN-er HUN-dred FEET" },
                          { "高度层": "12000ft", "汉语读法": "高度层幺两洞", "英语读法": "FLIGHT LEVEL WUN TOO ZERO" },
                          { "高度层": "36000ft", "汉语读法": "高度层三六洞", "英语读法": "FLIGHT LEVEL TREE SIX ZERO" } 
                        ]
                      }
                    },
                    {
                      "type": "气压基准面转换",
                      "description": "当高度指令涉及气压基准面转换时,空中交通管制员在通话中会指明新的气压基准面数值,以后可省略气压基准面和数值。航空器驾驶员对空中交通管制员指定的气压基准面(数值)应进行复诵。",
                      "rules": [
                        { "基准面": "1013.2百帕", "汉语读法": "“标准气压”+高度层" , "英语读法": "flight level + \"ON STANDARD\""  },
                        { "基准面": "修正海平面气压", "汉语读法": "“修正海压”+高度,“修正海压”+修正海压数值" , "英语读法": "altitude + \"ON QNH\", QNH number"  },
                        { "基准面": "场面气压", "汉语读法": "“场压”+高,“场压”+场压数值" , "英语读法": "height + \"ON QFE\", QFE number"  }
                      ]
                    },
                    {
                      "type": "不符合我国高度层配备标准的高度",
                      "description": "按照1.4.1.2 数字组合的一般读法读出。为了便于对方理解,避免与固定高度层混淆,其中文读法应全读,即高度的后面应读出“米”。",
                      "table": {
                        "name": "表5不符合我国高度层配备的高度读法",
                        "data": [
                          { "高度": "200m/QNH", "汉语读法": "修正海压两百米", "英语读法": "TOO HUN-dred METERS ON QNΗ" },
                          { "高度": "350m/QFE", "汉语读法": "场压三百五十米", "英语读法": "TREE FIFE ZE-RO METERS ON QFE" },
                          { "高度": "700m/QNH", "汉语读法": "修正海压七百米", "英语读法": "SEV-en HUN-dred METERS ON QNH" },
                          { "高度": "2150m/QNE", "汉语读法": "标准气压两千一百五十米", "英语读法": "TOO WUN FIFE ZE-RO METERS ON STANDARD" } 
                        ]
                      }
                    }
                  ]
                },
                {
                  "part_id": "1.4.2.2",
                  "title": "最低下降高(高度)、决断高(高度)的读法",
                  "rules": [
                    { "type": "最低下降高(高度)", "汉语读法": "“最低下降高(高度)”+高度数字+单位" , "英语读法": "\"MINIMUN DESCENT HEIGHT (ALTITUDE)\" + number + units"  },
                    { "type": "决断高(高度)", "汉语读法": "“决断高(高度)”+高度数字+单位" , "英语读法": "\"DECISION HEIGHT (ALTITUDE)\" + number + units"  }
                  ]
                },
                {
                  "part_id": "1.4.2.3",
                  "title": "机场标高的读法",
                  "rules": [
                    { "type": "机场标高", "汉语读法": "“标高”+高度数字+单位" , "英语读法": "\"ELEVATION\" + number + unit"  }
                  ]
                },
                {
                  "part_id": "1.4.2.4",
                  "title": "时间的读法",
                  "description": "时间的汉语读法一般只读出分,必要时读出小时和分。时间的英语读法按照数字逐位读出。",
                  "note": "通报时间一般默认为协调世界时(UTC),如通报时间为北京时(Beijing time),应特殊说明。",
                  "table": {
                    "name": "表6时间的读法",
                    "data": [
                      { "时间": "09:00 UTC", "汉语读法": "洞九洞洞,或整点", "英语读法": "ZE-RO ZE-RO UTC, or ZE-RO NIN-er ZE-RO ZE-RO UTC" },
                      { "时间": "15:21北京时", "汉语读法": "北京时两幺,或北京时幺五两幺", "英语读法": "TOO WUN Beijing time, or WUN FIFE TOO WUN Beijing time" },
                      { "时间": "21:49 UTC", "汉语读法": "四九,或两么四九", "英语读法": "FOW-er NIN-er UTC, or TOO WUN FOW-er NIN-er UTC" } 
                    ]
                  }
                },
                {
                  "part_id": "1.4.2.5",
                  "title": "气压的读法",
                  "rules": [
                    { "type": "气压", "汉语读法": "“场压(修正海压)”+气压数值(数字应逐位读出)" , "英语读法": "\"QFE (QNH)\" +气压数值(数字应逐位读出)"  }
                  ],
                  "table": {
                    "name": "表7气压的读法",
                    "data": [
                      { "气压": "QFE 1002", "汉语读法": "场压幺洞洞两", "英语读法": "QFE WUN ZE-RO ZE-RO TOO" },
                      { "气压": "QNH 1011", "汉语读法": "修正海压幺洞幺幺", "英语读法": "QNH WUN ZE-RO WUN WUN" } 
                    ]
                  }
                },
                {
                  "part_id": "1.4.2.6",
                  "title": "航向(航迹)的读法",
                  "rules": [
                    { "type": "航向(航迹)", "汉语读法": "“航向(航迹)”+三位数数值(数值应逐位读出)" , "英语读法": "\"HEADING (TRACK)\" + three digits"  }
                  ],
                  "table": {
                    "name": "表8航向(航迹)的读法",
                    "data": [
                      { "航向(航迹)": "030", "汉语读法": "航向(航迹)洞三洞", "英语读法": "HEADING (TRACK) ZE-RO TREE ZE-RO" },
                      { "航向(航迹)": "120", "汉语读法": "航向(航迹)幺两洞", "英语读法": "HEADING (TRACK) WUN TOO ZE-RO" },
                      { "航向(航迹)": "360", "汉语读法": "航向(航迹)三六洞", "英语读法": "HEADING (TRACK) TREE SIX ZE-RO" },
                      { "航向(航迹)": "300", "汉语读法": "航向(航迹)三洞洞", "英语读法": "HEADING (TRACK) TREE ZE-RO ZE-RO" } 
                    ]
                  }
                },
                {
                  "part_id": "1.4.2.7",
                  "title": "速度的读法",
                  "rules": [
                    { "unit": "海里每小时", "汉语读法": "“速度”+速度数值(逐位读出,后不加单位)" , "英语读法": "速度数值(逐位读出)+“KNOTS\""  },
                    { "unit": "公里每小时", "汉语读法": "速度数值(按1.4.1.2数字组合的一般读法)+“公里小时”" , "英语读法": "速度数值(按1.4.1.2数字组合的一般读法)+“KILOMETERS PER HOUR\""  },
                    { "unit": "马赫数", "汉语读法": "“马赫数点”+XX(按1.4.1.2数字组合的一般读法),或“马赫数”+X+“点”+XX(按1.4.1.2数字组合的一般读法)" , "英语读法": "\"MACH NUMBER POINT\" +XX(按1.4.1.2数字组合的一般读法)或,\"MACH NUMBER\" + X + \"POINT\" + XX(按1.4.1.2 数字组合的一般读法)"  },
                    { "unit": "米每秒", "汉语读法": "速度数值(按1.4.1.2数字组合的一般读法)+“米秒”" , "英语读法": "速度数值(按1.4.1.2数字组合的一般读法)+“METERS PER SECOND\""  }
                  ],
                  "table": {
                    "name": "表9速度的读法",
                    "data": [
                      { "速度": "180 knots", "读法": "速度幺八洞 WUN AIT ZE-RO KNOTS" },
                      { "速度": "350km/h", "读法": "三百五十公里小时 TREE FIFE ZE-RO KILOMETERS PER HOUR" },
                      { "速度": "M0.85", "读法": "马赫数点八五 MACH NUMBER POINT AIT FIFE" },
                      { "速度": "M1.15", "读法": "马赫数幺点幺五 MACH NUMBER WUN POINT WUN FIFE" },
                      { "速度": "3m/s", "读法": "三米秒 TREE METERS PER SECOND" } 
                    ]
                  }
                },
                {
                  "part_id": "1.4.2.8",
                  "title": "频率的读法",
                  "rules": [
                    { "type": "频率", "汉语读法": "频率数值(逐位读出)" , "英语读法": "频率数值(逐位读出)"  }
                  ],
                  "note": "高频应另读出单位。汉语: “高频”+数值, 英语: number + \"KILOHERTZ\"",
                  "table": {
                    "name": "表10频率的读法",
                    "data": [
                      { "频率": "130.000 MHz", "汉语读法": "幺三洞", "英语读法": "WUN TREE ZE-RO DAY-SEE-MAL ZE-RO" },
                      { "频率": "121.5 MHz", "汉语读法": "幺两幺点五", "英语读法": "WUN TOO WUN DAY-SEE-MAL FIFE" },
                      { "频率": "122.75 MHz", "汉语读法": "幺两两点拐五", "英语读法": "WUN TOO TOO DAY-SEE-MAL SEV-en FIFE" },
                      { "频率": "118.025 MHz", "汉语读法": "幺么八点洞两五", "英语读法": "WUN WUN AIT DAY-SEE-MAL ZE-RO TOO FIFE" },
                      { "频率": "6565 KHz", "汉语读法": "高频六五六五", "英语读法": "SIX FIFE SIX FIFE KILOHERTZ" } 
                    ]
                  }
                },
                {
                  "part_id": "1.4.2.9",
                  "title": "跑道的读法",
                  "rules": [
                    { "type": "跑道", "汉语读法": "“跑道”+号码(逐位读出)+(“右”/“左”/“中”)" , "英语读法": "“RUNWAY”+跑道号码(逐位读出)+(“RIGHT”/“LEFT\"/ CENTER\")"  }
                  ],
                  "note": "跑道号码后的英文字母R、L、C分别表右、左、中。",
                  "table": {
                    "name": "表11跑道的读法",
                    "data": [
                      { "跑道": "13", "汉语读法": "跑道么三", "英语读法": "RUNWAY WUN TREE" },
                      { "跑道": "07L", "汉语读法": "跑道洞拐左", "英语读法": "RUNWAY ZE-RO SEV-en LEFT" },
                      { "跑道": "18C", "汉语读法": "跑道么八中", "英语读法": "RUNWAY WUN AIT CENTER" },
                      { "跑道": "36R", "汉语读法": "跑道三六右", "英语读法": "RUNWAY TREE SIX RIGHT" } 
                    ]
                  }
                },
                {
                  "part_id": "1.4.2.10",
                  "title": "距离的读法",
                  "rules": [
                    { "type": "距离", "汉语读法": "距离数值(按3.4.1.2 数字组合的一般读法)+单位" , "英语读法": "距离数值(按3.4.1.2 数字组合的一般读法)+ units"  }
                  ],
                  "table": {
                    "name": "表12距离的读法",
                    "data": [
                      { "距离": "20 miles", "汉语读法": "两洞海里", "英语读法": "TOO ZE-RO MILES" },
                      { "距离": "16 miles", "汉语读法": "幺六海里", "英语读法": "WUN SIX MILES" },
                      { "距离": "56km", "汉语读法": "五十六公里", "英语读法": "FIFE SIX KILOMETERS" },
                      { "距离": "750m", "汉语读法": "七百五十米", "英语读法": "SEV-en FIFE ZE-RO METERS" },
                      { "距离": "130m", "汉语读法": "一百三十米", "英语读法": "WUN TREE ZE-RO METERS" },
                      { "距离": "7100m", "汉语读法": "七千一百米", "英语读法": "SEV-en TOU-SAND WUN HUN-dred METERS" },
                      { "距离": "2356m", "汉语读法": "两千三百五十六米", "英语读法": "TOO TREE FIFE SIX METERS" } 
                    ]
                  }
                },
                {
                  "part_id": "1.4.2.11",
                  "title": "应答机编码的读法",
                  "rules": [
                    { "type": "应答机编码", "汉语读法": "“应答机”+应答机编码数值(逐位读出)" , "英语读法": "“SQUAWK”+应答机编码数值(逐位读出)"  }
                  ],
                  "note": "应答机编码共四位,每一位从“0-7”之间取值,共4096个。",
                  "table": {
                    "name": "表13 应答机编码的读法",
                    "data": [
                      { "应答机编码": "2456", "汉语读法": "应答机两四五六", "英语读法": "SQUAWK TOO FOW-er FIFE SIX" },
                      { "应答机编码": "7500", "汉语读法": "应答机拐五洞洞", "英语读法": "SQUAWK SEV-en FIFE ZE-RO ZE-RO" } 
                    ]
                  }
                },
                {
                  "part_id": "1.4.2.12",
                  "title": "经纬度的读法",
                  "rules": [
                    { "type": "经纬度", "汉语读法": "“北(南)纬”+逐位读出度(两位)、分(两位)、秒(两位),“东(西)经”+逐位读出度(三位)、分(两位)、秒(两位)" , "英语读法": "\"LATITUDE\" + XX \"DEGREES XX \"MINUTES\" XX \"SECONDS NORTH (SOUTH)\", \"LONGITUDE\" + XXX \"DEGREES XX \"MINUTES\" XX \"SECONDS EAST (WEST)\""  }
                  ],
                  "table": {
                    "name": "表14经纬度的读法",
                    "data": [
                      { "经纬度": "32°05′02″N 107°32′04″E", "汉语读法": "北纬三两洞五洞两, 东经幺洞拐三两洞四", "英语读法": "Latitude TREE TOO degrees ZE-RO FIFE minutes ZE-RO TOO seconds North, Longitude WUN ZE-RO SEV-en degrees TREE TOO minutes ZE-RO FOW-er seconds East" },
                      { "经纬度": "05°21′15″S 145°08′20″W", "汉语读法": "南纬洞五两幺幺五, 西经么四五洞捌两洞", "英语读法": "Latitude ZE-RO FIFE degrees TOO WUN minutes WUN FIFE seconds South, Longitude WUN FOW-er FIFE degrees ZE-RO AIT minutes TOO ZE-RO seconds West" },
                      { "经纬度": "02°05′02″N, 007°32′04″E", "汉语读法": "北纬洞两洞五洞两, 东经洞洞拐三两洞四", "英语读法": "Latitude ZE-RO TOO degrees ZE-RO FIFE minutes ZE-RO TOO seconds North, Longitude ZE-RO ZE-RO SEV-en degrees TREE TO0 minutes ZE-RO FOW-er seconds East" } 
                    ]
                  }
                },
                {
                  "part_id": "1.4.2.13",
                  "title": "航空器机型的读法",
                  "table": {
                    "name": "表15 常见航空器机型的读法",
                    "data": [
                      { "机型": "B737-800/ B738", "汉语读法": "波音七三七八百/波音七三八", "英语读法": "Boeing SEV-en TREE SEV-en AIT HUN-dred/Boeing SEV-en TREE AIT" },
                      { "机型": "B757", "汉语读法": "波音七五七", "英语读法": "Boeing SEV-en FIFE SEV-en" },
                      { "机型": "B777", "汉语读法": "波音七七七", "英语读法": "Boeing SEV-en SEV-en SEV-en" },
                      { "机型": "B787", "汉语读法": "波音七八七", "英语读法": "Boeing SEV-en AIT SEV-en" },
                      { "机型": "B747-SP", "汉语读法": "波音七四七 Es Pee", "英语读法": "Boeing SEV-en FOW-er SEV-en Es Pee" },
                      { "机型": "B747-400", "汉语读法": "波音七四七四百", "英语读法": "Boeing SEV-en FOW-er SEV-en FOW-er HUN-dred" },
                      { "机型": "IL-76", "汉语读法": "伊尔拐六", "英语读法": "Ilyushin SEV-en SIX" },
                      { "机型": "A320", "汉语读法": "空客三二零", "英语读法": "Airbus TREE TOO ZE-RO" },
                      { "机型": "A319", "汉语读法": "空客三幺九", "英语读法": "Airbus TREE WUN NIN-er" },
                      { "机型": "A330", "汉语读法": "空客三三零", "英语读法": "Airbus TREE TREE ZE-RO" },
                      { "机型": "A340", "汉语读法": "空客三四零", "英语读法": "Airbus TREE FOW-er ZE-RO" },
                      { "机型": "A380", "汉语读法": "空客三八零", "英语读法": "Airbus TREE AIT ZE-RO" },
                      { "机型": "MD11", "汉语读法": "麦道么幺", "英语读法": "Em Dee ELEVEN" },
                      { "机型": "EMB190", "汉语读法": "Eee Em Bee 幺九零", "英语读法": "Eee Em Bee WUN NIN-er ZE-RO" } 
                    ]
                  }
                },
                {
                  "part_id": "1.4.2.14",
                  "title": "时钟方位的读法",
                  "rules": [
                    { "type": "时钟方位", "汉语读法": "数字+“点钟方位”" , "英语读法": "number + \"O'CLOCK\""  }
                  ],
                  "table": {
                    "name": "表16时钟方位的读法",
                    "data": [
                      { "方位": "1点钟方位", "汉语读法": "一点钟方位", "英语读法": "WUN O'CLOCK" },
                      { "方位": "2点钟方位", "汉语读法": "两点钟方位", "英语读法": "TOO O'CLOCK" },
                      { "方位": "3点钟方位", "汉语读法": "三点钟方位", "英语读法": "TREE O'CLOCK" },
                      { "方位": "4点钟方位", "汉语读法": "四点钟方位", "英语读法": "FOW-er O'CLOCK" },
                      { "方位": "5点钟方位", "汉语读法": "五点钟方位", "英语读法": "FIFE O'CLOCK" } 
                    ]
                  }
                }
              ]
            },
            {
              "subsection_id": "1.4.3",
              "title": "字母的发音和读法",
              "parts": [
                {
                  "part_id": "1.4.3.1",
                  "title": "字母的标准发音",
                  "note": "下划线的部分应重读。",
                  "table": {
                    "name": "表17字母的标准发音",
                    "data": [
                      { "字母": "A", "单词": "Alpha", "发音": "AL FAH" },
                      { "字母": "B", "单词": "Bravo", "发音": "BRAH VOH" },
                      { "字母": "C", "单词": "Charlie", "发音": "CHAR LEE" },
                      { "字母": "D", "单词": "Delta", "发音": "DELL TAH" },
                      { "字母": "E", "单词": "Echo", "发音": "ECK OH" },
                      { "字母": "F", "单词": "Foxtrot", "发音": "FOKS TROT" },
                      { "字母": "G", "单词": "Golf", "发音": "GOLF" },
                      { "字母": "H", "单词": "Hotel", "发音": "HOH TELL" },
                      { "字母": "I", "单词": "India", "发音": "IN DEE AH" },
                      { "字母": "J", "单词": "Juliett", "发音": "JEW LEE ETT" },
                      { "字母": "K", "单词": "Kilo", "发音": "KEY LOH" },
                      { "字母": "L", "单词": "Lima", "发音": "LEE MAH" },
                      { "字母": "M", "单词": "Mike", "发音": "MIKE" },
                      { "字母": "N", "单词": "November", "发音": "NO VEM BER" },
                      { "字母": "O", "单词": "Oscar", "发音": "OSS CAH" },
                      { "字母": "P", "单词": "Papa", "发音": "PAH PAH" },
                      { "字母": "Q", "单词": "Quebec", "发音": "KEH BECK" },
                      { "字母": "R", "单词": "Romeo", "发音": "ROW ME OH" },
                      { "字母": "S", "单词": "Sierra", "发音": "SEE AIR RAH" },
                      { "字母": "T", "单词": "Tango", "发音": "TANG GO" },
                      { "字母": "U", "单词": "Uniform", "发音": "YOU NEE FORM" },
                      { "字母": "V", "单词": "Victor", "发音": "VIK TAH" },
                      { "字母": "W", "单词": "Whiskey", "发音": "WISS KEY" },
                      { "字母": "X", "单词": "X-ray", "发音": "ECKS RAY" },
                      { "字母": "Y", "单词": "Yankee", "发音": "YANG KEY" },
                      { "字母": "Z", "单词": "Zulu", "发音": "ZOO LOO" } 
                    ]
                  }
                },
                {
                  "part_id": "1.4.3.2",
                  "title": "机场识别代码的读法",
                  "rules": [
                    { "type": "机场识别代码", "汉语读法": "机场识别代码(按字母逐位读出)" , "英语读法": "机场识别代码(按字母逐位读出)"  }
                  ],
                  "table": {
                    "name": "表18 机场识别代码的读法",
                    "data": [
                      { "机场识别代码": "ZSPD", "读法": "ZULU SIERRA PAPA DELTA ZULU SIERRA PAPA DELTA" },
                      { "机场识别代码": "KMDQ", "读法": "KILO MIKE DELTA QUEBEC KILO MIKE DELTA QUEBEC" } 
                    ]
                  }
                },
                {
                  "part_id": "1.4.3.3",
                  "title": "全向信标台(VOR)和无方向信标台(NDB)的读法",
                  "rules": [
                    { "type": "VOR 和NDB", "汉语读法": "VOR 台和 NDB 台名称(按照航图中的地名读出)" , "英语读法": "VOR 台和 NDB 台名称(按照字母逐位读出该台识别代码)"  }
                  ],
                  "note": "对于VOR 和NDB导航台名称相同,不建在一起且距离较远时,应在台名后加NDB或VOR(例如:怀柔VOR 或怀柔 NDB)。",
                  "table": {
                    "name": "表19 VOR 和NDB的读法",
                    "data": [
                      { "全向/无方向信标台": "LKO", "汉语读法": "龙口", "英语读法": "LIMA KILO OSCAR" },
                      { "全向/无方向信标台": "VYK", "汉语读法": "大王庄", "英语读法": "VICTOR YANKEE KILO" },
                      { "全向/无方向信标台": "VM", "汉语读法": "石各庄", "英语读法": "VICTOR MIKE" },
                      { "全向/无方向信标台": "NXD", "汉语读法": "南浔", "英语读法": "NOVEMBER X-RAY DELTA" } 
                    ]
                  }
                },
                {
                  "part_id": "1.4.3.4",
                  "title": "航路点的读法",
                  "rules": [
                    { "type": "航路点是五个英文字母时", "汉语读法": "航路点名称(按照一个单词的英语发音读出)" , "英语读法": "航路点名称(按照一个单词的英语发音读出)"  },
                    { "type": "航路点是字母和数字组成时", "汉语读法": "字母+数字" , "英语读法": "字母+数字"  }
                  ],
                  "table": {
                    "name": "表20航路点的读法",
                    "data": [
                      { "航路点": "EKIVI", "汉语读法": "EKIVI", "英语读法": "EKIVI" },
                      { "航路点": "ANDIN", "汉语读法": "ANDIN", "英语读法": "ANDIN" },
                      { "航路点": "P23", "汉语读法": "PEE两三", "英语读法": "PAPA TOO TREE" },
                      { "航路点": "JN213", "汉语读法": "JULIETT NOVEMBER 两幺三", "英语读法": "JULIETT NOVEMBER WUN TOO TREE" } 
                    ]
                  }
                },
                {
                  "part_id": "1.4.3.5",
                  "title": "航路和标准进离场航线的读法",
                  "rules": [
                    { "type": "航路", "汉语读法": "航路代号+编码" , "英语读法": "航路代号+编码"  },
                    { "type": "标准进离场航线", "汉语读法": "重要点名称+航线代号" , "英语读法": "重要点名称+航线代号"  }
                  ],
                  "table": {
                    "name": "表21 航路和标准进离场航线的读法",
                    "data": [
                      { "航路、进离场航线": "G595", "汉语读法": "GOLF五九五", "英语读法": "GOLF FIFE NIN-er FIFE" },
                      { "航路、进离场航线": "J325", "汉语读法": "JULIETT三两五", "英语读法": "JULIETT TREE TOO FIFE" },
                      { "航路、进离场航线": "VYK-01A", "汉语读法": "大王庄洞幺 ALPHA", "英语读法": "VICTOR YANKEE KILO ZE-RO WUN ALPHA" },
                      { "航路、进离场航线": "NHW-2D", "汉语读法": "南汇两DELTA" , "英语读法": "NOVEMBER HOTEL WHISKEY TOO DELTA"  },
                      { "航路、进离场航线": "PEGSO-9Z", "汉语读法": "PEGSO九ZULU" , "英语读法": "PEGSO NIN-er ZULU"  }
                    ]
                  }
                }
              ]
            }
          ]
        },
        {
          "section_id": "1.5",
          "title": "标准单词和词组",
          "description": "下列标准单词和词组在通话中具有特定的含义:",
          "phrases": [
            {
              "phrase_en": "ACKNOWLEDGE",
              "phrase_zh": "请认收",
              "definition_en": "Let me know that you have received and understood this message.",
              "definition_zh": "向我表示你已经收到并理解该电报。" 
            },
            {
              "phrase_en": "AFFIRM",
              "phrase_zh": "是的",
              "definition_en": "Yes.",
              "definition_zh": "是的。" 
            },
            {
              "phrase_en": "APPROVED",
              "phrase_zh": "同意",
              "definition_en": "Permission for proposed action granted.",
              "definition_zh": "批准所申请的行动。" 
            },
            {
              "phrase_en": "BREAK",
              "phrase_zh": "还有",
              "definition_en": "I hereby indicate the separation between portions of the message, to be used where there is no clear distinction between the text and other portions of the message.",
              "definition_zh": "表示电报各部分的间断;用于电文与电报的其他部分无明显区别的情况。如果信息的各个部分之间没有明显的区别可以使用该词作为信息各部分之间的间隔标志。" 
            },
            {
              "phrase_en": "BREAK BREAK",
              "phrase_zh": "BREAK BREAK",
              "definition_en": "I hereby indicate the separation between messages transmitted to different aircraft in a very busy environment.",
              "definition_zh": "表示在非常繁忙的情况下,发布给不同航空器的电报之间的间断。" 
            },
            {
              "phrase_en": "CANCEL",
              "phrase_zh": "取消",
              "definition_en": "Annul the previously transmitted clearance.",
              "definition_zh": "废除此前所发布的许可。" 
            },
            {
              "phrase_en": "CHECK",
              "phrase_zh": "检查",
              "definition_en": "Examine a system or procedure, and no answer is normally expected.",
              "definition_zh": "检查系统或程序,且通常不需回答。" 
            },
            {
              "phrase_en": "CLEARED",
              "phrase_zh": "可以",
              "definition_en": "Authorized to proceed under the conditions specified.",
              "definition_zh": "批准按指定条件前行。" 
            },
            {
              "phrase_en": "CONFIRM",
              "phrase_zh": "证实",
              "definition_en": "Have I correctly received the following...? or Did you correctly received this message?",
              "definition_zh": "我是否已经准确地收到了……?或你是否已经准确地收到了本电报?" 
            },
            {
              "phrase_en": "CONTACT",
              "phrase_zh": "联系",
              "definition_en": "Establish radio contact with...",
              "definition_zh": "与......建立无线电联系。" 
            },
            {
              "phrase_en": "CORRECT",
              "phrase_zh": "正确",
              "definition_en": "That is correct.",
              "definition_zh": "你所讲的是正确的。" 
            },
            {
              "phrase_en": "CORRECTION",
              "phrase_zh": "更正",
              "definition_en": "An error has been made in this transmission or message indicated. The correct version is...",
              "definition_zh": "在本电报出了一个错误,或所发布的信息本身是错的,正确的内容应当是......" 
            },
            {
              "phrase_en": "DISREGARD",
              "phrase_zh": "作废",
              "definition_en": "Consider that transmission as not sent.",
              "definition_zh": "当作信息没有发送。" 
            },
            {
              "phrase_en": "GO AHEAD",
              "phrase_zh": "请讲",
              "definition_en": "Proceed with your message.",
              "definition_zh": "发你的电报。" 
            },
            {
              "phrase_en": "HOW DO YOU READ?",
              "phrase_zh": "你听我几个?",
              "definition_en": "What is the readability of my transmission?",
              "definition_zh": "我所发电报的清晰度如何?" 
            },
            {
              "phrase_en": "I SAY AGAIN",
              "phrase_zh": "我重复一遍",
              "definition_en": "I repeat for clarity or emphasis.",
              "definition_zh": "为了表示澄清或强调,我重复一遍。",
              "note": "当机组想要澄清或强调通话中的重要内容时,应重复该部分内容。" 
            },
            {
              "phrase_en": "IMMEDIATELY",
              "phrase_zh": "立即",
              "definition_en": "Used in commands that must be executed immediately, failure to perform the instruction would result in a serious flight conflict.",
              "definition_zh": "用在应马上执行的指令中,如果不执行指令将会造成严重的飞行冲突。" 
            },
            {
              "phrase_en": "MAINTAIN",
              "phrase_zh": "保持",
              "definition_en": "Continue in accordance with the condition(s) specified or in its literal sense, e.g. \"maintain VFR\".",
              "definition_zh": "按照指定的条件保持或字面意义保持,例如“保持目视飞行规则”。" 
            },
            {
              "phrase_en": "MONITOR",
              "phrase_zh": "守听",
              "definition_en": "Listen out on frequency.",
              "definition_zh": "收听或调定到某个频率。" 
            },
            {
              "phrase_en": "NEGATIVE",
              "phrase_zh": "错误、不同意或没有",
              "definition_en": "No or Permission not granted or That is not correct.",
              "definition_zh": "并非如此,或不允许,或不对。",
              "note": "空中交通管制员通常在航空器驾驶员复诵的指令或许可错误时使用“错误,我重复一遍(NEGATIVE, I SAY AGAIN)”,后跟正确的内容。" 
            },
            {
              "phrase_en": "OUT",
              "phrase_zh": "完毕",
              "definition_en": "This exchange of transmissions is ended and no response is expected.",
              "definition_zh": "本次通话已经结束,并且你不需做出回答。",
              "note": "The word \"OUT\" is not normally used in VHF communications." 
            },
            {
              "phrase_en": "OVER",
              "phrase_zh": "请回答",
              "definition_en": "My transmission is ended and I expect a response from you.",
              "definition_zh": "我发话完毕,并希望你回答。",
              "note": "The word \"OVER\" is not normally used in VHF communications." 
            },
            {
              "phrase_en": "READ BACK",
              "phrase_zh": "复诵",
              "definition_en": "Report all, or the specified part, of this message back to me exactly as received.",
              "definition_zh": "请向我准确地重复本电报所有或部分内容。" 
            },
            {
              "phrase_en": "RECLEARED",
              "phrase_zh": "重新许可",
              "definition_en": "A change has been made to your last clearance and this new clearance supersedes your previous clearance or part thereof.",
              "definition_zh": "此前发布给你的许可已经变更,这一新的许可将取代刚才的许可或其中部分内容。" 
            },
            {
              "phrase_en": "REPORT",
              "phrase_zh": "报告",
              "definition_en": "Pass me the following information.",
              "definition_zh": "向我传达下列情报。" 
            },
            {
              "phrase_en": "REQUEST",
              "phrase_zh": "申请",
              "definition_en": "I should like to know..., or I wish to obtain...",
              "definition_zh": "我希望知道……………或我希望得到......." 
            },
            {
              "phrase_en": "ROGER",
              "phrase_zh": "收到",
              "definition_en": "I have received all of your last transmission.",
              "definition_zh": "我已经收到了你刚才的发话。",
              "note": "Under no circumstances to be used in reply to a question requiring \"READ BACK\" or a direct answer in the affirmative (AFFIRM) or negative (NEGATIVE). 要求复诵或者要求用“是的”或“没有”来作答时,切不可使用。" 
            },
            {
              "phrase_en": "SAY AGAIN",
              "phrase_zh": "重复一遍",
              "definition_en": "Repeat all, or the following part, of your last transmission.",
              "definition_zh": "请重复你刚才发话的所有内容或下列部分————当对收到的信息存疑时。",
              "note": "还可以使用“重复一遍...... (SAY AGAIN...)”、“重复一遍......之前的内容(SAY AGAIN ALL BEFORE...)”、“重复一遍......之后的内容(SAY AGAIN ALL AFTER...)”或“重复一遍......和......之间的内容(SAY AGAIN ALL BETWEEN...AND...)\"。" 
            },
            {
              "phrase_en": "SPEAK SLOWER",
              "phrase_zh": "讲慢点",
              "definition_en": "Reduce your rate of speech.",
              "definition_zh": "请降低你的语速。" 
            },
            {
              "phrase_en": "STANDBY",
              "phrase_zh": "稍等",
              "definition_en": "Wait and I will call you.",
              "definition_zh": "请等候,我将呼叫你。" 
            },
            {
              "phrase_en": "VERIFY",
              "phrase_zh": "核实",
              "definition_en": "Check and confirm with originator.",
              "definition_zh": "与发电方进行检查和确认。" 
            },
            {
              "phrase_en": "UNABLE / UNABLE TO COMPLY",
              "phrase_zh": "无法执行",
              "definition_en": "I cannot comply with your request, instruction, or clearance.",
              "definition_zh": "我无法执行你的申请、指令或许可。",
              "note": "UNABLE 后面通常要跟原因。 如果对航空器驾驶员执行管制许可或指令有疑问,空中交通管制员在许可或指令后可加短语“如果不行,通知我(IF UNABLE, ADVISE)”。 在任何时候,航空器驾驶员如果不能执行接收到的管制许可或指令,应使用短语“无法执行(UNABLE/NEGATIVE)”,并告知原因。" 
            },
            {
              "phrase_en": "WILCO",
              "phrase_zh": "照办",
              "definition_en": "Abbreviation for \"will comply\", I understand your message and will comply with it.",
              "definition_zh": "“将照办”的缩略语,我已经明白了你的电报并将按照该电报执行。" 
            },
            {
              "phrase_en": "WORDS TWICE",
              "phrase_zh": "讲两遍",
              "definition_en": "As a request: Communication is difficult. Please send every word or group of words twice. As information: Since communication is difficult, every word or group of words in this message will be sent twice.",
              "definition_zh": "对于申请来说: 通信困难,请把每个词(组)发送两遍。对于信息来说: 由于通信困难,该电报的每个词(组)将被发送两遍。" 
            }
          ]
        },
        {
          "section_id": "1.6",
          "title": "呼号的读法",
          "subsections": [
            {
              "subsection_id": "1.6.1",
              "title": "管制单位的呼号",
              "parts": [
                {
                  "part_id": "1.6.1.1",
                  "title": "管制单位的名称",
                  "description": "管制单位的名称由管制单位所在地的名字和后缀组成。后缀表明单位类型或所能提供的服务。",
                  "table": {
                    "name": "表22 管制单位呼号的读法",
                    "data": [
                      { "管制单位或服务": "区域管制中心 (Area control center)", "后缀汉语简呼": "区域", "后缀英语简呼": "CONTROL" },
                      { "管制单位或服务": "进近管制 (Approach control)", "后缀汉语简呼": "进近", "后缀英语简呼": "APPROACH" },
                      { "管制单位或服务": "进场雷达管制 (Approach control radar arrival)", "后缀汉语简呼": "进场", "后缀英语简呼": "ARRIVAL" },
                      { "管制单位或服务": "离场雷达管制 (Approach control radar departure)", "后缀汉语简呼": "离场", "后缀英语简呼": "DEPARTURE" },
                      { "管制单位或服务": "机场管制 (Aerodrome control)", "后缀汉语简呼": "塔台", "后缀英语简呼": "TOWER" },
                      { "管制单位或服务": "地面活动管制 (Surface movement control)", "后缀汉语简呼": "地面", "后缀英语简呼": "GROUND" },
                      { "管制单位或服务": "放行许可发布 (Clearance delivery)", "后缀汉语简呼": "放行", "后缀英语简呼": "DELIVERY" },
                      { "管制单位或服务": "飞行服务/航空情报服务 (Flight information service)", "后缀汉语简呼": "飞服", "后缀英语简呼": "INFORMATION" },
                      { "管制单位或服务": "精密进近雷达 (Precision approach radar)", "后缀汉语简呼": "精密", "后缀英语简呼": "PRECISION" },
                      { "管制单位或服务": "机坪管制/管理服务 (Apron control/management service)", "后缀汉语简呼": "机坪", "后缀英语简呼": "APRON" },
                      { "管制单位或服务": "公司签派 (Company dispatch)", "后缀汉语简呼": "签派", "后缀英语简呼": "DISPATCH" } 
                    ]
                  }
                },
                {
                  "part_id": "1.6.1.2",
                  "title": "管制单位的简呼",
                  "description": "航空器和管制单位初次联系时,应呼航空器和管制单位的全称。在建立双向联系以后的各次通话中,可以简呼管制单位服务类型或地名。",
                  "table": {
                    "name": "表23 管制单位的简呼",
                    "data": [
                      { "管制单位名称": "西安区域管制中心", "汉语简呼": "西安区域或西安", "英语简呼": "XI'AN CONTROL or XI'AN" },
                      { "管制单位名称": "济南进近管制室", "汉语简呼": "济南进近或进近", "英语简呼": "JINAN APPROACH or APPROACH" },
                      { "管制单位名称": "广州塔台管制室", "汉语简呼": "白云塔台或塔台", "英语简呼": "BAIYUN TOWER or TOWER" } 
                    ]
                  }
                }
              ]
            },
            {
              "subsection_id": "1.6.2",
              "title": "航空器的呼号及注意事项",
              "parts": [
                {
                  "part_id": "1.6.2.1",
                  "title": "航空器的呼号",
                  "description": "航空器的呼号有以下三种形式:",
                  "types": [
                    {
                      "type_id": "a",
                      "description": "航空器的注册号:注册号字母和数字应按照字母和数字的标准发音逐位读出。有时航空器制造厂商或航空器机型名称通常作为注册号字母的前缀。",
                      "examples": [
                        "G-ABCD GOLF ALPHA BRAVO CHARLIE DELTA (英汉读法相同)",
                        "Cessna G-ABCD 塞斯纳 GOLF ALPHA BRAVO CHARLIE DELTA (汉语读法)",
                        "Cessna GOLF ALPHA BRAVO CHARLIE DELTA(英语读法)" 
                      ]
                    },
                    {
                      "type_id": "b",
                      "description": "航空器运营人的无线电呼号加航空器注册号的最后四位字母。",
                      "table": {
                        "name": "表24航空器的注册号",
                        "data": [
                          { "航空器的呼号": "CES BHWC", "汉语读法": "东方BRAVO HOTEL WHISKEY CHARLE", "英语读法": "CHINA EASTERN BRAVO HOTEL WHISKEY CHARLE" } 
                        ]
                      }
                    },
                    {
                      "type_id": "c",
                      "description": "航空器运营人的无线电呼号加航班号。",
                      "table": {
                        "name": "表25 航空器的呼号",
                        "data": [
                          { "航空器的呼号": "CCA998A", "汉语读法": "国际九九八 ALPHA", "英语读法": "AIR CHINA NIN-er NIN-er AIT ALPHA" },
                          { "航空器的呼号": "CES72AC", "汉语读法": "东方拐两 ALPHA CHARLIE", "英语读法": "CHINA EASTERN SEV-en TOO ALPHA CHARLIE" },
                          { "航空器的呼号": "CCA1201", "汉语读法": "国际幺两洞幺", "英语读法": "AIR CHINA WUN TOO ZE-RO WUN" } 
                        ]
                      }
                    }
                  ]
                },
                {
                  "part_id": "1.6.2.2",
                  "title": "呼号的注意事项",
                  "notes": [
                    "在建立满意的双向通信联系之后,在不产生混淆的情况下,航空器的呼号可缩减。",
                    "当由于存在相似的呼号而可能产生混淆时,航空器在飞行中可能需要改变或更换呼号。",
                    "如果航空器的尾流等级为重型,机组在首次呼叫管制单位时,应在呼号后加上“重型”(HEAVY);如果航空器是超大型飞机如A380,机组在首次呼叫管制单位时,应在呼号后加上“SUPER”(中英文通话相同)。" 
                  ]
                }
              ]
            }
          ]
        },
        {
          "section_id": "1.7",
          "title": "气象的读法",
          "subsections": [
            {
              "subsection_id": "1.7.1",
              "title": "风向风速",
              "structures": [
                {
                  "type": "地面风",
                  "chinese": "“地面风”+三位数,数值+“米秒”",
                  "english": "\"SURFACE WIND\" + three digits + \"DEGREES\", number + \"METER(S) PER SECOND\"" 
                },
                {
                  "type": "高空风",
                  "chinese": "“风向”+三位数,“风速”+数值+“米秒”",
                  "english": "\"WIND\" + three digits + \"DEGREES\", number + \"METER(S) PER SECOND\"" 
                },
                {
                  "type": "高度特定风",
                  "chinese": "“高度”+数值,“风向”+三位数,“风速”+数字+“公里小时(或节)”",
                  "english": "\"WIND AT\" + level, three digits + \"DEGREES\", number + \"KILOMETERS PER HOUR (or KNOTS)\"" 
                }
              ],
              "notes": [
                "风向量除以具体风向、风速数值表示外,还可根据实际情况表述为“阵风(GUSTING)\"+数值(number)、“静风(WIND CALM)”或“风向不定(WIND VARIABLE)”等。",
                "风是用平均风向风速以及风向风速的重大变化来表达的。" 
              ]
            },
            {
              "subsection_id": "1.7.2",
              "title": "能见度以及跑道视程",
              "structures": [
                {
                  "type": "能见度",
                  "chinese": "能见度”+距离+单位",
                  "english": "\"VISIBILITY\" + distance + units" 
                },
                {
                  "type": "跑道视程 (RVR)",
                  "chinese": "“跑道”+号码+“跑道视程(或RVR)”+距离+单位",
                  "english": "\"RVR RUNWAY\" + number + distance + units" 
                },
                {
                  "type": "RVR不可用",
                  "chinese": "“跑道”+号码+“跑道视程空缺(或没有报告)”",
                  "english": "\"RVR RUNWAY\" + number + \"NOT AVAILABLE (or NOT REPORTED)\"" 
                },
                {
                  "type": "多点RVR",
                  "note": "此处适用于多点观测跑道视程的情况。",
                  "chinese": "“跑道”+号码+“跑道视程”,“接地段”+距离+单位,“中间段”+距离+单位,“停止端”+距离+单位",
                  "english": "\"RVR RUNWAY\" + number, \"TOUCHDOWN\" + distance + units, \"MIDPOINT\" + distance + units, \"STOP END\" + distance + units" 
                },
                {
                  "type": "多点RVR(部分不可用)",
                  "note": "此处包含无法获得的其中某一段的跑道视程情报。",
                  "chinese": "“跑道”+号码+“跑道视程”,“接地段”+距离+单位,“中间段空缺”,“停止端”+距离+单位",
                  "english": "\"RVR RUNWAY\" + number, \"TOUCHDOWN\" + distance + units, \"MIDPOINT NOT AVAILABLE\", \"STOP END\" + distance + units" 
                }
              ]
            },
            {
              "subsection_id": "1.7.3",
              "title": "天气以及云量",
              "structures": [
                {
                  "type": "当前天气",
                  "chinese": "“当前天气”+详细内容",
                  "english": "\"PRESENT WEATHER\" + details" 
                },
                {
                  "type": "特殊天气报告",
                  "chinese": "航空器类型+时间+“报告”,区域(或高度)+(“云中”)+“严重(或中度,轻度)结冰(或颠簸)”",
                  "english": "aircraft type + \"REPORTED SEVERE (or MODERATE, LIGHT) ICING (or TURBULENCE)\" + (\"IN CLOUD\") + area (or level) + time" 
                },
                {
                  "type": "飞行条件",
                  "note": "飞行员按规定报告目前飞机外部的大气条件,包括风、气温、云及气象因素如结冰、颠簸等。",
                  "chinese": "报告飞行条件",
                  "english": "REPORT FLIGHT CONDITIONS" 
                },
                {
                  "type": "云量",
                  "note": "云量也可以按照“八分之几(OCTAS)”发布。",
                  "terms": "碧空(SKY CLEAR)、少云(FEW)、疏云(SCT)、多云(BKN)、阴天(OVC)" 
                },
                {
                  "type": "天气良好",
                  "chinese": "天气良好",
                  "english": "CAVOK (CAV-O-KAY)" 
                }
              ]
            },
            {
              "subsection_id": "1.7.4",
              "title": "温度以及修正海压",
              "structures": [
                {
                  "type": "温度和露点",
                  "note": "温度和露点应区分摄氏度(DEGREES CENTIGRADE)和华氏度(DEGREES FAHRENHEIT)。",
                  "chinese": "“温度(零下)”+数值+“摄氏(华氏)度”,“露点(零下)”+数值+“摄氏(华氏)度”",
                  "english": "\"TEMPERATURE (MINUS)\" + number + \"DEGREES CENTIGRADE (FAHRENHEIT)”, “DEW-POINT (MINUS)\" + number+ \"DEGREES CENTIGRADE (FAHRENHEIT)\"" 
                },
                {
                  "type": "气压",
                  "chinese": "“修正海压(或,场压)”+数值+(单位)",
                  "english": "\"QNH (or QFE)\" + number + (units)" 
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

module.exports = {
  landAirCommunicationsData
};