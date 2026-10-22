const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

// Tìm các chỗ liên quan đến dispatch job hoặc enqueueJob
const dispatchMatches = [...content.matchAll(/enqueueJob|createJob|dispatch/g)];
console.log('dispatchMatches count:', dispatchMatches.length);

// Tìm cấu trúc prompt object mặc định khi tạo mới prompt (onAddPrompt)
const addPromptMatches = [...content.matchAll(/yt\s*=\s*\([^)]*\)\s*=>/g)];
console.log('yt matches:', addPromptMatches.map(m => m[0]));

// Tìm chỗ render thẻ video trên dashboard
// Trong tóm tắt trước: `e.jsx("div",{className:"truncate text-[11px] font-semibold leading-4 text-white drop-shadow",children:x.prompt.trim()||S("videoStudio.blankPrompt")})`
const cardMatch = content.indexOf('truncate text-[11px] font-semibold');
console.log('cardMatch pos:', cardMatch);
if (cardMatch !== -1) {
  console.log('card snippet:', content.slice(cardMatch - 100, cardMatch + 300));
}

// Tìm chỗ render list view
const listMatch = content.indexOf('truncate text-base font-semibold');
console.log('listMatch pos:', listMatch);
if (listMatch !== -1) {
  console.log('list snippet:', content.slice(listMatch - 100, listMatch + 300));
}
