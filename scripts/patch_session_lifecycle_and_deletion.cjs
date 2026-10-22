const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== [PATCH] FIX ACCOUNT DELETION PERSISTENCE & PROCESS LIFECYCLE ===');

const mainFile = path.resolve('app/out/main/index.js');
let code = fs.readFileSync(mainFile, 'utf8');

// =========================================================================
// 1. FIX LIFECYCLE: second-instance, window-all-closed, Z.on("closed")
// =========================================================================

// 1.1 Sửa second-instance: Nếu Z đã bị đóng hoặc null, mở lại bằng xi()
const oldSecondInstance = `F.on("second-instance",()=>{Z&&(Z.isMinimized()&&Z.restore(),Z.show(),Z.focus())});`;
const newSecondInstance = `F.on("second-instance",()=>{if(Z&&!Z.isDestroyed()){if(Z.isMinimized())Z.restore();Z.show();Z.focus()}else{try{xi()}catch(err){console.error("[second-instance] xi error",err)}}});`;

if (code.includes(oldSecondInstance)) {
  code = code.replace(oldSecondInstance, newSecondInstance);
  console.log('✅ 1.1 Đã sửa second-instance: Tự động phục hồi hoặc mở lại cửa sổ khi người dùng bấm mở app');
} else {
  console.log('⚠️ Không tìm thấy oldSecondInstance');
}

// 1.2 Sửa Z.on("closed"): Khi đóng cửa sổ chính, thoát ứng dụng hoàn toàn để không để lại process ma
const oldZClosed = `Z.on("closed",()=>{W.setWindow(null),Z=null})`;
const newZClosed = `Z.on("closed",()=>{W.setWindow(null);Z=null;try{if(global.__aiforge_auto_delete_timer)clearInterval(global.__aiforge_auto_delete_timer)}catch(_){}F.quit();setTimeout(()=>{try{process.exit(0)}catch(_){}},1000)})`;

if (code.includes(oldZClosed)) {
  code = code.replace(oldZClosed, newZClosed);
  console.log('✅ 1.2 Đã sửa Z.on("closed"): Tắt sạch tiến trình khi người dùng tắt cửa sổ');
} else {
  console.log('⚠️ Không tìm thấy oldZClosed');
}

// 1.3 Sửa window-all-closed & before-quit
const oldWinAllClosed = `F.on("window-all-closed",()=>{F.quit()});`;
const newWinAllClosed = `F.on("window-all-closed",()=>{try{if(global.__aiforge_auto_delete_timer)clearInterval(global.__aiforge_auto_delete_timer)}catch(_){}F.quit();setTimeout(()=>{try{process.exit(0)}catch(_){}},1000)});`;

if (code.includes(oldWinAllClosed)) {
  code = code.replace(oldWinAllClosed, newWinAllClosed);
  console.log('✅ 1.3 Đã sửa window-all-closed: Dọn dẹp timer và kết thúc tiến trình sạch sẽ');
}

const oldBeforeQuitFinally = `.finally(()=>{Oi=!0,F.quit()})))}`;
const newBeforeQuitFinally = `.finally(()=>{Oi=!0;try{if(global.__aiforge_auto_delete_timer)clearInterval(global.__aiforge_auto_delete_timer)}catch(_){}F.quit();setTimeout(()=>{try{process.exit(0)}catch(_){}},1000)})))}`;

if (code.includes(oldBeforeQuitFinally)) {
  code = code.replace(oldBeforeQuitFinally, newBeforeQuitFinally);
  console.log('✅ 1.4 Đã sửa before-quit: Đảm bảo thoát 100% sau khi lưu dữ liệu');
}

// =========================================================================
// 2. FIX ACCOUNT DELETION PERSISTENCE:
//    - Lưu danh sách ID đã xóa vào deleted-accounts-registry.json
//    - hydrate KHÔNG BAO GIỜ nuốt file .tmp cũ
//    - hydrate bỏ qua mọi ID trong registry
//    - save KHÔNG BAO GIỜ tự ý auto-merge tài khoản đã xóa từ master_vault
// =========================================================================

