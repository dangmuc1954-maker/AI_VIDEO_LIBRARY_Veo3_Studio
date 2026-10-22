const fs = require('fs');
const path = require('path');

const targetDir = 'd:/dự án antigravity/Xieng_Nuong_Be_Huyen';
const publicDir = path.join(targetDir, 'public');

const appJsContent = `/**
 * XIÊNG NƯỚNG BÉ HUYỀN - POS CLIENT APPLICATION
 * Tác giả: Tris & ENI
 */

// Application State
const state = {
  settings: {
    storeName: "Xiêng Nướng Bé Huyền",
    bankId: "MB",
    accountNo: "0908123456",
    accountName: "NGUYEN THI BE HUYEN"
  },
  tables: [],
  menu: [],
  expenses: [],
  completedOrders: [],
  inventory: [],
  role: 'owner', // 'owner' or 'staff'
  currentTable: null,
  activeFilter: 'all',
  activeCategory: 'all'
};

// Web Audio API Synthesizer (Chimes & Taps)
const audioCtx = typeof AudioContext !== 'undefined' ? new (window.AudioContext || window.webkitAudioContext)() : null;
function playSound(type) {
  if (!audioCtx) return;
  try {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'tap') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.06);
    } else if (type === 'chime') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.16); // G5
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    }
  } catch (e) {}
}

// Currency Formatter
function formatMoney(num) {
  return (Number(num) || 0).toLocaleString('vi-VN') + 'đ';
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupRoleSwitcher();
  setupModals();
  setupAiAssistant();
  setupQuickSeed();
  fetchInitialState();
  initRealtimeSSE();
});

// Fetch full state from backend
async function fetchInitialState() {
  try {
    const res = await fetch('/api/state');
    if (!res.ok) throw new Error('Failed to load state');
    const data = await res.json();
    
    state.settings = data.settings || state.settings;
    state.tables = data.tables || [];
    state.menu = data.menu || [];
    state.expenses = data.expenses || [];
    state.completedOrders = data.completedOrders || [];
    state.inventory = data.inventory || [];

    renderAllViews();
  } catch (err) {
    console.error('Error loading initial state:', err);
    document.getElementById('syncStatus').textContent = 'Chế độ Offline';
  }
}

// Connect to Server-Sent Events for Realtime sync
function initRealtimeSSE() {
  try {
    const evtSource = new EventSource('/api/events');
    const syncStatus = document.getElementById('syncStatus');

    evtSource.onopen = () => {
      syncStatus.textContent = 'Đồng bộ Realtime';
      syncStatus.parentElement.style.borderColor = 'rgba(16, 185, 129, 0.3)';
    };

    evtSource.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      console.log('Realtime Event:', msg.type);
      fetchInitialState(); // Refresh local state
    };

    evtSource.onerror = () => {
      syncStatus.textContent = 'Đang kết nối lại...';
      syncStatus.parentElement.style.borderColor = 'rgba(239, 68, 68, 0.3)';
    };
  } catch (err) {
    console.warn('SSE not supported or failed:', err);
  }
}

// Setup Navigation Tabs
function setupNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');
  const views = document.querySelectorAll('.tab-view');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      views.forEach(v => v.classList.remove('active'));

      tab.classList.add('active');
      const targetId = 'view-' + tab.dataset.tab;
      const targetView = document.getElementById(targetId);
      if (targetView) targetView.classList.add('active');

      playSound('tap');
    });
  });

  // Table Filters (All / Serving / Empty)
  const filters = document.querySelectorAll('.filter-pill');
  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeFilter = btn.dataset.filter;
      renderTablesGrid();
      playSound('tap');
    });
  });
}

// Setup Role Switcher (Owner vs Staff)
function setupRoleSwitcher() {
  const roleSelect = document.getElementById('roleSelect');
  roleSelect.addEventListener('change', (e) => {
    state.role = e.target.value;
    applyRolePermissions();
    playSound('tap');
  });
}

function applyRolePermissions() {
  const isStaff = state.role === 'staff';
  
  // Hide owner-only tabs for staff
  const tabExpenses = document.getElementById('tabBtnExpenses');
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
  }
}

// Render All Views
function renderAllViews() {
  renderTablesGrid();
  renderReportsView();
  renderExpensesView();
  renderInventoryView();
  updateTopCounters();
}

function updateTopCounters() {
  const servingCount = state.tables.filter(t => t.status === 'serving').length;
  const emptyCount = state.tables.length - servingCount;
  const servingTotal = state.tables
    .filter(t => t.status === 'serving')
    .reduce((sum, t) => sum + (t.totalAmount || 0), 0);

  document.getElementById('activeTablesCount').textContent = servingCount;
  document.getElementById('countServing').textContent = servingCount;
  document.getElementById('countEmpty').textContent = emptyCount;
  document.getElementById('chipServingCount').textContent = \`\${servingCount}/\${state.tables.length} bàn\`;
  document.getElementById('chipServingTotal').textContent = formatMoney(servingTotal);
}

// ========================================================
// 1. RENDER 20 TABLES GRID
// ========================================================
function renderTablesGrid() {
  const grid = document.getElementById('tablesGrid');
  grid.innerHTML = '';

  let filteredTables = state.tables;
  if (state.activeFilter === 'serving') {
    filteredTables = state.tables.filter(t => t.status === 'serving');
  } else if (state.activeFilter === 'empty') {
    filteredTables = state.tables.filter(t => t.status === 'empty');
  }

  filteredTables.forEach(t => {
    const isServing = t.status === 'serving';
    const card = document.createElement('div');
    card.className = \`table-card status-\${t.status}\`;

    const itemCount = (t.items || []).reduce((s, it) => s + it.quantity, 0);

    card.innerHTML = \`
      <div class="table-top">
        <div class="table-number">
          <span>\${t.name}</span>
        </div>
        <span class="table-status-tag">\${isServing ? '🔴 Có khách' : '🟢 Trống'}</span>
      </div>

      <div class="table-body">
        <div class="table-amount">\${formatMoney(t.totalAmount || 0)}</div>
        <div class="table-meta">
          <span>\${isServing ? \`⏰ \${t.openedAt || '--:--'}\` : 'Chưa có khách'}</span>
          <span>\${isServing ? \`🍢 \${itemCount} món\` : ''}</span>
        </div>
      </div>

      <div class="table-actions">
        <button class="btn-table-action add-order" data-id="\${t.id}">
          ➕ Gọi Món
        </button>
        \${isServing ? \`
          <button class="btn-table-action pay-fast" data-id="\${t.id}">
            💳 Tính Tiền
          </button>
        \` : ''}
      </div>
    \`;

    // Click card or "+ Gọi món" opens order modal
    card.addEventListener('click', (e) => {
      if (e.target.closest('.pay-fast')) {
        e.stopPropagation();
        openCheckoutModal(t.id);
      } else {
        openOrderModal(t.id);
      }
    });

    grid.appendChild(card);
  });
}

// ========================================================
// 2. ORDER MODAL (RAPID ORDERING)
// ========================================================
function openOrderModal(tableId) {
  const table = state.tables.find(t => t.id === tableId);
  if (!table) return;

  state.currentTable = JSON.parse(JSON.stringify(table));
  if (!state.currentTable.items) state.currentTable.items = [];

  document.getElementById('orderModalTableBadge').textContent = state.currentTable.name;
  document.getElementById('orderModalTime').textContent = state.currentTable.openedAt 
    ? \`Vào bàn: \${state.currentTable.openedAt}\` 
    : 'Bàn mới';

  renderCategoryPills();
  renderMenuGrid();
  renderCart();

  document.getElementById('orderModal').classList.add('open');
  playSound('tap');
}

function closeOrderModal() {
  document.getElementById('orderModal').classList.remove('open');
  state.currentTable = null;
}

function renderCategoryPills() {
  const container = document.getElementById('menuCategoryTabs');
  const cats = ['all', 'Xiên Nướng', 'Món Nóng', 'Ăn Vặt', 'Đồ Uống'];
  container.innerHTML = '';

  cats.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = \`cat-pill \${state.activeCategory === cat ? 'active' : ''}\`;
    btn.textContent = cat === 'all' ? 'Tất cả món' : cat;
    btn.addEventListener('click', () => {
      state.activeCategory = cat;
      renderCategoryPills();
      renderMenuGrid();
      playSound('tap');
    });
    container.appendChild(btn);
  });
}

function renderMenuGrid() {
  const grid = document.getElementById('menuGrid');
  grid.innerHTML = '';

  const items = state.activeCategory === 'all' 
    ? state.menu 
    : state.menu.filter(m => m.category === state.activeCategory);

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'menu-item-card';
    card.innerHTML = \`
      <div class="item-icon">\${item.icon || '🍢'}</div>
      <div class="item-name">\${item.name}</div>
      <div class="item-price">\${formatMoney(item.price)} <small style="color:var(--text-dim);font-size:11px">/\${item.unit}</small></div>
      <div class="item-rapid-buttons">
        <button class="rapid-btn" data-qty="1">+1</button>
        <button class="rapid-btn" data-qty="5">+5</button>
        <button class="rapid-btn" data-qty="10">+10</button>
      </div>
    \`;

    // Click card adds 1
    card.addEventListener('click', (e) => {
      const rapidBtn = e.target.closest('.rapid-btn');
      const addQty = rapidBtn ? Number(rapidBtn.dataset.qty) : 1;
      addItemToCart(item, addQty);
      playSound('tap');
    });

    grid.appendChild(card);
  });
}

function addItemToCart(item, qtyToAdd) {
  if (!state.currentTable) return;
  const existing = state.currentTable.items.find(it => it.id === item.id);
  if (existing) {
    existing.quantity += qtyToAdd;
  } else {
    state.currentTable.items.push({
      id: item.id,
      name: item.name,
      price: item.price,
      unit: item.unit,
      quantity: qtyToAdd
    });
  }
  renderCart();
}

function renderCart() {
  const list = document.getElementById('cartItemsList');
  list.innerHTML = '';

  let total = 0;
  let totalCount = 0;

  state.currentTable.items.forEach((it, idx) => {
    const itemTotal = it.price * it.quantity;
    total += itemTotal;
    totalCount += it.quantity;

    const row = document.createElement('div');
    row.className = 'cart-item-row';
    row.innerHTML = \`
      <div class="cart-item-info">
        <div class="cart-item-title">\${it.name}</div>
        <div class="cart-item-price-unit">\${formatMoney(it.price)} &times; \${it.quantity} \${it.unit || 'phần'} = <strong>\${formatMoney(itemTotal)}</strong></div>
      </div>
      <div class="cart-item-ctrls">
        <button class="qty-btn" data-action="dec" data-idx="\${idx}">-</button>
        <span class="cart-item-qty">\${it.quantity}</span>
        <button class="qty-btn" data-action="inc" data-idx="\${idx}">+</button>
      </div>
    \`;

    row.querySelectorAll('.qty-btn').forEach(b => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = b.dataset.action;
        const i = Number(b.dataset.idx);
        if (action === 'inc') {
          state.currentTable.items[i].quantity += 1;
        } else if (action === 'dec') {
          state.currentTable.items[i].quantity -= 1;
          if (state.currentTable.items[i].quantity <= 0) {
            state.currentTable.items.splice(i, 1);
          }
        }
        renderCart();
        playSound('tap');
      });
    });

    list.appendChild(row);
  });

  state.currentTable.totalAmount = total;
  document.getElementById('cartItemCount').textContent = \`\${totalCount} món\`;
  document.getElementById('cartTotalVal').textContent = formatMoney(total);
}

// Save Order to Server
async function saveCurrentOrder() {
  if (!state.currentTable) return;
  try {
    const res = await fetch('/api/table/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tableId: state.currentTable.id,
        items: state.currentTable.items,
        note: state.currentTable.note
      })
    });
    if (res.ok) {
      playSound('chime');
      closeOrderModal();
      fetchInitialState();
    }
  } catch (err) {
    alert('Lỗi lưu order: ' + err.message);
  }
}

// ========================================================
// 3. CHECKOUT & VIETQR PAYMENT
// ========================================================
function openCheckoutModal(tableId) {
  closeOrderModal();
  const table = state.tables.find(t => t.id === tableId);
  if (!table || !table.items || table.items.length === 0) {
    alert('Bàn này chưa có món để thanh toán!');
    return;
  }

  state.currentTable = table;
  document.getElementById('billTableName').textContent = table.name.toUpperCase();
  document.getElementById('billTime').textContent = new Date().toLocaleString('vi-VN');

  // Render bill table items
  const tbody = document.getElementById('billItemsTbody');
  tbody.innerHTML = '';
  table.items.forEach(it => {
    const tr = document.createElement('tr');
    tr.innerHTML = \`
      <td>\${it.name}</td>
      <td align="center">\${it.quantity}</td>
      <td align="right">\${(it.price).toLocaleString('vi-VN')}</td>
      <td align="right"><strong>\${(it.price * it.quantity).toLocaleString('vi-VN')}</strong></td>
    \`;
    tbody.appendChild(tr);
  });

  document.getElementById('billTotalAmount').textContent = formatMoney(table.totalAmount);

  // Default to cash calculation
  const cashInput = document.getElementById('cashGivenInput');
  cashInput.value = '';
  document.getElementById('cashChangeVal').textContent = '0đ';

  cashInput.oninput = () => {
    const given = Number(cashInput.value) || 0;
    const change = Math.max(0, given - table.totalAmount);
    document.getElementById('cashChangeVal').textContent = formatMoney(change);
  };

  // Setup payment method tabs
  const methodCards = document.querySelectorAll('.method-card');
  const cashBox = document.getElementById('cashCalcBox');
  const qrBox = document.getElementById('vietqrBox');

  methodCards.forEach(c => {
    c.onclick = () => {
      methodCards.forEach(m => m.classList.remove('active'));
      c.classList.add('active');
      const val = c.dataset.method;
      if (val === 'transfer') {
        cashBox.style.display = 'none';
        qrBox.style.display = 'block';
        generateVietQr(table.totalAmount, table.name);
      } else {
        cashBox.style.display = 'flex';
        qrBox.style.display = 'none';
      }
      playSound('tap');
    };
  });

  document.getElementById('checkoutModal').classList.add('open');
  playSound('tap');
}

function closeCheckoutModal() {
  document.getElementById('checkoutModal').classList.remove('open');
}

function generateVietQr(amount, tableName) {
  const bank = state.settings.bankId || 'MB';
  const acc = state.settings.accountNo || '0908123456';
  const name = encodeURIComponent(state.settings.accountName || 'NGUYEN THI BE HUYEN');
  const content = encodeURIComponent(\`\${tableName} Thanh Toan\`);
  
  const qrUrl = \`https://img.vietqr.io/image/\${bank}-\${acc}-compact2.png?amount=\${amount}&addInfo=\${content}&accountName=\${name}\`;
  document.getElementById('vietqrImg').src = qrUrl;
}

async function confirmPayment() {
  if (!state.currentTable) return;
  const selectedMethod = document.querySelector('.method-card.active').dataset.method;

  try {
    const res = await fetch('/api/table/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tableId: state.currentTable.id,
        paymentMethod: selectedMethod
      })
    });
    if (res.ok) {
      playSound('chime');
      closeCheckoutModal();
      fetchInitialState();
    }
  } catch (err) {
    alert('Lỗi thanh toán: ' + err.message);
  }
}

// ========================================================
// 4. REPORTS & AGGREGATED ITEMS SOLD TABLE
// ========================================================
function renderReportsView() {
  let totalRev = 0;
  let totalCash = 0;
  let totalTransfer = 0;
  let totalTurns = 0;
  let totalItemsCount = 0;

  // Aggregate items sold today
  const itemSummary = {};

  state.completedOrders.forEach(o => {
    totalRev += (o.totalAmount || 0);
    totalCash += (o.cashAmount || 0);
    totalTransfer += (o.transferAmount || 0);
    totalTurns += (o.tableTurnCount || 1);

    (o.items || []).forEach(it => {
      totalItemsCount += it.quantity;
      if (!itemSummary[it.name]) {
        itemSummary[it.name] = {
          name: it.name,
          unit: it.unit || 'cây',
          price: it.price,
          quantity: 0,
          totalAmount: 0
        };
      }
      itemSummary[it.name].quantity += it.quantity;
      itemSummary[it.name].totalAmount += (it.price * it.quantity);
    });
  });

  const totalExpense = state.expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const netProfit = totalRev - totalExpense;

  document.getElementById('repTotalRev').textContent = formatMoney(totalRev);
  document.getElementById('repTotalTurns').textContent = \`\${totalTurns} lượt\`;
  document.getElementById('repTotalItems').textContent = \`\${totalItemsCount.toLocaleString('vi-VN')} sản phẩm\`;
  document.getElementById('repNetProfit').textContent = formatMoney(netProfit);

  document.getElementById('repCash').textContent = formatMoney(totalCash);
  document.getElementById('repTransfer').textContent = formatMoney(totalTransfer);
  document.getElementById('repExpense').textContent = formatMoney(totalExpense);

  // Render Sorted Items Table (Tris's most wanted feature)
  const tbody = document.getElementById('itemsSoldTbody');
  tbody.innerHTML = '';

  const sortedList = Object.values(itemSummary).sort((a, b) => b.quantity - a.quantity);
  
  if (sortedList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" align="center" style="padding:20px;color:var(--text-dim)">Chưa có giao dịch thanh toán nào hôm nay</td></tr>';
    return;
  }

  sortedList.forEach((it, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = \`
      <td><strong style="color:var(--flame-secondary)">#\${idx + 1}</strong></td>
      <td><strong>\${it.name}</strong></td>
      <td>\${it.unit}</td>
      <td class="text-right"><strong style="color:#ffffff">\${it.quantity.toLocaleString('vi-VN')}</strong></td>
      <td class="text-right">\${(it.price).toLocaleString('vi-VN')}</td>
      <td class="text-right"><strong style="color:var(--flame-secondary)">\${formatMoney(it.totalAmount)}</strong></td>
    \`;
    tbody.appendChild(tr);
  });
}

// ========================================================
// 5. EXPENSES & FINANCE
// ========================================================
function renderExpensesView() {
  const totalRev = state.completedOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const totalExp = state.expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const net = totalRev - totalExp;

  document.getElementById('finRev').textContent = formatMoney(totalRev);
  document.getElementById('finExp').textContent = formatMoney(totalExp);
  document.getElementById('finNet').textContent = formatMoney(net);

  const tbody = document.getElementById('expensesTbody');
  tbody.innerHTML = '';

  if (state.expenses.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" align="center" style="padding:20px;color:var(--text-dim)">Chưa có khoản chi nào hôm nay</td></tr>';
    return;
  }

  state.expenses.forEach(e => {
    const tr = document.createElement('tr');
    tr.innerHTML = \`
      <td style="color:var(--text-dim)">\${e.time || '--:--'}</td>
      <td><span class="exp-category-badge">\${e.category}</span></td>
      <td><strong>\${e.description}</strong></td>
      <td class="text-right"><strong style="color:#f87171">\${formatMoney(e.amount)}</strong></td>
      <td class="text-center">
        <button class="btn-del-exp" data-id="\${e.id}" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:16px;">🗑️</button>
      </td>
    \`;

    tr.querySelector('.btn-del-exp').onclick = async () => {
      if (confirm(\`Xóa khoản chi: \${e.description} (\${formatMoney(e.amount)})?\`)) {
        await fetch('/api/expenses/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: e.id })
        });
        fetchInitialState();
      }
    };

    tbody.appendChild(tr);
  });
}

// ========================================================
// 6. INVENTORY & BOM CONSUMPTION
// ========================================================
function renderInventoryView() {
  const tbody = document.getElementById('inventoryTbody');
  tbody.innerHTML = '';

  // Calculate consumed ingredients
  const consumed = {};
  state.completedOrders.forEach(o => {
    (o.items || []).forEach(it => {
      const menuIt = state.menu.find(m => m.id === it.id || m.name === it.name);
      if (menuIt && menuIt.bom) {
        for (const [ingId, needed] of Object.entries(menuIt.bom)) {
          consumed[ingId] = (consumed[ingId] || 0) + (needed * it.quantity);
        }
      }
    });
  });

  state.inventory.forEach(inv => {
    const cons = consumed[inv.id] || 0;
    const isLow = inv.stock <= inv.minStock;

    const tr = document.createElement('tr');
    tr.innerHTML = \`
      <td><strong>\${inv.name}</strong></td>
      <td>\${inv.unit}</td>
      <td class="text-right">\${cons.toLocaleString('vi-VN')} \${inv.unit}</td>
      <td class="text-right"><strong style="color:\${isLow ? '#ef4444' : '#10b981'}">\${inv.stock.toLocaleString('vi-VN')} \${inv.unit}</strong></td>
      <td class="text-center">
        <span class="stock-status-badge \${isLow ? 'low' : 'good'}" style="padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;\${isLow ? 'background:rgba(239,68,68,0.15);color:#f87171;' : 'background:rgba(16,185,129,0.15);color:#34d399;'}">
          \${isLow ? '⚠️ Sắp hết - Nhập thêm' : '✅ Ổn định'}
        </span>
      </td>
    \`;
    tbody.appendChild(tr);
  });
}

// ========================================================
// 7. AI ASSISTANT (BÉ HUYỀN COPILOT)
// ========================================================
function setupAiAssistant() {
  const input = document.getElementById('aiInputText');
  const btnSend = document.getElementById('btnAiSend');
  const chatLog = document.getElementById('aiChatLog');

  async function sendAiQuestion(text) {
    if (!text.trim()) return;

    // Append user message
    const userMsg = document.createElement('div');
    userMsg.className = 'ai-message user';
    userMsg.innerHTML = \`
      <div class="msg-avatar">🧑</div>
      <div class="msg-content">\${text}</div>
    \`;
    chatLog.appendChild(userMsg);
    input.value = '';
    chatLog.scrollTop = chatLog.scrollHeight;

    // Append loading placeholder
    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'ai-message assistant';
    loadingMsg.innerHTML = \`
      <div class="msg-avatar">🤖</div>
      <div class="msg-content" style="color:var(--text-dim)">Bé Huyền đang đọc số liệu của quán... ⏳</div>
    \`;
    chatLog.appendChild(loadingMsg);
    chatLog.scrollTop = chatLog.scrollHeight;

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text })
      });
      const data = await res.json();
      
      // Format markdown basic
      const formattedAnswer = (data.answer || '')
        .replace(/### (.*?)\\n/g, '<h4 style="margin:6px 0;color:#fbbf24">$1</h4>')
        .replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')
        .replace(/\\n/g, '<br>');

      loadingMsg.querySelector('.msg-content').innerHTML = formattedAnswer;
      loadingMsg.querySelector('.msg-content').style.color = 'var(--text-main)';
      playSound('chime');
    } catch (err) {
      loadingMsg.querySelector('.msg-content').textContent = 'Lỗi kết nối AI: ' + err.message;
    }
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  btnSend.onclick = () => sendAiQuestion(input.value);
  input.onkeypress = (e) => {
    if (e.key === 'Enter') sendAiQuestion(input.value);
  };

  // Quick Prompt Buttons
  document.querySelectorAll('.ai-prompt-btn').forEach(btn => {
    btn.onclick = () => {
      sendAiQuestion(btn.dataset.prompt);
      playSound('tap');
    };
  });
}

// ========================================================
// 8. MODAL CONTROLS & DEMO SEED
// ========================================================
function setupModals() {
  document.getElementById('btnCloseOrderModal').onclick = closeOrderModal;
  document.getElementById('btnSaveOrder').onclick = saveCurrentOrder;
  document.getElementById('btnOpenCheckout').onclick = () => {
    if (state.currentTable) openCheckoutModal(state.currentTable.id);
  };

  document.getElementById('btnCloseCheckoutModal').onclick = closeCheckoutModal;
  document.getElementById('btnConfirmPayment').onclick = confirmPayment;

  // Expenses Modal
  const expModal = document.getElementById('addExpenseModal');
  document.getElementById('btnOpenAddExpense').onclick = () => {
    expModal.classList.add('open');
    document.getElementById('expAmount').value = '';
    document.getElementById('expDesc').value = '';
  };
  document.getElementById('btnCloseExpenseModal').onclick = () => expModal.classList.remove('open');
  document.getElementById('btnCancelExpense').onclick = () => expModal.classList.remove('open');

  document.querySelectorAll('.exp-pill').forEach(p => {
    p.onclick = () => {
      document.getElementById('expDesc').value = p.dataset.desc;
    };
  });

  document.getElementById('btnSaveExpense').onclick = async () => {
    const cat = document.getElementById('expCategory').value;
    const desc = document.getElementById('expDesc').value;
    const amount = Number(document.getElementById('expAmount').value) || 0;
    if (!desc || amount <= 0) {
      alert('Vui lòng nhập nội dung và số tiền!');
      return;
    }
    await fetch('/api/expenses/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: cat, description: desc, amount: amount })
    });
    expModal.classList.remove('open');
    playSound('chime');
    fetchInitialState();
  };

  // Wifi LAN QR Modal
  const wifiModal = document.getElementById('wifiModal');
  document.getElementById('btnWifiQr').onclick = () => {
    const origin = window.location.origin;
    document.getElementById('wifiLanUrl').textContent = origin;
    document.getElementById('wifiQrImg').src = \`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=\${encodeURIComponent(origin)}\`;
    wifiModal.classList.add('open');
  };
  document.getElementById('btnCloseWifiModal').onclick = () => wifiModal.classList.remove('open');
}

function setupQuickSeed() {
  document.getElementById('btnSeedDemo').onclick = async () => {
    if (confirm('Nạp số liệu mẫu của Tris (Doanh thu 24.865.000đ, 1.248 xiên nướng, 87 lượt bàn, 8.100.000đ chi phí)?')) {
      await fetch('/api/seed', { method: 'POST' });
      fetchInitialState();
      playSound('chime');
      alert('Đã nạp số liệu mẫu thành công! Mời anh kiểm tra các mục Báo Cáo, Thu Chi và AI Copilot.');
    }
  };
}
`;

