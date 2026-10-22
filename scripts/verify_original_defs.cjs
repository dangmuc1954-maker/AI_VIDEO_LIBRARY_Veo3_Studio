const fs = require('fs');
const path = require('path');

const orig1 = JSON.parse(fs.readFileSync('scripts/original_cmtv9z12500qznx01eyewy9i2.json', 'utf-8'));
const orig2 = JSON.parse(fs.readFileSync('scripts/original_cmtcbvpbp000gms01hcoqwwug.json', 'utf-8'));

console.log('--- Workflow 1 ---');
console.log('ID:', orig1.product.id);
console.log('Name:', orig1.product.name);
console.log('Nodes count:', orig1.definition.nodes.length);
console.log('Connections count:', orig1.definition.connections.length);

console.log('--- Workflow 2 ---');
console.log('ID:', orig2.product.id);
console.log('Name:', orig2.product.name);
console.log('Nodes count:', orig2.definition.nodes.length);
console.log('Connections count:', orig2.definition.connections.length);
