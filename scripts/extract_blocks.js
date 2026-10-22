const fs = require('fs');
const code = fs.readFileSync('./extracted_original/out/main/index.js', 'utf8');

function getBlock(startStr, endStr) {
  const s = code.indexOf(startStr);
  const e = code.indexOf(endStr, s);
  return code.slice(s, e + endStr.length);
}

const blocks = {
  p1: getBlock('getCachedPayload(){if(!this.cachedPayload)', 'return this.cachedPayload}'),
  p2: getBlock('async assertCanCreateJob(e){if(this.isDevBypassEnabled())', 'Upgrade or wait for renewal.`,!0)}}'),
  p3: getBlock('async assertCanRunJob(e){this.isDevBypassEnabled()', 'await this.assertCanCreateJob(e)}'),
  p4: getBlock('async assertFeature(e){if(this.isDevBypassEnabled())', 'Your license does not include this feature")}'),
  p5: getBlock('async assertCanResumeQueue(){if(this.isDevBypassEnabled())', 'message||"License required")}'),
  p6: getBlock('async reserveUsageForJob(e,t){const o=Mo(e);', 'responseBody}):i}}')
};

fs.writeFileSync('./scripts/blocks.json', JSON.stringify(blocks, null, 2));
console.log('Saved blocks.json successfully!');
