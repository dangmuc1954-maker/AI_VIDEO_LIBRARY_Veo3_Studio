const fs = require('fs');
const path = require('path');

const s1 = fs.readFileSync(path.join(__dirname, 'extracted/WorkflowStore.js'), 'utf-8');
console.log('WorkflowStore.js length:', s1.length);
console.log('First 1000 chars:\n', s1.substring(0, 1000));

// Find any string literals in s1
const strings = s1.match(/"([^"\\]|\\.)*"|'([^'\\]|\\.)*'/g) || [];
console.log('Total string literals in WorkflowStore:', strings.length);

const interesting = strings.filter(s => {
  const l = s.toLowerCase();
  return l.includes('workflow') || l.includes('store') || l.includes('api') || l.includes('http') || l.includes('buy') || l.includes('mua') || l.includes('tải') || l.includes('giá');
});

console.log('Interesting strings in WorkflowStore:', interesting.slice(0, 50));
