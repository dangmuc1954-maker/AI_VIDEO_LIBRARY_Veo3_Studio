const fs = require('fs');
const path = require('path');

const targetDir = 'd:/dự án antigravity/Xieng_Nuong_Be_Huyen';
const publicDir = path.join(targetDir, 'public');
const appJsPath = path.join(publicDir, 'app.js');
const cssPath = path.join(publicDir, 'style.css');

// ========================================================
// 1. UPDATE public/style.css
// ========================================================
let css = fs.readFileSync(cssPath, 'utf-8');

const additionalCss = `
/* ========================================================
   INVENTORY & BOM RECIPES STYLES
   ======================================================== */
.bom-recipes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.bom-card {
  background: #FFFFFF;
  border: 1.5px solid var(--gold-border);
  border-radius: var(--radius-lg);
  padding: 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: var(--shadow-card);
  transition: all 0.2s;
}

.bom-card:hover {
  border-color: var(--gold-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.bom-card-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.bom-item-icon {
  font-size: 28px;
  width: 44px;
  height: 44px;
  background: var(--bg-gold-tint);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.bom-item-title {
  font-size: 15px;
  font-weight: 800;
  color: var(--text-main);
}

.bom-item-price {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 800;
  color: var(--gold-dark);
}

.bom-ingredients-box {
  background: var(--bg-subtle);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  margin-bottom: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bom-ing-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
}

.bom-ing-name {
  color: var(--text-main);
  font-weight: 600;
}

.bom-ing-qty {
  font-family: var(--font-mono);
  font-weight: 800;
  color: var(--gold-dark);
}

.btn-edit-bom {
  width: 100%;
  padding: 9px;
  border-radius: var(--radius-sm);
  background: var(--bg-elevated);
  border: 1px solid var(--gold-border);
  color: var(--gold-dark);
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-edit-bom:hover {
  background: var(--gold-primary);
  color: #FFFFFF;
  border-color: var(--gold-primary);
}

.bom-edit-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
`;

css += additionalCss;
fs.writeFileSync(cssPath, css, 'utf-8');
console.log('Updated style.css with BOM Recipes Grid styles!');

// ========================================================
// 2. UPDATE public/app.js WITH INVENTORY INTERACTIVE LOGIC
// ========================================================
let appJs = fs.readFileSync(appJsPath, 'utf-8');

// Replace renderInventoryView in app.js
const oldRenderInvRegex = /\/\/ =+\s*\/\/ 6\. INVENTORY & BOM CONSUMPTION[\s\S]*?function renderInventoryView\(\)[\s\S]*?\n\}/;

