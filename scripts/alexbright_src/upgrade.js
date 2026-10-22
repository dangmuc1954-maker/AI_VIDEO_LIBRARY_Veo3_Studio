// Account health, bulk actions, output picker and AlexBright information.
const brandLogo = '/static/alexbright-logo.png';
const accountSelection = new Set();
const originalRefresh = refresh;
refresh = async function() {
  const before = new Map((state.accounts || []).map(account => [account.id, account.auth_status]));
  await originalRefresh();
  if (state.license) {
    if (!state.license.active) {
      document.body.classList.add('app-locked');
      const shield = document.getElementById('license-shield');
      if (shield) shield.classList.remove('shield-hidden');
    }
    if (state.license.server_command === 'EXIT') {
      try {
        if (window.pywebview?.api?.exit_app) window.pywebview.api.exit_app();
        else fetch('/api/license/exit', { method: 'POST' });
      } catch (_) {}
    }
  }
  if (state.retry_only) $('side-state').textContent = 'Đang chạy lại task lỗi';
  const expired = state.accounts.find(account => before.has(account.id) &&
    before.get(account.id) !== 'expired' && account.auth_status === 'expired');
  if (expired) toast('Cookie ' + expired.name + ' đã hết hạn. Hãy cập nhật cookie trong Tài khoản.');
};

document.querySelector('.brand').innerHTML =
  '<img class="brand-logo" src="' + brandLogo + '" alt="Alex Bright">' +
  '<div><strong>ALEXBRIGHT TOOL</strong><small>MUSE.AI AUTO VIDEO · v1.6.8</small></div>';
document.querySelector('.topbar').insertAdjacentHTML('beforeend',
  '<button class="top-brand" type="button" data-action="show-admin" title="Thông tin nhà phát triển">' +
  '<img src="' + brandLogo + '" alt=""><span>ALEXBRIGHT TOOL <small>Dev Nhật Minh Dương · 0333688491 · © 2026 · v1.6.8</small></span></button>');
document.querySelector('.sidebar nav').insertAdjacentHTML('beforeend',
  '<button class="nav" data-view="admin"><span>ⓘ</span>Bản quyền & Admin</button>');
document.querySelector('main').insertAdjacentHTML('beforeend',
  '<div class="page hidden" id="view-admin"><div class="page-head"><div><div class="eyebrow">OFFICIAL INFORMATION</div>' +
  '<h1>Bản quyền & Admin</h1><p>MUSE.AI AUTO VIDEO · ALEXBRIGHT TOOL v1.6.8</p></div></div>' +
  '<section class="card admin-card"><img class="admin-logo" src="' + brandLogo + '" alt="Alex Bright logo">' +
  '<div><h2>ALEXBRIGHT TOOL</h2><p>Dev Nhật Minh Dương</p><p>Copyright © 2026 NHAT MINH DUONG</p>' +
  '<p>Website: <a href="https://alexbright.site/" target="_blank" rel="noopener">alexbright.site</a></p>' +
  '<p>Zalo: <a href="tel:0333688491">0333688491</a></p>' +
  '<p>Telegram: <a href="https://t.me/ANONY88888" target="_blank" rel="noopener">@ANONY88888</a></p>' +
  '<p>Nhóm Zalo: <a href="https://zalo.me/g/t4cn56rel02pjomxwanh" target="_blank" rel="noopener">Tham gia nhóm</a></p></div></section>' +
  '<section class="note admin-warning"><strong>Cảnh báo mua tool</strong><p>Chỉ mua tool qua thông tin Admin ở trên. Bản crack hoặc từ nguồn khác không được hỗ trợ.</p></section></div>');
document.body.insertAdjacentHTML('beforeend',
  '<button class="chat-float" type="button" data-action="show-admin" title="Chat · Thông tin Admin">' +
  '<img src="' + brandLogo + '" alt=""><span>Chat</span></button>');
document.querySelector('.sidebar-bottom').before(document.querySelector('.chat-float'));

