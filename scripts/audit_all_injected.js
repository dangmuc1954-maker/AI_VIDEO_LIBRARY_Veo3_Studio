const fs = require('fs');

const editor = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js', 'utf8');
const index = fs.readFileSync('app/out/renderer/assets/index-BS7vgKVV.js', 'utf8');
const runner = fs.readFileSync('app/out/renderer/assets/useWorkflowRunner-DGw6Ekx4.js', 'utf8');

console.log('=== Checking for Id usage ===');
const dubIconMatch = editor.match(/case"video-dubbing":[^;]+/g);
console.log('dubbing case in editor:', dubIconMatch);

const sttIconMatch = editor.match(/case"video-script-extract":[^;]+/g);
console.log('stt case in editor:', sttIconMatch);

// Kiểm tra xem Id và oo có xuất hiện ở đâu trong các đoạn mới thêm không
const dubInEditor = editor.match(/.{0,50}(?:video-dubbing|video-script-extract).{0,50}/g);
console.log('\nMatches in WorkflowEditor:', dubInEditor?.length);
dubInEditor?.forEach((m, i) => console.log(`  [${i}] ${m.trim()}`));

const dubInIndex = index.match(/.{0,50}(?:video-dubbing|video-script-extract).{0,50}/g);
console.log('\nMatches in index-BS7vgKVV:', dubInIndex?.length);
dubInIndex?.forEach((m, i) => console.log(`  [${i}] ${m.trim()}`));

const dubInRunner = runner.match(/.{0,50}(?:video-dubbing|video-script-extract).{0,50}/g);
console.log('\nMatches in useWorkflowRunner:', dubInRunner?.length);
dubInRunner?.forEach((m, i) => console.log(`  [${i}] ${m.trim()}`));
