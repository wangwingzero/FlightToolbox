/**
 * 危险品包装件的隔离规则 (增强可读性版)
 *
 * 数据来源：《危险品操作速查指南 2025.01》第 5 页
 * Source: Quick Reference Guide Handling of Dangerous Goods 2025.01, Page 5
 *
 * 此版本将危险品类别的中文名称直接添加到了矩阵的键中，以便于阅读和理解。
 * This version adds the Chinese names of the dangerous goods classes directly into the matrix keys for enhanced readability.
 */

/**
 * 隔离矩阵 (Segregation Matrix)
 *
 * - "X": 表示必须隔离 (Indicates that packages must be segregated).
 * - "—": 表示无需隔离 (Indicates that packages do not require segregation).
 * - "See Note 3": 表示存在特殊规则，需参考注释3 (Indicates a special rule, see Note 3).
 */
const segregationMatrix = {
    "1_excl_1.4S (1类爆炸品,不含1.4S)": {
        "1_excl_1.4S (1类爆炸品,不含1.4S)": "See Note 3",
        "2.1 易燃气体": "X",
        "2.2, 2.3 非易燃无毒/毒性气体": "—",
        "3 易燃液体": "X",
        "4.1 易燃固体": "X",
        "4.2 自燃物质": "X",
        "4.3 遇水释放易燃气体的物质": "X",
        "5.1 氧化剂": "X",
        "5.2 有机过氧化物": "X",
        "8 腐蚀性物质": "X",
        "9_battery (锂电池-注4)": "X"
    },
    "2.1 易燃气体": {
        "1_excl_1.4S (1类爆炸品,不含1.4S)": "X",
        "2.1 易燃气体": "—",
        "2.2, 2.3 非易燃无毒/毒性气体": "—",
        "3 易燃液体": "—",
        "4.1 易燃固体": "—",
        "4.2 自燃物质": "X",
        "4.3 遇水释放易燃气体的物质": "—",
        "5.1 氧化剂": "X",
        "5.2 有机过氧化物": "—",
        "8 腐蚀性物质": "—",
        "9_battery (锂电池-注4)": "—"
    },
    "2.2, 2.3 非易燃无毒/毒性气体": {
        "1_excl_1.4S (1类爆炸品,不含1.4S)": "X",
        "2.1 易燃气体": "—",
        "2.2, 2.3 非易燃无毒/毒性气体": "—",
        "3 易燃液体": "—",
        "4.1 易燃固体": "—",
        "4.2 自燃物质": "—",
        "4.3 遇水释放易燃气体的物质": "—",
        "5.1 氧化剂": "—",
        "5.2 有机过氧化物": "—",
        "8 腐蚀性物质": "—",
        "9_battery (锂电池-注4)": "—"
    },
    "3 易燃液体": {
        "1_excl_1.4S (1类爆炸品,不含1.4S)": "X",
        "2.1 易燃气体": "—",
        "2.2, 2.3 非易燃无毒/毒性气体": "—",
        "3 易燃液体": "—",
        "4.1 易燃固体": "—",
        "4.2 自燃物质": "—",
        "4.3 遇水释放易燃气体的物质": "—",
        "5.1 氧化剂": "X",
        "5.2 有机过氧化物": "—",
        "8 腐蚀性物质": "—",
        "9_battery (锂电池-注4)": "X"
    },
    "4.1 易燃固体": {
        "1_excl_1.4S (1类爆炸品,不含1.4S)": "X",
        "2.1 易燃气体": "—",
        "2.2, 2.3 非易燃无毒/毒性气体": "—",
        "3 易燃液体": "—",
        "4.1 易燃固体": "—",
        "4.2 自燃物质": "—",
        "4.3 遇水释放易燃气体的物质": "—",
        "5.1 氧化剂": "X",
        "5.2 有机过氧化物": "—",
        "8 腐蚀性物质": "X",
        "9_battery (锂电池-注4)": "X"
    },
    "4.2 自燃物质": {
        "1_excl_1.4S (1类爆炸品,不含1.4S)": "X",
        "2.1 易燃气体": "X",
        "2.2, 2.3 非易燃无毒/毒性气体": "—",
        "3 易燃液体": "—",
        "4.1 易燃固体": "—",
        "4.2 自燃物质": "—",
        "4.3 遇水释放易燃气体的物质": "—",
        "5.1 氧化剂": "X",
        "5.2 有机过氧化物": "—",
        "8 腐蚀性物质": "—",
        "9_battery (锂电池-注4)": "X"
    },
    "4.3 遇水释放易燃气体的物质": {
        "1_excl_1.4S (1类爆炸品,不含1.4S)": "X",
        "2.1 易燃气体": "—",
        "2.2, 2.3 非易燃无毒/毒性气体": "—",
        "3 易燃液体": "—",
        "4.1 易燃固体": "—",
        "4.2 自燃物质": "—",
        "4.3 遇水释放易燃气体的物质": "—",
        "5.1 氧化剂": "X",
        "5.2 有机过氧化物": "—",
        "8 腐蚀性物质": "—",
        "9_battery (锂电池-注4)": "X"
    },
    "5.1 氧化剂": {
        "1_excl_1.4S (1类爆炸品,不含1.4S)": "X",
        "2.1 易燃气体": "X",
        "2.2, 2.3 非易燃无毒/毒性气体": "—",
        "3 易燃液体": "X",
        "4.1 易燃固体": "X",
        "4.2 自燃物质": "X",
        "4.3 遇水释放易燃气体的物质": "X",
        "5.1 氧化剂": "—",
        "5.2 有机过氧化物": "—",
        "8 腐蚀性物质": "X",
        "9_battery (锂电池-注4)": "X"
    },
    "5.2 有机过氧化物": {
        "1_excl_1.4S (1类爆炸品,不含1.4S)": "X",
        "2.1 易燃气体": "—",
        "2.2, 2.3 非易燃无毒/毒性气体": "—",
        "3 易燃液体": "—",
        "4.1 易燃固体": "—",
        "4.2 自燃物质": "—",
        "4.3 遇水释放易燃气体的物质": "—",
        "5.1 氧化剂": "—",
        "5.2 有机过氧化物": "—",
        "8 腐蚀性物质": "—",
        "9_battery (锂电池-注4)": "—"
    },
    "8 腐蚀性物质": {
        "1_excl_1.4S (1类爆炸品,不含1.4S)": "X",
        "2.1 易燃气体": "—",
        "2.2, 2.3 非易燃无毒/毒性气体": "—",
        "3 易燃液体": "—",
        "4.1 易燃固体": "X",
        "4.2 自燃物质": "—",
        "4.3 遇水释放易燃气体的物质": "—",
        "5.1 氧化剂": "X",
        "5.2 有机过氧化物": "—",
        "8 腐蚀性物质": "—",
        "9_battery (锂电池-注4)": "X"
    },
    "9_battery (锂电池-注4)": {
        "1_excl_1.4S (1类爆炸品,不含1.4S)": "X",
        "2.1 易燃气体": "—",
        "2.2, 2.3 非易燃无毒/毒性气体": "—",
        "3 易燃液体": "X",
        "4.1 易燃固体": "X",
        "4.2 自燃物质": "X",
        "4.3 遇水释放易燃气体的物质": "X",
        "5.1 氧化剂": "X",
        "5.2 有机过氧化物": "—",
        "8 腐蚀性物质": "X",
        "9_battery (锂电池-注4)": "—"
    }
};

