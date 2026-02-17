/**
 * Validate preloadRule package size in app.json.
 *
 * Defaults:
 * - soft limit: 1800KB (safety margin)
 * - hard limit: 2048KB (WeChat hard limit)
 * - fail on soft limit: true
 *
 * Overrides:
 * - env: PRELOAD_SOFT_LIMIT_KB, PRELOAD_HARD_LIMIT_KB, PRELOAD_FAIL_ON_SOFT
 * - args: --soft-kb=1800 --hard-kb=2048 --fail-on-soft=true
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const APP_JSON_PATH = path.join(PROJECT_ROOT, 'app.json');

function getArgValue(flag) {
  const hit = process.argv.slice(2).find((arg) => arg.startsWith(`${flag}=`));
  if (!hit) {
    return null;
  }
  return hit.slice(flag.length + 1);
}

function parseNumber(value, fallback) {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : fallback;
}

function parseBoolean(value, fallback) {
  if (typeof value !== 'string') {
    return fallback;
  }
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true' || normalized === '1' || normalized === 'yes') {
    return true;
  }
  if (normalized === 'false' || normalized === '0' || normalized === 'no') {
    return false;
  }
  return fallback;
}

function normalizeRef(input) {
  return String(input || '')
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '');
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`❌ 无法读取或解析 JSON: ${filePath}`);
    console.error(error.message);
    process.exit(1);
  }
}

function getDirSize(targetPath) {
  if (!fs.existsSync(targetPath)) {
    return 0;
  }

  const stat = fs.statSync(targetPath);
  if (!stat.isDirectory()) {
    return stat.size;
  }

  let total = 0;
  const entries = fs.readdirSync(targetPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(targetPath, entry.name);
    if (entry.isDirectory()) {
      total += getDirSize(fullPath);
      continue;
    }
    if (entry.isFile()) {
      total += fs.statSync(fullPath).size;
    }
  }
  return total;
}

function formatKB(bytes) {
  return (bytes / 1024).toFixed(2);
}

const softLimitKB = parseNumber(
  getArgValue('--soft-kb') || process.env.PRELOAD_SOFT_LIMIT_KB,
  1800
);
const hardLimitKB = parseNumber(
  getArgValue('--hard-kb') || process.env.PRELOAD_HARD_LIMIT_KB,
  2048
);
const failOnSoft = parseBoolean(
  getArgValue('--fail-on-soft') || process.env.PRELOAD_FAIL_ON_SOFT,
  true
);

if (hardLimitKB <= softLimitKB) {
  console.error(
    `❌ 阈值配置错误：hard(${hardLimitKB}KB) 必须大于 soft(${softLimitKB}KB)`
  );
  process.exit(1);
}

const appConfig = readJson(APP_JSON_PATH);
const subPackages = appConfig.subPackages || appConfig.subpackages || [];
const preloadRule = appConfig.preloadRule || {};

if (!Array.isArray(subPackages) || subPackages.length === 0) {
  console.error('❌ app.json 未找到 subPackages 配置，无法执行预加载体积检查。');
  process.exit(1);
}

const aliasToRoot = new Map();
const rootToSize = new Map();
const missingRoots = [];

for (const pkg of subPackages) {
  const root = normalizeRef(pkg.root);
  if (!root) {
    continue;
  }

  const rootDir = path.join(PROJECT_ROOT, root);
  if (!fs.existsSync(rootDir)) {
    missingRoots.push(root);
    continue;
  }

  if (!rootToSize.has(root)) {
    rootToSize.set(root, getDirSize(rootDir));
  }

  aliasToRoot.set(root, root);
  if (pkg.name) {
    aliasToRoot.set(pkg.name, root);
  }
}

if (missingRoots.length > 0) {
  console.error('❌ 以下 subPackage root 目录不存在：');
  for (const root of missingRoots) {
    console.error(`   - ${root}`);
  }
  process.exit(1);
}

const rows = [];
const unknownRefs = [];
const softLimitBytes = softLimitKB * 1024;
const hardLimitBytes = hardLimitKB * 1024;

for (const [page, rule] of Object.entries(preloadRule)) {
  const packages = Array.isArray(rule && rule.packages) ? rule.packages : [];
  let totalBytes = 0;
  const details = [];

  for (const pkgRefRaw of packages) {
    if (pkgRefRaw === '__APP__') {
      details.push({ ref: pkgRefRaw, root: '__APP__', bytes: 0, note: 'SKIPPED' });
      continue;
    }

    const pkgRef = normalizeRef(pkgRefRaw);
    const root = aliasToRoot.get(pkgRef);

    if (!root) {
      unknownRefs.push({ page, pkgRef: pkgRefRaw });
      details.push({ ref: pkgRefRaw, root: 'UNKNOWN', bytes: 0, note: 'UNKNOWN' });
      continue;
    }

    const bytes = rootToSize.get(root) || 0;
    totalBytes += bytes;
    details.push({ ref: pkgRefRaw, root, bytes, note: '' });
  }

  let status = 'PASS';
  if (totalBytes > hardLimitBytes) {
    status = 'HARD_FAIL';
  } else if (totalBytes > softLimitBytes) {
    status = failOnSoft ? 'SOFT_FAIL' : 'SOFT_WARN';
  }

  rows.push({
    page,
    totalBytes,
    totalKB: formatKB(totalBytes),
    status,
    details
  });
}

rows.sort((a, b) => b.totalBytes - a.totalBytes);

const pageWidth = Math.max(
  20,
  ...rows.map((row) => row.page.length),
  'Page'.length
);

console.log('\n📦 preloadRule 体积检查');
console.log(
  `   soft=${softLimitKB}KB, hard=${hardLimitKB}KB, failOnSoft=${failOnSoft}\n`
);
console.log(`${'Page'.padEnd(pageWidth)}  ${'TotalKB'.padStart(9)}  Status`);
console.log(`${'-'.repeat(pageWidth)}  ${'-'.repeat(9)}  ----------`);
for (const row of rows) {
  console.log(`${row.page.padEnd(pageWidth)}  ${row.totalKB.padStart(9)}  ${row.status}`);
}

if (unknownRefs.length > 0) {
  console.log('\n⚠️ 检测到无法解析的 preloadRule packages 引用：');
  for (const item of unknownRefs) {
    console.log(`   - ${item.page}: ${item.pkgRef}`);
  }
}

const hardFailRows = rows.filter((row) => row.status === 'HARD_FAIL');
const softFailRows = rows.filter((row) => row.status === 'SOFT_FAIL');

if (hardFailRows.length > 0 || softFailRows.length > 0 || unknownRefs.length > 0) {
  console.log('\n❌ preloadRule 体积检查未通过。');

  for (const row of [...hardFailRows, ...softFailRows]) {
    const top = row.details
      .filter((item) => item.bytes > 0)
      .sort((a, b) => b.bytes - a.bytes)
      .slice(0, 3)
      .map((item) => `${item.ref}:${formatKB(item.bytes)}KB`)
      .join(', ');
    console.log(`   - ${row.page}: ${row.totalKB}KB (${row.status})`);
    if (top) {
      console.log(`     top packages: ${top}`);
    }
  }

  process.exit(1);
}

if (rows.length === 0) {
  console.log('ℹ️ app.json 未配置 preloadRule。');
} else {
  console.log('\n✅ preloadRule 体积检查通过。');
}

