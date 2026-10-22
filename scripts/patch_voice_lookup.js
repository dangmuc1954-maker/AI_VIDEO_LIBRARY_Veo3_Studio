const fs = require('fs');
const path = require('path');

console.log('=== STARTING ELEVENLABS VOICE ID RECOGNITION & DROPDOWN FIX ===');

// Standard ElevenLabs voices dictionary for instant offline resolution
const STANDARD_ELEVENLABS_VOICES = {
  "21m00Tcm4TlvDq8ikWAM": { name: "Rachel - Calm, Conversational", language: "English" },
  "2EiwWnXFnvU5JabPnv8n": { name: "Clyde - Veteran, Gritty", language: "English" },
  "AZnzlk1XvdvUeBnXmlld": { name: "Domi - Strong, Engaging", language: "English" },
  "CYw3kZ02Hs0563khs1Fj": { name: "Dave - Conversational, Video Games", language: "English" },
  "CwhRBWXzGAHq8TQ4Fs17": { name: "Roger - Laid-Back, Casual, Resonant", language: "English" },
  "D38z5RcWu1voky8WS1ja": { name: "Fin - Sailor, Intense", language: "English" },
  "EXAVITQu4vr4xnSDxMaL": { name: "Sarah - Mature, Reassuring, Confident", language: "English" },
  "ErXwobaYiN019PkySvjV": { name: "Antoni - Well-Rounded, Balanced", language: "English" },
  "FGY2WhTYpPnrIDTdsKH5": { name: "Laura - Enthusiast, Quirky Attitude", language: "English" },
  "GBv7mTt0atIp3Br8iCZE": { name: "Thomas - Calm, Smooth", language: "English" },
  "IKne3meq5aSn9XLyUdCD": { name: "Charlie - Deep, Confident, Energetic", language: "English" },
  "JBFqnCBsd6RMkjVDRZzb": { name: "George - Warm, Captivating Storyteller", language: "English" },
  "LcfcDJNigLRLTBlGangU": { name: "Emily - Calm, Gentle", language: "English" },
  "MF3mGyEYCl7XYWbV9V6O": { name: "Elli - Young, Sweet", language: "English" },
  "N2lVS1w4EtoT3dr4eOWO": { name: "Callum - Husky Trickster", language: "English" },
  "ODq5zmih8GrVes37Dizd": { name: "Patrick - Shouty, Energetic", language: "English" },
  "SOYHLrjzK2X1ezoPC6cr": { name: "Harry - Fierce Warrior", language: "English" },
  "TX3LPaxmHKxFdv7VOQHJ": { name: "Liam - Energetic, Social Media Creator", language: "English" },
  "ThT5KcBeYPX3keUQqHPh": { name: "Dorothy - Pleasant, Storytelling", language: "English" },
  "TxGEqnHWrfWFTfGW9XjX": { name: "Josh - Deep, Narrator", language: "English" },
  "VR6AewLTigWG4xSOukaG": { name: "Arnold - Heavy, Serious", language: "English" },
  "XB0fDUnXU5powFXDhCwa": { name: "Charlotte - Seductive, Confident", language: "English" },
  "Xb7hH8MSUJpSbSDYk0k2": { name: "Alice - Clear, Engaging Educator", language: "English" },
  "XrExE9yKIg1WjnnlVkGX": { name: "Matilda - Friendly, Warm", language: "English" },
  "bVMeCyTHy58xNoL34h3p": { name: "Jeremy - Excited, Irish Accent", language: "English" },
  "cgSgspJ2msm6clMCkdW9": { name: "Jessica - Playful, Warm", language: "English" },
  "cjVigY5qzO86Huf0OWal": { name: "Eric - Friendly, Grounded", language: "English" },
  "iP95p4xoKVk53GoZ742B": { name: "Chris - Charming, Relaxed", language: "English" },
  "jsCqWAovK2LkecY7zXl4": { name: "Freya - Expressive, Adventurous", language: "English" },
  "nPczCjzI2devNBz1zQrb": { name: "Brian - Deep, Melodic, Resonant", language: "English" },
  "onwK4e9ZLuTAKqWW03F9": { name: "Daniel - Authoritative, News", language: "English" },
  "pFZP5JQG7iQjIQuC4Bku": { name: "Lily - Warm, Narrative", language: "English" },
  "pqHfZKP75CvOlQylNhV4": { name: "Bill - Trustworthy, Classic", language: "English" },
  "aN7cv9yXNrfIR87bDmyD": { name: "Nam Bác - Deep & Warm (Default VN)", language: "Vietnamese" }
};

