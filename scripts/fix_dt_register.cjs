const fs = require('fs');
const file = 'app/out/main/index.js';
let content = fs.readFileSync(file, 'utf8');

const badReg = 'const museRuntimeInstance = new MuseVideoRuntime(T,V,W); dt.register(museRuntimeInstance); dt.runtimes.set("muse ai", [museRuntimeInstance]); dt.runtimes.set("Muse AI", [museRuntimeInstance]);';
const goodReg = 'dt.register(new MuseVideoRuntime(T,V,W))';

if (content.includes(badReg)) {
  content = content.replace(badReg, goodReg);
  fs.writeFileSync(file, content, 'utf8');
  console.log('✓ Successfully fixed dt.register syntax in main/index.js');
} else {
  console.log('badReg not found');
}
