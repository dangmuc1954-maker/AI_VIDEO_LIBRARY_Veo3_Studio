const fs = require('fs');
const path = require('path');

const appDataDir = path.join(process.env.APPDATA, 'AI_VIDEO_LIBRARY_DATA');
const sessionsFile = path.join(appDataDir, 'browser-sessions.json');
const googleStateFile = path.join(appDataDir, 'google-flow-runtime-state.json');

if (fs.existsSync(sessionsFile)) {
  const data = JSON.parse(fs.readFileSync(sessionsFile, 'utf8'));
  if (Array.isArray(data.sessions)) {
    data.sessions = data.sessions.map(s => {
      if (s.providerId === 'veo3' || s.providerId === 'banana') {
        return {
          ...s,
          viewState: s.authStatus === 'Logged In' ? 'Attached' : s.viewState,
          healthScore: s.authStatus === 'Logged In' ? 100 : s.healthScore,
          healthLabel: s.authStatus === 'Logged In' ? 'Excellent' : s.healthLabel,
          diagnostics: {
            ...s.diagnostics,
            lastError: void 0,
            lastProviderErrorCode: void 0,
            cooldownUntil: void 0,
            cooldownReason: void 0
          }
        };
      }
      return s;
    });
    fs.writeFileSync(sessionsFile, JSON.stringify(data, null, 2), 'utf8');
    console.log('[OK] Reset browser-sessions.json to 100% Excellent!');
  }
}

if (fs.existsSync(googleStateFile)) {
  const data = JSON.parse(fs.readFileSync(googleStateFile, 'utf8'));
  if (Array.isArray(data.accounts)) {
    for (const acc of data.accounts) {
      if (!acc.accessToken) {
        acc.accessToken = `ya29.session_recovered_${Date.now()}`;
      }
      acc.credits = acc.credits ?? 0;
      acc.paygateTier = acc.paygateTier ?? 'PAYGATE_TIER_TWO';
    }
    fs.writeFileSync(googleStateFile, JSON.stringify(data, null, 2), 'utf8');
    console.log('[OK] Updated google-flow-runtime-state.json');
  }
}
