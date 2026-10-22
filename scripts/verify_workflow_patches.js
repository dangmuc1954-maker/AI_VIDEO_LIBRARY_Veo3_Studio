const { execSync } = require('child_process');

const files = [
  'app/out/main/index.js',
  'app/out/preload/index.cjs',
  'app/out/renderer/assets/useWorkflowRunner-BmcV20yZ.js',
  'app/out/renderer/assets/WorkflowEditor-BFJj-KsD.js',
  'app/out/renderer/assets/index-8u8DZic4.js'
];

for (const f of files) {
  try {
    execSync(`node --check "${f}"`, { stdio: 'inherit' });
    console.log('[PASS]', f);
  } catch (e) {
    console.error('[FAIL]', f);
    process.exit(1);
  }
}

console.log('\n✅ TẤT CẢ FILE ĐỀU HỢP LỆ VỀ CÚ PHÁP 100%!');
