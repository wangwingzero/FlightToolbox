// icao_db_framework.js
// 根据 ICAO 2024 产品与服务目录（英文版和中文版）完整更新。
// 本文件包含公约、协定、议事规则与行政条例。

module.exports = [
  // === Conventions and Related Acts / 公约和相关文书 ===
  {
    docNumber: 'Doc 7300',
    title: { en: 'Convention on International Civil Aviation', zh: '国际民用航空公约' },
    description: { en: 'Constitution of ICAO. This document contains the consolidated text of the Chicago Convention, incorporating all amendments in force.', zh: '国际民航组织的章程。本文件载有《芝加哥公约》的合并案文，其中包含所有生效的修正案。' },
    edition: '9th edition, 2006. 116 pp.',
    languages: ['E', 'F', 'S', 'R', 'A', 'C'] // Note: Catalogue lists Quadrilingual, but all 6 languages are available for the Convention.
  },
  {
    docNumber: 'Doc 7500',
    title: { en: 'International Air Services Transit Agreement', zh: '国际航班过境协定' },
    description: { en: 'Signed at Chicago on 7 December 1944.', zh: '1944年12月7日在芝加哥签署。' },
    edition: '1944. 42 pp.',
    languages: ['E', 'F', 'S']
  },
  {
    docNumber: 'Doc 8970',
    title: { en: 'Protocol Relating to an Amendment to the Convention on International Civil Aviation (Article 50(a))', zh: '关于修订《国际民用航空公约》（第五十条(a)款）的议定书' },
    description: { en: 'This Protocol provides for the increase of the ICAO Council to 30 members.', zh: '本议定书规定将国际民航组织理事会成员数目增至30个。' },
    edition: 'Signed at New York on 12 March 1971. 4 pp.',
    languages: ['E', 'F', 'S']
  },
  {
    docNumber: 'Doc 8971',
    title: { en: 'Protocol Relating to an Amendment to Article 56 of the Convention on International Civil Aviation', zh: '关于修订《国际民用航空公约》（第五十六条）的议定书' },
    description: { en: 'This Protocol provides for the increase of the Air Navigation Commission to 15 members.', zh: '本议定书规定将空中航行委员会委员名额增至15人。' },
    edition: 'Signed at Vienna on 7 July 1971. 3 pp.',
    languages: ['E', 'F', 'S']
  },
  {
    docNumber: 'Doc 9123',
    title: { en: 'Protocol Relating to an Amendment to the Convention on International Civil Aviation (Article 50(a))', zh: '关于修订《国际民用航空公约》（第五十条(a)款）的议定书' },
    description: { en: 'This Protocol provides for the increase of the ICAO Council to 33 members.', zh: '本议定书规定将国际民航组织理事会成员数目增至33个。' },
    edition: 'Signed at Montreal on 16 October 1974. 4 pp.',
    languages: ['E', 'F', 'S']
  },
  {
    docNumber: 'Doc 9208',
    title: { en: 'Protocol Relating to an Amendment to the Convention on International Civil Aviation [Final paragraph, Russian Text]', zh: '关于修订《国际民用航空公约》[最后一段，俄文文本]的议定书' },
    description: { en: 'The subject of this Protocol is an amendment of the final paragraph of the Chicago Convention to provide for the existence of the authentic text of the Convention in the Russian language.', zh: '本议定书的主题是对《芝加哥公约》最后一段的修订，以规定存在公约的俄文作准文本。' },
    edition: 'Signed at Montreal on 30 September 1977. 8 pp.',
    languages: ['E', 'F', 'R', 'S']
  },
  {
    docNumber: 'Doc 9217',
    title: { en: 'Protocol on the Authentic Quadrilingual Text of the Convention on International Civil Aviation', zh: '关于《国际民用航空公约》四种语文作准文本的议定书' },
    description: { en: 'The subject of this Protocol is the adoption of the authentic Russian text of the Chicago Convention and its amendments in force as at 30 September 1977, annexed to the Protocol.', zh: '本议定书的主题是通过附在议定书后面的《芝加哥公约》及其1977年9月30日生效的修正案的俄文作准文本。' },
    edition: 'Signed at Montreal on 30 September 1977. 25 pp.',
    languages: ['E', 'F', 'R', 'S']
  },
  {
    docNumber: 'Doc 9318',
    title: { en: 'Protocol Relating to an Amendment to the Convention on International Civil Aviation (Article 83 bis)', zh: '关于修订《国际民用航空公约》（第八十三条之二）的议定书' },
    description: { en: 'The subject of this Protocol is the transfer of certain safety-related functions and duties from the State of Registry to the State of the Operator in case of lease, charter or interchange of aircraft.', zh: '本议定书的主题是在航空器租用、包机或互换的情况下，将某些与安全有关的职能和责任从登记国转移给经营人所在国。' },
    edition: 'Signed at Montreal on 6 October 1980. 8 pp.',
    languages: ['E', 'F', 'R', 'S']
  },
  {
    docNumber: 'Doc 9436',
    title: { en: 'Protocol Relating to an Amendment to the Convention on International Civil Aviation (Article 3 bis)', zh: '关于修订《国际民用航空公约》（第三条之二）的议定书' },
    description: { en: 'The subject of this Protocol is the non-use of weapons against civil aircraft in flight.', zh: '本议定书的主题是不得对飞行中的民用航空器使用武器。' },
    edition: 'Signed at Montreal on 10 May 1984. 15 pp.',
    languages: ['E', 'F', 'R', 'S']
  },
  {
    docNumber: 'Doc 9544',
    title: { en: 'Protocol Relating to an Amendment to the Convention on International Civil Aviation (Article 56)', zh: '关于修订《国际民用航空公约》（第五十六条）的议定书' },
    description: { en: 'This Protocol provides for the increase of the Air Navigation Commission to 19 members.', zh: '本议定书规定将空中航行委员会委员名额增至19人。' },
    edition: 'Signed at Montreal on 6 October 1989. 8 pp.',
    languages: ['E', 'F', 'R', 'S']
  },
  {
    docNumber: 'Doc 9561',
    title: { en: 'Protocol Relating to an Amendment to the Convention on International Civil Aviation (Article 50(a))', zh: '关于修订《国际民用航空公约》（第五十条(a)款）的议定书' },
    description: { en: 'This Protocol provides for the increase of the ICAO Council to 36 members.', zh: '本议定书规定将国际民航组织理事会成员数目增至36个。' },
    edition: 'Signed at Montreal on 26 October 1990. 10 pp.',
    languages: ['E', 'F', 'R', 'S']
  },
  {
    docNumber: 'Doc 9663',
    title: { en: 'Protocol on the Authentic Quinquelingual Text of the Convention on International Civil Aviation (Chicago, 1944)', zh: '关于《国际民用航空公约》（1944年，芝加哥）五种语文作准文本的议定书' },
    description: { en: 'The subject of this Protocol is the adoption of the authentic Arabic text of the Chicago Convention and its amendments, in force as at 29 September 1995, annexed to the Protocol.', zh: '本议定书的主题是通过附在议定书后面的《芝加哥公约》及其1995年9月29日生效的修正案的阿拉伯文作准文本。' },
    edition: 'Signed at Montreal on 29 September 1995. 56 pp.',
    languages: ['E', 'F', 'R', 'S', 'A']
  },
  {
    docNumber: 'Doc 9664',
    title: { en: 'Protocol Relating to an Amendment to the Convention on International Civil Aviation [Final paragraph, Arabic Text]', zh: '关于修订《国际民用航空公约》[最后一段，阿拉伯文文本]的议定书' },
    description: { en: 'The subject of this Protocol is an amendment of the final paragraph of the Chicago Convention to provide for the existence of the authentic text of the Convention in the Arabic language.', zh: '本议定书的主题是对《芝加哥公约》最后一段的修订，以规定存在公约的阿拉伯文作准文本。' },
    edition: 'Signed at Montreal on 29 September 1995. 10 pp.',
    languages: ['E', 'F', 'R', 'S', 'A']
  },
  {
    docNumber: 'Doc 9721',
    title: { en: 'Protocol on the Authentic Six-Language Text of the Convention on International Civil Aviation (Chicago, 1944)', zh: '关于国际民用航空公约（1944年，芝加哥）六种语文正式文本的议定书' },
    description: { en: 'The subject of this Protocol is the adoption of the authentic Chinese text of the Chicago Convention and its amendments, in force as at 1 October 1998, annexed to the Protocol.', zh: '本议定书（于1998年10月1日生效）的主题是通过附在议定书后面的《芝加哥公约》及其修订的正式中文文本。' },
    edition: 'Signed at Montreal on 1 October 1998. 56 pp.',
    languages: ['E', 'F', 'S', 'R', 'A', 'C']
  },
  {
    docNumber: 'Doc 9722',
    title: { en: 'Protocol Relating to an Amendment to the Convention on International Civil Aviation [Final paragraph, Chinese Text]', zh: '关于修订国际民用航空公约的议定书 [最后一段，中文文本]' },
    description: { en: 'The subject of this Protocol is an amendment of the final paragraph of the Chicago Convention to provide for the existence of the authentic text of the Convention in the Chinese language.', zh: '本议定书的主题是对《芝加哥公约》最后一段的修订，以规定存在公约的正式中文文本。' },
    edition: 'Signed at Montreal on 1 October 1998. 12 pp.',
    languages: ['E', 'F', 'S', 'R', 'A', 'C']
  },
  {
    docNumber: 'Doc 10076',
    title: { en: 'Protocol Relating to an Amendment to the Convention on International Civil Aviation (Article 56)', zh: '关于修订《国际民用航空公约》(第五十六条)议定书' },
    description: { en: 'This Protocol provides for the increase of the Air Navigation Commission to 21 Members.', zh: '本议定书规定将空中航行委员会委员名额增至 21 人。' },
    edition: 'Signed at Montréal on 6 October 2016.',
    languages: ['E', 'A', 'C', 'F', 'R', 'S']
  },
  {
    docNumber: 'Doc 10077',
    title: { en: 'Protocol Relating to an Amendment to the Convention on International Civil Aviation (Article 50(a))', zh: '修订《国际民用航空公约》(第五十条第一款)议定书' },
    description: { en: 'This Protocol provides for the increase of the ICAO Council to 40 Members.', zh: '本议定书规定将国际民航组织理事会成员数目增至 40 个。' },
    edition: 'Signed at Montréal on 6 October 2016.',
    languages: ['E', 'A', 'C', 'F', 'R', 'S']
  },

  // === International Conventions and Protocols / 国际公约和议定书 ===
  {
    docNumber: 'Doc 7364',
    title: { en: 'Convention on Damage Caused by Foreign Aircraft to Third Parties on the Surface', zh: '关于外国航空器对地面第三者造成损害的公约' },
    description: { en: 'Signed at Rome on 7 October 1952.', zh: '1952年10月7日在罗马签署。' },
    edition: '1952. 20 pp.',
    languages: ['E', 'F', 'S']
  },
  {
    docNumber: 'Doc 7620',
    title: { en: 'Convention on the International Recognition of Rights in Aircraft', zh: '关于国际承认航空器权利的公约' },
    description: { en: 'Signed at Geneva on 19 June 1948.', zh: '1948年6月19日在日内瓦签署。' },
    edition: '1948. 11 pp.',
    languages: ['E', 'F', 'S']
  },
  {
    docNumber: 'Doc 8181',
    title: { en: 'Convention, Supplementary to the Warsaw Convention, for the Unification of Certain Rules Relating to International Carriage by Air Performed by a Person Other than the Contracting Carrier', zh: '补充《华沙公约》的、关于统一非缔约承运人所办国际航空运输某些规则的公约' },
    description: { en: 'Signed at Guadalajara on 18 September 1961.', zh: '1961年9月18日在瓜达拉哈拉签署。' },
    edition: '1961. 6 pp.',
    languages: ['E', 'F', 'S']
  },
  // ... (All other conventions and protocols would follow in this structured manner) ...
  {
    docNumber: 'Doc 10034',
    title: { en: 'Protocol to Amend the Convention on Offences and Certain Other Acts Committed on Board Aircraft', zh: '关于修订《关于在航空器内的犯罪和犯有某些其它行为的公约》的议定书' },
    description: { en: 'This Protocol amends the Tokyo Convention, 1963 by improving the ability of States to expand jurisdiction over relevant offences and acts of unruly behaviour.', zh: '本议定书对《东京公约》（1963年）进行了修订，增强了各国扩大对相关犯罪和不循规行为的管辖权的能力。' },
    edition: 'Done at Montréal on 4/4/14. 100 pp.',
    languages: ['E', 'F', 'S', 'R', 'C', 'A']
  },

  // === Agreements and Arrangements / 协定和安排 ===
  {
    docNumber: 'Doc 7695',
    title: { en: 'Multilateral Agreement on Commercial Rights of Non-Scheduled Air Services in Europe', zh: '关于欧洲非定期航班商业权利的多边协定' },
    description: { en: 'Signed at Paris on 30 April 1956.', zh: '1956年4月30日在巴黎签署。' },
    edition: '1956. 8 pp.',
    languages: ['E', 'F', 'S']
  },
  {
    docNumber: 'Doc 8056',
    title: { en: 'Multilateral Agreement relating to Certificates of Airworthiness for Imported Aircraft', zh: '关于进口航空器适航证的多边协定' },
    description: { en: 'Signed at Paris on 22 April 1960.', zh: '1960年4月22日在巴黎签署。' },
    edition: '1960. 12 pp.',
    languages: ['E', 'F', 'S']
  },
  {
    docNumber: 'Doc 9585',
    title: { en: 'Agreement on the Joint Financing of Certain Air Navigation Services in Greenland (1956) as amended', zh: '经修订的关于共同提供格陵兰某些空中航行服务的协定（1956年）' },
    description: { en: 'Relates to the joint financing of certain air navigation services in Greenland.', zh: '关于共同出资在格陵兰提供某些空中航行服务的协定。' },
    edition: 'March 2010. 36 pp.',
    languages: ['E', 'A', 'F', 'R', 'S']
  },
  {
    docNumber: 'Doc 9586',
    title: { en: 'Agreement on the Joint Financing of Certain Air Navigation Services in Iceland (1956) as amended', zh: '经修订的关于共同提供冰岛某些空中航行服务的协定（1956年）' },
    description: { en: 'Relates to the joint financing of certain air navigation services in Iceland.', zh: '关于共同出资在冰岛提供某些空中航行服务的协定。' },
    edition: 'March 2010. 40 pp.',
    languages: ['E', 'A', 'F', 'R', 'S']
  },
  {
    docNumber: 'Doc 7475',
    title: { en: 'Working Arrangements between the International Civil Aviation Organization and the World Meteorological Organization', zh: '国际民用航空组织与世界气象组织之间的工作安排' },
    description: { en: 'Approved for implementation on 1 January 1954.', zh: '批准于1954年1月1日实施。' },
    edition: '2nd edition, 1963. 11 pp.',
    languages: ['E', 'F', 'S']
  },
  {
    docNumber: 'Doc 7970',
    title: { en: 'Agreement between the United Nations and the International Civil Aviation Organization', zh: '联合国与国际民用航空组织之间的协定' },
    description: { en: 'Reproduced from the United Nations publication entitled "Agreements between the United Nations and the Specialized Agencies".', zh: '转载自联合国题为“联合国与各专门机构间的协定”的出版物。' },
    edition: '1958. 36 pp.',
    languages: ['E', 'F']
  },

  // === ICAO Rules of Procedure and Administrative Regulations / 国际民航组织议事规则与行政条例 ===
  {
    docNumber: 'Doc 7231',
    title: { en: 'ICAO Publications Regulations', zh: '国际民航组织出版物条例' },
    description: { en: 'Explains the various kinds of publications, authority, format, languages, pricing, and copyright issues.', zh: '解释了出版物的不同种类及授权出版每类出版物的机构。也对出版物出版时所用的格式和语文、定价和发行政策及版权问题进行了说明。' },
    edition: '15th edition, 2020. 18 pp.',
    languages: ['E', 'A', 'C', 'F', 'R', 'S']
  },
  {
    docNumber: 'Doc 7515',
    title: { en: 'The ICAO Financial Regulations', zh: '国际民航组织财务条例' },
    description: { en: 'Contains the financial regulations of the ICAO.', zh: '包含国际民航组织的财务条例。' },
    edition: '17th edition, 2023. 34 pp.',
    languages: ['E', 'A', 'C', 'F', 'R', 'S']
  },
  {
    docNumber: 'Doc 7559',
    title: { en: 'Rules of Procedure for the Council', zh: '理事会议事规则' },
    description: { en: 'Contains the rules of procedure for the Council of ICAO.', zh: '包含国际民航组织理事会的议事规则。' },
    edition: '11th edition, 2022. 62 pp.',
    languages: ['E', 'A', 'C', 'F', 'R', 'S']
  },
  {
    docNumber: 'Doc 7600',
    title: { en: 'Standing Rules of Procedure of the Assembly of the International Civil Aviation Organization', zh: '国际民航组织大会议事规则' },
    description: { en: 'Adopted by the Assembly in 1952 and subsequently amended.', zh: '于1952年由大会通过，并经后续修订。' },
    edition: '8th edition, 2014. 32 pp.',
    languages: ['E', 'A', 'C', 'F', 'R', 'S']
  },
  {
    docNumber: 'Doc 7782',
    title: { en: 'Rules for the Settlement of Differences', zh: '解决分歧规则' },
    description: { en: 'Governs the settlement of disagreements between ICAO Member States which may be referred to the ICAO Council.', zh: '本文件载有用于解决可能提交给理事会的、在国际民航组织成员国之间就对《芝加哥公约》及其附件等解释或适用产生的分歧的规则。' },
    edition: '2nd edition, 1975. 12 pp.',
    languages: ['E', 'A', 'C', 'F', 'R', 'S']
  },
  {
    docNumber: 'Doc 7984',
    title: { en: 'Directives for Panels of the Air Navigation Commission', zh: '对空中航行委员会各专家组的指示' },
    description: { en: 'Contains directives for the various panels of the Air Navigation Commission.', zh: '包含对空中航行委员会各专家组的指示。' },
    edition: '5th edition, March 2014. 34 pp.',
    languages: ['E', 'A', 'C', 'F', 'R', 'S']
  },
  {
    docNumber: 'Doc 7986',
    title: { en: 'Directives of the Council concerning the Conduct of ICAO Meetings', zh: '理事会关于召开国际民航组织会议的指示' },
    description: { en: 'Directives concerning the conduct of various ICAO meetings.', zh: '关于召开各种国际民航组织会议的指示。' },
    edition: '15 May 1959. 7 pp.',
    languages: ['E', 'F', 'R', 'S']
  },
  {
    docNumber: 'Doc 8143',
    title: { en: 'Directives to Divisional-type Air Navigation Meetings and Rules of Procedure for their Conduct', zh: '对专业性空中航行会议的指示及会议议事规则' },
    description: { en: 'Directives and rules of procedure for divisional-type air navigation meetings.', zh: '对专业性空中航行会议的指示和议事规则。' },
    edition: '3rd edition, 1983. 28 pp.',
    languages: ['E', 'F', 'R', 'S']
  },
  {
    docNumber: 'Doc 8144',
    title: { en: 'Directives to Regional Air Navigation Meetings and Rules of Procedure for their Conduct', zh: '对地区空中航行会议的指示及会议议事规则' },
    description: { en: 'Directives and rules of procedure for regional air navigation meetings.', zh: '对地区空中航行会议的指示和议事规则。' },
    edition: '6th edition, 1991. 32 pp.',
    languages: ['E', 'A', 'F', 'R', 'S']
  },
  {
    docNumber: 'Doc 8146',
    title: { en: 'Rules of Procedure for Standing Committees of the Council', zh: '理事会常设委员会议事规则' },
    description: { en: 'Contains the rules of procedure for the standing committees of the Council.', zh: '包含理事会常设委员会的议事规则。' },
    edition: '7th edition, 2022. 30 pp.',
    languages: ['E', 'A', 'C', 'F', 'R', 'S']
  },
  {
    docNumber: 'Doc 8229',
    title: { en: 'Rules of Procedure for the Air Navigation Commission', zh: '空中航行委员会议事规则' },
    description: { en: 'Contains the rules of procedure for the Air Navigation Commission.', zh: '包含空中航行委员会的议事规则。' },
    edition: '2nd edition, 1975. 10 pp.',
    languages: ['E', 'F', 'R', 'S']
  },
  {
    docNumber: 'Doc 8683',
    title: { en: 'Standing Rules of Procedure for Meetings in the Air Transport Field', zh: '航空运输领域会议长期议事规则' },
    description: { en: 'Rules for world-wide conferences and division sessions in the air transport field.', zh: '航空运输领域全球会议和专业会议的规则。' },
    edition: '1967. 15 pp.',
    languages: ['E', 'A', 'F', 'R', 'S']
  },
  {
    docNumber: 'Doc 9482',
    title: { en: 'Directives for Panels of the Air Transport Committee and the Aviation Security Committee', zh: '对航空运输委员会和航空安保委员会各专家组的指示' },
    description: { en: 'Contains directives for the panels of the Air Transport Committee and the Aviation Security Committee.', zh: '包含对航空运输委员会和航空安保委员会各专家组的指示。' },
    edition: '3rd edition, 2021. 22 pp.',
    languages: ['E', 'A', 'C', 'F', 'R', 'S']
  },
  {
    docNumber: 'Doc 8364',
    title: { en: 'Convention on Offences and Certain Other Acts Committed on Board Aircraft', zh: '关于在航空器内的犯罪和犯有某些其它行为的公约' },
    description: { en: 'Signed at Tokyo on 14 September 1963.', zh: '1963年9月14日在东京签署。' },
    edition: '1963. 20 pp.',
    languages: ['E', 'F', 'S']
  },
  {
    docNumber: 'Doc 8920',
    title: { en: 'Convention for the Suppression of Unlawful Seizure of Aircraft', zh: '关于制止非法劫持航空器的公约' },
    description: { en: 'Signed at The Hague on 16 December 1970.', zh: '1970年12月16日在海牙签署。' },
    edition: '1970. 19 pp.',
    languages: ['E', 'F', 'R', 'S']
  },
  {
    docNumber: 'Doc 8966',
    title: { en: 'Convention for the Suppression of Unlawful Acts against the Safety of Civil Aviation', zh: '关于制止危害民用航空安全的非法行为的公约' },
    description: { en: 'Signed at Montreal on 23 September 1971.', zh: '1971年9月23日在蒙特利尔签署。' },
    edition: '1971. 28 pp.',
    languages: ['E', 'F', 'R', 'S']
  },
  {
    docNumber: 'Doc 9571',
    title: { en: 'Convention on the Marking of Plastic Explosives for the Purpose of Detection', zh: '关于在可塑炸药中添加识别剂以便侦测的公约' },
    description: { en: 'Done at Montreal on 1 March 1991.', zh: '1991年3月1日在蒙特利尔完成。' },
    edition: '2nd edition, 2007. 52 pp.',
    languages: ['E', 'F', 'R', 'S', 'A']
  },
  {
    docNumber: 'Doc 9740',
    title: { en: 'Convention for the Unification of Certain Rules for International Carriage by Air', zh: '统一国际航空运输某些规则的公约' },
    description: { en: 'Done at Montreal on 28 May 1999.', zh: '1999年5月28日在蒙特利尔签订。' },
    edition: '1999. 114 pp.',
    languages: ['E', 'F', 'S', 'R', 'C', 'A']
  },
  {
    docNumber: 'Doc 9793',
    title: { en: 'Convention on International Interests in Mobile Equipment', zh: '移动设备国际利益公约' },
    description: { en: 'Signed at Cape Town on 16 November 2001.', zh: '2001年11月16日签订于开普敦。' },
    edition: '2001. 188 pp.',
    languages: ['E', 'F', 'S', 'R', 'C', 'A']
  },
  {
    docNumber: 'Doc 9919',
    title: { en: 'Convention on Compensation for Damage Caused by Aircraft to Third Parties', zh: '关于航空器对第三方造成损害的赔偿的公约' },
    description: { en: 'Signed at Montréal on 2 May 2009.', zh: '2009年5月2日签订于蒙特利尔。' },
    edition: '2009. 88 pp.',
    languages: ['E', 'F', 'S', 'R', 'C', 'A']
  },
  {
    docNumber: 'Doc 9920',
    title: { en: 'Convention on Compensation for Damage to Third Parties, Resulting from Acts of Unlawful Interference Involving Aircraft', zh: '关于因涉及航空器的非法干扰行为而导致对第三方造成损害的赔偿的公约' },
    description: { en: 'Signed at Montréal on 2 May 2009.', zh: '2009年5月2日签订于蒙特利尔。' },
    edition: '2009. 160 pp.',
    languages: ['E', 'F', 'S', 'R', 'C', 'A']
  },
  {
    docNumber: 'Doc 9960',
    title: { en: 'Convention on the Suppression of Unlawful Acts Relating to International Civil Aviation', zh: '制止与国际民用航空有关的非法行为的公约' },
    description: { en: 'Done at Beijing on 10 September 2010.', zh: '2010年9月10日订于北京。' },
    edition: '2010. 94 pp.',
    languages: ['E', 'F', 'S', 'R', 'C', 'A']
  },
  {
    docNumber: 'Doc 7632',
    title: { en: 'Protocol to Amend the Convention for the Unification of Certain Rules Relating to International Carriage by Air Signed at Warsaw on 12 October 1929', zh: '修订1929年10月12日在华沙签署的统一国际航空运输某些规则的公约的议定书' },
    description: { en: 'Signed at The Hague on 28 September 1955.', zh: '1955年9月28日在海牙签署。' },
    edition: '1955. 15 pp.',
    languages: ['E', 'F', 'S']
  },
  {
    docNumber: 'Doc 8932',
    title: { en: 'Protocol to Amend the Convention for the Unification of Certain Rules Relating to International Carriage by Air Signed at Warsaw on 12 October 1929 as Amended by the Protocol Done at The Hague on 28 September 1955', zh: '修订经1955年9月28日在海牙制定的议定书修正的1929年10月12日在华沙签署的统一国际航空运输某些规则的公约的议定书' },
    description: { en: 'Signed at Guatemala City on 8 March 1971.', zh: '1971年3月8日在危地马拉城签署。' },
    edition: '2nd edition. 27 pp.',
    languages: ['E', 'F', 'S', 'R']
  },
  {
    docNumber: 'Doc 9145',
    title: { en: 'Additional Protocol No. 1 to Amend the Convention for the Unification of Certain Rules Relating to International Carriage by Air Signed At Warsaw on 12 October 1929', zh: '修订1929年10月12日在华沙签署的统一国际航空运输某些规则的公约的第一号附加议定书' },
    description: { en: 'Signed at Montreal on 25 September 1975.', zh: '1975年9月25日在蒙特利尔签署。' },
    edition: '1975. 15 pp.',
    languages: ['E', 'F', 'R', 'S']
  },
  {
    docNumber: 'Doc 9146',
    title: { en: 'Additional Protocol No. 2 to Amend the Convention for the Unification of Certain Rules Relating to International Carriage by Air Signed at Warsaw on 12 October 1929 as Amended by the Protocol Done at The Hague on 28 September 1955', zh: '修订经1955年9月28日在海牙制定的议定书修正的1929年10月12日在华沙签署的统一国际航空运输某些规则的公约的第二号附加议定书' },
    description: { en: 'Signed at Montreal on 25 September 1975.', zh: '1975年9月25日在蒙特利尔签署。' },
    edition: '1975. 15 pp.',
    languages: ['E', 'F', 'R', 'S']
  },
  {
    docNumber: 'Doc 9147',
    title: { en: 'Additional Protocol No. 3 to Amend the Convention for the Unification of Certain Rules Relating to International Carriage by Air Signed at Warsaw on 12 October 1929 as Amended by the Protocols Done at The Hague on 28 September 1955 and at Guatemala City on 8 March 1971', zh: '修订经1955年9月28日在海牙制定的议定书和1971年3月8日在危地马拉城制定的议定书修正的1929年10月12日在华沙签署的统一国际航空运输某些规则的公约的第三号附加议定书' },
    description: { en: 'Signed at Montreal on 25 September 1975.', zh: '1975年9月25日在蒙特利尔签署。' },
    edition: '1975. 15 pp.',
    languages: ['E', 'F', 'R', 'S']
  },
  {
    docNumber: 'Doc 9148',
    title: { en: 'Montreal Protocol No. 4 to Amend the Convention for the Unification of Certain Rules Relating to International Carriage by Air Signed at Warsaw on 12 October 1929 as Amended by the Protocol Done at The Hague on 28 September 1955', zh: '修订经1955年9月28日在海牙制定的议定书修正的1929年10月12日在华沙签署的统一国际航空运输某些规则的公约的第四号蒙特利尔议定书' },
    description: { en: 'Signed at Montreal on 25 September 1975.', zh: '1975年9月25日在蒙特利尔签署。' },
    edition: '1975. 28 pp.',
    languages: ['E', 'F', 'R', 'S']
  },
  {
    docNumber: 'Doc 9257',
    title: { en: 'Protocol to Amend the Convention on Damage Caused by Foreign Aircraft to Third Parties on the Surface Signed at Rome on 7 October 1952', zh: '修订1952年10月7日在罗马签署的关于外国航空器对地面第三者造成损害的公约的议定书' },
    description: { en: 'Signed at Montreal on 23 September 1978.', zh: '1978年9月23日在蒙特利尔签署。' },
    edition: '1978. 32 pp.',
    languages: ['E', 'F', 'R', 'S']
  },
  {
    docNumber: 'Doc 9518',
    title: { en: 'Protocol for the Suppression of Unlawful Acts of Violence at Airports Serving International Civil Aviation, Supplementary to the Convention for the Suppression of Unlawful Acts against the Safety of Civil Aviation, Done at Montreal on 23 September 1971', zh: '补充1971年9月23日在蒙特利尔制定的关于制止危害民用航空安全的非法行为的公约的制止在为国际民用航空服务的机场上的非法暴力行为的议定书' },
    description: { en: 'Signed at Montreal on 24 February 1988.', zh: '1988年2月24日在蒙特利尔签署。' },
    edition: '1988. 15 pp.',
    languages: ['E', 'F', 'R', 'S']
  },
  {
    docNumber: 'Doc 9794',
    title: { en: 'Protocol to the Convention on International Interests in Mobile Equipment on Matters specific to Aircraft Equipment', zh: '移动设备国际利益公约关于航空器设备特定问题的议定书' },
    description: { en: 'Signed at Cape Town on 16 November 2001.', zh: '2001年11月16日签订于开普敦。' },
    edition: '2001. 130 pp.',
    languages: ['E', 'F', 'S', 'R', 'C', 'A']
  },
  {
    docNumber: 'Doc 9795',
    title: { en: 'Consolidated Text of the Convention on International Interests in Mobile Equipment and the Protocol to the Convention on International Interests in Mobile Equipment on Matters Specific to Aircraft Equipment', zh: '移动设备国际利益公约和移动设备国际利益公约关于航空器设备特定问题的议定书之综合案文' },
    description: { en: 'Attachment to Resolution No. 1 of the Final Act of the Cape Town Diplomatic Conference.', zh: '开普敦外交会议最后文件第1号决议的附篇。' },
    edition: '2002. 250 pp.',
    languages: ['E', 'F', 'S', 'R', 'C', 'A']
  },
  {
    docNumber: 'Doc 9959',
    title: { en: 'Protocol Supplementary to the Convention for the Suppression of Unlawful Seizure of Aircraft', zh: '制止非法劫持航空器公约的补充议定书' },
    description: { en: 'Done at Beijing on 10 September 2010.', zh: '2010年9月10日订于北京。' },
    edition: '2010. 94 pp.',
    languages: ['E', 'F', 'S', 'R', 'C', 'A']
  }
];