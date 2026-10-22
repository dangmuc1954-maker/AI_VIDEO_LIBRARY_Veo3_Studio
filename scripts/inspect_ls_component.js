const fs = require('fs');

const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

let pos = content.indexOf('function ls(');
if (pos !== -1) {
  console.log('function ls at', pos);
  console.log(content.slice(pos, pos + 800));
} else {
  console.log('function ls not found, searching ls=');
  pos = content.indexOf('ls=');
  console.log(content.slice(pos, pos + 800));
}
