const fs = require('fs');
const content = fs.readFileSync('C:/Users/admin/.gemini/antigravity-ide/brain/7d7f2db8-fb73-4d7f-893d-f20b85f4ea4c/.system_generated/steps/1166/content.md', 'utf8');

const t = content.match(/<title>(.*?)<\/title>/);
console.log('Title:', t ? t[1] : 'null');

const lines = content.split('\n');
for (const line of lines) {
  if (line.includes('shortDescription') || line.includes('"title":"') || line.includes('videoDetails')) {
    console.log(line.slice(0, 300));
  }
}
