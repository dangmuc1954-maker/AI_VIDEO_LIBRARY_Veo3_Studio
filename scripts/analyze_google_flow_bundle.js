const fs = require('fs');

async function analyzeFlowBundle() {
  const bundleUrl = 'https://www.gstatic.com/_/mss/boq-labs-ai-sandbox/_/js/k=boq-labs-ai-sandbox.AiSandboxAngularFrontend.en_US.4VUdhqiXTI4.2018.O/d=1/excm=_b/ed=1/dg=0/br=1/wt=2/ujg=1/rs=APwUF7zjHEjSZsbpdPekfkkb4hS3ms2p-A/ee=Pjplud:PoEs9b;QGR0gd:Mlhmy;ScI3Yc:e7Hzgb;YIZmRd:A1yn5d;cEt90b:ws9Tlc;dowIGb:ebZ3mb/dti=1/m=_b';
  
  console.log('Downloading Google Flow bundle from:', bundleUrl);
  const res = await fetch(bundleUrl);
  const code = await res.text();
  console.log('Bundle downloaded! Size:', code.length, 'bytes');

  fs.writeFileSync('temp_flow_bundle.js', code);

  const searches = [
    'aisandbox-pa',
    'batchGenerateVideos',
    'flowMedia',
    'credits',
    'Authorization',
    'Bearer',
    'ya29',
    'oauth',
    'access_token',
    'SAPISIDHASH',
    'WIZ_global_data',
    'AF_initData'
  ];

  for (const s of searches) {
    const count = (code.match(new RegExp(s, 'gi')) || []).length;
    console.log(`Search for "${s}": ${count} matches`);
    
    // Show first 2 snippets
    let pos = 0;
    for (let i = 0; i < Math.min(2, count); i++) {
      pos = code.toLowerCase().indexOf(s.toLowerCase(), pos);
      if (pos === -1) break;
      console.log(`  [Match ${i+1} at ${pos}]:`);
      console.log('  ' + code.slice(Math.max(0, pos - 80), Math.min(code.length, pos + 180)).replace(/\n/g, ' '));
      pos += s.length;
    }
  }
}

analyzeFlowBundle().catch(console.error);
