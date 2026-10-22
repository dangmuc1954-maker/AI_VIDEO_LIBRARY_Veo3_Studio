const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('--- Testing ElevenLabs TTS & FFmpeg Pipeline ---');

// Let's check ffmpeg-static
let ffmpegPath = '';
try {
  const ffmpegStatic = require(path.join(__dirname, '../app/node_modules/ffmpeg-static'));
  ffmpegPath = ffmpegStatic;
  console.log('FFmpeg path from node_modules:', ffmpegPath);
} catch (e) {
  console.log('FFmpeg node_modules not found directly:', e.message);
  try {
    const ffmpegStatic = require(path.join(__dirname, '../extracted_original/node_modules/ffmpeg-static'));
    ffmpegPath = ffmpegStatic;
    console.log('FFmpeg path from extracted_original:', ffmpegPath);
  } catch (e2) {
    console.log('FFmpeg fallback to system ffmpeg');
    ffmpegPath = 'ffmpeg';
  }
}

console.log('Resolved FFmpeg executable:', ffmpegPath);
