const fs = require('fs');
const path = require('path');

console.log('======================================================================');
console.log('🌟 ĐẠI PHẪU THUẬT LỘT XÁC TOÀN BỘ GIAO DIỆN SANG CYBER GALAXY NEON GLASS');
console.log('======================================================================');

const baseDir = path.resolve(__dirname, '..');
const cssPath = path.join(baseDir, 'app/out/renderer/assets/index-CkYUhlHV.css');

if (!fs.existsSync(cssPath)) {
  console.error('File not found:', cssPath);
  process.exit(1);
}

let css = fs.readFileSync(cssPath, 'utf8');

// 1. REVISE ROOT CSS COLOR VARIABLES TO THE CONCEPT 1 & 2 PALETTE
const replacements = [
  ['--color-bg-primary:#06040c;', '--color-bg-primary:#070a14;'],
  ['--color-bg-secondary:#1c1835;', '--color-bg-secondary:#0d1322;'],
  ['--color-bg-tertiary:#252040;', '--color-bg-tertiary:#131c31;'],
  ['--color-bg-hover:#2a2448;', '--color-bg-hover:#192542;'],
  ['--color-bg-active:#342c55;', '--color-bg-active:#1e2f54;'],
  ['--color-bg-sidebar:#06040c;', '--color-bg-sidebar:#0a0e1c;'],
  ['--color-bg-inspector:#1c1835;', '--color-bg-inspector:#0d1322;'],
  ['--color-bg-input:#130f24;', '--color-bg-input:#0b101e;'],
  ['--color-bg-table-row-hover:#25204080;', '--color-bg-table-row-hover:rgba(6,182,212,0.12);'],
  ['--color-border-primary:#2a2445;', '--color-border-primary:rgba(6,182,212,0.22);'],
  ['--color-border-secondary:#3d3560;', '--color-border-secondary:rgba(6,182,212,0.45);'],
  ['--color-accent:#7c3aed;', '--color-accent:#06b6d4;'],
  ['--color-accent-hover:#8b5cf6;', '--color-accent-hover:#22d3ee;'],
  ['--color-text-primary:#f1eff8;', '--color-text-primary:#ffffff;'],
  ['--color-text-accent:#c4b5fd;', '--color-text-accent:#38bdf8;'],
  ['--color-text-secondary:#b8b2cc;', '--color-text-secondary:#cbd5e1;'],
  ['--color-text-muted:#8c87ab;', '--color-text-muted:#94a3b8;']
];

for (const [oldVar, newVar] of replacements) {
  if (css.includes(oldVar)) {
    css = css.replace(oldVar, newVar);
    console.log(`  ✓ Đổi biến màu: ${oldVar.split(':')[0]} sang Cyber Galaxy!`);
  }
}

// 2. Also replace any hardcoded #1c1835 or #06040c occurrences in CSS rules
css = css.replace(/#1c1835/g, '#0d1322');
css = css.replace(/#252040/g, '#131c31');
css = css.replace(/#2a2448/g, '#192542');
css = css.replace(/#342c55/g, '#1e2f54');
css = css.replace(/#130f24/g, '#0b101e');
css = css.replace(/#2a2445/g, 'rgba(6,182,212,0.22)');
css = css.replace(/#3d3560/g, 'rgba(6,182,212,0.45)');

fs.writeFileSync(cssPath, css, 'utf8');
console.log('  ✓ Đã cập nhật toàn bộ color tokens trong index-CkYUhlHV.css');

// 3. Make sure index.html links cyber_galaxy_theme.css
const htmlPath = path.join(baseDir, 'app/out/renderer/index.html');
let html = fs.readFileSync(htmlPath, 'utf8');
if (!html.includes('cyber_galaxy_theme.css')) {
  html = html.replace(
    '<link rel="stylesheet" crossorigin href="./assets/index-CkYUhlHV.css">',
    '<link rel="stylesheet" crossorigin href="./assets/index-CkYUhlHV.css">\n    <link rel="stylesheet" href="./assets/cyber_galaxy_theme.css">'
  );
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log('  ✓ Đã liên kết cyber_galaxy_theme.css vào index.html');
}

console.log('======================================================================');
console.log('🎉 LỘT XÁC THÀNH CÔNG RỰC RỠ SANG HỆ MÀU CONCEPT 1 & 2!');
console.log('======================================================================');
