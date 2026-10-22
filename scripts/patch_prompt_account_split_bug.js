const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Bắt đầu vá lỗi Cannot read properties of undefined (reading split) khi click prompt...');

// 1. Patch app/out/renderer/assets/VideoStudio-frcr8V6s.js
const videoStudioPath = path.resolve(__dirname, '../app/out/renderer/assets/VideoStudio-frcr8V6s.js');
let videoContent = fs.readFileSync(videoStudioPath, 'utf8');

// Backup
fs.writeFileSync(videoStudioPath + '.bak_split', videoContent, 'utf8');

// Target 1: avatar split
const vt1 = 'children:o.account.split(" ").map(g=>g[0]).join("").slice(0,2)})';
const vr1 = 'children:(o.account||"Auto").split(" ").map(g=>g[0]).join("").slice(0,2)})';
if (!videoContent.includes(vt1)) throw new Error('VideoStudio vt1 not found');
videoContent = videoContent.replace(vt1, vr1);

// Target 2: account label
const vt2 = 'children:f?m("videoStudio.autoAssignment"):o.account';
const vr2 = 'children:f?m("videoStudio.autoAssignment"):(o.account||m("videoStudio.autoAssignment")||"Auto")';
if (!videoContent.includes(vt2)) throw new Error('VideoStudio vt2 not found');
videoContent = videoContent.replace(vt2, vr2);

// Target 3: dropdown value
const vt3 = 'e.jsx(Qe,{value:o.account,options:y,onChange:';
const vr3 = 'e.jsx(Qe,{value:o.account||"Auto",options:y,onChange:';
if (!videoContent.includes(vt3)) throw new Error('VideoStudio vt3 not found');
videoContent = videoContent.replace(vt3, vr3);

// Target 4: Ye, Be, Me_muse
const vt4 = 'Ye=Se?.provider==="Veo3"&&Se.account==="Auto",Be=Se?.provider==="Grok"&&Se.account==="Auto",Me_muse=(Se?.provider==="Muse AI"||Se?.provider==="muse ai")&&Se.account==="Auto"';
const vr4 = 'Ye=Se?.provider==="Veo3"&&(!Se.account||Se.account==="Auto"),Be=Se?.provider==="Grok"&&(!Se.account||Se.account==="Auto"),Me_muse=(Se?.provider==="Muse AI"||Se?.provider==="muse ai")&&(!Se.account||Se.account==="Auto")';
if (!videoContent.includes(vt4)) throw new Error('VideoStudio vt4 not found');
videoContent = videoContent.replace(vt4, vr4);

// Target 5: selectedUsesAutoVeo
const vt5 = 'readyVeoSessionCount:Be?Ie.length:Ce.length,selectedAccountTone:Kt,selectedUsesAutoVeo:Ye||Be,';
const vr5 = 'readyVeoSessionCount:Be?Ie.length:Me_muse?activeMuseAccounts.length:Ce.length,selectedAccountTone:Kt,selectedUsesAutoVeo:Ye||Be||Me_muse,';
if (!videoContent.includes(vt5)) throw new Error('VideoStudio vt5 not found');
videoContent = videoContent.replace(vt5, vr5);

fs.writeFileSync(videoStudioPath, videoContent, 'utf8');
console.log('✅ Đã vá VideoStudio-frcr8V6s.js thành công!');

// 2. Patch app/out/renderer/assets/ImageStudio-4nmpUX3j.js
const imageStudioPath = path.resolve(__dirname, '../app/out/renderer/assets/ImageStudio-4nmpUX3j.js');
let imgContent = fs.readFileSync(imageStudioPath, 'utf8');

// Backup
fs.writeFileSync(imageStudioPath + '.bak_split', imgContent, 'utf8');

// Target 1: avatar split
const it1 = 'children:o.account.split(" ").map(I=>I[0]).join("").slice(0,2)})';
const ir1 = 'children:(o.account||"Auto").split(" ").map(I=>I[0]).join("").slice(0,2)})';
if (!imgContent.includes(it1)) throw new Error('ImageStudio it1 not found');
imgContent = imgContent.replace(it1, ir1);

// Target 2: account label
const it2 = 'children:u?h("imageStudio.autoAssignment"):o.account';
const ir2 = 'children:u?h("imageStudio.autoAssignment"):(o.account||h("imageStudio.autoAssignment")||"Auto")';
if (!imgContent.includes(it2)) throw new Error('ImageStudio it2 not found');
imgContent = imgContent.replace(it2, ir2);

// Target 3: dropdown value
const it3 = 'e.jsx(ke,{value:o.account,options:X,onChange:I=>$(o.id,{account:I}),';
const ir3 = 'e.jsx(ke,{value:o.account||"Auto",options:X,onChange:I=>$(o.id,{account:I}),';
if (!imgContent.includes(it3)) throw new Error('ImageStudio it3 not found');
imgContent = imgContent.replace(it3, ir3);

// Target 4: banana prompt creation account
const it4 = 'account:g?.provider==="Banana"||!g?"Auto":g.account';
const ir4 = 'account:g?.account||"Auto"';
if (!imgContent.includes(it4)) throw new Error('ImageStudio it4 not found');
imgContent = imgContent.replace(it4, ir4);

// Target 5: so=ve?.account==="Auto"
const it5 = 'so=ve?.account==="Auto"';
const ir5 = 'so=!ve?.account||ve?.account==="Auto"';
if (!imgContent.includes(it5)) throw new Error('ImageStudio it5 not found');
imgContent = imgContent.replace(it5, ir5);

fs.writeFileSync(imageStudioPath, imgContent, 'utf8');
console.log('✅ Đã vá ImageStudio-4nmpUX3j.js thành công!');

// 3. Patch app/out/renderer/assets/index-BS7vgKVV.js
const indexPath = path.resolve(__dirname, '../app/out/renderer/assets/index-BS7vgKVV.js');
let idxContent = fs.readFileSync(indexPath, 'utf8');

// Backup
fs.writeFileSync(indexPath + '.bak_split', idxContent, 'utf8');

// Target 1: Ds default account
const xt1 = 'account:r?.provider==="Veo3"||!r?"Auto":r.account';
const xr1 = 'account:r?.account||"Auto"';
if (!idxContent.includes(xt1)) throw new Error('index xt1 not found');
idxContent = idxContent.replace(xt1, xr1);

// Target 2: addPromptList
const xt2 = 'return{...Ds(s[g],c.promptRows.length+g+1,{sceneName:sName,title:sName}),prompt:f,referenceAssetIds:refs,sceneName:sName,title:sName}';
const xr2 = 'const acc=(orig&&typeof orig==="object"&&orig.account)?orig.account:"Auto",prov=(orig&&typeof orig==="object"&&orig.provider)?orig.provider:"Veo3";return{...Ds(s[g],c.promptRows.length+g+1,{sceneName:sName,title:sName,account:acc,provider:prov}),prompt:f,account:acc,provider:prov,referenceAssetIds:refs,sceneName:sName,title:sName}';
if (!idxContent.includes(xt2)) throw new Error('index xt2 not found');
idxContent = idxContent.replace(xt2, xr2);

fs.writeFileSync(indexPath, idxContent, 'utf8');
console.log('✅ Đã vá index-BS7vgKVV.js thành công!');

// 4. Test syntax of all 3 files
console.log('🔍 Kiểm tra cú pháp JavaScript bằng node -c...');
execSync(`node -c "${videoStudioPath}"`);
execSync(`node -c "${imageStudioPath}"`);
execSync(`node -c "${indexPath}"`);
console.log('🎉 Toàn bộ cú pháp file JS đều chuẩn xác 100%!');
