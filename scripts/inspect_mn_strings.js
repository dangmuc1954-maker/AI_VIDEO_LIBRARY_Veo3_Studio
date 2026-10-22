const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '..', 'original_video_editor_mn.js'), 'utf8');

// Find strings in mn
const strings = [...new Set(content.match(/"([^"\\]|\\.)*"/g) || [])];
console.log('Total unique strings in mn:', strings.length);
console.log('Sample strings in mn:');
console.log(strings.filter(s => s.includes('videoStudio') || s.includes('editor') || s.includes('transition') || s.includes('merge') || s.includes('clip') || s.includes('ratio')).slice(0, 50));
