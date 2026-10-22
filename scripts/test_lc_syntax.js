const fs = require('fs');

try {
  const content = fs.readFileSync('app/out/renderer/assets/LicenseCenter-CK2ppPZf.js', 'utf8');
  // Check imports
  console.log('File size:', content.length);
  // Simple check for braces
  let open = 0;
  for (let i = 0; i < content.length; i++) {
    if (content[i] === '{') open++;
    else if (content[i] === '}') open--;
  }
  console.log('Braces balanced:', open === 0);

  // Check Ta function definition
  const idx = content.indexOf('function Ta(');
  console.log('Snippet around Ta:');
  console.log(content.slice(idx - 20, idx + 400));
} catch(e) {
  console.error('Error:', e);
}
