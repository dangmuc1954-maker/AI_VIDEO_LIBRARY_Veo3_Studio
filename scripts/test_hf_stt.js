const fs = require('fs');
const path = require('path');

async function testHuggingFace() {
  const audio = fs.readFileSync(path.join(__dirname, '../scratch/test_extracted.wav'));
  console.log('Sending WAV to Hugging Face Inference API...');
  
  const models = [
    'openai/whisper-large-v3-turbo',
    'openai/whisper-small',
    'vinai/PhoWhisper-base'
  ];

  for (const model of models) {
    try {
      console.log('Testing model:', model);
      const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'audio/wav'
        },
        body: audio
      });
      console.log('Status:', res.status);
      const data = await res.json();
      console.log('Result:', data);
    } catch (e) {
      console.error('Error:', e.message);
    }
  }
}

testHuggingFace();
