const fs = require('fs');

let code = fs.readFileSync('app/out/renderer/assets/aiforge_video_editor_automerge.js', 'utf8');

// 1. Update openVideoEditorStudio to delegate directly to React modal window.__openAiforgeVideoEditorModal
const oldOpenFnStart = 'function openVideoEditorStudio(initialAssetIds = []) {';
const newOpenFn = `function openVideoEditorStudio(initialAssetIds = []) {
    if (typeof window.__openAiforgeVideoEditorModal === 'function') {
      window.__openAiforgeVideoEditorModal(initialAssetIds);
      return;
    }
    const timer = setInterval(() => {
      if (typeof window.__openAiforgeVideoEditorModal === 'function') {
        clearInterval(timer);
        window.__openAiforgeVideoEditorModal(initialAssetIds);
      }
    }, 100);
    setTimeout(() => clearInterval(timer), 3000);
    return;
`;

if (code.includes(oldOpenFnStart)) {
  code = code.replace(oldOpenFnStart, newOpenFn);
  console.log('Updated openVideoEditorStudio to delegate to React modal.');
}

// 2. Prevent duplicate toolbar injection if native React button exists
const injectCheck = 'function injectStudioToolbarControls() {';
const injectGuard = `function injectStudioToolbarControls() {
    // If native React button already exists, do not inject duplicates
    if (document.querySelector('button[title*="Biên tập"]') || document.querySelector('button[title*="MiniVideoEditorModal"]')) {
      return;
    }
`;

if (code.includes(injectCheck)) {
  code = code.replace(injectCheck, injectGuard);
  console.log('Added guard to injectStudioToolbarControls.');
}

fs.writeFileSync('app/out/renderer/assets/aiforge_video_editor_automerge.js', code, 'utf8');
console.log('Updated aiforge_video_editor_automerge.js successfully.');