// The navigation listener in app.js was bound before this button was added.
document.querySelector('.nav[data-view="admin"]').onclick = function() {
  document.querySelectorAll('.nav').forEach(item => item.classList.toggle('active', item === this));
  document.querySelectorAll('.page').forEach(page => page.classList.toggle('hidden', page.id !== 'view-admin'));
  $('crumb').textContent = 'BẢN QUYỀN & ADMIN';
};

for (const kind of ['video', 'image']) {
  const output = $(kind + '-output');
  output.closest('label').childNodes[0].textContent = kind === 'video' ? 'Thư mục lưu video' : 'Thư mục lưu ảnh';
  output.insertAdjacentHTML('afterend', '<button type="button" class="small-action choose-output" data-kind="' + kind + '">Chọn thư mục…</button>');
  const toolbar = $(kind + '-rows').closest('.queue').querySelector('.queue-toolbar');
  toolbar.querySelector('#cancel-' + kind + '-selected').textContent = 'Hủy đã chọn';
  toolbar.querySelector('#cancel-' + kind + '-selected').insertAdjacentHTML('afterend',
    '<button type="button" class="text-btn danger-text" data-delete-kind="' + kind + '" data-scope="selected">Xóa đã chọn</button>' +
    '<button type="button" class="text-btn danger-text" data-delete-kind="' + kind + '" data-scope="all">Xóa tất cả</button>');
  toolbar.querySelector('[data-delete-kind="' + kind + '"][data-scope="all"]').insertAdjacentHTML('afterend',
    '<button type="button" class="text-btn retry-errors" data-retry-kind="' + kind + '">Chạy lại task lỗi</button>');
  $('select-' + kind).onchange = event => {
    const ids = [...$(kind + '-rows').querySelectorAll('.row-check')].map(input => input.dataset.id);
    ids.forEach(id => event.target.checked ? selected[kind].add(id) : selected[kind].delete(id));
    renderRows(kind);
  };
  $(kind + '-rows').addEventListener('change', event => {
    if (!event.target.matches('.row-check')) return;
    const shown = [...$(kind + '-rows').querySelectorAll('.row-check')];
    $('select-' + kind).checked = shown.length > 0 && shown.every(input => selected[kind].has(input.dataset.id));
  });
}

const previousUpgradeRenderRows = renderRows;
renderRows = function(kind) {
  previousUpgradeRenderRows(kind);
  const shown = [...$(kind + '-rows').querySelectorAll('.row-check')];
  $('select-' + kind).checked = shown.length > 0 && shown.every(input => selected[kind].has(input.dataset.id));
  for (const row of $(kind + '-rows').querySelectorAll('tr')) {
    const id = row.querySelector('[data-action="edit"]')?.dataset.id;
    const task = id && taskById(id);
    if (!task?.error) continue;
    const summary = task.error.includes('waiting for navigation') && task.error.includes("until 'load'") ?
      'Chờ trang Muse tải xong quá lâu; chưa xác nhận URL chat' : task.error.split('\n')[0];
    row.cells[4].insertAdjacentHTML('beforeend', '<small class="task-error" title="' + esc(task.error) + '">' +
      esc(summary.slice(0, 100)) + '</small>');
  }
};
$('default-output').closest('label').childNodes[0].textContent = 'Thư mục lưu thành phẩm mặc định';
$('default-output').insertAdjacentHTML('afterend', '<button type="button" class="small-action choose-output" data-kind="default">Chọn thư mục…</button>');
$('video-output').placeholder = 'Chọn ổ đĩa hoặc thư mục, ví dụ D:\\Videos';
$('image-output').placeholder = 'Chọn ổ đĩa hoặc thư mục, ví dụ D:\\Images';

const managerTable = document.querySelector('.account-table');
managerTable.querySelector('thead tr').insertAdjacentHTML('afterbegin',
  '<th class="account-select-cell"><input id="select-all-accounts" type="checkbox" title="Chọn tất cả tài khoản"></th>');
$('account-count').insertAdjacentHTML('afterend',
  '<button type="button" id="delete-accounts-selected" class="small-action danger">Xóa tài khoản đã chọn</button>');
