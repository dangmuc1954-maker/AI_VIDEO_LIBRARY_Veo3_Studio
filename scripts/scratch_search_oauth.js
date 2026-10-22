const fs = require('fs');

function search(file) {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf8');
  const terms = ['googleusercontent.com', 'client_id', 'accounts.google.com/o/oauth2', 'oauth2/v4/token', 'token_endpoint'];
  for (const t of terms) {
    let pos = 0;
    while ((pos = content.indexOf(t, pos)) !== -1) {
      console.log(`Found "${t}" in ${file} at ${pos}:`);
      console.log(content.slice(Math.max(0, pos - 100), Math.min(content.length, pos + 250)));
      pos += t.length;
    }
  }
}

search('app/out/main/index.js');
search('extracted_original/out/main/index.js');
search('extracted_aiforge_studio_new/out/main/index.js');
search('temp_flow_bundle.js');
