const fs = require('fs');

// Kiểm tra trong zip3: google-flow hoặc video download
const zip3Main = fs.readFileSync('scratch/zip3_source_app/resources/app/out/main/index.js', 'utf8');

// Tìm các chỗ tải video hoặc xử lý audio của video
function findKeywords(content, kw) {
  let p = 0;
  const matches = [];
  while ((p = content.indexOf(kw, p)) !== -1) {
    matches.push(p);
    p += kw.length;
  }
  return matches;
}

console.log('google-flow in zip3 main:', findKeywords(zip3Main, 'google-flow').length);
console.log('veo3 in zip3 main:', findKeywords(zip3Main, 'veo3').length);
console.log('banana in zip3 main:', findKeywords(zip3Main, 'banana').length);

// Tìm chỗ lưu asset từ video generation
const assetMatch = zip3Main.match(/(?:audio|hasAudio|no-audio|an\b|-an\b|mute|sound)/gi);
console.log('Found audio-related flags in zip3 main:', assetMatch?.length);

// Tìm trong useWorkflowRunner của zip3 xem node google-flow chạy như thế nào!
const zip3WfRunner = fs.readFileSync('scratch/zip3_source_app/resources/app/out/renderer/assets/useWorkflowRunner-BmcV20yZ.js', 'utf8');
const flowIdx = zip3WfRunner.indexOf('"google-flow"');
console.log('google-flow in zip3 WorkflowRunner:', flowIdx);
if (flowIdx !== -1) {
  console.log(zip3WfRunner.slice(flowIdx - 50, flowIdx + 600));
}
