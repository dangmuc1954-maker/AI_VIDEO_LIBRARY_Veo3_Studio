const fs = require('fs');
const path = require('path');

console.log('=== VERIFYING ACTIVE GOOGLE FLOW ACCOUNT ===');
const statePath = path.join(process.env.APPDATA, 'AI_VIDEO_LIBRARY_DATA/google-flow-runtime-state.json');
if (!fs.existsSync(statePath)) {
  console.error('State file not found at:', statePath);
  process.exit(1);
}

const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
const activeAcc = state.accounts?.find(a => a.credits > 0 && a.accessToken);
if (!activeAcc) {
  console.log('No active account with credits found. Available accounts:', state.accounts);
} else {
  console.log('✓ Found active account:', activeAcc.email, 'Credits:', activeAcc.credits, 'Expires:', activeAcc.accessTokenExpiresAt);
}
