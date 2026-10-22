const fs = require('fs');
const path = require('path');

const targetDir = 'd:/dự án antigravity/Xieng_Nuong_Be_Huyen';
const publicDir = path.join(targetDir, 'public');
const htmlPath = path.join(publicDir, 'index.html');
const cssPath = path.join(publicDir, 'style.css');
const appJsPath = path.join(publicDir, 'app.js');

// ========================================================
// 1. UPDATE public/index.html WITH MONTHLY DASHBOARDS
// ========================================================
let html = fs.readFileSync(htmlPath, 'utf-8');

// Insert mode switcher tabs at the beginning of #view-reports
const modeSwitcherHtml = `
      <!-- SUB-TABS: BÁO CÁO THEO NGÀY VS THEO THÁNG -->
      <div class="report-mode-bar" style="margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
        <div class="filter-group">
          <button class="filter-pill active" id="btnReportModeDay">
            📅 Báo Cáo Theo Ngày (Daily)
          </button>
          <button class="filter-pill" id="btnReportModeMonth">
            📆 Báo Cáo Theo Tháng (Monthly)
          </button>
        </div>
        <div style="font-size:13px; color:var(--text-muted); font-weight:600;">
          💡 Xem tổng hợp đa chiều doanh thu & số lượng món bán
        </div>
      </div>
`;

// Insert right under <section id="view-reports" class="tab-view">
html = html.replace('<section id="view-reports" class="tab-view">', '<section id="view-reports" class="tab-view">\n' + modeSwitcherHtml);

// Add Monthly Hub View and Monthly Detail View inside #view-reports right before </section>
const monthlyViewsHtml = `
      <!-- ============================================== -->
      <!-- 3. MONTHLY REPORTS HUB: GRID OF MONTH CARDS   -->
      <!-- ============================================== -->
      <div id="monthlyHubView" style="display: none;">
        <div class="report-header">
          <div>
            <h2 class="view-title">📆 Lịch Sử Dashboard Báo Cáo Từng Tháng</h2>
            <p class="view-desc">Nhấn vào bất kỳ Dashboard Tháng nào bên dưới để xem tổng chi tiết doanh thu, chi phí, lợi nhuận và tổng số lượng từng món bán trong tháng đó</p>
          </div>
        </div>

        <!-- Grid of Monthly Dashboards -->
        <div class="daily-dashboards-grid" id="monthlyDashboardsGrid">
          <!-- Rendered dynamically by JavaScript -->
        </div>
      </div>

      <!-- ============================================== -->
      <!-- 4. MONTHLY REPORT DETAIL VIEW                  -->
      <!-- ============================================== -->
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

        <!-- Financial Metrics of Selected Month -->
        <div class="metrics-grid">
          <div class="metric-card rev-card">
            <div class="metric-icon">💵</div>
            <div class="metric-body">
              <span class="metric-title">TỔNG DOANH THU THÁNG</span>
              <span class="metric-num" id="monRepTotalRev">645.800.000đ</span>
              <span class="metric-sub" id="monRepRevSub">Toàn bộ tháng</span>
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
`;

// Insert monthlyViewsHtml right before </section>
html = html.replace('</section>', monthlyViewsHtml + '\n</section>');
fs.writeFileSync(htmlPath, html, 'utf-8');
console.log('Updated public/index.html with Monthly Report views!');

// ========================================================
// 2. UPDATE public/style.css
// ========================================================
let css = fs.readFileSync(cssPath, 'utf-8');
const monthlyCss = `
/* Monthly Dashboard Specific Styling */
.monthly-card {
  border-left: 4px solid var(--gold-primary);
}

.monthly-card:hover {
  border-left-color: var(--color-free);
}
`;
css += monthlyCss;
fs.writeFileSync(cssPath, css, 'utf-8');
console.log('Updated public/style.css!');
