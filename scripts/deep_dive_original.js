const fs = require('fs');

const orig = fs.readFileSync('extracted_aiforge_studio_new/out/main/index.js', 'utf8');

console.log('=== DEEP DIVE INTO ORIGINAL AIForge Studio SOURCE ===\n');

// 1. Provider Definition
const pIdx = orig.indexOf('id:"veo3"');
console.log('1. Provider Definition:');
console.log(orig.slice(pIdx - 50, pIdx + 250));

// 2. detectPageState for Google Flow
let dpsIdx = 0;
while ((dpsIdx = orig.indexOf('detectPageState', dpsIdx)) !== -1) {
  const snippet = orig.slice(dpsIdx, dpsIdx + 500);
  if (snippet.includes('google') || snippet.includes('flow') || snippet.includes('emailRegex')) {
    console.log('\n2. detectPageState snippet at ' + dpsIdx + ':');
    console.log(orig.slice(dpsIdx, dpsIdx + 1200));
    break;
  }
  dpsIdx += 15;
}

// 3. isGoogleFlowUrl and readyUrlPatterns
let rIdx = orig.indexOf('isGoogleFlowUrl');
console.log('\n3. isGoogleFlowUrl at ' + rIdx + ':');
console.log(orig.slice(rIdx - 50, rIdx + 400));

// 4. AuthService (fetchAccessToken, readSessionToken, ensureAccessToken)
let fatIdx = orig.indexOf('async fetchAccessToken(');
console.log('\n4. fetchAccessToken at ' + fatIdx + ':');
console.log(orig.slice(fatIdx, fatIdx + 1200));

let rstIdx = orig.indexOf('async readSessionToken(');
console.log('\n5. readSessionToken at ' + rstIdx + ':');
console.log(orig.slice(rstIdx, rstIdx + 600));

// 6. ProjectService (createProject, ensureProject)
let cpIdx = orig.indexOf('async createProject(');
console.log('\n6. createProject at ' + cpIdx + ':');
console.log(orig.slice(cpIdx, cpIdx + 800));

// 7. runVideoJob for Veo3
let rvjIdx = orig.indexOf('providerId==="veo3"');
console.log('\n7. Veo3 in runVideoJob at ' + rvjIdx + ':');
console.log(orig.slice(rvjIdx - 100, rvjIdx + 1200));