fs.writeFileSync(path.join(publicDir, 'app.js'), appJsContent, 'utf-8');
console.log('Created public/app.js successfully!');

// ==========================================
// 3. WRITE public/manifest.json (PWA Support)
// ==========================================
const manifestContent = {
  "name": "Xiêng Nướng Bé Huyền POS",
  "short_name": "Bé Huyền POS",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0c0e12",
  "theme_color": "#ff5722",
  "icons": [
    {
      "src": "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔥</text></svg>",
      "sizes": "192x192 512x512",
      "type": "image/svg+xml"
    }
  ]
};
fs.writeFileSync(path.join(publicDir, 'manifest.json'), JSON.stringify(manifestContent, null, 2), 'utf-8');
console.log('Created public/manifest.json successfully!');

// ==========================================
// 4. WRITE START_QUAN_AN.bat
// ==========================================
const batContent = `@echo off
chcp 65001 >nul
title XIÊNG NƯỚNG BÉ HUYỀN - POS 20 BÀN
cls
echo ============================================================
echo   🔥 ĐANG KHỞI ĐỘNG HỆ THỐNG POS XIÊNG NƯỚNG BÉ HUYỀN 🔥
echo ============================================================
echo.
start "" http://localhost:3000
node server.js
pause
`;
fs.writeFileSync(path.join(targetDir, 'START_QUAN_AN.bat'), batContent, 'utf-8');
console.log('Created START_QUAN_AN.bat successfully!');

