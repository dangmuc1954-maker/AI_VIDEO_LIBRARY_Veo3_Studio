const fs = require('fs');
const vm = require('vm');
const code = fs.readFileSync('app/out/main/index.js', 'utf8');

const start = code.indexOf('async cacheQueueAsset(e,t,A){');
const end = code.indexOf('async downloadRemoteAsset(e,t,A=Hs){', start);
const methodStr = code.substring(start, end);

// Let's test with acorn or format nicely
function testCode(c) {
  try {
    new vm.Script('class T {\n' + c + '\n}');
    return true;
  } catch(e) {
    return e.message;
  }
}

console.log('Original test:', testCode(methodStr));
