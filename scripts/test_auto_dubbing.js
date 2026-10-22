const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('--- KIỂM TRA FFMPEG HỖ TRỢ ATEMPO VÀ MUX VIDEO + AUDIO ---');

try {
  // Test ffmpeg version and atempo filter
  const out = execSync('ffmpeg -filters', { encoding: 'utf8' });
  const hasAtempo = out.includes('atempo');
  console.log('FFmpeg hỗ trợ atempo (điều chỉnh tốc độ giọng đọc):', hasAtempo);
} catch (e) {
  console.log('FFmpeg check notice:', e.message);
}

console.log('\n--- KIỂM TRA PRELOAD API EXPOSURE ---');
const preload = fs.readFileSync('app/out/preload/index.cjs', 'utf8');
console.log('Preload has muxAudioVideo:', preload.includes('muxAudioVideo'));
console.log('Preload has transcribeVideoAudio:', preload.includes('transcribeVideoAudio'));

console.log('\n--- KIỂM TRA MAIN IPC CHANNELS ---');
const main = fs.readFileSync('app/out/main/index.js', 'utf8');
console.log('Main has assets:muxAudioVideo:', main.includes('assets:muxAudioVideo'));
console.log('Main has assets:transcribeVideoAudio:', main.includes('assets:transcribeVideoAudio'));

console.log('\n--- KIỂM TRA RUNNER MERGE AUTO-DUBBING ---');
const runner = fs.readFileSync('app/out/renderer/assets/useWorkflowRunner-BmcV20yZ.js', 'utf8');
console.log('Runner has auto-dubbing in merge:', runner.includes('Lồng tiếng thông minh: Đang tự động ghép'));
console.log('Runner has video-script-extract:', runner.includes('r.type==="video-script-extract"'));

console.log('\n--- KIỂM TRA WORKFLOW EDITOR PALETTE ---');
const editor = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-BFJj-KsD.js', 'utf8');
console.log('Editor has AI Bóc Kịch Bản Video in palette:', editor.includes('AI Bóc Kịch Bản Video'));
