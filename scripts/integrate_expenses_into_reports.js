const fs = require('fs');
const path = require('path');

const targetDir = 'd:/dự án antigravity/Xieng_Nuong_Be_Huyen';
const publicDir = path.join(targetDir, 'public');
const appJsPath = path.join(publicDir, 'app.js');
const serverJsPath = path.join(targetDir, 'server.js');

// ========================================================
// 1. UPDATE public/app.js
// ========================================================
let appJs = fs.readFileSync(appJsPath, 'utf-8');

// A. Fix applyRolePermissions (remove tabExpenses)
appJs = appJs.replace(
  `  const tabExpenses = document.getElementById('tabBtnExpenses');
  const tabReports = document.getElementById('tabBtnReports');
  const tabInventory = document.getElementById('tabBtnInventory');
  const tabAi = document.getElementById('tabBtnAi');

  if (isStaff) {
    tabExpenses.style.display = 'none';
    tabReports.style.display = 'none';
    tabInventory.style.display = 'none';
    tabAi.style.display = 'none';
    // Switch to tables view if currently on hidden tab
    document.getElementById('tabBtnTables').click();
  } else {
    tabExpenses.style.display = 'flex';
    tabReports.style.display = 'flex';
    tabInventory.style.display = 'flex';
    tabAi.style.display = 'flex';
  }`,
  `  const tabReports = document.getElementById('tabBtnReports');
  const tabInventory = document.getElementById('tabBtnInventory');
  const tabAi = document.getElementById('tabBtnAi');

  if (isStaff) {
    if (tabReports) tabReports.style.display = 'none';
    if (tabInventory) tabInventory.style.display = 'none';
    if (tabAi) tabAi.style.display = 'none';
    document.getElementById('tabBtnTables').click();
  } else {
    if (tabReports) tabReports.style.display = 'flex';
    if (tabInventory) tabInventory.style.display = 'flex';
    if (tabAi) tabAi.style.display = 'flex';
  }`
);

// B. In renderAllViews, remove renderExpensesView()
appJs = appJs.replace('renderExpensesView();\n', '');
appJs = appJs.replace('renderExpensesView();', '');

// C. In setupModals, link btnOpenAddExpenseFromReport and handle reportId
appJs = appJs.replace(
  `  const expModal = document.getElementById('addExpenseModal');
  document.getElementById('btnOpenAddExpense').onclick = () => {
    expModal.classList.add('open');
    document.getElementById('expAmount').value = '';
    document.getElementById('expDesc').value = '';
  };`,
  `  const expModal = document.getElementById('addExpenseModal');
  state.activeExpenseTargetReportId = null;

  const btnOpenExpFromRep = document.getElementById('btnOpenAddExpenseFromReport');
  if (btnOpenExpFromRep) {
    btnOpenExpFromRep.onclick = () => {
      state.activeExpenseTargetReportId = state.selectedReport ? state.selectedReport.id : null;
      expModal.classList.add('open');
      document.getElementById('expAmount').value = '';
      document.getElementById('expDesc').value = '';
    };
  }`
);

// D. In btnSaveExpense, pass reportId and update selectedReport
appJs = appJs.replace(
  `    await fetch('/api/expenses/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: cat, description: desc, amount: amount })
    });
    expModal.classList.remove('open');
    playSound('chime');
    fetchInitialState();`,
  `    const targetRepId = state.activeExpenseTargetReportId || (state.selectedReport ? state.selectedReport.id : null);
    await fetch('/api/expenses/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: cat, description: desc, amount: amount, reportId: targetRepId })
    });
    expModal.classList.remove('open');
    playSound('chime');
    await fetchInitialState();
    if (targetRepId && state.reportsHistory) {
      const updatedRep = state.reportsHistory.find(r => r.id === targetRepId);
      if (updatedRep) state.selectedReport = updatedRep;
    }
    renderReportsView();`
);

// E. In renderSelectedReportDetail, render delete button for each expense
const oldExpRowCode = `      const tr = document.createElement('tr');
      tr.innerHTML = \\\`
        <td style="color:var(--text-muted)">\\\${e.time || '--:--'}</td>
        <td><span class="exp-category-badge">\\\${e.category || 'Chi phí'}</span></td>
        <td><strong>\\\${e.description}</strong></td>
        <td class="text-right"><strong style="color:#ef4444">\\\${formatMoney(e.amount)}</strong></td>
      \\\`;
      expTbody.appendChild(tr);`;

const newExpRowCode = `      const tr = document.createElement('tr');
      tr.innerHTML = \\\`
        <td style="color:var(--text-muted)">\\\${e.time || '--:--'}</td>
        <td><span class="exp-category-badge" style="background:var(--bg-gold-tint);color:var(--gold-dark);padding:3px 8px;border-radius:12px;font-size:11px;font-weight:700;">\\\${e.category || 'Chi phí'}</span></td>
        <td><strong>\\\${e.description}</strong></td>
        <td class="text-right"><strong style="color:#ef4444">\\\${formatMoney(e.amount)}</strong></td>
        <td class="text-center">
          <button class="btn-del-exp-rep" data-id="\\\${e.id}" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:15px;" title="Xóa khoản chi">🗑️</button>
        </td>
      \\\`;

      const delBtn = tr.querySelector('.btn-del-exp-rep');
      if (delBtn) {
        delBtn.onclick = async () => {
          if (confirm(\\\`Xóa khoản chi: \\\${e.description} (\\\${formatMoney(e.amount)})?\\\`)) {
            await fetch('/api/expenses/delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: e.id, reportId: rep.id })
            });
            await fetchInitialState();
            if (rep.id && state.reportsHistory) {
              const updated = state.reportsHistory.find(r => r.id === rep.id);
              if (updated) state.selectedReport = updated;
            }
            renderReportsView();
          }
        };
      }
      expTbody.appendChild(tr);`;

