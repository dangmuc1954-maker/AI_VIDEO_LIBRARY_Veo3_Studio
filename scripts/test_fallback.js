const fs = require('fs');
const path = require('path');
const os = require('os');

const p = 'C:/Users/admin/AppData/Roaming/AI_VIDEO_LIBRARY_DATA/assets/b50f5a36-8f6d-4402-9e55-000a350ff104.jpg';
const a = fs.readFileSync(p);
const mimeType = 'image/jpeg';

async function testMainCleaner() {
  const _cPaths = [
    path.join(__dirname, '../../modules/media_watermark_cleaner.cjs'),
    path.join(__dirname, '../modules/media_watermark_cleaner.cjs'),
    path.join(process.cwd(), 'app/modules/media_watermark_cleaner.cjs'),
    path.join(process.cwd(), 'modules/media_watermark_cleaner.cjs'),
    'C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/modules/media_watermark_cleaner.cjs'
  ];
  const _mPath = _cPaths.find(p => fs.existsSync(p));
  console.log('Found cleaner at:', _mPath);

  if (_mPath) {
    const _MC = require(_mPath);
    const _cln = new _MC('ffmpeg');
    const _ext = '.jpg';
    const _tIn = path.join(os.tmpdir(), `wm_in_${Date.now()}_${Math.random().toString(36).slice(2, 7)}${_ext}`);
    const _tOut = path.join(os.tmpdir(), `wm_out_${Date.now()}_${Math.random().toString(36).slice(2, 7)}${_ext}`);
    fs.writeFileSync(_tIn, a);
    console.log('Written _tIn:', _tIn, 'size:', fs.statSync(_tIn).size);

    await _cln.cleanMediaWatermark(_tIn, _tOut, { removeWatermark: true });
    console.log('cleanMediaWatermark done. _tOut exists:', fs.existsSync(_tOut));
    if (fs.existsSync(_tOut)) {
      console.log('Size of _tOut:', fs.statSync(_tOut).size);
    }
  }
}

testMainCleaner().catch(console.error);
