/**
 * WeChat Mini Program CI uploader.
 *
 * Required env:
 * - WX_APPID
 * - WX_PRIVATE_KEY_PATH
 *
 * Optional env:
 * - WX_ROBOT (default: 1)
 * - CI_MODE (upload | preview, default: upload)
 * - CI_VERSION
 * - CI_DESC
 */

const fs = require('fs');
const path = require('path');

function getEnv(name, fallback) {
  const value = process.env[name];
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  return value;
}

function requireEnv(name) {
  const value = getEnv(name, '');
  if (!value) {
    console.error(`❌ Missing required env: ${name}`);
    process.exit(1);
  }
  return value;
}

function buildDefaultVersion() {
  const runNumber = getEnv('GITHUB_RUN_NUMBER', '0');
  const shortSha = getEnv('GITHUB_SHA', '').slice(0, 7) || 'local';
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${y}${m}${d}.${runNumber}.${shortSha}.${hh}${mm}`;
}

async function main() {
  let ci;
  try {
    ci = require('miniprogram-ci');
  } catch (error) {
    console.error('❌ Cannot load `miniprogram-ci`.');
    console.error('   Run: cd miniprogram && npm install --no-save miniprogram-ci');
    console.error(error.message);
    process.exit(1);
  }

  const appid = requireEnv('WX_APPID');
  const privateKeyPath = requireEnv('WX_PRIVATE_KEY_PATH');
  const mode = String(getEnv('CI_MODE', 'upload')).toLowerCase();
  const robot = Number(getEnv('WX_ROBOT', '1'));
  const version = getEnv('CI_VERSION', buildDefaultVersion());
  const desc = getEnv('CI_DESC', `GitHub Actions ${version}`);

  if (!fs.existsSync(privateKeyPath)) {
    console.error(`❌ Private key not found: ${privateKeyPath}`);
    process.exit(1);
  }

  if (!Number.isInteger(robot) || robot < 1 || robot > 30) {
    console.error(`❌ Invalid WX_ROBOT: ${robot}. Expected integer 1-30.`);
    process.exit(1);
  }

  const projectPath = path.resolve(__dirname, '..');
  const projectConfigPath = path.resolve(projectPath, '..', 'project.config.json');

  if (!fs.existsSync(projectConfigPath)) {
    console.error(`❌ project.config.json not found: ${projectConfigPath}`);
    process.exit(1);
  }

  const project = new ci.Project({
    appid,
    type: 'miniProgram',
    projectPath,
    privateKeyPath,
    ignores: ['node_modules/**/*']
  });

  const setting = {
    es6: true,
    enhance: true,
    postcss: true,
    useCompilerPlugins: ['typescript'],
    swc: true,
    compileWorklet: true,
    minified: true,
    minifyWXSS: true,
    minifyWXML: true,
    minifyJS: true,
    autoPrefixWXSS: true,
    disableUseStrict: false,
    uploadWithSourceMap: true,
    ignoreUploadUnusedFiles: true
  };

  console.log(`📦 mode=${mode}, version=${version}, robot=${robot}`);

  if (mode === 'upload') {
    const result = await ci.upload({
      project,
      version,
      desc,
      robot,
      setting,
      onProgressUpdate: (progress) => {
        if (progress && typeof progress === 'object') {
          const msg = [
            `status=${progress.status || ''}`,
            `progress=${progress.progress || ''}`
          ].join(' ');
          console.log(`⏳ ${msg}`.trim());
        }
      }
    });
    console.log('✅ Upload success');
    if (result && result.subPackageInfo) {
      console.log('ℹ️ subPackageInfo:', JSON.stringify(result.subPackageInfo));
    }
    return;
  }

  if (mode === 'preview') {
    const qrcodeOutputDest = path.resolve(projectPath, 'preview-qrcode.jpg');
    const result = await ci.preview({
      project,
      desc,
      robot,
      setting,
      qrcodeFormat: 'image',
      qrcodeOutputDest,
      pagePath: 'pages/home/index',
      searchQuery: ''
    });
    console.log('✅ Preview success');
    console.log(`🧾 QR code: ${qrcodeOutputDest}`);
    if (result && result.subPackageInfo) {
      console.log('ℹ️ subPackageInfo:', JSON.stringify(result.subPackageInfo));
    }
    return;
  }

  console.error(`❌ Unsupported CI_MODE: ${mode}. Use upload or preview.`);
  process.exit(1);
}

main().catch((error) => {
  console.error('❌ WeChat CI task failed');
  if (error && error.stack) {
    console.error(error.stack);
  } else {
    console.error(error);
  }
  process.exit(1);
});
