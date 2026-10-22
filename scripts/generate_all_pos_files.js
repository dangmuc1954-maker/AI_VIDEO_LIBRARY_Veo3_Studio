const fs = require('fs');
const path = require('path');

const targetDir = 'd:/dự án antigravity/Xieng_Nuong_Be_Huyen';
const publicDir = path.join(targetDir, 'public');

// ==========================================
// 2. WRITE public/index.html
// ==========================================
const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Xiêng Nướng Bé Huyền - Hệ Thống POS 20 Bàn</title>
  <meta name="description" content="Phần mềm quản lý bán hàng 20 bàn, Order siêu tốc, Thu chi, Kho nguyên liệu BOM và AI Trợ lý dành cho Quán Xiêng Nướng Bé Huyền.">
  <meta name="theme-color" content="#121316">
  
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  
  <link rel="stylesheet" href="style.css">
  <link rel="manifest" href="manifest.json">
</head>
<body>
  <!-- Top Navigation Header -->
  <header class="app-header">
    <div class="header-left">
      <div class="brand-logo">
        <span class="brand-icon">🔥</span>
        <div class="brand-info">
          <h1 class="brand-title">XIÊNG NƯỚNG BÉ HUYỀN</h1>
          <p class="brand-sub">Hệ Thống POS 20 Bàn &bull; Order Siêu Tốc</p>
        </div>
      </div>
      <div class="realtime-status">
        <span class="status-dot"></span>
        <span class="status-text" id="syncStatus">Đồng bộ Realtime</span>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <nav class="nav-tabs">
      <button class="nav-tab active" data-tab="tables" id="tabBtnTables">
        <span class="tab-icon">🏷️</span> Sơ Đồ 20 Bàn
        <span class="tab-badge" id="activeTablesCount">3</span>
      </button>
      <button class="nav-tab" data-tab="reports" id="tabBtnReports">
        <span class="tab-icon">📊</span> Báo Cáo & Tổng Món
      </button>
      <button class="nav-tab" data-tab="expenses" id="tabBtnExpenses">
        <span class="tab-icon">💰</span> Thu - Chi & Lợi Nhuận
      </button>
      <button class="nav-tab" data-tab="inventory" id="tabBtnInventory">
        <span class="tab-icon">📦</span> Kho & Định Lượng BOM
      </button>
      <button class="nav-tab ai-tab" data-tab="ai" id="tabBtnAi">
        <span class="tab-icon">🤖</span> Bé Huyền AI Copilot
      </button>
    </nav>

    <!-- Top Action Controls -->
    <div class="header-right">
      <div class="role-selector">
        <span class="role-label">Chế độ:</span>
        <select id="roleSelect" class="role-dropdown">
          <option value="owner">👑 Chủ Quán (Full Quyền)</option>
          <option value="staff">👤 Nhân Viên (Bán Hàng)</option>
        </select>
      </div>
      
      <button id="btnWifiQr" class="btn-tool" title="Quét QR mở trên Điện Thoại">
        📱 Kết Nối Điện Thoại
      </button>
      <button id="btnSeedDemo" class="btn-tool btn-seed" title="Nạp Số Liệu Mẫu Của Tris">
        ✨ Số Liệu Mẫu
      </button>
    </div>
  </header>

  <!-- Main Content Container -->
  <main class="app-main">
    
    <!-- ============================================== -->
    <!-- VIEW 1: SƠ ĐỒ 20 BÀN                           -->
    <!-- ============================================== -->
    <section id="view-tables" class="tab-view active">
      <div class="view-header">
        <div class="filter-group">
          <button class="filter-pill active" data-filter="all">Tất cả (20 bàn)</button>
          <button class="filter-pill" data-filter="serving">🔴 Đang có khách (<span id="countServing">3</span>)</button>
          <button class="filter-pill" data-filter="empty">🟢 Bàn trống (<span id="countEmpty">17</span>)</button>
        </div>

        <div class="summary-chips">
          <div class="chip">
            <span class="chip-label">Đang phục vụ:</span>
            <strong class="chip-val" id="chipServingCount">3/20 bàn</strong>
          </div>
          <div class="chip highlight">
            <span class="chip-label">Tạm tính tại bàn:</span>
            <strong class="chip-val" id="chipServingTotal">952.000đ</strong>
          </div>
        </div>
      </div>

      <!-- 20 Tables Grid Layout -->
      <div class="tables-grid" id="tablesGrid">
        <!-- Rendered dynamically by JavaScript (Tables 01 to 20) -->
      </div>
    </section>

    <!-- ============================================== -->
    <!-- VIEW 2: BÁO CÁO CUỐI NGÀY & TỔNG MÓN           -->
    <!-- ============================================== -->
    <section id="view-reports" class="tab-view">
      <div class="report-header">
        <div>
          <h2 class="view-title">📊 Báo Cáo Doanh Thu & Thống Kê Món Bán</h2>
          <p class="view-desc" id="reportDateSubtitle">Tự động tổng hợp số lượng món - Không cần đếm tay</p>
        </div>
        <div class="report-actions">
          <button class="btn-action" onclick="window.print()">🖨️ In Báo Cáo</button>
        </div>
      </div>

      <!-- Financial Metrics Cards -->
      <div class="metrics-grid">
        <div class="metric-card rev-card">
          <div class="metric-icon">💵</div>
          <div class="metric-body">
            <span class="metric-title">TỔNG DOANH THU</span>
            <span class="metric-num" id="repTotalRev">24.865.000đ</span>
            <span class="metric-sub">Hôm nay</span>
          </div>
        </div>

        <div class="metric-card turns-card">
          <div class="metric-icon">👥</div>
          <div class="metric-body">
            <span class="metric-title">SỐ BÀN PHỤC VỤ</span>
            <span class="metric-num" id="repTotalTurns">87 lượt</span>
            <span class="metric-sub">Khách ghé quán</span>
          </div>
        </div>

        <div class="metric-card items-card">
          <div class="metric-icon">🍢</div>
          <div class="metric-body">
            <span class="metric-title">TỔNG MÓN ĐÃ BÁN</span>
            <span class="metric-num" id="repTotalItems">3.842 sản phẩm</span>
            <span class="metric-sub">Xiên, ốc, đồ ăn vặt</span>
          </div>
        </div>

        <div class="metric-card profit-card">
          <div class="metric-icon">🌟</div>
          <div class="metric-body">
            <span class="metric-title">LỢI NHUẬN CÒN LẠI</span>
            <span class="metric-num highlight-profit" id="repNetProfit">16.765.000đ</span>
            <span class="metric-sub">Sau khi trừ chi phí 8.100.000đ</span>
          </div>
        </div>
      </div>

      <div class="payment-split-bar">
        <div class="split-item cash">
          <span class="split-icon">💵</span> Tiền mặt: <strong id="repCash">18.265.000đ</strong>
        </div>
        <div class="split-item transfer">
          <span class="split-icon">📱</span> Chuyển khoản (VietQR): <strong id="repTransfer">6.600.000đ</strong>
        </div>
        <div class="split-item expense">
          <span class="split-icon">💸</span> Tổng chi tiêu: <strong id="repExpense">8.100.000đ</strong>
        </div>
      </div>

      <!-- Core Feature: Aggregated Item Sold Table -->
      <div class="table-container">
        <div class="table-title-bar">
          <h3 class="table-title">🔥 Bảng Thống Kê Số Lượng Từng Món Đã Bán</h3>
          <span class="table-badge">Cực kỳ hữu ích để chuẩn bị nguyên liệu ngày mai</span>
        </div>
        <table class="data-table" id="itemsSoldTable">
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
          <tbody id="itemsSoldTbody">
            <!-- Rendered by JS -->
          </tbody>
        </table>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- VIEW 3: QUẢN LÝ THU - CHI                      -->
    <!-- ============================================== -->
    <section id="view-expenses" class="tab-view">
      <div class="view-header">
        <div>
          <h2 class="view-title">💰 Quản Lý Thu - Chi & Lợi Nhuận Thực Tế</h2>
          <p class="view-desc">Ghi chép chi tiêu nhập hàng, than, đá, gas, lương nhân viên trong ngày</p>
        </div>
        <button class="btn-action primary" id="btnOpenAddExpense">
          + Thêm Khoản Chi Hôm Nay
        </button>
      </div>

      <div class="finance-overview">
        <div class="finance-box rev">
          <span class="fin-title">Doanh Thu Ngày</span>
          <span class="fin-val" id="finRev">24.865.000đ</span>
        </div>
        <div class="finance-sign">-</div>
        <div class="finance-box exp">
          <span class="fin-title">Tổng Chi Phí Hôm Nay</span>
          <span class="fin-val" id="finExp">8.100.000đ</span>
        </div>
        <div class="finance-sign">=</div>
        <div class="finance-box net">
          <span class="fin-title">LỢI NHUẬN THỰC (TIỀN CÒN LẠI)</span>
          <span class="fin-val net-val" id="finNet">16.765.000đ</span>
        </div>
      </div>

      <!-- Expenses List Table -->
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th width="80">Giờ</th>
              <th width="160">Khoản Mục</th>
              <th>Nội Dung Chi Tiêu Chi Tiết</th>
              <th width="180" class="text-right">Số Tiền</th>
              <th width="100" class="text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody id="expensesTbody">
            <!-- Rendered by JS -->
          </tbody>
        </table>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- VIEW 4: KHO NGUYÊN LIỆU & ĐỊNH LƯỢNG (BOM)     -->
    <!-- ============================================== -->
    <section id="view-inventory" class="tab-view">
      <div class="view-header">
        <div>
          <h2 class="view-title">📦 Quản Lý Tồn Kho & Công Thức Định Lượng (BOM)</h2>
          <p class="view-desc">Tự động tính toán lượng thịt heo, thịt bò, que xiên tiêu hao dựa trên số món bán</p>
        </div>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nguyên Liệu</th>
              <th width="140">Đơn Vị</th>
              <th width="180" class="text-right">Đã Tiêu Thụ Hôm Nay</th>
              <th width="180" class="text-right">Tồn Kho Hiện Tại</th>
              <th width="180" class="text-center">Trạng Thái Kho</th>
            </tr>
          </thead>
          <tbody id="inventoryTbody">
            <!-- Rendered by JS -->
          </tbody>
        </table>
      </div>
    </section>

    <!-- ============================================== -->
    <!-- VIEW 5: BÉ HUYỀN AI COPILOT                    -->
    <!-- ============================================== -->
    <section id="view-ai" class="tab-view">
      <div class="ai-container">
        <div class="ai-header">
          <div class="ai-avatar">🤖</div>
          <div>
            <h2 class="ai-title">Bé Huyền AI — Trợ Lý Quán Ăn Thông Minh</h2>
            <p class="ai-desc">Phân tích doanh thu, tìm nguyên nhân lời/lỗ, dự báo lượng thịt & xiên cần chuẩn bị cho ngày mai</p>
          </div>
        </div>

        <!-- Quick AI Prompt Buttons -->
        <div class="ai-quick-prompts">
          <button class="ai-prompt-btn" data-prompt="Hôm nay tại sao lời thấp hơn hôm qua?">
            ❓ "Tại sao lời hôm nay thấp hơn hôm qua?"
          </button>
          <button class="ai-prompt-btn" data-prompt="Ngày mai cần chuẩn bị bao nhiêu kg thịt và que xiên?">
            🍢 "Ngày mai cần chuẩn bị bao nhiêu kg thịt và que xiên?"
          </button>
          <button class="ai-prompt-btn" data-prompt="Món nào bán chạy nhất và món nào bán chậm?">
            🔥 "Món nào bán chạy nhất, món nào bán chậm?"
          </button>
          <button class="ai-prompt-btn" data-prompt="Tổng kết doanh thu và gợi ý tối ưu chi phí">
            💡 "Tổng kết doanh thu & tối ưu chi phí"
          </button>
        </div>

        <!-- AI Messages Chat Log -->
        <div class="ai-chat-box" id="aiChatLog">
          <div class="ai-message assistant">
            <div class="msg-avatar">🤖</div>
            <div class="msg-content">
              Dạ chào anh chủ! Em là **Bé Huyền AI Copilot** đây ạ. Em đã đọc toàn bộ dữ liệu 20 bàn, doanh thu, chi phí nhập hàng và số lượng từng xiên nướng bán ra hôm nay. Anh muốn em phân tích điều gì nào?
            </div>
          </div>
        </div>

        <!-- AI Input Bar -->
        <div class="ai-input-bar">
          <input type="text" id="aiInputText" placeholder="Nhập câu hỏi cho trợ lý AI (ví dụ: Mai cần ướp bao nhiêu thịt?)..." autocomplete="off">
          <button id="btnAiSend" class="btn-action primary">Gửi Hỏi AI 🚀</button>
        </div>
      </div>
    </section>

  </main>

  <!-- ============================================== -->
  <!-- MODAL: ORDER MÓN BÀN (SIÊU TỐC)                -->
  <!-- ============================================== -->
  <div class="modal-overlay" id="orderModal">
    <div class="modal-card order-modal-card">
      <div class="modal-header">
        <div class="modal-title-group">
          <span class="modal-badge-table" id="orderModalTableBadge">BÀN 05</span>
          <span class="modal-time-label" id="orderModalTime">Vào bàn: 18:15</span>
        </div>
        <button class="btn-close-modal" id="btnCloseOrderModal">&times;</button>
      </div>

      <div class="order-layout">
        <!-- Left Column: Menu items catalog -->
        <div class="menu-catalog">
          <div class="menu-category-tabs" id="menuCategoryTabs">
            <button class="cat-pill active" data-cat="all">Tất cả</button>
            <button class="cat-pill" data-cat="Xiên Nướng">🍢 Xiên Nướng</button>
            <button class="cat-pill" data-cat="Món Nóng">🥘 Món Nóng / Ốc</button>
            <button class="cat-pill" data-cat="Ăn Vặt">🍘 Ăn Vặt</button>
            <button class="cat-pill" data-cat="Đồ Uống">🥤 Đồ Uống</button>
          </div>

          <div class="menu-grid" id="menuGrid">
            <!-- Rendered by JS -->
          </div>
        </div>

        <!-- Right Column: Current Table Cart -->
        <div class="order-cart">
          <div class="cart-header">
            <h3>Danh Sách Món Đang Gọi</h3>
            <span class="cart-count" id="cartItemCount">7 món</span>
          </div>

          <div class="cart-items-list" id="cartItemsList">
            <!-- Rendered by JS -->
          </div>

          <div class="cart-footer">
            <div class="cart-total-row">
              <span class="total-label">TỔNG TIỀN BÀN:</span>
              <span class="total-value" id="cartTotalVal">329.000đ</span>
            </div>

            <div class="cart-actions-row">
              <button class="btn-action secondary" id="btnSaveOrder">💾 Lưu Order</button>
              <button class="btn-action checkout-btn" id="btnOpenCheckout">💳 Thanh Toán (1 Chạm)</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ============================================== -->
  <!-- MODAL: THANH TOÁN & IN BILL & VIETQR           -->
  <!-- ============================================== -->
  <div class="modal-overlay" id="checkoutModal">
    <div class="modal-card checkout-modal-card">
      <div class="modal-header">
        <h3 class="modal-title">🧾 Hóa Đơn Thanh Toán</h3>
        <button class="btn-close-modal" id="btnCloseCheckoutModal">&times;</button>
      </div>

      <div class="checkout-layout">
        <!-- Printable Bill Preview -->
        <div class="bill-preview" id="printableBill">
          <div class="bill-header">
            <h2 class="bill-store-name">XIÊNG NƯỚNG BÉ HUYỀN</h2>
            <p class="bill-store-info">123 Đường Ẩm Thực, TP.HCM</p>
            <p class="bill-store-info">Hotline: 0908.123.456</p>
            <div class="bill-divider">--------------------------------</div>
            <div class="bill-meta-row">
              <strong id="billTableName">BÀN 05</strong>
              <span id="billTime">27/09/2026 18:30</span>
            </div>
            <div class="bill-divider">--------------------------------</div>
          </div>

          <table class="bill-table">
            <thead>
              <tr>
                <th align="left">Món</th>
                <th align="center">SL</th>
                <th align="right">Đ.Giá</th>
                <th align="right">T.Tiền</th>
              </tr>
            </thead>
            <tbody id="billItemsTbody">
              <!-- Rendered by JS -->
            </tbody>
          </table>

          <div class="bill-divider">--------------------------------</div>
          <div class="bill-total-row">
            <span>TỔNG CỘNG:</span>
            <strong id="billTotalAmount">329.000đ</strong>
          </div>
          <div class="bill-divider">--------------------------------</div>
          <p class="bill-footer-msg">Cảm ơn Quý Khách - Hẹn Gặp Lại!</p>
        </div>

        <!-- Payment Method Selector & VietQR display -->
        <div class="checkout-controls">
          <div class="method-selector">
            <label class="method-card active" data-method="cash">
              <input type="radio" name="payMethod" value="cash" checked>
              <div class="method-content">
                <span class="method-icon">💵</span>
                <span class="method-text">Tiền Mặt</span>
              </div>
            </label>

            <label class="method-card" data-method="transfer">
              <input type="radio" name="payMethod" value="transfer">
              <div class="method-content">
                <span class="method-icon">📱</span>
                <span class="method-text">Chuyển Khoản (VietQR)</span>
              </div>
            </label>
          </div>

          <!-- Cash input UI -->
          <div class="cash-calc-box" id="cashCalcBox">
            <div class="calc-row">
              <span>Khách đưa:</span>
              <input type="number" id="cashGivenInput" placeholder="Ví dụ: 350000" class="input-money">
            </div>
            <div class="calc-row">
              <span>Tiền thối lại:</span>
              <strong class="change-amount" id="cashChangeVal">0đ</strong>
            </div>
          </div>

          <!-- VietQR dynamic image display -->
          <div class="vietqr-box" id="vietqrBox" style="display: none;">
            <p class="qr-notice">Quét mã VietQR bằng App Ngân Hàng:</p>
            <div class="qr-img-wrapper">
              <img id="vietqrImg" src="" alt="VietQR Napas">
            </div>
            <p class="qr-info-text">MBBank &bull; 0908123456 &bull; NGUYEN THI BE HUYEN</p>
          </div>

          <div class="checkout-footer-buttons">
            <button class="btn-action" onclick="window.print()">🖨️ In Hóa Đơn</button>
            <button class="btn-action primary confirm-btn" id="btnConfirmPayment">
              ✅ Xác Nhận Đã Thu Tiền & Trả Bàn
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ============================================== -->
  <!-- MODAL: THÊM KHOẢN CHI TIÊU                     -->
  <!-- ============================================== -->
  <div class="modal-overlay" id="addExpenseModal">
    <div class="modal-card small-card">
      <div class="modal-header">
        <h3 class="modal-title">💸 Thêm Khoản Chi Hôm Nay</h3>
        <button class="btn-close-modal" id="btnCloseExpenseModal">&times;</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Danh mục chi tiêu:</label>
          <select id="expCategory" class="form-control">
            <option value="Nguyên liệu">🥩 Nguyên liệu (Thịt, ốc, cút, rau...)</option>
            <option value="Nhiên liệu">🔥 Nhiên liệu (Than, đá, gas...)</option>
            <option value="Nhân sự">👥 Nhân sự / Lương phục vụ</option>
            <option value="Chi khác">📦 Chi khác / Vật dụng</option>
          </select>
        </div>

        <div class="quick-exp-pills">
          <button type="button" class="exp-pill" data-desc="Nhập thịt heo & bò tươi">Nhập thịt</button>
          <button type="button" class="exp-pill" data-desc="Nhập que xiên & bao bì">Que xiên</button>
          <button type="button" class="exp-pill" data-desc="Rau sống, lá lốt, dưa leo">Rau</button>
          <button type="button" class="exp-pill" data-desc="Than hoa không khói">Than</button>
          <button type="button" class="exp-pill" data-desc="Nước đá cây & bi">Nước đá</button>
          <button type="button" class="exp-pill" data-desc="Đổi bình gas">Tiền gas</button>
          <button type="button" class="exp-pill" data-desc="Tạm ứng lương nhân viên">Nhân viên</button>
        </div>

        <div class="form-group">
          <label>Nội dung chi tiết:</label>
          <input type="text" id="expDesc" class="form-control" placeholder="Ví dụ: Nhập 10kg thịt nạc...">
        </div>

        <div class="form-group">
          <label>Số tiền (VNĐ):</label>
          <input type="number" id="expAmount" class="form-control input-money" placeholder="Ví dụ: 3500000">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-action secondary" id="btnCancelExpense">Hủy</button>
        <button class="btn-action primary" id="btnSaveExpense">💾 Lưu Khoản Chi</button>
      </div>
    </div>
  </div>

  <!-- ============================================== -->
  <!-- MODAL: KẾT NỐI ĐIỆN THOẠI LAN                  -->
  <!-- ============================================== -->
  <div class="modal-overlay" id="wifiModal">
    <div class="modal-card small-card text-center">
      <div class="modal-header">
        <h3 class="modal-title">📱 Mở Trên Điện Thoại & Tablet</h3>
        <button class="btn-close-modal" id="btnCloseWifiModal">&times;</button>
      </div>
      <div class="modal-body">
        <p class="wifi-desc">Nhân viên hoặc Chủ quán mở camera điện thoại quét mã QR bên dưới (cùng kết nối Wifi của Quán):</p>
        <div class="qr-code-box">
          <img id="wifiQrImg" src="" alt="Wifi LAN QR">
        </div>
        <p class="wifi-url-box"><code id="wifiLanUrl">http://...</code></p>
        <p class="wifi-tip">💡 Mẹo: Chọn "Thêm vào màn hình chính" trên Safari/Chrome để dùng mượt như App!</p>
      </div>
    </div>
  </div>

  <!-- Audio Chimes (Web Audio API fallback) -->
  <script src="app.js"></script>
</body>
</html>
`;

fs.writeFileSync(path.join(publicDir, 'index.html'), htmlContent, 'utf-8');
console.log('Created public/index.html successfully!');
