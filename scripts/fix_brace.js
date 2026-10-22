const fs = require('fs');

const mainPath = 'app/out/main/index.js';
let content = fs.readFileSync(mainPath, 'utf8');

const oldErr = `catch(_vErr){console.warn("[Watermark Cleaner Video Fallback]",_vErr.message||_vErr)}}}catch(u){B("asset-store"`;
const newFixed = `catch(_vErr){console.warn("[Watermark Cleaner Video Fallback]",_vErr.message||_vErr)}}}catch(u){B("asset-store"`;

// Notice: in oldErr: after catch(_vErr){...} there are 3 braces: }}}catch(u)
// We need only 2 braces: }}catch(u)
const target = `catch(_vErr){console.warn("[Watermark Cleaner Video Fallback]",_vErr.message||_vErr)}}}catch(u)`;
const replacement = `catch(_vErr){console.warn("[Watermark Cleaner Video Fallback]",_vErr.message||_vErr)}}catch(u)`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(mainPath, content, 'utf8');
  console.log("Fixed the extra brace in main/index.js!");
} else {
  console.error("target not found!");
}
