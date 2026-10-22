const fs = require('fs');
const path = require('path');

async function testMainProcessCode() {
  const N = path.join;
  const Nn = path.join(__dirname, '../app/out/main');
  const nodeFs = fs;

  const possibleTransformers = [
    N(Nn, "../node_modules/@xenova/transformers/src/transformers.js"),
    N(Nn, "../../node_modules/@xenova/transformers/src/transformers.js"),
    N(process.resourcesPath || "", "app/node_modules/@xenova/transformers/src/transformers.js"),
    "D:/dự án antigravity/AIForge_Veo3_Studio/app/node_modules/@xenova/transformers/src/transformers.js"
  ];

  const possibleModelDirs = [
    N(Nn, "../models"),
    N(Nn, "../../models"),
    N(process.env.APPDATA || "", "AI_VIDEO_LIBRARY_DATA/models"),
    N(process.resourcesPath || "", "app/models"),
    "D:/dự án antigravity/AIForge_Veo3_Studio/app/models"
  ];

  let modPath = "";
  for (const p of possibleTransformers) {
    console.log('Testing path:', p, 'exists:', nodeFs.existsSync(p));
    if (nodeFs.existsSync(p)) {
      modPath = p;
      break;
    }
  }

  console.log('Chosen modPath:', modPath);
  if (modPath) {
    const modUrl = "file:///" + modPath.replace(/\\/g, "/");
    console.log('Importing modUrl:', modUrl);
    try {
      const { pipeline, env } = await import(modUrl);
      console.log('Successfully imported pipeline & env!');

      let chosenModelDir = "";
      for (const md of possibleModelDirs) {
        console.log('Testing model dir:', md, 'exists:', nodeFs.existsSync(md));
        if (nodeFs.existsSync(md)) {
          chosenModelDir = md;
          break;
        }
      }
      console.log('Chosen modelDir:', chosenModelDir);
      if (chosenModelDir) env.cacheDir = chosenModelDir;
      env.allowLocalModels = true;
      env.allowRemoteModels = true;

      console.log('Loading pipeline whisper-base...');
      const transcriber = await pipeline("automatic-speech-recognition", "Xenova/whisper-base");
      console.log('Loaded transcriber successfully!');
    } catch (err) {
      console.error('Error during import or pipeline:', err);
    }
  }
}

testMainProcessCode().catch(console.error);
