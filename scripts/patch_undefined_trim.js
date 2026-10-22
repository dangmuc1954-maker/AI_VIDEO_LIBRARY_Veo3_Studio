const fs = require('fs');
const path = require('path');

const targetDirs = [
  path.join(__dirname, '../extracted_original/out/renderer/assets'),
  path.join(__dirname, '../app/out/renderer/assets'),
  path.join(__dirname, '../dist/AIForge_Studio_Customer_Edition/resources/app/out/renderer/assets'),
  path.join(__dirname, '../dist/AIForge_Studio_Khach_Hang_v3.0/resources/app/out/renderer/assets'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app/out/renderer/assets')
];

function patchFile(filePath, transforms) {
  if (!fs.existsSync(filePath)) {
    console.log(`[!] Skip (not found): ${filePath}`);
    return;
  }
  let code = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  for (const { name, target, replacement } of transforms) {
    if (typeof target === 'string') {
      if (code.includes(target)) {
        code = code.split(target).join(replacement);
        console.log(`  [+] Applied (${name}): ${path.basename(filePath)}`);
        modified = true;
      } else {
        console.log(`  [-] Target not found (${name}) in ${path.basename(filePath)}`);
      }
    } else if (target instanceof RegExp) {
      if (target.test(code)) {
        code = code.replace(target, replacement);
        console.log(`  [+] Applied regex (${name}): ${path.basename(filePath)}`);
        modified = true;
      } else {
        console.log(`  [-] Regex not matched (${name}) in ${path.basename(filePath)}`);
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, code, 'utf8');
    console.log(`[SUCCESS] Saved: ${filePath}`);
  }
}

// 1. Transforms for TTSStudio-C_2cGcBA.js
const ttsTransforms = [
  {
    name: 'TTSStudio: o.script.trim()',
    target: '_=o.script.trim().length>0',
    replacement: '_=(o.script||"").trim().length>0'
  },
  {
    name: 'TTSStudio: o.script.length > 800',
    target: 'o.script.length>800',
    replacement: '(o.script?.length||0)>800'
  },
  {
    name: 'TTSStudio: t.script.trim() in re memo',
    target: 're=c.useMemo(()=>z.filter(t=>t.script.trim().length===0).length,[z])',
    replacement: 're=c.useMemo(()=>z.filter(t=>(t.script||"").trim().length===0).length,[z])'
  },
  {
    name: 'TTSStudio: Z.script.trim() in ye',
    target: 'const l=t.filter(Z=>Z.script.trim().length===0),u=t.filter(Z=>Z.script.trim().length>0);',
    replacement: 'const l=t.filter(Z=>(Z.script||"").trim().length===0),u=t.filter(Z=>(Z.script||"").trim().length>0);'
  },
  {
    name: 'TTSStudio: title g.script.trim()',
    target: 'title:g.script.trim().slice(0,96)',
    replacement: 'title:(g.script||"").trim().slice(0,96)'
  },
  {
    name: 'TTSStudio: prompt g.script.trim()',
    target: 'prompt:g.script.trim()',
    replacement: 'prompt:(g.script||"").trim()'
  },
  {
    name: 'TTSStudio: voiceId g.voiceId.trim()',
    target: 'voiceId:g.voiceId.trim()||Me?.voiceId||qt',
    replacement: 'voiceId:(g.voiceId||"").trim()||Me?.voiceId||qt'
  },
  {
    name: 'TTSStudio: voiceName g.voiceName.trim()',
    target: 'voiceName:Me?.voiceName||g.voiceName.trim()||Bt',
    replacement: 'voiceName:Me?.voiceName||(g.voiceName||"").trim()||Bt'
  },
  {
    name: 'TTSStudio: modelId g.modelId.trim()',
    target: 'modelId:g.modelId.trim()||_t',
    replacement: 'modelId:(g.modelId||"").trim()||_t'
  },
  {
    name: 'TTSStudio: s.voiceId.trim() load button',
    target: 'disabled:D||!s.voiceId.trim()',
    replacement: 'disabled:D||!(s.voiceId||"").trim()'
  },
  {
    name: 'TTSStudio: s.script.length chars indicator',
    target: 's.script.length,"/",be," chars"',
    replacement: '(s.script?.length||0),"/",be," chars"'
  },
  {
    name: 'TTSStudio: search filter l.script.toLowerCase()',
    target: 'E.filter(l=>l.script.toLowerCase().includes(t))',
    replacement: 'E.filter(l=>(l.script||"").toLowerCase().includes(t))'
  },
  {
    name: 'TTSStudio: u=l.trim()',
    target: 'const u=l.trim();',
    replacement: 'const u=(l||"").trim();'
  },
  {
    name: 'TTSStudio: t=S.trim().toLowerCase()',
    target: 'const t=S.trim().toLowerCase();',
    replacement: 'const t=(S||"").trim().toLowerCase();'
  },
  {
    name: 'TTSStudio: r.currentTarget.value.trim()',
    target: 'const a=r.currentTarget.value.trim()',
    replacement: 'const a=(r?.currentTarget?.value||"").trim()'
  },
  {
    name: 'TTSStudio: preview result d.script',
    target: 'd.script:e.jsx("span",{className:"italic text-text-muted",children:"Blank TTS script"})',
    replacement: '(d.script||""):e.jsx("span",{className:"italic text-text-muted",children:"Blank TTS script"})'
  }
];

// 2. Transforms for WaveSurferPlayer-D-cjCZYq.js
const waveSurferTransforms = [
  {
    name: 'WaveSurfer: We(n)',
    target: 'function We(n){return n.replace(/\\s+/g," ").trim()}',
    replacement: 'function We(n){return (n||"").replace(/\\s+/g," ").trim()}'
  },
  {
    name: 'WaveSurfer: _e(n, e=fe)',
    target: 'function _e(n,e=fe){const t=[];let i=n.trim();',
    replacement: 'function _e(n,e=fe){const t=[];let i=(n||"").trim();'
  },
  {
    name: 'WaveSurfer: Oe(n)',
    target: 'function Oe(n){return n.split(/\\r?\\n/).map(e=>e.replace(/^\\s*(?:[-*]|\\d+[.)])\\s+/,"").trim()).filter(Boolean)}',
    replacement: 'function Oe(n){return (n||"").split(/\\r?\\n/).map(e=>(e||"").replace(/^\\s*(?:[-*]|\\d+[.)])\\s+/,"").trim()).filter(Boolean)}'
  },
  {
    name: 'WaveSurfer: d.script.trim() in addPromptRowsFromDrafts',
    target: 'script:d.script.trim(),voiceName:d.voiceName?.trim()',
    replacement: 'script:(d.script||"").trim(),voiceName:d.voiceName?.trim()'
  }
];

// 3. Transforms for ImageStudio-WdVKNv6Z.js
const imageTransforms = [
  {
    name: 'ImageStudio: i.prompt.trim() in table render',
    target: 'X=i.prompt.trim().length>0',
    replacement: 'X=(i.prompt||"").trim().length>0'
  },
  {
    name: 'ImageStudio: o.prompt.length in inspector',
    target: 'o.prompt.length," / ",dr',
    replacement: '(o.prompt?.length||0)," / ",dr'
  },
  {
    name: 'ImageStudio: I.prompt.trim() in preview',
    target: 'I.prompt.trim()||"Blank image prompt"',
    replacement: '(I.prompt||"").trim()||"Blank image prompt"'
  },
  {
    name: 'ImageStudio: t.prompt.trim() in blank check',
    target: 'Ee=ce.filter(t=>t.prompt.trim().length===0).length',
    replacement: 'Ee=ce.filter(t=>(t.prompt||"").trim().length===0).length'
  },
  {
    name: 'ImageStudio: v.prompt.trim() in queue send',
    target: 'const c=t.filter(v=>v.prompt.trim().length===0),f=t.filter(v=>v.prompt.trim().length>0);',
    replacement: 'const c=t.filter(v=>(v.prompt||"").trim().length===0),f=t.filter(v=>(v.prompt||"").trim().length>0);'
  }
];

// 4. Transforms for VideoStudio-BZY_1pM8.js
const videoTransforms = [
  {
    name: 'VideoStudio: m.prompt.trim() in table render',
    target: 'P=m.prompt.trim().length>0',
    replacement: 'P=(m.prompt||"").trim().length>0'
  },
  {
    name: 'VideoStudio: a.prompt.trim() in aside',
    target: 'T=a.prompt.trim()||"Blank video prompt"',
    replacement: 'T=(a.prompt||"").trim()||"Blank video prompt"'
  },
  {
    name: 'VideoStudio: P.prompt.trim() in preview group',
    target: 'P.prompt.trim()||"Blank video prompt"',
    replacement: '(P.prompt||"").trim()||"Blank video prompt"'
  },
  {
    name: 'VideoStudio: l.prompt.trim() in preview card',
    target: 'l.prompt.trim()||"Blank video prompt"',
    replacement: '(l.prompt||"").trim()||"Blank video prompt"'
  },
  {
    name: 'VideoStudio: x.prompt.trim() in count check',
    target: 'x.prompt.trim().length===0&&(r.blankPromptCount+=1)',
    replacement: '(x.prompt||"").trim().length===0&&(r.blankPromptCount+=1)'
  },
  {
    name: 'VideoStudio: f.prompt.trim() in queue send',
    target: 'const x=r.filter(f=>f.prompt.trim().length===0),S=r.filter(f=>f.prompt.trim().length>0);',
    replacement: 'const x=r.filter(f=>(f.prompt||"").trim().length===0),S=r.filter(f=>(f.prompt||"").trim().length>0);'
  },
  {
    name: 'VideoStudio: Co(t) split',
    target: 'function Co(t){return t.split(/\\r?\\n/).map(o=>o.replace(/^\\s*(?:[-*]|\\d+[.)])\\s+/,"").trim()).filter(Boolean)}',
    replacement: 'function Co(t){return (t||"").split(/\\r?\\n/).map(o=>(o||"").replace(/^\\s*(?:[-*]|\\d+[.)])\\s+/,"").trim()).filter(Boolean)}'
  }
];

console.log('=== STARTING BULLETPROOF UI CRASH PATCH ===');

for (const dir of targetDirs) {
  console.log(`\nChecking directory: ${dir}`);
  patchFile(path.join(dir, 'TTSStudio-C_2cGcBA.js'), ttsTransforms);
  patchFile(path.join(dir, 'WaveSurferPlayer-D-cjCZYq.js'), waveSurferTransforms);
  patchFile(path.join(dir, 'ImageStudio-WdVKNv6Z.js'), imageTransforms);
  patchFile(path.join(dir, 'VideoStudio-BZY_1pM8.js'), videoTransforms);
}

console.log('\n=== ALL PATCHES COMPLETED SUCCESSFULLY ===');
