// ú6*þG„placeholderub‡ö

const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'miniprogram');

// ûÖ pn
const mappingFile = path.join(__dirname, 'area-component-mapping.json');
const mapping = JSON.parse(fs.readFileSync(mappingFile, 'utf8'));

console.log('========================================');
console.log('úPlaceholderub‡ö');
console.log('========================================\n');

mapping.newPackages.forEach(pkg => {
  const placeholderPath = path.join(baseDir, pkg.name, 'pages', 'placeholder');

  // úîU
  fs.mkdirSync(placeholderPath, { recursive: true });

  // index.js
  const jsContent = `// Placeholder page for ${pkg.name}
Page({
  data: {},
  onLoad: function() {
    console.log('${pkg.name} placeholder loaded');
  }
});
`;
  fs.writeFileSync(path.join(placeholderPath, 'index.js'), jsContent, 'utf8');

  // index.json
  const jsonContent = `{
  "navigationBarTitleText": " }-",
  "usingComponents": {}
}
`;
  fs.writeFileSync(path.join(placeholderPath, 'index.json'), jsonContent, 'utf8');

  // index.wxml
  const wxmlContent = `<view class="container">
  <text>Loading...</text>
</view>
`;
  fs.writeFileSync(path.join(placeholderPath, 'index.wxml'), wxmlContent, 'utf8');

  // index.wxss
  const wxssContent = `.container {
  padding: 20px;
  text-align: center;
}
`;
  fs.writeFileSync(path.join(placeholderPath, 'index.wxss'), wxssContent, 'utf8');

  console.log(` úplaceholder: ${pkg.name}`);
});

console.log('\n========================================');
console.log(' PlaceholderubúŒ!');
console.log('========================================\n');
