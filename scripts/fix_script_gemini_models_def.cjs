const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetRoots = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Khach_Hang_v3.0/resources/app'),
  'C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app'
];

for (const root of targetRoots) {
  const filePath = path.join(root, 'out/renderer/assets/VideoFactoryStudio.js');
  if (!fs.existsSync(filePath)) {
    console.log('Skipping (not found):', filePath);
    continue;
  }

  let code = fs.readFileSync(filePath, 'utf8');

  // Fix modelCandidates vs geminiModels and validImgData in handleGenerateScript
  const oldScriptLoop = `      const modelCandidates = [
        'gemini-3.1-flash-lite',
        'gemini-3.5-flash-lite',
        'gemini-flash-lite-latest',
        'gemini-3-flash-preview',
        'gemini-3.1-flash-lite-preview',
        'gemini-3.5-flash',
        'gemini-3.1-flash-lite',
        'gemini-3.6-flash'
      ];
      for (const mName of geminiModels) {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 3500);

          const tryPayloads = [
            {
              contents: [{ parts }],
              generationConfig: {
                temperature: 0.95,
                response_mime_type: "application/json"
              }
            }
          ];
          if (validImgData) {
            tryPayloads.push({
              contents: [{ parts: [{ text: analysisPrompt }] }],
              generationConfig: { temperature: 0.9, response_mime_type: "application/json" }
            });
          }`;

  const newScriptLoop = `      const geminiScriptModels = [
        'gemini-3.5-flash',
        'gemini-3.1-flash-lite',
        'gemini-3.6-flash'
      ];
      for (const mName of geminiScriptModels) {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 4000);

          const tryPayloads = [
            {
              contents: [{ parts }],
              generationConfig: {
                temperature: 0.85,
                response_mime_type: "application/json"
              }
            },
            {
              contents: [{ parts: [{ text: analysisPrompt }] }],
              generationConfig: {
                temperature: 0.85,
                response_mime_type: "application/json"
              }
            }
          ];`;

  if (code.includes(oldScriptLoop)) {
    code = code.replace(oldScriptLoop, newScriptLoop);
    console.log('Fixed geminiScriptModels and validImgData in', filePath);
  } else {
    // Try slice replacement around modelCandidates
    const p1 = code.indexOf('const modelCandidates = [');
    const p2 = code.indexOf('for (const curPayload of tryPayloads) {', p1);
    if (p1 !== -1 && p2 !== -1) {
      code = code.slice(0, p1) + newScriptLoop + '\n\n          ' + code.slice(p2);
      console.log('Replaced via slice in', filePath);
    } else {
      console.log('WARN: modelCandidates pattern not found in', filePath);
    }
  }

  fs.writeFileSync(filePath, code, 'utf8');
  console.log('Saved:', filePath);

  try {
    execSync(`node --check "${filePath}"`);
    console.log('✅ Syntax valid for', filePath);
  } catch (err) {
    console.error('❌ Syntax error in', filePath, err.message);
  }
}
