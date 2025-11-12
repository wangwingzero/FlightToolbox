/**
 * 生成定义模板工具
 * 用途：为新的航空术语定义生成带有唯一UUID的模板
 * 使用方法：
 *   node generate-definition-template.js       // 生成1个模板
 *   node generate-definition-template.js 10    // 生成10个模板
 */

// 生成UUID v4
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// 生成单个定义模板
function generateDefinitionTemplate() {
  return {
    "id": generateUUID(),
    "chinese_name": "",
    "english_name": "",
    "definition": "",
    "source": ""
  };
}

// 主函数
function main() {
  // 从命令行参数获取数量，默认为1
  const count = parseInt(process.argv[2]) || 1;

  if (count < 1 || count > 100) {
    console.error('❌ 错误：数量必须在 1-100 之间');
    process.exit(1);
  }

  console.log('📝 生成定义模板\n');
  console.log(`生成数量: ${count}\n`);
  console.log('请复制以下内容到数据文件中：\n');
  console.log('---开始---\n');

  // 生成模板数组
  const templates = [];
  for (let i = 0; i < count; i++) {
    templates.push(generateDefinitionTemplate());
  }

  // 输出为格式化的JSON
  console.log(JSON.stringify(templates, null, 2));

  console.log('\n---结束---\n');
  console.log('💡 使用提示：');
  console.log('1. 复制上面的JSON内容');
  console.log('2. 粘贴到目标数据文件的数组中');
  console.log('3. 填写 chinese_name, english_name, definition, source 字段');
  console.log('4. 运行 node check-duplicate-ids.js 检查ID唯一性\n');
}

main();