// ==========================================
// 5. WRITE README.md
// ==========================================
const readmeContent = `# 🔥 XIÊNG NƯỚNG BÉ HUYỀN - HỆ THỐNG POS 20 BÀN & QUẢN LÝ QUÁN ĂN VẶT

> Được phát triển theo đúng chuẩn ý tưởng & thiết kế của **Tris** dành riêng cho Quán Xiêng Nướng Bé Huyền.

---

## 🌟 TÍNH NĂNG NỔI BẬT

### 1. Sơ Đồ 20 Bàn Trực Quan (🟢 Trống / 🔴 Có Khách)
- 20 bàn hiển thị dạng thẻ với màu sắc trực quan như đèn giao thông.
- Hiển thị tức thì tổng tiền đang gọi (ví dụ: \`520.000đ\`), số món, thời gian vào bàn.
- Chạm vào bàn bất kỳ để gọi món siêu tốc hoặc thanh toán ngay.

### 2. Order Siêu Tốc (Nút Bấm +1, +5, +10)
- Danh mục món: Xiên nướng (6k), Thịt xiên (7k), Bò lá lốt (7k), Lòng nướng (30k), Ốc nướng (30k), Cút nướng (15k), Bánh tráng mắm ruốc (15k)...
- Thao tác nhanh với các phím tắt \`+1\`, \`+5\`, \`+10\` cây/phần, không mất thời gian gõ bàn phím.
- Tự động nhân đơn giá x số lượng và tính tổng tiền bàn trong 0.1 giây.

### 3. Tự Động Tổng Hợp Từng Món Bán Trong Ngày
- **Không cần đếm từng tờ order tay cuối ngày!**
- Bảng thống kê chi tiết: Món | Đơn vị | Số lượng bán | Đơn giá | Thành tiền.
- Tự động xếp hạng các món bán chạy nhất (Best-sellers).

### 4. Quản Lý Thu - Chi & Lợi Nhuận Thực Tế
- Mục **💰 Chi Tiêu Hôm Nay**: Thêm nhanh các khoản nhập thịt, nhập que, rau sống, than hoa, nước đá, tiền gas, lương nhân viên...
- Tự động tính toán công thức:
  **Lợi Nhuận Thực (Tiền Còn Lại) = Doanh Thu Ngày - Tổng Chi Phí**

### 5. Thanh Toán 1-Chạm & Mã VietQR Động
- Hỗ trợ cả **Tiền mặt** (tự tính tiền thối lại) và **Chuyển khoản VietQR**.
- Tự động sinh mã VietQR Napas đúng số tiền của bàn và nội dung chuyển khoản để khách quét trả trong 2 giây.
- Hỗ trợ in hóa đơn tạm tính và hóa đơn thanh toán chuẩn máy in nhiệt K80/K58.

### 6. Kho Nguyên Liệu & Công Thức Định Lượng (BOM)
- Quản lý tiêu hao nguyên liệu theo món: 1 xiên nướng = 50g thịt heo, 1 que tre; 1 bò lá lốt = 40g bò băm, 5 lá lốt...
- Tự động tính tổng số kg thịt và que xiên đã tiêu thụ trong ngày.
- Cảnh báo tồn kho sắp hết.

### 7. Bé Huyền AI Copilot (Trợ Lý Quán Thông Minh)
- Hỏi đáp trực tiếp bằng ngôn ngữ tự nhiên:
  - *"Tại sao hôm nay lời thấp hơn hôm qua?"*
  - *"Ngày mai cần chuẩn bị bao nhiêu kg thịt và que xiên?"*
  - *"Món nào bán chạy nhất, món nào bán chậm?"*

### 8. Phân Quyền Nhân Viên vs Chủ Quán
- **Nhân viên**: Chỉ thấy bàn, thêm món, thanh toán, in bill. Ẩn hoàn toàn doanh thu, chi phí, lợi nhuận.
- **Chủ quán**: Full quyền xem toàn bộ báo cáo tài chính, kho, cài đặt giá.

---

## 🚀 HƯỚNG DẪN KHỞI CHẠY (1-CLICK)

1. Mở thư mục: \`d:\\dự án antigravity\\Xieng_Nuong_Be_Huyen\`
2. Nhấp đúp vào file: **\`START_QUAN_AN.bat\`**
3. Màn hình tự động mở trình duyệt tại: \`http://localhost:3000\`
4. Muốn mở trên điện thoại / iPad của nhân viên:
   - Kết nối chung mạng Wifi của quán.
   - Nhấp vào nút **"📱 Kết Nối Điện Thoại"** ở góc phải màn hình để quét mã QR mở ngay trên điện thoại!
`;
fs.writeFileSync(path.join(targetDir, 'README.md'), readmeContent, 'utf-8');
console.log('Created README.md successfully!');
