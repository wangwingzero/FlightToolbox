const remainingChineseAirports = [
  {
    "IATACode": "ACV",
    "ShortName": "阿克塔/尤里卡"
  },
  {
    "IATACode": "AGF",
    "ShortName": "阿让/拉加雷讷"
  },
  {
    "IATACode": "AJA",
    "ShortName": "阿雅克肖/拿破仑"
  },
  {
    "IATACode": "ALN",
    "ShortName": "奥尔顿/圣路易斯"
  },
  {
    "IATACode": "ANE",
    "ShortName": "昂热/马尔塞"
  },
  {
    "IATACode": "ANG",
    "ShortName": "昂古莱姆/布里耶"
  },
  {
    "IATACode": "ATO",
    "ShortName": "雅典/奥尔巴尼"
  },
  {
    "IATACode": "AUF",
    "ShortName": "欧塞尔/布朗什"
  },
  {
    "IATACode": "AUZ",
    "ShortName": "芝加哥/奥罗拉"
  },
  {
    "IATACode": "AVN",
    "ShortName": "阿维尼翁/科蒙"
  },
  {
    "IATACode": "AVP",
    "ShortName": "威尔克斯-巴里/斯克兰顿"
  },
  {
    "IATACode": "BAF",
    "ShortName": "韦斯特菲尔德/斯普林菲尔德"
  },
  {
    "IATACode": "BES",
    "ShortName": "布雷斯特/吉帕瓦"
  },
  {
    "IATACode": "BIA",
    "ShortName": "巴斯蒂亚/波雷塔"
  },
  {
    "IATACode": "BIF",
    "ShortName": "布利斯堡/埃尔帕索"
  },
  {
    "IATACode": "BIQ",
    "ShortName": "比亚里茨/昂格莱"
  },
  {
    "IATACode": "BLM",
    "ShortName": "贝尔马/法明代尔"
  },
  {
    "IATACode": "BOD",
    "ShortName": "波尔多/梅里尼亚克"
  },
  {
    "IATACode": "BPT",
    "ShortName": "博蒙特/亚瑟港"
  },
  {
    "IATACode": "BSL",
    "ShortName": "巴塞尔/米卢斯"
  },
  {
    "IATACode": "BVA",
    "ShortName": "博韦/蒂莱"
  },
  {
    "IATACode": "BYF",
    "ShortName": "阿尔贝/布赖"
  },
  {
    "IATACode": "BYS",
    "ShortName": "欧文堡/巴斯托"
  },
  {
    "IATACode": "BZR",
    "ShortName": "贝济耶/维亚斯"
  },
  {
    "IATACode": "CAY",
    "ShortName": "卡宴/罗尚博"
  },
  {
    "IATACode": "CCF",
    "ShortName": "卡尔卡松/萨尔瓦扎"
  },
  {
    "IATACode": "CEF",
    "ShortName": "斯普林菲尔德/奇科皮"
  },
  {
    "IATACode": "CEQ",
    "ShortName": "戛纳/芒代利厄"
  },
  {
    "IATACode": "CER",
    "ShortName": "瑟堡/莫佩尔蒂"
  },
  {
    "IATACode": "CET",
    "ShortName": "绍莱/勒蓬特罗"
  },
  {
    "IATACode": "CFR",
    "ShortName": "卡昂/卡尔皮凯"
  },
  {
    "IATACode": "CFT",
    "ShortName": "克利夫顿/莫伦西"
  },
  {
    "IATACode": "CHR",
    "ShortName": "沙托鲁/代奥尔"
  },
  {
    "IATACode": "CLY",
    "ShortName": "卡尔维/圣凯瑟琳"
  },
  {
    "IATACode": "CMF",
    "ShortName": "尚贝里/艾克斯莱班"
  },
  {
    "IATACode": "CMI",
    "ShortName": "尚佩恩/厄巴纳"
  },
  {
    "IATACode": "CMR",
    "ShortName": "科尔马/乌森"
  },
  {
    "IATACode": "CNG",
    "ShortName": "干邑/沙托贝尔纳"
  },
  {
    "IATACode": "CPC",
    "ShortName": "查佩尔科/圣马丁德洛斯安第斯"
  },
  {
    "IATACode": "CPS",
    "ShortName": "卡霍基亚/圣路易斯"
  },
  {
    "IATACode": "CUM",
    "ShortName": "库马纳 (安东尼奥·何塞·德·苏克雷)"
  },
  {
    "IATACode": "DCM",
    "ShortName": "卡斯特尔/马扎梅"
  },
  {
    "IATACode": "DIJ",
    "ShortName": "第戎/隆维克"
  },
  {
    "IATACode": "DLE",
    "ShortName": "多勒/塔沃"
  },
  {
    "IATACode": "DNR",
    "ShortName": "迪纳尔/普勒尔蒂"
  },
  {
    "IATACode": "DOE",
    "ShortName": "朱穆"
  },
  {
    "IATACode": "DPA",
    "ShortName": "芝加哥/西芝加哥"
  },
  {
    "IATACode": "EBU",
    "ShortName": "圣艾蒂安/布泰翁"
  },
  {
    "IATACode": "EGC",
    "ShortName": "贝尔热拉克/鲁马尼耶尔"
  },
  {
    "IATACode": "ELM",
    "ShortName": "埃尔迈拉/康宁"
  },
  {
    "IATACode": "ENC",
    "ShortName": "南锡/埃塞"
  },
  {
    "IATACode": "EPL",
    "ShortName": "埃皮纳勒/米尔库尔"
  },
  {
    "IATACode": "ETZ",
    "ShortName": "梅斯/南锡"
  },
  {
    "IATACode": "EVX",
    "ShortName": "埃夫勒/福维尔"
  },
  {
    "IATACode": "FBK",
    "ShortName": "费尔班克斯/温赖特堡"
  },
  {
    "IATACode": "FME",
    "ShortName": "米德堡(奥登)"
  },
  {
    "IATACode": "FNI",
    "ShortName": "尼姆/加龙"
  },
  {
    "IATACode": "FNL",
    "ShortName": "柯林斯堡/洛夫兰"
  },
  {
    "IATACode": "FON",
    "ShortName": "拉福图纳/圣卡洛斯"
  },
  {
    "IATACode": "FOT",
    "ShortName": "福斯特 (沃利斯岛)"
  },
  {
    "IATACode": "FRI",
    "ShortName": "莱利堡(章克申城)"
  },
  {
    "IATACode": "GNB",
    "ShortName": "格勒诺布尔/圣茹瓦尔"
  },
  {
    "IATACode": "GON",
    "ShortName": "格罗顿 (新伦敦)"
  },
  {
    "IATACode": "GRF",
    "ShortName": "刘易斯堡/塔科马"
  },
  {
    "IATACode": "GRK",
    "ShortName": "卡瓦佐斯堡/基林"
  },
  {
    "IATACode": "GTR",
    "ShortName": "哥伦布/西点"
  },
  {
    "IATACode": "GVX",
    "ShortName": "耶夫勒/桑德维肯"
  },
  {
    "IATACode": "HEE",
    "ShortName": "海伦娜/西海伦娜"
  },
  {
    "IATACode": "HLR",
    "ShortName": "卡瓦佐斯堡(基林)"
  },
  {
    "IATACode": "HOH",
    "ShortName": "霍恩埃姆斯/多恩比恩"
  },
  {
    "IATACode": "HOP",
    "ShortName": "坎贝尔堡/霍普金斯维尔"
  },
  {
    "IATACode": "HSK",
    "ShortName": "蒙弗洛里特/阿尔卡拉"
  },
  {
    "IATACode": "HTW",
    "ShortName": "切萨皮克/亨廷顿"
  },
  {
    "IATACode": "HZB",
    "ShortName": "梅尔维尔/卡洛讷"
  },
  {
    "IATACode": "JHF",
    "ShortName": "圣罗克"
  },
  {
    "IATACode": "JOE",
    "ShortName": "约恩苏/里佩里"
  },
  {
    "IATACode": "KEM",
    "ShortName": "凯米/托尔尼奥"
  },
  {
    "IATACode": "KEV",
    "ShortName": "哈利/库奥雷韦西"
  },
  {
    "IATACode": "KOK",
    "ShortName": "科科拉/克罗诺比"
  },
  {
    "IATACode": "KRF",
    "ShortName": "克拉姆福什/索莱夫特奥"
  },
  {
    "IATACode": "KUO",
    "ShortName": "库奥皮奥/锡林耶尔维"
  },
  {
    "IATACode": "LBI",
    "ShortName": "阿尔比/勒塞凯斯特"
  },
  {
    "IATACode": "LDE",
    "ShortName": "塔布/卢尔德"
  },
  {
    "IATACode": "LEH",
    "ShortName": "勒阿弗尔/奥克特维尔"
  },
  {
    "IATACode": "LEU",
    "ShortName": "蒙特费雷尔/卡斯特利沃"
  },
  {
    "IATACode": "LEW",
    "ShortName": "奥本/刘易斯顿"
  },
  {
    "IATACode": "LIG",
    "ShortName": "利摩日/贝勒加德"
  },
  {
    "IATACode": "LIL",
    "ShortName": "里尔/莱斯坎"
  },
  {
    "IATACode": "LIY",
    "ShortName": "斯图尔特堡(海恩斯维尔)"
  },
  {
    "IATACode": "LJN",
    "ShortName": "安格尔顿/杰克逊湖"
  },
  {
    "IATACode": "LME",
    "ShortName": "勒芒/阿尔纳日"
  },
  {
    "IATACode": "LOH",
    "ShortName": "拉托马 (卡塔马约)"
  },
  {
    "IATACode": "LOT",
    "ShortName": "芝加哥/罗密欧维尔"
  },
  {
    "IATACode": "LPB",
    "ShortName": "拉巴斯/埃尔阿尔托"
  },
  {
    "IATACode": "LPY",
    "ShortName": "勒皮/卢德"
  },
  {
    "IATACode": "LRH",
    "ShortName": "拉罗谢尔/雷岛"
  },
  {
    "IATACode": "LRT",
    "ShortName": "洛里昂/拉恩/比乌埃"
  },
  {
    "IATACode": "LSF",
    "ShortName": "本宁堡(哥伦布)"
  },
  {
    "IATACode": "LVA",
    "ShortName": "拉瓦勒/昂特拉姆"
  },
  {
    "IATACode": "LYN",
    "ShortName": "里昂/布龙"
  },
  {
    "IATACode": "MCU",
    "ShortName": "蒙吕松/盖雷"
  },
  {
    "IATACode": "MCU",
    "ShortName": "蒙吕松/多梅拉"
  },
  {
    "IATACode": "MDH",
    "ShortName": "卡本代尔/墨菲斯伯勒"
  },
  {
    "IATACode": "MEN",
    "ShortName": "芒德/布雷努"
  },
  {
    "IATACode": "MLH",
    "ShortName": "巴塞尔/米卢斯"
  },
  {
    "IATACode": "MPL",
    "ShortName": "蒙彼利埃/地中海"
  },
  {
    "IATACode": "MPV",
    "ShortName": "巴里/蒙彼利埃"
  },
  {
    "IATACode": "MRC",
    "ShortName": "哥伦比亚/芒特普莱森特"
  },
  {
    "IATACode": "MTO",
    "ShortName": "马顿/查尔斯顿"
  },
  {
    "IATACode": "MVW",
    "ShortName": "伯灵顿/芒特弗农"
  },
  {
    "IATACode": "MXN",
    "ShortName": "莫莱/普卢让"
  },
  {
    "IATACode": "MZM",
    "ShortName": "梅斯/弗雷斯卡蒂"
  },
  {
    "IATACode": "NCT",
    "ShortName": "尼科亚/瓜纳卡斯特"
  },
  {
    "IATACode": "NCY",
    "ShortName": "阿讷西/梅泰"
  },
  {
    "IATACode": "NIT",
    "ShortName": "尼奥尔/苏谢"
  },
  {
    "IATACode": "NVS",
    "ShortName": "讷韦尔/富尔尚博"
  },
  {
    "IATACode": "NYO",
    "ShortName": "斯德哥尔摩/尼雪平"
  },
  {
    "IATACode": "OBS",
    "ShortName": "欧布纳/阿尔代什"
  },
  {
    "IATACode": "ORE",
    "ShortName": "奥尔良/布里西"
  },
  {
    "IATACode": "ORE",
    "ShortName": "奥尔良/圣但尼德洛泰勒"
  },
  {
    "IATACode": "OUL",
    "ShortName": "奥卢/奥伦萨洛"
  },
  {
    "IATACode": "OYL",
    "ShortName": "莫亚莱 (下)"
  },
  {
    "IATACode": "OZR",
    "ShortName": "拉克堡/奥扎克"
  },
  {
    "IATACode": "PDG",
    "ShortName": "巴东/卡塔平"
  },
  {
    "IATACode": "PDG",
    "ShortName": "巴东/卡塔平"
  },
  {
    "IATACode": "PGF",
    "ShortName": "佩皮尼昂/里沃萨尔特"
  },
  {
    "IATACode": "PGX",
    "ShortName": "佩里格/巴西亚克"
  },
  {
    "IATACode": "PIB",
    "ShortName": "哈蒂斯堡/劳雷尔"
  },
  {
    "IATACode": "PIS",
    "ShortName": "普瓦捷/比亚尔"
  },
  {
    "IATACode": "PNX",
    "ShortName": "谢尔曼/丹尼森"
  },
  {
    "IATACode": "POL",
    "ShortName": "彭巴/阿梅利亚港"
  },
  {
    "IATACode": "PUF",
    "ShortName": "波城/比利牛斯"
  },
  {
    "IATACode": "PUR",
    "ShortName": "波多黎各/曼努阿"
  },
  {
    "IATACode": "PUW",
    "ShortName": "普尔曼/莫斯科"
  },
  {
    "IATACode": "PVK",
    "ShortName": "普雷韦扎/莱夫卡达"
  },
  {
    "IATACode": "QAM",
    "ShortName": "亚眠/格利西"
  },
  {
    "IATACode": "QIE",
    "ShortName": "伊斯特尔/勒图贝"
  },
  {
    "IATACode": "QNX",
    "ShortName": "马孔/沙尔奈"
  },
  {
    "IATACode": "QYR",
    "ShortName": "特鲁瓦/巴尔伯雷"
  },
  {
    "IATACode": "RCO",
    "ShortName": "罗什福尔/圣阿尼昂"
  },
  {
    "IATACode": "RDU",
    "ShortName": "罗利/达勒姆"
  },
  {
    "IATACode": "RDZ",
    "ShortName": "罗德兹/马克西拉克"
  },
  {
    "IATACode": "RFD",
    "ShortName": "芝加哥/罗克福德"
  },
  {
    "IATACode": "RFR",
    "ShortName": "里奥弗里奥/普罗格雷索"
  },
  {
    "IATACode": "RHE",
    "ShortName": "兰斯/香槟"
  },
  {
    "IATACode": "RIR",
    "ShortName": "里弗赛德/鲁比杜"
  },
  {
    "IATACode": "RNE",
    "ShortName": "罗阿讷/勒奈松"
  },
  {
    "IATACode": "RNS",
    "ShortName": "雷恩/圣雅克"
  },
  {
    "IATACode": "RYN",
    "ShortName": "鲁瓦扬/梅迪"
  },
  {
    "IATACode": "SBK",
    "ShortName": "圣布里厄/阿尔莫"
  },
  {
    "IATACode": "SCR",
    "ShortName": "萨伦"
  },
  {
    "IATACode": "SCZ",
    "ShortName": "圣克鲁斯/格拉西奥萨"
  },
  {
    "IATACode": "SDL",
    "ShortName": "松兹瓦尔/海讷桑德"
  },
  {
    "IATACode": "SEE",
    "ShortName": "圣地亚哥/埃尔卡洪"
  },
  {
    "IATACode": "SHD",
    "ShortName": "斯汤顿/韦恩斯伯勒"
  },
  {
    "IATACode": "SJY",
    "ShortName": "塞伊奈约基/伊尔马约基"
  },
  {
    "IATACode": "SNR",
    "ShortName": "圣纳泽尔/蒙图瓦尔"
  },
  {
    "IATACode": "SOC",
    "ShortName": "苏卡尔塔(梭罗)"
  },
  {
    "IATACode": "SOP",
    "ShortName": "派恩赫斯特/南派恩斯"
  },
  {
    "IATACode": "SQI",
    "ShortName": "斯特林/罗克福尔斯"
  },
  {
    "IATACode": "SRD",
    "ShortName": "圣拉蒙/马马雷"
  },
  {
    "IATACode": "SRQ",
    "ShortName": "萨拉索塔/布雷登顿"
  },
  {
    "IATACode": "STA",
    "ShortName": "斯凯恩/灵克宾"
  },
  {
    "IATACode": "TLN",
    "ShortName": "土伦/耶尔/勒帕利韦斯特"
  },
  {
    "IATACode": "TMP",
    "ShortName": "坦佩雷/皮尔卡拉"
  },
  {
    "IATACode": "TRI",
    "ShortName": "布里斯托尔/约翰逊城"
  },
  {
    "IATACode": "TUF",
    "ShortName": "图尔/卢瓦尔河谷"
  },
  {
    "IATACode": "UGN",
    "ShortName": "芝加哥/沃基根"
  },
  {
    "IATACode": "UIP",
    "ShortName": "坎佩尔/普吕居方"
  },
  {
    "IATACode": "URO",
    "ShortName": "鲁昂/塞纳河谷"
  },
  {
    "IATACode": "USM",
    "ShortName": "纳通 (苏梅岛)"
  },
  {
    "IATACode": "UTI",
    "ShortName": "乌蒂/瓦尔克亚拉"
  },
  {
    "IATACode": "VAF",
    "ShortName": "瓦朗斯/沙伯伊"
  },
  {
    "IATACode": "VDM",
    "ShortName": "别德马/卡门"
  },
  {
    "IATACode": "VHY",
    "ShortName": "维希/沙尔梅伊"
  },
  {
    "IATACode": "VIH",
    "ShortName": "罗拉/维希"
  },
  {
    "IATACode": "VIY",
    "ShortName": "维拉库布莱/韦利济"
  },
  {
    "IATACode": "VNE",
    "ShortName": "瓦讷/默孔"
  },
  {
    "IATACode": "VRK",
    "ShortName": "瓦尔考斯/约罗伊宁"
  },
  {
    "IATACode": "VST",
    "ShortName": "斯德哥尔摩/韦斯特罗斯"
  },
  {
    "IATACode": "WLD",
    "ShortName": "温菲尔德/阿肯色城"
  },
  {
    "IATACode": "XAB",
    "ShortName": "阿布维尔"
  },
  {
    "IATACode": "XAC",
    "ShortName": "阿尔卡雄/拉泰斯特德比什"
  },
  {
    "IATACode": "XAS",
    "ShortName": "阿莱斯/多"
  },
  {
    "IATACode": "XBK",
    "ShortName": "布尔格/塞泽里亚"
  },
  {
    "IATACode": "XBQ",
    "ShortName": "布卢瓦/勒布勒伊"
  },
  {
    "IATACode": "XBV",
    "ShortName": "博讷/沙朗日"
  },
  {
    "IATACode": "XCB",
    "ShortName": "康布雷/埃皮努瓦"
  },
  {
    "IATACode": "XCD",
    "ShortName": "沙隆/尚福尔热伊"
  },
  {
    "IATACode": "XCR",
    "ShortName": "沙隆/瓦特里"
  },
  {
    "IATACode": "XLR",
    "ShortName": "利布尔讷/阿尔蒂格"
  },
  {
    "IATACode": "XME",
    "ShortName": "莫伯日/埃莱姆"
  },
  {
    "IATACode": "XMF",
    "ShortName": "蒙贝利亚尔/库塞勒"
  },
  {
    "IATACode": "XMU",
    "ShortName": "穆兰/蒙伯尼"
  },
  {
    "IATACode": "XNA",
    "ShortName": "费耶特维尔/斯普林代尔"
  },
  {
    "IATACode": "XOG",
    "ShortName": "奥朗日/卡里塔"
  },
  {
    "IATACode": "XSJ",
    "ShortName": "佩罗讷/圣康坦"
  },
  {
    "IATACode": "XSU",
    "ShortName": "索米尔/圣弗洛朗"
  },
  {
    "IATACode": "XVF",
    "ShortName": "自由城/塔拉雷"
  },
  {
    "IATACode": "XVN",
    "ShortName": "凡尔登/勒罗泽利耶"
  },
  {
    "IATACode": "XVO",
    "ShortName": "沃苏勒/弗罗泰"
  },
  {
    "IATACode": "XVS",
    "ShortName": "瓦朗谢讷/德南"
  },
  {
    "IATACode": "YAH",
    "ShortName": "拉格朗德-4"
  },
  {
    "IATACode": "YAR",
    "ShortName": "拉格朗德-3"
  },
  {
    "IATACode": "YNG",
    "ShortName": "扬斯敦/沃伦"
  },
  {
    "IATACode": "ZAO",
    "ShortName": "卡奥尔/拉尔邦克"
  }
];

module.exports = remainingChineseAirports;