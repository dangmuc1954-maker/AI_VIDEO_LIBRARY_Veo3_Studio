// ==========================================================================
// ALEXBRIGHT TOOL · MUSE AI STUDIO · LICENSE ACTIVATION & REALTIME SHIELD
// ==========================================================================

(function() {
  let licenseData = {
    active: false,
    hwid: 'Đang tải...',
    expires_at: null,
    message: 'Đang kết nối máy chủ xác thực...',
    server_command: null,
    server_message: null
  };

  let autoPollTimer = null;
  let heartbeatTimer = null;
  let isChecking = false;

  // Gắn sự kiện nút bấm trên Shield
  function bindShieldEvents() {
    const copyBtn = document.getElementById('lic-btn-copy');
    const recheckBtn = document.getElementById('lic-btn-recheck');
    const hwidInput = document.getElementById('lic-hwid-display');

    if (copyBtn && hwidInput) {
      copyBtn.onclick = async () => {
        const text = hwidInput.value;
        if (!text || text.includes('Đang')) return;
        try {
          await navigator.clipboard.writeText(text);
          copyBtn.innerHTML = '<span>✓</span> Đã sao chép!';
          copyBtn.classList.add('copied');
          showLicToast('📋 Đã sao chép mã máy: ' + text + '\nHãy gửi cho Admin Nhật Minh Dương để kích hoạt!');
          setTimeout(() => {
            copyBtn.innerHTML = '<span>📋</span> Sao chép mã máy';
            copyBtn.classList.remove('copied');
          }, 3000);
        } catch (_) {
          hwidInput.select();
          document.execCommand('copy');
          showLicToast('📋 Đã sao chép mã máy vào bộ nhớ tạm!');
        }
      };
    }

    if (recheckBtn) {
      recheckBtn.onclick = () => {
        checkLicenseNow(true);
      };
    }
  }

  // Toast thông báo kích hoạt
  function showLicToast(msg) {
    let t = document.querySelector('.lic-toast');
    if (!t) {
      t = document.createElement('div');
      t.className = 'lic-toast';
      document.body.appendChild(t);
    }
    t.innerText = msg;
    t.style.display = 'block';
    clearTimeout(showLicToast.timer);
    showLicToast.timer = setTimeout(() => {
      if (t) t.style.display = 'none';
    }, 4500);
  }

  // Cập nhật giao diện Shield
  function updateShieldUI(data) {
    if (!data) return;
    licenseData = { ...licenseData, ...data };

    const shield = document.getElementById('license-shield');
    const hwidInput = document.getElementById('lic-hwid-display');
    const dot = document.getElementById('lic-status-dot');
    const statusText = document.getElementById('lic-status-text');
    const statusSub = document.getElementById('lic-status-sub');
    const topPill = document.getElementById('top-license-pill');

    if (hwidInput && licenseData.hwid) {
      hwidInput.value = licenseData.hwid;
    }

    // Xử lý Lệnh Máy Chủ khẩn cấp (Killswitch / Exit)
    if (licenseData.server_command === 'EXIT') {
      document.body.classList.add('app-locked');
      if (shield) shield.classList.remove('shield-hidden');
      if (dot) dot.className = 'lic-status-dot error';
      if (statusText) {
        statusText.innerHTML = `<b style="color: #ef4444;">⛔ LỆNH TỪ MÁY CHỦ ADMIN:</b> ${licenseData.server_message || 'Ứng dụng đã bị đóng bởi quản trị viên.'}`;
      }
      if (statusSub) {
        statusSub.textContent = 'Ứng dụng sẽ tự động thoát ngay lập tức...';
      }
      showLicToast('⛔ LỆNH ADMIN: ' + (licenseData.server_message || 'Thoát ứng dụng'));
      setTimeout(async () => {
        try {
          if (window.pywebview?.api?.exit_app) {
            window.pywebview.api.exit_app();
          } else {
            await fetch('/api/license/exit', { method: 'POST' });
          }
        } catch (_) {}
      }, 1500);
      return;
    }

    if (licenseData.active) {
      // ĐÃ KÍCH HOẠT HỢP LỆ
      document.body.classList.remove('app-locked');
      if (shield) shield.classList.add('shield-hidden');
      if (dot) dot.className = 'lic-status-dot active';
      if (statusText) {
        statusText.innerHTML = `<b style="color: #10b981;">✅ ĐÃ KÍCH HOẠT THÀNH CÔNG</b> · Hạn dùng: <span style="color: #38bdf8;">${licenseData.expires_at || 'Vĩnh viễn'}</span>`;
      }
      if (statusSub) {
        statusSub.textContent = 'Bản quyền hợp lệ. Tất cả tính năng đã sẵn sàng hoạt động.';
      }

      // Cập nhật Topbar Pill
      if (topPill) {
        topPill.className = 'license-pill';
        topPill.innerHTML = `<span>🛡️</span> Bản quyền: Đã kích hoạt · Hạn: ${licenseData.expires_at || 'Vĩnh viễn'}`;
      }

      // Dừng Polling dồn dập, chuyển sang Heartbeat vừa phải
      if (autoPollTimer) {
        clearInterval(autoPollTimer);
        autoPollTimer = null;
      }
      startInAppHeartbeat();

    } else {
      // CHƯA KÍCH HOẠT HOẶC ĐÃ BỊ THU HỒI / XÓA KEY
      document.body.classList.add('app-locked');
      if (shield) shield.classList.remove('shield-hidden');
      if (dot) dot.className = 'lic-status-dot error';
      if (statusText) {
        statusText.innerHTML = `<b style="color: #ef4444;">❌ CHƯA KÍCH HOẠT BẢN QUYỀN</b> · ${licenseData.message || 'Mã máy chưa được cấp phép.'}`;
      }
      if (statusSub) {
        statusSub.textContent = 'Hãy sao chép mã máy ở trên gửi cho Admin Nhật Minh Dương để được kích hoạt ngay.';
      }

      // Cập nhật Topbar Pill
      if (topPill) {
        topPill.className = 'license-pill revoked';
        topPill.innerHTML = `<span>⚠️</span> Chưa kích hoạt`;
      }

      // Khởi động auto-polling chờ admin bấm kích hoạt trên web
      startAutoPolling();
    }
  }

  // Gọi API kiểm tra bản quyền
  async function checkLicenseNow(manual = false) {
    if (isChecking) return;
    isChecking = true;
    const recheckBtn = document.getElementById('lic-btn-recheck');
    if (recheckBtn) recheckBtn.classList.add('spinning');

    try {
      const res = await fetch('/api/license/check', { method: 'POST' });
      const data = await res.json();
      updateShieldUI(data);
      if (manual) {
        if (data.active) {
          showLicToast('🎉 KÍCH HOẠT THÀNH CÔNG! Chào mừng bạn đến với Muse AI Studio.');
        } else {
          showLicToast('⏳ ' + (data.message || 'Mã máy chưa được kích hoạt trên hệ thống! Vui lòng gửi mã cho Admin.'));
        }
      }
    } catch (e) {
      console.warn('Lỗi kiểm tra bản quyền:', e);
      if (manual) {
        showLicToast('⚠️ Lỗi kết nối kiểm tra: ' + e.message);
      }
    } finally {
      isChecking = false;
      if (recheckBtn) recheckBtn.classList.remove('spinning');
    }
  }

  // Auto Polling mỗi 3.5s khi ở màn hình chờ kích hoạt
  function startAutoPolling() {
    if (autoPollTimer) return;
    autoPollTimer = setInterval(() => {
      if (!licenseData.active) {
        checkLicenseNow(false);
      }
    }, 3500);
  }

  // Heartbeat ngầm mỗi 5s khi đang dùng: NẾU ADMIN XÓA KEY -> VĂNG / KHÓA NGAY LẬP TỨC!
  function startInAppHeartbeat() {
    if (heartbeatTimer) return;
    heartbeatTimer = setInterval(async () => {
      try {
        const res = await fetch('/api/license/status');
        const data = await res.json();
        
        // Nếu có lệnh EXIT
        if (data.server_command === 'EXIT') {
          updateShieldUI(data);
          return;
        }

        // Nếu trạng thái thay đổi từ active -> inactive (bị xóa key trên server)
        if (licenseData.active && !data.active) {
          showLicToast('⛔ BẢN QUYỀN ĐÃ BỊ THU HỒI HOẶC XÓA TRÊN MÁY CHỦ!');
          updateShieldUI(data);
        } else if (!licenseData.active && data.active) {
          updateShieldUI(data);
        }
      } catch (_) {}
    }, 5000);
  }

  // Chèn Pill hiển thị bản quyền vào Topbar của tool
  function injectTopbarLicensePill() {
    const topbar = document.querySelector('.topbar .top-right');
    if (!topbar || document.getElementById('top-license-pill')) return;

    const pill = document.createElement('span');
    pill.id = 'top-license-pill';
    pill.className = 'license-pill';
    pill.title = 'Bấm để xem thông tin bản quyền và mã máy';
    pill.innerHTML = `<span>🛡️</span> Kiểm tra bản quyền...`;
    pill.onclick = () => {
      const shield = document.getElementById('license-shield');
      if (shield) {
        shield.classList.toggle('shield-hidden');
      }
    };

    topbar.insertBefore(pill, topbar.firstChild);
  }

  // Khởi động khi tải xong DOM
  function init() {
    bindShieldEvents();
    injectTopbarLicensePill();

    // Lấy trạng thái ban đầu
    fetch('/api/license/status')
      .then(r => r.json())
      .then(data => {
        updateShieldUI(data);
        if (!data.active) {
          checkLicenseNow(false);
        }
      })
      .catch(e => {
        console.warn('Init license status error:', e);
        startAutoPolling();
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
