const fs = require('fs');
const path = require('path');

const targetDir = 'd:/dự án antigravity/Xieng_Nuong_Be_Huyen';
const publicDir = path.join(targetDir, 'public');

// ========================================================
// 1. UPDATE public/index.html
// ========================================================
const htmlPath = path.join(publicDir, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf-8');

// Remove the expenses tab from header navigation
html = html.replace(/<button class="nav-tab" data-tab="expenses" id="tabBtnExpenses">[\s\S]*?<\/button>\s*/, '');

// Remove the entire standalone view-expenses section
html = html.replace(/<!-- =+\s*-->\s*<!-- VIEW 3: QUẢN LÝ THU - CHI\s*-->\s*<!-- =+\s*-->\s*<section id="view-expenses" class="tab-view">[\s\S]*?<\/section>/, '');

// Also fallback replace if comment didn't match exactly
html = html.replace(/<section id="view-expenses" class="tab-view">[\s\S]*?<\/section>/, '');

// In #reportDetailView, enhance the Expenses Section title bar to include the "+ Thêm Khoản Chi" button
const oldExpTitleBar = `<div class="table-title-bar">
            <h3 class="table-title">💸 Danh Sách Các Khoản Chi Tiêu Trong Ngày Này</h3>
            <span class="table-badge" id="detExpTotalBadge">Tổng chi: 8.100.000đ</span>
          </div>`;

const newExpTitleBar = `<div class="table-title-bar">
            <div style="display:flex;align-items:center;gap:12px;">
              <h3 class="table-title">💸 Thu - Chi & Khoản Chi Tiêu Của Ngày Này</h3>
              <span class="table-badge" id="detExpTotalBadge">Tổng chi: 0đ</span>
            </div>
            <button class="btn-action primary" id="btnOpenAddExpenseFromReport" style="padding:6px 14px;font-size:12px;font-weight:800;">
              + Thêm Khoản Chi Cho Ngày Này
            </button>
          </div>`;

html = html.replace(oldExpTitleBar, newExpTitleBar);

// In Expenses Table in Detail View, add "Thao tác" column for deletion
html = html.replace(
  `<th width="180" class="text-right">Số Tiền</th>
              </tr>`,
  `<th width="180" class="text-right">Số Tiền</th>
                <th width="90" class="text-center">Thao tác</th>
              </tr>`
);

fs.writeFileSync(htmlPath, html, 'utf-8');
console.log('Updated index.html: Removed Thu - Chi tab and integrated into detailed report!');