/**
 * 隔离规则相关注释 (Segregation Notes)
 */
const segregationNotes = {
    "note1": {
        "zh": "横行和纵行交叉点为“×”，则表示所对应的两种危险品的性质互相抵触。若在行与列的交叉点注有“—”，则表示装有这些类/项的危险品包装件无需隔离。",
        "en": "An “X” at the intersection of a row and a column indicates that packages containing these classes/divisions of dangerous goods must be segregated. A “—” at the intersection of a row and a column indicates that packages containing these classes/divisions of dangerous goods do not require segregation."
    },
    "note2": {
        "zh": "第1.4S项、第6、7、9类（除锂电池外，见注4）危险品不在表内，因为不需要与其他危险品隔离。",
        "en": "Division 1.4S, and Classes 6, 7 and 9 (other than lithium batteries, see Note 4) are not included in the Table as they do not require segregation from other classes of dangerous goods."
    },
    "note3": {
        "zh": "1.4B项的爆炸品不得与 1.4S 项以外的其他爆炸品装在一起。当1.4B 爆炸品与1.4S以外的其它爆炸品装载在同一飞机时，必须分别装载在不同的集装器内，装机时集装器之间必须由其他货物分隔开并保持最小距离2米。如不使用集装器装载，1.4B必须与其他的爆炸品装载在不同且不相邻的位置之间用其他货物隔离最小2米的距离。",
        "en": "Explosives of Division 1.4B must not be loaded with other explosives except for Division 1.4S. When loaded on the same aircraft with explosives other than Division 1.4S, Division 1.4B explosives must be loaded into separate unit load devices and when stowed aboard the aircraft, the unit load devices must be separated by other cargo with a minimum separation distance of 2 m. When not loaded in a unit load device Division 1.4B and other explosives must be loaded into different, nonadjacent loading positions and separated by other cargo with a minimum separation distance of 2 m."
    },
    "note4": {
        "zh": "指第9类危险品中符合包装说明 PI965 Section IA 或IB 的锂离子电池包装件和符合包装说明 PI968 IA或IB 的锂金属电池包装件。",
        "en": "Packages and overpacks containing lithium ion batteries prepared in accordance with Section IA or Section IB of PI 965 and packages and overpacks containing lithium metal batteries prepared in accordance with Section IA or Section IB of PI 968."
    }
};

module.exports = {
    segregationMatrix,
    segregationNotes
};