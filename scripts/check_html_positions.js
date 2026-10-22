const fs = require('fs');
const h = fs.readFileSync('d:/dự án antigravity/Xieng_Nuong_Be_Huyen/public/index.html', 'utf-8');

console.log('view-reports:', h.indexOf('id="view-reports"'));
console.log('reportsHubView:', h.indexOf('id="reportsHubView"'));
console.log('reportDetailView:', h.indexOf('id="reportDetailView"'));
console.log('monthlyHubView:', h.indexOf('id="monthlyHubView"'));
console.log('monthlyDetailView:', h.indexOf('id="monthlyDetailView"'));
console.log('view-inventory:', h.indexOf('id="view-inventory"'));
