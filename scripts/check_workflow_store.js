const fs = require('fs');

const store = fs.readFileSync('app/out/renderer/assets/WorkflowStore-BIvOZ42B.js', 'utf8');

console.log('Searching in WorkflowStore-BIvOZ42B.js:');
let p = store.indexOf('case"prompt":');
console.log('case"prompt": at', p);
if (p !== -1) {
  console.log(store.slice(p - 50, p + 250));
}

let p2 = store.indexOf('select-item');
console.log('select-item in store at', p2);
if (p2 !== -1) {
  console.log(store.slice(p2 - 50, p2 + 250));
}
