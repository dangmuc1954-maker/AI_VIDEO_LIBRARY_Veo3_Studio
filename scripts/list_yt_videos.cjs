const https = require('https');

const videoIds = [
  { id: '2f0f0fed-b25f-4970-af89-1a2d0a05423c', name: 'Công Xưởng Gia Công Đa Ngành', yt: 'C6SEAZiTpMo' },
  { id: '88c8dbea-dcef-42f2-953a-2d2392ee7e3a', name: 'Người Que Trending', yt: 'wEXRsiwCg7E' },
  { id: 'dc285a49-338e-424b-8db6-e18768b2934e', name: 'Mẹ & Em Bé', yt: 'TZ-BHmeJMIo' },
  { id: 'd9697c7b-1ab1-48cb-a17c-9280568d433e', name: 'Gối Chặn Đầu Sơ Sinh', yt: 'RfoiTUM_vhg' },
  { id: '2bbf79ea-f055-423b-9c0a-cb3870321607', name: 'Review Đồ Gia Dụng', yt: 'BXXIlGpvBa8' },
  { id: 'cmtwimoa000wot001t5x2c5ah', name: 'Biến hình trên máy chạy bộ', yt: '06-CoNO9mPY' },
  { id: 'cmtv34ycm00brnx01i8fd9avx', name: 'Người mẫu Selfie trước gương', yt: '0FvOG4nAYwI' },
  { id: 'cmtcbvpbp000gms01hcoqwwug', name: 'Bán Mọi Loại Đồ Đạc (Đã có)', yt: '_sJfTGCW9BE' }
];

console.log('List of YouTube demo videos for each workflow:');
videoIds.forEach(v => {
  console.log(`- ${v.name}: https://www.youtube.com/watch?v=${v.yt}`);
});