$('account-stats').insertAdjacentHTML('afterend', '<div id="account-health-alert" class="health-alert hidden"></div>');
$('manager-account-name').placeholder = 'Để trống: muse ai acc1, acc2…';
$('manager-account-cookie').placeholder = '[{"domain":".muse.ai","name":"...","value":"..."}]';
$('manager-account-cookie').closest('label').childNodes[0].textContent = 'Cookie JSON từ Cookie Editor (tùy chọn)';
$('manager-account-dialog').querySelector('.hint').textContent =
  'Dán JSON xuất từ Cookie Editor rồi bấm Thêm & kiểm tra. Tool kiểm tra Muse trong Chrome ẩn. Nếu muốn đăng nhập Google, thêm tài khoản không cookie rồi bấm Đăng nhập Google trong danh sách.';
$('save-manager-account').textContent = 'Thêm & kiểm tra';
$('cookie-dialog').querySelector('.hint').textContent =
  'Dán JSON xuất từ Cookie Editor (hoặc chuỗi name=value; name2=value2). Cookie chỉ lưu trong profile Chromium cục bộ.';
$('cookie-header').placeholder = '[{"domain":".muse.ai","name":"...","value":"..."}]';

// Override the old account save handler, which required a name and closed before checking cookies.
$('save-manager-account').onclick = async () => {
  const button = $('save-manager-account');
  button.disabled = true;
  try {
    const cookie = $('manager-account-cookie').value.trim();
    let id = editingAccountId;
    if (id) {
      const current = accountById(id);
      await api('/accounts/' + id, 'PATCH', {name: $('manager-account-name').value.trim() || current.name});
    } else {
      const created = await api('/accounts', 'POST', {
        name: $('manager-account-name').value.trim(),
        profile_path: $('manager-account-profile').value.trim() || null
      });
      id = created.id;
      editingAccountId = id;
    }
    if (cookie) {
      button.textContent = 'Đang kiểm tra Muse…';
      const result = await api('/accounts/' + id + '/cookies', 'POST', {header: cookie});
      if (!result.authenticated) {
        toast('Muse chưa xác nhận đăng nhập. Hãy cập nhật cookie JSON rồi kiểm tra lại.');
        await refresh();
        return;
      }
      toast('Cookie hợp lệ; đã đăng nhập Muse và bật tài khoản.');
    } else {
      toast('Đã thêm tài khoản. Dán cookie hoặc chọn Đăng nhập Google để kích hoạt.');
    }
    closeAccountDialog();
    await refresh();
  } catch (error) {
    toast(error.message);
    await refresh();
  } finally {
    button.disabled = false;
    button.textContent = editingAccountId ? 'Lưu & kiểm tra' : 'Thêm & kiểm tra';
  }
};

$('save-cookie').onclick = async event => {
  event.preventDefault();
  try {
    const result = await api('/accounts/' + cookieAccount + '/cookies', 'POST', {header: $('cookie-header').value});
    await refresh();
    if (result.authenticated) {
      $('cookie-dialog').close();
      $('cookie-header').value = '';
      toast('Cookie hợp lệ; Muse đã xác nhận đăng nhập.');
    } else toast('Muse chưa xác nhận đăng nhập. Hãy kiểm tra lại cookie JSON.');
  } catch (error) { toast(error.message); }
};

