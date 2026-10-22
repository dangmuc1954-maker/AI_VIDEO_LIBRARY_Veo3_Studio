const fs = require('fs');
const content = fs.readFileSync('C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/out/main/index.js', 'utf8');

const qs = JSON.parse(fs.readFileSync('C:/Users/admin/AppData/Roaming/AI_VIDEO_LIBRARY_DATA/queue-state.json', 'utf8'));
const job = qs.jobs.find(j => j.id === 'job-1788660036669-93feqm');
console.log('Result assets of job:', JSON.stringify(job.result.assets, null, 2));

const idx = content.indexOf('df6b4daf-b183-43be-b84d-1c91eb545efc');
console.log('Is asset in index.js?', idx);
