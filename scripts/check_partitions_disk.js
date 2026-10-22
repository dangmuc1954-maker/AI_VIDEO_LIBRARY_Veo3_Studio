const path = require('path');
const fs = require('fs');

const partitionPath = path.join(process.env.APPDATA, 'AI_VIDEO_LIBRARY_DATA/Partitions');
console.log('AI_VIDEO_LIBRARY_DATA Partition dir exists:', fs.existsSync(partitionPath));
if (fs.existsSync(partitionPath)) {
  console.log('Partitions in AI_VIDEO_LIBRARY_DATA:', fs.readdirSync(partitionPath));
}

const aiforgePartitions = path.join(process.env.APPDATA, 'aiforge-studio/Partitions');
console.log('AIForge Partitions exists:', fs.existsSync(aiforgePartitions));
if (fs.existsSync(aiforgePartitions)) {
  console.log('Partitions in aiforge-studio:', fs.readdirSync(aiforgePartitions));
}
