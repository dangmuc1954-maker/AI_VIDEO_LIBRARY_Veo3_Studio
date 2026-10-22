const fs = require('fs');
const path = require('path');

const targetDir = 'd:/dự án antigravity/Xieng_Nuong_Be_Huyen';
const htmlPath = path.join(targetDir, 'public', 'index.html');
const appJsPath = path.join(targetDir, 'public', 'app.js');

// ========================================================
// 1. UPDATE public/index.html
// ========================================================
let html = fs.readFileSync(htmlPath, 'utf-8');

// Replace hardcoded template values with clean zero defaults in monthly detail view
html = html.replace('<strong id="monRepCash">465.000.000đ</strong>', '<strong id="monRepCash">0đ</strong>');
html = html.replace('<strong id="monRepTransfer">180.800.000đ</strong>', '<strong id="monRepTransfer">0đ</strong>');
html = html.replace('<strong id="monRepExpense">210.500.000đ</strong>', '<strong id="monRepExpense">0đ</strong>');
html = html.replace('<span class="metric-num" id="monRepTotalRev">645.800.000đ</span>', '<span class="metric-num" id="monRepTotalRev">0đ</span>');
html = html.replace('<span class="metric-num" id="monRepTotalTurns">2.280 lượt</span>', '<span class="metric-num" id="monRepTotalTurns">0 lượt</span>');
html = html.replace('<span class="metric-num" id="monRepTotalItems">94.200 sản phẩm</span>', '<span class="metric-num" id="monRepTotalItems">0 sản phẩm</span>');
html = html.replace('<span class="metric-num highlight-profit" id="monRepNetProfit">435.300.000đ</span>', '<span class="metric-num highlight-profit" id="monRepNetProfit">0đ</span>');
html = html.replace('<span class="table-badge" id="monExpenseTotalBadge">Tổng chi: 210.500.000đ</span>', '<span class="table-badge" id="monExpenseTotalBadge">Tổng chi: 0đ</span>');

fs.writeFileSync(htmlPath, html, 'utf-8');
console.log('Updated index.html: Cleaned hardcoded values in monthly detail view.');

// ========================================================
// 2. UPDATE public/app.js: renderSelectedMonthDetail
// ========================================================
let appJs = fs.readFileSync(appJsPath, 'utf-8');

const oldRenderMonthDetailRegex = /function renderSelectedMonthDetail\(m\)[\s\S]*?\n\}/;