// 1. Patch WaveSurferPlayer-D-cjCZYq.js
function patchWaveSurfer(filePath) {
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');

  // Patch bt: ensures voiceName is never empty
  const oldBt = 'function bt(n,e="Auto"){return{voiceName:n.voiceName,voiceId:n.voiceId,language:Ye(n.locale||n.language,e)}}';
  const newBt = 'function bt(n,e="Auto"){const vName=(n?.voiceName||n?.name||"").trim()||(n?.voiceId?`Voice (${n.voiceId.slice(0,6)}...${n.voiceId.slice(-4)})`:"Custom Voice");return{voiceName:vName,voiceId:n?.voiceId,language:Ye(n?.locale||n?.language,e)}}';
  if (code.includes(oldBt)) {
    code = code.replace(oldBt, newBt);
    console.log(`[+] Patched bt in ${path.basename(filePath)}`);
  }

  // Patch ze: accepts voiceName fallback if name is present or builds from voiceId
  const oldZe = 'function ze(n){if(!n||typeof n!="object")return null;const e=n,t=typeof e.voiceId=="string"&&e.voiceId.trim()?e.voiceId.trim():void 0,i=typeof e.name=="string"&&e.name.trim()?e.name.trim():void 0,s=typeof e.voiceName=="string"&&e.voiceName.trim()?e.voiceName.trim():i;return!t||!s?null:{source:"shared",voiceId:t,voiceName:s,';
  const newZe = 'function ze(n){if(!n||typeof n!="object")return null;const e=n,t=typeof e.voiceId=="string"&&e.voiceId.trim()?e.voiceId.trim():void 0,i=typeof e.name=="string"&&e.name.trim()?e.name.trim():void 0,s=typeof e.voiceName=="string"&&e.voiceName.trim()?e.voiceName.trim():i||(t?`Voice (${t.slice(0,6)}...${t.slice(-4)})`:void 0);return!t||!s?null:{source:"shared",voiceId:t,voiceName:s,';
  if (code.includes(oldZe)) {
    code = code.replace(oldZe, newZe);
    console.log(`[+] Patched ze in ${path.basename(filePath)}`);
  }

  // Patch Ve (Lt): makes sure saved voices without voiceName get a fallback name
  const oldVe = 'function Ve(n){const e=new Map,t=new Set(Y.map(i=>i.voiceId));return[...Y,...n.filter(i=>!t.has(i.voiceId))].forEach(i=>{i.voiceId&&e.set(i.voiceId,i)}),Array.from(e.values())}';
  const newVe = 'function Ve(n){const e=new Map,t=new Set(Y.map(i=>i.voiceId));return[...Y,...(Array.isArray(n)?n:[]).filter(i=>i&&i.voiceId&&!t.has(i.voiceId))].forEach(i=>{if(i&&i.voiceId){if(!i.voiceName)i.voiceName=i.name||`Voice (${i.voiceId.slice(0,6)}...${i.voiceId.slice(-4)})`;e.set(i.voiceId,i)}}),Array.from(e.values())}';
  if (code.includes(oldVe)) {
    code = code.replace(oldVe, newVe);
    console.log(`[+] Patched Ve in ${path.basename(filePath)}`);
  }

  // Patch saveVoice in ht: ensures saving any voice with voiceId immediately persists and updates state
  const oldSaveVoice = 'saveVoice:t=>{const i=Y.find(r=>r.voiceId===t.voiceId);if(i)return i;const s=$e(t,i);return n(r=>{const o=[s,...r.savedVoices.filter(a=>a.voiceId!==s.voiceId)];return Se(o),{savedVoices:o}}),s}';
  const newSaveVoice = 'saveVoice:t=>{if(!t||typeof t!="object")return t;const vId=(typeof t.voiceId=="string"?t.voiceId.trim():"")||(typeof t.id=="string"?t.id.trim():"");if(!vId)return t;const vName=(typeof t.voiceName=="string"?t.voiceName.trim():"")||(typeof t.name=="string"?t.name.trim():"")||`Voice (${vId.slice(0,6)}...${vId.slice(-4)})`;const s={...t,voiceId:vId,voiceName:vName,source:"shared",savedAt:new Date().toISOString()};const i=Y.find(r=>r.voiceId===vId);if(i)return i;return n(r=>{const prev=Array.isArray(r.savedVoices)?r.savedVoices:[];const o=[s,...prev.filter(a=>a&&a.voiceId!==vId)];return Se(o),{savedVoices:o}}),s}';
  if (code.includes(oldSaveVoice)) {
    code = code.replace(oldSaveVoice, newSaveVoice);
    console.log(`[+] Patched saveVoice in ${path.basename(filePath)}`);
  }

  fs.writeFileSync(filePath, code, 'utf8');
}

