const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const f6 = 'C:\\Users\\admin\\AppData\\Roaming\\AI_VIDEO_LIBRARY_DATA\\assets\\490933d3-2f25-4cc1-92a7-cd8146974e1d.jpg';
const f2 = 'C:\\Users\\admin\\AppData\\Roaming\\AI_VIDEO_LIBRARY_DATA\\assets\\239a0696-0a2c-4e36-a762-03cd4e8ffec3.jpg';

// Let's inspect the Fs class in app/out/main/index.js
// We can search for the iP function definition in app/out/main/index.js
const mainCode = fs.readFileSync('app/out/main/index.js', 'utf8');

const p = mainCode.indexOf('function iP(');
console.log('function iP at:', p);
if (p !== -1) {
  console.log(mainCode.substring(p, p + 500));
}
