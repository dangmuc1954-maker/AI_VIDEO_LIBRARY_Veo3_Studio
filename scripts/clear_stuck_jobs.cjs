const fs = require('fs');

const p = 'C:/Users/admin/AppData/Roaming/AI_VIDEO_LIBRARY_DATA/queue-state.json';
if (fs.existsSync(p)) {
  const d = JSON.parse(fs.readFileSync(p, 'utf8'));
  let changed = false;
  if (Array.isArray(d.jobs)) {
    d.jobs.forEach(j => {
      if (j.status === 'Running' || j.status === 'Queued') {
        j.status = 'Failed';
        j.error = 'Đã hủy tác vụ bị kẹt';
        changed = true;
        console.log('Reset stuck job:', j.id);
      }
    });
  }
  if (changed) {
    fs.writeFileSync(p, JSON.stringify(d, null, 2), 'utf8');
    console.log('✓ Cleared all stuck jobs in queue-state.json!');
  } else {
    console.log('No stuck jobs found.');
  }
}
