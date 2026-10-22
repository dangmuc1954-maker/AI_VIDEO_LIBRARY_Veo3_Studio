const fs = require('fs');

const ourEditor = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js', 'utf8');

// Check play button icon in ourEditor
let pPlay = ourEditor.indexOf('className:"fill-current"');
console.log('Play icon in our editor:');
while (pPlay !== -1) {
  console.log(ourEditor.slice(pPlay - 50, pPlay + 80));
  pPlay = ourEditor.indexOf('className:"fill-current"', pPlay + 1);
}

// Check node header icon rendering switch in ourEditor
let pIcon = ourEditor.indexOf('title:"Merge",children:');
console.log('\nMerge icon in our editor:');
if (pIcon !== -1) {
  console.log(ourEditor.slice(pIcon - 80, pIcon + 250));
}

// Check border style switch in ourEditor
let pBorder = ourEditor.indexOf('case"elevenlabs":return"border-[#fbbf24]');
console.log('\nBorder style in our editor:');
if (pBorder !== -1) {
  console.log(ourEditor.slice(pBorder - 50, pBorder + 250));
}
