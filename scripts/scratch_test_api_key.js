const fs = require('fs');
const path = require('path');

// Read cookies from partition
const cookiePath = path.join(process.env.APPDATA, 'AI_VIDEO_LIBRARY_DATA', 'Partitions', 'aivideo%3Aveo3-1788597242484', 'Network', 'Cookies');
let cookieHeader = '';

if (fs.existsSync(cookiePath)) {
  const dst = 'temp_ck_test.db';
  fs.copyFileSync(cookiePath, dst);
  try {
    const { DatabaseSync } = require('node:sqlite');
    const db = new DatabaseSync(dst, { open: true, readOnly: true });
    const rows = db.prepare('SELECT host_key, name, value, encrypted_value FROM cookies').all();
    console.log('Found cookies:', rows.length);
    // In Chromium, encrypted_value needs DPAPI decryption on Windows!
    db.close();
  } catch (e) {
    console.log('Error reading db:', e.message);
  } finally {
    if (fs.existsSync(dst)) fs.unlinkSync(dst);
  }
}

async function testApiKey() {
  const apiKey = "YOUR_GEMINI_API_KEY";
  const url = `https://aisandbox-pa.googleapis.com/v1/credits?key=${apiKey}`;
  console.log('Calling:', url);
  try {
    const res = await fetch(url, {
      headers: {
        'Origin': 'https://flow.google.com',
        'Referer': 'https://flow.google.com/'
      }
    });
    console.log('Status with API Key:', res.status);
    const text = await res.text();
    console.log('Response:', text);
  } catch (e) {
    console.log('Error:', e.message);
  }
}

testApiKey();
