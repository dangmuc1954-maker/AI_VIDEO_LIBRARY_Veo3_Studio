const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../app/out/main/index.js');
let code = fs.readFileSync(targetFile, 'utf8');

// 1. Top of file import
const topOld = 'import nodeCrypto from "node:crypto";\r\nimport nodeFs from "node:fs";\r\nimport nodePath from "node:path";\r\nimport nodeCp from "node:child_process";';
const topOldLF = 'import nodeCrypto from "node:crypto";\nimport nodeFs from "node:fs";\nimport nodePath from "node:path";\nimport nodeCp from "node:child_process";';

const topNew = 'import nodeCrypto from "node:crypto";\nimport nodeFs from "node:fs";\nimport nodePath from "node:path";\nimport nodeCp from "node:child_process";\nimport { fileURLToPath } from "node:url";\n\nconst __mainFilename = fileURLToPath(import.meta.url);\nconst __mainDirname = nodePath.dirname(__mainFilename);';

if (code.includes(topOld)) {
  code = code.replace(topOld, topNew);
} else if (code.includes(topOldLF)) {
  code = code.replace(topOldLF, topNew);
} else {
  console.error('Could not find topOld in index.js');
  process.exit(1);
}

// 2. Replace possibleTransformers and possibleModelDirs
const transOldPattern = /const possibleTransformers = \[\s*nodePath\.join\(__dirname, "\.\.\/node_modules\/@xenova\/transformers\/src\/transformers\.js"\)[\s\S]*?D:\/dự án antigravity\/AIForge_Veo3_Studio\/app\/models"\s*\];/;

const transNew = `const baseDir = typeof __mainDirname !== "undefined" ? __mainDirname : nodePath.dirname(fileURLToPath(import.meta.url));

      const possibleTransformers = [
        nodePath.join(baseDir, "../node_modules/@xenova/transformers/src/transformers.js"),
        nodePath.join(baseDir, "../../node_modules/@xenova/transformers/src/transformers.js"),
        nodePath.join(process.resourcesPath || "", "app/node_modules/@xenova/transformers/src/transformers.js"),
        "C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/node_modules/@xenova/transformers/src/transformers.js",
        "D:/dự án antigravity/AIForge_Veo3_Studio/app/node_modules/@xenova/transformers/src/transformers.js"
      ];

      const possibleModelDirs = [
        nodePath.join(baseDir, "../models"),
        nodePath.join(baseDir, "../../models"),
        nodePath.join(process.env.APPDATA || "", "AI_VIDEO_LIBRARY_DATA/models"),
        nodePath.join(process.resourcesPath || "", "app/models"),
        "C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/models",
        "D:/dự án antigravity/AIForge_Veo3_Studio/app/models"
      ];`;

if (!transOldPattern.test(code)) {
  console.error('Could not match transOldPattern');
  process.exit(1);
}
code = code.replace(transOldPattern, transNew);

// 3. Add Ao dai phonetic corrections
const repPattern = /(rep\("giữ\\\\s\+thiệu\|dữ\\\\s\+thiệu\|rữ\\\\s\+thiệu", "giới thiệu"\);)/;
const repAdditions = `$1
            rep("áo\\\\s+(?:rai|day|giài)", "áo dài");
            rep("chuyển\\\\s+thống|chiền\\\\s+thống", "truyền thống");
            rep("chất\\\\s+liệu\\\\s+(?:luận|lụn)", "chất liệu lụa");
            rep("mềm\\\\s+mãi", "mềm mại");
            rep("hỏa\\\\s+tiếp|họa\\\\s+tiếp", "họa tiết");
            rep("theo\\\\s+tay(?=\\\\s+vô|\\\\s+tinh|\\\\s+rất|\\\\s+khéo|\\\\s+đẹp)", "thêu tay");
            rep("tinh\\\\s+sáng(?=[,.!?]|$)", "tinh xảo");`;

if (!repPattern.test(code)) {
  console.error('Could not match repPattern');
  process.exit(1);
}
code = code.replace(repPattern, repAdditions);

// 4. Add natural comma insertion
const commaPattern = /(s = s\.replace\(\/__CA_NHA__\/g, "cả nhà"\);)/;
const commaAdditions = `s = s.replace(/tuyệt đẹp này\\s+chất liệu/gi, "tuyệt đẹp này, chất liệu");
            s = s.replace(/rất mềm mại\\s+và họa tiết/gi, "rất mềm mại và họa tiết");
            $1`;

if (!commaPattern.test(code)) {
  console.error('Could not match commaPattern');
  process.exit(1);
}
code = code.replace(commaPattern, commaAdditions);

fs.writeFileSync(targetFile, code, 'utf8');
console.log('Successfully patched app/out/main/index.js without __dirname!');
