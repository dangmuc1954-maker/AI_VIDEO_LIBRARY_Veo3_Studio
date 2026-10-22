const fs = require('fs');
const vm = require('vm');

let script = fs.readFileSync('scripts/generated_zu_script.js', 'utf8');

// Replace both comment lines
script = script.split('window.location.pathname.match(//project/([a-zA-Z0-9_-]+)/);').join('window.location.pathname.match(new RegExp("/project/([a-zA-Z0-9_-]+)"));');
script = script.split("projectLink.getAttribute('href').match(//project/([a-zA-Z0-9_-]+)/);").join("projectLink.getAttribute('href').match(new RegExp('/project/([a-zA-Z0-9_-]+)'));");

try {
  new vm.Script(script);
  console.log("SUCCESS! Script is 100% valid JavaScript without any syntax errors!");
} catch(e) {
  console.log("Still error:", e.message);
}
