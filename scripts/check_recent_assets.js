const fs = require('fs');
const path = require('path');

const folders = ['AI VIDEO LIBRARY', 'ai-video-library', 'AI_VIDEO_LIBRARY_DATA'];
const appData = process.env.APPDATA;

folders.forEach(f => {
  const p = path.join(appData, f, 'assets');
  if (fs.existsSync(p)) {
    const files = fs.readdirSync(p).map(name => {
      const full = path.join(p, name);
      const stat = fs.statSync(full);
      return { name, mtime: stat.mtime, size: stat.size, full };
    });
    files.sort((a, b) => b.mtime - a.mtime);
    console.log(`\n=== Recent files in ${f}/assets: ===`);
    files.slice(0, 5).forEach(item => {
      console.log(`  ${item.name} | ${item.mtime.toISOString()} | ${(item.size / 1024 / 1024).toFixed(2)} MB`);
    });
  }
});
