const fs = require('fs');
const path = require('path');

console.log('=== FIXING SUPPORTED JOB TYPES FOR MUSE AI ===');

// 1. Update app/out/main/index.js (Jd list and cu / cd functions)
const mainFile = 'app/out/main/index.js';
let mainContent = fs.readFileSync(mainFile, 'utf8');

// 1.1 Add muse to Jd
const oldJdEntry = '{id:"elevenlabs",name:"ElevenLabs",startUrl:"https://elevenlabs.io/app",supportedJobTypes:["TTS","Voice Clone","Voice Library"]}];';
const newJdEntry = '{id:"muse",name:"Muse AI",startUrl:"https://muse.ai/",supportedJobTypes:["Video Generation","Image to Video","Reference Assets","Chat","Browser Request"]},{id:"elevenlabs",name:"ElevenLabs",startUrl:"https://elevenlabs.io/app",supportedJobTypes:["TTS","Voice Clone","Voice Library"]}];';

if (mainContent.includes(oldJdEntry)) {
  mainContent = mainContent.replace(oldJdEntry, newJdEntry);
  console.log('✓ Added Muse AI to Jd in main/index.js');
}

// 1.2 Update cu function
const oldCu = 'function cu(r,e){const t=e==="Image"?"Image Generation":e==="Video"?"Video Generation":e;return r.supportedJobTypes.includes(t)}';
const newCu = 'function cu(r,e){if(r.providerId==="muse"||(r.provider&&r.provider.toLowerCase().includes("muse"))||(r.startUrl&&r.startUrl.includes("muse.ai")))return!0;const t=e==="Image"?"Image Generation":e==="Video"?"Video Generation":e;return r.supportedJobTypes.includes(t)}';

if (mainContent.includes(oldCu)) {
  mainContent = mainContent.replace(oldCu, newCu);
  console.log('✓ Updated cu() function in main/index.js');
}

// 1.3 Update cd function
const oldCd = 'function cd(r,e){const t=e==="Image"?"Image Generation":e==="Video"?"Video Generation":e;return r.supportedJobTypes.includes(t)}';
const newCd = 'function cd(r,e){if(r.providerId==="muse"||(r.provider&&r.provider.toLowerCase().includes("muse"))||(r.startUrl&&r.startUrl.includes("muse.ai")))return!0;const t=e==="Image"?"Image Generation":e==="Video"?"Video Generation":e;return r.supportedJobTypes.includes(t)}';

if (mainContent.includes(oldCd)) {
  mainContent = mainContent.replace(oldCd, newCd);
  console.log('✓ Updated cd() function in main/index.js');
}

// 1.4 Update custom provider default creation if it's muse
const oldCustomProv = 'supportedJobTypes:["Browser Request"],loginUrlPatterns:[/login|sign-?in|auth/i],readyUrlPatterns:[new RegExp(`^${t}(?:/|$)`,"i")]';
const newCustomProv = 'supportedJobTypes:(e.name&&e.name.toLowerCase().includes("muse"))?["Video Generation","Image to Video","Reference Assets","Browser Request"]:["Browser Request"],loginUrlPatterns:[/login|sign-?in|auth/i],readyUrlPatterns:[new RegExp(`^${t}(?:/|$)`,"i")]';

if (mainContent.includes(oldCustomProv)) {
  mainContent = mainContent.replace(oldCustomProv, newCustomProv);
  console.log('✓ Updated custom provider creation for Muse in main/index.js');
}

fs.writeFileSync(mainFile, mainContent, 'utf8');

// 2. Update existing browser-sessions.json in AppData
const sessionPath = 'C:/Users/admin/AppData/Roaming/AI_VIDEO_LIBRARY_DATA/browser-sessions.json';
if (fs.existsSync(sessionPath)) {
  try {
    const raw = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
    const isArr = Array.isArray(raw);
    const sessions = isArr ? raw : (raw.sessions || []);
    let modified = false;

    sessions.forEach(s => {
      if ((s.provider && s.provider.toLowerCase().includes('muse')) || (s.startUrl && s.startUrl.includes('muse.ai')) || s.providerId === 'muse') {
        s.supportedJobTypes = ["Video Generation", "Image to Video", "Reference Assets", "Browser Request"];
        modified = true;
        console.log('✓ Updated existing Muse session supportedJobTypes in AppData');
      }
    });

    if (modified) {
      fs.writeFileSync(sessionPath, JSON.stringify(raw, null, 2), 'utf8');
      console.log('✓ Saved updated browser-sessions.json');
    }
  } catch(e) {
    console.error('Error updating browser-sessions.json:', e.message);
  }
}

// 3. Update custom-browser-providers.json in AppData
const customProvPath = 'C:/Users/admin/AppData/Roaming/AI_VIDEO_LIBRARY_DATA/custom-browser-providers.json';
if (fs.existsSync(customProvPath)) {
  try {
    const raw = JSON.parse(fs.readFileSync(customProvPath, 'utf8'));
    if (raw.providers) {
      raw.providers.forEach(p => {
        if (p.name && p.name.toLowerCase().includes('muse')) {
          p.supportedJobTypes = ["Video Generation", "Image to Video", "Reference Assets", "Browser Request"];
        }
      });
      fs.writeFileSync(customProvPath, JSON.stringify(raw, null, 2), 'utf8');
      console.log('✓ Saved updated custom-browser-providers.json');
    }
  } catch(e) {
    console.error('Error updating custom-browser-providers.json:', e.message);
  }
}

console.log('=== COMPLETED SUPPORTED JOB TYPES PATCH ===');
