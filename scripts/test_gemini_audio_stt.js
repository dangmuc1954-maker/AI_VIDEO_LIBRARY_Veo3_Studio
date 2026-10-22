const fs = require('fs');
const path = require('path');

async function testGeminiWithFlowToken() {
  const statePath = path.join(process.env.APPDATA, 'AI_VIDEO_LIBRARY_DATA/google-flow-runtime-state.json');
  if (!fs.existsSync(statePath)) {
    console.log('No state file');
    return;
  }
  const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  const acc = state.accounts?.find(a => a.accessToken);
  if (!acc) {
    console.log('No acc with token');
    return;
  }
  console.log('Found account:', acc.email);
  console.log('Token snippet:', acc.accessToken.slice(0, 20) + '...');

  // Test various endpoints
  const endpoints = [
    'https://labs.google/fx/api/trpc/session.get',
    'https://labs.google/fx/api/trpc/project.list',
    'https://speech.googleapis.com/v1/speech:recognize'
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        headers: {
          'Authorization': `Bearer ${acc.accessToken}`
        }
      });
      console.log(`Endpoint ${ep} status:`, res.status);
    } catch (e) {
      console.log(`Endpoint ${ep} error:`, e.message);
    }
  }
}

testGeminiWithFlowToken();
