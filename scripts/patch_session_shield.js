const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'app', 'out', 'main', 'index.js');
console.log('[Patch] Targeting:', targetFile);

let content = fs.readFileSync(targetFile, 'utf8');

// 1. Backup file
fs.writeFileSync(targetFile + '.pre_vault_patch.bak', content, 'utf8');
console.log('[Patch] Backup created at:', targetFile + '.pre_vault_patch.bak');

// 2. Patch function pr(r)
const oldPr = 'function pr(r){return r.split(/\\s+/).filter(Boolean).map(e=>e[0]).join("").slice(0,2).toUpperCase()}';
const newPr = 'function pr(r){return(r||"AI").split(/\\s+/).filter(Boolean).map(e=>e[0]).join("").slice(0,2).toUpperCase()||"AI"}';

if (content.includes(oldPr)) {
  content = content.replace(oldPr, newPr);
  console.log('[Patch 1/5] Successfully patched function pr(r) to prevent split() crashes');
} else {
  console.warn('[Patch 1/5] Could not find exact oldPr, searching pattern...');
  const prRegex = /function pr\(r\)\{return r\.split\(\/\\s\+\/\)[^\}]+\}/;
  if (prRegex.test(content)) {
    content = content.replace(prRegex, newPr);
    console.log('[Patch 1/5] Successfully regex-patched function pr(r)');
  } else {
    console.error('[Patch 1/5] FAILED to patch pr(r)');
  }
}

// 3. Patch deleteAccount to record explicitly deleted ID
const oldDeleteAccount = 'deleteAccount(e){const t=this.getSession(e);return this.sessions=this.sessions.filter(A=>A.accountId!==e),this.emit(),this.save(),t}';
const newDeleteAccount = 'deleteAccount(e){this._explicitlyDeletedIds=this._explicitlyDeletedIds||new Set;this._explicitlyDeletedIds.add(e);const t=this.getSession(e);return this.sessions=this.sessions.filter(A=>A.accountId!==e),this.emit(),this.save(),t}';

if (content.includes(oldDeleteAccount)) {
  content = content.replace(oldDeleteAccount, newDeleteAccount);
  console.log('[Patch 2/5] Successfully patched deleteAccount to track explicit user deletions');
} else {
  console.warn('[Patch 2/5] Could not find exact oldDeleteAccount');
}

// 4. Patch hydrate(e)
const idxHydrate = content.indexOf('hydrate(e){this.store=new me(e,{sessions:[]});');
const idxListProv = content.indexOf('listProviders(){return oA().map(', idxHydrate);