const newRenderMonthDetailCode = `function renderSelectedMonthDetail(m) {
  if (!m) return;

  document.getElementById('monRepTitle').textContent = \`📊 BÁO CÁO TỔNG HỢP CHI TIẾT: \${m.title.toUpperCase()}\`;
  document.getElementById('monRepSub').textContent = \`\${m.title} • \${m.daysCountDisplay || (m.daysList.length + ' ngày bán')} • \${(m.tableTurnCount || 0).toLocaleString('vi-VN')} lượt bàn phục vụ\`;

  document.getElementById('monRepTotalRev').textContent = formatMoney(m.totalRevenue || 0);
  document.getElementById('monRepRevSub').textContent = \`Toàn bộ \${m.title}\`;
  document.getElementById('monRepTotalTurns').textContent = \`\${(m.tableTurnCount || 0).toLocaleString('vi-VN')} lượt\`;
  document.getElementById('monRepTotalItems').textContent = \`\${(m.totalItemsCount || 0).toLocaleString('vi-VN')} sản phẩm\`;
  document.getElementById('monRepNetProfit').textContent = formatMoney(m.netProfit || 0);

  document.getElementById('monRepCash').textContent = formatMoney(m.cashAmount || 0);
  document.getElementById('monRepTransfer').textContent = formatMoney(m.transferAmount || 0);
  document.getElementById('monRepExpense').textContent = formatMoney(m.totalExpense || 0);

  // Table 1: Items Sold Across Month
  const itemsTbody = document.getElementById('monItemsSoldTbody');
  itemsTbody.innerHTML = '';
  const items = m.itemsSoldSummary || [];

  if (items.length === 0) {
    itemsTbody.innerHTML = '<tr><td colspan="6" align="center" style="padding:24px;color:var(--text-muted)">Chưa có món ăn nào được bán trong tháng này</td></tr>';
  } else {
    items.forEach((it, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = \`
        <td><strong style="color:var(--gold-dark)">#\${idx + 1}</strong></td>
        <td><strong>\${it.name}</strong></td>
        <td>\${it.unit}</td>
        <td class="text-right"><strong>\${(it.quantity || 0).toLocaleString('vi-VN')}</strong></td>
        <td class="text-right">\${(it.price || 0).toLocaleString('vi-VN')}</td>
        <td class="text-right"><strong style="color:var(--gold-dark)">\${formatMoney(it.totalAmount || 0)}</strong></td>
      \`;
      itemsTbody.appendChild(tr);
    });
  }

  // Table 2: Daily list of this month
  const daysTbody = document.getElementById('monDaysListTbody');
  daysTbody.innerHTML = '';
  const days = m.daysList || [];
  document.getElementById('monDaysCountBadge').textContent = \`\${days.length} ngày bán có hóa đơn\`;

  if (days.length === 0) {
    daysTbody.innerHTML = '<tr><td colspan="7" align="center" style="padding:24px;color:var(--text-muted)">Chưa có ca bán hàng nào được chốt sổ trong tháng này</td></tr>';
  } else {
    days.forEach(d => {
      const tr = document.createElement('tr');
      tr.innerHTML = \`
        <td><strong>📅 \${d.date}</strong></td>
        <td style="color:var(--text-muted)">\${d.duration || (d.startTime + ' - ' + (d.endTime || 'Hiện tại'))}</td>
        <td class="text-center"><strong>\${d.tableTurnCount || 0} lượt</strong></td>
        <td class="text-right"><strong>\${formatMoney(d.totalRevenue || 0)}</strong></td>
        <td class="text-right" style="color:#ef4444">\${formatMoney(d.totalExpense || 0)}</td>
        <td class="text-right"><strong style="color:var(--color-free)">\${formatMoney(d.netProfit || 0)}</strong></td>
        <td class="text-center">
          <button class="btn-action btn-view-day-from-mon" style="padding:5px 12px;font-size:12px;font-weight:800;background:var(--bg-gold-tint);color:var(--gold-dark);border-color:var(--gold-border);">Xem</button>
        </td>
      \`;

      tr.querySelector('.btn-view-day-from-mon').onclick = () => {
        state.reportMode = 'day';
        document.getElementById('btnReportModeDay').classList.add('active');
        document.getElementById('btnReportModeMonth').classList.remove('active');
        openReportDetail(d.id);
      };

      daysTbody.appendChild(tr);
    });
  }

  // Table 3: Expense Categories Breakdown
  const catTbody = document.getElementById('monExpenseCategoriesTbody');
  catTbody.innerHTML = '';
  document.getElementById('monExpenseTotalBadge').textContent = \`Tổng chi: \${formatMoney(m.totalExpense || 0)}\`;

  const expenses = m.expensesList || [];
  if (expenses.length === 0 || (m.totalExpense || 0) <= 0) {
    catTbody.innerHTML = '<tr><td colspan="3" align="center" style="padding:24px;color:var(--text-muted)">Chưa có khoản chi tiêu nào phát sinh trong tháng này</td></tr>';
  } else {
    const catMap = {};
    expenses.forEach(e => {
      const cat = e.category || 'Chi khác';
      catMap[cat] = (catMap[cat] || 0) + (e.amount || 0);
    });

    Object.entries(catMap).forEach(([catName, amount]) => {
      const pct = ((amount / (m.totalExpense || 1)) * 100).toFixed(1);
      const tr = document.createElement('tr');
      tr.innerHTML = \`
        <td><strong>\${catName}</strong></td>
        <td class="text-right"><strong style="color:#ef4444">\${formatMoney(amount)}</strong></td>
        <td class="text-right"><strong style="color:var(--gold-dark)">\${pct}%</strong></td>
      \`;
      catTbody.appendChild(tr);
    });
  }
}`;

appJs = appJs.replace(oldRenderMonthDetailRegex, newRenderMonthDetailCode);
fs.writeFileSync(appJsPath, appJs, 'utf-8');
console.log('Updated public/app.js: renderSelectedMonthDetail is now completely dynamic and robust!');