const newRenderInvCode = `// ========================================================
// 6. INVENTORY & BOM MANAGEMENT (FULL EDITABLE & INTERACTIVE)
// ========================================================
state.activeInvSubTab = 'stock'; // 'stock' or 'bom'
state.editingBomMenuId = null;

function setupInventoryControls() {
  const tabStock = document.getElementById('invSubTabStock');
  const tabBom = document.getElementById('invSubTabBom');
  const stockContainer = document.getElementById('invStockContainer');
  const bomContainer = document.getElementById('invBomContainer');

  if (tabStock && tabBom) {
    tabStock.onclick = () => {
      tabStock.classList.add('active');
      tabBom.classList.remove('active');
      stockContainer.style.display = 'block';
      bomContainer.style.display = 'none';
      state.activeInvSubTab = 'stock';
      playSound('tap');
    };

    tabBom.onclick = () => {
      tabBom.classList.add('active');
      tabStock.classList.remove('active');
      stockContainer.style.display = 'none';
      bomContainer.style.display = 'block';
      state.activeInvSubTab = 'bom';
      renderBomRecipes();
      playSound('tap');
    };
  }

  // Import Modal
  const importModal = document.getElementById('importInventoryModal');
  const btnOpenImport = document.getElementById('btnOpenImportModal');
  const btnCloseImport = document.getElementById('btnCloseImportModal');
  const btnCancelImport = document.getElementById('btnCancelImport');
  const btnSaveImport = document.getElementById('btnSaveImport');

  if (btnOpenImport) {
    btnOpenImport.onclick = () => {
      populateImportSelect();
      importModal.classList.add('open');
      document.getElementById('importQtyInput').value = '';
      document.getElementById('importCostInput').value = '';
    };
  }
  if (btnCloseImport) btnCloseImport.onclick = () => importModal.classList.remove('open');
  if (btnCancelImport) btnCancelImport.onclick = () => importModal.classList.remove('open');
  if (btnSaveImport) btnSaveImport.onclick = handleSaveImport;

  // Edit Stock Modal
  const editStockModal = document.getElementById('editStockModal');
  const btnCloseEditStock = document.getElementById('btnCloseEditStockModal');
  const btnCancelEditStock = document.getElementById('btnCancelEditStock');
  const btnSaveEditStock = document.getElementById('btnSaveEditStock');

  if (btnCloseEditStock) btnCloseEditStock.onclick = () => editStockModal.classList.remove('open');
  if (btnCancelEditStock) btnCancelEditStock.onclick = () => editStockModal.classList.remove('open');
  if (btnSaveEditStock) btnSaveEditStock.onclick = handleSaveEditStock;

  // Add Ingredient Modal
  const addIngModal = document.getElementById('addIngredientModal');
  const btnOpenAddIng = document.getElementById('btnOpenAddIngredientModal');
  const btnCloseAddIng = document.getElementById('btnCloseAddIngModal');
  const btnCancelAddIng = document.getElementById('btnCancelAddIng');
  const btnSaveAddIng = document.getElementById('btnSaveAddIng');

  if (btnOpenAddIng) btnOpenAddIng.onclick = () => {
    addIngModal.classList.add('open');
    document.getElementById('newIngName').value = '';
    document.getElementById('newIngStock').value = '';
    document.getElementById('newIngMinStock').value = '';
  };
  if (btnCloseAddIng) btnCloseAddIng.onclick = () => addIngModal.classList.remove('open');
  if (btnCancelAddIng) btnCancelAddIng.onclick = () => addIngModal.classList.remove('open');
  if (btnSaveAddIng) btnSaveAddIng.onclick = handleSaveAddIngredient;

  // Edit BOM Modal
  const editBomModal = document.getElementById('editBomModal');
  const btnCloseEditBom = document.getElementById('btnCloseEditBomModal');
  const btnCancelEditBom = document.getElementById('btnCancelEditBom');
  const btnSaveEditBom = document.getElementById('btnSaveEditBom');
  const btnAddBomRow = document.getElementById('btnAddBomRow');

  if (btnCloseEditBom) btnCloseEditBom.onclick = () => editBomModal.classList.remove('open');
  if (btnCancelEditBom) btnCancelEditBom.onclick = () => editBomModal.classList.remove('open');
  if (btnSaveEditBom) btnSaveEditBom.onclick = handleSaveEditBom;
  if (btnAddBomRow) btnAddBomRow.onclick = () => appendBomRow('', 10);
}

function renderInventoryView() {
  const tbody = document.getElementById('inventoryTbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  // Calculate consumed from active session or completed orders
  const consumed = {};
  const ordersSource = (state.currentSession && state.currentSession.isActive) 
    ? state.currentSession.orders 
    : state.completedOrders;

  (ordersSource || []).forEach(o => {
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
      <td><strong style="color:var(--text-main);font-size:15px;">\${inv.name}</strong></td>
      <td>\${inv.unit}</td>
      <td class="text-right">\${cons.toLocaleString('vi-VN')} \${inv.unit}</td>
      <td class="text-right"><strong style="color:\${isLow ? '#ef4444' : '#10b981'};font-size:16px;">\${(inv.stock || 0).toLocaleString('vi-VN')} \${inv.unit}</strong></td>
      <td class="text-center">
        <span class="stock-status-badge \${isLow ? 'low' : 'good'}" style="padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;\${isLow ? 'background:rgba(239,68,68,0.15);color:#f87171;' : 'background:rgba(16,185,129,0.15);color:#34d399;'}">
          \${isLow ? '⚠️ Sắp hết - Nhập thêm' : '✅ Ổn định'}
        </span>
      </td>
      <td class="text-center">
        <button class="btn-action btn-edit-stock" data-id="\${inv.id}" style="padding:5px 12px;font-size:12px;font-weight:800;background:var(--bg-gold-tint);border-color:var(--gold-border);color:var(--gold-dark);">
          ✏️ Sửa Tồn
        </button>
      </td>
    \`;

    tr.querySelector('.btn-edit-stock').onclick = () => openEditStockModal(inv);
    tbody.appendChild(tr);
  });

  if (state.activeInvSubTab === 'bom') {
    renderBomRecipes();
  }
}

// Render BOM Recipes Grid
function renderBomRecipes() {
  const grid = document.getElementById('bomRecipesGrid');
  if (!grid) return;
  grid.innerHTML = '';

  state.menu.forEach(item => {
    const card = document.createElement('div');
    card.className = 'bom-card';

    // Build ingredients list text
    let bomListHtml = '';
    const bom = item.bom || {};
    const entries = Object.entries(bom);

    if (entries.length === 0) {
      bomListHtml = '<span style="font-size:12px;color:var(--text-muted);font-style:italic">Chưa cài đặt định lượng nguyên liệu</span>';
    } else {
      entries.forEach(([ingId, needed]) => {
        const ing = state.inventory.find(i => i.id === ingId);
        const ingName = ing ? ing.name : ingId;
        const ingUnit = ing ? ing.unit : '';
        bomListHtml += \`
          <div class="bom-ing-row">
            <span class="bom-ing-name">• \${ingName}:</span>
            <span class="bom-ing-qty">\${needed} \${ingUnit}</span>
          </div>
        \`;
      });
    }

    card.innerHTML = \`
      <div>
        <div class="bom-card-top">
          <div class="bom-item-icon">\${item.icon || '🍢'}</div>
          <div>
            <div class="bom-item-title">\${item.name}</div>
            <div class="bom-item-price">\${formatMoney(item.price)} / \${item.unit}</div>
          </div>
        </div>

        <div class="bom-ingredients-box">
          <div style="font-size:11px;font-weight:800;color:var(--text-muted);margin-bottom:4px;text-transform:uppercase">Định Lượng / 1 \${item.unit}:</div>
          \${bomListHtml}
        </div>
      </div>

      <button class="btn-edit-bom" data-id="\${item.id}">
        ⚙️ Chỉnh Sửa Định Lượng Món
      </button>
    \`;

    card.querySelector('.btn-edit-bom').onclick = () => openEditBomModal(item);
    grid.appendChild(card);
  });
}

// 1. Import Modal Helpers
function populateImportSelect() {
  const sel = document.getElementById('importIngredientSelect');
  sel.innerHTML = '';
  state.inventory.forEach(inv => {
    const opt = document.createElement('option');
    opt.value = inv.id;
    opt.textContent = \`\${inv.name} (Đơn vị: \${inv.unit} - Hiện còn: \${inv.stock.toLocaleString('vi-VN')} \${inv.unit})\`;
    sel.appendChild(opt);
  });
}

async function handleSaveImport() {
  const ingId = document.getElementById('importIngredientSelect').value;
  const qty = Number(document.getElementById('importQtyInput').value) || 0;
  const cost = Number(document.getElementById('importCostInput').value) || 0;
  const recordExp = document.getElementById('importRecordExpenseCheck').checked;

  if (qty <= 0) {
    alert('Vui lòng nhập số lượng hợp lệ!');
    return;
  }

  try {
    const res = await fetch('/api/inventory/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: ingId, quantity: qty, cost, recordExpense: recordExp })
    });
    if (res.ok) {
      document.getElementById('importInventoryModal').classList.remove('open');
      playSound('chime');
      await fetchInitialState();
      alert('Nhập kho thành công!');
    }
  } catch (err) {
    alert('Lỗi nhập kho: ' + err.message);
  }
}

// 2. Edit Stock Modal Helpers
state.editingStockIngId = null;
function openEditStockModal(inv) {
  state.editingStockIngId = inv.id;
  document.getElementById('editStockIngName').textContent = \`\${inv.name} (Đơn vị: \${inv.unit})\`;
  document.getElementById('editStockQtyInput').value = inv.stock;
  document.getElementById('editStockMinInput').value = inv.minStock || 0;
  document.getElementById('editStockModal').classList.add('open');
  playSound('tap');
}

async function handleSaveEditStock() {
  const id = state.editingStockIngId;
  const stock = Number(document.getElementById('editStockQtyInput').value) || 0;
  const minStock = Number(document.getElementById('editStockMinInput').value) || 0;

  try {
    const res = await fetch('/api/inventory/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, stock, minStock })
    });
    if (res.ok) {
      document.getElementById('editStockModal').classList.remove('open');
      playSound('chime');
      await fetchInitialState();
      alert('Đã cập nhật số lượng tồn kho!');
    }
  } catch (err) {
    alert('Lỗi cập nhật: ' + err.message);
  }
}

// 3. Add Ingredient Modal Helpers
async function handleSaveAddIngredient() {
  const name = document.getElementById('newIngName').value.trim();
  const unit = document.getElementById('newIngUnit').value;
  const stock = Number(document.getElementById('newIngStock').value) || 0;
  const minStock = Number(document.getElementById('newIngMinStock').value) || 0;

  if (!name) {
    alert('Vui lòng nhập tên nguyên liệu!');
    return;
  }

  try {
    const res = await fetch('/api/inventory/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, unit, stock, minStock })
    });
    if (res.ok) {
      document.getElementById('addIngredientModal').classList.remove('open');
      playSound('chime');
      await fetchInitialState();
      alert(\`Đã thêm nguyên liệu "\${name}" vào kho!\`);
    }
  } catch (err) {
    alert('Lỗi thêm nguyên liệu: ' + err.message);
  }
}

// 4. Edit BOM Modal Helpers
function openEditBomModal(item) {
  state.editingBomMenuId = item.id;
  document.getElementById('editBomMenuName').textContent = \`\${item.name} (\${formatMoney(item.price)} / \${item.unit})\`;

  const container = document.getElementById('bomIngredientsList');
  container.innerHTML = '';

  const currentBom = item.bom || {};
  const entries = Object.entries(currentBom);

  if (entries.length === 0) {
    appendBomRow('', 50);
  } else {
    entries.forEach(([ingId, qty]) => {
      appendBomRow(ingId, qty);
    });
  }

  document.getElementById('editBomModal').classList.add('open');
  playSound('tap');
}

function appendBomRow(selectedIngId, qty) {
  const container = document.getElementById('bomIngredientsList');
  const row = document.createElement('div');
  row.className = 'bom-edit-row';

  let optionsHtml = '';
  state.inventory.forEach(inv => {
    optionsHtml += \`<option value="\${inv.id}" \${inv.id === selectedIngId ? 'selected' : ''}>\${inv.name} (\${inv.unit})</option>\`;
  });

  row.innerHTML = \`
    <select class="form-control bom-sel-ing" style="flex:2;">
      \${optionsHtml}
    </select>
    <input type="number" class="form-control bom-input-qty" value="\${qty}" style="flex:1;text-align:right;" placeholder="SL tiêu hao">
    <button type="button" class="btn-del-bom-row" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:18px;">✕</button>
  \`;

  row.querySelector('.btn-del-bom-row').onclick = () => row.remove();
  container.appendChild(row);
}

async function handleSaveEditBom() {
  const menuId = state.editingBomMenuId;
  if (!menuId) return;

  const rows = document.querySelectorAll('.bom-edit-row');
  const newBom = {};

  rows.forEach(r => {
    const ingId = r.querySelector('.bom-sel-ing').value;
    const qty = Number(r.querySelector('.bom-input-qty').value) || 0;
    if (ingId && qty > 0) {
      newBom[ingId] = qty;
    }
  });

  try {
    const res = await fetch('/api/menu/update-bom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ menuId, bom: newBom })
    });
    if (res.ok) {
      document.getElementById('editBomModal').classList.remove('open');
      playSound('chime');
      await fetchInitialState();
      alert('Đã cập nhật công thức định lượng (BOM) của món ăn!');
    }
  } catch (err) {
    alert('Lỗi cập nhật BOM: ' + err.message);
  }
}
`;

appJs = appJs.replace(oldRenderInvRegex, newRenderInvCode);

// Add setupInventoryControls() to setupModals()
appJs = appJs.replace('setupSessionAndReportsHub();', 'setupSessionAndReportsHub();\n  setupInventoryControls();');

fs.writeFileSync(appJsPath, appJs, 'utf-8');
console.log('Updated public/app.js with full interactive Inventory & BOM management!');
