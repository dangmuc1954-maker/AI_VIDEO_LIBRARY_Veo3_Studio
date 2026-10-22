const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const pristinePath = path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Khach_Hang_v3.0/resources/app/out/renderer/assets/VideoStudio-BZY_1pM8.js');
let code = fs.readFileSync(pristinePath, 'utf8');

// Load clean snippets
const bannerCode = fs.readFileSync('scripts/test_clean_banner.js', 'utf8');
const bannerSnippet = bannerCode.slice(bannerCode.indexOf('const topToolbarBannerClean = `') + 31, bannerCode.indexOf('`;\n\nfs.writeFileSync'));

const inspectorCode = fs.readFileSync('scripts/test_clean_inspector.js', 'utf8');
const inspectorSnippet = inspectorCode.slice(inspectorCode.indexOf('const newInspectorSectionClean = `') + 34, inspectorCode.indexOf('`;\n\nfs.writeFileSync'));

// Splicing 1: Top Toolbar Banner between header anchor and table anchor
const headerAnchor = 'e.jsx("span",{children:sr($,"video")})]})]}),';
const tableAnchor = 'e.jsx("div",{ref:w,className:"max-h-[312px] overflow-auto"';

const hIdx = code.indexOf(headerAnchor);
const tIdx = code.indexOf(tableAnchor);

if (hIdx === -1 || tIdx === -1) {
  console.error('Anchors not found in pristine code! hIdx:', hIdx, 'tIdx:', tIdx);
  process.exit(1);
}

code = code.slice(0, hIdx + headerAnchor.length) + bannerSnippet + ',' + code.slice(tIdx);

// Splicing 2: Inspector Section before Prompt section in function cn
const cnIdx = code.indexOf('function cn(');
const promptSectionAnchor = 'e.jsxs("section",{className:"flex flex-col gap-1.5 rounded-lg border border-border-primary bg-bg-primary/25 p-3",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("label",{className:"text-[9px] font-bold text-text-muted uppercase tracking-wider select-none",children:"Prompt"})';
const pIdx = code.indexOf(promptSectionAnchor, cnIdx);

if (pIdx === -1) {
  console.error('promptSectionAnchor not found in pristine code! pIdx:', pIdx);
  process.exit(1);
}

code = code.slice(0, pIdx) + inspectorSnippet + ',' + code.slice(pIdx);

// Splicing 3: Default TTS scene initialization in kt()
const oldKt1 = 'negativePrompt:s?.negativePrompt||"",referenceAssetIds:[]}}';
const newKt1 = 'negativePrompt:s?.negativePrompt||"",tts:s?.tts||{enabled:!1,voiceId:"aN7cv9yXNrfIR87bDmyD",voiceName:"Ninh Đôn – Deep & Warm (Tiếng Việt)",script:"",modelId:"eleven_multilingual_v2"},referenceAssetIds:[]}}';
if (code.includes(oldKt1)) {
  code = code.replace(oldKt1, newKt1);
  console.log('✓ Scene tts default config added to kt()');
}

// Splicing 4: Grok & Veo3 payload TTS fallback
const grokOldPattern = /tts:f\.tts\?\.enabled&&f\.tts\?\.script\?\.trim\(\)\?\{enabled:!0,voiceId:f\.tts\.voiceId\|\|"aN7cv9yXNrfIR87bDmyD",voiceName:f\.tts\.voiceName\|\|"Ninh Đôn – Deep & Warm",script:f\.tts\.script\.trim\(\),modelId:f\.tts\.modelId\|\|"eleven_multilingual_v2"\}:void 0/g;
const grokNewPattern = `tts:f.tts?.enabled&&(f.tts?.script?.trim()||f.prompt?.trim())?{enabled:!0,voiceId:(f.tts.voiceId||"").trim()||"aN7cv9yXNrfIR87bDmyD",voiceName:(f.tts.voiceName||"").trim()||"Ninh Đôn – Deep & Warm (Tiếng Việt)",script:(f.tts?.script?.trim()||f.prompt?.trim()||""),modelId:(f.tts.modelId||"").trim()||"eleven_multilingual_v2"}:void 0`;
code = code.replace(grokOldPattern, grokNewPattern);

fs.writeFileSync('temp_full_validated.mjs', code);
try {
  execSync('node --check temp_full_validated.mjs', { stdio: 'inherit' });
  console.log('\n🌟🌟🌟 FULL VIDEOSTUDIO MODULE IS 100% VALID SYNTAX! 🌟🌟🌟');
} catch (e) {
  console.error('\n❌ Syntax error in transformed module:', e.message);
} finally {
  try { fs.unlinkSync('temp_full_validated.mjs'); } catch (_) {}
}
