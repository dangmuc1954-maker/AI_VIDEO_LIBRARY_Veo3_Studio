const { execSync } = require('child_process');
try {
  const out = execSync('tasklist').toString();
  const lines = out.split('\n').filter(l => l.toLowerCase().includes('video') || l.toLowerCase().includes('electron') || l.toLowerCase().includes('aiforge'));
  console.log('Running matches:\n' + lines.join('\n'));
} catch(e) {
  console.log('Error:', e.message);
}
