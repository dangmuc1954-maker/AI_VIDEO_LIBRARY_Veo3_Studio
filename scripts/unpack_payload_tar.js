const cp = require('child_process');
const fs = require('fs');
const path = require('path');

const targetDir = path.resolve(__dirname, '../scratch/yesterday_source_unpacked');
const zipFile = path.resolve(__dirname, '../scratch/yesterday_AppPayload.zip');

if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

console.log('Unpacking with tar from:', zipFile);
console.log('To:', targetDir);

cp.execFileSync('tar.exe', ['-xf', zipFile, '-C', targetDir], { stdio: 'inherit' });
console.log('Unpacked successfully!');
console.log('Root directory contents:', fs.readdirSync(targetDir));
if (fs.existsSync(path.join(targetDir, 'resources/app'))) {
  console.log('resources/app contents:', fs.readdirSync(path.join(targetDir, 'resources/app')));
}
