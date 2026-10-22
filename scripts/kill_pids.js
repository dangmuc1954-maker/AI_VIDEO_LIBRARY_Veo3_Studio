const cp = require('child_process');

const out = cp.execSync('tasklist /FO CSV /NH', { encoding: 'utf8' });
for (const line of out.split('\n')) {
  if (line.includes('AI VIDEO LIBRARY')) {
    const parts = line.split('","');
    if (parts.length > 1) {
      const pid = parts[1].replace(/"/g, '').trim();
      console.log('Killing PID:', pid);
      try {
        const res = cp.execSync(`taskkill /F /PID ${pid}`, { encoding: 'utf8' });
        console.log(res.trim());
      } catch (e) {
        console.log('Error:', e.message);
      }
    }
  }
}
