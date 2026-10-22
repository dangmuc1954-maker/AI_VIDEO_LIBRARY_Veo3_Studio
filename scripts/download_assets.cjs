const fs = require('fs');
const https = require('https');
const path = require('path');

const catalog = JSON.parse(fs.readFileSync('scripts/catalog_full.json', 'utf-8'));

const outDir = path.join(__dirname, '..', 'vercel_server', 'public', 'workflow-store');
fs.mkdirSync(path.join(outDir, 'thumbnails'), { recursive: true });
fs.mkdirSync(path.join(outDir, 'images'), { recursive: true });

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(dest);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          console.log(`Saved: ${dest} (${fs.statSync(dest).size} bytes)`);
          resolve();
        });
      } else {
        console.error(`Failed ${url}: ${res.statusCode}`);
        resolve();
      }
    }).on('error', err => {
      console.error(`Error ${url}: ${err.message}`);
      resolve();
    });
  });
}

(async () => {
  for (const p of catalog.products) {
    if (p.thumbnailUrl) {
      const cleanThumb = p.thumbnailUrl.split('?')[0];
      const thumbDest = path.join(outDir, 'thumbnails', `${p.id}.png`);
      const fullUrl = `https://aitoolforge.shop${p.thumbnailUrl}`;
      console.log(`Downloading thumbnail for [${p.name}]...`);
      await downloadFile(fullUrl, thumbDest);
    }
    if (p.previewImageUrls && Array.isArray(p.previewImageUrls)) {
      for (const imgUrl of p.previewImageUrls) {
        const imgName = path.basename(imgUrl.split('?')[0]);
        const imgDest = path.join(outDir, 'images', `${imgName}.png`);
        const fullUrl = `https://aitoolforge.shop${imgUrl}`;
        console.log(`Downloading preview img ${imgName}...`);
        await downloadFile(fullUrl, imgDest);
      }
    }
  }
  console.log('Finished downloading all assets!');
})();
