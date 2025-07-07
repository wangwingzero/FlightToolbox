const aviationPhraseology = {
  "generalInfo": {
  },
  "phraseologyRequirements": {
    "overview": {
      "description": "空中交通无线电通话用语应用于空中交通服务单位与航空器之间的话音联络。它有自己特殊的发音规则,语言简洁、严谨,经过严格的缩减程序,通常为祈使句。",
      "languageAndTime": "陆空通话中应使用汉语普通话或英语,时间采用UTC(协调世界时)。"
    },
    "communicationStructure": [
      {
        "scenario": "空管首次联系",
        "party": "空中交通管制员",
        "structure_zh": "对方呼号 + 己方呼号 + 通话内容"
      },
      {
        "scenario": "空管后续通话",
        "party": "空中交通管制员",
        "structure_zh": "对方呼号 + 通话内容"
      },
      {
        "scenario": "驾驶员通话",
        "party": "航空器驾驶员",
        "structure_zh": "*对方呼号 + 己方完整呼号 + 通话内容",
        "note": "航空器驾驶员应以完整呼号终止复诵。"
      },
      {
        "scenario": "空管确认复诵",
        "party": "空中交通管制员",
        "structure_zh": "对方呼号 + “(复诵)正确”",
        "structure_en": "aircraft call sign + “(READ BACK) CORRECT”"
      }
    ],
    "communicationTechniques": [
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
  },
  "pronunciation": {
    "numbers": {
      "standard": {
        "note": "黑体或大写部分应重读。",
        "table": [
          { "digit": "0", "pronunciation_zh": "洞", "pronunciation_en": "ZE-RO" },
          { "digit": "1", "pronunciation_zh": "幺", "pronunciation_en": "WUN" },
          { "digit": "2", "pronunciation_zh": "两", "pronunciation_en": "TOO" },
          { "digit": "3", "pronunciation_zh": "三", "pronunciation_en": "TREE" },
          { "digit": "4", "pronunciation_zh": "四", "pronunciation_en": "FOW-er" },
          { "digit": "5", "pronunciation_zh": "五", "pronunciation_en": "FIFE" },
          { "digit": "6", "pronunciation_zh": "六", "pronunciation_en": "SIX" },
          { "digit": "7", "pronunciation_zh": "拐", "pronunciation_en": "SEV-en" },
          { "digit": "8", "pronunciation_zh": "八", "pronunciation_en": "AIT" },
          { "digit": "9", "pronunciation_zh": "九", "pronunciation_en": "NIN-er" },
          { "digit": ".", "pronunciation_zh": "点", "pronunciation_en": "DAY-SEE-MAL / POINT (point只用于mach)" },
          { "digit": "100", "pronunciation_zh": "百", "pronunciation_en": "HUN-dred" },
          { "digit": "1000", "pronunciation_zh": "千", "pronunciation_en": "TOU-SAND" }
        ]
      },
      "combinations": {
        "rule_zh": "数字组合的汉语读法一般根据数字的汉语发音按顺序逐位读出;整百、整千或整千整百组合的数字也可读出数字,后面加上百、千或千百。基于汉语的发音习惯,1位数或者2位数的数值中含有0,1,2,7时,按数字的标准读法分别读出。其它的数值按照日常读法读出。",
        "rule_en": "数字组合的英语读法一般根据数字的英语发音按顺序逐位读出;整百、整千或整千整百组合的数字通常读出数字,后面加上百、千或千百的英语标准读法。",
        "examples": [
          { "number": "10", "reading_zh": "幺洞", "reading_en": "WUN ZE-RO" },
          { "number": "34", "reading_zh": "三十四", "reading_en": "TREE FOW-er" },
          { "number": "47", "reading_zh": "四拐", "reading_en": "FOW-er SEV-en" },
          { "number": "300", "reading_zh": "三百/三洞洞", "reading_en": "TREE HUN-dred/TREE ZE-RO ZE-RO" },
          { "number": "8000", "reading_zh": "八千", "reading_en": "AIT TOU-SAND" },
          { "number": "4500", "reading_zh": "四千五百", "reading_en": "FOW-er TOU-SAND FIFE HUN-dred" },
          { "number": "360", "reading_zh": "三六洞", "reading_en": "TREE SIX ZE-RO" },
          { "number": "7141", "reading_zh": "拐幺四幺", "reading_en": "SEV-en WUN FOW-er WUN" },
          { "number": "36089", "reading_zh": "三六洞八九", "reading_en": "TREE SIX ZE-RO AIT NIN-er" }
        ]
      }
    },
    "specialReadings": {
      "altitude": {
        "metricSystem": {
          "description": "对于符合我国高度层配备标准的高度,其读法标准见下表。",
          "note": "RVSM 空域高度范围从8900米到12500米。",
          "levels": [
            { "altitude": "600m", "reading_zh": "六百", "reading_en": "SIX HUN-dred METERS" },
            { "altitude": "900m", "reading_zh": "九百", "reading_en": "NIN-er HUN-dred METERS" },
            { "altitude": "1200m", "reading_zh": "幺两", "reading_en": "WUN TOU-SAND TOO HUN-dred METERS" },
            { "altitude": "1500m", "reading_zh": "幺五", "reading_en": "WUN TOU-SAND FIFE HUN-dred METERS" },
            { "altitude": "1800m", "reading_zh": "幺八", "reading_en": "WUN TOU-SAND AIT HUN-dred METERS" },
            { "altitude": "2100m", "reading_zh": "两幺", "reading_en": "TOO TOU-SAND WUN HUN-dred METERS" },
            { "altitude": "2400m", "reading_zh": "两千四", "reading_en": "TOO TOU-SAND FOW-er HUN-dred METERS" },
            { "altitude": "2700m", "reading_zh": "两拐", "reading_en": "TOO TOU-SAND SEV-en HUN-dred METERS" },
            { "altitude": "3000m", "reading_zh": "三千", "reading_en": "TREE TOU-SAND METERS" },
            { "altitude": "3300m", "reading_zh": "三千三", "reading_en": "TREE TOU-SAND TREE HUN-dred METERS" },
            { "altitude": "3600m", "reading_zh": "三千六", "reading_en": "TREE TOU-SAND SIX HUN-dred METERS" },
            { "altitude": "3900m", "reading_zh": "三千九", "reading_en": "TREE TOU-SAND NIN-er HUN-dred METERS" },
            { "altitude": "4200m", "reading_zh": "四两", "reading_en": "FOW-er TOU-SAND TOO HUN-dred METERS" },
            { "altitude": "4500m", "reading_zh": "四千五", "reading_en": "FOW-er TOU-SAND FIFE HUN-dred METERS" },
            { "altitude": "4800m", "reading_zh": "四千八", "reading_en": "FOW-er TOU-SAND AIT HUN-dred METERS" },
            { "altitude": "5100m", "reading_zh": "五幺", "reading_en": "FIFE TOU-SAND WUN HUN-dred METERS" },
            { "altitude": "5400m", "reading_zh": "五千四", "reading_en": "FIFE TOU-SAND FOW-er HUN-dred METERS" },
            { "altitude": "5700m", "reading_zh": "五拐", "reading_en": "FIFE TOU-SAND SEV-en HUN-dred METERS" },
            { "altitude": "6000m", "reading_zh": "六千", "reading_en": "SIX TOU-SAND METERS" },
            { "altitude": "6300m", "reading_zh": "六千三", "reading_en": "SIX TOU-SAND TREE HUN-dred METERS" },
            { "altitude": "6600m", "reading_zh": "六千六", "reading_en": "SIX TOU-SAND SIX HUN-dred METERS" },
            { "altitude": "6900m", "reading_zh": "六千九", "reading_en": "SIX TOU-SAND NIN-er HUN-dred METERS" },
            { "altitude": "7200m", "reading_zh": "拐两", "reading_en": "SEV-en TOU-SAND TOO HUN-dred METERS" },
            { "altitude": "7500m", "reading_zh": "拐五", "reading_en": "SEV-en TOU-SAND FIFE HUN-dred METERS" },
            { "altitude": "7800m", "reading_zh": "拐八", "reading_en": "SEV-en TOU-SAND AIT HUN-dred METERS" },
            { "altitude": "8100m", "reading_zh": "八幺", "reading_en": "AIT TOU-SAND WUN HUN-dred METERS" },
            { "altitude": "8400m", "reading_zh": "八千四", "reading_en": "AIT TOU-SAND FOW-er HUN-dred METERS" },
            { "altitude": "8900m", "reading_zh": "八千九", "reading_en": "AIT TOU-SAND NIN-er HUN-dred METERS" },
            { "altitude": "9200m", "reading_zh": "九千二", "reading_en": "NIN-er TOU-SAND TOO HUN-dred METERS" },
            { "altitude": "9500m", "reading_zh": "九千五", "reading_en": "NIN-er TOU-SAND FIFE HUN-dred METERS" },
            { "altitude": "9800m", "reading_zh": "九千八", "reading_en": "NIN-er TOU-SAND AIT HUN-dred METERS" },
            { "altitude": "10100m", "reading_zh": "幺洞幺", "reading_en": "WUN ZE-RO TOU-SAND WUN HUN-dred METERS" },
            { "altitude": "10400m", "reading_zh": "幺洞四", "reading_en": "WUN ZE-RO TOU-SAND FOW-er HUN-dred METERS" },
            { "altitude": "10700m", "reading_zh": "幺洞拐", "reading_en": "WUN ZE-RO TOU-SAND SEV-en HUN-dred METERS" },
            { "altitude": "11000m", "reading_zh": "幺幺洞", "reading_en": "WUN WUN TOU-SAND METERS" },
            { "altitude": "11300m", "reading_zh": "幺幺三", "reading_en": "WUN WUN TOU-SAND TREE HUN-dred METERS" },
            { "altitude": "11600m", "reading_zh": "幺幺六", "reading_en": "WUN WUN TOU-SAND SIX HUN-dred METERS" },
            { "altitude": "11900m", "reading_zh": "幺幺九", "reading_en": "WUN WUN TOU-SAND NIN-er HUN-dred METERS" },
            { "altitude": "12200m", "reading_zh": "幺两两", "reading_en": "WUN TOO TOU-SAND TOO HUN-dred METERS" },
            { "altitude": "12500m", "reading_zh": "幺两五", "reading_en": "WUN TOO TOU-SAND FIFE HUN-dred METERS" },
            { "altitude": "13100m", "reading_zh": "幺三幺", "reading_en": "WUN TREE TOU-SAND WUN HUN-dred METERS" },
            { "altitude": "13700m", "reading_zh": "幺三拐", "reading_en": "WUN TREE TOU-SAND SEV-en HUN-dred METERS" },
            { "altitude": "14300m", "reading_zh": "幺四三", "reading_en": "WUN FOW-er TOU-SAND TREE HUN-dred METERS" },
            { "altitude": "14900m", "reading_zh": "幺四九", "reading_en": "WUN FOW-er TOU-SAND NIN-er HUN-dred METERS" },
            { "altitude": "15500m", "reading_zh": "幺五五", "reading_en": "WUN FIFE TOU-SAND FIFE HUN-dred METERS" }
          ]
        },
        "imperialSystem": {
          "description_zh": "对于符合英制高度层配备标准的高度,使用汉语读法时,在“高度层”后逐位读出万位、千位和百位上数字:高度层低于10000英尺时,读作X“千英尺”或X“千X“百英尺”。",
          "description_en": "使用英语读法时,按照国际民航组织的发音,在“FLIGHT LEVEL”后逐位读出万位、千位和百位上的数字:高度层低于10000英尺时,读作 X TOUSAND FEET, X-TOUSAND X-HUNDRED FEET。",
          "examples": [
            { "altitude": "3000ft", "reading_zh": "三千英尺", "reading_en": "TREE TOUSAND FEET" },
            { "altitude": "5900ft", "reading_zh": "五千九百英尺", "reading_en": "FIFE TOUSAND NIN-er HUN-dred FEET" },
            { "altitude": "12000ft", "reading_zh": "高度层幺两洞", "reading_en": "FLIGHT LEVEL WUN TOO ZERO" },
            { "altitude": "36000ft", "reading_zh": "高度层三六洞", "reading_en": "FLIGHT LEVEL TREE SIX ZERO" }
          ]
        },
        "nonStandardAltitude": {
          "description": "对于不符合我国高度层配备标准的高度,按照数字组合的一般读法读出。鉴于其多应用于进近、起落航线等情况,为便于理解,避免混淆,中文读法应全读,即高度后面读出“米”。",
          "examples": [
            { "altitude": "200m/QNH", "reading_zh": "修正海压两百米", "reading_en": "TOO HUN-dred METERS ON QNH" },
            { "altitude": "350m/QFE", "reading_zh": "场压三百五十米", "reading_en": "TREE FIFE ZE-RO METERS ON QFE" },
            { "altitude": "700m/QNH", "reading_zh": "修正海压七百米", "reading_en": "SEV-en HUN-dred METERS ON QNH" },
            { "altitude": "2150m/QNE", "reading_zh": "标准气压两千一百五十米", "reading_en": "TOO WUN FIFE ZE-RO METERS ON STANDARD" }
          ]
        }
      },
      "altimeterSettings": {
        "description": "当高度指令涉及气压基准面转换时,空管会指明新的气压基准面数值,以后可省略。驾驶员应复诵指定的气压基准面(数值)。",
        "rules": [
          {
            "type": "Standard Pressure (1013.2 hPa)",
            "reading_zh": "“标准气压”+高度层",
            "reading_en": "flight level + “ON STANDARD”"
          },
          {
            "type": "QNH (Altimeter setting)",
            "reading_zh": "“修正海压”+高度, “修正海压”+修正海压数值",
            "reading_en": "altitude + “ON QNH”, QNH number"
          },
          {
            "type": "QFE (Field elevation pressure)",
            "reading_zh": "“场压”+高, “场压”+场压数值",
            "reading_en": "height + “ON QFE”, QFE number"
          }
        ]
      },
      "mda_dh": [
        {
          "type": "Minimum Descent Altitude/Height",
          "reading_zh": "“最低下降高(高度)” + 高度数字 + 单位",
          "reading_en": "“MINIMUN DESCENT HEIGHT (ALTITUDE)” + number + units"
        },
        {
          "type": "Decision Altitude/Height",
          "reading_zh": "“决断高(高度)” + 高度数字 + 单位",
          "reading_en": "“DECISION HEIGHT (ALTITUDE)” + number + units"
        }
      ],
      "airportElevation": {
        "reading_zh": "“标高”+高度数字+单位",
        "reading_en": "“ELEVATION” + number + unit"
      },
      "time": {
        "note": "通报时间一般默认为协调世界时(UTC),如通报时间为北京时(Beijing time),应特殊说明。汉语读法一般只读出分,必要时读出小时和分。英语读法按照数字逐位读出。",
        "examples": [
          { "time": "09:00 UTC", "reading_zh": "洞九洞洞, 或 整点", "reading_en": "ZE-RO NIN-er ZE-RO ZE-RO UTC, or ZE-RO ZE-RO UTC" },
          { "time": "15:21 北京时", "reading_zh": "北京时两幺, 或 北京时么五两幺", "reading_en": "TOO WUN Beijing time, or WUN FIFE TOO WUN Beijing time" },
          { "time": "21:49 UTC", "reading_zh": "四九, 或 两幺四九", "reading_en": "FOW-er NIN-er UTC, or TOO WUN FOW-er NIN-er UTC" }
        ]
      },
      "pressure": {
        "rules_zh": "“场压(修正海压)”+气压数值(数字应逐位读出)",
        "rules_en": "“QFE (QNH)” + 气压数值(数字应逐位读出)",
        "examples": [
          { "pressure": "QFE 1002", "reading_zh": "场压幺洞洞两", "reading_en": "QFE WUN ZE-RO ZE-RO TOO" },
          { "pressure": "QNH 1011", "reading_zh": "修正海压幺洞幺幺", "reading_en": "QNH WUN ZE-RO WUN WUN" }
        ]
      },
      "heading": {
        "rules_zh": "“航向(航迹)”+三位数数值(数值应逐位读出)",
        "rules_en": "“HEADING (TRACK)” + three digits",
        "examples": [
          { "heading": "030", "reading_zh": "航向(航迹)洞三洞", "reading_en": "HEADING (TRACK) ZE-RO TREE ZE-RO" },
          { "heading": "120", "reading_zh": "航向(航迹)幺两洞", "reading_en": "HEADING (TRACK) WUN TOO ZE-RO" },
          { "heading": "360", "reading_zh": "航向(航迹)三六洞", "reading_en": "HEADING (TRACK) TREE SIX ZE-RO" },
          { "heading": "300", "reading_zh": "航向(航迹)三洞洞", "reading_en": "HEADING (TRACK) TREE ZE-RO ZE-RO" }
        ]
      },
      "speed": {
        "rules": [
          { "unit": "knots", "reading_zh": "“速度”+速度数值(逐位读出,后不加单位)", "reading_en": "速度数值(逐位读出) + “KNOTS”" },
          { "unit": "km/h", "reading_zh": "速度数值(按数字组合的一般读法)+“公里小时”", "reading_en": "速度数值(按数字组合的一般读法) + “KILOMETERS PER HOUR”" },
          { "unit": "Mach", "reading_zh": "“马赫数点”+XX, 或 “马赫数”+X+“点”+XX", "reading_en": "“MACH NUMBER POINT”+XX, 或 “MACH NUMBER” + X + “POINT” + XX" },
          { "unit": "m/s", "reading_zh": "速度数值(按数字组合的一般读法)+“米秒”", "reading_en": "速度数值(按数字组合的一般读法) + “METERS PER SECOND”" }
        ],
        "examples": [
          { "speed": "180 knots", "reading_zh": "速度幺八洞", "reading_en": "WUN AIT ZE-RO KNOTS" },
          { "speed": "350km/h", "reading_zh": "三百五十公里小时", "reading_en": "TREE FIFE ZE-RO KILOMETERS PER HOUR" },
          { "speed": "M0.85", "reading_zh": "马赫数点八五", "reading_en": "MACH NUMBER POINT AIT FIFE" },
          { "speed": "M1.15", "reading_zh": "马赫数幺点幺五", "reading_en": "MACH NUMBER WUN POINT WUN FIFE" },
          { "speed": "3m/s", "reading_zh": "三米秒", "reading_en": "TREE METERS PER SECOND" }
        ]
      },
      "frequency": {
        "rules_zh": "频率数值(逐位读出)",
        "rules_en": "频率数值(逐位读出)",
        "note": "高频应另读出单位, 即: “高频”+数值 (中文) 或 number + “KILOHERTZ” (英文)",
        "examples": [
          { "frequency": "130.000 MHz", "reading_zh": "幺三洞", "reading_en": "WUN TREE ZE-RO DAY-SEE-MAL" },
          { "frequency": "121.5 MHz", "reading_zh": "幺两幺点五", "reading_en": "WUN TOO WUN DAY-SEE-MAL FIFE" },
          { "frequency": "122.75 MHz", "reading_zh": "幺两两点拐五", "reading_en": "WUN TOO TOO DAY-SEE-MAL SEV-en FIFE" },
          { "frequency": "118.025 MHz", "reading_zh": "幺幺八点洞两五", "reading_en": "WUN WUN AIT DAY-SEE-MAL ZE-RO TOO FIFE" },
          { "frequency": "6565 KHz", "reading_zh": "高频六五六五", "reading_en": "SIX FIFE SIX FIFE KILOHERTZ" }
        ]
      },
      "runway": {
        "rules_zh": "“跑道”+号码(逐位读出)+(“右”/“左”/“中”)",
        "rules_en": "“RUNWAY”+跑道号码(逐位读出)+ (“RIGHT”/“LEFT”/“CENTER”)",
        "note": "跑道号码后的英文字母 R、L、C 分别表示右(RIGHT)、左(LEFT)、中(CENTER)。",
        "examples": [
          { "runway": "13", "reading_zh": "跑道幺三", "reading_en": "RUNWAY WUN TREE" },
          { "runway": "07L", "reading_zh": "跑道洞拐左", "reading_en": "RUNWAY ZE-RO SEV-en LEFT" },
          { "runway": "18C", "reading_zh": "跑道幺八中", "reading_en": "RUNWAY WUN AIT CENTER" },
          { "runway": "36R", "reading_zh": "跑道三六右", "reading_en": "RUNWAY TREE SIX RIGHT" }
        ]
      },
      "distance": {
        "rules_zh": "距离数值(按数字组合的一般读法)+单位",
        "rules_en": "距离数值(按数字组合的一般读法)+ units",
        "examples": [
          { "distance": "20 miles", "reading_zh": "两洞海里", "reading_en": "TOO ZE-RO MILES" },
          { "distance": "16 miles", "reading_zh": "幺六海里", "reading_en": "WUN SIX MILES" },
          { "distance": "56km", "reading_zh": "五十六公里", "reading_en": "FIFE SIX KILOMETERS" },
          { "distance": "750m", "reading_zh": "七百五十米", "reading_en": "SEV-en FIFE ZE-RO METERS" },
          { "distance": "130m", "reading_zh": "一百三十米", "reading_en": "WUN TREE ZE-RO METERS" },
          { "distance": "7100m", "reading_zh": "七千一百米", "reading_en": "SEV-en TOU-SAND WUN HUN-dred METERS" },
          { "distance": "2356m", "reading_zh": "两千三百五十六米", "reading_en": "TOO TREE FIFE SIX METERS" }
        ]
      },
      "squawkCode": {
        "rules_zh": "“应答机”+应答机编码数值(逐位读出)",
        "rules_en": "“SQUAWK”+应答机编码数值(逐位读出)",
        "note": "应答机编码共四位,每一位从“0-7”之间取值,共4096个。",
        "examples": [
          { "code": "2456", "reading_zh": "应答机两四五六", "reading_en": "SQUAWK TOO FOW-er FIFE SIX" },
          { "code": "7500", "reading_zh": "应答机拐五洞洞", "reading_en": "SQUAWK SEV-en FIFE ZE-RO ZE-RO" }
        ]
      },
      "latLong": {
        "rules_zh": "“北(南)纬”+逐位读出度(两位)、分(两位)、秒(两位),“东(西)经”+逐位读出度(三位)、分(两位)、秒(两位)",
        "rules_en": "“LATITUDE” + XX “DEGREES” XX “MINUTES” XX “SECONDS NORTH (SOUTH)”, “LONGITUDE” + XXX “DEGREES” XX “MINUTES” XX “SECONDS EAST (WEST)”",
        "examples": [
          { "coord": "32°05′02″N, 107°32′04″E", "reading_zh": "北纬三两洞五洞两, 东经幺洞拐三两洞四", "reading_en": "Latitude TREE TOO degrees ZE-RO FIFE minutes ZE-RO TOO seconds North, Longitude WUN ZE-RO SEV-en degrees TREE TOO minutes ZE-RO FOW-er seconds East" },
          { "coord": "05°21′15″S, 145°08′20″W", "reading_zh": "南纬洞五两幺幺五, 西经幺四五洞捌两洞", "reading_en": "Latitude ZE-RO FIFE degrees TOO WUN minutes WUN FIFE seconds South, Longitude WUN FOW-er FIFE degrees ZE-RO AIT minutes TOO ZE-RO seconds West" },
          { "coord": "02°05′02″N, 007°32′04″E", "reading_zh": "北纬洞两洞五洞两, 东经洞洞拐三两洞四", "reading_en": "Latitude ZE-RO TOO degrees ZE-RO FIFE minutes ZE-RO TOO seconds North, Longitude ZE-RO ZE-RO SEV-en degrees TREE TOO minutes ZE-RO FOW-er seconds East" }
        ]
      },
      "aircraftType": {
        "description": "常见航空器机型的读法。",
        "examples": [
          { "type": "B737-800 / B738", "reading_zh": "波音七三七八百/波音七三八", "reading_en": "Boeing SEV-en TREE SEV-en AIT HUN-dred/Boeing SEV-en TREE AIT" },
          { "type": "B757", "reading_zh": "波音七五七", "reading_en": "Boeing SEV-en FIFE SEV-en" },
          { "type": "B777", "reading_zh": "波音七七七", "reading_en": "Boeing SEV-en SEV-en SEV-en" },
          { "type": "B787", "reading_zh": "波音七八七", "reading_en": "Boeing SEV-en AIT SEV-en" },
          { "type": "B747-SP", "reading_zh": "波音七四七 Es Pee", "reading_en": "Boeing SEV-en FOW-er SEV-en Es Pee" },
          { "type": "B747-400", "reading_zh": "波音七四七四百", "reading_en": "Boeing SEV-en FOW-er SEV-en FOW-er HUN-dred" },
          { "type": "IL-76", "reading_zh": "伊尔拐六", "reading_en": "Ilyushin SEV-en SIX" },
          { "type": "A320", "reading_zh": "空客三二零", "reading_en": "Airbus TREE TOO ZE-RO" },
          { "type": "A319", "reading_zh": "空客三幺九", "reading_en": "Airbus TREE WUN NIN-er" },
          { "type": "A330", "reading_zh": "空客三三零", "reading_en": "Airbus TREE TREE ZE-RO" },
          { "type": "A340", "reading_zh": "空客三四零", "reading_en": "Airbus TREE FOW-er ZE-RO" },
          { "type": "A380", "reading_zh": "空客三八零", "reading_en": "Airbus TREE AIT ZE-RO" },
          { "type": "MD11", "reading_zh": "麦道幺幺", "reading_en": "Em Dee ELEVEN" },
          { "type": "EMB190", "reading_zh": "Eee Em Bee 幺九零", "reading_en": "Eee Em Bee WUN NIN-er ZE-RO" }
        ]
      },
      "clockPosition": {
        "rules_zh": "数字+“点钟方位”",
        "rules_en": "number + “O'CLOCK”",
        "examples": [
          { "position": "1", "reading_zh": "一点钟方位", "reading_en": "WUN O'CLOCK" },
          { "position": "2", "reading_zh": "两点钟方位", "reading_en": "TOO O'CLOCK" },
          { "position": "3", "reading_zh": "三点钟方位", "reading_en": "TREE O'CLOCK" },
          { "position": "4", "reading_zh": "四点钟方位", "reading_en": "FOW-er O'CLOCK" },
          { "position": "5", "reading_zh": "五点钟方位", "reading_en": "FIFE O'CLOCK" }
        ]
      }
    },
    "phoneticAlphabet": {
      "note": "大写部分应重读。",
      "table": [
        { "letter": "A", "word": "Alpha", "pronunciation": "AL FAH" },
        { "letter": "B", "word": "Bravo", "pronunciation": "BRAH VOH" },
        { "letter": "C", "word": "Charlie", "pronunciation": "CHAR LEE" },
        { "letter": "D", "word": "Delta", "pronunciation": "DELL TAH" },
        { "letter": "E", "word": "Echo", "pronunciation": "ECK OH" },
        { "letter": "F", "word": "Foxtrot", "pronunciation": "FOKS TROT" },
        { "letter": "G", "word": "Golf", "pronunciation": "GOLF" },
        { "letter": "H", "word": "Hotel", "pronunciation": "HOH TELL" },
        { "letter": "I", "word": "India", "pronunciation": "IN DEE AH" },
        { "letter": "J", "word": "Juliett", "pronunciation": "JEW LEE ETT" },
        { "letter": "K", "word": "Kilo", "pronunciation": "KEY LOH" },
        { "letter": "L", "word": "Lima", "pronunciation": "LEE MAH" },
        { "letter": "M", "word": "Mike", "pronunciation": "MIKE" },
        { "letter": "N", "word": "November", "pronunciation": "NO VEM BER" },
        { "letter": "O", "word": "Oscar", "pronunciation": "OSS CAH" },
        { "letter": "P", "word": "Papa", "pronunciation": "PAH PAH" },
        { "letter": "Q", "word": "Quebec", "pronunciation": "KEH BECK" },
        { "letter": "R", "word": "Romeo", "pronunciation": "ROW ME OH" },
        { "letter": "S", "word": "Sierra", "pronunciation": "SEE AIR RAH" },
        { "letter": "T", "word": "Tango", "pronunciation": "TANG GO" },
        { "letter": "U", "word": "Uniform", "pronunciation": "YOU NEE FORM" },
        { "letter": "V", "word": "Victor", "pronunciation": "VIK TAH" },
        { "letter": "W", "word": "Whiskey", "pronunciation": "WISS KEY" },
        { "letter": "X", "word": "X-ray", "pronunciation": "ECKS RAY" },
        { "letter": "Y", "word": "Yankee", "pronunciation": "YANG KEY" },
        { "letter": "Z", "word": "Zulu", "pronunciation": "ZOO LOO" }
      ]
    },
    "identifiers": {
      "airport": {
        "rules_zh": "机场识别代码(按字母逐位读出)",
        "rules_en": "机场识别代码(按字母逐位读出)",
        "examples": [
          { "code": "ZSPD", "reading_zh": "ZULU SIERRA PAPA DELTA", "reading_en": "ZULU SIERRA PAPA DELTA" },
          { "code": "KMDQ", "reading_zh": "KILO MIKE DELTA QUEBEC", "reading_en": "KILO MIKE DELTA QUEBEC" }
        ]
      },
      "vorNdb": {
        "rules_zh": "VOR 台和 NDB 台名称(按照航图中的地名读出)",
        "rules_en": "VOR 台和 NDB 台名称(按照字母逐位读出该台识别代码)",
        "note": "对于 VOR 和 NDB 导航台名称相同,不建在一起且距离较远时,应在台名后加 NDB 或 VOR (例如:怀柔 VOR 或怀柔 NDB)。",
        "examples": [
          { "id": "LKO", "name_zh": "龙口", "reading_en": "LIMA KILO OSCAR" },
          { "id": "VYK", "name_zh": "大王庄", "reading_en": "VICTOR YANKEE KILO" },
          { "id": "VM", "name_zh": "石各庄", "reading_en": "VICTOR MIKE" },
          { "id": "NXD", "name_zh": "南浔", "reading_en": "NOVEMBER X-RAY DELTA" }
        ]
      },
      "waypoints": {
        "rules": [
          { "type": "5-letter", "reading_zh": "航路点名称(按照一个单词的英语发音读出)", "reading_en": "航路点名称(按照一个单词的英语发音读出)" },
          { "type": "Alphanumeric", "reading_zh": "字母+数字", "reading_en": "字母+数字" }
        ],
        "examples": [
          { "waypoint": "EKIVI", "reading_zh": "EKIVI", "reading_en": "EKIVI" },
          { "waypoint": "ANDIN", "reading_zh": "ANDIN", "reading_en": "ANDIN" },
          { "waypoint": "P23", "reading_zh": "PEE两三", "reading_en": "PAPA TOO TREE" },
          { "waypoint": "JN213", "reading_zh": "JULIETT NOVEMBER 两幺三", "reading_en": "JULIETT NOVEMBER TOO WUN TREE" }
        ]
      },
      "routesAndProcedures": {
        "rules": [
          { "type": "Airway", "reading_zh": "航路代号+编码", "reading_en": "航路代号+编码" },
          { "type": "SID/STAR", "reading_zh": "重要点名称+航线代号", "reading_en": "重要点名称+航线代号" }
        ],
        "examples": [
          { "id": "G595", "reading_zh": "GOLF五九五", "reading_en": "GOLF FIFE NIN-er FIFE" },
          { "id": "J325", "reading_zh": "JULIETT三两五", "reading_en": "JULIETT TREE TOO FIFE" },
          { "id": "VYK-01A", "reading_zh": "大王庄洞幺ALPHA", "reading_en": "VICTOR YANKEE KILO ZE-RO WUN ALPHA" },
          { "id": "NHW-2D", "reading_zh": "南汇两DELTA", "reading_en": "NOVEMBER HOTEL WHISKEY TOO DELTA" },
          { "id": "PEGSO-9Z", "reading_zh": "PEGSO 九 ZULU", "reading_en": "PEGSO NIN-er ZULU" }
        ]
      }
    }
  },
  "standardPhrases": [
    { "phrase": "ACKNOWLEDGE", "meaning_zh": "请认收", "definition_en": "Let me know that you have received and understood this message.", "definition_zh": "向我表示你已经收到并理解该电报。" },
    { "phrase": "AFFIRM", "meaning_zh": "是的", "definition_en": "Yes.", "definition_zh": "是的。" },
    { "phrase": "APPROVED", "meaning_zh": "同意", "definition_en": "Permission for proposed action granted.", "definition_zh": "批准所申请的行动。" },
    { "phrase": "BREAK", "meaning_zh": "还有", "definition_en": "I hereby indicate the separation between portions of the message, to be used where there is no clear distinction between the text and other portions of the message.", "definition_zh": "表示电报各部分的间断;用于电文与电报的其他部分无明显区别的情况。如果信息的各个部分之间没有明显的区别可以使用该词作为信息各部分之间的间隔标志。" },
    { "phrase": "BREAK BREAK", "meaning_zh": "中文仍然使用 BREAK BREAK", "definition_en": "I hereby indicate the separation between messages transmitted to different aircraft in a very busy environment.", "definition_zh": "表示在非常繁忙的情况下,发布给不同航空器的电报之间的间断。" },
    { "phrase": "CANCEL", "meaning_zh": "取消", "definition_en": "Annul the previously transmitted clearance.", "definition_zh": "废除此前所发布的许可。" },
    { "phrase": "CHECK", "meaning_zh": "检查", "definition_en": "Examine a system or procedure, and no answer is normally expected.", "definition_zh": "检查系统或程序,且通常不需回答。" },
    { "phrase": "CLEARED", "meaning_zh": "可以", "definition_en": "Authorized to proceed under the conditions specified.", "definition_zh": "批准按指定条件前行。" },
    { "phrase": "CONFIRM", "meaning_zh": "证实", "definition_en": "Have I correctly received the following...? or Did you correctly received this message?", "definition_zh": "我是否已经准确地收到了...?或你是否已经准确地收到了本电报?" },
    { "phrase": "CONTACT", "meaning_zh": "联系", "definition_en": "Establish radio contact with...", "definition_zh": "与......建立无线电联系。" },
    { "phrase": "CORRECT", "meaning_zh": "正确", "definition_en": "That is correct.", "definition_zh": "你所讲的是正确的。" },
    { "phrase": "CORRECTION", "meaning_zh": "更正", "definition_en": "An error has been made in this transmission or message indicated. The correct version is...", "definition_zh": "在本电报出了一个错误,或所发布的信息本身是错的,正确的内容应当是......" },
    { "phrase": "DISREGARD", "meaning_zh": "作废", "definition_en": "Consider that transmission as not sent.", "definition_zh": "当作信息没有发送。" },
    { "phrase": "GO AHEAD", "meaning_zh": "请讲", "definition_en": "Proceed with your message.", "definition_zh": "发你的电报。" },
    { "phrase": "HOW DO YOU READ?", "meaning_zh": "你听我几个?", "definition_en": "What is the readability of my transmission?", "definition_zh": "我所发电报的清晰度如何?" },
    { "phrase": "I SAY AGAIN", "meaning_zh": "我重复一遍", "definition_en": "I repeat for clarity or emphasis.", "definition_zh": "为了表示澄清或强调,我重复一遍。", "note": "当机组想要澄清或强调通话中的重要内容时,应重复该部分内容。" },
    { "phrase": "IMMEDIATELY", "meaning_zh": "立即", "definition_en": "Used in commands that must be executed immediately, failure to perform the instruction would result in a serious flight conflict.", "definition_zh": "用在应马上执行的指令中,如果不执行指令将会造成严重的飞行冲突。" },
    { "phrase": "MAINTAIN", "meaning_zh": "保持", "definition_en": "Continue in accordance with the condition(s) specified or in its literal sense, e.g. “maintain VFR”.", "definition_zh": "按照指定的条件保持或字面意义保持,例如“保持目视飞行规则”。" },
    { "phrase": "MONITOR", "meaning_zh": "守听", "definition_en": "Listen out on frequency.", "definition_zh": "收听或调定到某个频率。" },
    { "phrase": "NEGATIVE", "meaning_zh": "错误、不同意或没有", "definition_en": "No or Permission not granted or That is not correct.", "definition_zh": "并非如此,或不允许,或不对。", "note": "空中交通管制员通常在航空器驾驶员复诵的指令或许可错误时使用“错误,我重复一遍(NEGATIVE, I SAY AGAIN)”,后跟正确的内容。" },
    { "phrase": "OUT", "meaning_zh": "完毕", "definition_en": "This exchange of transmissions is ended and no response is expected.", "definition_zh": "本次通话已经结束,并且你不需做出回答。", "note": "The word “OUT” is not normally used in VHF communications. 用语“OUT”通常不用于 VHF 通信中。" },
    { "phrase": "OVER", "meaning_zh": "请回答", "definition_en": "My transmission is ended and I expect a response from you.", "definition_zh": "我发话完毕,并希望你回答。", "note": "The word “OVER” is not normally used in VHF communications. 用语“OVER”通常不用于 VHF 通信中。" },
    { "phrase": "READ BACK", "meaning_zh": "复诵", "definition_en": "Report all, or the specified part, of this message back to me exactly as received.", "definition_zh": "请向我准确地重复本电报所有或部分内容。" },
    { "phrase": "RECLEARED", "meaning_zh": "重新许可", "definition_en": "A change has been made to your last clearance and this new clearance supersedes your previous clearance or part thereof.", "definition_zh": "此前发布给你的许可已经变更,这一新的许可将取代刚才的许可或其中部分内容。" },
    { "phrase": "REPORT", "meaning_zh": "报告", "definition_en": "Pass me the following information.", "definition_zh": "向我传达下列情报。" },
    { "phrase": "REQUEST", "meaning_zh": "申请", "definition_en": "I should like to know..., or I wish to obtain...", "definition_zh": "我希望知道...或我希望得到..." },
    { "phrase": "ROGER", "meaning_zh": "收到", "definition_en": "I have received all of your last transmission.", "definition_zh": "我已经收到了你刚才的发话。", "note": "Under no circumstances to be used in reply to a question requiring “READ BACK” or a direct answer in the affirmative (AFFIRM) or negative (NEGATIVE). 要求复诵或者要求用“是的”或“没有”来作答时,切不可使用。" },
    { "phrase": "SAY AGAIN", "meaning_zh": "重复一遍", "definition_en": "Repeat all, or the following part, of your last transmission.", "definition_zh": "请重复你刚才发话的所有内容或下列部分—当对收到的信息存疑时。", "note": "还可以使用“重复一遍...... (SAY AGAIN...)”、“重复一遍......之前的内容 (SAY AGAIN ALL BEFORE...)”、“重复一遍......之后的内容 (SAY AGAIN ALL AFTER...)”或“重复一遍......和......之间的内容(SAY AGAIN ALL BETWEEN...AND...)”。" },
    { "phrase": "SPEAK SLOWER", "meaning_zh": "讲慢点", "definition_en": "Reduce your rate of speech.", "definition_zh": "请降低你的语速。" },
    { "phrase": "STANDBY", "meaning_zh": "稍等", "definition_en": "Wait and I will call you.", "definition_zh": "请等候,我将呼叫你。" },
    { "phrase": "UNABLE / UNABLE TO COMPLY", "meaning_zh": "无法执行", "definition_en": "I cannot comply with your request, instruction, or clearance.", "definition_zh": "我无法执行你的申请、指令或许可。", "note": "UNABLE 后面通常要跟原因。如果对航空器驾驶员执行管制许可或指令有疑问,空中交通管制员在许可或指令后可加短语“如果不行,通知我(IF UNABLE, ADVISE)”。在任何时候,航空器驾驶员如果不能执行接收到的管制许可或指令,应使用短语“无法执行(UNABLE/NEGATIVE)”,并告知原因。" },
    { "phrase": "VERIFY", "meaning_zh": "核实", "definition_en": "Check and confirm with originator.", "definition_zh": "与发话方进行检查和确认。" },
    { "phrase": "WILCO", "meaning_zh": "照办", "definition_en": "Abbreviation for “will comply”, I understand your message and will comply with it.", "definition_zh": "“将照办”的缩略语,我已经明白了你的电报并将按照该电报执行。" },
    { "phrase": "WORDS TWICE", "meaning_zh": "讲两遍", "details": [
      { "context": "As a request", "context_zh": "对于申请来说", "usage_en": "Communication is difficult. Please send every word or group of words twice.", "usage_zh": "通信困难,请把每个词(组)发送两遍。" },
      { "context": "As information", "context_zh": "对于信息来说", "usage_en": "Since communication is difficult, every word or group of words in this message will be sent twice.", "usage_zh": "由于通信困难,该电报的每个词(组)将被发送两遍。" }
    ]}
  ],
  "callSignPhraseology": {
    "controllerUnits": {
      "description": "管制单位的名称由管制单位所在地的名字和后缀组成。后缀表明单位类型或所能提供的服务。",
      "suffixes": [
        { "service_en": "Area control center", "service_zh": "区域管制中心", "suffix_en": "CONTROL", "suffix_zh": "区域" },
        { "service_en": "Approach control", "service_zh": "进近管制", "suffix_en": "APPROACH", "suffix_zh": "进近" },
        { "service_en": "Approach control radar arrival", "service_zh": "进场雷达管制", "suffix_en": "ARRIVAL", "suffix_zh": "进场" },
        { "service_en": "Approach control radar departure", "service_zh": "离场雷达管制", "suffix_en": "DEPARTURE", "suffix_zh": "离场" },
        { "service_en": "Aerodrome control", "service_zh": "机场管制", "suffix_en": "TOWER", "suffix_zh": "塔台" },
        { "service_en": "Surface movement control", "service_zh": "地面活动管制", "suffix_en": "GROUND", "suffix_zh": "地面" },
        { "service_en": "Clearance delivery", "service_zh": "放行许可发布", "suffix_en": "DELIVERY", "suffix_zh": "放行" },
        { "service_en": "Flight information service", "service_zh": "飞行服务/航空情报服务", "suffix_en": "INFORMATION", "suffix_zh": "飞服" },
        { "service_en": "Precision approach radar", "service_zh": "精密进近雷达", "suffix_en": "PRECISION", "suffix_zh": "精密" },
        { "service_en": "Apron control/management service", "service_zh": "机坪管制/管理服务", "suffix_en": "APRON", "suffix_zh": "机坪" },
        { "service_en": "Company dispatch", "service_zh": "公司签派", "suffix_en": "DISPATCH", "suffix_zh": "签派" }
      ],
      "abbreviations": {
        "description": "航空器和管制单位初次联系时,应呼全称。在建立双向联系以后的各次通话中,可以简呼管制单位服务类型或地名。",
        "examples": [
          { "full": "西安区域管制中心", "abbreviated_zh": "西安区域或西安", "abbreviated_en": "XI'AN CONTROL or XI'AN" },
          { "full": "济南进近管制室", "abbreviated_zh": "济南进近或进近", "abbreviated_en": "JINAN APPROACH or APPROACH" },
          { "full": "广州塔台管制室", "abbreviated_zh": "白云塔台或塔台", "abbreviated_en": "BAIYUN TOWER or TOWER" }
        ]
      }
    },
    "aircraft": {
      "types": [
        {
          "type": "Registration Mark",
          "description_zh": "注册号字母和数字应按照标准发音逐位读出。有时航空器制造商或机型名称作为前缀。",
          "example1": "G-ABCD -> GOLF ALPHA BRAVO CHARLIE DELTA",
          "example2_zh": "Cessna G-ABCD -> 塞斯纳 GOLF ALPHA BRAVO CHARLIE DELTA",
          "example2_en": "Cessna GOLF ALPHA BRAVO CHARLIE DELTA"
        },
        {
          "type": "Operator + Registration Suffix",
          "description_zh": "运营人无线电呼号(汉语按民航规定,英语按ICAO规定)加注册号后四位字母(按标准字母发音)。",
          "example": { "callsign": "CES BHWC", "reading_zh": "东方 BRAVO HOTEL WHISKEY CHARLE", "reading_en": "CHINA EASTERN BRAVO HOTEL WHISKEY CHARLE" }
        },
        {
          "type": "Operator + Flight Number",
          "description_zh": "运营人无线电呼号加航班号。航班号的字母用标准发音,数字用标准数字发音。",
          "examples": [
            { "callsign": "CCA998A", "reading_zh": "国际九九八ALPHA", "reading_en": "AIR CHINA NIN-er NIN-er AIT ALPHA" },
            { "callsign": "CES72AC", "reading_zh": "东方拐两ALPHA CHARLIE", "reading_en": "CHINA EASTERN SEV-en TOO ALPHA CHARLIE" },
            { "callsign": "CCA1201", "reading_zh": "国际幺两洞幺", "reading_en": "AIR CHINA WUN TOO ZE-RO WUN" }
          ]
        }
      ],
      "abbreviationRules": {
        "description": "在建立满意的双向通信联系之后,在不产生混淆的情况下,航空器呼号可缩减。",
        "rules": [
          "航空器的注册号中的第一个和至少最后两个字母 (例如: G-CD 或 Cessna G-CD)。",
          "航空器运营人的无线电呼号加航空器的注册号中和至少最后两个字母 (例如: TWA WC)。",
          "航空器运营人的无线电呼号加航班号,无缩减形式 (例如: 东方1201 无缩减形式)。"
        ],
        "notes": [
          "当由于存在相似的呼号而可能产生混淆时,航空器在飞行中可能需要改变或更换呼号。管制单位可能会临时指令航空器改变呼号形式。",
          "如果航空器的尾流等级为重型,机组在首次呼叫管制单位时,应在呼号后加上“重型”(HEAVY)。",
          "如果航空器是超大型飞机如A380,机组在首次呼叫管制单位时,应在呼号后加上“SUPER”(中英文通话相同)。"
        ]
      }
    }
  },
  "weatherPhraseology": {
    "wind": {
      "formats": [
        { "type": "Surface Wind", "format_zh": "“地面风”+三位数, 数值+“米秒”", "format_en": "“SURFACE WIND” + three digits + “DEGREES”, number + “METER(S) PER SECOND”" },
        { "type": "General Wind", "format_zh": "“风向”+三位数,“风速”+数值+“米秒”", "format_en": "“WIND” + three digits + “DEGREES”, number + “METER(S) PER SECOND”" },
        { "type": "Wind Aloft", "format_zh": "“高度”+数值,“风向”+三位数,“风速”+数字+“公里小时(或节)”", "format_en": "“WIND AT” + level, three digits + “DEGREES”, number + “KILOMETERS PER HOUR (or KNOTS)”" }
      ],
      "note": "风向量除以具体风向、风速数值表示外,还可根据实际情况表述为“阵风(GUSTING)”+数值(number)、“静风(WIND CALM)”或“风向不定(WIND VARIABLE)”等。风是用平均风向风速以及风向风速的重大变化来表达的。"
    },
    "visibilityAndRvr": {
      "formats": [
        { "type": "Visibility", "format_zh": "“能见度”+距离+单位", "format_en": "“VISIBILITY” + distance + units" },
        { "type": "RVR", "format_zh": "“跑道”+号码+“跑道视程(或RVR)”+距离+单位", "format_en": "“RVR RUNWAY” + number + distance + units" },
        { "type": "RVR Not Available", "format_zh": "“跑道”+号码+“跑道视程空缺(或没有报告)”", "format_en": "“RVR RUNWAY” + number + “NOT AVAILABLE (or NOT REPORTED)”" },
        { "type": "Multi-point RVR", "format_zh": "“跑道”+号码+“跑道视程”,“接地段”+距离+单位,“中间段”+距离+单位,“停止端”+距离+单位", "format_en": "“RVR RUNWAY” + number, “TOUCHDOWN” + distance + units, “MIDPOINT” + distance + units, “STOP END” + distance + units" },
        { "type": "Multi-point RVR (partial missing)", "format_zh": "“跑道”+号码+“跑道视程”,“接地段”+距离+单位,“中间段空缺”,“停止端”+距离+单位", "format_en": "“RVR RUNWAY” + number, “TOUCHDOWN” + distance + units, “MIDPOINT NOT AVAILABLE”, “STOP END” + distance + units" }
      ]
    },
    "weatherAndClouds": {
      "formats": [
        { "type": "Current Weather Report (ATC)", "format_zh": "“当前天气”+详细内容", "format_en": "“PRESENT WEATHER” + details" },
        { "type": "PIREP", "format_zh": "航空器类型+时间+“报告”,区域(或高度)+(“云中”) + “严重(或中度,轻度)结冰(或颠簸)”", "format_en": "aircraft type + “REPORTED SEVERE (or MODERATE, LIGHT) ICING (or TURBULENCE)” + (“IN CLOUD”) + area (or level) + time" }
      ],
      "cloudCover": [
        { "abbr": "SKY CLEAR", "meaning": "碧空" },
        { "abbr": "FEW", "meaning": "少云" },
        { "abbr": "SCT", "meaning": "疏云" },
        { "abbr": "BKN", "meaning": "多云" },
        { "abbr": "OVC", "meaning": "阴天" },
        { "note": "云量也可以按照“八分之几(OCTAS)”发布。" }
      ],
      "generalConditions": [
        { "term": "CAVOK (CAV-O-KAY)", "meaning": "天气良好" },
        { "term": "REPORT FLIGHT CONDITIONS", "meaning": "报告飞行条件", "note": "飞行员按规定报告目前飞机外部的大气条件,包括风、气温、云及气象因素如结冰、颠簸等。" }
      ]
    },
    "tempAndAltimeter": {
      "formats": [
        { "type": "Temperature / Dew Point", "format_zh": "“温度(零下)”+数值+“摄氏(华氏)度”,“露点(零下)”+数值+“摄氏(华氏)度”", "format_en": "“TEMPERATURE (MINUS)” + number + “DEGREES CENTIGRADE (FAHRENHEIT)”, “DEW-POINT (MINUS)” + number + “DEGREES CENTIGRADE (FAHRENHEIT)”", "note": "温度和露点应区分摄氏度(DEGREES CENTIGRADE)和华氏度(DEGREES FAHRENHEIT)。" },
        { "type": "Altimeter Setting", "format_zh": "“修正海压(或,场压)”+数值+(单位)", "format_en": "“QNH (or QFE)” + number + (units)" }
      ]
    }
  }
};

// 导出数据
module.exports = {
  aviationPhraseology,
  generalInfo: aviationPhraseology.generalInfo
};