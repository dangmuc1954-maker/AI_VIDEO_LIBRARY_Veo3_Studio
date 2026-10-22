const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const mainPath = path.join(root, 'app/out/main/index.js');
const preloadPath = path.join(root, 'app/out/preload/index.cjs');
const settingsPath = path.join(root, 'app/out/renderer/assets/Settings-hJi2UgfH.js');

function replaceOnce(source, before, after, label) {
  if (source.includes(after)) return source;
  const first = source.indexOf(before);
  if (first < 0) {
    throw new Error(`Patch anchor not found: ${label}`);
  }
  if (source.indexOf(before, first + before.length) >= 0) {
    throw new Error(`Patch anchor is ambiguous: ${label}`);
  }
  return source.slice(0, first) + after + source.slice(first + before.length);
}

function read(file) { return fs.readFileSync(file, 'utf8'); }
function write(file, text) { fs.writeFileSync(file, text, 'utf8'); }

let main = read(mainPath);
const secureStore = `const geminiApiKeyPath=()=>L(F.getPath("userData"),"gemini-api-key.bin");
async function readGeminiApiKey(){if(!je.isEncryptionAvailable())throw new Error("Windows secure storage is unavailable; Gemini API key was not read");try{return je.decryptString(await Se(geminiApiKeyPath()))}catch(e){if(e?.code==="ENOENT")return"";throw new Error("Could not decrypt the saved Gemini API key. Save it again in Settings.")}}
async function writeGeminiApiKey(e){if(!je.isEncryptionAvailable())throw new Error("Windows secure storage is unavailable; cannot save Gemini API key");const t=geminiApiKeyPath();if(!e){await De(t).catch(()=>{});global.__aiforgeGeminiApiEnabled=!1;return!1}await rt(Te(t),{recursive:!0});const A=t+".tmp";await Ke(A,je.encryptString(e),{mode:384});await at(A,t);global.__aiforgeGeminiApiEnabled=!0;return!0}
async function callGeminiInteraction(e,t,A,o){const n=await fetch("https://generativelanguage.googleapis.com/v1beta/interactions",{method:"POST",headers:{"content-type":"application/json","x-goog-api-key":t},body:JSON.stringify(e),signal:o});let a;try{a=await n.json()}catch{a={}}if(!n.ok){const s=a?.error?.message||a?.message||"Request rejected";throw new Error("Gemini API ("+n.status+"): "+String(s).slice(0,700))}if(a?.status&&a.status!=="completed"&&a.status!=="succeeded")throw new Error("Gemini API returned status "+a.status+" without a completed result");const i=Array.isArray(a?.steps)?a.steps.slice().reverse().flatMap(s=>Array.isArray(s?.content)?s.content:[]):[];const c=i.find(s=>s?.type===A&&typeof s.data==="string");if(!c)throw new Error("Gemini API response did not contain generated "+A+" data");return{block:c,interactionId:a.id||a.interaction?.id||null}}
`;
if (!main.includes('const geminiApiKeyPath=')) main = replaceOnce(main, 'class Ua{', `${secureStore}class Ua{`, 'Gemini secure store/helpers');

main = replaceOnce(main,
  'if(!e.accountId)throw new p("AUTH_REQUIRED","Choose a Google Flow account for this job",!0);',
  'if(!e.accountId&&!await readGeminiApiKey())throw new p("AUTH_REQUIRED","Choose a Google Flow account or configure the Gemini API key in Settings",!0);',
  'allow API-key-only jobs');

