const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== DIAGNOSTIC INSPECTION ===');

// 1. Check all candidate app locations
const locations = [
  { name: 'Workspace app', dir: path.join(__dirname, '../app') },
  { name: 'Workspace extracted_original', dir: path.join(__dirname, '../extracted_original') },
  { name: 'Dist Customer Edition', dir: path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app') },
  { name: 'Dist Khach Hang v3.0', dir: path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Khach_Hang_v3.0/resources/app') },
  { name: 'Installed User App', dir: 'C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app' }
];

locations.forEach(loc => {
  console.log(`\nLocation: [${loc.name}] (${loc.dir})`);
  if (!fs.existsSync(loc.dir)) {
    console.log('  ❌ Directory does not exist');
    return;
  }
  const mainPath = path.join(loc.dir, 'out/main/index.js');
  const vsPath = path.join(loc.dir, 'out/renderer/assets/VideoStudio-BZY_1pM8.js');
  
  if (fs.existsSync(mainPath)) {
    const mainCode = fs.readFileSync(mainPath, 'utf8');
    const hasTtsHook = mainCode.includes('if(n.payload?.tts?.enabled && c.assets?.length>0)');
    const hasViLang = mainCode.includes('language_code:e.languageCode||e.language||"vi"');
    const hasSttCloud = mainCode.includes('https://vercelserver-eight.vercel.app/api/transcribe');
    console.log(`  Main JS (${(fs.statSync(mainPath).size/1024).toFixed(1)} KB):`);
    console.log(`    - hasTtsHook: ${hasTtsHook}`);
    console.log(`    - hasViLang: ${hasViLang}`);
    console.log(`    - hasSttCloud: ${hasSttCloud}`);
  } else {
    console.log('  ❌ main/index.js missing');
  }

  if (fs.existsSync(vsPath)) {
    const vsCode = fs.readFileSync(vsPath, 'utf8');
    const hasTtsToggle = vsCode.includes('tts:s?.tts||');
    const hasElevenBar = vsCode.includes('Lồng tiếng ElevenLabs');
    const hasVoiceList = vsCode.includes('Rachel') && vsCode.includes('Mai Linh');
    console.log(`  VideoStudio JS (${(fs.statSync(vsPath).size/1024).toFixed(1)} KB):`);
    console.log(`    - hasTtsToggle: ${hasTtsToggle}`);
    console.log(`    - hasElevenBar: ${hasElevenBar}`);
    console.log(`    - hasVoiceList: ${hasVoiceList}`);
  } else {
    console.log('  ❌ VideoStudio-BZY_1pM8.js missing');
  }
});

// 2. Check running processes
try {
  const psOut = execSync('powershell "Get-Process | Where-Object { $_.Path -like \'*AI*\' -or $_.Path -like \'*electron*\' } | Select-Object Id, ProcessName, Path | Format-Table -AutoSize"', { encoding: 'utf8' });
  console.log('\nRunning relevant processes:');
  console.log(psOut);
} catch (e) {
  console.log('Error getting processes:', e.message);
}