// 2. Patch TTSStudio-C_2cGcBA.js
function patchTTSStudio(filePath) {
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');

  // Patch ut: smart voice ID parser + lookup + custom name support
  const oldUtRegex = /ut=async\s*\([^)]*\)\s*=>\s*\{[\s\S]*?finally\s*\{\s*J\.current\s*=\s*null\s*\}\s*\}/;
  const newUt = `ut=async(t,l)=>{
    let rawStr = (l||"").trim();
    if(!rawStr||J.current===rawStr)return;
    let customName = "";
    let u = rawStr;
    // Smart parse: "Name - ID" or "ID (Name)" or "ID: Name"
    if (rawStr.includes(" - ")) {
      const parts = rawStr.split(" - ");
      if (parts[1] && parts[1].trim().length >= 15) { customName = parts[0].trim(); u = parts[1].trim(); }
      else if (parts[0] && parts[0].trim().length >= 15) { u = parts[0].trim(); customName = parts[1].trim(); }
    } else if (rawStr.includes(" | ")) {
      const parts = rawStr.split(" | ");
      if (parts[1] && parts[1].trim().length >= 15) { customName = parts[0].trim(); u = parts[1].trim(); }
      else if (parts[0] && parts[0].trim().length >= 15) { u = parts[0].trim(); customName = parts[1].trim(); }
    } else if (rawStr.includes("(") && rawStr.includes(")")) {
      const idPart = rawStr.replace(/\\([^)]+\\)/, "").trim();
      const namePart = (rawStr.match(/\\(([^)]+)\\)/) || [])[1];
      if (idPart.length >= 15) { u = idPart; customName = (namePart || "").trim(); }
    }
    const b=E.find(k=>k.id===t),N=te.find(k=>k.voiceId===u);
    if(N && !customName){
      if(b?.voiceId===N.voiceId&&b.voiceName===N.voiceName)return;
      const vName=N.voiceName||N.name||('Voice ('+u.slice(0,6)+'...'+u.slice(-4)+')');
      I(t,{...ge(N,b?.language),voiceId:N.voiceId,voiceName:vName});
      K({promptId:t,status:"success",message:vName+' is ready.'});
      B.success('Voice "'+vName+'" selected from saved voices.');
      return;
    }
    J.current=u;
    K({promptId:t,status:"loading",message:"Loading voice..."});
    try{
      let k=null;
      if(window.aiforge?.tts?.lookupSharedVoice){
        try{k=await window.aiforge.tts.lookupSharedVoice(u)}catch(err){console.warn("Lookup notice:",err)}
      }
      const rawName=customName || (k&&(k.voiceName||k.name))||"";
      const finalVoiceName=rawName?rawName:('Voice ('+u.slice(0,6)+'...'+u.slice(-4)+')');
      const voiceObj={...(k||{}),voiceId:u,voiceName:finalVoiceName,language:(k&&k.language)||"Auto",source:"shared"};
      const M=A(voiceObj);
      const resName=M?.voiceName||finalVoiceName;
      I(t,{...ge(M||voiceObj,b?.language),voiceId:u,voiceName:resName});
      K({promptId:t,status:"success",message:resName+' saved.'});
      B.success('Loaded and saved ElevenLabs voice "'+resName+'".');
    }catch(k){
      const M=k instanceof Error?k.message:"Unable to load ElevenLabs voice.";
      K({promptId:t,status:"error",message:M});
      B.error(M);
    }finally{
      J.current=null;
    }
  }`;

  if (oldUtRegex.test(code)) {
    code = code.replace(oldUtRegex, newUt);
    console.log(`[+] Patched ut with Smart Parser in ${path.basename(filePath)}`);
  }

  // Add editable Voice Name field in inspector panel right below Voice ID input
  const oldVoiceIdSection = 'disabled:D||!(s.voiceId||"").trim(),onClick:()=>void d(s.id,s.voiceId),className:"absolute right-1 top-1 bottom-1 cursor-pointer rounded bg-bg-primary/75 border border-border-primary/80 px-2 text-[10px] font-medium text-text-secondary transition-colors hover:border-accent/45 hover:text-accent disabled:cursor-not-allowed disabled:opacity-50",children:D?"...":"Load"})]})]})]}),';
  const newVoiceIdSection = 'disabled:D||!(s.voiceId||"").trim(),onClick:()=>void d(s.id,s.voiceId),className:"absolute right-1 top-1 bottom-1 cursor-pointer rounded bg-bg-primary/75 border border-border-primary/80 px-2 text-[10px] font-medium text-text-secondary transition-colors hover:border-accent/45 hover:text-accent disabled:cursor-not-allowed disabled:opacity-50",children:D?"...":"Load"})]}),e.jsxs("div",{className:"mt-2",children:[e.jsx("div",{className:"mb-1 text-xs font-semibold text-text-secondary",children:"Voice Name"}),e.jsx("input",{"aria-label":"Voice Name",value:s.voiceName||"",placeholder:"Enter custom voice name...",onChange:r=>{const vName=r.currentTarget.value;f(s.id,{voiceName:vName});const vId=(s.voiceId||"").trim();vId&&Mt.getState().saveVoice({voiceId:vId,voiceName:vName,source:"shared"})},className:"h-8 w-full min-w-0 rounded-md border border-border-primary bg-bg-primary/45 px-2 text-[11px] text-text-primary outline-none transition-colors focus:border-accent/50"})]})]})]}),';

  if (code.includes(oldVoiceIdSection)) {
    code = code.replace(oldVoiceIdSection, newVoiceIdSection);
    console.log(`[+] Added editable Voice Name field in ${path.basename(filePath)}`);
  }

  // Patch inspector dropdown renderValue and options:
  const oldInspRender = 'renderValue:e.jsx("span",{className:"truncate",children:s.voiceName})';
  const newInspRender = 'renderValue:e.jsx("span",{className:"truncate",children:s.voiceName||m.find(r=>r.voiceId===s.voiceId)?.voiceName||s.voiceId})';
  if (code.includes(oldInspRender)) {
    code = code.replace(oldInspRender, newInspRender);
    console.log(`[+] Patched inspector renderValue in ${path.basename(filePath)}`);
  }

  // In table row dropdown:
  const oldTableChange = 'x(o.id,{...R?ge(R,o.language):{voiceId:a}})';
  const newTableChange = 'x(o.id,{...R?ge(R,o.language):{voiceId:a,voiceName:a}})';
  if (code.includes(oldTableChange)) {
    code = code.replace(oldTableChange, newTableChange);
    console.log(`[+] Patched table onChange in ${path.basename(filePath)}`);
  }

  fs.writeFileSync(filePath, code, 'utf8');
}

