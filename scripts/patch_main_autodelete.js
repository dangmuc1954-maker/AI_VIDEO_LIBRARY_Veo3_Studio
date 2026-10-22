const fs = require('fs');
const path = require('path');

const mainPath = path.join(__dirname, '../app/out/main/index.js');
let code = fs.readFileSync(mainPath, 'utf8');

// 1. Tagging in writeAsset
const targetWriteAsset = 'const u={...e,bytes:e.bytes.byteLength,sha256:g,localPath:n,url:Vs(e.id),thumbnailPath:a,thumbnailUrl:c?.url,thumbnailMimeType:c?.mimeType};';
if (!code.includes(targetWriteAsset)) {
  console.error('Target in writeAsset not found!');
  process.exit(1);
}

const replacementWriteAsset = `const u={...e,bytes:e.bytes.byteLength,sha256:g,localPath:n,url:Vs(e.id),thumbnailPath:a,thumbnailUrl:c?.url,thumbnailMimeType:c?.mimeType};
/*__AIFORGE_AUTO_DELETE_TAG__*/
try {
  if (global.__aiforge_auto_delete_config && global.__aiforge_auto_delete_config.enabled && global.__aiforge_auto_delete_config.minutes > 0 && e.role === "generated") {
    const _dm = global.__aiforge_auto_delete_config.minutes;
    u.autoDeleteAt = Date.now() + _dm * 60000;
    u.autoDeleteMinutes = _dm;
    console.log("[Auto-Delete] Tài nguyên " + (u.name || u.id) + " hẹn giờ tự xóa vĩnh viễn sau " + _dm + " phút");
  }
} catch (_adErr) { console.error("[Auto-Delete Tag Error]:", _adErr); }
`;

code = code.replace(targetWriteAsset, replacementWriteAsset);

// 2. Add IPC handlers before E.handle("assets:delete",
const targetIpc = 'E.handle("assets:delete",async(A,o)=>{';
if (!code.includes(targetIpc)) {
  console.error('Target IPC assets:delete not found!');
  process.exit(1);
}

const ipcHandlers = `E.handle("assets:getAutoDeleteConfig",(A)=>{
  C(A);
  return global.__aiforge_auto_delete_config||{enabled:!1,minutes:0};
}),E.handle("assets:setAutoDeleteConfig",(A,config)=>{
  C(A);
  const minutes=Number(config?.minutes)||0;
  const enabled=!!config?.enabled&&minutes>0;
  global.__aiforge_auto_delete_config={enabled,minutes:enabled?minutes:0,updatedAt:Date.now()};
  try{
    const fsm=require("fs"),ptm=require("path");
    const cfgFile=ptm.join(require("electron").app.getPath("userData"),"aiforge_auto_delete_config.json");
    fsm.writeFileSync(cfgFile,JSON.stringify(global.__aiforge_auto_delete_config,null,2),"utf8");
  }catch(err){console.error("[Auto-Delete] Lưu file config thất bại:",err);}
  try{
    const {BrowserWindow}=require("electron");
    BrowserWindow.getAllWindows().forEach(w=>{
      w.webContents.send("assets:autoDeleteChanged",global.__aiforge_auto_delete_config);
      w.webContents.send("aiforge:notify",{
        type:enabled?"success":"info",
        message:enabled
          ? \`⏱️ Đã bật tự động xóa sau \${minutes} phút. Tài nguyên mới tạo sẽ tự xóa sau \${minutes}p để tiết kiệm ổ đĩa.\`
          : "ℹ️ Đã tắt tự động xóa tài nguyên. Các tài nguyên mới sẽ được lưu vĩnh viễn."
      });
    });
  }catch(_){}
  return global.__aiforge_auto_delete_config;
}),E.handle("assets:cancelAssetAutoDelete",async(A,assetId)=>{
  C(A);
  R(assetId,"asset id");
  const asset=V.getAsset(assetId);
  if(!asset)return!1;
  delete asset.autoDeleteAt;
  delete asset.autoDeleteMinutes;
  await V.persistNow();
  V.emit();
  return!0;
}),` + targetIpc;

code = code.replace(targetIpc, ipcHandlers);

// 3. Add checkAndCleanExpiredAssets and startup interval
const targetStartup = 'Pe.pruneOrphanAccounts(d);';
if (!code.includes(targetStartup)) {
  console.error('Target startup Pe.pruneOrphanAccounts not found!');
  process.exit(1);
}

const startupLogic = `Pe.pruneOrphanAccounts(d);
/*__AIFORGE_AUTO_DELETE_INIT__*/
try {
  const fsm = require("fs"), ptm = require("path");
  const cfgFile = ptm.join(F.getPath("userData"), "aiforge_auto_delete_config.json");
  if (fsm.existsSync(cfgFile)) {
    global.__aiforge_auto_delete_config = JSON.parse(fsm.readFileSync(cfgFile, "utf8"));
    console.log("[Auto-Delete] Đã nạp cấu hình tự động xóa:", global.__aiforge_auto_delete_config);
  } else {
    global.__aiforge_auto_delete_config = { enabled: false, minutes: 0 };
  }
} catch (_) {
  global.__aiforge_auto_delete_config = { enabled: false, minutes: 0 };
}
async function checkAndCleanExpiredAssets() {
  try {
    if (!V || !Array.isArray(V.state?.assets)) return;
    const now = Date.now();
    const toDelete = V.state.assets.filter(a => {
      if (a.pinnedAsReference === true) return false;
      if (!a.autoDeleteAt || typeof a.autoDeleteAt !== "number") return false;
      return now >= a.autoDeleteAt;
    });
    if (toDelete.length === 0) return;
    const ids = toDelete.map(a => a.id);
    console.log("[Auto-Delete] Phát hiện " + ids.length + " tài nguyên hết hạn, đang xóa vĩnh viễn...");
    const res = await V.deleteAssets(ids);
    if (res.deleted > 0) {
      U.removeResultAssets(ids);
      try {
        const rel = U.state.jobs.filter(j => ids.includes(j.id) || j.result?.assets?.some(g => ids.includes(g.assetId))).map(j => j.id);
        if (rel.length > 0) U.removeJobs(rel);
      } catch (_) {}
      console.log("[Auto-Delete] Đã xóa vĩnh viễn " + res.deleted + " tài nguyên hết hạn.");
      try {
        const { BrowserWindow } = require("electron");
        BrowserWindow.getAllWindows().forEach(w => {
          w.webContents.send("aiforge:notify", {
            type: "info",
            message: "🗑️ Đã tự động dọn dẹp vĩnh viễn " + res.deleted + " tài nguyên video/ảnh hết hạn để tiết kiệm ổ đĩa."
          });
        });
      } catch (_) {}
    }
  } catch (err) {
    console.error("[Auto-Delete Scan Error]:", err);
  }
}
setTimeout(checkAndCleanExpiredAssets, 2000);
if (global.__aiforge_auto_delete_timer) clearInterval(global.__aiforge_auto_delete_timer);
global.__aiforge_auto_delete_timer = setInterval(checkAndCleanExpiredAssets, 15000);
`;

code = code.replace(targetStartup, startupLogic);

// Write backup and new file
fs.writeFileSync(mainPath + '.bak_before_autodelete', fs.readFileSync(mainPath));
fs.writeFileSync(mainPath, code, 'utf8');
console.log('Successfully patched app/out/main/index.js with Auto-Delete system!');
