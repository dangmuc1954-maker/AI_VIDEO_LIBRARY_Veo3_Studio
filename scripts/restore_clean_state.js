const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sourceFile = path.resolve('dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app/out/main/index.js');
let content = fs.readFileSync(sourceFile, 'utf8');

// 1. Revert startUrl from https://labs.google/fx back to https://labs.google/fx/vi/tools/flow
content = content.replace(
  '{id:"banana",name:"Banana",startUrl:"https://labs.google/fx",supportedJobTypes:["Image Generation","Upscale","Face Restore"]}',
  '{id:"banana",name:"Banana",startUrl:"https://labs.google/fx/vi/tools/flow",supportedJobTypes:["Image Generation","Upscale","Face Restore"]}'
);
content = content.replace(
  '{id:"veo3",name:"Veo3",startUrl:"https://labs.google/fx",supportedJobTypes:["Video Generation","Image to Video","Reference Assets"]}',
  '{id:"veo3",name:"Veo3",startUrl:"https://labs.google/fx/vi/tools/flow",supportedJobTypes:["Video Generation","Image to Video","Reference Assets"]}'
);

const destFile = path.resolve('app/out/main/index.js');
fs.writeFileSync(destFile, content, 'utf8');
console.log('[OK] Restored app/out/main/index.js from clean Customer Edition with original hub links.');

// Syntax check
execSync(`node --check "${destFile}"`);
console.log('✅ Syntax VALID for app/out/main/index.js!');
