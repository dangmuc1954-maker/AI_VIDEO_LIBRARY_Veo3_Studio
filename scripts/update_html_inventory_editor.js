const fs = require('fs');
const path = require('path');

const targetDir = 'd:/dự án antigravity/Xieng_Nuong_Be_Huyen';
const publicDir = path.join(targetDir, 'public');
const htmlPath = path.join(publicDir, 'index.html');

let html = fs.readFileSync(htmlPath, 'utf-8');

// Replace view-inventory section with complete interactive inventory and BOM manager
const oldInventorySectionRegex = /<section id="view-inventory" class="tab-view">[\s\S]*?<\/section>/;

const newInventorySectionHtml = `<section id="view-inventory" class="tab-view">
      <div class="view-header">
        <div>
          <h2 class="view-title">📦 Quản Lý Tồn Kho & Công Thức Định Lượng (BOM)</h2>
          <p class="view-desc">Nhập thêm kho, điều chỉnh số lượng tồn thực tế và cài đặt công thức tiêu hao cho từng món ăn</p>
        </div>

        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button class="btn-action primary" id="btnOpenImportModal">
            📥 + Nhập Kho Hàng
          </button>
          <button class="btn-action" id="btnOpenAddIngredientModal">
            ➕ Thêm Nguyên Liệu Mới
          </button>
        </div>
      </div>

      <!-- Inventory Sub Tabs: Stock vs BOM Recipes -->
      <div class="filter-group" style="margin-bottom: 20px;">
        <button class="filter-pill active" id="invSubTabStock">
          📦 Bảng Tồn Kho & Tiêu Hao
        </button>
        <button class="filter-pill" id="invSubTabBom">
          🥣 Công Thức Định Lượng (BOM) Các Món
        </button>
      </div>

      <!-- 1. Stock & Consumption Table -->
      <div class="table-container" id="invStockContainer">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nguyên Liệu</th>
              <th width="120">Đơn Vị</th>
              <th width="180" class="text-right">Đã Tiêu Thụ Hôm Nay</th>
              <th width="180" class="text-right">Tồn Kho Hiện Tại</th>
              <th width="160" class="text-center">Trạng Thái</th>
              <th width="140" class="text-center">Thao Tác</th>
            </tr>
          </thead>
          <tbody id="inventoryTbody">
            <!-- Rendered by JS -->
          </tbody>
        </table>
      </div>

      <!-- 2. BOM Recipes Grid (Hidden by default) -->
      <div id="invBomContainer" style="display: none;">
        <div class="bom-recipes-grid" id="bomRecipesGrid">
          <!-- Rendered by JS -->
        </div>
      </div>
    </section>`;

html = html.replace(oldInventorySectionRegex, newInventorySectionHtml);

