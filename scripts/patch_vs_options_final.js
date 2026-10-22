const fs = require('fs');
const path = require('path');

const targetRoots = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../extracted_original'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Khach_Hang_v3.0/resources/app')
];

for (const root of targetRoots) {
  const vsPath = path.join(root, 'out/renderer/assets/VideoStudio-BZY_1pM8.js');
  if (!fs.existsSync(vsPath)) continue;
  let code = fs.readFileSync(vsPath, 'utf8');

  // Inspector dropdown
  const inspTarget = 'e.jsx("option", { value: "aN7cv9yXNrfIR87bDmyD", children: "Ninh Đôn (Tiếng Việt - Nam Trầm ấm, truyền cảm)" })';
  const inspReplacement = 'e.jsx("option", { value: "tQ4MEZFJOzsahSEEZtHK", children: "★ em gais xinh (Tiếng Việt - Nữ ngọt ngào, tự nhiên)" }),\n                ' + inspTarget;
  if (code.includes(inspTarget) && !code.includes('children: "★ em gais xinh (Tiếng Việt - Nữ ngọt ngào, tự nhiên)"')) {
    code = code.replace(inspTarget, inspReplacement);
    console.log('[+] Added em gais xinh to Inspector dropdown in', root);
  }

  // Topbar dropdown
  const topTarget = 'e.jsx("option", { value: "aN7cv9yXNrfIR87bDmyD", children: "Ninh Đôn (Tiếng Việt - Nam Trầm ấm)" })';
  const topReplacement = 'e.jsx("option", { value: "tQ4MEZFJOzsahSEEZtHK", children: "★ em gais xinh (Tiếng Việt - Nữ trẻ trung)" }),\n            ' + topTarget;
  if (code.includes(topTarget) && !code.includes('children: "★ em gais xinh (Tiếng Việt - Nữ trẻ trung)"')) {
    code = code.replace(topTarget, topReplacement);
    console.log('[+] Added em gais xinh to Topbar dropdown in', root);
  }

  // Also include eleven_v3 in Model dropdown
  const modelTarget = 'e.jsx("option", { value: "eleven_multilingual_v2", children: "multilingual v2" })';
  const modelReplacement = 'e.jsx("option", { value: "eleven_v3", children: "eleven_v3 (Thế hệ mới nhất)" }),\n                ' + modelTarget;
  if (code.includes(modelTarget) && !code.includes('value: "eleven_v3"')) {
    code = code.replace(modelTarget, modelReplacement);
    console.log('[+] Added eleven_v3 to Model dropdown in', root);
  }

  // Ensure default voice in state is tQ4MEZFJOzsahSEEZtHK
  const defaultVoiceOld = 'voiceId: n.tts?.voiceId || "aN7cv9yXNrfIR87bDmyD",\n                voiceName: n.tts?.voiceName || "Ninh Đôn – Deep & Warm (Tiếng Việt)"';
  const defaultVoiceNew = 'voiceId: n.tts?.voiceId || "tQ4MEZFJOzsahSEEZtHK",\n                voiceName: n.tts?.voiceName || "★ em gais xinh (Tiếng Việt - Nữ ngọt ngào, tự nhiên)"';
  if (code.includes(defaultVoiceOld)) {
    code = code.replace(defaultVoiceOld, defaultVoiceNew);
    console.log('[+] Updated default inspector voice to em gais xinh in', root);
  }

  const defaultTopOld = 'voiceId: d.tts?.voiceId || "aN7cv9yXNrfIR87bDmyD",\n                  voiceName: d.tts?.voiceName || "Ninh Đôn – Deep & Warm (Tiếng Việt)"';
  const defaultTopNew = 'voiceId: d.tts?.voiceId || "tQ4MEZFJOzsahSEEZtHK",\n                  voiceName: d.tts?.voiceName || "★ em gais xinh (Tiếng Việt - Nữ trẻ trung)"';
  if (code.includes(defaultTopOld)) {
    code = code.replace(defaultTopOld, defaultTopNew);
    console.log('[+] Updated default topbar voice to em gais xinh in', root);
  }

  fs.writeFileSync(vsPath, code, 'utf8');
}

console.log('✅ Updated VideoStudio options successfully!');
