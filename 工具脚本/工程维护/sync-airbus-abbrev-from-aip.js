const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const aipPath = path.join(root, 'miniprogram', 'packageB', 'abbreviationAIP.js');
const airbusPath = path.join(root, 'miniprogram', 'packageB', 'abbreviationsAirbus.js');
const boeingPath = path.join(root, 'miniprogram', 'packageB', 'abbreviationBoeing.js');
const comacPath = path.join(root, 'miniprogram', 'packageB', 'abbreviationCOMAC.js');
const jeppPath = path.join(root, 'miniprogram', 'packageB', 'abbreviationJeppesen.js');

function loadModule(p) {
  delete require.cache[require.resolve(p)];
  // eslint-disable-next-line global-require, import/no-dynamic-require
  return require(p);
}

function normalizeEnglish(str) {
  return String(str)
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function buildAipMap(aipList) {
  const map = new Map();
  for (const item of aipList) {
    if (!item || !item.abbreviation || !item.english_full) continue;
    if (!map.has(item.abbreviation)) {
      map.set(item.abbreviation, item);
    }
  }
  return map;
}

function syncOne(label, targetPath, aipMap, options = {}) {
  const { enforceDh = true } = options;
  const list = loadModule(targetPath);

  if (!Array.isArray(list)) {
    throw new Error(`${label} file must export an array: ${targetPath}`);
  }

  let changed = 0;
  const changedItems = [];

  for (const entry of list) {
    if (!entry || !entry.abbreviation || !entry.english_full) continue;
    const aipEntry = aipMap.get(entry.abbreviation);
    if (!aipEntry || !aipEntry.english_full) continue;

    const normTarget = normalizeEnglish(entry.english_full);
    const normAip = normalizeEnglish(aipEntry.english_full);
    if (normTarget !== normAip) {
      // 英文全称不完全一致，跳过，避免适用性问题
      continue;
    }

    if (!aipEntry.chinese_translation) continue;
    if (entry.chinese_translation === aipEntry.chinese_translation) continue;

    changed++;
    changedItems.push({
      abbreviation: entry.abbreviation,
      from: entry.chinese_translation,
      to: aipEntry.chinese_translation,
    });

    entry.chinese_translation = aipEntry.chinese_translation;
  }

  if (enforceDh) {
    for (const entry of list) {
      if (entry && entry.abbreviation === 'DH') {
        if (entry.chinese_translation !== '决断高') {
          changed++;
          changedItems.push({
            abbreviation: 'DH',
            from: entry.chinese_translation,
            to: '决断高',
          });
          entry.chinese_translation = '决断高';
        }
      }
    }
  }

  const backupDir = path.join(root, '.trash_abbrev_backup');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupPath = path.join(backupDir, `${path.basename(targetPath)}.bak`);
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(targetPath, backupPath);
    console.log(`Backup created for ${label}:`, backupPath);
  }

  const output = `module.exports = ${JSON.stringify(list, null, 2)};\n`;
  fs.writeFileSync(targetPath, output, 'utf8');

  console.log(`[${label}] Updated ${changed} entries.`);
  if (changedItems.length) {
    console.log(`[${label}] Changed abbreviations:`);
    for (const item of changedItems) {
      console.log(
        `[${label}] ${item.abbreviation}: "${item.from}" -> "${item.to}"`
      );
    }
  } else {
    console.log(`[${label}] No changes were necessary.`);
  }
}

function main() {
  const aipList = loadModule(aipPath);

  if (!Array.isArray(aipList)) {
    throw new Error('AIP file must export an array.');
  }

  const aipMap = buildAipMap(aipList);

  const targets = [
    { label: 'Airbus', path: airbusPath, enforceDh: true },
    { label: 'Boeing', path: boeingPath, enforceDh: true },
    { label: 'COMAC', path: comacPath, enforceDh: true },
    { label: 'Jeppesen', path: jeppPath, enforceDh: true },
  ];

  for (const target of targets) {
    try {
      syncOne(target.label, target.path, aipMap, { enforceDh: target.enforceDh });
    } catch (err) {
      console.error(`Failed to sync ${target.label}:`, err.message);
    }
  }
}

main();
