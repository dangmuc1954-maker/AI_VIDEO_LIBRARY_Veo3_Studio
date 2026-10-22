const fs = require('fs');
const path = require('path');

const mainFile = path.resolve('app/out/main/index.js');
let mainCode = fs.readFileSync(mainFile, 'utf8');

// 1. Add createRequire at the top of app/out/main/index.js if not present
if (!mainCode.includes('__createRequire')) {
  mainCode = 'import { createRequire as __createRequire } from "node:module";\nconst require = __createRequire(import.meta.url);\n' + mainCode;
  console.log("✓ Added global createRequire polyfill to top of main/index.js!");
}

// 2. In MuseVideoRuntime, replace require('fs'), require('path'), require('os') with nodeFs, nodePath, { homedir: Jo, tmpdir: Aa }
mainCode = mainCode.replace("const fs = require('fs');", "const fs = nodeFs;");
mainCode = mainCode.replace("const path = require('path');", "const path = nodePath;");
mainCode = mainCode.replace("const os = require('os');", "const os = { homedir: Jo, tmpdir: Aa };");

// Also check any other require in MuseVideoRuntime
mainCode = mainCode.replaceAll("require('fs')", "nodeFs");
mainCode = mainCode.replaceAll("require('path')", "nodePath");
mainCode = mainCode.replaceAll("require('os')", "{ homedir: Jo, tmpdir: Aa }");

fs.writeFileSync(mainFile, mainCode, 'utf8');
console.log("✓ Successfully eliminated 'require is not defined'!");