renderAccounts = function() {
  const accounts = state.accounts;
  const busy = ['connecting_account', 'opening_chat', 'sending', 'generating', 'downloading'];
  $('account-count').textContent = accounts.length + ' tài khoản';
  $('account-stats').innerHTML =
    '<div class="stat"><small>Tổng tài khoản</small><strong>' + accounts.length + '</strong></div>' +
    '<div class="stat"><small>Đã đăng nhập</small><strong>' + accounts.filter(a => a.auth_status === 'valid').length + '</strong></div>' +
    '<div class="stat"><small>Luồng đang chạy</small><strong>' + state.tasks.filter(t => busy.includes(t.status)).length + '</strong></div>' +
    '<div class="stat"><small>Cần cập nhật cookie</small><strong>' + accounts.filter(a => a.auth_status === 'expired').length + '</strong></div>';
  const expired = accounts.filter(a => a.auth_status === 'expired');
  $('account-health-alert').classList.toggle('hidden', !expired.length);
  $('account-health-alert').textContent = expired.length ?
    'Cookie hết hạn: ' + expired.map(a => a.name).join(', ') + '. Bấm “Sửa / Cookie” để cập nhật.' : '';
  $('account-rows').innerHTML = accounts.length ? accounts.map(account => {
    const tasks = state.tasks.filter(task => task.account_id === account.id);
    const id = esc(account.id);
    const login = (state.login_accounts || []).includes(account.id);
    const status = login ? 'Đang đăng nhập Google' : account.auth_status === 'valid' ?
      (account.enabled ? (account.cooldown_seconds ? 'Thử lại sau ' + account.cooldown_seconds + 's' : 'Đã đăng nhập') : 'Đã tắt') : account.auth_status === 'expired' ?
      'Cookie hết hạn' : account.auth_status === 'error' ? 'Lỗi kiểm tra' : 'Chưa kiểm tra';
    const statusClass = account.auth_status === 'valid' && account.enabled ? 'done' :
      account.auth_status === 'expired' || account.auth_status === 'error' ? 'failed' : 'queued';
    return '<tr><td class="account-select-cell"><input class="account-check" type="checkbox" data-id="' + id + '" ' +
      (accountSelection.has(account.id) ? 'checked' : '') + '></td><td><div class="manager-account-identity">' +
      '<img class="account-mark" src="' + brandLogo + '" alt=""><span><strong>' + esc(account.name) + '</strong>' +
      '<small>' + esc(account.profile_path) + '</small></span></div></td>' +
      '<td><span class="status ' + statusClass + '" title="' + esc(account.auth_error || '') + '">' + status + '</span>' +
      (account.auth_checked_at ? '<small class="health-time">' + esc(new Date(account.auth_checked_at).toLocaleString('vi-VN')) + '</small>' : '') +
      '</td><td><b>' + tasks.length + '</b></td><td><b class="metric-active">' + tasks.filter(t => busy.includes(t.status)).length +
      '</b></td><td><b class="metric-done">' + tasks.filter(t => t.status === 'done').length +
      '</b></td><td><b class="metric-error">' + tasks.filter(t => ['failed', 'needs_review'].includes(t.status)).length +
      '</b></td><td>' + esc(account.created_at ? new Date(account.created_at).toLocaleDateString('vi-VN') : '—') +
      '</td><td><div class="manager-account-actions">' +
      '<button class="small-action" data-action="check-account" data-id="' + id + '">Kiểm tra</button>' +
      (login ? '' : '<button class="small-action" data-action="login" data-id="' + id + '">Đăng nhập Google</button>') +
      '<button class="small-action" data-action="edit-account" data-id="' + id + '">Sửa / Cookie</button>' +
      '<button class="small-action" data-action="toggle" data-id="' + id + '">' + (account.enabled ? 'Tắt' : 'Bật') + '</button>' +
      '<button class="small-action danger" data-action="remove-account" data-id="' + id + '">Xóa</button></div></td></tr>';
  }).join('') : '<tr><td colspan="9" class="empty">Chưa có tài khoản. Bấm “Thêm tài khoản” để bắt đầu.</td></tr>';
  $('select-all-accounts').checked = accounts.length > 0 && accounts.every(a => accountSelection.has(a.id));
};

$('select-all-accounts').onchange = event => {
  state.accounts.forEach(a => event.target.checked ? accountSelection.add(a.id) : accountSelection.delete(a.id));
  renderAccounts();
};
$('account-rows').addEventListener('change', event => {
  if (event.target.matches('.account-check')) {
    event.target.checked ? accountSelection.add(event.target.dataset.id) : accountSelection.delete(event.target.dataset.id);
  }
});
$('delete-accounts-selected').onclick = async () => {
  const ids = [...accountSelection].filter(id => accountById(id));
  if (!ids.length) { toast('Hãy chọn tài khoản cần xóa'); return; }
  if (!confirm('Xóa ' + ids.length + ' tài khoản khỏi danh sách? Profile và lịch sử vẫn được giữ.')) return;
  try {
    await api('/accounts/delete-selected', 'POST', {ids});
    accountSelection.clear();
    await refresh();
    toast('Đã xóa ' + ids.length + ' tài khoản.');
  } catch (error) { toast(error.message); }
};

