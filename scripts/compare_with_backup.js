const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../app/out');
const backupDir = path.join(__dirname, '../app/out_backup_v1');

console.log('=== SO SÁNH APP/OUT VỚI APP/OUT_BACKUP_V1 ===');

function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      getAllFiles(full, fileList);
    } else {
      fileList.push(full);
    }
  }
  return fileList;
}

const outFiles = getAllFiles(outDir);
for (const f of outFiles) {
  const rel = path.relative(outDir, f);
  const bFile = path.join(backupDir, rel);
  if (fs.existsSync(bFile)) {
    const c1 = fs.readFileSync(f);
    const c2 = fs.readFileSync(bFile);
    if (!c1.equals(c2)) {
      console.log('CHANGED FILE:', rel, 'current size:', c1.length, 'backup size:', c2.length);
    }
  } else {
    console.log('NEW FILE in out:', rel);
  }
}
