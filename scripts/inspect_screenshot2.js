const fs = require('fs');
const p = 'C:/Users/admin/AppData/Roaming/AI_VIDEO_LIBRARY_DATA/queue-state.json';
const data = JSON.parse(fs.readFileSync(p, 'utf8'));
const jobs = data.jobs || [];

const museJobs = jobs.filter(j => j.title && (j.title.includes('mèo') || j.title.includes('bò') || j.title.includes('heo')));
console.log('Found jobs:', museJobs.length);
museJobs.forEach(j => {
  console.log(`Title: ${j.title} | Status: ${j.status} | Provider: ${j.providerId} | Error: ${j.error}`);
});
