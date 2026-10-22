const fs = require('fs');
const ast = JSON.parse(fs.readFileSync('C:/Users/admin/AppData/Roaming/AI_VIDEO_LIBRARY_DATA/asset-state.json', 'utf8'));
const item = ast.assets.find(x => x.id === 'df6b4daf-b183-43be-b84d-1c91eb545efc');
console.log('Asset in asset-state:', item);