const oldRunJob = 'async runJob(e,t){await this.validateJob(e);const A=this.getBrowserSession(e.accountId);const _isFlowCompat=(this.providerId==="banana"||this.providerId==="veo3")&&(A.providerId==="banana"||A.providerId==="veo3");if(A.providerId!==this.providerId&&!_isFlowCompat)throw new p("PROVIDER_REJECTED",`Selected account does not belong to Google Flow ${this.providerId==="banana"?"Image":"Video"}`);if(A.authStatus!=="Logged In")throw new p("AUTH_REQUIRED","Login to the selected Google Flow account first",!0);if(this.providerId==="veo3"){if(!this.videoRpcClient)throw new p("PROVIDER_REJECTED","Google Flow Video RPC client is unavailable");return this.runVideoJobViaRpc(e,t,A)}if(!this.imageRpcClient)throw new p("PROVIDER_REJECTED","Google Flow Image RPC client is unavailable");return this.runImageJobViaRpc(e,t,A)}';
const newRunJob = 'async runJob(e,t){await this.validateJob(e);const geminiKey=await readGeminiApiKey();if(geminiKey){return this.providerId==="veo3"?this.runVideoJobViaGemini(e,t,geminiKey):this.runImageJobViaGemini(e,t,geminiKey)}const A=this.getBrowserSession(e.accountId);const _isFlowCompat=(this.providerId==="banana"||this.providerId==="veo3")&&(A.providerId==="banana"||A.providerId==="veo3");if(A.providerId!==this.providerId&&!_isFlowCompat)throw new p("PROVIDER_REJECTED",`Selected account does not belong to Google Flow ${this.providerId==="banana"?"Image":"Video"}`);if(A.authStatus!=="Logged In")throw new p("AUTH_REQUIRED","Login to the selected Google Flow account first",!0);if(this.providerId==="veo3"){if(!this.videoRpcClient)throw new p("PROVIDER_REJECTED","Google Flow Video RPC client is unavailable");return this.runVideoJobViaRpc(e,t,A)}if(!this.imageRpcClient)throw new p("PROVIDER_REJECTED","Google Flow Image RPC client is unavailable");return this.runImageJobViaRpc(e,t,A)}';
main = replaceOnce(main, oldRunJob, newRunJob, 'Gemini API generation dispatch');

const geminiMethods = `async buildGeminiInput(e,t){
const A=[{type:"text",text:this.readPrompt(e)}],o=this.readReferenceAssetIds(e);let n=0;
for(const a of o){const{asset:s,bytes:i}=await this.assets.readAssetBytes(a),c=s.mimeType||"image/jpeg";if(!c.startsWith("image/"))throw new Error("Gemini API reference must be an image: "+s.name);n+=i.length;if(n>14*1024*1024)throw new Error("Gemini API reference images exceed the 14 MB limit needed for inline API requests");A.push({type:"image",mime_type:c,data:i.toString("base64")})}
let roleText="";if(t==="Frames"&&o.length>=2)roleText="<FIRST_FRAME> <IMAGE_REF_0> <LAST_FRAME> <IMAGE_REF_1>. Use any additional reference images in order. ";else if(e.type==="Video"&&o.length===1)roleText="<FIRST_FRAME> <IMAGE_REF_0>. ";else if(o.length)roleText="Use the reference images "+o.map((a,s)=>"<IMAGE_REF_"+s+">").join(", ")+" in that order. ";
if(e.type==="Video"){const s=parseFloat(String(e.payload?.duration||""));if(Number.isFinite(s)&&s>0)roleText+="Generate approximately "+s+" seconds of video. "}
if(roleText)A[0].text=roleText+A[0].text;return A
}async runImageJobViaGemini(e,t,A){t.updateProgress(10,"Preparing image request for Gemini API");const o=await this.buildGeminiInput(e),n=["1:1","1:4","1:8","2:3","3:2","3:4","4:1","4:3","4:5","5:4","8:1","9:16","16:9","21:9"].includes(e.payload?.ratio)?e.payload.ratio:"1:1";const a=await callGeminiInteraction({model:"gemini-nano-banana-2.1",input:o,response_format:{type:"image",mime_type:"image/png",aspect_ratio:n,image_size:"2K"}},A,"image",t.signal);t.updateProgress(85,"Saving generated image");const s=await this.assets.cacheGeneratedBytes(e,{bytes:Buffer.from(a.block.data,"base64"),mimeType:a.block.mime_type||"image/png"});t.updateProgress(96,"Image ready");return{assets:[s],provider:{operationId:a.interactionId,raw:{model:"gemini-nano-banana-2.1",aspectRatio:n,referenceCount:this.readReferenceAssetIds(e).length,provider:"gemini-api"}}}}
async runVideoJobViaGemini(e,t,A){t.updateProgress(8,"Preparing video request for Gemini API");const o=this.readVideoMode(e),n=await this.buildGeminiInput(e,o),a=typeof e.payload?.ratio==="string"&&e.payload.ratio==="9:16"?"9:16":"16:9",s={type:"video",aspect_ratio:a},i=String(e.payload?.resolution||"").toLowerCase();if(["360p","720p","1080p","4k"].includes(i))s.resolution=i;t.updateProgress(25,"Generating video with Gemini Omni Flash");const c=await callGeminiInteraction({model:"gemini-omni-1.1-flash",input:n,response_format:s},A,"video",t.signal);t.updateProgress(88,"Saving generated video");const g=await this.assets.cacheGeneratedVideoBytes(e,{bytes:Buffer.from(c.block.data,"base64"),mimeType:c.block.mime_type||"video/mp4"});t.updateProgress(96,"Video ready");return{assets:[g],provider:{operationId:c.interactionId,raw:{model:"gemini-omni-1.1-flash",aspectRatio:a,resolution:s.resolution||"720p",mode:o,referenceCount:this.readReferenceAssetIds(e).length,provider:"gemini-api"}}}}`;
const geminiStart = main.indexOf('async buildGeminiInput(e,t){');
const rpcStart = main.indexOf('async runImageJobViaRpc(e,t,A){', geminiStart);
if (geminiStart >= 0 && rpcStart > geminiStart) main = main.slice(0, geminiStart) + geminiMethods + main.slice(rpcStart);
else main = replaceOnce(main, 'async runImageJobViaRpc(e,t,A){', `${geminiMethods}async runImageJobViaRpc(e,t,A){`, 'Gemini image/video API methods');

