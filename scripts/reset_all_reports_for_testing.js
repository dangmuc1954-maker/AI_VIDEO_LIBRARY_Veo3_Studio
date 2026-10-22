const fs = require('fs');
const path = require('path');

const targetDir = 'd:/dự án antigravity/Xieng_Nuong_Be_Huyen';
const dbPath = path.join(targetDir, 'data', 'database.json');
const appJsPath = path.join(targetDir, 'public', 'app.js');

// ========================================================
// 1. RESET data/database.json
// ========================================================
let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

// Clear all reports history, completed orders and expenses
db.reportsHistory = [];
db.completedOrders = [];
db.expenses = [];

// Reset session to clean unstarted state so Tris can click "Bắt Đầu Bán"
db.currentSession = {
  isActive: false,
  date: new Date().toLocaleDateString('vi-VN'),
  startTime: null,
  endTime: null,
  initialCash: 0,
  orders: [],
  expenses: [],
  note: ""
};

// Reset all 20 tables to empty
db.tables.forEach(t => {
  t.status = "empty";
  t.items = [];
  t.totalAmount = 0;
  t.openedAt = null;
  t.note = "";
});

// Reset inventory to clean default stock
db.inventory = [
  { id: "thit_heo", name: "Thịt heo (ướp xiên)", unit: "g", stock: 100000, minStock: 20000 },
  { id: "thit_nac_dam", name: "Thịt nạc dăm (ướp que)", unit: "g", stock: 60000, minStock: 15000 },
  { id: "thit_bo", name: "Thịt bò băm (lá lốt)", unit: "g", stock: 35000, minStock: 10000 },
  { id: "que_tre", name: "Que tre xiên nướng", unit: "que", stock: 5000, minStock: 1000 },
  { id: "la_lot", name: "Lá lốt tươi", unit: "lá", stock: 4000, minStock: 800 },
  { id: "chim_cut", name: "Chim cút làm sạch", unit: "con", stock: 250, minStock: 50 },
  { id: "oc_nhoi", name: "Ốc bươu / ốc nhồi", unit: "g", stock: 30000, minStock: 6000 },
  { id: "long_heo", name: "Lòng heo sạch", unit: "g", stock: 25000, minStock: 5000 },
  { id: "banh_trang", name: "Bánh tráng nướng", unit: "cái", stock: 300, minStock: 50 },
  { id: "mam_ruoc", name: "Mắm ruốc xào me cay", unit: "g", stock: 5000, minStock: 1000 }
];

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
console.log('Database reset successfully: reportsHistory, orders, expenses and tables are all completely clean!');

// ========================================================
// 2. UPDATE public/app.js: REMOVE HARDCODED DUMMY MONTHS
// ========================================================
let appJs = fs.readFileSync(appJsPath, 'utf-8');

// Replace getAggregatedMonthlyReports to be 100% dynamic from real reportsHistory
const oldAggregatorRegex = /function getAggregatedMonthlyReports\(\)[\s\S]*?return list;\s*\}/;

const cleanAggregatorCode = `function getAggregatedMonthlyReports() {
  const monthMap = {};
  const reports = state.reportsHistory || [];

  reports.forEach(rep => {
    const parts = (rep.date || '').split('/');
    if (parts.length >= 3) {
      const monthKey = parts[1].padStart(2, '0') + '/' + parts[2]; // e.g. "09/2026"
      if (!monthMap[monthKey]) {
        monthMap[monthKey] = {
          monthKey: monthKey,
          title: \`Tháng \${monthKey}\`,
          totalRevenue: 0,
          totalExpense: 0,
          netProfit: 0,
          cashAmount: 0,
          transferAmount: 0,
          tableTurnCount: 0,
          totalItemsCount: 0,
          daysList: [],
          itemMap: {},
          expensesList: []
        };
      }

      const m = monthMap[monthKey];
      m.totalRevenue += (rep.totalRevenue || 0);
      m.totalExpense += (rep.totalExpense || 0);
      m.cashAmount += (rep.cashAmount || 0);
      m.transferAmount += (rep.transferAmount || 0);
      m.tableTurnCount += (rep.tableTurnCount || 0);
      m.totalItemsCount += (rep.totalItemsCount || 0);
      m.daysList.push(rep);

      (rep.itemsSoldSummary || []).forEach(it => {
        if (!m.itemMap[it.name]) {
          m.itemMap[it.name] = { id: it.id, name: it.name, unit: it.unit || 'phần', price: it.price, quantity: 0, totalAmount: 0 };
        }
        m.itemMap[it.name].quantity += it.quantity;
        m.itemMap[it.name].totalAmount += (it.price * it.quantity);
      });

      (rep.expenses || []).forEach(e => m.expensesList.push(e));
    }
  });

  // Calculate net profit & item sorted lists for each month
  Object.values(monthMap).forEach(m => {
    m.netProfit = m.totalRevenue - m.totalExpense;
    m.itemsSoldSummary = Object.values(m.itemMap).sort((a, b) => b.quantity - a.quantity);
    m.daysCountDisplay = \`\${m.daysList.length} ngày bán\`;
  });

  return Object.values(monthMap);
}`;

appJs = appJs.replace(oldAggregatorRegex, cleanAggregatorCode);

// In renderMonthlyDashboardsGrid, add clean empty state if months.length === 0
const oldRenderMonthGridRegex = /function renderMonthlyDashboardsGrid\(\)[\s\S]*?months\.forEach\(m => \{/;

const newRenderMonthGridCode = `function renderMonthlyDashboardsGrid() {
  const grid = document.getElementById('monthlyDashboardsGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const months = getAggregatedMonthlyReports();

  if (months.length === 0) {
    grid.innerHTML = \`
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #FFFFFF; border-radius: var(--radius-lg); border: 2px dashed var(--gold-border); box-shadow: var(--shadow-card);">
        <div style="font-size: 48px; margin-bottom: 12px;">📆</div>
        <h3 style="font-size: 18px; color: var(--gold-dark); margin-bottom: 8px;">Chưa Có Dữ Liệu Báo Cáo Tháng</h3>
        <p style="font-size: 14px; color: var(--text-muted); max-width: 500px; margin: 0 auto 18px auto;">
          Khi anh mở ca bán hàng ở <strong>Sơ Đồ Bàn</strong> và bấm <strong>[Kết Thúc Bán & Chốt Sổ]</strong>, hệ thống sẽ tự động gom các ngày lại và hiển thị đầy đủ Dashboard tổng hợp của tháng tại đây!
        </p>
        <button class="btn-action primary" onclick="document.getElementById('tabBtnTables').click()" style="margin: 0 auto;">
          🏷️ Đến Sơ Đồ Bàn Để Bắt Đầu Bán
        </button>
      </div>
    \`;
    return;
  }

  months.forEach(m => {`;

appJs = appJs.replace(oldRenderMonthGridRegex, newRenderMonthGridCode);

fs.writeFileSync(appJsPath, appJs, 'utf-8');
console.log('Updated public/app.js: Removed all mock/dummy data, now 100% real dynamic reports!');
