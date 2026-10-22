const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('app/out/main/index.js', 'utf8');

const qe = {
  version: 'bundled-rpc-v1',
  rpcIds: {
    imageGenerate: 'ogiZ0b',
    imageUpload: 'maseQ',
    imageUpscale2K: 'SPrCad',
    videoT2v: 'YhhmEf',
    videoI2v: 'eb1hJf',
    videoFrames: 'nprQif',
    videoR2v: 'MZZa6b',
    videoStatus: 'jwpduf',
    videoMedia: 'as29s',
    videoUpscale: 'p0UkFb'
  },
  recaptcha: {
    siteKey: '6LdsFiUsAAAAAIjVDZcuLhaHiDn5nnHVXVRQGeMV',
    imageAction: 'IMAGE_GENERATION',
    videoAction: 'VIDEO_GENERATION',
    uploadAction: 'UPLOAD_IMAGE'
  },
  clientContext: {
    clientVersionNumber: 22,
    batchExecutePath: '/_/AiSandboxAngularFrontend/data/batchexecute',
    origin: 'https://flow.google.com'
  },
  image: {
    defaultModel: 'GEM_PIX_2',
    aspectRatioMapping: { '1:1': 1, '9:16': 2, '16:9': 3, '3:4': 4, '4:3': 5 }
  }
};
const Sn = '6LdsFiUsAAAAAIjVDZcuLhaHiDn5nnHVXVRQGeMV';
const Ec = Sn;

function extractFunctionWithTemplate(funcName) {
  const start = code.indexOf(`function ${funcName}(`);
  if (start === -1) return null;
  const retIdx = code.indexOf('return`', start);
  if (retIdx === -1) return null;
  let p = retIdx + 7;
  while (p < code.length) {
    if (code[p] === '\\') {
      p += 2;
      continue;
    }
    if (code[p] === '`') {
      break;
    }
    p++;
  }
  const end = code.indexOf('}', p) + 1;
  return code.slice(start, end);
}

const funcsToTest = [
  { name: 'nl', params: { prompt: 'a beautiful video', projectId: 'proj-123', modelKey: 'veo-2.0-generate-001' } },
  { name: 'zu', params: { prompt: 'a phoenix', projectId: 'proj-123', modelName: 'GEM_PIX_2', aspectRatio: '16:9' } },
  { name: 'Ku', params: { fileName: 'ref.jpg', mimeType: 'image/jpeg', base64Bytes: 'abc', projectId: 'proj-123' } },
  { name: 'Ju', params: { mediaId: 'media-123', projectId: 'proj-123' } }
];

funcsToTest.forEach(({ name, params }) => {
  const funcCode = extractFunctionWithTemplate(name);
  if (!funcCode) {
    console.log(`❌ Could not extract ${name}`);
    return;
  }
  try {
    eval(funcCode);
    const fn = eval(name);
    const generatedScript = fn({ params, rpcConfig: qe });
    new vm.Script(generatedScript);
    console.log(`✅ ${name}: GENERATED SCRIPT SYNTAX IS VALID!`);
  } catch (err) {
    console.error(`❌ ${name} FAILED:`, err.message);
  }
});
