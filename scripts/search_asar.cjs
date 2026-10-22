const fs = require('fs');

const asarPath = 'C:\\Users\\admin\\AppData\\Local\\Programs\\aiforge-studio\\resources\\app.asar';
const fd = fs.openSync(asarPath, 'r');
const buf = Buffer.alloc(10 * 1024 * 1024); // read first 10MB or search in chunks

// Let's do chunk search
const searchTerms = [
  'Gia Công Đa Ngành',
  'Người Que Trending',
  'Gối Chặn Đầu',
  'store-workflows',
  'aitoolforge.shop'
];

let chunkIndex = 0;
const chunkSize = 4 * 1024 * 1024;
const chunk = Buffer.alloc(chunkSize);
let bytesRead = 0;
let offset = 0;

console.log('Searching in app.asar...');
while ((bytesRead = fs.readSync(fd, chunk, 0, chunkSize, offset)) > 0) {
  const str = chunk.toString('utf8', 0, bytesRead);
  for (const term of searchTerms) {
    const idx = str.indexOf(term);
    if (idx !== -1) {
      console.log(`Found "${term}" at offset ${offset + idx}`);
      const snippet = str.substring(Math.max(0, idx - 200), Math.min(str.length, idx + 400));
      console.log('Snippet:', snippet);
      console.log('-----------------------------------');
    }
  }
  offset += bytesRead - 1000; // overlap
  if (offset > 71692524) break;
}
fs.closeSync(fd);
console.log('Done search.');