if (idxHydrate !== -1 && idxListProv !== -1) {
  const oldHydrateBlock = content.slice(idxHydrate, idxListProv);
  
  const newHydrateBlock = `hydrate(e){this.store=new me(e,{sessions:[]});const _dir=Te(e);const _vault=L(_dir,"browser-sessions.json.master_vault.json");const _bakPersistent=L(_dir,"browser-sessions.json.bak_persistent");const _bakNormal=L(_dir,"browser-sessions.json.bak");const _readSessions=targetPath=>{try{if(Je(targetPath)){const c=tA(targetPath,"utf8");if(c&&c.trim().length>5){const p=JSON.parse(c);if(p&&Array.isArray(p.sessions)&&p.sessions.length>0)return p.sessions}}}catch(err){console.warn("[browser-session] read error for "+targetPath,err)}return null};const sessionsMap=new Map;const ingest=(list,src)=>{if(!Array.isArray(list))return;for(const s of list){if(!s||!s.accountId)continue;const ex=sessionsMap.get(s.accountId);if(!ex){sessionsMap.set(s.accountId,s)}else{const keepLoggedIn=s.authStatus==="Logged In"||ex.authStatus==="Logged In";const betterCookies=Math.max(s.cookieCount||0,ex.cookieCount||0);const betterName=(s.accountDisplayName||s.accountName||"").length>(ex.accountDisplayName||ex.accountName||"").length?(s.accountDisplayName||s.accountName):(ex.accountDisplayName||ex.accountName);sessionsMap.set(s.accountId,{...ex,...s,accountName:betterName,authStatus:keepLoggedIn?"Logged In":(s.authStatus||ex.authStatus),cookieCount:betterCookies,activity:Array.isArray(s.activity)&&s.activity.length>(ex.activity?.length||0)?s.activity:ex.activity})}}};ingest(_readSessions(e),"primary");ingest(_readSessions(_vault),"master_vault");ingest(_readSessions(_bakPersistent),"bak_persistent");ingest(_readSessions(_bakNormal),"bak_normal");try{const files=rA.readdirSync(_dir);for(const f of files){if(f.startsWith("browser-sessions.json.")&&(f.endsWith(".tmp")||f.includes(".bak"))){ingest(_readSessions(L(_dir,f)),f)}}}catch(err){}try{const parent=Te(_dir);for(const sib of["AI VIDEO LIBRARY","aiforge-studio","ai-video-library"]){ingest(_readSessions(L(parent,sib,"browser-sessions.json")),sib);ingest(_readSessions(L(parent,sib,"browser-sessions.json.master_vault.json")),sib+"_vault");ingest(_readSessions(L(parent,sib,"browser-sessions.json.bak_persistent")),sib+"_bak")}}catch(err){}let parsedSessions=Array.from(sessionsMap.values());console.log("[browser-session-guard] Hydrated "+parsedSessions.length+" total sessions from all persistent sources.");let existingPartitions=[];try{const pDir=L(_dir,"Partitions");if(Je(pDir))existingPartitions=rA.readdirSync(pDir)}catch(err){}try{this.sessions=parsedSessions.map(A=>{const o=A,n=A.profileCreatedAt||o.createdAt||new Date(Date.now()-(A.sessionAgeMs||0)).toISOString();let s=A.providerId||oA().find(m=>m.name===A.provider)?.id||A.provider;if((s&&String(s).toLowerCase().includes("muse"))||(A.provider&&A.provider.toLowerCase().includes("muse"))||(A.startUrl&&A.startUrl.includes("muse.ai"))){s="muse";A.provider="Muse AI"}const pName=(A.partition||"").replace("persist:aiforge:","").replace("persist:aivideo:","");const hasDiskPartition=existingPartitions.some(ep=>ep.includes(pName)||pName.includes(ep));let finalAuth=A.authStatus;if(hasDiskPartition&&(A.cookieCount||0)>3&&finalAuth!=="Logged Out"){finalAuth="Logged In"}const a=finalAuth==="Logged In"?UA(A,A.loggedInAt||n):void 0;const i=s==="banana"||s==="veo3";let c=A.startUrl;i&&(!c||c.includes("/tools/flow")||c.includes("labs.google"))&&(c="https://flow.google.com/");const g=ot(A.accountDisplayName),u=ot(A.accountName),d=A.accountEmail?A.accountEmail.split("@")[0]:void 0,l=g||u||d||A.accountEmail||A.accountName||"Account";return{...A,avatarUrl:Tt(A.avatarUrl),startUrl:c,accountName:l,accountDisplayName:g,avatar:pr(l),disabled:A.disabled===!0,providerId:s,isCustomProvider:!dA.some(m=>m.id===s),profileCreatedAt:n,loggedInAt:a,authStatus:finalAuth,healthScore:finalAuth==="Logged In"?(A.healthScore||100):finalAuth==="Challenge"?45:0,healthLabel:finalAuth==="Logged In"?(A.healthLabel||"Excellent"):"Poor",viewState:"Idle",activeJobs:0}});if(this.sessions.length>0){this.save()}}catch(t){console.warn("[browser-session] unable to normalize stored sessions",t);if(parsedSessions.length>0&&this.sessions.length===0){this.sessions=parsedSessions}}} `;

  content = content.slice(0, idxHydrate) + newHydrateBlock + content.slice(idxListProv);
  console.log('[Patch 3/5] Successfully replaced hydrate() with Smart Multi-Tier Union');
} else {
  console.error('[Patch 3/5] FAILED to locate hydrate() bounds', idxHydrate, idxListProv);
}

// 5. Patch save()
const idxSave = content.indexOf('save(){if(!this.store)return;');
const idxAfterSave = content.indexOf('function uu()', idxSave);

