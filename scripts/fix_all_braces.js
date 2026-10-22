const fs = require('fs');

const mainPath = 'app/out/main/index.js';
let content = fs.readFileSync(mainPath, 'utf8');

// Replace all 3 instances where }}}catch occurred:
// 1. _dErr
content = content.replace(
  `{a=cleanedBuf;s=!0;i=!0}}}catch(_dErr)`,
  `{a=cleanedBuf;s=!0;i=!0}}catch(_dErr)`
);

// 2. _vErr
content = content.replace(
  `{a=cleanedBuf;s=!0;i=!0}}}catch(_vErr)`,
  `{a=cleanedBuf;s=!0;i=!0}}catch(_vErr)`
);

// 3. _postErr
content = content.replace(
  `this.scheduleEmit()}}}catch(_postErr)`,
  `this.scheduleEmit()}}catch(_postErr)`
);

fs.writeFileSync(mainPath, content, 'utf8');
console.log("Fixed all 3 extra braces before catch!");
