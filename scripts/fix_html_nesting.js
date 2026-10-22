const fs = require('fs');
const path = require('path');

const targetDir = 'd:/dự án antigravity/Xieng_Nuong_Be_Huyen';
const htmlPath = path.join(targetDir, 'public', 'index.html');

// Read current index.html
let html = fs.readFileSync(htmlPath, 'utf-8');

// Remove wrongly placed monthlyHubView and monthlyDetailView from wherever they are
html = html.replace(/<!-- =+\s*-->\s*<!-- 3\. MONTHLY REPORTS HUB[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, '');
html = html.replace(/<div id="monthlyHubView"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, '');

// Let's inspect where monthlyHubView currently is and remove it cleanly
const mHubIdx = html.indexOf('<div id="monthlyHubView"');
if (mHubIdx !== -1) {
  const mDetEnd = html.indexOf('</div>\n      </div>', mHubIdx);
  // Remove that whole block
  const fullBlockEnd = html.indexOf('</div>\n      </div>', mDetEnd + 10);
  if (fullBlockEnd !== -1) {
    html = html.slice(0, mHubIdx) + html.slice(fullBlockEnd + 19);
  }
}

// Clean check
console.log('Cleaned misplaced monthly blocks. Now building clean #view-reports section...');

// The complete, beautiful, robust #view-reports section
const cleanViewReportsSection = `<section id="view-reports" class="tab-view">
      <!-- 1. MODE SWITCHER BAR: THEO NGÀY VS THEO THÁNG -->
      <div class="report-mode-bar" style="margin-bottom: 22px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; background: #FFFFFF; padding: 10px 18px; border-radius: var(--radius-lg); border: 1.5px solid var(--gold-border); box-shadow: var(--shadow-card);">
        <div class="filter-group" style="background: var(--bg-subtle); padding: 4px; border-radius: var(--radius-md);">
          <button class="filter-pill active" id="btnReportModeDay" style="font-size:14px; padding:8px 20px;">
            📅 Báo Cáo Theo Ngày (Daily)
          </button>
          <button class="filter-pill" id="btnReportModeMonth" style="font-size:14px; padding:8px 20px;">
            📆 Báo Cáo Theo Tháng (Monthly)
          </button>
        </div>
        <div style="font-size:13px; color:var(--gold-dark); font-weight:700;">
          📊 Dashboard Thống Kê & Chi Tiết Doanh Thu, Chi Phí, Lợi Nhuận
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- A. BÁO CÁO THEO NGÀY: HUB (LƯỚI NGÀY) & CHI TIẾT NGÀY    -->
      <!-- ======================================================== -->
      <!-- A1. Hub Ngày -->
      <div id="reportsHubView">
        <div class="report-header">
          <div>
            <h2 class="view-title">📅 Lịch Sử Dashboard Báo Cáo Từng Ngày</h2>
            <p class="view-desc">Nhấn vào bất kỳ Dashboard ngày nào bên dưới để xem chi tiết đầy đủ doanh thu, lợi nhuận, số lượng từng món và hóa đơn của ngày đó</p>
          </div>
          <div class="report-actions">
            <button class="btn-action primary" onclick="document.getElementById('tabBtnTables').click()">
              🏷️ Về Sơ Đồ Bàn Đang Bán
            </button>
          </div>
        </div>

        <div class="daily-dashboards-grid" id="dailyDashboardsGrid">
          <!-- Rendered dynamically by JavaScript -->
        </div>
      </div>

      <!-- A2. Chi Tiết Ngày Được Chọn -->
      <div id="reportDetailView" style="display: none;">
        <div class="detail-header-bar">
          <button class="btn-action back-btn" id="btnBackToDashboardHub">
            ⬅️ Quay Lại Danh Sách Ngày
          </button>
          <div class="detail-title-group">
            <h2 class="view-title" id="detailRepDateTitle">📊 BÁO CÁO CHI TIẾT NGÀY: 26/09/2026</h2>
            <p class="view-desc" id="detailRepSub">Thứ Bảy &bull; Ca bán: 16:00 - 23:45 (7 giờ 45 phút) &bull; 87 lượt bàn</p>
          </div>
          <div class="report-actions">
            <button class="btn-action" onclick="window.print()">🖨️ In Báo Cáo Ngày Này</button>
          </div>
        </div>

        <!-- Metrics of this specific day -->
        <div class="metrics-grid">
          <div class="metric-card rev-card">
            <div class="metric-icon">💵</div>
            <div class="metric-body">
              <span class="metric-title">TỔNG DOANH THU NGÀY NÀY</span>
              <span class="metric-num" id="detRepTotalRev">24.865.000đ</span>
              <span class="metric-sub" id="detRepDateRevSub">Đã chốt sổ</span>
            </div>
          </div>
          <div class="metric-card turns-card">
            <div class="metric-icon">👥</div>
            <div class="metric-body">
              <span class="metric-title">SỐ BÀN PHỤC VỤ</span>
              <span class="metric-num" id="detRepTotalTurns">87 lượt</span>
              <span class="metric-sub">Lượt khách tại quán</span>
            </div>
          </div>
          <div class="metric-card items-card">
            <div class="metric-icon">🍢</div>
            <div class="metric-body">
              <span class="metric-title">TỔNG MÓN ĐÃ BÁN</span>
              <span class="metric-num" id="detRepTotalItems">3.842 sản phẩm</span>
              <span class="metric-sub">Xiên, ốc, đồ ăn vặt</span>
            </div>
          </div>
          <div class="metric-card profit-card">
            <div class="metric-icon">🌟</div>
            <div class="metric-body">
              <span class="metric-title">LỢI NHUẬN THỰC (CÒN LẠI)</span>
              <span class="metric-num highlight-profit" id="detRepNetProfit">16.765.000đ</span>
              <span class="metric-sub" id="detRepProfitSub">Doanh thu - Chi phí</span>
            </div>
          </div>
        </div>

        <div class="payment-split-bar">
          <div class="split-item cash">
            <span class="split-icon">💵</span> Tiền mặt: <strong id="detRepCash">18.265.000đ</strong>
          </div>
          <div class="split-item transfer">
            <span class="split-icon">📱</span> Chuyển khoản (VietQR): <strong id="detRepTransfer">6.600.000đ</strong>
          </div>
          <div class="split-item expense">
            <span class="split-icon">💸</span> Tổng chi tiêu ngày này: <strong id="detRepExpense">8.100.000đ</strong>
          </div>
        </div>

        <!-- Table 1: Items sold on that day -->
        <div class="table-container" style="margin-bottom: 24px;">
          <div class="table-title-bar">
            <h3 class="table-title">🔥 Bảng Thống Kê Số Lượng Từng Món Bán Trong Ngày Này</h3>
            <span class="table-badge">Tự động xếp hạng bán chạy nhất</span>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th width="80">Hạng</th>
                <th>Tên Món Ăn</th>
                <th width="140">Đơn Vị</th>
                <th width="160" class="text-right">Số Lượng Bán</th>
                <th width="160" class="text-right">Đơn Giá</th>
                <th width="200" class="text-right">Tổng Thành Tiền</th>
              </tr>
            </thead>
            <tbody id="detItemsSoldTbody">
              <!-- Rendered by JS -->
            </tbody>
          </table>
        </div>

        <!-- Table 2: Expenses on that day -->
        <div class="table-container" style="margin-bottom: 24px;">
          <div class="table-title-bar">
            <div style="display:flex;align-items:center;gap:12px;">
              <h3 class="table-title">💸 Thu - Chi & Khoản Chi Tiêu Của Ngày Này</h3>
              <span class="table-badge" id="detExpTotalBadge">Tổng chi: 8.100.000đ</span>
            </div>
            <button class="btn-action primary" id="btnOpenAddExpenseFromReport" style="padding:6px 14px;font-size:12px;font-weight:800;">
              + Thêm Khoản Chi Cho Ngày Này
            </button>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th width="90">Giờ</th>
                <th width="160">Khoản Mục</th>
                <th>Nội Dung Chi Tiết</th>
                <th width="180" class="text-right">Số Tiền</th>
                <th width="90" class="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody id="detExpensesTbody">
              <!-- Rendered by JS -->
            </tbody>
          </table>
        </div>

        <!-- Table 3: Orders on that day -->
        <div class="table-container" id="detOrdersContainer">
          <div class="table-title-bar">
            <h3 class="table-title">🧾 Danh Sách Các Hóa Đơn / Bàn Đã Thanh Toán</h3>
            <span class="table-badge" id="detOrdersCountBadge">Hóa đơn</span>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th width="90">Giờ</th>
                <th width="150">Tên Bàn</th>
                <th>Hình Thức</th>
                <th width="140">Số Món</th>
                <th width="180" class="text-right">Tổng Tiền Bill</th>
              </tr>
            </thead>
            <tbody id="detOrdersTbody">
              <!-- Rendered by JS -->
            </tbody>
          </table>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- B. BÁO CÁO THEO THÁNG: HUB (LƯỚI THÁNG) & CHI TIẾT THÁNG  -->
      <!-- ======================================================== -->
      <!-- B1. Hub Tháng -->
      <div id="monthlyHubView" style="display: none;">
        <div class="report-header">
          <div>
            <h2 class="view-title">📆 Lịch Sử Dashboard Báo Cáo Từng Tháng</h2>
            <p class="view-desc">Nhấn vào bất kỳ Dashboard Tháng nào bên dưới để xem tổng chi tiết doanh thu, chi phí, lợi nhuận và tổng số lượng từng món bán trong tháng đó</p>
          </div>
        </div>

        <div class="daily-dashboards-grid" id="monthlyDashboardsGrid">
          <!-- Rendered dynamically by JavaScript -->
        </div>
      </div>

      <!-- B2. Chi Tiết Tháng Được Chọn (Chi tiết tổng tất cả các ngày trong tháng) -->
      <div id="monthlyDetailView" style="display: none;">
        <div class="detail-header-bar">
          <button class="btn-action back-btn" id="btnBackToMonthlyHub">
            ⬅️ Quay Lại Danh Sách Tháng
          </button>
          <div class="detail-title-group">
            <h2 class="view-title" id="monRepTitle">📊 BÁO CÁO TỔNG HỢP CHI TIẾT: THÁNG 09/2026</h2>
            <p class="view-desc" id="monRepSub">Tháng 09/2026 &bull; 26 ngày bán hàng &bull; 2.280 lượt bàn phục vụ</p>
          </div>
          <div class="report-actions">
            <button class="btn-action" onclick="window.print()">🖨️ In Báo Cáo Tháng</button>
          </div>
        </div>

        <!-- Metrics of Selected Month -->
        <div class="metrics-grid">
          <div class="metric-card rev-card">
            <div class="metric-icon">💵</div>
            <div class="metric-body">
              <span class="metric-title">TỔNG DOANH THU THÁNG</span>
              <span class="metric-num" id="monRepTotalRev">645.800.000đ</span>
              <span class="metric-sub" id="monRepRevSub">Toàn bộ các ngày trong tháng</span>
            </div>
          </div>
          <div class="metric-card turns-card">
            <div class="metric-icon">👥</div>
            <div class="metric-body">
              <span class="metric-title">SỐ BÀN PHỤC VỤ TRONG THÁNG</span>
              <span class="metric-num" id="monRepTotalTurns">2.280 lượt</span>
              <span class="metric-sub">Lượt khách ghé quán</span>
            </div>
          </div>
          <div class="metric-card items-card">
            <div class="metric-icon">🍢</div>
            <div class="metric-body">
              <span class="metric-title">TỔNG MÓN ĐÃ BÁN TRONG THÁNG</span>
              <span class="metric-num" id="monRepTotalItems">94.200 sản phẩm</span>
              <span class="metric-sub">Xiên, ốc, đồ ăn vặt</span>
            </div>
          </div>
          <div class="metric-card profit-card">
            <div class="metric-icon">🌟</div>
            <div class="metric-body">
              <span class="metric-title">LỢI NHUẬN THỰC THÁNG (CÒN LẠI)</span>
              <span class="metric-num highlight-profit" id="monRepNetProfit">435.300.000đ</span>
              <span class="metric-sub">Doanh thu - Chi phí tháng</span>
            </div>
          </div>
        </div>

        <div class="payment-split-bar">
          <div class="split-item cash">
            <span class="split-icon">💵</span> Tiền mặt trong tháng: <strong id="monRepCash">465.000.000đ</strong>
          </div>
          <div class="split-item transfer">
            <span class="split-icon">📱</span> Chuyển khoản (VietQR): <strong id="monRepTransfer">180.800.000đ</strong>
          </div>
          <div class="split-item expense">
            <span class="split-icon">💸</span> Tổng chi phí cả tháng: <strong id="monRepExpense">210.500.000đ</strong>
          </div>
        </div>

        <!-- Table 1: Items sold throughout the month -->
        <div class="table-container" style="margin-bottom: 24px;">
          <div class="table-title-bar">
            <h3 class="table-title">🔥 Bảng Thống Kê Tổng Số Lượng Từng Món Bán Trong Cả Tháng</h3>
            <span class="table-badge">Xếp hạng bán chạy nhất tháng</span>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th width="80">Hạng</th>
                <th>Tên Món Ăn</th>
                <th width="140">Đơn Vị</th>
                <th width="160" class="text-right">Tổng SL Bán Trong Tháng</th>
                <th width="160" class="text-right">Đơn Giá</th>
                <th width="200" class="text-right">Tổng Doanh Thu Món</th>
              </tr>
            </thead>
            <tbody id="monItemsSoldTbody">
              <!-- Rendered by JS -->
            </tbody>
          </table>
        </div>

        <!-- Table 2: Daily Breakdown table of that month -->
        <div class="table-container" style="margin-bottom: 24px;">
          <div class="table-title-bar">
            <h3 class="table-title">📅 Chi Tiết Từng Ngày Bán Hàng Trong Tháng Này</h3>
            <span class="table-badge" id="monDaysCountBadge">26 ngày bán</span>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th width="130">Ngày Bán</th>
                <th width="140">Khung Giờ</th>
                <th width="130" class="text-center">Số Lượt Bàn</th>
                <th width="180" class="text-right">Doanh Thu Ngày</th>
                <th width="180" class="text-right">Chi Phí Ngày</th>
                <th width="200" class="text-right">Lợi Nhuận Thực</th>
                <th width="110" class="text-center">Chi Tiết</th>
              </tr>
            </thead>
            <tbody id="monDaysListTbody">
              <!-- Rendered by JS -->
            </tbody>
          </table>
        </div>

        <!-- Table 3: Monthly Expenses Breakdown -->
        <div class="table-container">
          <div class="table-title-bar">
            <h3 class="table-title">💸 Cơ Cấu Chi Phí Trong Tháng</h3>
            <span class="table-badge" id="monExpenseTotalBadge">Tổng chi: 210.500.000đ</span>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Khoản Mục Chi Phí</th>
                <th width="200" class="text-right">Tổng Tiền Đã Chi</th>
                <th width="200" class="text-right">Tỉ Trọng Chi Phí</th>
              </tr>
            </thead>
            <tbody id="monExpenseCategoriesTbody">
              <!-- Rendered by JS -->
            </tbody>
          </table>
        </div>
      </div>
    </section>`;

// Replace old view-reports section entirely with the clean, perfectly nested section
const viewReportsStart = html.indexOf('<section id="view-reports" class="tab-view">');
const viewReportsEnd = html.indexOf('</section>', viewReportsStart);

if (viewReportsStart !== -1 && viewReportsEnd !== -1) {
  html = html.slice(0, viewReportsStart) + cleanViewReportsSection + html.slice(viewReportsEnd + 10);
}

fs.writeFileSync(htmlPath, html, 'utf-8');
console.log('Fixed index.html structure completely: #view-reports now properly contains both Day and Month modes!');
