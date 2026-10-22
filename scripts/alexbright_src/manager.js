// Fixed desktop workspace, account manager and detailed task progress.
const accountPage = $('view-accounts');
accountPage.innerHTML =
  '<div class="page-head"><div><div class="eyebrow">ACCOUNT CONTROL</div><h1>Quản lý tài khoản Muse</h1>' +
  '<p>Mỗi tài khoản dùng một profile riêng. Theo dõi luồng và cập nhật đăng nhập tại đây.</p></div>' +
  '<button class="btn primary" id="open-account-dialog">＋ Thêm tài khoản</button></div>' +
  '<section class="stats" id="account-stats"></section>' +
  '<section class="card account-manager"><div class="section-head"><div><h2>Danh sách tài khoản</h2>' +
  '<span class="badge" id="account-count">0 tài khoản</span></div></div>' +
  '<div class="table-wrap"><table class="account-table"><thead><tr><th>Tài khoản</th><th>Trạng thái</th>' +
  '<th>Task</th><th>Đang chạy</th><th>Hoàn tất</th><th>Cần xử lý</th><th>Ngày thêm</th>' +
  '<th>Thao tác</th></tr></thead><tbody id="account-rows"></tbody></table></div></section>';
document.body.insertAdjacentHTML('beforeend',
  '<dialog id="manager-account-dialog"><div class="modal"><div class="section-head">' +
  '<h2 id="manager-account-title">Thêm tài khoản Muse</h2>' +
  '<button class="icon-btn" type="button" id="close-manager-account">×</button></div>' +
  '<label>Tên tài khoản<input id="manager-account-name" maxlength="80" placeholder="Muse 01"></label>' +
  '<label id="manager-profile-label">Profile có sẵn (tùy chọn)' +
  '<input id="manager-account-profile" placeholder="E:\\...\\muse_profile"></label>' +
  '<label>Cookie Muse (tùy chọn)<textarea id="manager-account-cookie" rows="5" ' +
  'placeholder="name=value; name2=value2"></textarea></label>' +
  '<p class="hint">Cookie chỉ được đưa vào profile cục bộ. Để trống nếu muốn mở Muse và đăng nhập thủ công.</p>' +
  '<div class="modal-actions"><button class="btn secondary" type="button" id="cancel-manager-account">Đóng</button>' +
  '<button class="btn primary" type="button" id="save-manager-account">Lưu tài khoản</button></div></div></dialog>');
