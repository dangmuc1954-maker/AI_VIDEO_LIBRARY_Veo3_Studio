const cp = require('child_process');
const fs = require('fs');

const proc = cp.spawnSync('node', ['--check', 'scratch/temp_syntax.js'], { encoding: 'utf8' });
console.log('Status:', proc.status);
console.log('Stderr lines count:', proc.stderr.split('\n').length);
const lines = proc.stderr.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('^')) {
    const col = lines[i].indexOf('^');
    console.log('Found caret line', i, 'column', col);
    const errLine = lines[i - 1];
    console.log('Error context in errLine:');
    console.log(errLine.slice(Math.max(0, col - 40), Math.min(errLine.length, col + 40)));
  }
}
