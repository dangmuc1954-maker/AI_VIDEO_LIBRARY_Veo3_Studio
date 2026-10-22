const fs = require('fs');
const path = require('path');

const targetDir = 'd:/dự án antigravity/Xieng_Nuong_Be_Huyen';
const appJsPath = path.join(targetDir, 'public', 'app.js');

let appJs = fs.readFileSync(appJsPath, 'utf-8');

// We will add session handling, reports history rendering, drill-down detail view, and modals.
const newAppLogic = `
// ========================================================
// 8. SALES SESSION & DAILY DASHBOARDS HUB LOGIC
// ========================================================
state.currentSession = null;
state.reportsHistory = [];
state.selectedReport = null;

// Initialize Session & Report Hub Listeners
function setupSessionAndReportsHub() {
  // Session buttons
  const btnStart = document.getElementById('btnStartSession');
  const btnEnd = document.getElementById('btnEndSession');
  const btnBackHub = document.getElementById('btnBackToDashboardHub');

  if (btnStart) btnStart.onclick = promptStartSession;
  if (btnEnd) btnEnd.onclick = openEndSessionModal;
  if (btnBackHub) btnBackHub.onclick = backToDashboardHub;

  // End Session Modal Buttons
  const modalEnd = document.getElementById('endSessionModal');
  const btnCloseEnd = document.getElementById('btnCloseEndSessionModal');
  const btnCancelEnd = document.getElementById('btnCancelEndSession');
  const btnConfirmEnd = document.getElementById('btnConfirmEndSession');

  if (btnCloseEnd) btnCloseEnd.onclick = () => modalEnd.classList.remove('open');
  if (btnCancelEnd) btnCancelEnd.onclick = () => modalEnd.classList.remove('open');
  if (btnConfirmEnd) btnConfirmEnd.onclick = confirmEndSession;
}

// Render Session Control Bar in Tables View
function renderSessionBar() {
  const session = state.currentSession;
  const pill = document.getElementById('sessionStatusPill');
  const label = document.getElementById('sessionStatusLabel');
  const timeChip = document.getElementById('sessionTimeChip');
  const btnStart = document.getElementById('btnStartSession');
  const btnEnd = document.getElementById('btnEndSession');
  const dateInput = document.getElementById('sessionDateInput');

  if (!session || !session.isActive) {
    if (pill) {
      pill.classList.remove('active');
      label.textContent = '⚪ CHƯA MỞ CA BÁN';
      timeChip.textContent = 'Bấm Bắt Đầu Bán để mở ca';
    }
    if (btnStart) btnStart.style.display = 'flex';
    if (btnEnd) btnEnd.style.display = 'none';
  } else {
    if (pill) {
      pill.classList.add('active');
      label.textContent = '🟢 ĐANG BÁN HÀNG';
      timeChip.textContent = \`Mở ca lúc: \${session.startTime || '16:30'}\`;
    }
    if (dateInput) dateInput.value = session.date || new Date().toLocaleDateString('vi-VN');
    if (btnStart) btnStart.style.display = 'none';
    if (btnEnd) btnEnd.style.display = 'flex';
  }
}

// Start Session Prompt
async function promptStartSession() {
  const dateInput = document.getElementById('sessionDateInput');
  const chosenDate = dateInput ? dateInput.value : new Date().toLocaleDateString('vi-VN');
  const currentTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  if (confirm(\`Bắt đầu ca bán hàng mới cho ngày: \${chosenDate} (Khởi động lúc \${currentTime})?\\nMọi hóa đơn và chi tiêu sẽ được ghi nhận vào ca ngày này.\`)) {
    try {
      const res = await fetch('/api/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: chosenDate,
          startTime: currentTime
        })
      });
      if (res.ok) {
        playSound('chime');
        await fetchInitialState();
        alert(\`Đã mở ca bán ngày \${chosenDate} thành công! Mời anh bắt đầu nhận order bàn.\`);
      }
    } catch (err) {
      alert('Lỗi mở ca bán: ' + err.message);
    }
  }
}

// Open End Session Modal (Chốt Sổ)
function openEndSessionModal() {
  const session = state.currentSession;
  if (!session || !session.isActive) return;

  const orders = session.orders || [];
  const expenses = session.expenses || [];
  const totalRev = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const totalExp = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const profit = totalRev - totalExp;

  document.getElementById('modalEndSessionDate').textContent = session.date;
  document.getElementById('modalEndSessionTime').textContent = \`\${session.startTime} - Hiện tại\`;
  document.getElementById('modalEndSessionRev').textContent = formatMoney(totalRev);
  document.getElementById('modalEndSessionExp').textContent = formatMoney(totalExp);
  document.getElementById('modalEndSessionProfit').textContent = formatMoney(profit);

  document.getElementById('endSessionModal').classList.add('open');
  playSound('tap');
}

// Confirm End Session
async function confirmEndSession() {
  const note = document.getElementById('endSessionNoteInput').value;
  const currentTime = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  try {
    const res = await fetch('/api/session/end', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endTime: currentTime,
        note: note
      })
    });
    const data = await res.json();
    if (res.ok) {
      document.getElementById('endSessionModal').classList.remove('open');
      playSound('chime');
      await fetchInitialState();
      
      // Auto navigate to Reports Tab and open the new report!
      document.getElementById('tabBtnReports').click();
      if (data.report) {
        openReportDetail(data.report.id);
      }
      alert('Đã chốt sổ ca bán thành công! Dữ liệu đã được lưu vào Dashboard Báo Cáo Ngày.');
    }
  } catch (err) {
    alert('Lỗi chốt sổ ca bán: ' + err.message);
  }
}

// ========================================================
// 9. DAILY DASHBOARD HUB & DETAIL VIEW
// ========================================================
function renderReportsView() {
  const hubView = document.getElementById('reportsHubView');
  const detailView = document.getElementById('reportDetailView');

  // If a report is currently selected, show detail view
  if (state.selectedReport) {
    hubView.style.display = 'none';
    detailView.style.display = 'block';
    renderSelectedReportDetail(state.selectedReport);
  } else {
    hubView.style.display = 'block';
    detailView.style.display = 'none';
    renderDailyDashboardsGrid();
  }
}

// Render Grid of Daily Dashboard Cards
function renderDailyDashboardsGrid() {
  const grid = document.getElementById('dailyDashboardsGrid');
  grid.innerHTML = '';

  const reports = state.reportsHistory || [];

  // 1. If today has an active session with orders, show a LIVE today card at top
  const curSession = state.currentSession;
  if (curSession && curSession.isActive) {
    const curOrders = curSession.orders || [];
    const curExp = curSession.expenses || [];
    const liveRev = curOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
    const liveExp = curExp.reduce((s, e) => s + (e.amount || 0), 0);
    const liveProfit = liveRev - liveExp;
    const liveItems = curOrders.reduce((s, o) => s + (o.items || []).reduce((x, it) => x + it.quantity, 0), 0);

    const liveCard = document.createElement('div');
    liveCard.className = 'daily-dashboard-card today-card';
    liveCard.innerHTML = \`
      <div class="card-top-row">
        <div class="card-date-badge">
          <span>📅 \${curSession.date}</span>
        </div>
        <span class="card-day-name" style="background:#ECFDF5;color:#065f46;border:1px solid rgba(16,185,129,0.3)">🟢 Đang Bán (Live)</span>
      </div>

      <div class="card-time-span">
        ⏰ Mở ca lúc: <strong>\${curSession.startTime}</strong> &bull; Đang hoạt động
      </div>

      <div class="card-finance-stats">
        <div class="stat-item">
          <span class="stat-item-label">DOANH THU TẠM TÍNH</span>
          <span class="stat-item-num rev">\${formatMoney(liveRev)}</span>
        </div>
        <div class="stat-item">
          <span class="stat-item-label">CHI PHÍ ĐÃ CHI</span>
          <span class="stat-item-num exp">\${formatMoney(liveExp)}</span>
        </div>
      </div>

      <div class="card-net-profit-banner">
        <span class="banner-label">🌟 TIỀN CÒN LẠI (TẠM TÍNH):</span>
        <span class="banner-profit">\${formatMoney(liveProfit)}</span>
      </div>

      <div class="card-meta-chips">
        <span>👥 \${curOrders.length} lượt bàn</span> &bull; 
        <span>🍢 \${liveItems} món đã gọi</span>
      </div>

      <button class="btn-open-dashboard-detail" style="background:var(--gold-primary);color:#fff">
        📊 Xem Dashboard Trực Tiếp Hôm Nay
      </button>
    \`;

    liveCard.onclick = () => {
      // Build a temporary live report object
      const liveReport = {
        id: 'live_today',
        date: curSession.date,
        dayOfWeek: 'Hôm nay (Đang bán)',
        startTime: curSession.startTime,
        endTime: 'Hiện tại',
        duration: 'Đang diễn ra',
        totalRevenue: liveRev,
        totalExpense: liveExp,
        netProfit: liveProfit,
        cashAmount: curOrders.filter(o => o.paymentMethod === 'cash').reduce((s, o) => s + o.totalAmount, 0),
        transferAmount: curOrders.filter(o => o.paymentMethod === 'transfer').reduce((s, o) => s + o.totalAmount, 0),
        tableTurnCount: curOrders.length,
        totalItemsCount: liveItems,
        note: curSession.note || 'Ca bán đang chạy',
        itemsSoldSummary: aggregateOrdersItems(curOrders),
        expenses: curExp,
        orders: curOrders
      };
      openReportDetailObject(liveReport);
    };

    grid.appendChild(liveCard);
  }

  // 2. Render all past closed daily dashboards
  if (reports.length === 0 && (!curSession || !curSession.isActive)) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted)">Chưa có báo cáo ngày nào được chốt sổ. Hãy bấm Bắt Đầu Bán rồi Kết Thúc Bán để lưu báo cáo đầu tiên!</div>';
    return;
  }

  reports.forEach(rep => {
    const card = document.createElement('div');
    card.className = 'daily-dashboard-card';
    card.innerHTML = \`
      <div class="card-top-row">
        <div class="card-date-badge">
          <span>📅 \${rep.date}</span>
        </div>
        <span class="card-day-name">\${rep.dayOfWeek || 'Đã chốt'}</span>
      </div>

      <div class="card-time-span">
        ⏰ Ca bán: <strong>\${rep.startTime || '--:--'} - \${rep.endTime || '--:--'}</strong> (\${rep.duration || ''})
      </div>

      <div class="card-finance-stats">
        <div class="stat-item">
          <span class="stat-item-label">TỔNG DOANH THU</span>
          <span class="stat-item-num rev">\${formatMoney(rep.totalRevenue)}</span>
        </div>
        <div class="stat-item">
          <span class="stat-item-label">TỔNG CHI PHÍ</span>
          <span class="stat-item-num exp">\${formatMoney(rep.totalExpense)}</span>
        </div>
      </div>

      <div class="card-net-profit-banner">
        <span class="banner-label">🌟 LỢI NHUẬN THỰC:</span>
        <span class="banner-profit">\${formatMoney(rep.netProfit)}</span>
      </div>

      <div class="card-meta-chips">
        <span>👥 \${rep.tableTurnCount || 0} lượt bàn</span> &bull; 
        <span>🍢 \${(rep.totalItemsCount || 0).toLocaleString('vi-VN')} món</span>
      </div>

      <button class="btn-open-dashboard-detail">
        👉 Xem Chi Tiết Báo Cáo Ngày Này
      </button>
    \`;

    card.onclick = () => openReportDetail(rep.id);
    grid.appendChild(card);
  });
}

function aggregateOrdersItems(orders) {
  const itemMap = {};
  orders.forEach(o => {
    (o.items || []).forEach(it => {
      if (!itemMap[it.name]) {
        itemMap[it.name] = { id: it.id, name: it.name, unit: it.unit || 'phần', price: it.price, quantity: 0, totalAmount: 0 };
      }
      itemMap[it.name].quantity += it.quantity;
      itemMap[it.name].totalAmount += (it.price * it.quantity);
    });
  });
  return Object.values(itemMap).sort((a, b) => b.quantity - a.quantity);
}

// Open Detail View of a specific report
function openReportDetail(reportId) {
  const rep = (state.reportsHistory || []).find(r => r.id === reportId);
  if (!rep) return;
  openReportDetailObject(rep);
}

function openReportDetailObject(rep) {
  state.selectedReport = rep;
  renderReportsView();
  playSound('tap');
}

function backToDashboardHub() {
  state.selectedReport = null;
  renderReportsView();
  playSound('tap');
}

// Render Complete Detail View of Selected Day Report
function renderSelectedReportDetail(rep) {
  document.getElementById('detailRepDateTitle').textContent = \`📊 BÁO CÁO CHI TIẾT NGÀY: \${rep.date}\`;
  document.getElementById('detailRepSub').innerHTML = \`
    <strong>\${rep.dayOfWeek || ''}</strong> &bull; 
    Khung giờ bán: <strong>\${rep.startTime || '--:--'} - \${rep.endTime || '--:--'}</strong> (\${rep.duration || ''}) &bull; 
    <strong>\${rep.tableTurnCount || 0} lượt bàn phục vụ</strong>
  \`;

  document.getElementById('detRepTotalRev').textContent = formatMoney(rep.totalRevenue);
  document.getElementById('detRepDateRevSub').textContent = \`Ngày \${rep.date}\`;
  document.getElementById('detRepTotalTurns').textContent = \`\${rep.tableTurnCount || 0} lượt\`;
  document.getElementById('detRepTotalItems').textContent = \`\${(rep.totalItemsCount || 0).toLocaleString('vi-VN')} sản phẩm\`;
  document.getElementById('detRepNetProfit').textContent = formatMoney(rep.netProfit);

  document.getElementById('detRepCash').textContent = formatMoney(rep.cashAmount || 0);
  document.getElementById('detRepTransfer').textContent = formatMoney(rep.transferAmount || 0);
  document.getElementById('detRepExpense').textContent = formatMoney(rep.totalExpense || 0);

  // Table 1: Items Sold Breakdown
  const itemsTbody = document.getElementById('detItemsSoldTbody');
  itemsTbody.innerHTML = '';
  const items = rep.itemsSoldSummary || [];

  if (items.length === 0) {
    itemsTbody.innerHTML = '<tr><td colspan="6" align="center" style="padding:20px;color:var(--text-muted)">Không có số liệu món bán</td></tr>';
  } else {
    items.forEach((it, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = \`
        <td><strong style="color:var(--gold-dark)">#\${idx + 1}</strong></td>
        <td><strong>\${it.name}</strong></td>
        <td>\${it.unit || 'cây'}</td>
        <td class="text-right"><strong>\${(it.quantity).toLocaleString('vi-VN')}</strong></td>
        <td class="text-right">\${(it.price).toLocaleString('vi-VN')}</td>
        <td class="text-right"><strong style="color:var(--gold-dark)">\${formatMoney(it.totalAmount)}</strong></td>
      \`;
      itemsTbody.appendChild(tr);
    });
  }

  // Table 2: Expenses Breakdown
  const expTbody = document.getElementById('detExpensesTbody');
  expTbody.innerHTML = '';
  const exps = rep.expenses || [];
  document.getElementById('detExpTotalBadge').textContent = \`Tổng chi: \${formatMoney(rep.totalExpense)}\`;

  if (exps.length === 0) {
    expTbody.innerHTML = '<tr><td colspan="4" align="center" style="padding:20px;color:var(--text-muted)">Không có khoản chi nào trong ngày này</td></tr>';
  } else {
    exps.forEach(e => {
      const tr = document.createElement('tr');
      tr.innerHTML = \`
        <td style="color:var(--text-muted)">\${e.time || '--:--'}</td>
        <td><span class="exp-category-badge">\${e.category || 'Chi phí'}</span></td>
        <td><strong>\${e.description}</strong></td>
        <td class="text-right"><strong style="color:#ef4444">\${formatMoney(e.amount)}</strong></td>
      \`;
      expTbody.appendChild(tr);
    });
  }

  // Table 3: Orders List
  const ordTbody = document.getElementById('detOrdersTbody');
  ordTbody.innerHTML = '';
  const ords = rep.orders || [];
  document.getElementById('detOrdersCountBadge').textContent = \`\${ords.length} hóa đơn\`;

  if (ords.length === 0) {
    ordTbody.innerHTML = '<tr><td colspan="5" align="center" style="padding:20px;color:var(--text-muted)">Không có hóa đơn lẻ được lưu</td></tr>';
  } else {
    ords.forEach(o => {
      const tr = document.createElement('tr');
      tr.innerHTML = \`
        <td style="color:var(--text-muted)">\${o.time || '--:--'}</td>
        <td><strong>\${o.tableName}</strong></td>
        <td>\${o.paymentMethod === 'transfer' ? '📱 Chuyển khoản VietQR' : '💵 Tiền mặt'}</td>
        <td>\${o.itemCount || (o.items ? o.items.length : 0)} món</td>
        <td class="text-right"><strong style="color:var(--color-free)">\${formatMoney(o.totalAmount)}</strong></td>
      \`;
      ordTbody.appendChild(tr);
    });
  }
}
`;

// Integrate newAppLogic and update renderAllViews & fetchInitialState
// 1. In fetchInitialState:
appJs = appJs.replace('state.inventory = data.inventory || [];', `state.inventory = data.inventory || [];
    state.currentSession = data.currentSession || null;
    state.reportsHistory = data.reportsHistory || [];`);

// 2. In renderAllViews:
appJs = appJs.replace('renderTablesGrid();', 'renderSessionBar();\n  renderTablesGrid();');

// 3. In DOMContentLoaded setup:
appJs = appJs.replace('setupQuickSeed();', 'setupQuickSeed();\n  setupSessionAndReportsHub();');

// 4. Append newAppLogic at the end:
appJs += '\n' + newAppLogic;

fs.writeFileSync(appJsPath, appJs, 'utf-8');
console.log('Updated public/app.js with Session and Day Dashboard features!');
