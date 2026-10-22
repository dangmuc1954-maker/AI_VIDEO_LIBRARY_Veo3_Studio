const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function checkAllJs(dir) {
  let count = 0;
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      count += checkAllJs(full);
    } else if (f.endsWith('.js') || f.endsWith('.cjs')) {
      try {
        execSync(`node --check "${full}"`);
        count++;
      } catch (e) {
        console.error('FAILED SYNTAX:', full);
        process.exit(1);
      }
    }
  }
  return count;
}

const total = checkAllJs('app/out');
console.log(`SUCCESS: All ${total} JS & CJS files in app/out passed syntax check 100%!`);
