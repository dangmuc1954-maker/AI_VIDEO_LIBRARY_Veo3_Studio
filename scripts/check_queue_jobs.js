const fs = require('fs');
const path = require('path');

const dirs = fs.readdirSync(process.env.APPDATA).filter(d => d.toLowerCase().includes('video') || d.toLowerCase().includes('veo') || d.toLowerCase().includes('studio') || d.toLowerCase().includes('aiforge'));

for (const d of dirs) {
  const qp = path.join(process.env.APPDATA, d, 'queue-state.json');
  if (fs.existsSync(qp)) {
    console.log('Found queue-state.json in', d);
    try {
      const data = JSON.parse(fs.readFileSync(qp, 'utf8'));
      const jobs = data.jobs || [];
      console.log('Total jobs:', jobs.length);
      const museJobs = jobs.filter(j => j.providerId?.includes('muse') || j.provider?.toLowerCase().includes('muse') || j.providerId?.startsWith('custom-'));
      console.log('Muse jobs:', JSON.stringify(museJobs.slice(0, 3), null, 2));
    } catch (e) {
      console.log('Error reading queue:', e.message);
    }
  }
}