// 2.1 Cập nhật deleteAccount(e)
const oldDeleteAccount = `deleteAccount(e){this._explicitlyDeletedIds=this._explicitlyDeletedIds||new Set;this._explicitlyDeletedIds.add(e);const t=this.getSession(e);return this.sessions=this.sessions.filter(A=>A.accountId!==e),this.emit(),this.save(),t}`;

const newDeleteAccount = `deleteAccount(e){this._explicitlyDeletedIds=this._explicitlyDeletedIds||new Set;this._explicitlyDeletedIds.add(e);if(this.store){try{const _dir=Te(this.store.filePath);const delFile=L(_dir,"deleted-accounts-registry.json");let arr=[];if(Je(delFile)){try{arr=JSON.parse(tA(delFile,"utf8"))}catch{}}if(Array.isArray(arr)&&!arr.includes(e)){arr.push(e);rA.writeFileSync(delFile,JSON.stringify(arr,null,2),"utf8")}for(const vf of[L(_dir,"browser-sessions.json.master_vault.json"),L(_dir,"browser-sessions.json.bak_persistent"),L(_dir,"browser-sessions.json.bak")]){if(Je(vf)){try{const vc=JSON.parse(tA(vf,"utf8"));if(vc&&Array.isArray(vc.sessions)){vc.sessions=vc.sessions.filter(x=>x&&x.accountId!==e);rA.writeFileSync(vf,JSON.stringify(vc,null,2),"utf8")}}catch{}}}}catch(err){console.warn("[deleteAccount] registry write error",err)}}const t=this.getSession(e);return this.sessions=this.sessions.filter(A=>A.accountId!==e),this.emit(),this.save(),t}`;

if (code.includes(oldDeleteAccount)) {
  code = code.replace(oldDeleteAccount, newDeleteAccount);
  console.log('✅ 2.1 Đã sửa deleteAccount: Lưu vĩnh viễn ID đã xóa và thanh lọc toàn bộ vault');
} else {
  console.log('⚠️ Không tìm thấy oldDeleteAccount');
}

// 2.2 Cập nhật hydrate(e): Đọc registry xóa, bỏ qua file .tmp, không hồi sinh tài khoản
const oldHydrateStart = `hydrate(e){this.store=new me(e,{sessions:[]});const _dir=Te(e);const _vault=L(_dir,"browser-sessions.json.master_vault.json");const _bakPersistent=L(_dir,"browser-sessions.json.bak_persistent");const _bakNormal=L(_dir,"browser-sessions.json.bak");`;

const newHydrateStart = `hydrate(e){this.store=new me(e,{sessions:[]});const _dir=Te(e);const _vault=L(_dir,"browser-sessions.json.master_vault.json");const _bakPersistent=L(_dir,"browser-sessions.json.bak_persistent");const _bakNormal=L(_dir,"browser-sessions.json.bak");const _delFile=L(_dir,"deleted-accounts-registry.json");let _delIds=new Set();if(Je(_delFile)){try{const da=JSON.parse(tA(_delFile,"utf8"));if(Array.isArray(da))_delIds=new Set(da)}catch{}}this._explicitlyDeletedIds=_delIds;`;

if (code.includes(oldHydrateStart)) {
  code = code.replace(oldHydrateStart, newHydrateStart);
  console.log('✅ 2.2.1 Đã nạp danh sách tài khoản đã xóa vào hydrate');
}

// 2.2.2 Sửa ingest: bỏ qua tài khoản đã xóa
const oldIngestCheck = `if(!s||!s.accountId)continue;`;
const newIngestCheck = `if(!s||!s.accountId||_delIds.has(s.accountId))continue;`;

if (code.includes(oldIngestCheck)) {
  code = code.replace(oldIngestCheck, newIngestCheck);
  console.log('✅ 2.2.2 Đã chặn ingest nạp tài khoản đã xóa');
}

// 2.2.3 Dọn sạch file .tmp thay vì ingest file .tmp
const oldTmpScan = `try{const files=rA.readdirSync(_dir);for(const f of files){if(f.startsWith("browser-sessions.json.")&&(f.endsWith(".tmp")||f.includes(".bak"))){ingest(_readSessions(L(_dir,f)),f)}}}catch(err){}`;