const settingsHandlers = 'E.handle("settings:getGeminiApiKeyStatus",async A=>{C(A);return{configured:!!(await readGeminiApiKey())}}),E.handle("settings:setGeminiApiKey",async(A,o)=>{if(C(A),typeof o!=="string"||o.length>512)throw new Error("Gemini API key must be a string up to 512 characters");return{configured:await writeGeminiApiKey(o.trim())}}),';
if (!main.includes('settings:getGeminiApiKeyStatus')) main = replaceOnce(main, 'E.handle("settings:getConcurrency"', `${settingsHandlers}E.handle("settings:getConcurrency"`, 'Gemini API key IPC handlers');
main = replaceOnce(main,
  'function dd(r){if(r.providerId!=="veo3"||r.type!=="Video")return r;',
  'function dd(r){if(global.__aiforgeGeminiApiEnabled||r.providerId!=="veo3"||r.type!=="Video")return r;',
  'bypass Flow catalog mapping when Gemini API is active');
if (!main.includes('function JB(r){if(!ce.canClaimQueueJobSync(r))return!1;if(global.__aiforgeGeminiApiEnabled')) main = replaceOnce(main,
  'function JB(r){if(!ce.canClaimQueueJobSync(r))return!1;',
  'function JB(r){if(!ce.canClaimQueueJobSync(r))return!1;if(global.__aiforgeGeminiApiEnabled&&(r.providerId==="banana"||r.providerId==="veo3")&&(r.type==="Image"||r.type==="Video"))return!0;',
  'allow Gemini API jobs to claim queue slots without Flow login');
if (!main.includes('function jB(r,e){if(global.__aiforgeGeminiApiEnabled')) main = replaceOnce(main,
  'function jB(r,e){const t=HB(r),A=T.listJobSessions(r.providerId,r.type,{includeApiRecoveryCooldown:!0});',
  'function jB(r,e){if(global.__aiforgeGeminiApiEnabled&&(r.providerId==="banana"||r.providerId==="veo3"))return{accountId:null,account:"Gemini API"};const t=HB(r),A=T.listJobSessions(r.providerId,r.type,{includeApiRecoveryCooldown:!0});',
  'bypass browser auto-account selection for Gemini API jobs');
if (!main.includes('$B(r){if(!global.__aiforgeGeminiApiEnabled&&')) main = replaceOnce(main,
  'async function $B(r){if(r.providerId==="veo3"&&r.type==="Video"){',
  'async function $B(r){if(!global.__aiforgeGeminiApiEnabled&&r.providerId==="veo3"&&r.type==="Video"){',
  'skip Flow video catalog validation before Gemini API jobs');
main = replaceOnce(main,
  'async function VB(r){return r.providerId!=="veo3"||r.type!=="Video"?r:(await we.refreshIfDue(),dd(r))}',
  'async function VB(r){if(r.providerId!=="veo3"||r.type!=="Video")return r;if(await readGeminiApiKey())return r;await we.refreshIfDue();return dd(r)}',
  'skip Flow catalog refresh for Gemini single jobs');
if (!main.includes('(await readGeminiApiKey())||await we.refreshIfDue()')) main = replaceOnce(main,
  'await we.refreshIfDue();const n=[],a=new Map;',
  '(await readGeminiApiKey())||await we.refreshIfDue();const n=[],a=new Map;',
  'skip Flow catalog refresh when batch uses Gemini');
