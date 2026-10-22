const fs = require('fs');
const path = require('path');

const targetDir = 'd:/dự án antigravity/Xieng_Nuong_Be_Huyen';
const serverJsPath = path.join(targetDir, 'server.js');
let serverJs = fs.readFileSync(serverJsPath, 'utf-8');

// Replace server.listen with conditional listen and module.exports
const oldListenCode = `server.listen(PORT, '0.0.0.0', () => {
  console.log('\\n=============================================================');
  console.log('  🔥 XIÊNG NƯỚNG BÉ HUYỀN - HỆ THỐNG POS 20 BÀN & QUẢN LÝ 🔥');
  console.log('  🌟 ĐÃ TÍCH HỢP: CA BÁN THEO NGÀY & DASHBOARD BÁO CÁO CHI TIẾT');
  console.log('=============================================================');
  console.log(\`👉 Máy tính thu ngân (Local):   http://localhost:\${PORT}\`);
  console.log(\`👉 Điện thoại / iPad của Quán:  http://\${lanIp}:\${PORT}\`);
  console.log('=============================================================\\n');
});`;

const newListenCode = `module.exports = handleRequest;

if (process.env.NODE_ENV !== 'production' || require.main === module) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log('\\n=============================================================');
    console.log('  🔥 XIÊNG NƯỚNG BÉ HUYỀN - HỆ THỐNG POS 20 BÀN & QUẢN LÝ 🔥');
    console.log('  🌟 ĐÃ TÍCH HỢP: CA BÁN THEO NGÀY & DASHBOARD BÁO CÁO CHI TIẾT');
    console.log('=============================================================');
    console.log(\`👉 Máy tính thu ngân (Local):   http://localhost:\${PORT}\`);
    console.log(\`👉 Điện thoại / iPad của Quán:  http://\${lanIp}:\${PORT}\`);
    console.log('=============================================================\\n');
  });
}`;

serverJs = serverJs.replace(oldListenCode, newListenCode);

// Also in server.js, make sure database loading falls back to /tmp if process.cwd() is read-only in Vercel
serverJs = serverJs.replace(
  `function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Lỗi lưu database:', err.message);
  }
}`,
  `function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    try {
      fs.writeFileSync('/tmp/database.json', JSON.stringify(db, null, 2), 'utf-8');
    } catch (e) {
      console.error('Lỗi lưu database:', err.message);
    }
  }
}`
);

fs.writeFileSync(serverJsPath, serverJs, 'utf-8');

// Update vercel.json to route /api to server.js
const vercelConfig = {
  version: 2,
  rewrites: [
    { source: "/api/(.*)", destination: "/server.js" },
    { source: "/api", destination: "/server.js" },
    { source: "/", destination: "/public/index.html" },
    { source: "/(.*)", destination: "/public/$1" }
  ]
};
fs.writeFileSync(path.join(targetDir, 'vercel.json'), JSON.stringify(vercelConfig, null, 2), 'utf-8');

console.log('Successfully updated server.js with module.exports and vercel.json routing to server.js!');
