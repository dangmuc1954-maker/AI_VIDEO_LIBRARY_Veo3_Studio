const fs = require('fs');
const path = require('path');

const mainPath = path.join(__dirname, '../app/out/main/index.js');
const code = fs.readFileSync(mainPath, 'utf8');

// Find userData or assets dir
const regex = /userData/g;
let m;
while ((m = regex.exec(code)) !== null) {
  console.log('Snippet:', code.slice(Math.max(0, m.index - 80), Math.min(code.length, m.index + 120)));
}

// Check AppData folders
const appData = process.env.APPDATA;
const candidates = fs.readdirSync(appData).filter(n => n.toLowerCase().includes('forge') || n.toLowerCase().includes('video') || n.toLowerCase().includes('veo') || n.toLowerCase().includes('electron'));
console.log('\nMatching folders in APPDATA:', candidates);

candidates.forEach(folder => {
  const dir = path.join(appData, folder);
  try {
    const list = fs.readdirSync(dir);
    console.log(`Contents of ${folder}:`, list.slice(0, 10));
    // Check if there is an assets or files folder
    const checkSub = (sub) => {
      const p = path.join(dir, sub);
      if (fs.existsSync(p)) {
        console.log(`  Subdir ${sub} found with items:`, fs.readdirSync(p).slice(0, 10));
      }
    };
    checkSub('assets');
    checkSub('files');
    checkSub('videos');
  } catch (e) {}
});
