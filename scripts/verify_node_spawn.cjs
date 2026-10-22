const fs = require('fs');

console.log('--- Testing Node Creation & Workflow Simulation ---');
const wfCode = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-BFJj-KsD.js', 'utf8');

// Check that ov contains case "video-script-extract"
if (!wfCode.includes('case"video-script-extract":return{id:r,type:"video-script-extract"')) {
  throw new Error('FAILED: ov does not contain video-script-extract case!');
}
console.log('✅ Factory function `ov` contains `video-script-extract` case.');

// Check that Bi icon contains video-script-extract
if (!wfCode.includes('case"video-script-extract":return t.jsx("div",{className:`${n} rounded-lg bg-[#10b981]/15')) {
  throw new Error('FAILED: Bi does not contain video-script-extract icon!');
}
console.log('✅ Node icon `Bi` contains `video-script-extract` case.');

// Check that Yp contains card body
if (!wfCode.includes('e.type==="video-script-extract"&&t.jsxs("div",{className:"flex-1 flex flex-col gap-1.5 p-2 bg-[#130f2440]')) {
  throw new Error('FAILED: Yp does not contain card body for video-script-extract!');
}
console.log('✅ Canvas Node Card `Yp` contains custom UI body for `video-script-extract`.');

// Check that palette j contains video-script-extract
if (!wfCode.includes('{type:"video-script-extract",title:"AI Bóc Kịch Bản Video"')) {
  throw new Error('FAILED: Palette does not contain video-script-extract item!');
}
console.log('✅ Palette `j` contains `video-script-extract` item.');

// Check runner handles video-script-extract
const runnerCode = fs.readFileSync('app/out/renderer/assets/useWorkflowRunner-BmcV20yZ.js', 'utf8');
if (!runnerCode.includes('r.type==="video-script-extract"')) {
  throw new Error('FAILED: Runner does not handle video-script-extract!');
}
console.log('✅ Workflow runner handles `video-script-extract`.');

// Check main backend methods
const mainCode = fs.readFileSync('app/out/main/index.js', 'utf8');
if (!mainCode.includes('transcribeVideoAudio') || !mainCode.includes('muxAudioIntoVideo')) {
  throw new Error('FAILED: Main backend does not contain transcribeVideoAudio or muxAudioIntoVideo!');
}
console.log('✅ Main backend contains transcribeVideoAudio and muxAudioIntoVideo.');

console.log('\n🎉 ALL WORKFLOW NODE CHECKS PASSED PERFECTLY!');
