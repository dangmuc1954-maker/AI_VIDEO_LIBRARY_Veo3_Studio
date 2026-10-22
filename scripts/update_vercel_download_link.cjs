const fs = require('fs');
const path = require('path');

const oldLink = 'https://drive.google.com/file/d/1TBf4KROW86kzxUO7jjqALK6n72oFtddG/view?usp=drive_link';
const newLink = 'https://drive.google.com/file/d/1fPsbP72500JKiExlzt1UNE0Cai6yWabX/view?usp=drive_link';

const oldId = '1TBf4KROW86kzxUO7jjqALK6n72oFtddG';
const newId = '1fPsbP72500JKiExlzt1UNE0Cai6yWabX';

// 1. vercel_server/public/index.html
const pIndex = path.join(__dirname, '../vercel_server/public/index.html');
if (fs.existsSync(pIndex)) {
  let c = fs.readFileSync(pIndex, 'utf8');
  if (c.includes(oldLink)) {
    c = c.replaceAll(oldLink, newLink);
    fs.writeFileSync(pIndex, c, 'utf8');
    console.log('✅ Updated download link in vercel_server/public/index.html');
  } else {
    console.log('Link not found or already updated in public/index.html');
  }
}

// 2. vercel_server/public/admin/index.html
const pAdmin = path.join(__dirname, '../vercel_server/public/admin/index.html');
if (fs.existsSync(pAdmin)) {
  let c = fs.readFileSync(pAdmin, 'utf8');
  if (c.includes(oldLink)) {
    c = c.replaceAll(oldLink, newLink);
    fs.writeFileSync(pAdmin, c, 'utf8');
    console.log('✅ Updated download link in vercel_server/public/admin/index.html');
  } else {
    console.log('Link not found or already updated in public/admin/index.html');
  }
}

// 3. vercel_server/api/index.js
const pApi = path.join(__dirname, '../vercel_server/api/index.js');
if (fs.existsSync(pApi)) {
  let c = fs.readFileSync(pApi, 'utf8');
  if (c.includes(oldId)) {
    c = c.replaceAll(oldId, newId);
    fs.writeFileSync(pApi, c, 'utf8');
    console.log('✅ Updated fileId in vercel_server/api/index.js');
  } else {
    console.log('fileId not found or already updated in api/index.js');
  }
}
