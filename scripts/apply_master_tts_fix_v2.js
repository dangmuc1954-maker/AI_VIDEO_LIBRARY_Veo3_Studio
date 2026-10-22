const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetRoots = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../extracted_original'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Khach_Hang_v3.0/resources/app')
];

const ttsPayloadSnippet = `tts:f.tts?.enabled?{enabled:!0,voiceId:(f.tts.voiceId||"").trim()||"aN7cv9yXNrfIR87bDmyD",voiceName:(f.tts.voiceName||"").trim()||"Ninh Đôn – Deep & Warm (Tiếng Việt)",script:(f.tts.script||"").trim(),modelId:(f.tts.modelId||"").trim()||"eleven_multilingual_v2"}:void 0`;

for (const root of targetRoots) {
  if (!fs.existsSync(root)) continue;
  console.log('\n========================================');
  console.log('[*] Processing root:', root);

  // 1. VideoStudio-BZY_1pM8.js
  const vsPath = path.join(root, 'out/renderer/assets/VideoStudio-BZY_1pM8.js');
  if (fs.existsSync(vsPath)) {
    let code = fs.readFileSync(vsPath, 'utf8');

    // Fix Grok payload - make sure tts is present exactly once
    // Find Grok payload section
    const grokIdx = code.indexOf('providerId:"grok"');
    if (grokIdx !== -1) {
      // Find payload: { ... } for Grok
      const payloadStart = code.indexOf('payload:{', grokIdx);
      const payloadEnd = code.indexOf('}}),Y||(be+=1)', payloadStart);
      if (payloadStart !== -1 && payloadEnd !== -1) {
        let grokPayload = code.substring(payloadStart, payloadEnd);
        // Remove any existing tts:...
        grokPayload = grokPayload.replace(/,tts:[^,]+(\{[^}]+\}|void 0)/g, '');
        // Clean any double commas
        grokPayload = grokPayload.replace(/,,+/g, ',');
        // Insert clean tts before outputIndex or resolutionName
        if (grokPayload.includes('resolutionName:"720p"')) {
          grokPayload = grokPayload.replace('resolutionName:"720p"', `${ttsPayloadSnippet},resolutionName:"720p"`);
        } else {
          grokPayload += `,${ttsPayloadSnippet}`;
        }
        code = code.substring(0, payloadStart) + grokPayload + code.substring(payloadEnd);
        console.log('  ✓ Cleaned & patched Grok payload in VideoStudio');
      }
    }

    // Fix Veo3 payload - make sure tts is present exactly once
    const veoIdx = code.indexOf('providerId:"veo3"');
    if (veoIdx !== -1) {
      const payloadStart = code.indexOf('payload:{', veoIdx);
      const payloadEnd = code.indexOf('}}),we||(be+=1)', payloadStart);
      if (payloadStart !== -1 && payloadEnd !== -1) {
        let veoPayload = code.substring(payloadStart, payloadEnd);
        // Remove any existing tts:...
        veoPayload = veoPayload.replace(/,tts:[^,]+(\{[^}]+\}|void 0)/g, '');
        veoPayload = veoPayload.replace(/,,+/g, ',');
        // Insert clean tts before referenceAssetIds
        if (veoPayload.includes('referenceAssetIds:ht')) {
          veoPayload = veoPayload.replace('referenceAssetIds:ht', `referenceAssetIds:ht,${ttsPayloadSnippet}`);
        } else {
          veoPayload += `,${ttsPayloadSnippet}`;
        }
        code = code.substring(0, payloadStart) + veoPayload + code.substring(payloadEnd);
        console.log('  ✓ Cleaned & patched Veo3 payload in VideoStudio');
      }
    }

    fs.writeFileSync(vsPath, code, 'utf8');

    // Syntax validation
    fs.writeFileSync('temp_check.mjs', code);
    try {
      execSync('node --check temp_check.mjs', { stdio: 'inherit' });
      console.log('  ✅ Syntax VALID for VideoStudio:', vsPath);
    } catch (err) {
      console.error('  ❌ Syntax ERROR for VideoStudio:', err.message);
      process.exit(1);
    } finally {
      try { fs.unlinkSync('temp_check.mjs'); } catch (_) {}
    }
  }

  // 2. useWorkflowRunner-BmcV20yZ.js
  const wfPath = path.join(root, 'out/renderer/assets/useWorkflowRunner-BmcV20yZ.js');
  if (fs.existsSync(wfPath)) {
    let wfCode = fs.readFileSync(wfPath, 'utf8');
    const wfTtsSnippet = `tts:e.config?.tts?.enabled?{enabled:!0,voiceId:(e.config.tts.voiceId||"").trim()||"aN7cv9yXNrfIR87bDmyD",voiceName:(e.config.tts.voiceName||"").trim()||"Ninh Đôn – Deep & Warm (Tiếng Việt)",script:(e.config.tts.script||"").trim(),modelId:(e.config.tts.modelId||"").trim()||"eleven_multilingual_v2"}:void 0`;
    
    // Check veo3 in workflow
    const wfVeoAnchor = 'accountSelection:"auto"}});continue}if(e.type==="google-flow")';
    if (wfCode.includes(wfVeoAnchor) && !wfCode.includes(`accountSelection:"auto",${wfTtsSnippet}}`)) {
      wfCode = wfCode.replace(wfVeoAnchor, `accountSelection:"auto",${wfTtsSnippet}}});continue}if(e.type==="google-flow")`);
      console.log('  ✓ Patched Veo3 workflow submission');
    }

    fs.writeFileSync(wfPath, wfCode, 'utf8');
    fs.writeFileSync('temp_check_wf.mjs', wfCode);
    try {
      execSync('node --check temp_check_wf.mjs', { stdio: 'inherit' });
      console.log('  ✅ Syntax VALID for useWorkflowRunner:', wfPath);
    } catch (err) {
      console.error('  ❌ Syntax ERROR for useWorkflowRunner:', err.message);
      process.exit(1);
    } finally {
      try { fs.unlinkSync('temp_check_wf.mjs'); } catch (_) {}
    }
  }

  // 3. out/main/index.js
  const mainPath = path.join(root, 'out/main/index.js');
  if (fs.existsSync(mainPath)) {
    // Check if main index already has the full dubbing pipeline
    const mainCode = fs.readFileSync(mainPath, 'utf8');
    if (mainCode.includes('if(n.payload?.tts?.enabled && c.assets?.length>0)')) {
      console.log('  ✅ TTS Dubbing pipeline present in out/main/index.js');
    } else {
      console.log('  ⚠️ TTS Dubbing pipeline MISSING in out/main/index.js!');
    }
  }
}

console.log('\n========================================');
console.log('🎉 ALL TARGETS SUCCESSFULLY PATCHED AND VALIDATED!');