// Add Inventory Modals before </body>
const inventoryModalsHtml = `
  <!-- MODAL: NHẬP KHO HÀNG -->
  <div class="modal-overlay" id="importInventoryModal">
    <div class="modal-card small-card">
      <div class="modal-header">
        <h3 class="modal-title">📥 Nhập Hàng Vào Kho</h3>
        <button class="btn-close-modal" id="btnCloseImportModal">&times;</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Chọn nguyên liệu nhập:</label>
          <select id="importIngredientSelect" class="form-control">
            <!-- Rendered by JS -->
          </select>
        </div>
        <div class="form-group">
          <label id="importQtyLabel">Số lượng nhập thêm:</label>
          <input type="number" id="importQtyInput" class="form-control input-money" placeholder="Ví dụ: 20000 (cho 20kg)">
        </div>
        <div class="form-group">
          <label>Tiền mua hàng (VNĐ - Tùy chọn):</label>
          <input type="number" id="importCostInput" class="form-control input-money" placeholder="Ví dụ: 2200000">
        </div>
        <div style="display:flex;align-items:center;gap:8px;margin-top:6px;">
          <input type="checkbox" id="importRecordExpenseCheck" checked style="width:18px;height:18px;cursor:pointer;">
          <label for="importRecordExpenseCheck" style="font-size:13px;cursor:pointer;font-weight:700;">
            Tự động ghi thành 1 khoản Chi Phí trong Báo Cáo hôm nay
          </label>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-action secondary" id="btnCancelImport">Hủy</button>
        <button class="btn-action primary" id="btnSaveImport">📥 Lưu Nhập Kho</button>
      </div>
    </div>
  </div>

  <!-- MODAL: SỬA TỒN KHO THỰC TẾ -->
  <div class="modal-overlay" id="editStockModal">
    <div class="modal-card small-card">
      <div class="modal-header">
        <h3 class="modal-title">✏️ Chỉnh Sửa Tồn Kho Thực Tế</h3>
        <button class="btn-close-modal" id="btnCloseEditStockModal">&times;</button>
      </div>
      <div class="modal-body">
        <p style="font-size:13px;color:var(--text-muted);margin-bottom:12px;">
          Nguyên liệu: <strong id="editStockIngName" style="color:var(--text-main)">Thịt heo</strong>
        </p>
        <div class="form-group">
          <label id="editStockQtyLabel">Số lượng tồn kho thực tế:</label>
          <input type="number" id="editStockQtyInput" class="form-control input-money">
        </div>
        <div class="form-group">
          <label id="editStockMinLabel">Mức tồn kho tối thiểu (Cảnh báo khi thấp hơn):</label>
          <input type="number" id="editStockMinInput" class="form-control input-money">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-action secondary" id="btnCancelEditStock">Hủy</button>
        <button class="btn-action primary" id="btnSaveEditStock">💾 Lưu Thay Đổi</button>
      </div>
    </div>
  </div>

  <!-- MODAL: THÊM NGUYÊN LIỆU MỚI -->
  <div class="modal-overlay" id="addIngredientModal">
    <div class="modal-card small-card">
      <div class="modal-header">
        <h3 class="modal-title">➕ Thêm Nguyên Liệu Mới Vào Kho</h3>
        <button class="btn-close-modal" id="btnCloseAddIngModal">&times;</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Tên nguyên liệu:</label>
          <input type="text" id="newIngName" class="form-control" placeholder="Ví dụ: Mực trứng tươi, Tôm sú...">
        </div>
        <div class="form-group">
          <label>Đơn vị tính:</label>
          <select id="newIngUnit" class="form-control">
            <option value="g">Gam (g) - Thịt, ốc, rau...</option>
            <option value="kg">Kilôgam (kg)</option>
            <option value="cái">Cái</option>
            <option value="que">Que tre</option>
            <option value="con">Con (cút, mực...)</option>
            <option value="cặp">Cặp (chân gà...)</option>
            <option value="lon">Lon</option>
            <option value="ly">Ly</option>
          </select>
        </div>
        <div class="form-group">
          <label>Số lượng tồn ban đầu:</label>
          <input type="number" id="newIngStock" class="form-control input-money" placeholder="Ví dụ: 10000">
        </div>
        <div class="form-group">
          <label>Mức tồn kho tối thiểu (Cảnh báo):</label>
          <input type="number" id="newIngMinStock" class="form-control input-money" placeholder="Ví dụ: 2000">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-action secondary" id="btnCancelAddIng">Hủy</button>
        <button class="btn-action primary" id="btnSaveAddIng">💾 Thêm Vào Kho</button>
      </div>
    </div>
  </div>

  <!-- MODAL: SỬA ĐỊNH LƯỢNG MÓN (BOM) -->
  <div class="modal-overlay" id="editBomModal">
    <div class="modal-card" style="max-width: 600px;">
      <div class="modal-header">
        <h3 class="modal-title">🥣 Cài Đặt Công Thức Định Lượng (BOM)</h3>
        <button class="btn-close-modal" id="btnCloseEditBomModal">&times;</button>
      </div>
      <div class="modal-body">
        <p style="font-size:14px;color:var(--text-muted);margin-bottom:14px;">
          Món ăn: <strong id="editBomMenuName" style="color:var(--gold-dark);font-size:16px;">Xiên nướng</strong>
        </p>

        <div id="bomIngredientsList" style="display:flex;flex-direction:column;gap:10px;margin-bottom:14px;">
          <!-- Dynamically generated rows of ingredient + quantity -->
        </div>

        <button class="btn-action" id="btnAddBomRow" style="padding:6px 12px;font-size:12px;">
          + Thêm Nguyên Liệu Cho Món Này
        </button>
      </div>
      <div class="modal-footer">
        <button class="btn-action secondary" id="btnCancelEditBom">Hủy</button>
        <button class="btn-action primary" id="btnSaveEditBom">💾 Lưu Công Thức BOM</button>
      </div>
    </div>
  </div>
`;

html = html.replace('</body>', inventoryModalsHtml + '\n</body>');
fs.writeFileSync(htmlPath, html, 'utf-8');
console.log('Updated index.html with interactive Inventory and BOM Modals!');
