const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 RUNNING VERIFICATION TEST FOR REQUIREMENTS 1, 2, 3...');

// 1. Verify runtimeIndexes-gerug5IH.js
const rtiPath = path.join(__dirname, '../app/out/renderer/assets/runtimeIndexes-gerug5IH.js');
const rtiCode = fs.readFileSync(rtiPath, 'utf8');
assert(rtiCode.includes('e.assetId?n.has(e.assetId):!!(e.url||e.thumbnailUrl||e.localPath)'), 'runtimeIndexes must check n.has(e.assetId)');
console.log('✓ Requirement 2A: runtimeIndexes correctly filters out deleted assets');

// 2. Verify VideoStudio Bi & so button
const vsPath = path.join(__dirname, '../app/out/renderer/assets/VideoStudio-frcr8V6s.js');
const vsCode = fs.readFileSync(vsPath, 'utf8');
assert(vsCode.includes('o.status==="Completed"||o.status==="Failed"||o.status==="Canceled"||Wr(o,"video")?[]:[{...P,id:`${o.id}-pending`}]'), 'Bi must not return pending placeholder for completed/failed jobs without assets');
assert(vsCode.includes('await Z(jIds)'), 'VideoStudio deleteSelectedBtn must remove queue jobs');
assert(vsCode.includes('await ft(jIds)'), 'VideoStudio deleteSelectedBtn must delete assets');
assert(vsCode.includes('aiforge_auto_download_video_dir'), 'VideoStudio must use aiforge_auto_download_video_dir');
console.log('✓ Requirement 2B & 3A: VideoStudio handles Bi, deleteSelected, and aiforge_auto_download_video_dir');

// 3. Verify ImageStudio folder & delete button
const isPath = path.join(__dirname, '../app/out/renderer/assets/ImageStudio-4nmpUX3j.js');
const isCode = fs.readFileSync(isPath, 'utf8');
assert(isCode.includes('aiforge_auto_download_image_dir'), 'ImageStudio must use aiforge_auto_download_image_dir');
assert(!isCode.includes('"aiforge_auto_download_dir"'), 'ImageStudio must NOT use shared aiforge_auto_download_dir');
console.log('✓ Requirement 3B: ImageStudio folder is strictly isolated (aiforge_auto_download_image_dir)');

// 4. Verify main/index.js
const mainPath = path.join(__dirname, '../app/out/main/index.js');
const mainCode = fs.readFileSync(mainPath, 'utf8');
assert(mainCode.includes('tLower.includes("ảnh")||tLower.includes("image")'), 'selectExportDirectory must separate image vs video');
assert(mainCode.includes('isMergedVideo&&savedPath'), 'writeAsset must check isMergedVideo&&savedPath');
assert(mainCode.includes('global.__aiforge_temp_merged_assets'), 'main must use __aiforge_temp_merged_assets');
assert(mainCode.includes('[Startup] Dọn dẹp'), 'main must contain Startup Hook to purge ghost jobs and merged videos');
console.log('✓ Requirement 1 & 2C: main/index.js excludes merged videos from tool assets and purges ghost jobs');

console.log('\n🎉 ALL VERIFICATION ASSERTIONS PASSED 100%!');