document.addEventListener('click', async event => {
  const picker = event.target.closest('.choose-output');
  if (picker) {
    try {
      if (!window.pywebview?.api?.choose_output_folder) throw Error('Chỉ chọn thư mục trực tiếp trong ứng dụng Desktop; bạn có thể nhập đường dẫn vào ô.');
      const folder = await window.pywebview.api.choose_output_folder();
      if (folder) $(picker.dataset.kind === 'default' ? 'default-output' : picker.dataset.kind + '-output').value = folder;
    } catch (error) { toast(error.message); }
    return;
  }
  const retryButton = event.target.closest('[data-retry-kind]');
  if (retryButton) {
    const kind = retryButton.dataset.retryKind;
    const ids = [...selected[kind]].filter(id => {
      const task = taskById(id);
      return task?.kind === kind && ['failed', 'needs_review'].includes(task.status);
    });
    if (!ids.length) { toast('Hãy chọn task Lỗi hoặc Cần kiểm tra để chạy lại.'); return; }
    const uncertain = ids.filter(id => {
      const task = taskById(id);
      return task.status === 'needs_review' || !!task.thread_url;
    }).length;
    const warning = uncertain ? '\n' + uncertain + ' task có thể đã được Muse nhận. Chạy lại có thể tạo trùng video.' : '';
    if (!confirm('Chỉ chạy lại ' + ids.length + ' task lỗi đã chọn? Các task đang chờ khác sẽ không được khởi chạy bởi nút này.' + warning)) return;
    try {
      retryButton.disabled = true;
      const result = await api('/tasks/retry-selected', 'POST', {ids, confirm_possible_duplicate: uncertain > 0});
      selected[kind].clear();
      await refresh();
      toast('Đã đưa ' + result.requeued + ' task lỗi về Đang chờ và bắt đầu chạy lại.');
    } catch (error) { toast(error.message); }
    finally { retryButton.disabled = false; }
    return;
  }
  const deleteButton = event.target.closest('[data-delete-kind]');
  if (deleteButton) {
    const kind = deleteButton.dataset.deleteKind;
    const ids = deleteButton.dataset.scope === 'all' ? state.tasks.filter(t => t.kind === kind).map(t => t.id) :
      [...selected[kind]].filter(id => taskById(id)?.kind === kind);
    if (!ids.length) { toast('Không có task để xóa'); return; }
    if (!confirm('Xóa ' + ids.length + ' task khỏi bảng và dừng theo dõi? Task chưa gửi sẽ không chạy; file đã lưu vẫn được giữ.')) return;
    try {
      const result = await api('/tasks/delete-selected', 'POST', {ids});
      selected[kind].clear();
      await refresh();
      toast('Đã xóa ' + result.deleted + ' task và dừng theo dõi.');
    } catch (error) { toast(error.message); }
    return;
  }
  const target = event.target.closest('[data-action]');
  if (!target) return;
  if (target.dataset.action === 'show-admin') {
    document.querySelector('.nav[data-view="admin"]').click();
  }
  if (target.dataset.action === 'check-account') {
    try {
      target.disabled = true;
      target.textContent = 'Đang kiểm tra…';
      const result = await api('/accounts/' + target.dataset.id + '/check', 'POST');
      await refresh();
      toast(result.status === 'valid' ? 'Muse đã xác nhận đăng nhập.' :
        result.status === 'expired' ? 'Cookie hết hạn. Hãy cập nhật cookie.' : 'Chưa kiểm tra được Muse; xem trạng thái tài khoản.');
    } catch (error) { toast(error.message); }
  }
});

// Update the initial state rendered by app.js once all overrides are installed.
refresh();
