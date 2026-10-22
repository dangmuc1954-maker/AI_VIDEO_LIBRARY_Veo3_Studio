const fs = require('fs');
const s = fs.readFileSync('app/out/renderer/assets/ImageStudio-4nmpUX3j.js', 'utf8');

// 1. Top table prompt cell
const cellIdx = s.indexOf('ge?a.prompt:e.jsx');
console.log('Cell snippet:');
console.log(s.substring(cellIdx - 60, cellIdx + 120));

// 2. Grid card prompt cell
const gridIdx = s.indexOf('leading-4 text-white drop-shadow",children:m.prompt');
console.log('Grid snippet:');
console.log(s.substring(gridIdx - 120, gridIdx + 100));

// 3. Modal title Ee
const modalIdx = s.indexOf('Ee=o?.prompt||n.prompt');
console.log('Modal Ee snippet:');
console.log(s.substring(modalIdx - 50, modalIdx + 150));

// 4. List view prompt
const listIdx = s.indexOf('truncate text-sm font-semibold text-text-primary",children:M.prompt.trim()');
console.log('List snippet:');
console.log(s.substring(listIdx - 50, listIdx + 120));
