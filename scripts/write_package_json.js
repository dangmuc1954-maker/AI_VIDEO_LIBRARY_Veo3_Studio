const fs = require('fs');
const path = require('path');

const pkg = {
  name: "xieng-nuong-be-huyen",
  version: "1.0.0",
  description: "Hệ thống POS 20 bàn & Quản lý bán hàng Xiêng Nướng Bé Huyền 24/24 trên Vercel Cloud",
  main: "server.js",
  scripts: {
    start: "node server.js",
    build: "echo 'Ready for Vercel'",
    deploy: "vercel --prod"
  },
  keywords: ["pos", "restaurant", "xieng-nuong"],
  author: "Tris",
  license: "ISC"
};

fs.writeFileSync('d:/dự án antigravity/Xieng_Nuong_Be_Huyen/package.json', JSON.stringify(pkg, null, 2), 'utf-8');
console.log('Created d:/dự án antigravity/Xieng_Nuong_Be_Huyen/package.json!');
