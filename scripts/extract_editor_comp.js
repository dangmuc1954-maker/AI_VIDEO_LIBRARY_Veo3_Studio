const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'extracted_aiforge_studio', 'out', 'renderer', 'assets', 'VideoStudio-CbTMj2SN.js');
const content = fs.readFileSync(file, 'utf8');

// Find start and end of the component around 99351
const targetIdx = content.indexOf('videoStudio.noSegmentsToMerge');
console.log('targetIdx:', targetIdx);

// Let's find the component name / function declaration before targetIdx
const before = content.slice(Math.max(0, targetIdx - 15000), targetIdx);
console.log('Search before for function declaration...');
// Find function
const lines = before.split('function ');
console.log('Last function declaration:', lines[lines.length - 1].slice(0, 150));

// Let's extract the full component from that function declaration to its end
const compStartIndex = targetIdx - lines[lines.length - 1].length - 'function '.length;
console.log('Component starts around:', compStartIndex);

// Let's also see what i18n keys are used in this component
const compSlice = content.slice(compStartIndex, targetIdx + 15000);
fs.writeFileSync(path.join(__dirname, '..', 'extracted_editor_comp.js'), compSlice);
console.log('Wrote extracted_editor_comp.js, length:', compSlice.length);
