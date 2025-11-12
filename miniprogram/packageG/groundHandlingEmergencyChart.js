/**
 * 地面危险品事故/事故征候应急响应处置表
 * Dangerous Goods Emergency Response Chart for Ground Handling
 *
 * 数据来源：《危险品操作速查指南 2025.01》第 21-22 页
 * Source: Quick Reference Guide Handling of Dangerous Goods 2025.01, Pages 21-22
 *
 * 此文件为地面操作人员（如货运、装卸人员）在处理危险品事故时提供快速的应急响应指南。
 * This file provides a quick emergency response guide for ground handling staff (e.g., cargo, loading personnel)
 * when dealing with dangerous goods incidents.
 */

const groundHandlingEmergencyChart = [
    {
        "code": "RCX",
        "class": "1.3C",
        "category_zh": "爆炸品 (仅限货机)",
        "category_en": "Explosives (acceptable on Cargo Aircraft only)",
        "hazard_description_zh": "起火或较小爆炸危险/或较小喷射危险",
        "hazard_description_en": "Fire and Minor blast hazard and/or minor propulsive hazard",
        "immediate_action_zh": "通知消防部门灭火",
        "immediate_action_en": "Notify Fire Department Guard against fire"
    },
    {
        "code": "RGX",
        "class": "1.3G",
        "category_zh": "爆炸品 (仅限货机)",
        "category_en": "Explosives (acceptable on Cargo Aircraft only)",
        "hazard_description_zh": "起火或较小爆炸危险/或较小喷射危险",
        "hazard_description_en": "Fire and Minor blast hazard and/or minor propulsive hazard",
        "immediate_action_zh": "通知消防部门灭火",
        "immediate_action_en": "Notify Fire Department Guard against fire"
    },
    {
        "code": "RXB",
        "class": "1.4B",
        "category_zh": "爆炸品 (仅限货机)",
        "category_en": "Explosives (acceptable on Cargo Aircraft only)",
        "hazard_description_zh": "起火, 但无其他显著危险",
        "hazard_description_en": "Fire, but no other significant hazard",
        "immediate_action_zh": "通知消防部门灭火",
        "immediate_action_en": "Notify Fire Department Guard against fire"
    },
    {
        "code": "RXC",
        "class": "1.4C",
        "category_zh": "爆炸品 (仅限货机)",
        "category_en": "Explosives (acceptable on Cargo Aircraft only)",
        "hazard_description_zh": "起火, 但无其他显著危险",
        "hazard_description_en": "Fire, but no other significant hazard",
        "immediate_action_zh": "通知消防部门灭火",
        "immediate_action_en": "Notify Fire Department Guard against fire"
    },
    {
        "code": "RXD",
        "class": "1.4D",
        "category_zh": "爆炸品 (仅限货机)",
        "category_en": "Explosives (acceptable on Cargo Aircraft only)",
        "hazard_description_zh": "起火, 但无其他显著危险",
        "hazard_description_en": "Fire, but no other significant hazard",
        "immediate_action_zh": "通知消防部门灭火",
        "immediate_action_en": "Notify Fire Department Guard against fire"
    },
    {
        "code": "RXE",
        "class": "1.4E",
        "category_zh": "爆炸品 (仅限货机)",
        "category_en": "Explosives (acceptable on Cargo Aircraft only)",
        "hazard_description_zh": "起火, 但无其他显著危险",
        "hazard_description_en": "Fire, but no other significant hazard",
        "immediate_action_zh": "通知消防部门灭火",
        "immediate_action_en": "Notify Fire Department Guard against fire"
    },
    {
        "code": "RXG",
        "class": "1.4G",
        "category_zh": "爆炸品 (仅限货机)",
        "category_en": "Explosives (acceptable on Cargo Aircraft only)",
        "hazard_description_zh": "起火, 但无其他显著危险",
        "hazard_description_en": "Fire, but no other significant hazard",
        "immediate_action_zh": "通知消防部门灭火",
        "immediate_action_en": "Notify Fire Department Guard against fire"
    },
    {
        "code": "RXS",
        "class": "1.4S",
        "category_zh": "爆炸品 (较小危险品)",
        "category_en": "Explosives (Safety)",
        "hazard_description_zh": "较小起火危险",
        "hazard_description_en": "Small fire hazard",
        "immediate_action_zh": "通知消防部门灭火",
        "immediate_action_en": "Notify Fire Department Guard against fire"
    },
    {
        "code": "RFG",
        "class": "2.1",
        "category_zh": "易燃气体",
        "category_en": "Flammable Gas",
        "hazard_description_zh": "泄露会导致燃烧",
        "hazard_description_en": "Ignites when leaking",
        "immediate_action_zh": "通知消防部门灭火",
        "immediate_action_en": "Notify Fire Department Guard against fire"
    },
    {
        "code": "RNG",
        "class": "2.2",
        "category_zh": "非易燃无毒气体",
        "category_en": "Non-Flammable Gas",
        "hazard_description_zh": "高压钢瓶可能爆炸",
        "hazard_description_en": "High pressure cylinder bursting",
        "immediate_action_zh": "通知消防部门灭火",
        "immediate_action_en": "Notify Fire Department Guard against fire"
    },
    {
        "code": "RCL",
        "class": "2.2",
        "category_zh": "深冷液化气体",
        "category_en": "Cryogenic Liquid",
        "hazard_description_zh": "低温冷冻",
        "hazard_description_en": "Subcooling",
        "immediate_action_zh": "疏散货物使区域通风。至少保持25米的距离。",
        "immediate_action_en": "Evacuate goods ventilate area. Keep away minimum 25m."
    },
    {
        "code": "RPG",
        "class": "2.3",
        "category_zh": "毒性气体 (仅限货机)",
        "category_en": "Toxic Gas (acceptable on Cargo Aircraft only)",
        "hazard_description_zh": "高压钢瓶会爆炸并吸入毒气",
        "hazard_description_en": "High pressure cylinder bursting and toxic inhalation",
        "immediate_action_zh": "疏散货物使区域通风。至少保持25米的距离。",
        "immediate_action_en": "Evacuate goods ventilate area. Keep away minimum 25m."
    },
    {
        "code": "RFL",
        "class": "3",
        "category_zh": "易燃液体",
        "category_en": "Flammable Liquid",
        "hazard_description_zh": "放出易燃性气体",
        "hazard_description_en": "Gives off flammable vapour",
        "immediate_action_zh": "通知消防部门灭火",
        "immediate_action_en": "Notify Fire Department Guard against fire"
    },
    {
        "code": "RFS",
        "class": "4.1",
        "category_zh": "易燃固体",
        "category_en": "Flammable Solid",
        "hazard_description_zh": "易燃, 助燃",
        "hazard_description_en": "Combustible, contributes to fire",
        "immediate_action_zh": "通知消防部门灭火。任何情况下均不可用水灭火。",
        "immediate_action_en": "Notify Fire Department Guard against fire. Do NOT use water under any circumstances."
    },
    {
        "code": "RSC",
        "class": "4.2",
        "category_zh": "自燃物质",
        "category_en": "Spontaneously Combustible",
        "hazard_description_zh": "暴露在空气中可燃烧",
        "hazard_description_en": "Ignites in contact with air",
        "immediate_action_zh": "通知消防部门灭火。任何情况下均不可用水灭火。",
        "immediate_action_en": "Notify Fire Department Guard against fire. Do NOT use water under any circumstances."
    },
    {
        "code": "RFW",
        "class": "4.3",
        "category_zh": "遇水释放易燃气体的物质",
        "category_en": "Dangerous when wet",
        "hazard_description_zh": "遇水接触可燃烧",
        "hazard_description_en": "Ignites in contact with water",
        "immediate_action_zh": "通知消防部门灭火。任何情况下均不可用水灭火。",
        "immediate_action_en": "Notify Fire Department Guard against fire. Do NOT use water under any circumstances."
    },
    {
        "code": "ROX",
        "class": "5.1",
        "category_zh": "氧化剂",
        "category_en": "Oxidizer",
        "hazard_description_zh": "接触可助燃",
        "hazard_description_en": "Ignites combustibles on contact",
        "immediate_action_zh": "通知消防部门灭火。不可用水灭火 (部分航材不适用)。",
        "immediate_action_en": "Notify Fire Department Guard against fire. Do Not use water (Some COMAT not subject to this regulation)."
    },
    {
        "code": "ROP",
        "class": "5.2",
        "category_zh": "有机过氧化物",
        "category_en": "Organic Peroxide",
        "hazard_description_zh": "与其他物质接触有剧烈反应",
        "hazard_description_en": "Reacts violently with other substances",
        "immediate_action_zh": "通知消防部门灭火。不可用水灭火 (部分航材不适用)。",
        "immediate_action_en": "Notify Fire Department Guard against fire. Do Not use water (Some COMAT not subject to this regulation)."
    },
    {
        "code": "RPB",
        "class": "6.1",
        "category_zh": "毒性物质",
        "category_en": "Toxic Substance",
        "hazard_description_zh": "当吞服、吸入或通过皮肤吸收后, 会损害身体健康",
        "hazard_description_en": "Harmful if swallowed, inhaled or in contact with skin",
        "immediate_action_zh": "放在隔离区域。需要专业人士指导。",
        "immediate_action_en": "Isolate area. Obtain qualified assistance."
    },
    {
        "code": "RIS",
        "class": "6.2",
        "category_zh": "感染性物质",
        "category_en": "Infectious Substance",
        "hazard_description_zh": "会使人或动物染上疾病",
        "hazard_description_en": "Causes disease in Humans and Animals",
        "immediate_action_zh": "放在隔离区域。需要专业人士指导。",
        "immediate_action_en": "Isolate area. Obtain qualified assistance."
    },
    {
        "code": "RRW",
        "class": "7 Cat I",
        "category_zh": "放射性物质-白",
        "category_en": "Radioactive - White",
        "hazard_description_zh": "放射性危害, 损害健康",
        "hazard_description_en": "Radiation hazards and harmful to health",
        "immediate_action_zh": "不可触摸。至少保持25米的距离。",
        "immediate_action_en": "Do Not touch. Keep away minimum 25m."
    },
    {
        "code": "RRY",
        "class": "7 Cat II/III",
        "category_zh": "放射性物质-黄",
        "category_en": "Radioactive - Yellow",
        "hazard_description_zh": "放射性危害, 损害健康",
        "hazard_description_en": "Radiation hazards and harmful to health",
        "immediate_action_zh": "不可触摸。至少保持25米的距离。",
        "immediate_action_en": "Do Not touch. Keep away minimum 25m."
    },
    {
        "code": "RCM",
        "class": "8",
        "category_zh": "腐蚀性物质",
        "category_en": "Corrosive",
        "hazard_description_zh": "损害皮肤和金属",
        "hazard_description_en": "Hazardous to skin and metal",
        "immediate_action_zh": "通知消防部门灭火。避免皮肤接触。",
        "immediate_action_en": "Notify Fire Department Guard against fire. Avoid contact with skin."
    },
    {
        "code": "RSB",
        "class": "9",
        "category_zh": "聚合物颗粒",
        "category_en": "Polymeric Beads",
        "hazard_description_zh": "散发出少量易燃气体",
        "hazard_description_en": "Evolves small quantities of flammable gas",
        "immediate_action_zh": "避免皮肤接触",
        "immediate_action_en": "Avoid contact with skin"
    },
    {
        "code": "MAG",
        "class": "9",
        "category_zh": "磁性物质",
        "category_en": "Magnetized Material",
        "hazard_description_zh": "影响导航系统",
        "hazard_description_en": "Affects navigation system",
        "immediate_action_zh": "避免皮肤接触",
        "immediate_action_en": "Avoid contact with skin"
    },
    {
        "code": "ICE",
        "class": "9",
        "category_zh": "干冰",
        "category_en": "Carbon dioxide solid (Dry Ice)",
        "hazard_description_zh": "造成低温或窒息",
        "hazard_description_en": "Causes subcooling/suffocation",
        "immediate_action_zh": "无需应急处理",
        "immediate_action_en": "No immediate action required"
    },
    {
        "code": "RMD",
        "class": "9",
        "category_zh": "杂项危险物质和物品, 包括环境危害物质",
        "category_en": "Miscellaneous Dangerous Substances and Articles, including Environmentally Hazardous Substances",
        "hazard_description_zh": "其他类别危险品的性质所未涵盖的",
        "hazard_description_en": "Hazards not covered by other classes",
        "immediate_action_zh": "无需应急处理",
        "immediate_action_en": "No immediate action required"
    }
];

module.exports = {
    groundHandlingEmergencyChart
};