appJs = appJs.replace(oldExpRowCode, newExpRowCode);

fs.writeFileSync(appJsPath, appJs, 'utf-8');
console.log('Updated public/app.js: Integrated Thu - Chi & Lợi Nhuận seamlessly into Daily Reports!');

// ========================================================
// 2. UPDATE server.js FOR EXPENSES WITH REPORT ID
// ========================================================
let serverJs = fs.readFileSync(serverJsPath, 'utf-8');

// Replace expenses/add handler in server.js
const oldExpAddHandler = `  // 5. EXPENSES
  if (pathname === '/api/expenses/add' && req.method === 'POST') {
    try {
      const data = await readJsonBody(req);
      const newExp = {
        id: 'e_' + Date.now(),
        category: data.category || 'Chi khác',
        description: data.description || 'Chi phí',
        amount: Number(data.amount) || 0,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };

      if (db.currentSession && db.currentSession.isActive) {
        if (!db.currentSession.expenses) db.currentSession.expenses = [];
        db.currentSession.expenses.push(newExp);
      }
      if (!db.expenses) db.expenses = [];
      db.expenses.push(newExp);

      saveDB();
      broadcastUpdate('expense_added', newExp);
      return sendJson(res, 200, { success: true, expense: newExp });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }`;

const newExpAddHandler = `  // 5. EXPENSES (INTEGRATED WITH DAILY REPORTS)
  if (pathname === '/api/expenses/add' && req.method === 'POST') {
    try {
      const data = await readJsonBody(req);
      const newExp = {
        id: 'e_' + Date.now(),
        category: data.category || 'Chi khác',
        description: data.description || 'Chi phí',
        amount: Number(data.amount) || 0,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };

      const reportId = data.reportId;
      if (reportId && db.reportsHistory) {
        const rep = db.reportsHistory.find(r => r.id === reportId);
        if (rep) {
          if (!rep.expenses) rep.expenses = [];
          rep.expenses.push(newExp);
          rep.totalExpense = rep.expenses.reduce((s, e) => s + (e.amount || 0), 0);
          rep.netProfit = rep.totalRevenue - rep.totalExpense;
        }
      }

      if (db.currentSession && db.currentSession.isActive) {
        if (!db.currentSession.expenses) db.currentSession.expenses = [];
        db.currentSession.expenses.push(newExp);
      }
      if (!db.expenses) db.expenses = [];
      db.expenses.push(newExp);

      saveDB();
      broadcastUpdate('expense_added', { expense: newExp, reportId });
      return sendJson(res, 200, { success: true, expense: newExp });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }`;

serverJs = serverJs.replace(oldExpAddHandler, newExpAddHandler);

// Replace expenses/delete handler in server.js
const oldExpDelHandler = `  if (pathname === '/api/expenses/delete' && req.method === 'POST') {
    try {
      const data = await readJsonBody(req);
      if (db.currentSession && db.currentSession.expenses) {
        db.currentSession.expenses = db.currentSession.expenses.filter(e => e.id !== data.id);
      }
      db.expenses = db.expenses.filter(e => e.id !== data.id);
      saveDB();
      broadcastUpdate('expense_deleted', { id: data.id });
      return sendJson(res, 200, { success: true });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }`;

const newExpDelHandler = `  if (pathname === '/api/expenses/delete' && req.method === 'POST') {
    try {
      const data = await readJsonBody(req);
      const reportId = data.reportId;
      if (reportId && db.reportsHistory) {
        const rep = db.reportsHistory.find(r => r.id === reportId);
        if (rep && rep.expenses) {
          rep.expenses = rep.expenses.filter(e => e.id !== data.id);
          rep.totalExpense = rep.expenses.reduce((s, e) => s + (e.amount || 0), 0);
          rep.netProfit = rep.totalRevenue - rep.totalExpense;
        }
      }

      if (db.currentSession && db.currentSession.expenses) {
        db.currentSession.expenses = db.currentSession.expenses.filter(e => e.id !== data.id);
      }
      if (db.expenses) {
        db.expenses = db.expenses.filter(e => e.id !== data.id);
      }
      saveDB();
      broadcastUpdate('expense_deleted', { id: data.id, reportId });
      return sendJson(res, 200, { success: true });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }`;

serverJs = serverJs.replace(oldExpDelHandler, newExpDelHandler);

fs.writeFileSync(serverJsPath, serverJs, 'utf-8');
console.log('Updated server.js: Expenses support adding/deleting per report ID!');
