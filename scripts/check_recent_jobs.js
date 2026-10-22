const fs = require('fs');
const qs = JSON.parse(fs.readFileSync('C:/Users/admin/AppData/Roaming/AI_VIDEO_LIBRARY_DATA/queue-state.json', 'utf8'));

console.log('Total jobs:', qs.jobs.length);
console.log('Top 5 most recent jobs:');
for (const j of qs.jobs.slice(0, 5)) {
  console.log(`- ID: ${j.id} | Title: ${j.title} | CreatedAt: ${j.createdAt} | Status: ${j.status}`);
}
