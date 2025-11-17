const fs = require('fs');
const path = require('path');

function load(modulePath) {
  const p = path.resolve(modulePath);
  delete require.cache[p];
  return require(p);
}

function arrToSet(arr) {
  return new Set((arr || []).map(String));
}

function sameSet(a, b) {
  const A = arrToSet(a), B = arrToSet(b);
  if (A.size !== B.size) return false;
  for (const v of A) if (!B.has(v)) return false;
  return true;
}

function flattenPerformanceData(data) {
  const items = [];
  if (!data || !data.sections) return items;

  for (const sec of data.sections) {
    items.push({ id: sec.id, type: 'section', code: sec.code, title_zh: sec.title_zh, title_en: sec.title_en, page: sec.page, keywords: sec.keywords, regulations: sec.regulations });
    for (const sub of sec.subsections || []) {
      items.push({ id: sub.id, type: 'subsection', code: sub.code, title_zh: sub.title_zh, title_en: sub.title_en, page: sub.page, keywords: sub.keywords, regulations: sub.regulations });
      for (const t of sub.topics || []) {
        items.push({ id: t.id, type: 'topic', code: t.code, title_zh: t.title_zh, title_en: t.title_en, page: t.page, keywords: t.keywords, regulations: t.regulations });
        for (const st of t.subtopics || []) {
          items.push({ id: st.id, type: 'subtopic', code: st.code, title_zh: st.title_zh, title_en: st.title_en, page: st.page, keywords: st.keywords, regulations: st.regulations });
        }
      }
    }
  }
  for (const app of data.appendices || []) {
    items.push({ id: app.id, type: 'appendix', code: app.code, title_zh: app.title_zh, title_en: app.title_en, page: app.page, keywords: app.keywords, regulations: app.regulations });
  }
  return items;
}

function uniqueIds(items) {
  const seen = new Set();
  const dups = new Set();
  for (const it of items) {
    if (seen.has(it.id)) dups.add(it.id);
    seen.add(it.id);
  }
  return { seen, dups: Array.from(dups) };
}

function main() {
  const root = path.resolve(__dirname, '..', '..');
  const dataPath = path.join(root, 'miniprogram', 'packagePerformance', 'data', 'performance-data.js');
  const indexPath = path.join(root, 'miniprogram', 'packagePerformance', 'data', 'performance-index.js');

  const data = load(dataPath);
  const index = load(indexPath);
  const flat = flattenPerformanceData(data);

  const errors = [];

  // 1) 附录数量/字段
  const flatApp = flat.filter(x => x.type === 'appendix');
  const idxApp = (index || []).filter(x => x.type === 'appendix');
  if (flatApp.length !== 8) errors.push(`appendices in data = ${flatApp.length}, expected 8`);
  if (idxApp.length !== 8) errors.push(`appendices in index = ${idxApp.length}, expected 8`);
  const idxById = new Map(index.map(x => [x.id, x]));
  for (const a of flatApp) {
    const b = idxById.get(a.id);
    if (!b) { errors.push(`appendix missing in index: ${a.id}`); continue; }
    if (a.code !== b.code) errors.push(`appendix code mismatch ${a.id}: ${a.code} != ${b.code}`);
    if (a.title_zh !== b.title_zh) errors.push(`appendix zh title mismatch ${a.id}`);
    if (a.title_en !== b.title_en) errors.push(`appendix en title mismatch ${a.id}`);
    if (a.page !== b.page) errors.push(`appendix page mismatch ${a.id}: ${a.page} != ${b.page}`);
  }

  // 2) code 不能为空
  for (const it of flat) {
    if (!it.code || String(it.code).trim() === '') {
      errors.push(`empty code: ${it.id}`);
    }
  }

  // 3) keywords 不能为空（仅对 topic/subtopic/appendix 校验）
  const needKeywords = new Set(['topic', 'subtopic', 'appendix']);
  for (const it of flat) {
    if (needKeywords.has(it.type)) {
      if (!Array.isArray(it.keywords) || it.keywords.length === 0) {
        errors.push(`empty keywords in data: ${it.id}`);
      }
    }
  }
  for (const it of index) {
    if (!Array.isArray(it.keywords) || it.keywords.length === 0) {
      errors.push(`empty keywords in index: ${it.id}`);
    }
  }

  // 4) 数据→索引字段镜像
  for (const it of flat) {
    const ix = idxById.get(it.id);
    if (!ix) { errors.push(`missing in index: ${it.id}`); continue; }
    if (String(it.code) !== String(ix.code)) errors.push(`code mismatch ${it.id}: ${it.code} != ${ix.code}`);
    if (it.title_zh !== ix.title_zh) errors.push(`title_zh mismatch ${it.id}`);
    if (it.title_en !== ix.title_en) errors.push(`title_en mismatch ${it.id}`);
    if (Number(it.page) !== Number(ix.page)) errors.push(`page mismatch ${it.id}: ${it.page} != ${ix.page}`);
    if (it.regulations && !sameSet(it.regulations, ix.regulations || [])) {
      errors.push(`regulations mismatch ${it.id}: data=[${(it.regulations||[]).join(', ')}], index=[${(ix.regulations||[]).join(', ')}]`);
    }
  }

  // 5) ID 唯一性
  const du1 = uniqueIds(flat).dups;
  const du2 = uniqueIds(index).dups;
  if (du1.length) errors.push(`duplicate ids in data: ${du1.join(', ')}`);
  if (du2.length) errors.push(`duplicate ids in index: ${du2.join(', ')}`);

  // 6) 关键条目专项检查
  const b33 = { data: flat.find(x => x.id === 'B3_3'), index: idxById.get('B3_3') };
  if (!b33.data || b33.data.title_zh !== '复飞速度') errors.push(`B3_3 title_zh in data not '复飞速度'`);
  if (!b33.index || b33.index.title_zh !== '复飞速度') errors.push(`B3_3 title_zh in index not '复飞速度'`);

  const b22 = idxById.get('B2_2');
  const needB22 = ['CS 25.107', 'CS 25.109', 'FAR 25.107', 'FAR 25.109'];
  if (!b22 || !sameSet(b22.regulations || [], needB22)) {
    errors.push(`B2_2 regulations in index not complete: expected ${needB22.join(', ')}`);
  }

  // 7) 页码非递减（按数据文件结构顺序）
  for (const sec of data.sections || []) {
    let prevSec = sec.page;
    for (const sub of sec.subsections || []) {
      if (sub.page < prevSec) errors.push(`page order: ${sub.id} (${sub.page}) < section ${sec.id} (${prevSec})`);
      let prevTopic = sub.page;
      for (const t of sub.topics || []) {
        if (t.page < prevTopic) errors.push(`page order: ${t.id} (${t.page}) < ${sub.id} (${prevTopic})`);
        let prevSubtopic = t.page;
        for (const st of t.subtopics || []) {
          if (st.page < prevSubtopic) errors.push(`page order: ${st.id} (${st.page}) < ${t.id} (${prevSubtopic})`);
          prevSubtopic = st.page;
        }
        prevTopic = t.page;
      }
      prevSec = sub.page;
    }
  }

  if (errors.length === 0) {
    console.log('✔ All performance data checks passed.');
    console.log(`Sections: ${data.sections?.length || 0}, Appendices: ${data.appendices?.length || 0}, Index entries: ${index.length}`);
    process.exit(0);
  } else {
    console.error('✖ Found issues:');
    for (const e of errors) console.error('- ' + e);
    process.exit(1);
  }
}

if (require.main === module) {
  try { main(); } catch (err) { console.error(err); process.exit(2); }
}