main = replaceOnce(main,
  'const A=vr(e.payload,this.getVideoCatalog?.()),o=this.readVideoMode(e),n=Zm(o,this.readReferenceAssetIds(e));',
  'const o=this.readVideoMode(e),n=Zm(o,this.readReferenceAssetIds(e)),A=await readGeminiApiKey()?{maxReferenceImages:qa,modelName:"Gemini Omni Flash"}:vr(e.payload,this.getVideoCatalog?.());',
  'skip Flow model catalog validation for Gemini jobs');
main = replaceOnce(main,
  'async function readGeminiApiKey(){if(!je.isEncryptionAvailable())throw new Error("Windows secure storage is unavailable; Gemini API key was not read");try{return je.decryptString(await Se(geminiApiKeyPath()))}catch(e){if(e?.code==="ENOENT")return"";throw new Error("Could not decrypt the saved Gemini API key. Save it again in Settings.")}}',
  'async function readGeminiApiKey(){if(!je.isEncryptionAvailable())throw new Error("Windows secure storage is unavailable; Gemini API key was not read");try{const e=je.decryptString(await Se(geminiApiKeyPath()));global.__aiforgeGeminiApiEnabled=!!e;return e}catch(e){if(e?.code==="ENOENT"){global.__aiforgeGeminiApiEnabled=!1;return""}throw new Error("Could not decrypt the saved Gemini API key. Save it again in Settings.")}}',
  'cache Gemini API state for synchronous batch normalization');
main = replaceOnce(main,
  'async function writeGeminiApiKey(e){if(!je.isEncryptionAvailable())throw new Error("Windows secure storage is unavailable; cannot save Gemini API key");const t=geminiApiKeyPath();if(!e){await De(t).catch(()=>{});return!1}await rt(Te(t),{recursive:!0});const A=t+".tmp";await Ke(A,je.encryptString(e),{mode:384});await at(A,t);return!0}',
  'async function writeGeminiApiKey(e){if(!je.isEncryptionAvailable())throw new Error("Windows secure storage is unavailable; cannot save Gemini API key");const t=geminiApiKeyPath();if(!e){await De(t).catch(()=>{});global.__aiforgeGeminiApiEnabled=!1;return!1}await rt(Te(t),{recursive:!0});const A=t+".tmp";await Ke(A,je.encryptString(e),{mode:384});await at(A,t);global.__aiforgeGeminiApiEnabled=!0;return!0}',
  'update cached Gemini mode when key is saved or removed');
if (!main.includes('await readGeminiApiKey().catch(()=>""),oe.start()')) main = replaceOnce(main,
  'we.refreshIfDue(!0),oe.start()',
  'we.refreshIfDue(!0),await readGeminiApiKey().catch(()=>""),oe.start()',
  'load Gemini API configuration before starting queue workers');
write(mainPath, main);

let preload = read(preloadPath);
if (!preload.includes('getGeminiApiKeyStatus:')) preload = replaceOnce(preload,
  'w={getConcurrency:()=>r.ipcRenderer.invoke("settings:getConcurrency"),updateConcurrency:e=>r.ipcRenderer.invoke("settings:updateConcurrency",e),setAutoDownloadConfig:e=>r.ipcRenderer.invoke("settings:setAutoDownloadConfig",e)}',
  'w={getConcurrency:()=>r.ipcRenderer.invoke("settings:getConcurrency"),updateConcurrency:e=>r.ipcRenderer.invoke("settings:updateConcurrency",e),getGeminiApiKeyStatus:()=>r.ipcRenderer.invoke("settings:getGeminiApiKeyStatus"),setGeminiApiKey:e=>r.ipcRenderer.invoke("settings:setGeminiApiKey",e),setAutoDownloadConfig:e=>r.ipcRenderer.invoke("settings:setAutoDownloadConfig",e)}',
  'preload settings API');
write(preloadPath, preload);

let settings = read(settingsPath);
if (!settings.includes('[geminiInput,setGeminiInput]')) settings = replaceOnce(settings,
  '[l,p]=d.useState("idle");d.useEffect',
  '[l,p]=d.useState("idle"),[geminiInput,setGeminiInput]=d.useState(""),[geminiBusy,setGeminiBusy]=d.useState(!1),[geminiConfigured,setGeminiConfigured]=d.useState(!1);d.useEffect',
  'Gemini settings React state');
