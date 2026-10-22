const fs = require('fs');
const { execFileSync } = require('child_process');
const ffmpeg = 'C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/node_modules/ffmpeg-static/ffmpeg.exe';
const dir = 'C:/Users/admin/AppData/Roaming/AI_VIDEO_LIBRARY_DATA/assets';

['b50f5a36-8f6d-4402-9e55-000a350ff104', 'a84b29da-779a-46da-8663-331067d2f729'].forEach(id => {
  const orig = dir + '/' + id + '.jpg';
  const thumb = dir + '/' + id + '.thumb.jpg';
  if (fs.existsSync(orig)) {
    execFileSync(ffmpeg, ['-y', '-i', orig, '-vf', 'scale=360:-1', '-q:v', '2', thumb]);
    console.log('Regenerated clean thumb for', id);
  }
});
