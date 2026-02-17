/**
 * Generate runtime .js files from .ts page entries for miniprogram-ci.
 *
 * Why:
 * - app.json can reference pages whose script source is `index.ts`.
 * - miniprogram-ci validates page scripts as `.js` files during upload/preview.
 * - DevTools handles TS plugin compilation, but CI needs physical `.js` entries.
 *
 * This script transpiles only page-level TS files that are listed in app.json
 * and missing a sibling .js file.
 */

const fs = require('fs');
const path = require('path');
const ts = require('typescript');

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function collectPageBases(appJson) {
  const bases = [];

  for (const page of appJson.pages || []) {
    bases.push(page);
  }

  for (const sub of appJson.subPackages || []) {
    const root = sub.root || '';
    for (const page of sub.pages || []) {
      bases.push(path.posix.join(root, page));
    }
  }

  return bases;
}

function transpileTsToJs(tsPath, jsPath) {
  const source = fs.readFileSync(tsPath, 'utf8');
  const result = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2018,
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
      allowJs: true,
      removeComments: false,
      sourceMap: false
    },
    fileName: path.basename(tsPath)
  });

  const banner = '// Auto-generated for CI upload from .ts by scripts/prepare-ci-js.js\n';
  fs.writeFileSync(jsPath, banner + result.outputText, 'utf8');
}

function main() {
  const miniRoot = path.resolve(__dirname, '..');
  const appJsonPath = path.join(miniRoot, 'app.json');

  if (!fs.existsSync(appJsonPath)) {
    console.error(`app.json not found: ${appJsonPath}`);
    process.exit(1);
  }

  const appJson = readJSON(appJsonPath);
  const pages = collectPageBases(appJson);

  let generated = 0;
  let skipped = 0;
  const missing = [];

  for (const pageBase of pages) {
    const absBase = path.join(miniRoot, pageBase.replace(/\//g, path.sep));
    const jsPath = `${absBase}.js`;
    const tsPath = `${absBase}.ts`;

    if (fs.existsSync(jsPath)) {
      skipped += 1;
      continue;
    }

    if (!fs.existsSync(tsPath)) {
      missing.push(pageBase);
      continue;
    }

    transpileTsToJs(tsPath, jsPath);
    generated += 1;
    console.log(`generated: ${path.relative(miniRoot, jsPath)}`);
  }

  if (missing.length > 0) {
    console.error('Missing script files for app.json pages:');
    for (const p of missing) {
      console.error(`  - ${p} (.js/.ts not found)`);
    }
    process.exit(1);
  }

  console.log(`prepare-ci-js done. generated=${generated}, skipped=${skipped}`);
}

main();

