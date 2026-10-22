const fs = require('fs');
const path = require('path');

// Simulate __dirname as inside out/main:
const fakeDirname = 'C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/out/main';
const resourcesPath = 'C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources';

const possibleTransformers = [
  path.join(fakeDirname, "../node_modules/@xenova/transformers/src/transformers.js"),
  path.join(fakeDirname, "../../node_modules/@xenova/transformers/src/transformers.js"),
  path.join(resourcesPath || "", "app/node_modules/@xenova/transformers/src/transformers.js"),
  "C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/node_modules/@xenova/transformers/src/transformers.js",
  "D:/dự án antigravity/AIForge_Veo3_Studio/app/node_modules/@xenova/transformers/src/transformers.js"
];

console.log('Transformers paths:');
possibleTransformers.forEach(p => console.log(' -', p, 'exists:', fs.existsSync(p)));

const possibleModelDirs = [
  path.join(fakeDirname, "../models"),
  path.join(fakeDirname, "../../models"),
  path.join(process.env.APPDATA || "", "AI_VIDEO_LIBRARY_DATA/models"),
  path.join(resourcesPath || "", "app/models"),
  "C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/models",
  "D:/dự án antigravity/AIForge_Veo3_Studio/app/models"
];

console.log('\nModel dirs:');
possibleModelDirs.forEach(p => console.log(' -', p, 'exists:', fs.existsSync(p)));
