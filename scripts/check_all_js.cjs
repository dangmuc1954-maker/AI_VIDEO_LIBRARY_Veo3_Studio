const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function checkDir(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      if (f !== 'node_modules') checkDir(p);
    } else if (f.endsWith('.js') && !f.includes('.bak')) {
      try {
        execSync(`node --check "${p}"`, { stdio: 'pipe' });
      } catch (e) {
        console.error('Error in:', p, e.message);
        process.exit(1);
      }
    }
  }
}

checkDir(path.resolve(__dirname, '../app/out'));
console.log('🎉 ALL files in app/out passed syntax checks cleanly!');
