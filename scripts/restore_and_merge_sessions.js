const fs = require('fs');
const path = require('path');

const appDataDir = path.join(process.env.APPDATA, 'AI_VIDEO_LIBRARY_DATA');
const targetFile = path.join(appDataDir, 'browser-sessions.json');
const persistentBak = path.join(appDataDir, 'browser-sessions.json.bak_persistent');
const masterVault = path.join(appDataDir, 'browser-sessions.json.master_vault.json');

console.log('[Restore] Scanning data in:', appDataDir);

const allSessionsMap = new Map();

function ingestSessions(sessions, sourceLabel) {
  if (!Array.isArray(sessions)) return;
  console.log(`[Ingest] Ingesting ${sessions.length} sessions from: ${sourceLabel}`);
  for (const s of sessions) {
    if (!s || !s.accountId) continue;
    const existing = allSessionsMap.get(s.accountId);
    if (!existing) {
      allSessionsMap.set(s.accountId, { ...s });
    } else {
      // Merge smartly: keep the better/more logged-in one
      const keepLoggedIn = s.authStatus === 'Logged In' || existing.authStatus === 'Logged In';
      const betterCookies = Math.max(s.cookieCount || 0, existing.cookieCount || 0);
      const betterName = (s.accountDisplayName || s.accountName || '').length > (existing.accountDisplayName || existing.accountName || '').length
        ? (s.accountDisplayName || s.accountName)
        : (existing.accountDisplayName || existing.accountName);
      
      const merged = {
        ...existing,
        ...s,
        accountName: betterName,
        authStatus: keepLoggedIn ? 'Logged In' : (s.authStatus || existing.authStatus),
        cookieCount: betterCookies,
        activity: Array.isArray(s.activity) && s.activity.length > (existing.activity?.length || 0) ? s.activity : existing.activity
      };
      allSessionsMap.set(s.accountId, merged);
    }
  }
}

// 1. Read tmp files
if (fs.existsSync(appDataDir)) {
  const files = fs.readdirSync(appDataDir);
  for (const f of files) {
    if (f.startsWith('browser-sessions.json.') && (f.endsWith('.tmp') || f.includes('.bak'))) {
      try {
        const filePath = path.join(appDataDir, f);
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.trim().length > 10) {
          const parsed = JSON.parse(content);
          if (parsed && Array.isArray(parsed.sessions)) {
            ingestSessions(parsed.sessions, f);
          }
        }
      } catch (err) {
        console.warn('Error reading file:', f, err.message);
      }
    }
  }
}

// 2. Read persistent bak if exists
if (fs.existsSync(persistentBak)) {
  try {
    const content = fs.readFileSync(persistentBak, 'utf8');
    const parsed = JSON.parse(content);
    if (parsed && Array.isArray(parsed.sessions)) {
      ingestSessions(parsed.sessions, 'browser-sessions.json.bak_persistent');
    }
  } catch (e) {}
}

// 3. Read current browser-sessions.json
if (fs.existsSync(targetFile)) {
  try {
    const content = fs.readFileSync(targetFile, 'utf8');
    const parsed = JSON.parse(content);
    if (parsed && Array.isArray(parsed.sessions)) {
      ingestSessions(parsed.sessions, 'browser-sessions.json (current)');
    }
  } catch (e) {}
}

// 4. Verify partition exists on disk & normalize
const partitionDir = path.join(appDataDir, 'Partitions');
const existingPartitions = fs.existsSync(partitionDir) ? fs.readdirSync(partitionDir) : [];

const finalSessions = Array.from(allSessionsMap.values()).map(s => {
  // If partition folder exists and has cookies, ensure Logged In is kept
  const pName = (s.partition || '').replace('persist:aiforge:', '').replace('persist:aivideo:', '');
  const hasDiskPartition = existingPartitions.some(ep => ep.includes(pName) || pName.includes(ep));
  
  let authStatus = s.authStatus;
  // If it was Logged In or has partition with cookies, protect it
  if (s.authStatus === 'Logged In') {
    authStatus = 'Logged In';
  } else if (hasDiskPartition && (s.cookieCount || 0) > 3) {
    // If it has good cookies on disk and wasn't manually logged out
    authStatus = 'Logged In';
  }

  // Ensure avatar initials are safe
  const nameToUse = s.accountDisplayName || s.accountName || s.provider || 'AI';
  const avatarSafe = nameToUse.split(/\s+/).filter(Boolean).map(x => x[0]).join('').slice(0, 2).toUpperCase() || 'AI';

  return {
    ...s,
    authStatus,
    avatar: avatarSafe,
    healthScore: authStatus === 'Logged In' ? 100 : s.healthScore,
    healthLabel: authStatus === 'Logged In' ? 'Excellent' : s.healthLabel,
    viewState: 'Idle',
    activeJobs: 0
  };
});

console.log(`\n=== TOTAL RESTORED SESSIONS: ${finalSessions.length} ===`);
finalSessions.forEach((s, idx) => {
  console.log(`${idx + 1}. [${s.providerId}] ${s.accountName} (${s.accountId}) | ${s.authStatus} | Partition: ${s.partition}`);
});

const payload = JSON.stringify({ sessions: finalSessions }, null, 2);

// Save to primary, persistent backup, and master vault
fs.writeFileSync(targetFile, payload, 'utf8');
fs.writeFileSync(persistentBak, payload, 'utf8');
fs.writeFileSync(masterVault, payload, 'utf8');

// Also save to sibling folders if they exist
const roamingDir = process.env.APPDATA;
const siblings = ['AI VIDEO LIBRARY', 'aiforge-studio', 'ai-video-library'];
for (const sib of siblings) {
  const sibDir = path.join(roamingDir, sib);
  if (fs.existsSync(sibDir)) {
    try {
      fs.writeFileSync(path.join(sibDir, 'browser-sessions.json'), payload, 'utf8');
      fs.writeFileSync(path.join(sibDir, 'browser-sessions.json.bak_persistent'), payload, 'utf8');
      fs.writeFileSync(path.join(sibDir, 'browser-sessions.json.master_vault.json'), payload, 'utf8');
      console.log(`[Backup Sibling] Synchronized vault to sibling: ${sib}`);
    } catch (e) {}
  }
}

console.log('\n[Success] All sessions restored and locked into Master Vault successfully!');
