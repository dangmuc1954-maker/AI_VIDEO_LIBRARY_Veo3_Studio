const fs = require('fs');

const origRunner = fs.readFileSync('scratch/original_aiforge_out/out/renderer/assets/useWorkflowRunner-DAbEdQEt.js', 'utf8');
const appRunner = fs.readFileSync('app/out/renderer/assets/useWorkflowRunner-BmcV20yZ.js', 'utf8');

console.log('Original Runner size:', origRunner.length);
console.log('App Runner size:', appRunner.length);

// Extract all switch/if cases on node type or node.type in both runners
function extractRunnerNodeTypes(content) {
  const types = new Set();
  // match case "node-type": or type === "node-type" or type: "node-type"
  const regex = /(?:case\s*["']([^"']+)["']|type\s*===\s*["']([^"']+)["']|\.type\s*===\s*["']([^"']+)["'])/g;
  let m;
  while ((m = regex.exec(content)) !== null) {
    const t = m[1] || m[2] || m[3];
    if (t && !t.includes(' ') && t.length < 30) {
      types.add(t);
    }
  }
  return Array.from(types).sort();
}

const origRunnerTypes = extractRunnerNodeTypes(origRunner);
const appRunnerTypes = extractRunnerNodeTypes(appRunner);

console.log('\n--- Original Runner Node Types (' + origRunnerTypes.length + ') ---');
console.log(origRunnerTypes);

console.log('\n--- App Runner Node Types (' + appRunnerTypes.length + ') ---');
console.log(appRunnerTypes);

const missingInAppRunner = origRunnerTypes.filter(t => !appRunnerTypes.includes(t));
const addedInAppRunner = appRunnerTypes.filter(t => !origRunnerTypes.includes(t));

console.log('\n--- RUNNER COMPARISON ---');
console.log('Missing in App Runner:', missingInAppRunner);
console.log('Added in App Runner:', addedInAppRunner);
