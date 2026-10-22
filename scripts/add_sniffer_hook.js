const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetFile = path.resolve('app/out/main/index.js');
let code = fs.readFileSync(targetFile, 'utf8');

const targetAnchor = 'return this.views.set(e.accountId,n),this.installGrokNetworkDiagnostics(n),n}';
const replacementAnchor = 'return this.views.set(e.accountId,n),this.installGrokNetworkDiagnostics(n),this.installGoogleFlowNetworkSniffer(n),n}';

if (code.includes(targetAnchor)) {
  code = code.replace(targetAnchor, replacementAnchor);
  console.log('[OK] Hooked installGoogleFlowNetworkSniffer call into getOrCreateView');
} else {
  console.error('[FAIL] targetAnchor not found');
  process.exit(1);
}

const methodDef = `installGoogleFlowNetworkSniffer(e){
    if(e.providerId!=="veo3"&&e.providerId!=="banana")return;
    try{
      const sess=e.view.webContents.session;
      sess.webRequest.onBeforeSendHeaders(
        {urls:["*://*.googleapis.com/*","*://flow.google.com/*","*://labs.google/*","*://*.google.com/*"]},
        (details,callback)=>{
          try{
            const hdrs=details.requestHeaders||{};
            const auth=hdrs["Authorization"]||hdrs["authorization"]||hdrs["AUTHORIZATION"];
            if(typeof auth==="string"&&auth.startsWith("Bearer ya29.")){
              const token=auth.slice(7).trim();
              if(token&&typeof Le!=="undefined"&&Le?.patchAccount){
                Le.patchAccount(e.accountId,{
                  accessToken:token,
                  accessTokenValidatedAt:new Date().toISOString()
                });
                if(typeof C!=="undefined"&&C?.completeProviderApiRecovery){
                  C.completeProviderApiRecovery(e.accountId,"Google Flow API token is ready.");
                }
              }
            }
          }catch(_){}
          callback({requestHeaders:details.requestHeaders});
        }
      );
    }catch(_){}
  }
  `;

const grokMethodAnchor = 'installGrokNetworkDiagnostics(e){';
if (code.includes(grokMethodAnchor)) {
  code = code.replace(grokMethodAnchor, methodDef + grokMethodAnchor);
  console.log('[OK] Added installGoogleFlowNetworkSniffer method body');
} else {
  console.error('[FAIL] grokMethodAnchor not found');
  process.exit(1);
}

fs.writeFileSync(targetFile, code, 'utf8');
console.log(`[DONE] File written. Length: ${code.length}`);

try {
  execSync(`node --check "${targetFile}"`);
  console.log('🌟 SYNTAX VALID 100%! ZERO ERRORS! 🌟');
} catch (err) {
  console.error('❌ SYNTAX ERROR:', err.message);
  process.exit(1);
}
