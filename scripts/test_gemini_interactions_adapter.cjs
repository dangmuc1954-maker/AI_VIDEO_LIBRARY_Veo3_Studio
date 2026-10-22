const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const mainPath = path.resolve(__dirname, '../app/out/main/index.js');
const source = fs.readFileSync(mainPath, 'utf8');
const start = source.indexOf('async function callGeminiInteraction(');
const end = source.indexOf('\nclass Ua{', start);
assert(start >= 0 && end > start, 'Gemini request helper must exist before the provider runtime');
const helper = source.slice(start, end);
const requests = [];
const call = new Function('fetch', `${helper}; return callGeminiInteraction;`)(async (url, options) => {
  requests.push({ url, options });
  return {
    ok: true,
    status: 200,
    json: async () => ({
      id: 'test-interaction-1',
      status: 'completed',
      steps: [{ type: 'model_output', content: [{ type: 'image', mime_type: 'image/png', data: 'aW1hZ2U=' }] }],
    }),
  };
});

(async () => {
  const image = await call({ model: 'gemini-nano-banana-2.1', input: [{ type: 'text', text: 'test' }] }, 'test-key', 'image');
  assert.equal(image.interactionId, 'test-interaction-1');
  assert.equal(image.block.data, 'aW1hZ2U=');
  assert.equal(requests[0].url, 'https://generativelanguage.googleapis.com/v1beta/interactions');
  assert.equal(requests[0].options.headers['x-goog-api-key'], 'test-key');
  assert.equal(new URL(requests[0].url).search, '', 'API key must not be placed in the URL');
  assert.deepEqual(JSON.parse(requests[0].options.body).input, [{ type: 'text', text: 'test' }]);

  const videoCall = new Function('fetch', `${helper}; return callGeminiInteraction;`)(async () => ({
    ok: true,
    status: 200,
    json: async () => ({ id: 'video-1', status: 'completed', steps: [{ type: 'model_output', content: [{ type: 'video', mime_type: 'video/mp4', data: 'dmlkZW8=' }] }] }),
  }));
  const video = await videoCall({ model: 'gemini-omni-1.1-flash' }, 'test-key', 'video');
  assert.equal(video.block.mime_type, 'video/mp4');
  assert.equal(video.interactionId, 'video-1');

  const methodStart = source.indexOf('async buildGeminiInput(e,t){');
  const methodEnd = source.indexOf('async runImageJobViaGemini(', methodStart);
  assert(methodStart >= 0 && methodEnd > methodStart, 'Gemini input builder must exist');
  const ProviderMethods = new Function(`return class { ${source.slice(methodStart, methodEnd)} }`)();
  const provider = new ProviderMethods();
  provider.readPrompt = (job) => job.payload.prompt;
  provider.readReferenceAssetIds = (job) => job.payload.referenceAssetIds;
  provider.assets = {
    readAssetBytes: async (id) => ({
      asset: { name: `${id}.png`, mimeType: 'image/png' },
      bytes: Buffer.from(id),
    }),
  };
  const input = await provider.buildGeminiInput({
    type: 'Video',
    payload: { prompt: 'animate the scene', duration: '8s', referenceAssetIds: ['start', 'end'] },
  }, 'Frames');
  assert.match(input[0].text, /<FIRST_FRAME> <IMAGE_REF_0> <LAST_FRAME> <IMAGE_REF_1>/);
  assert.match(input[0].text, /approximately 8 seconds/);
  assert.equal(input.filter((part) => part.type === 'image').length, 2);
  assert.equal(input[1].data, Buffer.from('start').toString('base64'));

  const rejectedCall = new Function('fetch', `${helper}; return callGeminiInteraction;`)(async () => ({
    ok: false,
    status: 403,
    json: async () => ({ error: { message: 'API key not authorized' } }),
  }));
  await assert.rejects(() => rejectedCall({}, 'test-key', 'image'), /Gemini API \(403\): API key not authorized/);
  console.log('Gemini Interactions adapter tests passed (image, video, authentication error).');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
