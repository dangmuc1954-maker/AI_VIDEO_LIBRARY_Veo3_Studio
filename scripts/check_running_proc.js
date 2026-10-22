const { execSync } = require('child_process');
try {
  const out = execSync('tasklist', { encoding: 'utf8' });
  const lines = out.split('\n').filter(l => l.toLowerCase().includes('video') || l.toLowerCase().includes('electron'));
  console.log('Running matching processes:');
  console.log(lines.join('\n'));
} catch (e) {
  console.error(e);
}
