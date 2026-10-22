const fs = require('fs');

console.log('=== Comparing Image Generation Payloads ===');

// 1. Công xưởng (lines 3668-3685 in VideoFactoryStudio.js):
console.log(`
--- CÔNG XƯỞNG (Gia dụng) ---
payload: {
  title: ...
  prompt: promptForScene,
  ratio: "9:16",
  model: "banana",
  modelDisplayName: "🍌 Nano Banana Pro",
  referenceAssetIds: refIds,
  studioSource: "video-factory",
  removeWatermark: removeWatermark,
  autoRemoveWatermark: removeWatermark,
  upsampleResolution: imageResolution === '2k' ? '2K' : 'Full HD',
  resolution: imageResolution === '2k' ? '2K' : 'Standard',
  quality: imageResolution === '2k' ? '2K' : 'Standard',
  imageResolution: imageResolution,
  upscale2k: imageResolution === '2k',
  accountSelection: (selectedBananaAccountId && selectedBananaAccountId !== "auto") ? "manual" : "auto"
}
`);

// 2. Xưởng thời trang (lines 1614-1628):
console.log(`
--- XƯỞNG THỜI TRANG (Fashion) ---
payload: {
  title: ...
  prompt: finalPrompt,
  ratio: "9:16",
  aspectRatio: "9:16",
  referenceAssetIds: refs,
  model: "banana",
  modelDisplayName: FASHION_IMAGE_MODEL,
  studioSource: "fashion-factory",
  autoRemoveWatermark: cs.removeWatermark,
  removeWatermark: cs.removeWatermark,
  upscale2k: cs.imageResolution === '2k',
  resolutionName: cs.imageResolution === '2k' ? "2K" : "1K",
  accountSelection: isManual ? "manual" : "auto"
}
`);
