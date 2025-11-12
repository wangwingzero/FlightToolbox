// 分析每个area使用的components
var checkItems = require('./checkitems.js');

var areas = {};
var allComponents = new Set();

checkItems.checkItems.forEach(function(item) {
  if (!areas[item.areaId]) {
    areas[item.areaId] = new Set();
  }
  areas[item.areaId].add(item.componentId);
  allComponents.add(item.componentId);
});

console.log('========== Area Component Analysis ==========\n');
for (var i = 1; i <= 24; i++) {
  if (areas[i]) {
    console.log('Area ' + i + ': ' + areas[i].size + ' unique components');
    console.log('  Components: ' + Array.from(areas[i]).slice(0, 5).join(', ') + '...');
  }
}

console.log('\n========== Summary ==========');
console.log('Total unique components: ' + allComponents.size);
console.log('Total check items: ' + checkItems.checkItems.length);