if (!settings.includes('const saveGeminiKey=')) settings = replaceOnce(settings,
  'const g=d.useMemo(()=>o!==null&&JSON.stringify(n)!==JSON.stringify(o),[o,n])',
  'd.useEffect(()=>{let a=!0;const c=window.aiforge?.settings;c?.getGeminiApiKeyStatus?.().then(u=>{a&&setGeminiConfigured(!!u?.configured)}).catch(()=>{a&&setGeminiConfigured(!1)});return()=>{a=!1}},[]);const saveGeminiKey=async()=>{const a=window.aiforge?.settings;if(!a)return;setGeminiBusy(!0);try{await a.setGeminiApiKey(geminiInput);setGeminiInput("");setGeminiConfigured(!!geminiInput.trim())}finally{setGeminiBusy(!1)}};const clearGeminiKey=async()=>{const a=window.aiforge?.settings;if(!a)return;setGeminiBusy(!0);try{await a.setGeminiApiKey("");setGeminiConfigured(!1)}finally{setGeminiBusy(!1)}};const g=d.useMemo(()=>o!==null&&JSON.stringify(n)!==JSON.stringify(o),[o,n])',
  'Gemini settings status/save actions');
if (!settings.includes('Could not save Gemini API key')) settings = replaceOnce(settings,
  'setGeminiConfigured(!!geminiInput.trim())}finally{setGeminiBusy(!1)}};const clearGeminiKey',
  'setGeminiConfigured(!!geminiInput.trim())}catch(a){window.alert(String(a?.message||"Could not save Gemini API key"))}finally{setGeminiBusy(!1)}};const clearGeminiKey',
  'show Gemini API key save errors');
if (!settings.includes('Could not remove Gemini API key')) settings = replaceOnce(settings,
  'setGeminiConfigured(!1)}finally{setGeminiBusy(!1)}};const g=d.useMemo',
  'setGeminiConfigured(!1)}catch(a){window.alert(String(a?.message||"Could not remove Gemini API key"))}finally{setGeminiBusy(!1)}};const g=d.useMemo',
  'show Gemini API key removal errors');
const apiSettingsSection = 'e.jsxs("section",{className:"overflow-hidden rounded-xl border border-border-primary bg-bg-secondary/55 p-4 shadow-sm",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-sm font-bold text-text-primary",children:s==="vi"?"Gemini API chính thức":"Official Gemini API"}),e.jsx("p",{className:"mt-1 text-xs text-text-muted",children:s==="vi"?"Khi đã lưu API key, các job Banana/Veo3 sẽ chạy qua Gemini API và tính phí theo tài khoản Google AI Studio. Browser Hub vẫn dùng cho các nhà cung cấp khác.":"When an API key is saved, Banana/Veo3 jobs use Gemini API and are billed to Google AI Studio. Browser Hub remains available for other providers."})]}),e.jsxs("div",{className:"mt-3 flex flex-wrap items-center gap-2",children:[e.jsx("input",{type:"password",autoComplete:"off",value:geminiInput,onChange:a=>setGeminiInput(a.target.value),placeholder:s==="vi"?"Dán Gemini API key vào đây":"Paste Gemini API key here",className:"min-w-[280px] flex-1 rounded-lg border border-border-primary bg-bg-input px-3 py-2 text-xs text-text-primary outline-none focus:border-accent"}),e.jsx("button",{type:"button",disabled:geminiBusy||!geminiInput.trim(),onClick:saveGeminiKey,className:"rounded-lg bg-accent px-3 py-2 text-xs font-bold text-white disabled:opacity-50",children:geminiBusy?(s==="vi"?"Đang lưu…":"Saving…"):(s==="vi"?"Lưu API key":"Save API key")}),geminiConfigured&&e.jsx("button",{type:"button",disabled:geminiBusy,onClick:clearGeminiKey,className:"rounded-lg border border-border-primary px-3 py-2 text-xs font-semibold text-text-secondary disabled:opacity-50",children:s==="vi"?"Xóa key":"Remove key"})]}),e.jsx("p",{className:"mt-2 text-[11px] text-text-muted",children:geminiConfigured?(s==="vi"?"API key đã được mã hóa và lưu trên máy này.":"API key is encrypted and stored on this device."):(s==="vi"?"Chưa cấu hình; app tiếp tục dùng Browser Hub/Flow như hiện tại.":"Not configured; the app continues using Browser Hub/Flow as before.")})]})';
if (!settings.includes('Official Gemini API')) settings = replaceOnce(settings,
  'l==="error"&&e.jsx("div",{role:"alert"',
  `${apiSettingsSection},l==="error"&&e.jsx("div",{role:"alert"`,
  'Gemini API key settings UI');
write(settingsPath, settings);

console.log('Gemini Interactions API adapter patched in main, preload, and Settings.');
