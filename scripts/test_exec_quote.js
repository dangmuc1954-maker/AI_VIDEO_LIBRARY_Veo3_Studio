const { exec, execFile } = require('child_process');
const ffmpeg = 'C:\\Users\\admin\\AppData\\Local\\Programs\\AI VIDEO LIBRARY\\resources\\app\\node_modules\\ffmpeg-static\\ffmpeg.exe';
const testFile = 'C:\\Users\\admin\\AppData\\Local\\Temp\\test_out.jpg';

const cmd = `"${ffmpeg}" -i "${testFile}"`;
console.log('Testing cmd:', cmd);

exec(cmd, (err, stdout, stderr) => {
  console.log('exec err:', err ? err.message : null);
  console.log('exec stderr length:', (stderr || '').length);
});

execFile(ffmpeg, ['-i', testFile], (err, stdout, stderr) => {
  console.log('execFile err:', err ? err.message : null);
  console.log('execFile stderr length:', (stderr || '').length);
});
