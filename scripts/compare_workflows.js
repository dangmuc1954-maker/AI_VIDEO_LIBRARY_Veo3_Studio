const fs = require('fs');
const path = require('path');

function analyzeNodes(dirPath) {
  const files = fs.readdirSync(dirPath);
  const editorFile = files.find(f => f.startsWith('WorkflowEditor-') && f.endsWith('.js'));
  const runnerFile = files.find(f => f.startsWith('useWorkflowRunner-') && f.endsWith('.js'));

  const editorContent = fs.readFileSync(path.join(dirPath, editorFile), 'utf8');
  const runnerContent = fs.readFileSync(path.join(dirPath, runnerFile), 'utf8');

  // Let's find all node types by looking for node definitions: type: "..." or slug: "..."
  const types = new Set();
  const slugRegex = /slug:\s*["']([^"']+)["']/g;
  let m;
  while ((m = slugRegex.exec(editorContent)) !== null) {
    types.add(m[1]);
  }

  // Also in runner
  const runnerTypes = new Set();
  const runnerSlugRegex = /type:\s*["']([^"']+)["']/g;
  while ((m = runnerSlugRegex.exec(runnerContent)) !== null) {
    if (m[1].length < 30 && !m[1].includes(' ') && !m[1].includes('/')) {
      runnerTypes.add(m[1]);
    }
  }

  return {
    editorFile,
    runnerFile,
    editorSize: editorContent.length,
    runnerSize: runnerContent.length,
    slugs: Array.from(types).sort(),
    runnerTypes: Array.from(runnerTypes).sort()
  };
}

const orig = analyzeNodes('scratch/original_aiforge_out/out/renderer/assets');
const app = analyzeNodes('app/out/renderer/assets');

console.log('=== ORIGINAL WORKFLOW NODES ===');
console.log('Editor file:', orig.editorFile, '(', orig.editorSize, 'bytes)');
console.log('Runner file:', orig.runnerFile, '(', orig.runnerSize, 'bytes)');
console.log('Node slugs (' + orig.slugs.length + '):', orig.slugs);

console.log('\n=== APP WORKFLOW NODES ===');
console.log('Editor file:', app.editorFile, '(', app.editorSize, 'bytes)');
console.log('Runner file:', app.runnerFile, '(', app.runnerSize, 'bytes)');
console.log('Node slugs (' + app.slugs.length + '):', app.slugs);

// Compare differences
const missingInApp = orig.slugs.filter(s => !app.slugs.includes(s));
const newInApp = app.slugs.filter(s => !orig.slugs.includes(s));
console.log('\n=== DIFFERENCES ===');
console.log('Missing in App:', missingInApp);
console.log('New in App:', newInApp);
