const fs = require('fs');
let main = fs.readFileSync('app/out/main/index.js', 'utf8');

const target = 'S.handle("assets:cancelMerge",(r,e)=>(A(r),_(e,"asset merge operation id"),ct.cancel(e))),';

const handlers = [
  'S.handle("assets:selectExportDirectory",async(r,defaultPath,title)=>{',
  '  A(r);',
  '  const win = dt.fromWebContents(r.sender);',
  '  const opts = {',
  '    title: (typeof title === "string" && title.trim()) ? title.trim() : "Chọn thư mục lưu video xuất",',
  '    properties: ["openDirectory", "createDirectory"],',
  '    ...(typeof defaultPath === "string" && defaultPath.trim() ? { defaultPath: defaultPath.trim() } : {})',
  '  };',
  '  const res = win ? await Pe.showOpenDialog(win, opts) : await Pe.showOpenDialog(opts);',
  '  return res.canceled ? null : (res.filePaths[0] || null);',
  '}),',
  'S.handle("assets:exportMedia",async(r,input)=>{',
  '  A(r);',
  '  if (!input || typeof input !== "object") throw new Error("Download export input is required.");',
  '  const asset = $.getAsset(input.assetId);',
  '  if (!asset || !asset.localPath) throw new Error("Asset not found");',
  '  const destDir = input.destination?.directory;',
  '  if (!destDir) throw new Error("Destination directory is required");',
  '  const path = require("path");',
  '  const fs = require("fs");',
  '  const fileName = input.destination?.fileName || input.sourceName || path.basename(asset.localPath);',
  '  const destPath = path.join(destDir, fileName);',
  '  fs.copyFileSync(asset.localPath, destPath);',
  '  return { path: destPath, fileName };',
  '}),',
  'S.handle("assets:showPathInFolder",(r,filePath)=>{',
  '  A(r);',
  '  if (typeof filePath === "string" && filePath.trim()) {',
  '    to.showItemInFolder(filePath.trim());',
  '    return true;',
  '  }',
  '  return false;',
  '}),',
  'S.handle("assets:openPath",async(r,filePath)=>{',
  '  A(r);',
  '  if (typeof filePath === "string" && filePath.trim()) {',
  '    return !await to.openPath(filePath.trim());',
  '  }',
  '  return false;',
  '}),'
].join('');

if (!main.includes('assets:selectExportDirectory')) {
  main = main.replace(target, target + handlers);
  fs.writeFileSync('app/out/main/index.js', main, 'utf8');
  console.log('Patched app/out/main/index.js successfully.');
} else {
  console.log('Already contains assets:selectExportDirectory');
}
