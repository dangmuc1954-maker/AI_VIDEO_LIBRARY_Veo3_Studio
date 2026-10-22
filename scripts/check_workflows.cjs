const fs = require('fs');
const path = require('path');

const baseDirs = [
  'C:\\Users\\admin\\AppData\\Roaming\\aiforge-studio',
  'C:\\Users\\admin\\AppData\\Roaming\\AI_VIDEO_LIBRARY_DATA',
  'C:\\Users\\admin\\AppData\\Roaming\\AI VIDEO LIBRARY'
];

for (const base of baseDirs) {
  console.log('====================================');
  console.log('Checking:', base);
  if (!fs.existsSync(base)) {
    console.log('Not found');
    continue;
  }

  const storeDir = path.join(base, 'store-workflows-v1');
  if (fs.existsSync(storeDir)) {
    console.log('[store-workflows-v1]:', fs.readdirSync(storeDir));
    const items = fs.readdirSync(storeDir);
    for (const item of items) {
      const p = path.join(storeDir, item);
      const stat = fs.statSync(p);
      console.log(`  - ${item} (${stat.isDirectory() ? 'dir' : stat.size + ' bytes'})`);
      if (stat.isDirectory()) {
        console.log(`    subfiles:`, fs.readdirSync(p));
      } else if (item.endsWith('.json')) {
        try {
          const content = fs.readFileSync(p, 'utf-8');
          console.log(`    preview:`, content.substring(0, 300));
        } catch(e) {}
      }
    }
  } else {
    console.log('[store-workflows-v1]: does not exist');
  }

  const wf2Dir = path.join(base, 'workflows-v2');
  if (fs.existsSync(wf2Dir)) {
    console.log('[workflows-v2]:', fs.readdirSync(wf2Dir));
    const items = fs.readdirSync(wf2Dir);
    for (const item of items) {
      const p = path.join(wf2Dir, item);
      const stat = fs.statSync(p);
      console.log(`  - ${item} (${stat.isDirectory() ? 'dir' : stat.size + ' bytes'})`);
      if (stat.isDirectory()) {
        console.log(`    subfiles:`, fs.readdirSync(p));
      } else if (item.endsWith('.json')) {
        try {
          const content = fs.readFileSync(p, 'utf-8');
          console.log(`    preview:`, content.substring(0, 300));
        } catch(e) {}
      }
    }
  } else {
    console.log('[workflows-v2]: does not exist');
  }

  const organizer = path.join(base, 'workflow-organizer.json');
  if (fs.existsSync(organizer)) {
    console.log('[workflow-organizer.json]:', fs.readFileSync(organizer, 'utf-8'));
  }
}
