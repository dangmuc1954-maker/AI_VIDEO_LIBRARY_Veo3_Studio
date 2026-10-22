const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

function testPattern(pattern, name) {
  const match = content.match(pattern);
  if (!match) {
    console.error('FAILED TO MATCH: ' + name);
    process.exit(1);
  }
  console.log('MATCHED: ' + name + ' (len: ' + match[0].length + ')');
}

testPattern(/isGoogleFlowUrl\(e\)\{try\{const t=new URL\(e\);return t\.hostname==="labs\.google"&&t\.pathname\.startsWith\("\/fx"\)\}catch\{return!1\}\}/, 'isGoogleFlowUrl');
testPattern(/readyUrlPatterns:\[\/labs\\\.google\\\/fx\/i\]/g, 'readyUrlPatterns');
testPattern(/async readCredits\(e\)\{try\{return await this\.requestCredits\(e\)\}catch\(t\)\{if\(t instanceof m&&t\.code==="AUTH_REQUIRED"\)throw t;return b\("google-flow-auth","access token credits validation skipped",\{error:T\(t\)\}\),null\}\}/, 'readCredits');
testPattern(/failProviderApiRecovery\(e,t\)\{this\.sessions=this\.sessions\.map\(o=>o\.accountId!==e\?o:\{[^}]+viewState:"Needs Attention"[^}]+\}\),this\.emit\(\),this\.save\(\)\}/, 'failProviderApiRecovery');
testPattern(/canRunJobSession\(e\)\{if\(!e\)return!0;const t=this\.sessions\.find\(o=>o\.accountId===e\);return!t\|\|t\.viewState!=="Needs Attention"&&t\.viewState!=="Attaching"&&!Me\(t\)\}/, 'canRunJobSession');
console.log('ALL BASIC PATTERNS FOUND SUCCESSFULLY!');