let editingAccountId = null;
function openAccountDialog(account) {
  editingAccountId = account ? account.id : null;
  $('manager-account-title').textContent = account ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản Muse';
  $('manager-account-name').value = account ? account.name : '';
  $('manager-account-profile').value = '';
  $('manager-account-cookie').value = '';
  $('manager-profile-label').classList.toggle('hidden', !!account);
  $('manager-account-dialog').showModal();
  $('manager-account-name').focus();
}
function closeAccountDialog() { $('manager-account-dialog').close(); }
$('open-account-dialog').onclick = () => openAccountDialog(null);
$('close-manager-account').onclick = closeAccountDialog;
$('cancel-manager-account').onclick = closeAccountDialog;
$('save-manager-account').onclick = async () => {
  const button = $('save-manager-account');
  const name = $('manager-account-name').value.trim();
  const cookie = $('manager-account-cookie').value.trim();
  if (!name) { toast('Hãy nhập tên tài khoản'); return; }
  button.disabled = true;
  try {
    let id = editingAccountId;
    if (id) {
      await api('/accounts/' + id, 'PATCH', {name});
    } else {
      const profile = $('manager-account-profile').value.trim();
      const created = await api('/accounts', 'POST', {name, profile_path: profile || null});
      id = created.id;
    }
    closeAccountDialog();
    refresh();
    if (cookie) {
      try {
        const result = await api('/accounts/' + id + '/cookies', 'POST', {header: cookie});
        toast(result.authenticated ? 'Đã lưu tài khoản và xác nhận đăng nhập Muse' :
          'Đã lưu tài khoản và cookie; Muse chưa xác nhận đăng nhập');
      } catch (error) {
        toast('Đã lưu tài khoản, nhưng cookie lỗi: ' + error.message);
      }
    } else {
      toast('Đã lưu tài khoản');
    }
  } catch (error) { toast(error.message); }
  finally { button.disabled = false; refresh(); }
};
renderAccounts = function() {
  const accounts = state.accounts;
  const busy = ['connecting_account', 'opening_chat', 'sending', 'generating', 'downloading'];
  $('account-count').textContent = accounts.length + ' tài khoản';
  $('account-stats').innerHTML =
    '<div class="stat"><small>Tổng tài khoản</small><strong>' + accounts.length + '</strong></div>' +
    '<div class="stat"><small>Đang bật</small><strong>' + accounts.filter(a => a.enabled).length + '</strong></div>' +
    '<div class="stat"><small>Luồng đang chạy</small><strong>' + state.tasks.filter(t => busy.includes(t.status)).length + '</strong></div>' +
    '<div class="stat"><small>Video / ảnh hoàn tất</small><strong>' + state.tasks.filter(t => t.status === 'done').length + '</strong></div>';
  $('account-rows').innerHTML = accounts.length ? accounts.map(account => {
    const tasks = state.tasks.filter(task => task.account_id === account.id);
    const activeCount = tasks.filter(task => busy.includes(task.status)).length;
    const doneCount = tasks.filter(task => task.status === 'done').length;
    const errorCount = tasks.filter(task => ['failed', 'needs_review'].includes(task.status)).length;
    const login = (state.login_accounts || []).includes(account.id);
    const id = esc(account.id);
    const created = account.created_at ? new Date(account.created_at).toLocaleDateString('vi-VN') : '—';
    return '<tr><td><div class="manager-account-identity"><span class="account-mark">M</span><span><strong>' +
      esc(account.name) + '</strong><small>' + esc(account.profile_path) + '</small></span></div></td>' +
      '<td><span class="status ' + (login ? 'generating' : account.enabled ? 'done' : 'cancelled') + '">' +
      (login ? 'Đang đăng nhập' : account.enabled ? 'Đang dùng' : 'Tạm khóa') + '</span></td>' +
      '<td><b>' + tasks.length + '</b></td><td><b class="metric-active">' + activeCount +
      '</b></td><td><b class="metric-done">' + doneCount + '</b></td><td><b class="metric-error">' +
      errorCount + '</b></td><td>' + esc(created) + '</td><td><div class="manager-account-actions">' +
      (login ? '<button class="small-action" data-action="finish-login" data-id="' + id + '">Hoàn tất login</button>' :
        '<button class="small-action" data-action="login" data-id="' + id + '">Mở Muse</button>') +
      '<button class="small-action" data-action="edit-account" data-id="' + id + '">Sửa / Cookie</button>' +
      '<button class="small-action" data-action="toggle" data-id="' + id + '">' +
      (account.enabled ? 'Tắt' : 'Bật') + '</button>' +
      '<button class="small-action danger" data-action="remove-account" data-id="' + id +
      '">Xóa</button></div></td></tr>';
  }).join('') : '<tr><td colspan="8" class="empty">Chưa có tài khoản. Bấm “Thêm tài khoản” để bắt đầu.</td></tr>';
};
const previousRenderRows = renderRows;
const progressLabels = {
  queued: 'Chờ chạy',
  connecting_account: 'Đang kết nối tài khoản',
  opening_chat: 'Đang mở chat phụ',
  sending: 'Đang gửi prompt',
  generating: 'Muse đang tạo',
  downloading: 'Đang tải thành phẩm',
  done: 'Hoàn tất',
  failed: 'Lỗi',
  needs_review: 'Cần kiểm tra',
  cancelled: 'Đã hủy'
};
renderRows = function(kind) {
  previousRenderRows(kind);
  const rows = [...$(kind + '-rows').querySelectorAll('tr')];
  for (const row of rows) {
    const eye = row.querySelector('[data-action="edit"]');
    if (!eye) continue;
    const task = taskById(eye.dataset.id);
    if (!task) continue;
    eye.textContent = '👁';
    eye.title = 'Xem / sửa prompt và ảnh';
    eye.classList.add('prompt-eye');
    const promptCell = row.cells[3];
    promptCell.insertBefore(eye, promptCell.querySelector('.task-meta'));
    const progress = row.cells[4];
    const badge = progress.querySelector('.status');
    if (badge) badge.textContent = progressLabels[task.status] || task.status;
    if (task.account_name && !progress.querySelector('.task-meta')) {
      progress.insertAdjacentHTML('beforeend', '<div class="task-meta">' + esc(task.account_name) + '</div>');
    }
    if (['generating', 'downloading'].includes(task.status) && task.submitted_at) {
      const deadline = Date.parse(task.submitted_at) + Number(task.timeout_minutes) * 60000;
      progress.insertAdjacentHTML('beforeend',
        '<div class="task-countdown" data-deadline="' + deadline + '">Còn --:--</div>');
    }
    if (task.status === 'done') {
      progress.querySelector('.result-button')?.remove();
      const previewUrl = '/api/preview/' + encodeURIComponent(task.id);
      progress.insertAdjacentHTML('beforeend',
        '<button class="task-media-button" data-action="preview" data-id="' + esc(task.id) +
        '" title="Xem thành phẩm">' + (kind === 'video' ?
          '<img src="/api/poster/' + encodeURIComponent(task.id) + '" alt="Video hoàn tất">' :
          '<img src="' + previewUrl + '" alt="Ảnh hoàn tất">') +
        '<span>▶ Xem ' + (kind === 'video' ? 'video' : 'ảnh') + '</span></button>');
    }
    const actions = row.querySelector('.row-actions');
    for (const name of ['cancel', 'retry', 'recover', 'copyerror']) {
      const button = actions.querySelector('[data-action="' + name + '"]');
      if (button) {
        button.textContent = {cancel: 'Hủy', retry: 'Gửi lại', recover: 'Lấy lại', copyerror: 'Copy lỗi'}[name];
        button.classList.add('small-action');
      }
    }
    if (['done', 'needs_review', 'failed', 'cancelled'].includes(task.status) &&
        !actions.querySelector('[data-action="retry"]')) {
      actions.insertAdjacentHTML('beforeend',
        '<button class="small-action" data-action="resend-task" data-id="' + esc(task.id) + '">Gửi lại</button>');
    }
    if (!['connecting_account', 'opening_chat', 'sending', 'generating', 'downloading'].includes(task.status)) {
      actions.insertAdjacentHTML('beforeend',
        '<button class="small-action danger" data-action="delete-task" data-id="' + esc(task.id) + '">Xóa</button>');
    }
  }
  updateCountdowns();
};
function updateCountdowns() {
  for (const element of document.querySelectorAll('.task-countdown')) {
    const seconds = Math.max(0, Math.ceil((Number(element.dataset.deadline) - Date.now()) / 1000));
    element.textContent = 'Còn ' + String(Math.floor(seconds / 60)).padStart(2, '0') + ':' +
      String(seconds % 60).padStart(2, '0');
    element.classList.toggle('countdown-low', seconds < 60);
  }
}
setInterval(updateCountdowns, 1000);
document.addEventListener('click', async event => {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;
  const id = target.dataset.id;
  try {
    if (action === 'edit-account') openAccountDialog(accountById(id));
    if (action === 'remove-account') {
      const account = accountById(id);
      if (!confirm('Xóa ' + account.name + ' khỏi danh sách? Profile và lịch sử vẫn được giữ.')) return;
      await api('/accounts/' + id, 'DELETE');
      toast('Đã xóa tài khoản khỏi danh sách');
      refresh();
    }
    if (action === 'delete-task') {
      if (!confirm('Xóa task khỏi bảng? File thành phẩm vẫn được giữ trong thư mục.')) return;
      await api('/tasks/' + id, 'DELETE');
      toast('Đã xóa task khỏi bảng');
      refresh();
    }
    if (action === 'resend-task') {
      const task = taskById(id);
      if (task.status === 'done') {
        if (!confirm('Tạo một task mới từ thành phẩm này? Task và file cũ vẫn được giữ.')) return;
        await api('/tasks/' + id + '/duplicate', 'POST');
        toast('Đã thêm task mới vào hàng đợi');
      } else {
        const uncertain = task.status === 'needs_review' || !!task.thread_url;
        if (uncertain && !confirm('Prompt này có thể đã được Muse nhận. Gửi lại có thể tạo trùng. Vẫn đưa chính task này về Đang chờ và chạy lại?')) return;
        await api('/tasks/retry-selected', 'POST', {ids: [id], confirm_possible_duplicate: uncertain});
        toast('Đã đưa task về Đang chờ và bắt đầu chạy lại');
      }
      refresh();
    }
  } catch (error) { toast(error.message); }
});