// 3. Patch app/out/main/index.js
function patchMain(filePath) {
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');

  // Patch lookupElevenLabsSharedVoice in _n class
  const oldLookup = 'lookupElevenLabsSharedVoice(e){return this.getJson(`/v1/elevenlabs/shared-voices/${encodeURIComponent(e)}`)}';
  const newLookup = `async lookupElevenLabsSharedVoice(e){
    const stdDict = ${JSON.stringify(STANDARD_ELEVENLABS_VOICES)};
    if (stdDict[e]) {
      return { voiceId: e, voiceName: stdDict[e].name, language: stdDict[e].language, source: 'shared' };
    }
    try {
      const res = await this.getJson('/v1/elevenlabs/shared-voices/' + encodeURIComponent(e));
      if (res && (res.voiceName || res.name)) return res;
    } catch(err) {}
    try {
      const publicRes = await fetch('https://api.elevenlabs.io/v1/voices');
      if (publicRes.ok) {
        const data = await publicRes.json();
        const found = (data.voices || []).find(v => v.voice_id === e);
        if (found) {
          return { voiceId: found.voice_id, voiceName: found.name, previewUrl: found.preview_url, category: found.category, language: found.labels?.language || 'Auto', source: 'shared' };
        }
      }
    } catch(err) {}
    return { voiceId: e, voiceName: 'Voice (' + e.slice(0,6) + '...' + e.slice(-4) + ')', language: 'Auto', source: 'shared' };
  }`;

  if (code.includes(oldLookup)) {
    code = code.replace(oldLookup, newLookup);
    console.log(`[+] Patched lookupElevenLabsSharedVoice in ${path.basename(filePath)}`);
  }

  fs.writeFileSync(filePath, code, 'utf8');
}

