const fs = require('fs');
const path = require('path');

const progDir = 'C:\\Users\\admin\\AppData\\Local\\Programs\\aiforge-studio';
console.log('--- Program files ---');
try {
  console.log(fs.readdirSync(progDir));
  const resDir = path.join(progDir, 'resources');
  if (fs.existsSync(resDir)) {
    console.log('resources:', fs.readdirSync(resDir));
  }
} catch (e) {
  console.error(e.message);
}

const appDataRoaming = 'C:\\Users\\admin\\AppData\\Roaming';
console.log('--- Checking Roaming for AIForge ---');
try {
  const dirs = fs.readdirSync(appDataRoaming).filter(d => d.toLowerCase().includes('forge') || d.toLowerCase().includes('veo') || d.toLowerCase().includes('video'));
  console.log('Matching roaming dirs:', dirs);
  for (const d of dirs) {
    const full = path.join(appDataRoaming, d);
    try {
      console.log(`Content of ${d}:`, fs.readdirSync(full));
    } catch(e) {}
  }
} catch (e) {
  console.error(e.message);
}

const appDataLocal = 'C:\\Users\\admin\\AppData\\Local';
console.log('--- Checking Local for AIForge ---');
try {
  const dirs = fs.readdirSync(appDataLocal).filter(d => d.toLowerCase().includes('forge') || d.toLowerCase().includes('veo'));
  console.log('Matching local dirs:', dirs);
} catch (e) {
  console.error(e.message);
}
