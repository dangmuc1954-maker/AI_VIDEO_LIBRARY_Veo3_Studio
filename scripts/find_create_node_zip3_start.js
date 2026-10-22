const fs = require('fs');

const zip3Editor = fs.readFileSync('scratch/zip3_source_app/resources/app/out/renderer/assets/WorkflowEditor-BFJj-KsD.js', 'utf8');

const p = zip3Editor.indexOf('outputs:[{id:`${r}-out-item`');
console.log(zip3Editor.slice(p - 600, p));
