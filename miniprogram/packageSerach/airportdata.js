const airports = [
  {
    ICAOCode: "ANYN",
    IATACode: "INU",
    ShortName: "瑙鲁",
    CountryName: "瑙鲁",
    EnglishName: "Nauru International Airport"
  },
  {
    ICAOCode: "AYPY",
    IATACode: "POM",
    ShortName: "莫尔兹比港",
    CountryName: "巴布亚新几内亚",
    EnglishName: "Port Moresby Jacksons International Airport"
  },
  {
    ICAOCode: "BIKF",
    IATACode: "KEF", // Corrected from PDF "BEF"
    ShortName: "凯夫拉维克", // Corrected from PDF "冰岛"
    CountryName: "冰岛",
    EnglishName: "Keflavík International Airport"
  },
  {
    ICAOCode: "CYEG",
    IATACode: "YEG",
    ShortName: "埃德蒙顿",
    CountryName: "加拿大",
    EnglishName: "Edmonton International Airport"
  },
  {
    ICAOCode: "CYFB",
    IATACode: "YFB",
    ShortName: "伊卡卢伊特",
    CountryName: "加拿大",
    EnglishName: "Iqaluit Airport"
  },
  {
    ICAOCode: "CYOW",
    IATACode: "YOW",
    ShortName: "渥太华",
    CountryName: "加拿大",
    EnglishName: "Ottawa Macdonald-Cartier International Airport"
  },
  {
    ICAOCode: "CYUL",
    IATACode: "YUL",
    ShortName: "蒙特利尔",
    CountryName: "加拿大",
    EnglishName: "Montréal-Trudeau International Airport"
  },
  {
    ICAOCode: "CYVR",
    IATACode: "YVR",
    ShortName: "温哥华",
    CountryName: "加拿大",
    EnglishName: "Vancouver International Airport"
  },
  {
    ICAOCode: "CYYC",
    IATACode: "YYC",
    ShortName: "卡尔加里国际机场",
    CountryName: "加拿大",
    EnglishName: "Calgary International Airport"
  },
  {
    ICAOCode: "CYYQ",
    IATACode: "YYQ",
    ShortName: "丘吉尔",
    CountryName: "加拿大",
    EnglishName: "Churchill Airport"
  },
  {
    ICAOCode: "CYYZ",
    IATACode: "YYZ",
    ShortName: "多伦多",
    CountryName: "加拿大",
    EnglishName: "Toronto Pearson International Airport"
  },
  {
    ICAOCode: "EBBR",
    IATACode: "BRU",
    ShortName: "布鲁塞尔",
    CountryName: "比利时",
    EnglishName: "Brussels Airport"
  },
  {
    ICAOCode: "EDBP",
    IATACode: "SZW",
    ShortName: "帕西",
    CountryName: "德国",
    EnglishName: "Parchim International Airport"
  },
  {
    ICAOCode: "EDDB",
    IATACode: "BER",
    ShortName: "柏林勃兰登堡",
    CountryName: "德国",
    EnglishName: "Berlin Brandenburg Airport \"Willy Brandt\"" // Updated based on report
  },
  {
    ICAOCode: "EDDC",
    IATACode: "DRS",
    ShortName: "德累斯顿",
    CountryName: "德国",
    EnglishName: "Dresden Airport"
  },
  {
    ICAOCode: "EDDF",
    IATACode: "FRA",
    ShortName: "法兰克福",
    CountryName: "德国",
    EnglishName: "Frankfurt Airport"
  },
  {
    ICAOCode: "EDDH",
    IATACode: "HAM",
    ShortName: "汉堡",
    CountryName: "德国",
    EnglishName: "Hamburg Airport"
  },
  {
    ICAOCode: "EDDK",
    IATACode: "CGN",
    ShortName: "科隆",
    CountryName: "德国",
    EnglishName: "Cologne Bonn Airport"
  },
  {
    ICAOCode: "EDDL",
    IATACode: "DUS",
    ShortName: "杜塞尔多夫",
    CountryName: "德国",
    EnglishName: "Düsseldorf Airport"
  },
  {
    ICAOCode: "EDDM",
    IATACode: "MUC",
    ShortName: "慕尼黑",
    CountryName: "德国",
    EnglishName: "Munich Airport"
  },
  {
    ICAOCode: "EDHI",
    IATACode: "XFW",
    ShortName: "汉堡芬克威尔德", // Clarified from "汉堡"
    CountryName: "德国",
    EnglishName: "Hamburg Finkenwerder Airport"
  },
  {
    ICAOCode: "EFHK",
    IATACode: "HEL",
    ShortName: "赫尔辛基/万塔",
    CountryName: "芬兰",
    EnglishName: "Helsinki-Vantaa Airport"
  },
  {
    ICAOCode: "EGCC",
    IATACode: "MAN",
    ShortName: "曼彻斯特",
    CountryName: "英国",
    EnglishName: "Manchester Airport"
  },
  {
    ICAOCode: "EGKK",
    IATACode: "LGW",
    ShortName: "伦敦盖特威克",
    CountryName: "英国",
    EnglishName: "London Gatwick Airport"
  },
  {
    ICAOCode: "EGLL",
    IATACode: "LHR",
    ShortName: "伦敦希思罗", // Clarified from "伦敦"
    CountryName: "英国",
    EnglishName: "London Heathrow Airport"
  },
  {
    ICAOCode: "EHAM",
    IATACode: "AMS",
    ShortName: "阿姆斯特丹", // Clarified from "阿姆"
    CountryName: "荷兰",
    EnglishName: "Amsterdam Airport Schiphol"
  },
  {
    ICAOCode: "EKBI", // Corrected from OCR "ΕΚΒΙ"
    IATACode: "BLL",
    ShortName: "比隆",
    CountryName: "丹麦",
    EnglishName: "Billund Airport"
  },
  {
    ICAOCode: "EKCH",
    IATACode: "CPH",
    ShortName: "哥本哈根", // Clarified from "哥本"
    CountryName: "丹麦",
    EnglishName: "Copenhagen Airport, Kastrup"
  },
  {
    ICAOCode: "ELLX",
    IATACode: "LUX",
    ShortName: "卢森堡",
    CountryName: "卢森堡",
    EnglishName: "Luxembourg Airport"
  },
  {
    ICAOCode: "ENBO",
    IATACode: "BOO",
    ShortName: "博德",
    CountryName: "挪威",
    EnglishName: "Bodø Airport"
  },
  {
    ICAOCode: "ENEV",
    IATACode: "EVE",
    ShortName: "纳尔维克",
    CountryName: "挪威",
    EnglishName: "Harstad/Narvik Airport, Evenes"
  },
  {
    ICAOCode: "EPKT", // Corrected from OCR "ΕΡΚΤ"
    IATACode: "KTW",
    ShortName: "卡托维兹", // Corrected from "皮尔佐维采"
    CountryName: "波兰",
    EnglishName: "Katowice International Airport"
  },
  {
    ICAOCode: "EPWA",
    IATACode: "WAW",
    ShortName: "华沙",
    CountryName: "波兰",
    EnglishName: "Warsaw Chopin Airport"
  },
  {
    ICAOCode: "ESGG",
    IATACode: "GOT",
    ShortName: "哥德堡兰德维特", // Clarified from "兰德维特"
    CountryName: "瑞典",
    EnglishName: "Göteborg Landvetter Airport"
  },
  {
    ICAOCode: "ESPA",
    IATACode: "LLA",
    ShortName: "吕勒奥/卡拉克斯", // Clarified from "卡拉克斯"
    CountryName: "瑞典",
    EnglishName: "Luleå Airport"
  },
  {
    ICAOCode: "ESSA",
    IATACode: "ARN",
    ShortName: "斯德哥尔摩阿兰达机场",
    CountryName: "瑞典",
    EnglishName: "Stockholm Arlanda Airport"
  },
  {
    ICAOCode: "FACT",
    IATACode: "CPT",
    ShortName: "开普敦",
    CountryName: "南非",
    EnglishName: "Cape Town International Airport"
  },
  { // Added from report
    ICAOCode: "FNBJ",
    IATACode: "NBJ",
    ShortName: "安东尼奥·内图博士",
    CountryName: "安哥拉",
    EnglishName: "Dr. Antonio Agostinho Neto International Airport"
  },
  {
    ICAOCode: "FIMP",
    IATACode: "MRU",
    ShortName: "毛里求斯", // Clarified from "毛里"
    CountryName: "毛里求斯",
    EnglishName: "Sir Seewoosagur Ramgoolam International Airport"
  },
  {
    ICAOCode: "GFLL",
    IATACode: "FNA",
    ShortName: "隆吉",
    CountryName: "塞拉利昂",
    EnglishName: "Lungi International Airport"
  },
  {
    ICAOCode: "GLRB",
    IATACode: "ROB",
    ShortName: "罗伯茨",
    CountryName: "利比里亚", // Corrected from PDF "利比亚"
    EnglishName: "Roberts International Airport"
  },
  {
    ICAOCode: "HECA",
    IATACode: "CAI",
    ShortName: "开罗",
    CountryName: "埃及",
    EnglishName: "Cairo International Airport"
  },
  {
    ICAOCode: "HKEL",
    IATACode: "EDL",
    ShortName: "埃尔多雷特",
    CountryName: "肯尼亚",
    EnglishName: "Eldoret International Airport"
  },
  {
    ICAOCode: "HKJK",
    IATACode: "NBO",
    ShortName: "内罗毕乔莫肯雅塔", // Clarified from "内罗毕"
    CountryName: "肯尼亚",
    EnglishName: "Jomo Kenyatta International Airport"
  },
  {
    ICAOCode: "HKMO", // Corrected from OCR "ΗΚΜΟ"
    IATACode: "MBA",
    ShortName: "蒙巴萨莫伊", // Clarified from "蒙巴萨"
    CountryName: "肯尼亚",
    EnglishName: "Moi International Airport"
  },
  {
    ICAOCode: "HSSJ",
    IATACode: "JUB",
    ShortName: "朱巴",
    CountryName: "南苏丹",
    EnglishName: "Juba International Airport"
  },
  {
    ICAOCode: "KATL",
    IATACode: "ATL",
    ShortName: "亚特兰大",
    CountryName: "美国",
    EnglishName: "Hartsfield-Jackson Atlanta International Airport"
  },
  {
    ICAOCode: "KBFI",
    IATACode: "BFI",
    ShortName: "西雅图波音机场", // Clarified from "西雅"
    CountryName: "美国",
    EnglishName: "Boeing Field/King County International Airport"
  },
  {
    ICAOCode: "KBOS",
    IATACode: "BOS",
    ShortName: "波士顿洛根", // Clarified from "波士顿/E.L.罗甘将军国际机场"
    CountryName: "美国",
    EnglishName: "Logan International Airport"
  },
  {
    ICAOCode: "KBWI",
    IATACode: "BWI",
    ShortName: "巴尔的摩/华盛顿", // Clarified from "巴尔的摩"
    CountryName: "美国",
    EnglishName: "Baltimore/Washington International Thurgood Marshall Airport"
  },
  {
    ICAOCode: "KCHS",
    IATACode: "CHS",
    ShortName: "查尔斯顿",
    CountryName: "美国",
    EnglishName: "Charleston International Airport"
  },
  {
    ICAOCode: "KDFW",
    IATACode: "DFW",
    ShortName: "达拉斯/沃斯堡", // Clarified from "达拉"
    CountryName: "美国",
    EnglishName: "Dallas/Fort Worth International Airport"
  },
  {
    ICAOCode: "KDTW",
    IATACode: "DTW",
    ShortName: "底特律", // Clarified from "底特律"
    CountryName: "美国",
    EnglishName: "Detroit Metropolitan Wayne County Airport"
  },
  {
    ICAOCode: "KEWR",
    IATACode: "EWR",
    ShortName: "纽瓦克自由国际机场", // Clarified from "纽瓦克/国际机场"
    CountryName: "美国",
    EnglishName: "Newark Liberty International Airport"
  },
  {
    ICAOCode: "KIAD",
    IATACode: "IAD",
    ShortName: "华盛顿杜勒斯", // Clarified from "华盛顿"
    CountryName: "美国",
    EnglishName: "Washington Dulles International Airport"
  },
  {
    ICAOCode: "KJFK",
    IATACode: "JFK",
    ShortName: "纽约肯尼迪", // Clarified from "纽约"
    CountryName: "美国",
    EnglishName: "John F. Kennedy International Airport"
  },
  {
    ICAOCode: "KLAS",
    IATACode: "LAS",
    ShortName: "拉斯维加斯哈里里德", // Updated from "拉斯维加斯/麦卡伦国际机场"
    CountryName: "美国",
    EnglishName: "Harry Reid International Airport"
  },
  {
    ICAOCode: "KLAX",
    IATACode: "LAX",
    ShortName: "洛杉矶",
    CountryName: "美国",
    EnglishName: "Los Angeles International Airport"
  },
  {
    ICAOCode: "KLGB",
    IATACode: "LGB",
    ShortName: "长滩",
    CountryName: "美国",
    EnglishName: "Long Beach Airport"
  },
  {
    ICAOCode: "KMEM",
    IATACode: "MEM",
    ShortName: "孟菲斯国际机场",
    CountryName: "美国",
    EnglishName: "Memphis International Airport"
  },
  {
    ICAOCode: "KMSP",
    IATACode: "MSP",
    ShortName: "明尼阿波利斯-圣保罗",
    CountryName: "美国",
    EnglishName: "Minneapolis-Saint Paul International Airport"
  },
  {
    ICAOCode: "KMZJ",
    IATACode: "MZJ",
    ShortName: "皮纳尔航空园", // Clarified from "皮纳"
    CountryName: "美国",
    EnglishName: "Pinal Airpark"
  },
  {
    ICAOCode: "KOAK",
    IATACode: "OAK",
    ShortName: "奥克兰国际机场",
    CountryName: "美国",
    EnglishName: "Oakland International Airport"
  },
  {
    ICAOCode: "KONT",
    IATACode: "ONT",
    ShortName: "安大略（加州）", // Clarified from "ONTARIO"
    CountryName: "美国",
    EnglishName: "Ontario International Airport"
  },
  {
    ICAOCode: "KORD",
    IATACode: "ORD",
    ShortName: "芝加哥奥黑尔", // Clarified from "芝加哥"
    CountryName: "美国",
    EnglishName: "Chicago O'Hare International Airport"
  },
  {
    ICAOCode: "KPAE", // Corrected from OCR "ΚΡΑΕ"
    IATACode: "PAE",
    ShortName: "佩恩机场", // Corrected from "波音"
    CountryName: "美国",
    EnglishName: "Paine Field"
  },
  {
    ICAOCode: "KPDX",
    IATACode: "PDX",
    ShortName: "波特兰",
    CountryName: "美国",
    EnglishName: "Portland International Airport"
  },
  {
    ICAOCode: "KPHL",
    IATACode: "PHL",
    ShortName: "费城",
    CountryName: "美国",
    EnglishName: "Philadelphia International Airport"
  },
  {
    ICAOCode: "KPHX", // Corrected from OCR "ΚΡΗΧ"
    IATACode: "PHX",
    ShortName: "菲尼克斯斯凯哈伯",
    CountryName: "美国",
    EnglishName: "Phoenix Sky Harbor International Airport"
  },
  {
    ICAOCode: "KPIT", // Corrected from OCR "ΚΡΙΤ"
    IATACode: "PIT",
    ShortName: "匹兹堡",
    CountryName: "美国",
    EnglishName: "Pittsburgh International Airport"
  },
  {
    ICAOCode: "KSAN",
    IATACode: "SAN",
    ShortName: "圣迭戈国际机场",
    CountryName: "美国",
    EnglishName: "San Diego International Airport"
  },
  {
    ICAOCode: "KSDF",
    IATACode: "SDF",
    ShortName: "路易斯维尔穆罕默德阿里", // Updated from "路易斯维尔"
    CountryName: "美国",
    EnglishName: "Louisville Muhammad Ali International Airport"
  },
  {
    ICAOCode: "KSEA",
    IATACode: "SEA",
    ShortName: "西雅图-塔科马", // Clarified from "西雅图"
    CountryName: "美国",
    EnglishName: "Seattle-Tacoma International Airport"
  },
  {
    ICAOCode: "KSFO",
    IATACode: "SFO",
    ShortName: "旧金山",
    CountryName: "美国",
    EnglishName: "San Francisco International Airport"
  },
  {
    ICAOCode: "KSJC",
    IATACode: "SJC",
    ShortName: "圣何塞峰田", // Clarified from "圣何塞"
    CountryName: "美国",
    EnglishName: "Norman Y. Mineta San Jose International Airport"
  },
  {
    ICAOCode: "KSTL",
    IATACode: "STL",
    ShortName: "圣路易斯兰伯特", // Clarified from "圣路易斯"
    CountryName: "美国",
    EnglishName: "St. Louis Lambert International Airport"
  },
  {
    ICAOCode: "KTUS",
    IATACode: "TUS",
    ShortName: "图森",
    CountryName: "美国",
    EnglishName: "Tucson International Airport"
  },
  {
    ICAOCode: "KVCV",
    IATACode: "VCV",
    ShortName: "南加州物流", // Clarified from "维多利亚维尔"
    CountryName: "美国",
    EnglishName: "Southern California Logistics Airport"
  },
  {
    ICAOCode: "LDZA",
    IATACode: "ZAG",
    ShortName: "萨格勒布",
    CountryName: "克罗地亚",
    EnglishName: "Zagreb Airport (Franjo Tuđman Airport)"
  },
  {
    ICAOCode: "LEBL",
    IATACode: "BCN",
    ShortName: "巴塞罗那",
    CountryName: "西班牙",
    EnglishName: "Josep Tarradellas Barcelona-El Prat Airport"
  },
  {
    ICAOCode: "LEMD",
    IATACode: "MAD",
    ShortName: "马德里",
    CountryName: "西班牙",
    EnglishName: "Adolfo Suárez Madrid-Barajas Airport"
  },
  {
    ICAOCode: "LEMG",
    IATACode: "AGP",
    ShortName: "马拉加", // Clarified from "太阳海岸"
    CountryName: "西班牙",
    EnglishName: "Málaga-Costa del Sol Airport"
  },
  {
    ICAOCode: "LERT",
    IATACode: "ROZ",
    ShortName: "罗塔海军航空站",
    CountryName: "西班牙",
    EnglishName: "Rota Naval Station Airport"
  },
  {
    ICAOCode: "LETO",
    IATACode: "TOJ",
    ShortName: "马德里/托雷洪",
    CountryName: "西班牙",
    EnglishName: "Madrid-Torrejón Airport"
  },
  {
    ICAOCode: "LEVC",
    IATACode: "VLC",
    ShortName: "瓦伦西亚", // Corrected from "马尼塞斯"
    CountryName: "西班牙",
    EnglishName: "Valencia Airport"
  },
  {
    ICAOCode: "LEZG",
    IATACode: "ZAZ",
    ShortName: "萨拉戈萨",
    CountryName: "西班牙",
    EnglishName: "Zaragoza Airport"
  },
  {
    ICAOCode: "LFBO",
    IATACode: "TLS",
    ShortName: "图卢兹",
    CountryName: "法国",
    EnglishName: "Toulouse-Blagnac Airport"
  },
  {
    ICAOCode: "LFML",
    IATACode: "MRS",
    ShortName: "马赛",
    CountryName: "法国",
    EnglishName: "Marseille Provence Airport"
  },
  {
    ICAOCode: "LFPG",
    IATACode: "CDG",
    ShortName: "巴黎戴高乐", // Clarified from "巴黎"
    CountryName: "法国",
    EnglishName: "Paris Charles de Gaulle Airport"
  },
  {
    ICAOCode: "LFPO",
    IATACode: "ORY",
    ShortName: "巴黎奥利",
    CountryName: "法国",
    EnglishName: "Paris Orly Airport"
  },
  {
    ICAOCode: "LHBP",
    IATACode: "BUD",
    ShortName: "布达佩斯",
    CountryName: "匈牙利",
    EnglishName: "Budapest Ferenc Liszt International Airport"
  },
  {
    ICAOCode: "LIMC",
    IATACode: "MXP",
    ShortName: "米兰/马尔彭萨",
    CountryName: "意大利",
    EnglishName: "Milan Malpensa Airport"
  },
  {
    ICAOCode: "LIMF",
    IATACode: "TRN",
    ShortName: "都灵/卡塞莱",
    CountryName: "意大利",
    EnglishName: "Turin-Caselle Airport"
  },
  {
    ICAOCode: "LIPR",
    IATACode: "RMI",
    ShortName: "里米尼",
    CountryName: "意大利",
    EnglishName: "Federico Fellini International Airport"
  },
  {
    ICAOCode: "LIRF",
    IATACode: "FCO",
    ShortName: "罗马菲乌米奇诺", // Clarified from "罗马"
    CountryName: "意大利",
    EnglishName: "Rome Fiumicino Leonardo da Vinci Airport"
  },
  {
    ICAOCode: "LKPR",
    IATACode: "PRG",
    ShortName: "布拉格",
    CountryName: "捷克",
    EnglishName: "Václav Havel Airport Prague"
  },
  {
    ICAOCode: "LOWW",
    IATACode: "VIE",
    ShortName: "维也纳",
    CountryName: "奥地利",
    EnglishName: "Vienna International Airport"
  },
  { // Added from report
    ICAOCode: "LRBV",
    IATACode: "GHV",
    ShortName: "布拉索夫-金巴夫",
    CountryName: "罗马尼亚",
    EnglishName: "Brașov-Ghimbav International Airport"
  },
  {
    ICAOCode: "LSGG",
    IATACode: "GVA",
    ShortName: "日内瓦",
    CountryName: "瑞士",
    EnglishName: "Geneva Airport"
  },
  {
    ICAOCode: "LSZH",
    IATACode: "ZRH",
    ShortName: "苏黎世",
    CountryName: "瑞士",
    EnglishName: "Zurich Airport"
  },
  {
    ICAOCode: "LTAI",
    IATACode: "AYT",
    ShortName: "安塔利亚",
    CountryName: "土耳其",
    EnglishName: "Antalya Airport"
  },
  { // Added from report
    ICAOCode: "LTFO",
    IATACode: "RZV",
    ShortName: "里泽-阿尔特温",
    CountryName: "土耳其",
    EnglishName: "Rize–Artvin Airport"
  },
  {
    ICAOCode: "LYBE",
    IATACode: "BEG",
    ShortName: "贝尔格莱德", // Clarified from "尼古拉斯特拉"
    CountryName: "塞尔维亚",
    EnglishName: "Belgrade Nikola Tesla Airport"
  },
  { // Added from report
    ICAOCode: "MMSM",
    IATACode: "NLU",
    ShortName: "费利佩·安赫莱斯",
    CountryName: "墨西哥",
    EnglishName: "Felipe Ángeles International Airport (AIFA)"
  },
  { // Added from report
    ICAOCode: "MMTL",
    IATACode: "TQO",
    ShortName: "图卢姆",
    CountryName: "墨西哥",
    EnglishName: "Tulum International Airport (Felipe Carrillo Puerto Airport)"
  },
  {
    ICAOCode: "NVVV",
    IATACode: "VLI",
    ShortName: "维拉港",
    CountryName: "瓦努阿图",
    EnglishName: "Bauerfield International Airport"
  },
  {
    ICAOCode: "NWWW",
    IATACode: "NOU",
    ShortName: "努美阿", // Clarified from "托托塔"
    CountryName: "新喀里多尼亚",
    EnglishName: "La Tontouta International Airport"
  },
  {
    ICAOCode: "NZAA",
    IATACode: "AKL",
    ShortName: "奥克兰（新西兰）", // Clarified from "奥克兰"
    CountryName: "新西兰",
    EnglishName: "Auckland Airport"
  },
  {
    ICAOCode: "NZCH",
    IATACode: "CHC",
    ShortName: "基督城", // Corrected from "克里斯特彻奇(基督城)"
    CountryName: "新西兰",
    EnglishName: "Christchurch International Airport"
  },
  {
    ICAOCode: "OEJN",
    IATACode: "JED",
    ShortName: "吉达",
    CountryName: "沙特阿拉伯",
    EnglishName: "King Abdulaziz International Airport"
  },
  {
    ICAOCode: "OEMA", // Corrected from OCR "ΟΕΜΑ"
    IATACode: "MED",
    ShortName: "麦地那", // Clarified from "麦地"
    CountryName: "沙特阿拉伯",
    EnglishName: "Prince Mohammad bin Abdulaziz International Airport"
  },
  {
    ICAOCode: "OERK",
    IATACode: "RUH",
    ShortName: "利雅得/哈利德国王国际机场",
    CountryName: "沙特阿拉伯",
    EnglishName: "King Khalid International Airport"
  },
  { // Added from report
    ICAOCode: "OERS",
    IATACode: "RSI",
    ShortName: "红海",
    CountryName: "沙特阿拉伯",
    EnglishName: "Red Sea International Airport"
  },
  {
    ICAOCode: "OJAI",
    IATACode: "AMM",
    ShortName: "安曼/阿利亚皇后国际机场",
    CountryName: "约旦",
    EnglishName: "Queen Alia International Airport"
  },
  {
    ICAOCode: "OLBA",
    IATACode: "BEY",
    ShortName: "贝鲁特", // Clarified from "贝鲁"
    CountryName: "黎巴嫩",
    EnglishName: "Beirut-Rafic Hariri International Airport"
  },
  {
    ICAOCode: "OMAA",
    IATACode: "AUH",
    ShortName: "阿布扎比",
    CountryName: "阿拉伯联合酋长国",
    EnglishName: "Zayed International Airport"
  },
  {
    ICAOCode: "OMDB",
    IATACode: "DXB",
    ShortName: "迪拜",
    CountryName: "阿拉伯联合酋长国",
    EnglishName: "Dubai International Airport"
  },
  {
    ICAOCode: "OMDW",
    IATACode: "DWC",
    ShortName: "迪拜阿勒马克图姆", // Clarified from "阿勒马克图姆"
    CountryName: "阿拉伯联合酋长国",
    EnglishName: "Al Maktoum International Airport"
  },
  {
    ICAOCode: "OOMS",
    IATACode: "MCT",
    ShortName: "马斯喀特",
    CountryName: "阿曼",
    EnglishName: "Muscat International Airport"
  },
  {
    ICAOCode: "OPKC", // Corrected from OCR "ОРКС"
    IATACode: "KHI",
    ShortName: "卡拉奇", // Corrected from PDF "金奈"
    CountryName: "巴基斯坦",
    EnglishName: "Jinnah International Airport"
  },
  {
    ICAOCode: "OPRN",
    IATACode: "ISB",
    ShortName: "伊斯兰堡", // Clarified from "伊斯"
    CountryName: "巴基斯坦",
    EnglishName: "Islamabad International Airport"
  },
  {
    ICAOCode: "OSDI",
    IATACode: "DAM",
    ShortName: "大马士革国际机场",
    CountryName: "叙利亚",
    EnglishName: "Damascus International Airport"
  },
  {
    ICAOCode: "PACD",
    IATACode: "CDB",
    ShortName: "科尔德湾",
    CountryName: "美国",
    EnglishName: "Cold Bay Airport"
  },
  {
    ICAOCode: "PAFA",
    IATACode: "FAI",
    ShortName: "费尔班克斯",
    CountryName: "美国",
    EnglishName: "Fairbanks International Airport"
  },
  {
    ICAOCode: "PAKN",
    IATACode: "AKN",
    ShortName: "金鲑鱼", // Literal translation of "KING SALMON"
    CountryName: "美国",
    EnglishName: "King Salmon Airport"
  },
  {
    ICAOCode: "PANC",
    IATACode: "ANC",
    ShortName: "安克雷奇",
    CountryName: "美国",
    EnglishName: "Ted Stevens Anchorage International Airport"
  },
  {
    ICAOCode: "PASY",
    IATACode: "SYA",
    ShortName: "谢米亚",
    CountryName: "美国",
    EnglishName: "Eareckson Air Station (Shemya Airport)"
  },
  {
    ICAOCode: "PGSN",
    IATACode: "SPN",
    ShortName: "塞班",
    CountryName: "美国",
    EnglishName: "Saipan International Airport"
  },
  {
    ICAOCode: "PGUM",
    IATACode: "GUM",
    ShortName: "关岛",
    CountryName: "美国",
    EnglishName: "Antonio B. Won Pat International Airport"
  },
  {
    ICAOCode: "PHKO", // Corrected from OCR "ΡΗΚΟ"
    IATACode: "KOA",
    ShortName: "科纳",
    CountryName: "美国",
    EnglishName: "Ellison Onizuka Kona International Airport at Keāhole"
  },
  {
    ICAOCode: "PHNL",
    IATACode: "HNL",
    ShortName: "火奴鲁鲁", // Clarified from "夏威夷"
    CountryName: "美国",
    EnglishName: "Daniel K. Inouye International Airport"
  },
  {
    ICAOCode: "PHTO",
    IATACode: "ITO",
    ShortName: "希洛",
    CountryName: "美国",
    EnglishName: "Hilo International Airport"
  },
  {
    ICAOCode: "PKMJ",
    IATACode: "MAJ",
    ShortName: "马朱罗", // Clarified from "马绍"
    CountryName: "马绍尔群岛",
    EnglishName: "Amata Kabua International Airport"
  },
  {
    ICAOCode: "PMDY",
    IATACode: "MDY",
    ShortName: "中途岛",
    CountryName: "美国",
    EnglishName: "Henderson Field (Midway Atoll)"
  },
  {
    ICAOCode: "PTPN",
    IATACode: "PNI",
    ShortName: "波纳佩",
    CountryName: "密克罗尼西亚",
    EnglishName: "Pohnpei International Airport"
  },
  {
    ICAOCode: "PWAK",
    IATACode: "AWK",
    ShortName: "威克岛",
    CountryName: "美国",
    EnglishName: "Wake Island Airfield"
  },
  {
    ICAOCode: "RCFN",
    IATACode: "TTT",
    ShortName: "台东",
    CountryName: "中国台湾",
    EnglishName: "Taitung Airport"
  },
  {
    ICAOCode: "RCKH", // Corrected from OCR "RCKΗ"
    IATACode: "KHH",
    ShortName: "高雄",
    CountryName: "中国台湾",
    EnglishName: "Kaohsiung International Airport"
  },
  {
    ICAOCode: "RCMQ",
    IATACode: "RMQ",
    ShortName: "台中",
    CountryName: "中国台湾",
    EnglishName: "Taichung International Airport"
  },
  {
    ICAOCode: "RCNN",
    IATACode: "TNN",
    ShortName: "台南",
    CountryName: "中国台湾",
    EnglishName: "Tainan Airport"
  },
  {
    ICAOCode: "RCSS",
    IATACode: "TSA",
    ShortName: "台北松山", // Clarified from "松山"
    CountryName: "中国台湾",
    EnglishName: "Taipei Songshan Airport"
  },
  {
    ICAOCode: "RCTP",
    IATACode: "TPE",
    ShortName: "台湾桃园", // Clarified from "桃园"
    CountryName: "中国台湾",
    EnglishName: "Taiwan Taoyuan International Airport"
  },
  {
    ICAOCode: "RCYU",
    IATACode: "HUN",
    ShortName: "花莲",
    CountryName: "中国台湾",
    EnglishName: "Hualien Airport"
  },
  {
    ICAOCode: "RJAA",
    IATACode: "NRT",
    ShortName: "东京成田", // Clarified from "东京"
    CountryName: "日本",
    EnglishName: "Narita International Airport"
  },
  {
    ICAOCode: "RJAF",
    IATACode: "MMJ",
    ShortName: "松本",
    CountryName: "日本",
    EnglishName: "Matsumoto Airport"
  },
  {
    ICAOCode: "RJAH",
    IATACode: "IBR",
    ShortName: "茨城",
    CountryName: "日本",
    EnglishName: "Ibaraki Airport"
  },
  {
    ICAOCode: "RJBB",
    IATACode: "KIX",
    ShortName: "大阪关西", // Clarified from "大阪"
    CountryName: "日本",
    EnglishName: "Kansai International Airport"
  },
  {
    ICAOCode: "RJCB",
    IATACode: "OBO",
    ShortName: "带广十胜", // Clarified from "带广"
    CountryName: "日本",
    EnglishName: "Tokachi-Obihiro Airport"
  },
  {
    ICAOCode: "RJCC",
    IATACode: "CTS",
    ShortName: "札幌新千岁", // Clarified from "札幌"
    CountryName: "日本",
    EnglishName: "New Chitose Airport"
  },
  {
    ICAOCode: "RJCH",
    IATACode: "HKD",
    ShortName: "函馆",
    CountryName: "日本",
    EnglishName: "Hakodate Airport"
  },
  {
    ICAOCode: "RJCK",
    IATACode: "KUH",
    ShortName: "钏路",
    CountryName: "日本",
    EnglishName: "Kushiro Airport"
  },
  {
    ICAOCode: "RJCM",
    IATACode: "MMB",
    ShortName: "女满别", // Corrected from "梅曼贝松"
    CountryName: "日本",
    EnglishName: "Memanbetsu Airport"
  },
  {
    ICAOCode: "RJDC",
    IATACode: "UBJ",
    ShortName: "山口宇部", // Clarified from "山口"
    CountryName: "日本",
    EnglishName: "Yamaguchi Ube Airport"
  },
  {
    ICAOCode: "RJEC",
    IATACode: "AKJ",
    ShortName: "旭川",
    CountryName: "日本",
    EnglishName: "Asahikawa Airport"
  },
  {
    ICAOCode: "RJFF",
    IATACode: "FUK",
    ShortName: "福冈",
    CountryName: "日本",
    EnglishName: "Fukuoka Airport"
  },
  {
    ICAOCode: "RJFK",
    IATACode: "KOJ",
    ShortName: "鹿儿岛",
    CountryName: "日本",
    EnglishName: "Kagoshima Airport"
  },
  {
    ICAOCode: "RJFM",
    IATACode: "KMI",
    ShortName: "宫崎", // Corrected from "宫崎骏"
    CountryName: "日本",
    EnglishName: "Miyazaki Airport"
  },
  {
    ICAOCode: "RJFO",
    IATACode: "OIT",
    ShortName: "大分", // Corrected from "大田"
    CountryName: "日本",
    EnglishName: "Oita Airport"
  },
  {
    ICAOCode: "RJFR",
    IATACode: "KKJ",
    ShortName: "北九州",
    CountryName: "日本",
    EnglishName: "Kitakyushu Airport"
  },
  {
    ICAOCode: "RJFS",
    IATACode: "HSG",
    ShortName: "佐贺", // Corrected from "传奇"
    CountryName: "日本",
    EnglishName: "Saga Airport (Kyushu Saga International Airport)"
  },
  {
    ICAOCode: "RJFT",
    IATACode: "KMJ",
    ShortName: "熊本",
    CountryName: "日本",
    EnglishName: "Aso Kumamoto Airport"
  },
  {
    ICAOCode: "RJFU",
    IATACode: "NGS",
    ShortName: "长崎",
    CountryName: "日本",
    EnglishName: "Nagasaki Airport"
  },
  {
    ICAOCode: "RJGG",
    IATACode: "NGO",
    ShortName: "名古屋中部", // Clarified from "名古"
    CountryName: "日本",
    EnglishName: "Chubu Centrair International Airport"
  },
  {
    ICAOCode: "RJKA",
    IATACode: "ASJ",
    ShortName: "奄美", // Corrected from "阿马米"
    CountryName: "日本",
    EnglishName: "Amami Airport"
  },
  {
    ICAOCode: "RJKN",
    IATACode: "TKN",
    ShortName: "德之岛", // Corrected from "德库诺岛"
    CountryName: "日本",
    EnglishName: "Tokunoshima Airport"
  },
  {
    ICAOCode: "RJNK",
    IATACode: "KMQ",
    ShortName: "小松",
    CountryName: "日本",
    EnglishName: "Komatsu Airport"
  },
  {
    ICAOCode: "RJNS",
    IATACode: "FSZ",
    ShortName: "静冈",
    CountryName: "日本",
    EnglishName: "Mt. Fuji Shizuoka Airport"
  },
  {
    ICAOCode: "RJNT",
    IATACode: "TOY", // Corrected from OCR "ΤΟΥ"
    ShortName: "富山",
    CountryName: "日本",
    EnglishName: "Toyama Airport"
  },
  {
    ICAOCode: "RJOA",
    IATACode: "HIJ",
    ShortName: "广岛",
    CountryName: "日本",
    EnglishName: "Hiroshima Airport"
  },
  {
    ICAOCode: "RJOB",
    IATACode: "OKJ",
    ShortName: "冈山",
    CountryName: "日本",
    EnglishName: "Okayama Airport"
  },
  {
    ICAOCode: "RJOC",
    IATACode: "IZO",
    ShortName: "出云", // Corrected from "伊祖莫"
    CountryName: "日本",
    EnglishName: "Izumo Enmusubi Airport"
  },
  {
    ICAOCode: "RJOH",
    IATACode: "YGJ",
    ShortName: "米子", // Corrected from "米霍"
    CountryName: "日本",
    EnglishName: "Miho-Yonago Airport (Yonago Kitaro Airport)"
  },
  {
    ICAOCode: "RJOK",
    IATACode: "KCZ",
    ShortName: "高知", // Corrected from "高知县"
    CountryName: "日本",
    EnglishName: "Kochi Ryoma Airport"
  },
  {
    ICAOCode: "RJOM",
    IATACode: "MYJ",
    ShortName: "松山（日本）", // Clarified from "松山"
    CountryName: "日本",
    EnglishName: "Matsuyama Airport"
  },
  {
    ICAOCode: "RJOO",
    IATACode: "ITM",
    ShortName: "大阪伊丹", // Clarified from "大阪"
    CountryName: "日本",
    EnglishName: "Osaka International Airport (Itami Airport)"
  },
  {
    ICAOCode: "RJOR",
    IATACode: "TTJ",
    ShortName: "鸟取",
    CountryName: "日本",
    EnglishName: "Tottori Sand Dunes Conan Airport"
  },
  {
    ICAOCode: "RJOT",
    IATACode: "TAK",
    ShortName: "高松",
    CountryName: "日本",
    EnglishName: "Takamatsu Airport"
  },
  {
    ICAOCode: "RJSA",
    IATACode: "AOJ",
    ShortName: "青森",
    CountryName: "日本",
    EnglishName: "Aomori Airport"
  },
  {
    ICAOCode: "RJSC",
    IATACode: "GAJ",
    ShortName: "山形",
    CountryName: "日本",
    EnglishName: "Yamagata Airport"
  },
  {
    ICAOCode: "RJSF",
    IATACode: "FKS",
    ShortName: "福岛",
    CountryName: "日本",
    EnglishName: "Fukushima Airport"
  },
  {
    ICAOCode: "RJSI", // Corrected from OCR "RJSI"
    IATACode: "HNA", // Corrected from OCR "ΗΝΑ"
    ShortName: "岩手花卷",
    CountryName: "日本",
    EnglishName: "Hanamaki Airport (Iwate Hanamaki Airport)"
  },
  {
    ICAOCode: "RJSK",
    IATACode: "AXT",
    ShortName: "秋田",
    CountryName: "日本",
    EnglishName: "Akita Airport"
  },
  {
    ICAOCode: "RJSN",
    IATACode: "KIJ",
    ShortName: "新潟", // Corrected from "新泻"
    CountryName: "日本",
    EnglishName: "Niigata Airport"
  },
  {
    ICAOCode: "RJSS",
    IATACode: "SDJ",
    ShortName: "仙台",
    CountryName: "日本",
    EnglishName: "Sendai Airport"
  },
  {
    ICAOCode: "RJSY",
    IATACode: "SYO",
    ShortName: "庄内", // Corrected from "肖纳伊"
    CountryName: "日本",
    EnglishName: "Shonai Airport"
  },
  {
    ICAOCode: "RJTT",
    IATACode: "HND",
    ShortName: "东京羽田", // Clarified from "羽田"
    CountryName: "日本",
    EnglishName: "Tokyo International Airport (Haneda Airport)"
  },
  {
    ICAOCode: "RKJB",
    IATACode: "KWJ", // Corrected from PDF "MWX"
    ShortName: "光州空军基地", // Clarified from "光州"
    CountryName: "韩国",
    EnglishName: "Gwangju Air Base"
  },
  {
    ICAOCode: "RKJJ",
    IATACode: "KWJ",
    ShortName: "光州机场", // Clarified from "光州"
    CountryName: "韩国",
    EnglishName: "Gwangju Airport"
  },
  {
    ICAOCode: "RKJY",
    IATACode: "RSU",
    ShortName: "丽水",
    CountryName: "韩国",
    EnglishName: "Yeosu Airport"
  },
  {
    ICAOCode: "RKNN",
    IATACode: "KAG",
    ShortName: "江陵", // Corrected from "甘内昂"
    CountryName: "韩国",
    EnglishName: "Gangneung Air Base"
  },
  {
    ICAOCode: "RKNY",
    IATACode: "YNY",
    ShortName: "襄阳",
    CountryName: "韩国",
    EnglishName: "Yangyang International Airport"
  },
  {
    ICAOCode: "RKPC",
    IATACode: "CJU",
    ShortName: "济州",
    CountryName: "韩国",
    EnglishName: "Jeju International Airport"
  },
  {
    ICAOCode: "RKPK",
    IATACode: "PUS",
    ShortName: "釜山金海", // Clarified from "釜山"
    CountryName: "韩国",
    EnglishName: "Gimhae International Airport"
  },
  {
    ICAOCode: "RKSI",
    IATACode: "ICN",
    ShortName: "首尔仁川", // Clarified from "首尔"
    CountryName: "韩国",
    EnglishName: "Incheon International Airport"
  },
  {
    ICAOCode: "RKSS",
    IATACode: "GMP",
    ShortName: "首尔金浦", // Clarified from "金浦"
    CountryName: "韩国",
    EnglishName: "Gimpo International Airport"
  },
  {
    ICAOCode: "RKTN",
    IATACode: "TAE",
    ShortName: "大邱",
    CountryName: "韩国",
    EnglishName: "Daegu International Airport"
  },
  {
    ICAOCode: "RKTU",
    IATACode: "CJJ",
    ShortName: "清州",
    CountryName: "韩国",
    EnglishName: "Cheongju International Airport"
  },
  {
    ICAOCode: "ROAH",
    IATACode: "OKA",
    ShortName: "冲绳那霸", // Clarified from "冲绳"
    CountryName: "日本",
    EnglishName: "Naha Airport"
  },
  {
    ICAOCode: "ROIG",
    IATACode: "ISG",
    ShortName: "石垣", // Corrected from "石桓"
    CountryName: "日本",
    EnglishName: "New Ishigaki Airport (Painushima Ishigaki Airport)"
  },
  {
    ICAOCode: "RORS",
    IATACode: "SHI",
    ShortName: "下地岛", // Corrected from "石木岛"
    CountryName: "日本",
    EnglishName: "Shimojishima Airport"
  },
  {
    ICAOCode: "RPLB",
    IATACode: "SFS",
    ShortName: "苏比克湾",
    CountryName: "菲律宾",
    EnglishName: "Subic Bay International Airport"
  },
  {
    ICAOCode: "RPLC",
    IATACode: "CRK",
    ShortName: "克拉克", // Clarified from "克拉"
    CountryName: "菲律宾",
    EnglishName: "Clark International Airport"
  },
  {
    ICAOCode: "RPLI",
    IATACode: "LAO",
    ShortName: "拉瓦格",
    CountryName: "菲律宾",
    EnglishName: "Laoag International Airport"
  },
  {
    ICAOCode: "RPLL",
    IATACode: "MNL",
    ShortName: "马尼拉",
    CountryName: "菲律宾",
    EnglishName: "Ninoy Aquino International Airport"
  },
  {
    ICAOCode: "RPMD",
    IATACode: "DVO",
    ShortName: "达沃",
    CountryName: "菲律宾",
    EnglishName: "Francisco Bangoy International Airport (Davao)"
  },
  {
    ICAOCode: "RPVK",
    IATACode: "KLO",
    ShortName: "卡利博",
    CountryName: "菲律宾",
    EnglishName: "Kalibo International Airport"
  },
  {
    ICAOCode: "RPVM",
    IATACode: "CEB",
    ShortName: "宿务",
    CountryName: "菲律宾",
    EnglishName: "Mactan-Cebu International Airport"
  },
  {
    ICAOCode: "TAPA", // Corrected from OCR "ΤΑΡΑ"
    IATACode: "ANU",
    ShortName: "安提瓜", // Corrected from "维尔伯德"
    CountryName: "安提瓜和巴布达",
    EnglishName: "V. C. Bird International Airport"
  },
  {
    ICAOCode: "UACC",
    IATACode: "NQZ",
    ShortName: "努尔苏丹", // Corrected from "阿克"
    CountryName: "哈萨克斯坦",
    EnglishName: "Nursultan Nazarbayev International Airport"
  },
  {
    ICAOCode: "UAFO",
    IATACode: "OSS",
    ShortName: "奥什",
    CountryName: "吉尔吉斯斯坦",
    EnglishName: "Osh International Airport"
  },
  {
    ICAOCode: "UAKK",
    IATACode: "KGF",
    ShortName: "卡拉干达",
    CountryName: "哈萨克斯坦",
    EnglishName: "Sary-Arka Airport (Karaganda)"
  },
  {
    ICAOCode: "UEEE",
    IATACode: "YKS",
    ShortName: "雅库茨克",
    CountryName: "俄罗斯",
    EnglishName: "Yakutsk Airport"
  },
  {
    ICAOCode: "UELL",
    IATACode: "NER",
    ShortName: "涅留格里", // Clarified from "丘尔曼"
    CountryName: "俄罗斯",
    EnglishName: "Chulman Neryungri Airport"
  },
  {
    ICAOCode: "UERR",
    IATACode: "MJZ",
    ShortName: "米尔内",
    CountryName: "俄罗斯",
    EnglishName: "Mirny Airport"
  },
  {
    ICAOCode: "UHBB",
    IATACode: "BQS",
    ShortName: "布拉戈维申斯克", // Clarified from "伊格纳蒂沃"
    CountryName: "俄罗斯",
    EnglishName: "Ignatyevo Airport (Blagoveshchensk)"
  },
  {
    ICAOCode: "UHHH", // Corrected from OCR "UHHΗ"
    IATACode: "KHV",
    ShortName: "哈巴罗夫斯克", // Corrected from "伯力"
    CountryName: "俄罗斯",
    EnglishName: "Khabarovsk Novy Airport"
  },
  {
    ICAOCode: "UHMA", // Corrected from OCR "UHΜΑ"
    IATACode: "DYR",
    ShortName: "阿纳德尔", // Corrected from "乌戈尼"
    CountryName: "俄罗斯",
    EnglishName: "Ugolny Airport (Anadyr)"
  },
  {
    ICAOCode: "UHMM",
    IATACode: "GDX",
    ShortName: "马加丹", // Clarified from "索科尔"
    CountryName: "俄罗斯",
    EnglishName: "Sokol Airport (Magadan)"
  },
  {
    ICAOCode: "UHPP",
    IATACode: "PKC",
    ShortName: "堪察加彼得罗巴甫洛夫斯克", // Corrected from "彼得曼"
    CountryName: "俄罗斯",
    EnglishName: "Yelizovo Airport (Petropavlovsk-Kamchatsky)"
  },
  {
    ICAOCode: "UHWW",
    IATACode: "VVO",
    ShortName: "符拉迪沃斯托克", // Corrected from "海参威"
    CountryName: "俄罗斯",
    EnglishName: "Vladivostok International Airport (Knevichi)"
  },
  {
    ICAOCode: "UIBB",
    IATACode: "BTK",
    ShortName: "布拉茨克",
    CountryName: "俄罗斯",
    EnglishName: "Bratsk Airport"
  },
  {
    ICAOCode: "UIII", // Corrected from OCR "UIIΙ"
    IATACode: "IKT",
    ShortName: "伊尔库茨克",
    CountryName: "俄罗斯",
    EnglishName: "Irkutsk International Airport"
  },
  {
    ICAOCode: "ULLI",
    IATACode: "LED",
    ShortName: "圣彼得堡",
    CountryName: "俄罗斯",
    EnglishName: "Pulkovo Airport (Saint Petersburg)"
  },
  {
    ICAOCode: "UMMS",
    IATACode: "MSQ",
    ShortName: "明斯克",
    CountryName: "白俄罗斯",
    EnglishName: "Minsk National Airport"
  },
  {
    ICAOCode: "UNAA",
    IATACode: "ABA",
    ShortName: "阿巴坎",
    CountryName: "俄罗斯",
    EnglishName: "Abakan International Airport"
  },
  {
    ICAOCode: "UNKL",
    IATACode: "KJA",
    ShortName: "克拉斯诺亚尔斯克", // Corrected from "叶梅利亚诺夫"
    CountryName: "俄罗斯",
    EnglishName: "Krasnoyarsk International Airport (Yemelyanovo)"
  },
  {
    ICAOCode: "UNNT",
    IATACode: "OVB",
    ShortName: "新西伯利亚",
    CountryName: "俄罗斯",
    EnglishName: "Novosibirsk Tolmachevo Airport"
  },
  {
    ICAOCode: "UOOO", // PDF has UOOO/NSK for Alykel (Norilsk) which is wrong.
    IATACode: "OSW", // Corrected. UOOO is Orsk Airport (OSW). PDF has NSK.
    ShortName: "奥尔斯克", // Corrected from "阿莱克尔" (Alykel) to match UOOO.
    CountryName: "俄罗斯",
    EnglishName: "Orsk Airport"
  },
  {
    ICAOCode: "USCC",
    IATACode: "CEK",
    ShortName: "车里雅宾斯克", // Clarified from "车里"
    CountryName: "俄罗斯",
    EnglishName: "Chelyabinsk Balandino Airport"
  },
  {
    ICAOCode: "USDD",
    IATACode: "SLY",
    ShortName: "萨列哈尔德",
    CountryName: "俄罗斯",
    EnglishName: "Salekhard Airport"
  },
  {
    ICAOCode: "USSS",
    IATACode: "SVX",
    ShortName: "叶卡捷琳堡",
    CountryName: "俄罗斯",
    EnglishName: "Koltsovo International Airport (Yekaterinburg)"
  },
  {
    ICAOCode: "USTR",
    IATACode: "TJM",
    ShortName: "秋明", // Clarified from "罗斯希诺"
    CountryName: "俄罗斯",
    EnglishName: "Roshchino International Airport (Tyumen)"
  },
  {
    ICAOCode: "UTDD",
    IATACode: "DYU",
    ShortName: "杜尚别",
    CountryName: "塔吉克斯坦",
    EnglishName: "Dushanbe International Airport"
  },
  {
    ICAOCode: "UTDL",
    IATACode: "LBD",
    ShortName: "苦盏", // Corrected from "胡贾"
    CountryName: "塔吉克斯坦",
    EnglishName: "Khujand Airport"
  },
  {
    ICAOCode: "UUDD",
    IATACode: "DME",
    ShortName: "莫斯科多莫杰多沃", // Clarified from "莫斯科"
    CountryName: "俄罗斯",
    EnglishName: "Moscow Domodedovo Airport"
  },
  {
    ICAOCode: "UUEE",
    IATACode: "SVO",
    ShortName: "莫斯科谢列梅捷沃", // Clarified from "莫斯科"
    CountryName: "俄罗斯",
    EnglishName: "Sheremetyevo International Airport (Moscow)"
  },
  {
    ICAOCode: "UUWW",
    IATACode: "VKO",
    ShortName: "莫斯科伏努科沃",
    CountryName: "俄罗斯",
    EnglishName: "Vnukovo International Airport (Moscow)"
  },
  {
    ICAOCode: "UWKD",
    IATACode: "KZN",
    ShortName: "喀山",
    CountryName: "俄罗斯",
    EnglishName: "Kazan International Airport"
  },
  {
    ICAOCode: "UWLW",
    IATACode: "ULY",
    ShortName: "乌里扬诺夫斯克/东方港",
    CountryName: "俄罗斯",
    EnglishName: "Ulyanovsk Vostochny Airport"
  },
  {
    ICAOCode: "VAAH",
    IATACode: "AMD",
    ShortName: "艾哈迈达巴德",
    CountryName: "印度",
    EnglishName: "Sardar Vallabhbhai Patel International Airport (Ahmedabad)"
  },
  {
    ICAOCode: "VABB",
    IATACode: "BOM",
    ShortName: "孟买/贾特拉帕蒂·希瓦吉",
    CountryName: "印度",
    EnglishName: "Chhatrapati Shivaji Maharaj International Airport (Mumbai)"
  },
  {
    ICAOCode: "VCBI",
    IATACode: "CMB",
    ShortName: "科伦坡",
    CountryName: "斯里兰卡",
    EnglishName: "Bandaranaike International Airport (Colombo)"
  },
  {
    ICAOCode: "VCRI",
    IATACode: "HRI",
    ShortName: "汉班托塔", // Clarified from "拉贾帕克萨"
    CountryName: "斯里兰卡",
    EnglishName: "Mattala Rajapaksa International Airport (Hambantota)"
  },
  {
    ICAOCode: "VDPP",
    IATACode: "PNH",
    ShortName: "金边",
    CountryName: "柬埔寨",
    EnglishName: "Phnom Penh International Airport"
  },
  { // Added from report
    ICAOCode: "VDSA",
    IATACode: "SAI",
    ShortName: "暹粒吴哥",
    CountryName: "柬埔寨",
    EnglishName: "Siem Reap–Angkor International Airport"
  },
  {
    ICAOCode: "VDSR",
    IATACode: "REP",
    ShortName: "暹粒",
    CountryName: "柬埔寨",
    EnglishName: "Siem Reap-Angkor International Airport",
    // Note: Replaced by SAI (VDSA) for most international flights since Oct 2023.
  },
  {
    ICAOCode: "VEBS",
    IATACode: "BBI",
    ShortName: "布巴内斯瓦尔",
    CountryName: "印度",
    EnglishName: "Biju Patnaik International Airport (Bhubaneswar)"
  },
  {
    ICAOCode: "VECC",
    IATACode: "CCU",
    ShortName: "加尔各答",
    CountryName: "印度",
    EnglishName: "Netaji Subhash Chandra Bose International Airport (Kolkata)"
  },
  {
    ICAOCode: "VGEG",
    IATACode: "CGP",
    ShortName: "吉大港",
    CountryName: "孟加拉国",
    EnglishName: "Shah Amanat International Airport (Chittagong)"
  },
  {
    ICAOCode: "VGHS",
    IATACode: "DAC",
    ShortName: "达卡",
    CountryName: "孟加拉国",
    EnglishName: "Hazrat Shahjalal International Airport (Dhaka)"
  },
  {
    ICAOCode: "VHHH",
    IATACode: "HKG",
    ShortName: "香港",
    CountryName: "中国香港",
    EnglishName: "Hong Kong International Airport"
  },
  {
    ICAOCode: "VIAR",
    IATACode: "ATQ",
    ShortName: "阿姆利则",
    CountryName: "印度",
    EnglishName: "Sri Guru Ram Dass Jee International Airport (Amritsar)"
  },
  {
    ICAOCode: "VIDP",
    IATACode: "DEL",
    ShortName: "德里",
    CountryName: "印度",
    EnglishName: "Indira Gandhi International Airport (Delhi)"
  },
  {
    ICAOCode: "VIJP",
    IATACode: "JAI",
    ShortName: "斋普尔",
    CountryName: "印度",
    EnglishName: "Jaipur International Airport"
  },
  {
    ICAOCode: "VILK",
    IATACode: "LKO",
    ShortName: "勒克瑙乔杜里查兰辛格",
    CountryName: "印度",
    EnglishName: "Chaudhary Charan Singh International Airport (Lucknow)"
  },
  {
    ICAOCode: "VLLB",
    IATACode: "LPQ",
    ShortName: "琅勃拉邦",
    CountryName: "老挝",
    EnglishName: "Luang Prabang International Airport"
  },
  {
    ICAOCode: "VLVT",
    IATACode: "VTE",
    ShortName: "万象",
    CountryName: "老挝",
    EnglishName: "Wattay International Airport (Vientiane)"
  },
  {
    ICAOCode: "VMMC",
    IATACode: "MFM",
    ShortName: "澳门",
    CountryName: "中国澳门",
    EnglishName: "Macau International Airport"
  },
  { // Added from report
    ICAOCode: "VNPR",
    IATACode: "PHH",
    ShortName: "博卡拉",
    CountryName: "尼泊尔",
    EnglishName: "Pokhara International Airport"
  },
  {
    ICAOCode: "VNKT",
    IATACode: "KTM",
    ShortName: "加德满都",
    CountryName: "尼泊尔",
    EnglishName: "Tribhuvan International Airport (Kathmandu)"
  },
  {
    ICAOCode: "VOBL",
    IATACode: "BLR",
    ShortName: "班加罗尔", // Corrected from "肯戈德达"
    CountryName: "印度",
    EnglishName: "Kempegowda International Airport Bengaluru"
  },
  {
    ICAOCode: "VOCI",
    IATACode: "COK",
    ShortName: "科钦国际机场",
    CountryName: "印度",
    EnglishName: "Cochin International Airport"
  },
  { // Added from report
    ICAOCode: "VOGA",
    IATACode: "GOX",
    ShortName: "马诺哈尔(莫帕)",
    CountryName: "印度",
    EnglishName: "Manohar International Airport (Mopa Airport)"
  },
  {
    ICAOCode: "VOHS",
    IATACode: "HYD",
    ShortName: "海得拉巴", // Clarified from "拉吉夫甘地"
    CountryName: "印度",
    EnglishName: "Rajiv Gandhi International Airport (Hyderabad)"
  },
  {
    ICAOCode: "VOMM",
    IATACode: "MAA",
    ShortName: "金奈",
    CountryName: "印度",
    EnglishName: "Chennai International Airport"
  },
  {
    ICAOCode: "VOTV",
    IATACode: "TRV",
    ShortName: "特里凡得琅",
    CountryName: "印度",
    EnglishName: "Trivandrum International Airport"
  },
  {
    ICAOCode: "VRMM",
    IATACode: "MLE",
    ShortName: "马累",
    CountryName: "马尔代夫",
    EnglishName: "Velana International Airport (Malé)"
  },
  {
    ICAOCode: "VTBD",
    IATACode: "DMK",
    ShortName: "曼谷/廊曼国际机场",
    CountryName: "泰国",
    EnglishName: "Don Mueang International Airport (Bangkok)"
  },
  {
    ICAOCode: "VTBS",
    IATACode: "BKK",
    ShortName: "曼谷素万那普", // Clarified from "曼谷"
    CountryName: "泰国",
    EnglishName: "Suvarnabhumi Airport (Bangkok)"
  },
  {
    ICAOCode: "VTBU",
    IATACode: "UTP",
    ShortName: "乌塔堡",
    CountryName: "泰国",
    EnglishName: "U-Tapao Rayong-Pattaya International Airport"
  },
  {
    ICAOCode: "VTCC",
    IATACode: "CNX",
    ShortName: "清迈",
    CountryName: "泰国",
    EnglishName: "Chiang Mai International Airport"
  },
  {
    ICAOCode: "VTCT",
    IATACode: "CEI",
    ShortName: "清莱",
    CountryName: "泰国",
    EnglishName: "Mae Fah Luang - Chiang Rai International Airport"
  },
  {
    ICAOCode: "VTSB",
    IATACode: "URT",
    ShortName: "素叻他尼", // Corrected from "苏拉"
    CountryName: "泰国",
    EnglishName: "Surat Thani International Airport"
  },
  {
    ICAOCode: "VTSG",
    IATACode: "KBV",
    ShortName: "甲米",
    CountryName: "泰国",
    EnglishName: "Krabi International Airport"
  },
  {
    ICAOCode: "VTSP",
    IATACode: "HKT",
    ShortName: "普吉", // Clarified from "普吉岛"
    CountryName: "泰国",
    EnglishName: "Phuket International Airport"
  },
  {
    ICAOCode: "VTSS",
    IATACode: "HDY",
    ShortName: "合艾国际机场", // Clarified from "宋卡/合艾国际机场"
    CountryName: "泰国",
    EnglishName: "Hat Yai International Airport"
  },
  {
    ICAOCode: "VVCI",
    IATACode: "HPH",
    ShortName: "海防",
    CountryName: "越南",
    EnglishName: "Cat Bi International Airport (Haiphong)"
  },
  {
    ICAOCode: "VVCR",
    IATACode: "CXR",
    ShortName: "芽庄",
    CountryName: "越南",
    EnglishName: "Cam Ranh International Airport (Nha Trang)"
  },
  {
    ICAOCode: "VVDN",
    IATACode: "DAD",
    ShortName: "岘港",
    CountryName: "越南",
    EnglishName: "Da Nang International Airport"
  },
  {
    ICAOCode: "VVNB",
    IATACode: "HAN",
    ShortName: "河内",
    CountryName: "越南",
    EnglishName: "Noi Bai International Airport (Hanoi)"
  },
  {
    ICAOCode: "VVPQ",
    IATACode: "PQC",
    ShortName: "富国岛",
    CountryName: "越南",
    EnglishName: "Phu Quoc International Airport"
  },
  {
    ICAOCode: "VVTS",
    IATACode: "SGN",
    ShortName: "胡志明市", // Clarified from "胡志明"
    CountryName: "越南",
    EnglishName: "Tan Son Nhat International Airport (Ho Chi Minh City)"
  },
  {
    ICAOCode: "VYMD",
    IATACode: "MDL",
    ShortName: "曼德勒",
    CountryName: "缅甸",
    EnglishName: "Mandalay International Airport"
  },
  {
    ICAOCode: "VYNT",
    IATACode: "NYT",
    ShortName: "内比都",
    CountryName: "缅甸",
    EnglishName: "Naypyidaw International Airport"
  },
  {
    ICAOCode: "VYYY",
    IATACode: "RGN",
    ShortName: "仰光",
    CountryName: "缅甸",
    EnglishName: "Yangon International Airport"
  },
  {
    ICAOCode: "WAAA",
    IATACode: "UPG",
    ShortName: "望加锡", // Corrected from "乌戎潘当/哈萨努丁"
    CountryName: "印度尼西亚",
    EnglishName: "Sultan Hasanuddin International Airport (Makassar)"
  },
  {
    ICAOCode: "WABB",
    IATACode: "BIK",
    ShortName: "比亚克", // Corrected from "弗兰斯凯西波"
    CountryName: "印度尼西亚",
    EnglishName: "Frans Kaisiepo Airport (Biak)"
  },
  {
    ICAOCode: "WADD",
    IATACode: "DPS",
    ShortName: "巴厘岛",
    CountryName: "印度尼西亚",
    EnglishName: "I Gusti Ngurah Rai International Airport (Denpasar, Bali)"
  },
  {
    ICAOCode: "WAJJ",
    IATACode: "DJJ",
    ShortName: "查亚普拉", // Corrected from "查亚普拉仙谷"
    CountryName: "印度尼西亚",
    EnglishName: "Sentani International Airport (Jayapura)"
  },
  {
    ICAOCode: "WAMM",
    IATACode: "MDC",
    ShortName: "万鸦老", // Corrected from "萨姆"
    CountryName: "印度尼西亚",
    EnglishName: "Sam Ratulangi International Airport (Manado)"
  },
  {
    ICAOCode: "WAPP",
    IATACode: "AMQ",
    ShortName: "安汶",
    CountryName: "印度尼西亚",
    EnglishName: "Pattimura Airport (Ambon)"
  },
  {
    ICAOCode: "WARR",
    IATACode: "SUB",
    ShortName: "泗水朱安达",
    CountryName: "印度尼西亚",
    EnglishName: "Juanda International Airport (Surabaya)"
  },
  {
    ICAOCode: "WBGG",
    IATACode: "KCH",
    ShortName: "古晋国际机场",
    CountryName: "马来西亚",
    EnglishName: "Kuching International Airport"
  },
  {
    ICAOCode: "WBGR",
    IATACode: "MYY",
    ShortName: "米里",
    CountryName: "马来西亚",
    EnglishName: "Miri Airport"
  },
  {
    ICAOCode: "WBKK",
    IATACode: "BKI",
    ShortName: "哥打京那巴鲁", // Corrected from "沙巴"
    CountryName: "马来西亚",
    EnglishName: "Kota Kinabalu International Airport"
  },
  {
    ICAOCode: "WBSB",
    IATACode: "BWN",
    ShortName: "文莱",
    CountryName: "文莱",
    EnglishName: "Brunei International Airport"
  },
  {
    ICAOCode: "WIHH",
    IATACode: "HLP",
    ShortName: "雅加达哈利姆", // Clarified from "哈利姆·佩尔达纳库苏马"
    CountryName: "印度尼西亚",
    EnglishName: "Halim Perdanakusuma International Airport (Jakarta)"
  },
  {
    ICAOCode: "WIII",
    IATACode: "CGK",
    ShortName: "雅加达苏加诺-哈达", // Clarified from "苏加诺"
    CountryName: "印度尼西亚",
    EnglishName: "Soekarno-Hatta International Airport (Jakarta)"
  },
  {
    ICAOCode: "WIPP",
    IATACode: "PLM",
    ShortName: "巨港", // Clarified from "马哈茂德巴达鲁丁二世"
    CountryName: "印度尼西亚",
    EnglishName: "Sultan Mahmud Badaruddin II International Airport (Palembang)"
  },
  {
    ICAOCode: "WMKJ",
    IATACode: "JHB",
    ShortName: "新山",
    CountryName: "马来西亚",
    EnglishName: "Senai International Airport (Johor Bahru)"
  },
  {
    ICAOCode: "WMKK",
    IATACode: "KUL",
    ShortName: "吉隆坡",
    CountryName: "马来西亚",
    EnglishName: "Kuala Lumpur International Airport"
  },
  {
    ICAOCode: "WMKL",
    IATACode: "LGK",
    ShortName: "兰卡威",
    CountryName: "马来西亚",
    EnglishName: "Langkawi International Airport"
  },
  {
    ICAOCode: "WMKP",
    IATACode: "PEN",
    ShortName: "槟城",
    CountryName: "马来西亚",
    EnglishName: "Penang International Airport"
  },
  {
    ICAOCode: "WSAP",
    IATACode: "QPG",
    ShortName: "巴耶利峇",
    CountryName: "新加坡",
    EnglishName: "Paya Lebar Air Base"
  },
  {
    ICAOCode: "WSSL",
    IATACode: "XSP",
    ShortName: "实里达",
    CountryName: "新加坡",
    EnglishName: "Seletar Airport"
  },
  {
    ICAOCode: "WSSS",
    IATACode: "SIN",
    ShortName: "新加坡樟宜", // Clarified from "新加坡"
    CountryName: "新加坡",
    EnglishName: "Singapore Changi Airport"
  },
  {
    ICAOCode: "YBAS",
    IATACode: "ASP",
    ShortName: "爱丽斯斯普林斯",
    CountryName: "澳大利亚",
    EnglishName: "Alice Springs Airport"
  },
  {
    ICAOCode: "YBBN",
    IATACode: "BNE",
    ShortName: "布里斯班",
    CountryName: "澳大利亚",
    EnglishName: "Brisbane Airport"
  },
  {
    ICAOCode: "YBCG",
    IATACode: "OOL",
    ShortName: "黄金海岸", // Clarified from "海岸"
    CountryName: "澳大利亚",
    EnglishName: "Gold Coast Airport"
  },
  {
    ICAOCode: "YBCS",
    IATACode: "CNS",
    ShortName: "凯恩斯",
    CountryName: "澳大利亚",
    EnglishName: "Cairns Airport"
  },
  {
    ICAOCode: "YBRK",
    IATACode: "ROK",
    ShortName: "罗克汉普顿",
    CountryName: "澳大利亚",
    EnglishName: "Rockhampton Airport"
  },
  {
    ICAOCode: "YMML",
    IATACode: "MEL",
    ShortName: "墨尔本",
    CountryName: "澳大利亚",
    EnglishName: "Melbourne Airport (Tullamarine)"
  },
  {
    ICAOCode: "YPAD",
    IATACode: "ADL",
    ShortName: "阿德莱德",
    CountryName: "澳大利亚",
    EnglishName: "Adelaide Airport"
  },
  {
    ICAOCode: "YPDN",
    IATACode: "DRW",
    ShortName: "达尔文",
    CountryName: "澳大利亚",
    EnglishName: "Darwin International Airport"
  },
  {
    ICAOCode: "YPPH", // Corrected from OCR "YPPΗ"
    IATACode: "PER",
    ShortName: "珀斯",
    CountryName: "澳大利亚",
    EnglishName: "Perth Airport"
  },
  {
    ICAOCode: "YPTN",
    IATACode: "KTR",
    ShortName: "廷达尔", // Corrected from "丁达尔"
    CountryName: "澳大利亚",
    EnglishName: "RAAF Base Tindal"
  },
  {
    ICAOCode: "YSCB",
    IATACode: "CBR",
    ShortName: "堪培拉",
    CountryName: "澳大利亚",
    EnglishName: "Canberra Airport"
  },
  {
    ICAOCode: "YSSY",
    IATACode: "SYD",
    ShortName: "悉尼",
    CountryName: "澳大利亚",
    EnglishName: "Sydney Kingsford Smith Airport"
  },
  {
    ICAOCode: "ZBAA",
    IATACode: "PEK",
    ShortName: "北京首都", // Clarified from "北京"
    CountryName: "中国",
    EnglishName: "Beijing Capital International Airport"
  },
  {
    ICAOCode: "ZBAD",
    IATACode: "PKX",
    ShortName: "北京大兴",
    CountryName: "中国",
    EnglishName: "Beijing Daxing International Airport"
  },
  {
    ICAOCode: "ZBCD",
    IATACode: "CDE",
    ShortName: "承德普宁", // Clarified from "承德"
    CountryName: "中国",
    EnglishName: "Chengde Puning Airport"
  },
  {
    ICAOCode: "ZBCF",
    IATACode: "CIF",
    ShortName: "赤峰玉龙", // Clarified from "赤峰"
    CountryName: "中国",
    EnglishName: "Chifeng Yulong Airport"
  },
  {
    ICAOCode: "ZBCZ",
    IATACode: "CIH",
    ShortName: "长治王村", // Clarified from "长治"
    CountryName: "中国",
    EnglishName: "Changzhi Wangcun Airport"
  },
  {
    ICAOCode: "ZBDH",
    IATACode: "BPE",
    ShortName: "秦皇岛北戴河", // Clarified from "北戴河"
    CountryName: "中国",
    EnglishName: "Qinhuangdao Beidaihe Airport"
  },
  {
    ICAOCode: "ZBDS",
    IATACode: "DSN",
    ShortName: "鄂尔多斯伊金霍洛", // Clarified from "鄂尔"
    CountryName: "中国",
    EnglishName: "Ordos Ejin Horo International Airport"
  },
  {
    ICAOCode: "ZBDT",
    IATACode: "DAT",
    ShortName: "大同云冈", // Clarified from "大同"
    CountryName: "中国",
    EnglishName: "Datong Yungang Airport"
  },
  {
    ICAOCode: "ZBER",
    IATACode: "ERL",
    ShortName: "二连浩特赛乌素",
    CountryName: "中国",
    EnglishName: "Erenhot Saiwusu International Airport"
  },
  {
    ICAOCode: "ZBES",
    IATACode: "YIE",
    ShortName: "阿尔山伊尔施", // Clarified from "阿尔山"
    CountryName: "中国",
    EnglishName: "Aershan Yi'ershi Airport"
  },
  {
    ICAOCode: "ZBHD",
    IATACode: "HDG",
    ShortName: "邯郸",
    CountryName: "中国",
    EnglishName: "Handan Airport"
  },
  { // Updated from report, new airport replacing old one
    ICAOCode: "ZBHH",
    IATACode: "HET",
    ShortName: "呼和浩特盛乐",
    CountryName: "中国",
    EnglishName: "Hohhot Shengle International Airport",
    // Note: Replaces Hohhot Baita International Airport (ZBHH), expected to open late 2025.
  },
  {
    ICAOCode: "ZBLA",
    IATACode: "HLD",
    ShortName: "海拉尔东山", // Clarified from "海拉尔"
    CountryName: "中国",
    EnglishName: "Hulunbuir Hailar Airport"
  },
  {
    ICAOCode: "ZBLF",
    IATACode: "LFQ",
    ShortName: "临汾乔李", // Clarified from "临汾"
    CountryName: "中国",
    EnglishName: "Linfen Qiaoli Airport"
  },
  {
    ICAOCode: "ZBLL",
    IATACode: "LLV",
    ShortName: "吕梁大武", // Clarified from "吕梁"
    CountryName: "中国",
    EnglishName: "Lüliang Dawu Airport"
  },
  {
    ICAOCode: "ZBMZ",
    IATACode: "NZH",
    ShortName: "满洲里西郊", // Clarified from "满洲"
    CountryName: "中国",
    EnglishName: "Manzhouli Xijiao Airport"
  },
  {
    ICAOCode: "ZBNY",
    IATACode: "NAY",
    ShortName: "北京南苑", // Clarified from "南苑"
    CountryName: "中国",
    EnglishName: "Beijing Nanyuan Airport (Closed)"
  },
  {
    ICAOCode: "ZBOW",
    IATACode: "BAV",
    ShortName: "包头",
    CountryName: "中国",
    EnglishName: "Baotou Airport"
  },
  {
    ICAOCode: "ZBSH",
    IATACode: "SHP",
    ShortName: "秦皇岛山海关", // Clarified from "秦皇"
    CountryName: "中国",
    EnglishName: "Qinhuangdao Shanhaiguan Airport"
  },
  {
    ICAOCode: "ZBSJ",
    IATACode: "SJW",
    ShortName: "石家庄正定", // Clarified from "石家庄"
    CountryName: "中国",
    EnglishName: "Shijiazhuang Zhengding International Airport"
  },
  {
    ICAOCode: "ZBSN",
    IATACode: "TVS",
    ShortName: "唐山三女河", // Clarified from "唐山"
    CountryName: "中国",
    EnglishName: "Tangshan Sannühe Airport"
  },
  {
    ICAOCode: "ZBTJ",
    IATACode: "TSN",
    ShortName: "天津滨海", // Clarified from "天津"
    CountryName: "中国",
    EnglishName: "Tianjin Binhai International Airport"
  },
  {
    ICAOCode: "ZBTL",
    IATACode: "TGO",
    ShortName: "通辽",
    CountryName: "中国",
    EnglishName: "Tongliao Airport"
  },
  {
    ICAOCode: "ZBUC",
    IATACode: "UCB",
    ShortName: "乌兰察布集宁", // Clarified from "乌兰察布"
    CountryName: "中国",
    EnglishName: "Ulanqab Jining Airport"
  },
  {
    ICAOCode: "ZBUH",
    IATACode: "WUA",
    ShortName: "乌海",
    CountryName: "中国",
    EnglishName: "Wuhai Airport"
  },
  {
    ICAOCode: "ZBUL",
    IATACode: "HLH",
    ShortName: "乌兰浩特",
    CountryName: "中国",
    EnglishName: "Ulanhot Airport"
  },
  {
    ICAOCode: "ZBXH",
    IATACode: "XIL",
    ShortName: "锡林浩特",
    CountryName: "中国",
    EnglishName: "Xilinhot Airport"
  },
  {
    ICAOCode: "ZBXZ",
    IATACode: "WUT",
    ShortName: "忻州五台山", // Clarified from "忻州"
    CountryName: "中国",
    EnglishName: "Xinzhou Wutaishan Airport"
  },
  {
    ICAOCode: "ZBYC",
    IATACode: "YCU",
    ShortName: "运城张孝", // Clarified from "运城"
    CountryName: "中国",
    EnglishName: "Yuncheng Zhangxiao Airport"
  },
  {
    ICAOCode: "ZBYN",
    IATACode: "TYN",
    ShortName: "太原武宿", // Clarified from "太原"
    CountryName: "中国",
    EnglishName: "Taiyuan Wusu International Airport"
  },
  {
    ICAOCode: "ZBYZ",
    IATACode: "RLK",
    ShortName: "巴彦淖尔天吉泰", // Clarified from "巴彦淖尔"
    CountryName: "中国",
    EnglishName: "Bayannur Tianjitai Airport"
  },
  {
    ICAOCode: "ZBZJ",
    IATACode: "ZQZ",
    ShortName: "张家口宁远", // Clarified from "张家口"
    CountryName: "中国",
    EnglishName: "Zhangjiakou Ningyuan Airport"
  },
  {
    ICAOCode: "ZBZL",
    IATACode: "NZL",
    ShortName: "扎兰屯成吉思汗",
    CountryName: "中国",
    EnglishName: "Zalantun Chengjisihan Airport"
  },
  {
    ICAOCode: "ZGBH",
    IATACode: "BHY",
    ShortName: "北海福成", // Clarified from "北海"
    CountryName: "中国",
    EnglishName: "Beihai Fucheng Airport"
  },
  {
    ICAOCode: "ZGBS",
    IATACode: "AEB",
    ShortName: "百色巴马", // Clarified from "百色"
    CountryName: "中国",
    EnglishName: "Baise Bama Airport"
  },
  {
    ICAOCode: "ZGCD",
    IATACode: "CGD",
    ShortName: "常德桃花源", // Clarified from "常德"
    CountryName: "中国",
    EnglishName: "Changde Taohuayuan Airport"
  },
  {
    ICAOCode: "ZGCJ",
    IATACode: "HJJ",
    ShortName: "怀化芷江", // Clarified from "怀化"
    CountryName: "中国",
    EnglishName: "Huaihua Zhijiang Airport"
  },
  {
    ICAOCode: "ZGDY",
    IATACode: "DYG",
    ShortName: "张家界荷花", // Clarified from "张家界"
    CountryName: "中国",
    EnglishName: "Zhangjiajie Hehua International Airport"
  },
  {
    ICAOCode: "ZGFS",
    IATACode: "FUO",
    ShortName: "佛山沙堤", // Clarified from "佛山"
    CountryName: "中国",
    EnglishName: "Foshan Shadi Airport"
  },
  {
    ICAOCode: "ZGGG",
    IATACode: "CAN",
    ShortName: "广州白云", // Clarified from "广州"
    CountryName: "中国",
    EnglishName: "Guangzhou Baiyun International Airport"
  },
  {
    ICAOCode: "ZGHA",
    IATACode: "CSX",
    ShortName: "长沙黄花", // Clarified from "长沙"
    CountryName: "中国",
    EnglishName: "Changsha Huanghua International Airport"
  },
  {
    ICAOCode: "ZGHC",
    IATACode: "HCJ",
    ShortName: "河池金城江",
    CountryName: "中国",
    EnglishName: "Hechi Jinchengjiang Airport"
  },
  {
    ICAOCode: "ZGHY",
    IATACode: "HNY",
    ShortName: "衡阳南岳", // Clarified from "衡阳"
    CountryName: "中国",
    EnglishName: "Hengyang Nanyue Airport"
  },
  {
    ICAOCode: "ZGHZ",
    IATACode: "HUZ",
    ShortName: "惠州平潭", // Clarified from "惠州"
    CountryName: "中国",
    EnglishName: "Huizhou Pingtan Airport"
  },
  {
    ICAOCode: "ZGKL",
    IATACode: "KWL",
    ShortName: "桂林两江", // Clarified from "桂林"
    CountryName: "中国",
    EnglishName: "Guilin Liangjiang International Airport"
  },
  {
    ICAOCode: "ZGLG",
    IATACode: "LLF",
    ShortName: "永州零陵", // Clarified from "永州"
    CountryName: "中国",
    EnglishName: "Yongzhou Lingling Airport"
  },
  {
    ICAOCode: "ZGMX",
    IATACode: "MXZ",
    ShortName: "梅县",
    CountryName: "中国",
    EnglishName: "Meixian Airport"
  },
  {
    ICAOCode: "ZGNN",
    IATACode: "NNG",
    ShortName: "南宁吴圩", // Clarified from "南宁"
    CountryName: "中国",
    EnglishName: "Nanning Wuxu International Airport"
  },
  {
    ICAOCode: "ZGOW",
    IATACode: "SWA",
    ShortName: "揭阳潮汕", // Clarified from "揭阳"
    CountryName: "中国",
    EnglishName: "Jieyang Chaoshan International Airport"
  },
  {
    ICAOCode: "ZGSD",
    IATACode: "ZUH",
    ShortName: "珠海金湾",
    CountryName: "中国",
    EnglishName: "Zhuhai Jinwan Airport"
  },
  {
    ICAOCode: "ZGSY",
    IATACode: "WGN",
    ShortName: "邵阳武冈",
    CountryName: "中国",
    EnglishName: "Shaoyang Wugang Airport"
  },
  {
    ICAOCode: "ZGSZ",
    IATACode: "SZX",
    ShortName: "深圳宝安", // Clarified from "深圳"
    CountryName: "中国",
    EnglishName: "Shenzhen Bao'an International Airport"
  },
  {
    ICAOCode: "ZGWZ",
    IATACode: "WUZ",
    ShortName: "梧州西江", // Clarified from "梧州"
    CountryName: "中国",
    EnglishName: "Wuzhou Xijiang Airport"
  },
  {
    ICAOCode: "ZGYL",
    IATACode: "YLX",
    ShortName: "玉林福绵",
    CountryName: "中国",
    EnglishName: "Yulin Fumian Airport"
  },
  {
    ICAOCode: "ZGYY",
    IATACode: "YYA",
    ShortName: "岳阳三荷",
    CountryName: "中国",
    EnglishName: "Yueyang Sanhe Airport"
  },
  {
    ICAOCode: "ZGZH",
    IATACode: "LZH",
    ShortName: "柳州白莲", // Clarified from "柳州"
    CountryName: "中国",
    EnglishName: "Liuzhou Bailian Airport"
  },
  {
    ICAOCode: "ZGZJ",
    IATACode: "ZHA",
    ShortName: "湛江吴川",
    CountryName: "中国",
    EnglishName: "Zhanjiang Wuchuan International Airport" // Updated based on report
  },
  {
    ICAOCode: "ZGZZ",
    IATACode: "HHA",
    ShortName: "长沙大托铺", // Clarified from "长沙(暂停使用)"
    CountryName: "中国",
    EnglishName: "Changsha Datuopu Airport (Closed)"
  },
  {
    ICAOCode: "ZHCC",
    IATACode: "CGO",
    ShortName: "郑州新郑", // Clarified from "郑州"
    CountryName: "中国",
    EnglishName: "Zhengzhou Xinzheng International Airport"
  },
  { // Added from report
    ICAOCode: "ZHEC",
    IATACode: "EHU",
    ShortName: "鄂州花湖",
    CountryName: "中国",
    EnglishName: "Ezhou Huahu International Airport"
  },
  {
    ICAOCode: "ZHES",
    IATACode: "ENH",
    ShortName: "恩施许家坪", // Clarified from "恩施"
    CountryName: "中国",
    EnglishName: "Enshi Xujiaping Airport"
  },
  {
    ICAOCode: "ZHHH",
    IATACode: "WUH",
    ShortName: "武汉天河", // Clarified from "武汉"
    CountryName: "中国",
    EnglishName: "Wuhan Tianhe International Airport"
  },
  {
    ICAOCode: "ZHJZ",
    IATACode: "SHS",
    ShortName: "荆州沙市",
    CountryName: "中国",
    EnglishName: "Jingzhou Shashi Airport"
  },
  {
    ICAOCode: "ZHLY",
    IATACode: "LYA",
    ShortName: "洛阳北郊", // Clarified from "洛阳"
    CountryName: "中国",
    EnglishName: "Luoyang Beijiao Airport"
  },
  {
    ICAOCode: "ZHNY",
    IATACode: "NNY",
    ShortName: "南阳姜营", // Clarified from "南阳"
    CountryName: "中国",
    EnglishName: "Nanyang Jiangying Airport"
  },
  {
    ICAOCode: "ZHSN",
    IATACode: "HPG",
    ShortName: "神农架红坪", // Clarified from "神农架"
    CountryName: "中国",
    EnglishName: "Shennongjia Hongping Airport"
  },
  {
    ICAOCode: "ZHSY",
    IATACode: "WDS",
    ShortName: "十堰武当山", // Clarified from "十堰"
    CountryName: "中国",
    EnglishName: "Shiyan Wudangshan Airport"
  },
  {
    ICAOCode: "ZHXF",
    IATACode: "XFN",
    ShortName: "襄阳刘集", // Clarified from "襄阳"
    CountryName: "中国",
    EnglishName: "Xiangyang Liuji Airport"
  },
  {
    ICAOCode: "ZHXY",
    IATACode: "XAI",
    ShortName: "信阳明港", // Clarified from "信阳"
    CountryName: "中国",
    EnglishName: "Xinyang Minggang Airport"
  },
  {
    ICAOCode: "ZHYC",
    IATACode: "YIH",
    ShortName: "宜昌三峡", // Clarified from "宜昌"
    CountryName: "中国",
    EnglishName: "Yichang Sanxia Airport"
  },
  {
    ICAOCode: "ZJHK",
    IATACode: "HAK",
    ShortName: "海口美兰", // Clarified from "海口"
    CountryName: "中国",
    EnglishName: "Haikou Meilan International Airport"
  },
  {
    ICAOCode: "ZJQH",
    IATACode: "BAR",
    ShortName: "琼海博鳌", // Clarified from "琼海"
    CountryName: "中国",
    EnglishName: "Qionghai Bo'ao Airport"
  },
  {
    ICAOCode: "ZJSY",
    IATACode: "SYX",
    ShortName: "三亚凤凰", // Clarified from "三亚"
    CountryName: "中国",
    EnglishName: "Sanya Phoenix International Airport"
  },
  {
    ICAOCode: "ZJYX",
    IATACode: "XYI",
    ShortName: "三沙永兴",
    CountryName: "中国",
    EnglishName: "Sansha Yongxing Airport"
  },
  {
    ICAOCode: "ZLAK",
    IATACode: "AKA",
    ShortName: "安康富强", // Clarified from "安康"
    CountryName: "中国",
    EnglishName: "Ankang Fuqiang Airport"
  },
  {
    ICAOCode: "ZLDH",
    IATACode: "DNH",
    ShortName: "敦煌莫高", // Clarified from "敦煌"
    CountryName: "中国",
    EnglishName: "Dunhuang Mogao International Airport"
  },
  {
    ICAOCode: "ZLDL",
    IATACode: "HXD",
    ShortName: "海西德令哈",
    CountryName: "中国",
    EnglishName: "Haixi Delingha Airport"
  },
  {
    ICAOCode: "ZLGL",
    IATACode: "GMQ",
    ShortName: "果洛玛沁", // Clarified from "果洛"
    CountryName: "中国",
    EnglishName: "Golog Maqin Airport"
  },
  {
    ICAOCode: "ZLGM",
    IATACode: "GOQ",
    ShortName: "格尔木",
    CountryName: "中国",
    EnglishName: "Golmud Airport"
  },
  {
    ICAOCode: "ZLGY",
    IATACode: "GYU",
    ShortName: "固原六盘山", // Clarified from "固原"
    CountryName: "中国",
    EnglishName: "Guyuan Liupanshan Airport"
  },
  {
    ICAOCode: "ZLHB",
    IATACode: "HBQ",
    ShortName: "海北祁连",
    CountryName: "中国",
    EnglishName: "Haibei Qilian Airport"
  },
  {
    ICAOCode: "ZLHX",
    IATACode: "HTT",
    ShortName: "花土沟",
    CountryName: "中国",
    EnglishName: "Huatugou Airport"
  },
  {
    ICAOCode: "ZLHZ",
    IATACode: "HZG",
    ShortName: "汉中城固", // Clarified from "汉中"
    CountryName: "中国",
    EnglishName: "Hanzhong Chenggu Airport"
  },
  {
    ICAOCode: "ZLIC",
    IATACode: "INC",
    ShortName: "银川河东", // Clarified from "银川"
    CountryName: "中国",
    EnglishName: "Yinchuan Hedong International Airport"
  },
  {
    ICAOCode: "ZLJC",
    IATACode: "JIC",
    ShortName: "金昌金川", // Clarified from "金昌"
    CountryName: "中国",
    EnglishName: "Jinchang Jinchuan Airport"
  },
  {
    ICAOCode: "ZLJQ",
    IATACode: "JGN",
    ShortName: "嘉峪关",
    CountryName: "中国",
    EnglishName: "Jiayuguan Airport"
  },
  {
    ICAOCode: "ZLLL",
    IATACode: "LHW",
    ShortName: "兰州中川", // Clarified from "兰州"
    CountryName: "中国",
    EnglishName: "Lanzhou Zhongchuan International Airport"
  },
  {
    ICAOCode: "ZLLN",
    IATACode: "LNL",
    ShortName: "陇南成县", // Clarified from "陇南"
    CountryName: "中国",
    EnglishName: "Longnan Chengxian Airport"
  },
  {
    ICAOCode: "ZLQY",
    IATACode: "IQN",
    ShortName: "庆阳",
    CountryName: "中国",
    EnglishName: "Qingyang Airport"
  },
  {
    ICAOCode: "ZLTS",
    IATACode: "THQ",
    ShortName: "天水麦积山",
    CountryName: "中国",
    EnglishName: "Tianshui Maijishan Airport"
  },
  {
    ICAOCode: "ZLXH",
    IATACode: "GXH",
    ShortName: "甘南夏河", // Clarified from "甘南"
    CountryName: "中国",
    EnglishName: "Gannan Xiahe Airport"
  },
  {
    ICAOCode: "ZLXN",
    IATACode: "XNN",
    ShortName: "西宁曹家堡", // Clarified from "西宁"
    CountryName: "中国",
    EnglishName: "Xining Caojiabao International Airport"
  },
  {
    ICAOCode: "ZLXY",
    IATACode: "XIY",
    ShortName: "西安咸阳", // Clarified from "西安"
    CountryName: "中国",
    EnglishName: "Xi'an Xianyang International Airport"
  },
  {
    ICAOCode: "ZLYA",
    IATACode: "ENY",
    ShortName: "延安南泥湾", // Clarified from "延安"
    CountryName: "中国",
    EnglishName: "Yan'an Nanniwan Airport"
  },
  {
    ICAOCode: "ZLYL",
    IATACode: "UYN",
    ShortName: "榆林榆阳", // Clarified from "榆林"
    CountryName: "中国",
    EnglishName: "Yulin Yuyang Airport"
  },
  {
    ICAOCode: "ZLYS",
    IATACode: "YUS",
    ShortName: "玉树巴塘", // Clarified from "玉树"
    CountryName: "中国",
    EnglishName: "Yushu Batang Airport"
  },
  {
    ICAOCode: "ZLZW",
    IATACode: "ZHY",
    ShortName: "中卫沙坡头", // Clarified from "中卫"
    CountryName: "中国",
    EnglishName: "Zhongwei Shapotou Airport"
  },
  {
    ICAOCode: "ZLZY",
    IATACode: "YZY",
    ShortName: "张掖甘州", // Clarified from "张掖"
    CountryName: "中国",
    EnglishName: "Zhangye Ganzhou Airport"
  },
  {
    ICAOCode: "ZMCK",
    IATACode: "UBN",
    ShortName: "乌兰巴托", // Corrected from "成吉思汗"
    CountryName: "蒙古",
    EnglishName: "Chinggis Khaan International Airport"
  },
  {
    ICAOCode: "ZPBS",
    IATACode: "BSD",
    ShortName: "保山云瑞", // Clarified from "保山"
    CountryName: "中国",
    EnglishName: "Baoshan Yunrui Airport"
  },
  {
    ICAOCode: "ZPCW",
    IATACode: "CWJ",
    ShortName: "沧源佤山", // Clarified from "沧源"
    CountryName: "中国",
    EnglishName: "Cangyuan Washan Airport"
  },
  {
    ICAOCode: "ZPDL",
    IATACode: "DLU",
    ShortName: "大理",
    CountryName: "中国",
    EnglishName: "Dali Airport"
  },
  {
    ICAOCode: "ZPDQ",
    IATACode: "DIG",
    ShortName: "香格里拉",
    CountryName: "中国",
    EnglishName: "Diqing Shangri-La Airport"
  },
  {
    ICAOCode: "ZPJH",
    IATACode: "JHG",
    ShortName: "西双版纳嘎洒",
    CountryName: "中国",
    EnglishName: "Xishuangbanna Gasa International Airport"
  },
  {
    ICAOCode: "ZPJM",
    IATACode: "JMJ",
    ShortName: "澜沧景迈", // Clarified from "澜沧"
    CountryName: "中国",
    EnglishName: "Lancang Jingmai Airport"
  },
  {
    ICAOCode: "ZPLC",
    IATACode: "LNJ",
    ShortName: "临沧",
    CountryName: "中国",
    EnglishName: "Lincang Airport"
  },
  {
    ICAOCode: "ZPLJ",
    IATACode: "LJG",
    ShortName: "丽江三义", // Clarified from "丽江"
    CountryName: "中国",
    EnglishName: "Lijiang Sanyi International Airport"
  },
  {
    ICAOCode: "ZPMS",
    IATACode: "LUM",
    ShortName: "德宏芒市",
    CountryName: "中国",
    EnglishName: "Dehong Mangshi Airport"
  },
  {
    ICAOCode: "ZPNL",
    IATACode: "NLH",
    ShortName: "宁蒗泸沽湖",
    CountryName: "中国",
    EnglishName: "Ninglang Luguhu Airport"
  },
  {
    ICAOCode: "ZPPP",
    IATACode: "KMG",
    ShortName: "昆明长水", // Clarified from "昆明"
    CountryName: "中国",
    EnglishName: "Kunming Changshui International Airport"
  },
  {
    ICAOCode: "ZPSM",
    IATACode: "SYM",
    ShortName: "普洱思茅", // Clarified from "思茅"
    CountryName: "中国",
    EnglishName: "Pu'er Simao Airport"
  },
  {
    ICAOCode: "ZPTC",
    IATACode: "TCZ",
    ShortName: "腾冲驼峰", // Clarified from "腾冲"
    CountryName: "中国",
    EnglishName: "Tengchong Tuofeng Airport"
  },
  {
    ICAOCode: "ZPWS",
    IATACode: "WNH",
    ShortName: "文山普者黑", // Clarified from "文山"
    CountryName: "中国",
    EnglishName: "Wenshan Puzhehei Airport"
  },
  {
    ICAOCode: "ZPZT",
    IATACode: "ZAT",
    ShortName: "昭通",
    CountryName: "中国",
    EnglishName: "Zhaotong Airport"
  },
  {
    ICAOCode: "ZSAM",
    IATACode: "XMN",
    ShortName: "厦门高崎", // Clarified from "厦门"
    CountryName: "中国",
    EnglishName: "Xiamen Gaoqi International Airport"
  },
  {
    ICAOCode: "ZSAQ",
    IATACode: "AQG",
    ShortName: "安庆天柱山", // Clarified from "安庆"
    CountryName: "中国",
    EnglishName: "Anqing Tianzhushan Airport"
  },
  {
    ICAOCode: "ZSCG",
    IATACode: "CZX",
    ShortName: "常州奔牛", // Clarified from "常州"
    CountryName: "中国",
    EnglishName: "Changzhou Benniu International Airport"
  },
  {
    ICAOCode: "ZSCN",
    IATACode: "KHN",
    ShortName: "南昌昌北", // Clarified from "南昌"
    CountryName: "中国",
    EnglishName: "Nanchang Changbei International Airport"
  },
  {
    ICAOCode: "ZSDY",
    IATACode: "DOY",
    ShortName: "东营胜利", // Clarified from "东营"
    CountryName: "中国",
    EnglishName: "Dongying Shengli Airport"
  },
  {
    ICAOCode: "ZSFY",
    IATACode: "FUG",
    ShortName: "阜阳西关", // Clarified from "阜阳"
    CountryName: "中国",
    EnglishName: "Fuyang Xiguan Airport"
  },
  {
    ICAOCode: "ZSFZ",
    IATACode: "FOC",
    ShortName: "福州长乐", // Clarified from "福州"
    CountryName: "中国",
    EnglishName: "Fuzhou Changle International Airport"
  },
  {
    ICAOCode: "ZSGS",
    IATACode: "JGS",
    ShortName: "井冈山",
    CountryName: "中国",
    EnglishName: "Jinggangshan Airport"
  },
  {
    ICAOCode: "ZSGZ",
    IATACode: "KOW",
    ShortName: "赣州黄金", // Clarified from "赣州"
    CountryName: "中国",
    EnglishName: "Ganzhou Huangjin Airport"
  },
  {
    ICAOCode: "ZSHC",
    IATACode: "HGH",
    ShortName: "杭州萧山", // Clarified from "杭州"
    CountryName: "中国",
    EnglishName: "Hangzhou Xiaoshan International Airport"
  },
  {
    ICAOCode: "ZSHZ",
    IATACode: "HZA",
    ShortName: "菏泽牡丹", // Clarified from "菏泽"
    CountryName: "中国",
    EnglishName: "Heze Mudan Airport"
  },
  {
    ICAOCode: "ZSJD",
    IATACode: "JDZ",
    ShortName: "景德镇罗家", // Clarified from "景德镇"
    CountryName: "中国",
    EnglishName: "Jingdezhen Luojia Airport"
  },
  {
    ICAOCode: "ZSJG",
    IATACode: "JNG",
    ShortName: "济宁曲阜", // Clarified from "济宁"
    CountryName: "中国",
    EnglishName: "Jining Qufu Airport"
  },
  {
    ICAOCode: "ZSJH",
    IATACode: "JUH",
    ShortName: "池州九华山", // Clarified from "池州"
    CountryName: "中国",
    EnglishName: "Chizhou Jiuhuashan Airport"
  },
  {
    ICAOCode: "ZSJJ",
    IATACode: "JIU",
    ShortName: "九江庐山", // Clarified from "九江"
    CountryName: "中国",
    EnglishName: "Jiujiang Lushan Airport"
  },
  {
    ICAOCode: "ZSJN",
    IATACode: "TNA",
    ShortName: "济南遥墙", // Clarified from "济南"
    CountryName: "中国",
    EnglishName: "Jinan Yaoqiang International Airport"
  },
  {
    ICAOCode: "ZSJU",
    IATACode: "JUZ",
    ShortName: "衢州",
    CountryName: "中国",
    EnglishName: "Quzhou Airport"
  },
  {
    ICAOCode: "ZSLG",
    IATACode: "LYG",
    ShortName: "连云港花果山", // Clarified from "连云港"
    CountryName: "中国",
    EnglishName: "Lianyungang Huaguoshan Airport"
  },
  {
    ICAOCode: "ZSLO",
    IATACode: "LCX",
    ShortName: "连城冠豸山", // Clarified from "连城"
    CountryName: "中国",
    EnglishName: "Longyan Guanzhishan Airport"
  },
  {
    ICAOCode: "ZSLQ",
    IATACode: "HYN",
    ShortName: "台州路桥", // Clarified from "台州"
    CountryName: "中国",
    EnglishName: "Taizhou Luqiao Airport"
  },
  {
    ICAOCode: "ZSLY",
    IATACode: "LYI",
    ShortName: "临沂启阳", // Clarified from "临沂"
    CountryName: "中国",
    EnglishName: "Linyi Qiyang Airport"
  },
  {
    ICAOCode: "ZSNB",
    IATACode: "NGB",
    ShortName: "宁波栎社", // Clarified from "宁波"
    CountryName: "中国",
    EnglishName: "Ningbo Lishe International Airport"
  },
  {
    ICAOCode: "ZSNJ",
    IATACode: "NKG",
    ShortName: "南京禄口", // Clarified from "南京"
    CountryName: "中国",
    EnglishName: "Nanjing Lukou International Airport"
  },
  {
    ICAOCode: "ZSNT",
    IATACode: "NTG",
    ShortName: "南通兴东", // Clarified from "南通"
    CountryName: "中国",
    EnglishName: "Nantong Xingdong International Airport"
  },
  {
    ICAOCode: "ZSOF",
    IATACode: "HFE",
    ShortName: "合肥新桥", // Clarified from "合肥"
    CountryName: "中国",
    EnglishName: "Hefei Xinqiao International Airport"
  },
  {
    ICAOCode: "ZSPD",
    IATACode: "PVG",
    ShortName: "上海浦东", // Clarified from "浦东"
    CountryName: "中国",
    EnglishName: "Shanghai Pudong International Airport"
  },
  {
    ICAOCode: "ZSQD",
    IATACode: "TAO",
    ShortName: "青岛胶东", // Clarified from "青岛"
    CountryName: "中国",
    EnglishName: "Qingdao Jiaodong International Airport"
  },
  {
    ICAOCode: "ZSQZ",
    IATACode: "JJN",
    ShortName: "泉州晋江", // Clarified from "泉州"
    CountryName: "中国",
    EnglishName: "Quanzhou Jinjiang International Airport"
  },
  {
    ICAOCode: "ZSRZ",
    IATACode: "RIZ",
    ShortName: "日照山字河", // Clarified from "日照"
    CountryName: "中国",
    EnglishName: "Rizhao Shanzihe Airport"
  },
  {
    ICAOCode: "ZSSH",
    IATACode: "HIA",
    ShortName: "淮安涟水", // Clarified from "淮安"
    CountryName: "中国",
    EnglishName: "Huai'an Lianshui International Airport"
  },
  {
    ICAOCode: "ZSSM",
    IATACode: "SQJ",
    ShortName: "三明沙县", // Clarified from "三明"
    CountryName: "中国",
    EnglishName: "Sanming Shaxian Airport"
  },
  {
    ICAOCode: "ZSSR",
    IATACode: "SQD",
    ShortName: "上饶三清山", // Clarified from "三清山"
    CountryName: "中国",
    EnglishName: "Shangrao Sanqingshan Airport"
  },
  {
    ICAOCode: "ZSSS",
    IATACode: "SHA",
    ShortName: "上海虹桥", // Clarified from "虹桥"
    CountryName: "中国",
    EnglishName: "Shanghai Hongqiao International Airport"
  },
  {
    ICAOCode: "ZSTX",
    IATACode: "TXN",
    ShortName: "黄山屯溪", // Clarified from "黄山"
    CountryName: "中国",
    EnglishName: "Huangshan Tunxi International Airport"
  },
  {
    ICAOCode: "ZSWA",
    IATACode: "WHA",
    ShortName: "芜湖宣州", // Clarified from "芜湖"
    CountryName: "中国",
    EnglishName: "Wuhu Xuanzhou Airport"
  },
  {
    ICAOCode: "ZSWF",
    IATACode: "WEF",
    ShortName: "潍坊",
    CountryName: "中国",
    EnglishName: "Weifang Airport"
  },
  {
    ICAOCode: "ZSWH",
    IATACode: "WEH",
    ShortName: "威海大水泊", // Clarified from "威海"
    CountryName: "中国",
    EnglishName: "Weihai Dashuibo International Airport"
  },
  {
    ICAOCode: "ZSWX",
    IATACode: "WUX",
    ShortName: "无锡硕放", // Clarified from "无锡"
    CountryName: "中国",
    EnglishName: "Sunan Shuofang International Airport"
  },
  {
    ICAOCode: "ZSWY",
    IATACode: "WUS",
    ShortName: "武夷山",
    CountryName: "中国",
    EnglishName: "Wuyishan Airport"
  },
  {
    ICAOCode: "ZSWZ",
    IATACode: "WNZ",
    ShortName: "温州龙湾", // Clarified from "温州"
    CountryName: "中国",
    EnglishName: "Wenzhou Longwan International Airport"
  },
  {
    ICAOCode: "ZSXZ",
    IATACode: "XUZ",
    ShortName: "徐州观音", // Clarified from "徐州"
    CountryName: "中国",
    EnglishName: "Xuzhou Guanyin International Airport"
  },
  {
    ICAOCode: "ZSYA",
    IATACode: "YTY",
    ShortName: "扬州泰州", // Clarified from "扬州"
    CountryName: "中国",
    EnglishName: "Yangzhou Taizhou International Airport"
  },
  {
    ICAOCode: "ZSYC",
    IATACode: "YIC",
    ShortName: "宜春明月山", // Clarified from "宜春"
    CountryName: "中国",
    EnglishName: "Yichun Mingyueshan Airport"
  },
  {
    ICAOCode: "ZSYN",
    IATACode: "YNZ",
    ShortName: "盐城南洋", // Clarified from "盐城"
    CountryName: "中国",
    EnglishName: "Yancheng Nanyang International Airport"
  },
  {
    ICAOCode: "ZSYT",
    IATACode: "YNT",
    ShortName: "烟台蓬莱", // Clarified from "烟台"
    CountryName: "中国",
    EnglishName: "Yantai Penglai International Airport"
  },
  {
    ICAOCode: "ZSYW",
    IATACode: "YIW",
    ShortName: "义乌",
    CountryName: "中国",
    EnglishName: "Yiwu Airport"
  },
  {
    ICAOCode: "ZSZS",
    IATACode: "HSN",
    ShortName: "舟山普陀山", // Clarified from "舟山"
    CountryName: "中国",
    EnglishName: "Zhoushan Putuoshan Airport"
  },
  {
    ICAOCode: "ZUAL",
    IATACode: "NGQ",
    ShortName: "阿里昆莎", // Clarified from "阿里"
    CountryName: "中国",
    EnglishName: "Ngari Gunsa Airport"
  },
  {
    ICAOCode: "ZUAS",
    IATACode: "AVA",
    ShortName: "安顺黄果树", // Clarified from "安顺"
    CountryName: "中国",
    EnglishName: "Anshun Huangguoshu Airport"
  },
  {
    ICAOCode: "ZUBD",
    IATACode: "BPX",
    ShortName: "昌都邦达", // Clarified from "昌都"
    CountryName: "中国",
    EnglishName: "Qamdo Bamda Airport"
  },
  {
    ICAOCode: "ZUBJ",
    IATACode: "BFJ",
    ShortName: "毕节飞雄", // Clarified from "毕节"
    CountryName: "中国",
    EnglishName: "Bijie Feixiong Airport"
  },
  {
    ICAOCode: "ZUBZ",
    IATACode: "BZX",
    ShortName: "巴中恩阳", // Clarified from "巴中"
    CountryName: "中国",
    EnglishName: "Bazhong Enyang Airport"
  },
  {
    ICAOCode: "ZUCK",
    IATACode: "CKG",
    ShortName: "重庆江北", // Clarified from "重庆"
    CountryName: "中国",
    EnglishName: "Chongqing Jiangbei International Airport"
  },
  {
    ICAOCode: "ZUDC",
    IATACode: "DCY",
    ShortName: "稻城亚丁",
    CountryName: "中国",
    EnglishName: "Daocheng Yading Airport"
  },
  {
    ICAOCode: "ZUDX",
    IATACode: "DAX",
    ShortName: "达州金垭", // Clarified from "达州"
    CountryName: "中国",
    EnglishName: "Dazhou Jinya Airport"
  },
  {
    ICAOCode: "ZUGH",
    IATACode: "GHN",
    ShortName: "广汉",
    CountryName: "中国",
    EnglishName: "Guanghan Airport"
  },
  {
    ICAOCode: "ZUGU",
    IATACode: "GYS",
    ShortName: "广元盘龙", // Clarified from "广元"
    CountryName: "中国",
    EnglishName: "Guangyuan Panlong Airport"
  },
  {
    ICAOCode: "ZUGY",
    IATACode: "KWE",
    ShortName: "贵阳龙洞堡", // Clarified from "贵阳"
    CountryName: "中国",
    EnglishName: "Guiyang Longdongbao International Airport"
  },
  {
    ICAOCode: "ZUGZ",
    IATACode: "GZG",
    ShortName: "甘孜格萨尔", // Clarified from "甘孜"
    CountryName: "中国",
    EnglishName: "Garze Gesar Airport"
  },
  {
    ICAOCode: "ZUHY",
    IATACode: "AHJ",
    ShortName: "阿坝红原", // Clarified from "阿坝"
    CountryName: "中国",
    EnglishName: "Aba Hongyuan Airport"
  },
  {
    ICAOCode: "ZUJZ",
    IATACode: "JZH",
    ShortName: "九寨黄龙", // Clarified from "九寨"
    CountryName: "中国",
    EnglishName: "Jiuzhai Huanglong Airport"
  },
  {
    ICAOCode: "ZUKD",
    IATACode: "KGT",
    ShortName: "康定",
    CountryName: "中国",
    EnglishName: "Kangding Airport"
  },
  {
    ICAOCode: "ZUKJ",
    IATACode: "KJH",
    ShortName: "凯里黄平", // Clarified from "凯里"
    CountryName: "中国",
    EnglishName: "Kaili Huangping Airport"
  },
  {
    ICAOCode: "ZULB",
    IATACode: "LLB",
    ShortName: "荔波",
    CountryName: "中国",
    EnglishName: "Libo Airport"
  },
  {
    ICAOCode: "ZULS",
    IATACode: "LXA",
    ShortName: "拉萨贡嘎", // Clarified from "拉萨"
    CountryName: "中国",
    EnglishName: "Lhasa Gonggar Airport"
  },
  {
    ICAOCode: "ZULZ",
    IATACode: "LZO",
    ShortName: "泸州云龙", // Clarified from "泸州"
    CountryName: "中国",
    EnglishName: "Luzhou Yunlong Airport"
  },
  {
    ICAOCode: "ZUMT",
    IATACode: "WMT",
    ShortName: "遵义茅台", // Clarified from "遵义"
    CountryName: "中国",
    EnglishName: "Zunyi Maotai Airport"
  },
  {
    ICAOCode: "ZUMY",
    IATACode: "MIG",
    ShortName: "绵阳南郊", // Clarified from "绵阳"
    CountryName: "中国",
    EnglishName: "Mianyang Nanjiao Airport"
  },
  {
    ICAOCode: "ZUNC",
    IATACode: "NAO",
    ShortName: "南充高坪", // Clarified from "南充"
    CountryName: "中国",
    EnglishName: "Nanchong Gaoping Airport"
  },
  {
    ICAOCode: "ZUNP",
    IATACode: "HZH",
    ShortName: "黎平",
    CountryName: "中国",
    EnglishName: "Liping Airport"
  },
  {
    ICAOCode: "ZUNZ",
    IATACode: "LZY",
    ShortName: "林芝米林", // Clarified from "林芝"
    CountryName: "中国",
    EnglishName: "Nyingchi Mainling Airport"
  },
  {
    ICAOCode: "ZUPS",
    IATACode: "LPF",
    ShortName: "六盘水月照", // Clarified from "月照"
    CountryName: "中国",
    EnglishName: "Liupanshui Yuezhao Airport"
  },
  {
    ICAOCode: "ZUQJ",
    IATACode: "JIQ",
    ShortName: "黔江武陵山", // Clarified from "黔江"
    CountryName: "中国",
    EnglishName: "Qianjiang Wulingshan Airport"
  },
  {
    ICAOCode: "ZURK",
    IATACode: "RKZ",
    ShortName: "日喀则和平", // Clarified from "日喀则"
    CountryName: "中国",
    EnglishName: "Shigatse Peace Airport"
  },
  {
    ICAOCode: "ZUTF",
    IATACode: "TFU",
    ShortName: "成都天府",
    CountryName: "中国",
    EnglishName: "Chengdu Tianfu International Airport"
  },
  {
    ICAOCode: "ZUTR",
    IATACode: "TEN",
    ShortName: "铜仁凤凰", // Clarified from "铜仁"
    CountryName: "中国",
    EnglishName: "Tongren Fenghuang Airport"
  },
  {
    ICAOCode: "ZUUU",
    IATACode: "CTU",
    ShortName: "成都双流", // Clarified from "成都"
    CountryName: "中国",
    EnglishName: "Chengdu Shuangliu International Airport"
  },
  {
    ICAOCode: "ZUWX",
    IATACode: "WXN",
    ShortName: "万州五桥", // Clarified from "万州"
    CountryName: "中国",
    EnglishName: "Wanzhou Wuqiao Airport"
  },
  {
    ICAOCode: "ZUXC",
    IATACode: "XIC",
    ShortName: "西昌青山", // Clarified from "西昌"
    CountryName: "中国",
    EnglishName: "Xichang Qingshan Airport"
  },
  {
    ICAOCode: "ZUYB",
    IATACode: "YBP",
    ShortName: "宜宾五粮液", // Clarified from "宜宾"
    CountryName: "中国",
    EnglishName: "Yibin Wuliangye Airport"
  },
  {
    ICAOCode: "ZUYI",
    IATACode: "ACX",
    ShortName: "兴义万峰林", // Clarified from "兴义"
    CountryName: "中国",
    EnglishName: "Xingyi Wanfenglin Airport"
  },
  {
    ICAOCode: "ZUZH",
    IATACode: "PZI",
    ShortName: "攀枝花保安营", // Clarified from "攀枝花"
    CountryName: "中国",
    EnglishName: "Panzhihua Bao'anying Airport"
  },
  {
    ICAOCode: "ZUZY",
    IATACode: "ZYI",
    ShortName: "遵义新舟", // Clarified from "遵义"
    CountryName: "中国",
    EnglishName: "Zunyi Xinzhou Airport"
  },
  {
    ICAOCode: "ZWAK",
    IATACode: "AKU",
    ShortName: "阿克苏",
    CountryName: "中国",
    EnglishName: "Aksu Airport"
  },
  {
    ICAOCode: "ZWAT",
    IATACode: "AAT",
    ShortName: "阿勒泰",
    CountryName: "中国",
    EnglishName: "Altay Airport"
  },
  {
    ICAOCode: "ZWBL",
    IATACode: "BPL",
    ShortName: "博乐阿拉山口",
    CountryName: "中国",
    EnglishName: "Bole Alashankou Airport"
  },
  {
    ICAOCode: "ZWCM",
    IATACode: "IQM",
    ShortName: "且末",
    CountryName: "中国",
    EnglishName: "Qiemo Yudu Airport"
  },
  {
    ICAOCode: "ZWFY",
    IATACode: "FYN",
    ShortName: "富蕴可可托海", // Clarified from "富蕴"
    CountryName: "中国",
    EnglishName: "Fuyun Koktokay Airport"
  },
  {
    ICAOCode: "ZWHM",
    IATACode: "HMI",
    ShortName: "哈密",
    CountryName: "中国",
    EnglishName: "Hami Airport"
  },
  {
    ICAOCode: "ZWHZ",
    IATACode: "SHF",
    ShortName: "石河子花园", // Clarified from "花园"
    CountryName: "中国",
    EnglishName: "Shihezi Huayuan Airport"
  },
  {
    ICAOCode: "ZWKC",
    IATACode: "KCA",
    ShortName: "库车龟兹", // Clarified from "库车"
    CountryName: "中国",
    EnglishName: "Kuqa Qiuci Airport"
  },
  {
    ICAOCode: "ZWKL",
    IATACode: "KRL",
    ShortName: "库尔勒",
    CountryName: "中国",
    EnglishName: "Korla Airport"
  },
  {
    ICAOCode: "ZWKM",
    IATACode: "KRY",
    ShortName: "克拉玛依",
    CountryName: "中国",
    EnglishName: "Karamay Airport"
  },
  {
    ICAOCode: "ZWKN",
    IATACode: "KJI",
    ShortName: "布尔津喀纳斯", // Clarified from "布尔津"
    CountryName: "中国",
    EnglishName: "Burqin Kanas Airport"
  },
  {
    ICAOCode: "ZWNL",
    IATACode: "NLT",
    ShortName: "新源那拉提", // Clarified from "新源"
    CountryName: "中国",
    EnglishName: "Xinyuan Nalati Airport"
  },
  {
    ICAOCode: "ZWSC",
    IATACode: "QSZ",
    ShortName: "莎车叶尔羌",
    CountryName: "中国",
    EnglishName: "Shache Yarkant Airport"
  },
  {
    ICAOCode: "ZWSH",
    IATACode: "KHG",
    ShortName: "喀什",
    CountryName: "中国",
    EnglishName: "Kashgar Airport"
  },
  {
    ICAOCode: "ZWTC",
    IATACode: "TCG",
    ShortName: "塔城",
    CountryName: "中国",
    EnglishName: "Tacheng Airport"
  },
  {
    ICAOCode: "ZWTL",
    IATACode: "TLQ",
    ShortName: "吐鲁番交河", // Clarified from "吐鲁番"
    CountryName: "中国",
    EnglishName: "Turpan Jiaohe Airport"
  },
  {
    ICAOCode: "ZWTN",
    IATACode: "HTN",
    ShortName: "和田",
    CountryName: "中国",
    EnglishName: "Hotan Airport"
  },
  {
    ICAOCode: "ZWTS",
    IATACode: "TWC",
    ShortName: "图木舒克唐王城",
    CountryName: "中国",
    EnglishName: "Tumxuk Tangwangcheng Airport"
  },
  {
    ICAOCode: "ZWWW",
    IATACode: "URC",
    ShortName: "乌鲁木齐地窝堡", // Clarified from "乌鲁木齐"
    CountryName: "中国",
    EnglishName: "Ürümqi Diwopu International Airport"
  },
  {
    ICAOCode: "ZWYN",
    IATACode: "YIN",
    ShortName: "伊宁",
    CountryName: "中国",
    EnglishName: "Yining Airport"
  },
  {
    ICAOCode: "ZYAS",
    IATACode: "AOG",
    ShortName: "鞍山腾鳌", // Clarified from "鞍山"
    CountryName: "中国",
    EnglishName: "Anshan Teng'ao Airport"
  },
  {
    ICAOCode: "ZYBA",
    IATACode: "DBC",
    ShortName: "白城长安", // Clarified from "白城"
    CountryName: "中国",
    EnglishName: "Baicheng Chang'an Airport"
  },
  {
    ICAOCode: "ZYBS",
    IATACode: "NBS",
    ShortName: "长白山",
    CountryName: "中国",
    EnglishName: "Changbaishan Airport"
  },
  {
    ICAOCode: "ZYCC",
    IATACode: "CGQ",
    ShortName: "长春龙嘉", // Clarified from "长春"
    CountryName: "中国",
    EnglishName: "Changchun Longjia International Airport"
  },
  {
    ICAOCode: "ZYCY",
    IATACode: "CHG",
    ShortName: "朝阳",
    CountryName: "中国",
    EnglishName: "Chaoyang Airport"
  },
  {
    ICAOCode: "ZYDD",
    IATACode: "DDG",
    ShortName: "丹东浪头", // Clarified from "丹东"
    CountryName: "中国",
    EnglishName: "Dandong Langtou Airport"
  },
  {
    ICAOCode: "ZYDQ",
    IATACode: "DQA",
    ShortName: "大庆萨尔图", // Clarified from "大庆"
    CountryName: "中国",
    EnglishName: "Daqing Sartu Airport"
  },
  {
    ICAOCode: "ZYDU",
    IATACode: "DTU",
    ShortName: "五大连池德都",
    CountryName: "中国",
    EnglishName: "Wudalianchi Dedu Airport"
  },
  {
    ICAOCode: "ZYFY",
    IATACode: "FYJ",
    ShortName: "抚远东极",
    CountryName: "中国",
    EnglishName: "Fuyuan Dongji Airport"
  },
  {
    ICAOCode: "ZYHB",
    IATACode: "HRB",
    ShortName: "哈尔滨太平", // Clarified from "哈尔滨"
    CountryName: "中国",
    EnglishName: "Harbin Taiping International Airport"
  },
  {
    ICAOCode: "ZYHE",
    IATACode: "HEK",
    ShortName: "黑河瑷珲", // Clarified from "黑河"
    CountryName: "中国",
    EnglishName: "Heihe Aihui Airport"
  },
  {
    ICAOCode: "ZYJD",
    IATACode: "JGD",
    ShortName: "大兴安岭加格达奇", // Clarified from "大兴安岭"
    CountryName: "中国",
    EnglishName: "Daxing'anling Jagdaqi Airport"
  },
  {
    ICAOCode: "ZYJL",
    IATACode: "JIL",
    ShortName: "吉林二台子", // Clarified from "吉林"
    CountryName: "中国",
    EnglishName: "Jilin Ertaizi Airport"
  },
  {
    ICAOCode: "ZYJM",
    IATACode: "JMU",
    ShortName: "佳木斯东郊", // Clarified from "佳木斯"
    CountryName: "中国",
    EnglishName: "Jiamusi Dongjiao Airport"
  },
  {
    ICAOCode: "ZYJS",
    IATACode: "JSJ",
    ShortName: "建三江湿地", // Clarified from "建三江"
    CountryName: "中国",
    EnglishName: "Jiansanjiang Shidi Airport"
  },
  {
    ICAOCode: "ZYJX",
    IATACode: "JXA",
    ShortName: "鸡西兴凯湖", // Clarified from "鸡西"
    CountryName: "中国",
    EnglishName: "Jixi Xingkaihu Airport"
  },
  {
    ICAOCode: "ZYJZ",
    IATACode: "JNZ",
    ShortName: "锦州湾", // Clarified from "锦州"
    CountryName: "中国",
    EnglishName: "Jinzhou Bay Airport"
  },
  {
    ICAOCode: "ZYLD",
    IATACode: "LDS",
    ShortName: "伊春林都", // Clarified from "伊春"
    CountryName: "中国",
    EnglishName: "Yichun Lindu Airport"
  },
  {
    ICAOCode: "ZYMD",
    IATACode: "MDG",
    ShortName: "牡丹江海浪", // Clarified from "牡丹江"
    CountryName: "中国",
    EnglishName: "Mudanjiang Hailang International Airport"
  },
  {
    ICAOCode: "ZYMH",
    IATACode: "OHE",
    ShortName: "漠河古莲", // Clarified from "漠河"
    CountryName: "中国",
    EnglishName: "Mohe Gulian Airport"
  },
  {
    ICAOCode: "ZYQQ",
    IATACode: "NDG",
    ShortName: "齐齐哈尔三家子", // Clarified from "齐齐哈尔"
    CountryName: "中国",
    EnglishName: "Qiqihar Sanjiazi Airport"
  },
  {
    ICAOCode: "ZYSQ",
    IATACode: "YSQ",
    ShortName: "松原查干湖", // Clarified from "松原"
    CountryName: "中国",
    EnglishName: "Songyuan Chaganhu Airport"
  },
  {
    ICAOCode: "ZYTL",
    IATACode: "DLC",
    ShortName: "大连周水子", // Clarified from "大连"
    CountryName: "中国",
    EnglishName: "Dalian Zhoushuizi International Airport"
  },
  {
    ICAOCode: "ZYTN",
    IATACode: "TNH",
    ShortName: "通化三源浦", // Clarified from "通化"
    CountryName: "中国",
    EnglishName: "Tonghua Sanyuanpu Airport"
  },
  {
    ICAOCode: "ZYTX",
    IATACode: "SHE",
    ShortName: "沈阳桃仙", // Clarified from "沈阳"
    CountryName: "中国",
    EnglishName: "Shenyang Taoxian International Airport"
  },
  {
    ICAOCode: "ZYYJ",
    IATACode: "YNJ",
    ShortName: "延吉朝阳川", // Clarified from "延吉"
    CountryName: "中国",
    EnglishName: "Yanji Chaoyangchuan International Airport"
  },
  {
    ICAOCode: "ZYYK",
    IATACode: "YKH",
    ShortName: "营口兰旗", // Clarified from "营口"
    CountryName: "中国",
    EnglishName: "Yingkou Lanqi Airport"
  }
];

module.exports = airports;