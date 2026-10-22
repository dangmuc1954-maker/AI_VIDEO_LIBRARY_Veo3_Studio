const ngrok = require('@ngrok/ngrok');

async function testNgrok() {
  try {
    const listener = await ngrok.forward({
      addr: 8787
    });
    console.log('NGROK FORWARDED URL:', listener.url());
  } catch (err) {
    console.error('NGROK ERROR:', err.message);
  }
}

testNgrok();