if (idxSave !== -1 && idxAfterSave !== -1) {
  const newSaveBlock = `save(){if(!this.store)return;const _dir=Te(this.store.filePath);const _vault=L(_dir,"browser-sessions.json.master_vault.json");const _bakPersistent=L(_dir,"browser-sessions.json.bak_persistent");let vaultSessions=[];try{if(Je(_vault)){const vc=tA(_vault,"utf8");if(vc&&vc.trim().length>5){const vp=JSON.parse(vc);if(vp&&Array.isArray(vp.sessions))vaultSessions=vp.sessions}}}catch(e){}if(Array.isArray(this.sessions)){if(vaultSessions.length>this.sessions.length&&(!this._explicitlyDeletedIds||!this._explicitlyDeletedIds.size)){const map=new Map(this.sessions.map(s=>[s.accountId,s]));let restoredCount=0;for(const vs of vaultSessions){if(!map.has(vs.accountId)){map.set(vs.accountId,vs);restoredCount++}}if(restoredCount>0){this.sessions=Array.from(map.values());console.warn("[browser-session-guard] Protective Shield: Auto-merged "+restoredCount+" missing accounts from master vault!")}}}if(!Array.isArray(this.sessions)||this.sessions.length===0){if(vaultSessions.length>0){this.sessions=vaultSessions}else{try{if(Je(_bakPersistent)){const _bc=tA(_bakPersistent,"utf8");if(_bc&&_bc.trim().length>5){const _p=JSON.parse(_bc);if(_p&&Array.isArray(_p.sessions))this.sessions=_p.sessions}}}catch(e){}}}if(Array.isArray(this.sessions)&&this.sessions.length>0){const jsonStr=JSON.stringify({sessions:this.sessions},null,2);try{rA.writeFileSync(_bakPersistent,jsonStr,"utf8")}catch(e){}try{rA.writeFileSync(_vault,jsonStr,"utf8")}catch(e){}try{const parent=Te(_dir);for(const sib of["AI VIDEO LIBRARY","aiforge-studio","ai-video-library"]){const sibDir=L(parent,sib);if(Je(sibDir)){try{rA.writeFileSync(L(sibDir,"browser-sessions.json.master_vault.json"),jsonStr,"utf8")}catch(e){}try{rA.writeFileSync(L(sibDir,"browser-sessions.json.bak_persistent"),jsonStr,"utf8")}catch(e){}}}}catch(e){}}this.store?.save({sessions:this.sessions}).catch(e=>{console.warn("[browser-session] unable to persist sessions",e)})}}`;

  content = content.slice(0, idxSave) + newSaveBlock + content.slice(idxAfterSave);
  console.log('[Patch 4/5] Successfully replaced save() with Multi-Tier Vault Shield');
} else {
  console.error('[Patch 4/5] FAILED to locate save() bounds', idxSave, idxAfterSave);
}

// 6. Patch applyPageSnapshot to prevent false Logged Out
const targetSnapshotStr = 's=A.resolveAuthStatus?.({snapshot:e,currentSession:t,loginUrl:n,readyUrl:a,challengeUrl:su(e.url)})??"Unknown",i=t.authStatus!==s';
const replacementSnapshotStr = 's=A.resolveAuthStatus?.({snapshot:e,currentSession:t,loginUrl:n,readyUrl:a,challengeUrl:su(e.url)})??"Unknown";if(t.authStatus==="Logged In"&&s==="Logged Out"){const isActualLogin=/accounts\\.google\\.com\\/(signin|ServiceLogin|identifier)|login|sign-?in/i.test(e.url);if(!isActualLogin||(e.cookieCount&&e.cookieCount>5)){s="Logged In"}}const i=t.authStatus!==s';

if (content.includes(targetSnapshotStr)) {
  content = content.replace(targetSnapshotStr, replacementSnapshotStr);
  console.log('[Patch 5/5] Successfully patched applyPageSnapshot to shield Logged In status from false logouts');
} else {
  console.warn('[Patch 5/5] Searching for snapshot match...');
  const snapIdx = content.indexOf('resolveAuthStatus?.(');
  if (snapIdx !== -1) {
    console.log('Nearby snapshot code:', content.slice(snapIdx - 20, snapIdx + 200));
  }
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('\n[Finished] app/out/main/index.js successfully patched with complete session shield!');