const newTmpScan = `try{const files=rA.readdirSync(_dir);for(const f of files){if(f.startsWith("browser-sessions.json.")){if(f.endsWith(".tmp")){try{rA.unlinkSync(L(_dir,f))}catch(_){}}else if(f.includes(".bak")){ingest(_readSessions(L(_dir,f)),f)}}}}catch(err){}`;

if (code.includes(oldTmpScan)) {
  code = code.replace(oldTmpScan, newTmpScan);
  console.log('✅ 2.2.3 Đã sửa: Xóa sạch file .tmp rác, không nạp tài khoản cũ từ file .tmp');
}

// 2.3 Sửa save(): Loại bỏ hoàn toàn cơ chế auto-merge từ master_vault nếu tài khoản đã bị xóa
const oldSaveAutoMerge = `if(Array.isArray(this.sessions)){if(vaultSessions.length>this.sessions.length&&(!this._explicitlyDeletedIds||!this._explicitlyDeletedIds.size)){const map=new Map(this.sessions.map(s=>[s.accountId,s]));let restoredCount=0;for(const vs of vaultSessions){if(!map.has(vs.accountId)){map.set(vs.accountId,vs);restoredCount++}}if(restoredCount>0){this.sessions=Array.from(map.values());console.warn("[browser-session-guard] Protective Shield: Auto-merged "+restoredCount+" missing accounts from master vault!")}}}`;

const newSaveAutoMerge = `if(Array.isArray(this.sessions)&&this._explicitlyDeletedIds&&this._explicitlyDeletedIds.size>0){this.sessions=this.sessions.filter(s=>!this._explicitlyDeletedIds.has(s.accountId))}`;

if (code.includes(oldSaveAutoMerge)) {
  code = code.replace(oldSaveAutoMerge, newSaveAutoMerge);
  console.log('✅ 2.3 Đã loại bỏ hoàn toàn cơ chế auto-merge hồi sinh tài khoản');
} else {
  console.log('⚠️ Không tìm thấy oldSaveAutoMerge');
}

fs.writeFileSync(mainFile, code, 'utf8');
console.log('💾 Đã lưu app/out/main/index.js thành công!');

// Kiểm tra cú pháp
execSync('node -c app/out/main/index.js', { stdio: 'inherit' });
console.log('🎉 Cú pháp JavaScript index.js chuẩn 100%!');

// =========================================================================
// 3. DỌN DẸP DỮ LIỆU USER DATA HIỆN TẠI TRÊN MÁY
// =========================================================================
const userDataDir = 'C:/Users/admin/AppData/Roaming/AI_VIDEO_LIBRARY_DATA';
if (fs.existsSync(userDataDir)) {
  console.log('[*] Đang dọn dẹp các file rác và zombie sessions trong userData...');
  
  // Xóa tất cả các file .tmp
  const files = fs.readdirSync(userDataDir);
  let tmpDeleted = 0;
  for (const f of files) {
    if (f.startsWith('browser-sessions.json.') && f.endsWith('.tmp')) {
      try {
        fs.unlinkSync(path.join(userDataDir, f));
        tmpDeleted++;
      } catch (_) {}
    }
  }
  console.log(`  ✓ Đã xóa ${tmpDeleted} file .tmp cũ.`);

  // Xóa zombie session custom-e618
  const sessionFiles = [
    'browser-sessions.json',
    'browser-sessions.json.master_vault.json',
    'browser-sessions.json.bak_persistent',
    'browser-sessions.json.bak'
  ];

  for (const sf of sessionFiles) {
    const p = path.join(userDataDir, sf);
    if (fs.existsSync(p)) {
      try {
        const data = JSON.parse(fs.readFileSync(p, 'utf8'));
        if (data && Array.isArray(data.sessions)) {
          const before = data.sessions.length;
          data.sessions = data.sessions.filter(s => s && s.accountId !== 'custom-e618febb-6065-4662-a413-96d1aaa448bf-1791566975307');
          if (data.sessions.length !== before) {
            fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
            console.log(`  ✓ Đã thanh lọc session zombie khỏi ${sf}`);
          }
        }
      } catch (_) {}
    }
  }
}
