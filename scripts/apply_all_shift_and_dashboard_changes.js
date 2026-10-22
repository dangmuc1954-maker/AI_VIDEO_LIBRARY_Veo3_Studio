const fs = require('fs');
const path = require('path');

const targetDir = 'd:/dự án antigravity/Xieng_Nuong_Be_Huyen';
const publicDir = path.join(targetDir, 'public');

// Append HTML and CSS changes
const htmlPath = path.join(publicDir, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf-8');

// 1. Add session bar inside #view-tables
const sessionBarHtml = `
      <!-- SALES SESSION & DATE CONTROL BAR -->
      <div class="session-bar" id="sessionBar">
        <div class="session-bar-left">
          <div class="session-date-box">
            <span class="session-label">📅 Ngày bán:</span>
            <input type="text" id="sessionDateInput" class="session-date-display" value="27/09/2026" placeholder="DD/MM/YYYY">
          </div>
          <div class="session-status-pill active" id="sessionStatusPill">
            <span class="status-indicator"></span>
            <span id="sessionStatusLabel">🟢 ĐANG BÁN HÀNG</span>
            <span class="session-time-chip" id="sessionTimeChip">Mở ca lúc: 16:30</span>
          </div>
        </div>

        <div class="session-bar-right">
          <button class="btn-session start" id="btnStartSession" title="Mở ca bán mới cho ngày">
            ▶️ BẮT ĐẦU BÁN
          </button>
          <button class="btn-session end" id="btnEndSession" title="Kết thúc ca bán & lưu số liệu vào Báo Cáo">
            ⏹️ KẾT THÚC BÁN & CHỐT SỔ
          </button>
        </div>
      </div>
`;

// Insert sessionBarHtml right after <section id="view-tables" class="tab-view active">
html = html.replace('<section id="view-tables" class="tab-view active">', '<section id="view-tables" class="tab-view active">\n' + sessionBarHtml);

// 2. Replace the entire inner content of #view-reports with Hub View and Detail View
const oldReportsRegex = /<section id="view-reports" class="tab-view">[\s\S]*?<\/section>/;

const newReportsHtml = `<section id="view-reports" class="tab-view">
      <!-- 1. REPORTS HUB: GRID OF DAILY DASHBOARDS -->
      <div id="reportsHubView">
        <div class="report-header">
          <div>
            <h2 class="view-title">📊 Lịch Sử Dashboard Báo Cáo Từng Ngày</h2>
            <p class="view-desc">Nhấn vào bất kỳ Dashboard ngày nào bên dưới để xem chi tiết đầy đủ doanh thu, lợi nhuận, số lượng từng món và hóa đơn của ngày đó</p>
          </div>
          <div class="report-actions">
            <button class="btn-action primary" onclick="document.getElementById('tabBtnTables').click()">
              🏷️ Về Sơ Đồ Bàn Đang Bán
            </button>
          </div>
        </div>

        <!-- Grid of Daily Dashboards -->
        <div class="daily-dashboards-grid" id="dailyDashboardsGrid">
          <!-- Rendered dynamically by JavaScript -->
        </div>
      </div>

      <!-- 2. REPORT DETAIL VIEW: SHOWN WHEN CLICKING A DAY DASHBOARD -->
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

        <!-- Financial Metrics of this specific day -->
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
              <span class="metric-sub">Doanh thu - Chi phí</span>
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
            <h3 class="table-title">💸 Danh Sách Các Khoản Chi Tiêu Trong Ngày Này</h3>
            <span class="table-badge" id="detExpTotalBadge">Tổng chi: 8.100.000đ</span>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th width="90">Giờ</th>
                <th width="160">Khoản Mục</th>
                <th>Nội Dung Chi Tiết</th>
                <th width="180" class="text-right">Số Tiền</th>
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
    </section>`;

html = html.replace(oldReportsRegex, newReportsHtml);

// 3. Add Modal End Session (Chốt Sổ Ca Bán)
const endSessionModalHtml = `
  <!-- MODAL: KẾT THÚC BÁN & CHỐT SỔ -->
  <div class="modal-overlay" id="endSessionModal">
    <div class="modal-card small-card">
      <div class="modal-header">
        <h3 class="modal-title">⏹️ Kết Thúc Bán & Chốt Sổ Ca Ngày</h3>
        <button class="btn-close-modal" id="btnCloseEndSessionModal">&times;</button>
      </div>
      <div class="modal-body">
        <p style="font-size:14px;color:var(--text-muted);margin-bottom:14px;">
          Khi kết thúc ca bán, toàn bộ doanh thu, các khoản chi và số lượng món bán hôm nay sẽ được chốt và lưu vĩnh viễn vào <strong>Dashboard Báo Cáo Ngày</strong>.
        </p>
        <div class="session-summary-box">
          <div class="sum-row">
            <span>📅 Ngày chốt:</span>
            <strong id="modalEndSessionDate">27/09/2026</strong>
          </div>
          <div class="sum-row">
            <span>⏰ Khung giờ bán:</span>
            <strong id="modalEndSessionTime">16:30 - Hiện tại</strong>
          </div>
          <div class="sum-row">
            <span>💵 Doanh thu ca:</span>
            <strong style="color:var(--gold-dark)" id="modalEndSessionRev">0đ</strong>
          </div>
          <div class="sum-row">
            <span>💸 Chi phí ca:</span>
            <strong style="color:#ef4444" id="modalEndSessionExp">0đ</strong>
          </div>
          <div class="sum-row highlight">
            <span>🌟 Tiền còn lại (Lợi nhuận):</span>
            <strong style="color:var(--color-free);font-size:18px;" id="modalEndSessionProfit">0đ</strong>
          </div>
        </div>

        <div class="form-group" style="margin-top:14px;">
          <label>Ghi chú ca bán (Tùy chọn):</label>
          <input type="text" id="endSessionNoteInput" class="form-control" placeholder="Ví dụ: Khách đông, thịt xiên cháy hàng...">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-action secondary" id="btnCancelEndSession">Hủy</button>
        <button class="btn-action primary" id="btnConfirmEndSession">
          ✅ Xác Nhận Chốt Sổ & Lưu Báo Cáo
        </button>
      </div>
    </div>
  </div>
`;

html = html.replace('</body>', endSessionModalHtml + '\n</body>');
fs.writeFileSync(htmlPath, html, 'utf-8');
console.log('Updated public/index.html with Session Bar and Daily Dashboard Hub!');
