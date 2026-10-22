const fs = require('fs');
const path = require('path');

const targetFiles = [
  path.join(__dirname, '../app/out/renderer/assets/aiforge_video_editor_automerge.js'),
  path.join(__dirname, '../src/modules/aiforge_video_editor_automerge.js')
];

for (const filePath of targetFiles) {
  if (!fs.existsSync(filePath)) continue;
  let code = fs.readFileSync(filePath, 'utf8');

  // 1. Disable setInterval for checkAndRunAutoMerge
  code = code.replace(
    'setInterval(checkAndRunAutoMerge, 3000);',
    '// setInterval(checkAndRunAutoMerge, 3000); // Tắt tính năng tự động ghép ngầm không ổn định'
  );

  // 2. Clean injectStudioToolbarControls so it doesn't create duplicate buttons or the non-working switch
  // Look for function injectStudioToolbarControls() { ... }
  const injectStart = 'function injectStudioToolbarControls() {';
  const injectIdx = code.indexOf(injectStart);
  if (injectIdx !== -1) {
    const nextFuncIdx = code.indexOf('// --------------------------------------------------------------------------------------------\n  // 8. MỞ PHÒNG DỰNG VIDEO EDITOR STUDIO', injectIdx);
    if (nextFuncIdx !== -1) {
      const cleanInjectCode = `function injectStudioToolbarControls() {
    // Dọn dẹp các nút cũ nếu có
    const oldSwitch = document.getElementById('aiforge-automerge-switch-btn');
    if (oldSwitch) oldSwitch.remove();
    const oldEditor = document.getElementById('aiforge-open-editor-btn');
    if (oldEditor) oldEditor.remove();
    // Nút "Biên tập video" đã được tích hợp chuẩn xác trực tiếp trong React VideoStudio
    return;
  }

  `;
      code = code.substring(0, injectIdx) + cleanInjectCode + code.substring(nextFuncIdx);
    }
  }

  // 3. Update openVideoEditorStudio to immediately call window.__openAiforgeVideoEditorModal
  const openFnStart = 'async function openVideoEditorStudio(initialAssetIds = []) {';
  const openIdx = code.indexOf(openFnStart);
  if (openIdx !== -1) {
    const timerStr = 'setTimeout(() => clearInterval(timer), 3000);';
    const timerIdx = code.indexOf(timerStr, openIdx);
    if (timerIdx !== -1) {
      const endOfCheck = code.indexOf('return;', timerIdx) + 'return;'.length;
      const cleanOpenCode = `async function openVideoEditorStudio(initialAssetIds = []) {
    if (typeof window.__openAiforgeVideoEditorModal === 'function') {
      window.__openAiforgeVideoEditorModal(initialAssetIds);
      return;
    }
    return;`;
      code = code.substring(0, openIdx) + cleanOpenCode + code.substring(endOfCheck);
    }
  }

  fs.writeFileSync(filePath, code, 'utf8');
  console.log('✓ Cleaned and updated:', filePath);
}
