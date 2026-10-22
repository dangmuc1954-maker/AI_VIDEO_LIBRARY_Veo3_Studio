// Desktop queue enhancements share the state and API client in app.js.
function taskRefs(task) {
  try { return JSON.parse(task.refs_json || '[]'); } catch (_) { return []; }
}
function refImage(ref) {
  return '/api/refs/' + encodeURIComponent(String(ref).split(/[\\/]/).pop());
}
function taskById(id) {
  return state.tasks.find(task => task.id === id);
}
function accountById(id) {
  return state.accounts.find(account => account.id === id);
}
function taskMatches(task, search) {
  if (!search) return true;
  const account = accountById(task.account_id);
  return [task.prompt, task.id, task.batch_id, account && account.name]
    .some(value => String(value || '').toLocaleLowerCase().includes(search));
}
function refMarkup(ref, index, task) {
  const image = '<img src="' + esc(refImage(ref)) + '" alt="Ảnh ' + (index + 1) + '">';
  return '<span class="ref-tile" title="Ảnh tham chiếu ' + (index + 1) + '">' + image +
    (task.status === 'queued' ? '<button type="button" class="ref-apply" data-action="apply-batch-ref" data-id="' +
      esc(task.id) + '" data-index="' + index + '" title="Áp dụng ảnh này cho tất cả task đang chờ trong đợt">↗</button>' : '') +
    '</span>';
}
renderRows = function(kind) {
  const filter = $('filter-' + kind).value;
  const search = $('search-' + kind).value.trim().toLocaleLowerCase();
  let tasks = state.tasks.filter(task => task.kind === kind && taskMatches(task, search));
  if (filter === 'failed') tasks = tasks.filter(task => ['failed', 'needs_review'].includes(task.status));
  else if (filter !== 'all') tasks = tasks.filter(task => task.status === filter);
  $('' + kind + '-rows').innerHTML = tasks.length ? tasks.map(task => {
    const refs = taskRefs(task);
    const account = accountById(task.account_id);
    const checked = selected[kind].has(task.id) ? 'checked' : '';
    const id = esc(task.id);
    const canCancel = ['queued', 'opening_chat', 'sending', 'generating', 'downloading'].includes(task.status);
    const canRetry = ['failed', 'cancelled'].includes(task.status) && !task.thread_url;
    let actions = '<button class="icon-btn" data-action="edit" data-id="' + id + '" title="Xem và sửa task">◉</button>';
    if (task.thread_url) actions += '<button class="icon-btn" data-action="open-chat" data-id="' + id + '" title="Mở chat Muse">↗</button>';
    if (task.status === 'done') actions += '<a class="icon-btn" href="/api/files/' + id + '" download title="Tải thành phẩm">↓</a>';
    if (task.status === 'needs_review' && task.thread_url) actions += '<button class="icon-btn" data-action="recover" data-id="' + id + '" title="Quét lại chat">↻</button>';
    if (canRetry) actions += '<button class="icon-btn" data-action="retry" data-id="' + id + '" title="Gửi lại">↻</button>';
    if (canCancel) actions += '<button class="icon-btn" data-action="cancel" data-id="' + id + '" title="Hủy">×</button>';
    if (task.error) actions += '<button class="icon-btn" data-action="copyerror" data-id="' + id + '" title="Sao chép lỗi">▤</button>';
    const status = '<span class="status ' + esc(task.status) + '">' + (statusNames[task.status] || esc(task.status)) + '</span>';
    const result = task.status === 'done' ? '<button class="result-button" data-action="preview" data-id="' + id + '">▶ Xem ' +
      (kind === 'video' ? 'video' : 'ảnh') + '</button>' : '';
    return '<tr><td><div class="row-num"><input class="row-check" type="checkbox" data-id="' + id + '" ' + checked + '><span>' +
      task.seq + '</span></div></td><td><span class="type-pill">' +
      (kind === 'video' ? task.duration + 's · ' + esc(task.ratio) : 'Ảnh') +
      '</span></td><td><div class="ref-cell">' +
      refs.map((ref, index) => refMarkup(ref, index, task)).join('') +
      (task.status === 'queued' && refs.length < 6 ? '<button class="ref-add" data-action="add-task-ref" data-id="' + id +
        '" title="Thêm ảnh trực tiếp vào task">＋</button>' : '') +
      '</div><small class="ref-count">' + refs.length + '/6 ảnh</small></td><td><div class="prompt-cell" title="' +
      esc(task.prompt) + '">' + esc(task.prompt) + '</div><small class="task-meta">Đợt ' + esc(task.batch_id) + '</small></td><td>' +
      status + (account ? '<div class="task-meta">' + esc(account.name) + '</div>' : '') + result +
      '</td><td><div class="row-actions">' + actions + '</div></td></tr>';
  }).join('') : '<tr><td class="empty" colspan="6">Không có task phù hợp.</td></tr>';
};
renderAccounts = function() {
  const accounts = state.accounts;
  const busy = ['connecting_account', 'opening_chat', 'sending', 'generating', 'downloading'];
  $('account-count').textContent = accounts.length + ' tài khoản';
  $('account-stats').innerHTML =
    '<div class="stat"><small>Tài khoản</small><strong>' + accounts.length + '</strong></div>' +
    '<div class="stat"><small>Đang bật</small><strong>' + accounts.filter(a => a.enabled).length + '</strong></div>' +
    '<div class="stat"><small>Luồng đang chạy</small><strong>' + state.tasks.filter(t => busy.includes(t.status)).length + '</strong></div>' +
    '<div class="stat"><small>Thành phẩm</small><strong>' + state.tasks.filter(t => t.status === 'done').length + '</strong></div>';
  $('account-rows').innerHTML = accounts.length ? accounts.map(account => {
    const tasks = state.tasks.filter(task => task.account_id === account.id);
    const activeCount = tasks.filter(task => busy.includes(task.status)).length;
    const doneCount = tasks.filter(task => task.status === 'done').length;
    const errorCount = tasks.filter(task => ['failed', 'needs_review'].includes(task.status)).length;
    const login = (state.login_accounts || []).includes(account.id);
    return '<div class="account-row"><div class="account-mark">M</div><div class="account-data"><strong>' +
      esc(account.name) + '</strong><small>' + esc(account.profile_path) + '</small>' +
      '<div class="account-metrics"><span>↗ ' + activeCount + ' đang chạy</span><span>✓ ' + doneCount +
      ' hoàn tất</span><span>! ' + errorCount + ' cần xử lý</span></div></div>' +
      '<span class="status ' + (login ? 'generating' : account.enabled ? 'done' : 'cancelled') + '">' +
      (login ? 'Đang đăng nhập' : account.enabled ? 'Đang dùng' : 'Tạm khóa') + '</span><div class="account-actions">' +
      (login ? '<button class="btn secondary" data-action="finish-login" data-id="' + esc(account.id) +
        '">Hoàn tất đăng nhập</button>' :
        '<button class="btn secondary" data-action="login" data-id="' + esc(account.id) + '">Mở Muse</button>') +
      '<button class="btn secondary" data-action="cookie" data-id="' + esc(account.id) + '">Cookie</button>' +
      '<button class="btn secondary" data-action="toggle" data-id="' + esc(account.id) + '">' +
      (account.enabled ? 'Tắt' : 'Bật') + '</button></div></div>';
  }).join('') : '<p class="hint">Chưa có tài khoản. Hãy thêm tài khoản để chạy task.</p>';
};
renderEditRefs = function() {
  $('edit-ref-list').innerHTML = editRefs.map((ref, index) =>
    '<span class="edit-ref-tile"><img src="' + esc(refImage(ref)) + '" alt="Ảnh ' + (index + 1) + '">' +
    '<small>Ảnh ' + (index + 1) + '</small>' +
    (editing.status === 'queued' ? '<button type="button" class="icon-btn" data-action="remove-ref" data-index="' + index +
      '" title="Bỏ ảnh">×</button><button type="button" class="icon-btn" data-action="apply-edit-ref" data-index="' +
      index + '" title="Áp dụng cho cả đợt">↗</button>' : '') + '</span>'
  ).join('') + (editing.status === 'queued' ? '<small class="ref-count">' + editRefs.length + '/6 ảnh · ↗ áp dụng cho cả đợt</small>' : '');
};
function closePreview() {
  $('preview-media').innerHTML = '';
  $('preview-dialog').close();
}
function openPreview(task) {
  if (!task) return;
  const id = encodeURIComponent(task.id);
  const titleEl = $('preview-title');
  if (titleEl) titleEl.textContent = task.kind === 'video' ? 'Video · Task ' + task.seq : 'Ảnh · Task ' + task.seq;
  const promptEl = $('preview-prompt');
  if (promptEl) promptEl.textContent = task.prompt;
  const mediaEl = $('preview-media');
  if (mediaEl) {
    mediaEl.innerHTML = task.kind === 'video'
      ? '<video controls autoplay playsinline src="/api/preview/' + id + '"></video>'
      : '<img src="/api/preview/' + id + '" alt="Ảnh thành phẩm">';
  }
  const dlEl = $('preview-download');
  if (dlEl) {
    dlEl.href = '/api/files/' + id;
    dlEl.setAttribute('download', '');
  }
  const folderBtn = $('open-output-folder');
  if (folderBtn) folderBtn.dataset.id = task.id;
  const dialog = $('preview-dialog');
  if (dialog && typeof dialog.showModal === 'function') dialog.showModal();
}
async function addTaskReferences(task) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/png,image/jpeg,image/webp';
  input.multiple = true;
  input.onchange = async () => {
    try {
      const refs = taskRefs(task);
      if (refs.length + input.files.length > 6) throw Error('Tối đa 6 ảnh tham chiếu trong một task');
      const uploaded = await uploadFiles([...input.files]);
      await api('/tasks/' + task.id, 'PATCH', {prompt: task.prompt, refs: refs.concat(uploaded)});
      toast('Đã thêm ảnh vào task');
      refresh();
    } catch (error) { toast(error.message); }
  };
  input.click();
}
async function applyRefToBatch(task, ref) {
  const result = await api('/batches/' + task.batch_id + '/apply-ref', 'POST', {ref});
  toast('Đã áp dụng ảnh cho ' + result.updated + ' task đang chờ');
  refresh();
}
document.addEventListener('click', async event => {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;
  if (!['preview', 'add-task-ref', 'apply-batch-ref', 'apply-edit-ref', 'finish-login', 'open-chat'].includes(action)) return;
  try {
    const task = taskById(target.dataset.id);
    if (action === 'preview') openPreview(task);
    if (action === 'add-task-ref') await addTaskReferences(task);
    if (action === 'apply-batch-ref') await applyRefToBatch(task, taskRefs(task)[Number(target.dataset.index)]);
    if (action === 'apply-edit-ref') await applyRefToBatch(editing, editRefs[Number(target.dataset.index)]);
    if (action === 'finish-login') {
      const result = await api('/accounts/' + target.dataset.id + '/finish-login', 'POST');
      toast(result.authenticated ? 'Đăng nhập thành công. Các task sẽ chạy ẩn.' : 'Muse chưa xác nhận đăng nhập.');
      refresh();
    }
    if (action === 'open-chat' && task && task.thread_url) {
      if (window.pywebview && window.pywebview.api) await window.pywebview.api.open_muse(task.thread_url);
      else window.open(task.thread_url, '_blank', 'noopener');
    }
  } catch (error) { toast(error.message); }
});
for (const kind of ['video', 'image']) $('search-' + kind).addEventListener('input', () => renderRows(kind));
$('close-preview').onclick = closePreview;
$('preview-dialog').addEventListener('close', () => { $('preview-media').innerHTML = ''; });
$('open-output-folder').onclick = async () => {
  try { await api('/tasks/' + $('open-output-folder').dataset.id + '/open-folder', 'POST'); }
  catch (error) { toast(error.message); }
};
