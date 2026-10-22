const fs = require('fs');
const path = require('path');

const assetStatePath = 'C:/Users/admin/AppData/Roaming/AI_VIDEO_LIBRARY_DATA/asset-state.json';
if (fs.existsSync(assetStatePath)) {
  const data = JSON.parse(fs.readFileSync(assetStatePath, 'utf8'));
  const originalCount = data.assets.length;
  
  // Kiểm tra file tồn tại
  let fixedCount = 0;
  let removedCount = 0;
  
  const cleanedAssets = [];
  for (const asset of data.assets) {
    if (asset.localPath && fs.existsSync(asset.localPath)) {
      cleanedAssets.push(asset);
    } else {
      // Thử xem file có trong thư mục assets không
      const expectedInAssets = path.join('C:/Users/admin/AppData/Roaming/AI_VIDEO_LIBRARY_DATA/assets', path.basename(asset.localPath || (asset.id + (asset.type === 'video' ? '.mp4' : '.mp3'))));
      if (fs.existsSync(expectedInAssets)) {
        asset.localPath = expectedInAssets;
        cleanedAssets.push(asset);
        fixedCount++;
      } else {
        removedCount++;
        console.log('Loại bỏ asset mồ côi không có file thật:', asset.id, asset.name);
      }
    }
  }

  data.assets = cleanedAssets;
  fs.writeFileSync(assetStatePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Đã dọn dẹp asset-state.json: Tổng ban đầu ${originalCount}, Phục hồi đường dẫn ${fixedCount}, Loại bỏ ${removedCount}, Còn lại ${cleanedAssets.length} asset chuẩn.`);
}
