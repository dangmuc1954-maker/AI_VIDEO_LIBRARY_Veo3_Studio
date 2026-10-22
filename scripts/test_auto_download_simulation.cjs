const fsm = require('fs');
const ptm = require('path');
const os = require('os');

const cfgFile = ptm.join(process.env.APPDATA, 'AI_VIDEO_LIBRARY_DATA', 'aiforge_auto_download_config.json');

function test(e, ext) {
  let o = ext;
  let autoDl = global.__aiforge_auto_download || {};
  try {
    if (fsm.existsSync(cfgFile)) {
      const fileCfg = JSON.parse(fsm.readFileSync(cfgFile, 'utf8'));
      autoDl = Object.assign({}, fileCfg, autoDl);
      if (fileCfg.video && autoDl.video) autoDl.video = Object.assign({}, fileCfg.video, autoDl.video);
      if (fileCfg.image && autoDl.image) autoDl.image = Object.assign({}, fileCfg.image, autoDl.image);
      if (fileCfg.autoMerge && autoDl.autoMerge) autoDl.autoMerge = Object.assign({}, fileCfg.autoMerge, autoDl.autoMerge);
      global.__aiforge_auto_download = autoDl;
    }
  } catch (_) {}
  const isVid = e.type === 'video';
  const cfg = isVid ? autoDl.video : autoDl.image;
  const autoMergeCfg = autoDl.autoMerge;
  let saveDir = e.exportDirectory || (autoMergeCfg && autoMergeCfg.directory) || (cfg && cfg.directory) || (autoDl.video && autoDl.video.directory) || (autoDl.image && autoDl.image.directory) || '';
  if (!saveDir || typeof saveDir !== 'string' || !saveDir.trim()) {
    saveDir = ptm.join(os.homedir(), 'Downloads');
  }
  const nm = (e.sceneName || e.name || '').toLowerCase();
  const isMergedVideo = isVid && (e.isAutoMerged === true || nm.includes('hoàn chỉnh') || nm.includes('hoan_chinh') || nm.includes('auto_merged') || nm.includes('ghép tự động') || nm.includes('auto merged') || e.source === 'video-studio-automerge');
  const shouldSaveMerged = isMergedVideo;
  const shouldSaveSingle = !isMergedVideo && cfg && cfg.enabled === true;

  let targetName;
  if (isMergedVideo) {
    const rawName = (e.name || 'Video_Hoan_Chinh.mp4').replace(/[<>:"/\\|?*]/g, '_').replace(/\.mp4$/i, '');
    targetName = rawName + '.mp4';
  } else {
    let sNum = 1;
    const match = (e.sceneName || e.name || '').match(/\d+/);
    if (match) sNum = parseInt(match[0], 10);
    const prefix = isVid ? 'Video Cảnh ' : 'Ảnh Cảnh ';
    const baseName = prefix + sNum;
    targetName = baseName + ext;
  }

  console.log(e.type, '| Merged:', shouldSaveMerged, '| Single:', shouldSaveSingle, '| Output:', ptm.join(saveDir, targetName));
}

console.log('Testing with current config:');
test({ type: 'video', role: 'generated', isAutoMerged: true, name: 'Video Hoàn Chỉnh (3 cảnh) - 12:00:00.mp4' }, '.mp4');
test({ type: 'video', role: 'generated', sceneName: 'Cảnh 1' }, '.mp4');
test({ type: 'image', role: 'generated', sceneName: 'Cảnh 2' }, '.png');
