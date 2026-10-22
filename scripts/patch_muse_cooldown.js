const fs = require('fs');
const targetFile = 'app/out/main/index.js';
let content = fs.readFileSync(targetFile, 'utf8');

const target = 'for (const s of allMuseSessions) {\n      if (s.partition) {\n        try {\n          const ses = electron.session.fromPartition(s.partition);';
const replacement = 'for (const s of allMuseSessions) {\n      if (s.partition) {\n        try {\n          if (typeof ct === "function" && ct(s)) continue;\n          const ses = electron.session.fromPartition(s.partition);';

if (!content.includes(target)) {
  console.log('Target not found, checking with alternate whitespace');
  const pos = content.indexOf('for (const s of allMuseSessions)');
  console.log(content.substring(pos, pos + 200));
} else {
  content = content.replace(target, replacement);
  fs.writeFileSync(targetFile, content, 'utf8');
  console.log('Successfully updated MuseVideoRuntime cooldown check');
}
