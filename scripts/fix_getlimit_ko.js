const fs = require('fs');
const path = require('path');

const mainPath = path.resolve(__dirname, '../app/out/main/index.js');
let content = fs.readFileSync(mainPath, 'utf8');

// Sửa getLimit thành ko
const oldGetLimit = 'getLimit(e){if(e?.providerId==="muse"||e?.provider==="Muse AI"||e?.payload?.model==="muse-video"||(e?.provider&&e.provider.toLowerCase().includes("muse")))return 6;return Math.max(1,Math.floor(this.resolveLimit(e)||1))}';
const newGetLimit = 'getLimit(e){if(e?.providerId==="muse"||e?.provider==="Muse AI"||e?.payload?.model==="muse-video"||(e?.provider&&e.provider.toLowerCase().includes("muse")))return ko;return Math.max(1,Math.floor(this.resolveLimit(e)||1))}';

if (content.includes(oldGetLimit)) {
  content = content.replace(oldGetLimit, newGetLimit);
  console.log('✅ Đã sửa getLimit(e) thành return ko (500)!');
} else {
  content = content.replace(/getLimit\(e\)\{if\(e\?\.providerId==="muse"[^}]+return\s*\d+;/, 'getLimit(e){if(e?.providerId==="muse"||e?.provider==="Muse AI"||e?.payload?.model==="muse-video"||(e?.provider&&e.provider.toLowerCase().includes("muse")))return ko;');
  console.log('✅ Đã sửa regex getLimit(e) thành return ko (500)!');
}

fs.writeFileSync(mainPath, content, 'utf8');
