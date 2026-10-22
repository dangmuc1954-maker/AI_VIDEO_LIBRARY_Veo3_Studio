const fs = require('fs');
const JSZip = require('jszip');

async function listZip() {
  const data = fs.readFileSync('C:/Users/admin/Downloads/AI_VIDEO_LIBRARY_Setup_v3.0.exe (3).zip');
  const zip = await JSZip.loadAsync(data);
  console.log('Total files in zip:', Object.keys(zip.files).length);
  const fileNames = Object.keys(zip.files);
  console.log('Sample files:', fileNames.slice(0, 30));
  
  // Find interesting files (VideoStudio, editor, transition, etc.)
  const transitionFiles = fileNames.filter(f => f.toLowerCase().includes('transition') || f.toLowerCase().includes('editor') || f.toLowerCase().includes('videostudio') || f.endsWith('index.js'));
  console.log('Relevant files in zip:', transitionFiles);
}

listZip().catch(console.error);
