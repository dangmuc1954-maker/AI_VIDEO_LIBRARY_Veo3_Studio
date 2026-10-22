const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function cropLog() {
  const imgPath = 'C:/Users/admin/.gemini/antigravity-ide/brain/de24d734-6a8f-44ac-a8d1-49eb2997c8c3/.user_uploaded/media_1789456085077.png';
  const outPath = 'D:/dự án antigravity/AIForge_Veo3_Studio/scratch/log_crop.png';
  
  const meta = await sharp(imgPath).metadata();
  console.log('Original image dimensions:', meta.width, 'x', meta.height);

  // Crop vùng bảng điều khiển nhật ký ở góc dưới bên phải (khoảng 50% width trở đi, 60% height trở đi)
  const left = Math.floor(meta.width * 0.5);
  const top = Math.floor(meta.height * 0.6);
  const width = Math.floor(meta.width * 0.49);
  const height = Math.floor(meta.height * 0.38);

  await sharp(imgPath)
    .extract({ left, top, width, height })
    .toFile(outPath);
  console.log('Cropped log saved to:', outPath);

  // Crop riêng node Đọc Kịch Bản
  const outNode = 'D:/dự án antigravity/AIForge_Veo3_Studio/scratch/node_crop.png';
  const nodeLeft = Math.floor(meta.width * 0.5);
  const nodeTop = Math.floor(meta.height * 0.25);
  const nodeWidth = Math.floor(meta.width * 0.25);
  const nodeHeight = Math.floor(meta.height * 0.35);
  await sharp(imgPath)
    .extract({ left: nodeLeft, top: nodeTop, width: nodeWidth, height: nodeHeight })
    .toFile(outNode);
  console.log('Cropped node saved to:', outNode);
}

cropLog().catch(console.error);
