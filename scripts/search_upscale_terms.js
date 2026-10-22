const fs = require('fs');
const path = require('path');

function searchInDir(dir, query, results = []) {
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        searchInDir(fullPath, query, results);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.html') || entry.name.endsWith('.json') || entry.name.endsWith('.cjs'))) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes(query)) {
          results.push({ file: fullPath, matches: 1 });
        }
      } catch (e) {}
    }
  }
  return results;
}

console.log('--- Searching in AI VIDEO LIBRARY installed: ---');
console.log('Nâng cấp:', searchInDir('C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/out', 'Nâng cấp'));
console.log('2 coin/ảnh:', searchInDir('C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/out', '2 coin'));
console.log('coin:', searchInDir('C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/out', 'coin'));

console.log('--- Searching in extracted_original_20260912: ---');
console.log('Nâng cấp:', searchInDir('d:/dự án antigravity/AIForge_Veo3_Studio/extracted_original_20260912', 'Nâng cấp'));
console.log('2 coin:', searchInDir('d:/dự án antigravity/AIForge_Veo3_Studio/extracted_original_20260912', '2 coin'));
console.log('coin:', searchInDir('d:/dự án antigravity/AIForge_Veo3_Studio/extracted_original_20260912', 'coin'));

console.log('--- Searching in local app/out: ---');
console.log('Nâng cấp:', searchInDir('d:/dự án antigravity/AIForge_Veo3_Studio/app/out', 'Nâng cấp'));
console.log('2 coin:', searchInDir('d:/dự án antigravity/AIForge_Veo3_Studio/app/out', '2 coin'));
console.log('coin:', searchInDir('d:/dự án antigravity/AIForge_Veo3_Studio/app/out', 'coin'));
