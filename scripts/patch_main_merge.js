const fs = require('fs');
const file = 'app/out/main/index.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix mergeVideos name
content = content.replace(
  'return F(n),await this.writeAsset({id:M(),name:"merged_video.mp4",type:"video"',
  'const finalMergeName=(o.name&&o.name.trim())||("Merged_Video_"+Date.now()+".mp4");return F(n),await this.writeAsset({id:M(),name:finalMergeName,type:"video"'
);

// 2. Fix editAndMergeVideos name and aspect ratio check
content = content.replace(
  'const hasCustomTrim=s.some(w=>w.startTime>0||w.endTime!==null);if(!hasCustomTrim&&!o.aspectRatio)return await this.mergeVideos(s.map(w=>w.assetId),t,o);',
  'const hasCustomTrim=s.some(w=>w.startTime>0||w.endTime!==null);const reqAspect=o.aspectRatio||o.outputAspect;if(!hasCustomTrim&&(!reqAspect||reqAspect==="fit"))return await this.mergeVideos(s.map(w=>w.assetId),t,o);'
);

content = content.replace(
  'F(n);return await this.writeAsset({id:M(),name:"merged_video.mp4",type:"video"',
  'const finalEditName=(o.name&&o.name.trim())||("Edited_Video_"+Date.now()+".mp4");F(n);return await this.writeAsset({id:M(),name:finalEditName,type:"video"'
);

// Also check aspect ratio mapping in editAndMergeVideos
content = content.replace(
  'if(o.aspectRatio==="16:9"){c=1920;d=1080}else if(o.aspectRatio==="9:16"){c=1080;d=1920}else if(o.aspectRatio==="1:1"){c=1080;d=1080}',
  'const targetAspect=o.aspectRatio||o.outputAspect;if(targetAspect==="16:9"){c=1920;d=1080}else if(targetAspect==="9:16"){c=1080;d=1920}else if(targetAspect==="1:1"){c=1080;d=1080}'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Patched app/out/main/index.js successfully!');
