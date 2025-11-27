// 危险品包装件与其他特种货物的隔离（文字版）
// 数据基于《危险品操作速查指南 2025.01》中“危险品包装件和其他特种货物的隔离”表及图示说明整理。

const specialCargoSegregation = [
  {
    id: 'live-animals-vs-radioactive',
    cargo_zh: '活体动物',
    cargo_en: 'Live Animals',
    other_zh: 'II级和III级放射性物质',
    other_en: 'Radioactive Material – Categories II and III',
    symbol: '↔↔',
    meaning_zh: '不得接近放置，需与 II/III 级放射性物质物理隔离（符号 ↔↔）。'
  },
  {
    id: 'live-animals-vs-dry-ice',
    cargo_zh: '活体动物',
    cargo_en: 'Live Animals',
    other_zh: '干冰和低温液体',
    other_en: 'Dry Ice and Cryogenic Liquids',
    symbol: '▲▲',
    meaning_zh: '需要保持最小隔离距离，避免低温或窒息风险（符号 ▲▲）。'
  },
  {
    id: 'hatching-eggs-vs-radioactive',
    cargo_zh: '孵化蛋',
    cargo_en: 'Hatching Eggs',
    other_zh: 'II级和III级放射性物质',
    other_en: 'Radioactive Material – Categories II and III',
    symbol: '↔↔',
    meaning_zh: '不得接近放置，需与 II/III 级放射性物质物理隔离（符号 ↔↔）。'
  },
  {
    id: 'hatching-eggs-vs-dry-ice',
    cargo_zh: '孵化蛋',
    cargo_en: 'Hatching Eggs',
    other_zh: '干冰和低温液体',
    other_en: 'Dry Ice and Cryogenic Liquids',
    symbol: '▲▲',
    meaning_zh: '需要保持最小隔离距离，避免低温或窒息风险（符号 ▲▲）。'
  },
  {
    id: 'undeveloped-film-vs-radioactive',
    cargo_zh: '未冲洗底片',
    cargo_en: 'Undeveloped Film',
    other_zh: 'II级和III级放射性物质',
    other_en: 'Radioactive Material – Categories II and III',
    symbol: '↔↔',
    meaning_zh: '不得接近放置，以防放射线影响底片品质（符号 ↔↔）。'
  }
];

// 图示符号说明
const specialCargoSymbols = {
  arrow: {
    key: 'arrow',
    symbol: '↔↔',
    description_zh: '↔↔：表示两类货物必须物理隔离（不得接近放置）。',
    description_en: '↔↔: Identifies cargo to be physically separated.'
  },
  triangle: {
    key: 'triangle',
    symbol: '▲▲',
    description_zh: '▲▲：表示需要保持最小隔离距离（有最小隔离距离）。',
    description_en: '▲▲: Indicates cargo that needs minimum separation distances.'
  }
};

module.exports = {
  specialCargoSegregation,
  specialCargoSymbols
};