// 4. Patch license_server/server.js & vercel_server/api/index.js
function patchServer(filePath) {
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');

  if (code.includes('/v1/elevenlabs/shared-voices/')) {
    console.log(`[-] Server already has shared-voices route: ${filePath}`);
    return;
  }

  const endpointCode = `
  // ElevenLabs Shared Voice Lookup Endpoint
  if (req.method === 'GET' && pathname.startsWith('/v1/elevenlabs/shared-voices/')) {
    const voiceId = decodeURIComponent(pathname.replace('/v1/elevenlabs/shared-voices/', '').trim());
    const stdDict = ${JSON.stringify(STANDARD_ELEVENLABS_VOICES)};
    if (stdDict[voiceId]) {
      return sendJson(res, 200, { voiceId: voiceId, voiceName: stdDict[voiceId].name, language: stdDict[voiceId].language, source: 'shared' });
    }
    try {
      const publicRes = await fetch('https://api.elevenlabs.io/v1/voices');
      if (publicRes.ok) {
        const data = await publicRes.json();
        const found = (data.voices || []).find(v => v.voice_id === voiceId);
        if (found) {
          return sendJson(res, 200, { voiceId: found.voice_id, voiceName: found.name, previewUrl: found.preview_url, category: found.category, language: found.labels?.language || 'Auto', source: 'shared' });
        }
      }
    } catch(err) {}
    return sendJson(res, 200, { voiceId: voiceId, voiceName: 'Voice (' + voiceId.slice(0,6) + '...' + voiceId.slice(-4) + ')', language: 'Auto', source: 'shared' });
  }
  `;

  // Insert before 404 handler
  if (code.includes("sendJson(res, 404, { error: 'Not Found' })") || code.includes("sendJson(res, 404")) {
    const target = "sendJson(res, 404";
    const idx = code.indexOf(target);
    const lastBrace = code.lastIndexOf('if', idx);
    code = code.slice(0, lastBrace) + endpointCode + '\n  ' + code.slice(lastBrace);
    fs.writeFileSync(filePath, code, 'utf8');
    console.log(`[+] Added shared-voices route to ${filePath}`);
  }
}

// Execute on all directories
const allDirs = [
  path.join(__dirname, '../extracted_original'),
  path.join(__dirname, '../app'),
  path.join(__dirname, '../dist/AIForge_Studio_Customer_Edition/resources/app'),
  path.join(__dirname, '../dist/AIForge_Studio_Khach_Hang_v3.0/resources/app'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app')
];

for (const dir of allDirs) {
  console.log(`\nScanning: ${dir}`);
  patchWaveSurfer(path.join(dir, 'out/renderer/assets/WaveSurferPlayer-D-cjCZYq.js'));
  patchTTSStudio(path.join(dir, 'out/renderer/assets/TTSStudio-C_2cGcBA.js'));
  patchMain(path.join(dir, 'out/main/index.js'));
}

console.log('\nScanning backend servers:');
patchServer(path.join(__dirname, '../license_server/server.js'));
patchServer(path.join(__dirname, '../vercel_server/api/index.js'));

console.log('\n=== ELEVENLABS VOICE ID FIX COMPLETE ===');
