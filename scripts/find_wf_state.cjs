const fs = require('fs');
const path = require('path');

const appData = 'C:/Users/admin/AppData/Roaming';
const dirs = ['AI VIDEO LIBRARY', 'AI_VIDEO_LIBRARY_DATA', 'aiforge-studio'];

dirs.forEach(d => {
  const p = path.join(appData, d);
  if (!fs.existsSync(p)) return;
  fs.readdirSync(p).filter(f => f.includes('workflow') || f.endsWith('.json')).forEach(f => {
    const full = path.join(p, f);
    try {
      const stats = fs.statSync(full);
      if (stats.size > 500 && stats.size < 5000000) {
        console.log(full, 'size:', stats.size, 'time:', stats.mtime.toISOString());
      }
    } catch (_) {}
  });
});
