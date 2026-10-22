const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function getSecMsGec() {
  const WIN_EPOCH = 11644473600n;
  const nowUnixSec = BigInt(Math.floor(Date.now() / 1000));
  const ticks = (nowUnixSec + WIN_EPOCH) * 10000000n;
  const roundedTicks = ticks - (ticks % 3000000000n);
  const strToHash = roundedTicks.toString() + '6A5AA1D4EAFF4E9FB37E23D68491D6F4';
  return crypto.createHash('sha256').update(strToHash, 'ascii').digest('hex').toUpperCase();
}

async function testEdgeTTSWithGec() {
  const TRUSTED_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';
  const gec = getSecMsGec();
  const gecVersion = '1-130.0.2849.68';
  console.log('Generated Sec-MS-GEC:', gec);

  const url = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${TRUSTED_TOKEN}&Sec-MS-GEC=${gec}&Sec-MS-GEC-Version=${gecVersion}`;
  console.log('Connecting to:', url);

  const ws = new WebSocket(url);
  const reqId = crypto.randomUUID().replace(/-/g, '');

  ws.onopen = () => {
    console.log('🎉 CONNECTED TO EDGE TTS WEBSOCKET!');
    
    // Send speech config
    const configMsg = 'Content-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n' + JSON.stringify({
      context: {
        synthesis: {
          audio: {
            metadataoptions: { sentenceBoundaryEnabled: 'false', wordBoundaryEnabled: 'true' },
            outputFormat: 'audio-24khz-48kbitrate-mono-mp3'
          }
        }
      }
    });
    ws.send(configMsg);

    // Send SSML
    const text = 'Xin chào các bạn, hôm nay mình sẽ review cho mọi người chiếc ba lô siêu xinh và tiện lợi này nhé!';
    const voice = 'vi-VN-HoaiMyNeural'; // High quality female neural voice
    const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="vi-VN"><voice name="${voice}"><prosody rate="0%" pitch="0%">${text}</prosody></voice></speak>`;
    const ssmlMsg = `X-RequestId:${reqId}\r\nContent-Type:application/ssml+xml\r\nPath:ssml\r\n\r\n${ssml}`;
    ws.send(ssmlMsg);
  };

  const chunks = [];
  ws.onmessage = async (event) => {
    const data = event.data;
    if (typeof data === 'string') {
      if (data.includes('Path:turn.end')) {
        console.log('Turn ended!');
        ws.close();
        const total = Buffer.concat(chunks);
        console.log('🎉 SUCCESS! Total audio received:', total.length, 'bytes');
        const outPath = path.join(__dirname, '../scratch/test_edge_hoaimy.mp3');
        fs.writeFileSync(outPath, total);
        console.log('Saved to:', outPath);
        process.exit(0);
      }
    } else if (data instanceof Blob) {
      const buf = Buffer.from(await data.arrayBuffer());
      const headerEnd = buf.indexOf(Buffer.from('\r\n\r\n'));
      if (headerEnd !== -1) {
        const audioData = buf.subarray(headerEnd + 4);
        chunks.push(audioData);
      }
    }
  };

  ws.onerror = (err) => {
    console.error('WS Error:', err);
  };

  setTimeout(() => {
    console.log('Timeout after 10s');
    process.exit(1);
  }, 10000);
}

testEdgeTTSWithGec();
