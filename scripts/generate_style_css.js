const fs = require('fs');
const path = require('path');

const targetDir = 'd:/dự án antigravity/Xieng_Nuong_Be_Huyen';
const publicDir = path.join(targetDir, 'public');

const cssContent = `/* ========================================================
   XIÊNG NƯỚNG BÉ HUYỀN - POS DESIGN SYSTEM & STYLESHEET
   Aesthetics: Premium Dark Charcoal + Ember Flame Accents
   ======================================================== */

:root {
  --bg-main: #0c0e12;
  --bg-card: #15181e;
  --bg-card-hover: #1c212a;
  --bg-elevated: #222834;
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-active: rgba(255, 87, 34, 0.4);

  --flame-primary: #ff5722;
  --flame-secondary: #ff7a00;
  --flame-glow: rgba(255, 87, 34, 0.25);

  --color-free: #10b981;
  --color-free-bg: rgba(16, 185, 129, 0.12);
  --color-occupied: #ef4444;
  --color-occupied-bg: rgba(239, 68, 68, 0.15);
  --color-pending: #f59e0b;

  --text-main: #f3f4f6;
  --text-muted: #9ca3af;
  --text-dim: #6b7280;

  --font-sans: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --shadow-card: 0 4px 20px rgba(0, 0, 0, 0.4);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

body {
  font-family: var(--font-sans);
  background-color: var(--bg-main);
  background-image: 
    radial-gradient(circle at 10% 10%, rgba(255, 87, 34, 0.05) 0%, transparent 40%),
    radial-gradient(circle at 90% 90%, rgba(245, 158, 11, 0.04) 0%, transparent 40%);
  color: var(--text-main);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

/* ========================================================
   HEADER & TOP NAVIGATION
   ======================================================== */
.app-header {
  background: rgba(21, 24, 30, 0.85);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border-subtle);
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-icon {
  font-size: 28px;
  filter: drop-shadow(0 0 10px var(--flame-glow));
  animation: pulseFlame 2.5s infinite alternate;
}

@keyframes pulseFlame {
  0% { transform: scale(1); filter: drop-shadow(0 0 6px rgba(255, 87, 34, 0.3)); }
  100% { transform: scale(1.1); filter: drop-shadow(0 0 16px rgba(255, 87, 34, 0.6)); }
}

.brand-title {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0.5px;
  background: linear-gradient(90deg, #ff8a00, #ff5722);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.brand-sub {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 500;
}

.realtime-status {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(16, 185, 129, 0.1);
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.status-dot {
  width: 8px;
  height: 8px;
  background: var(--color-free);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--color-free);
  animation: blink 2s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.status-text {
  font-size: 11px;
  color: #a7f3d0;
  font-weight: 600;
}

/* Nav Tabs */
.nav-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(12, 14, 18, 0.6);
  padding: 4px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
}

.nav-tab {
  background: transparent;
  border: none;
  color: var(--text-muted);
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.nav-tab:hover {
  color: var(--text-main);
  background: rgba(255, 255, 255, 0.05);
}

.nav-tab.active {
  background: var(--flame-primary);
  color: #ffffff;
  box-shadow: 0 2px 12px var(--flame-glow);
}

.nav-tab.ai-tab.active {
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  box-shadow: 0 2px 14px rgba(139, 92, 246, 0.4);
}

.tab-badge {
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
}

/* Header Right */
.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.role-selector {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-card);
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-subtle);
}

.role-label {
  font-size: 11px;
  color: var(--text-dim);
}

.role-dropdown {
  background: transparent;
  border: none;
  color: var(--text-main);
  font-size: 12px;
  font-weight: 700;
  outline: none;
  cursor: pointer;
}

.btn-tool {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  color: var(--text-main);
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-tool:hover {
  background: var(--bg-card-hover);
  border-color: rgba(255, 255, 255, 0.2);
}

.btn-seed {
  background: rgba(245, 158, 11, 0.15);
  border-color: rgba(245, 158, 11, 0.3);
  color: #fbbf24;
}

.btn-seed:hover {
  background: rgba(245, 158, 11, 0.25);
}

/* ========================================================
   MAIN CONTENT & TABS
   ======================================================== */
.app-main {
  flex: 1;
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.tab-view {
  display: none;
  animation: fadeIn 0.25s ease-out;
}

.tab-view.active {
  display: block;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.view-title {
  font-size: 20px;
  font-weight: 800;
  color: var(--text-main);
  margin-bottom: 4px;
}

.view-desc {
  font-size: 13px;
  color: var(--text-muted);
}

/* Filter pills */
.filter-group {
  display: flex;
  gap: 6px;
  background: var(--bg-card);
  padding: 4px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
}

.filter-pill {
  background: transparent;
  border: none;
  color: var(--text-muted);
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-pill.active {
  background: var(--bg-elevated);
  color: var(--text-main);
}

.summary-chips {
  display: flex;
  gap: 10px;
}

.chip {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  padding: 8px 14px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.chip.highlight {
  border-color: rgba(255, 87, 34, 0.3);
  background: rgba(255, 87, 34, 0.08);
}

.chip-val {
  color: var(--flame-secondary);
  font-family: var(--font-mono);
  font-weight: 700;
}

/* ========================================================
   20 TABLES GRID LAYOUT
   ======================================================== */
.tables-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.table-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 180px;
  position: relative;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: var(--shadow-card);
  cursor: pointer;
}

.table-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.15);
  background: var(--bg-card-hover);
}

/* Status variants */
.table-card.status-empty {
  border-left: 4px solid var(--color-free);
}

.table-card.status-serving {
  border-left: 4px solid var(--color-occupied);
  background: linear-gradient(180deg, rgba(239, 68, 68, 0.08) 0%, var(--bg-card) 60%);
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.15);
}

.table-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.table-number {
  font-size: 18px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-status-tag {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-empty .table-status-tag {
  background: var(--color-free-bg);
  color: var(--color-free);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-serving .table-status-tag {
  background: var(--color-occupied-bg);
  color: var(--color-occupied);
  border: 1px solid rgba(239, 68, 68, 0.3);
  animation: pulseRed 2s infinite;
}

@keyframes pulseRed {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.table-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-bottom: 14px;
}

.table-amount {
  font-family: var(--font-mono);
  font-size: 26px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.5px;
}

.status-empty .table-amount {
  color: var(--text-dim);
  font-size: 22px;
}

.status-serving .table-amount {
  color: #fca5a5;
  text-shadow: 0 0 12px rgba(239, 68, 68, 0.4);
}

.table-meta {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
  display: flex;
  gap: 8px;
}

.table-actions {
  display: flex;
  gap: 8px;
}

.btn-table-action {
  flex: 1;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-subtle);
  background: var(--bg-elevated);
  color: var(--text-main);
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.15s ease;
}

.btn-table-action:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-table-action.pay-fast {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.4);
  color: #6ee7b7;
}

.btn-table-action.pay-fast:hover {
  background: var(--color-free);
  color: #000;
}

/* ========================================================
   REPORTS & METRICS CARDS
   ======================================================== */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.metric-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--shadow-card);
}

.metric-icon {
  font-size: 36px;
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.metric-body {
  display: flex;
  flex-direction: column;
}

.metric-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.5px;
}

.metric-num {
  font-family: var(--font-mono);
  font-size: 24px;
  font-weight: 800;
  color: #ffffff;
  margin: 4px 0 2px 0;
}

.metric-sub {
  font-size: 12px;
  color: var(--text-dim);
}

.highlight-profit {
  color: #10b981;
  text-shadow: 0 0 16px rgba(16, 185, 129, 0.3);
}

.payment-split-bar {
  display: flex;
  gap: 16px;
  background: var(--bg-card);
  padding: 14px 20px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.split-item {
  font-size: 14px;
  color: var(--text-muted);
}

.split-item strong {
  color: #ffffff;
  font-family: var(--font-mono);
}

/* ========================================================
   DATA TABLES
   ======================================================== */
.table-container {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-card);
}

.table-title-bar {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.table-title {
  font-size: 16px;
  font-weight: 700;
}

.table-badge {
  font-size: 12px;
  color: var(--flame-secondary);
  background: rgba(255, 122, 0, 0.1);
  padding: 4px 10px;
  border-radius: 20px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th {
  background: rgba(255, 255, 255, 0.02);
  padding: 12px 18px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  border-bottom: 1px solid var(--border-subtle);
}

.data-table td {
  padding: 14px 18px;
  font-size: 14px;
  border-bottom: 1px solid var(--border-subtle);
  color: var(--text-main);
}

.data-table tr:hover td {
  background: rgba(255, 255, 255, 0.02);
}

.text-right { text-align: right; }
.text-center { text-align: center; }

/* Finance Summary Boxes */
.finance-overview {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.finance-box {
  flex: 1;
  min-width: 220px;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.finance-box.net {
  background: rgba(16, 185, 129, 0.08);
  border-color: rgba(16, 185, 129, 0.3);
}

.fin-title {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 700;
  text-transform: uppercase;
}

.fin-val {
  font-family: var(--font-mono);
  font-size: 26px;
  font-weight: 800;
}

.finance-sign {
  font-size: 28px;
  font-weight: 800;
  color: var(--text-dim);
}

.net-val {
  color: #10b981;
}

/* ========================================================
   MODALS & DRAWERS
   ======================================================== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: fadeIn 0.2s ease;
}

.modal-overlay.open {
  display: flex;
}

.modal-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
  overflow: hidden;
}

.modal-card.order-modal-card {
  max-width: 1100px;
  height: 85vh;
}

.modal-card.small-card {
  max-width: 480px;
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-badge-table {
  background: var(--flame-primary);
  color: #fff;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 800;
}

.modal-time-label {
  font-size: 12px;
  color: var(--text-muted);
}

.btn-close-modal {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 26px;
  cursor: pointer;
  line-height: 1;
}

.btn-close-modal:hover {
  color: #fff;
}

/* Order Layout: Two Columns */
.order-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.menu-catalog {
  flex: 3;
  padding: 16px;
  overflow-y: auto;
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.menu-category-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.cat-pill {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  color: var(--text-muted);
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.cat-pill.active {
  background: var(--flame-primary);
  color: #fff;
  border-color: var(--flame-primary);
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}

.menu-item-card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
  transition: all 0.15s;
}

.menu-item-card:hover {
  border-color: var(--flame-primary);
  background: rgba(255, 87, 34, 0.08);
}

.item-icon {
  font-size: 26px;
}

.item-name {
  font-size: 14px;
  font-weight: 700;
}

.item-price {
  font-family: var(--font-mono);
  font-size: 15px;
  font-weight: 800;
  color: var(--flame-secondary);
}

.item-rapid-buttons {
  display: flex;
  gap: 4px;
  margin-top: 4px;
}

.rapid-btn {
  flex: 1;
  padding: 4px 0;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--border-subtle);
  color: var(--text-main);
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.rapid-btn:hover {
  background: var(--flame-primary);
  color: #fff;
}

/* Order Cart (Right Column) */
.order-cart {
  flex: 2;
  display: flex;
  flex-direction: column;
  background: rgba(12, 14, 18, 0.5);
}

.cart-header {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cart-items-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cart-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
}

.cart-item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cart-item-title {
  font-size: 13px;
  font-weight: 700;
}

.cart-item-price-unit {
  font-size: 11px;
  color: var(--text-muted);
}

.cart-item-ctrls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qty-btn {
  width: 28px;
  height: 28px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  color: var(--text-main);
  border-radius: var(--radius-sm);
  font-size: 16px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.qty-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.cart-item-qty {
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 800;
  min-width: 24px;
  text-align: center;
}

.cart-footer {
  padding: 16px;
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-card);
}

.cart-total-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.total-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-muted);
}

.total-value {
  font-family: var(--font-mono);
  font-size: 24px;
  font-weight: 800;
  color: var(--flame-secondary);
}

.cart-actions-row {
  display: flex;
  gap: 8px;
}

.btn-action {
  padding: 12px 18px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
  background: var(--bg-elevated);
  color: var(--text-main);
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-action.primary {
  background: var(--flame-primary);
  border-color: var(--flame-primary);
  color: #fff;
  box-shadow: 0 4px 14px var(--flame-glow);
}

.btn-action.checkout-btn {
  flex: 1;
  background: var(--color-free);
  border-color: var(--color-free);
  color: #0c0e12;
  font-size: 15px;
  font-weight: 800;
}

/* ========================================================
   CHECKOUT & PRINT BILL
   ======================================================== */
.checkout-layout {
  display: flex;
  gap: 20px;
  padding: 20px;
  overflow-y: auto;
}

.bill-preview {
  flex: 1;
  background: #ffffff;
  color: #000000;
  padding: 20px;
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 13px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.bill-store-name {
  text-align: center;
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 2px;
}

.bill-store-info {
  text-align: center;
  font-size: 11px;
  color: #444;
}

.bill-divider {
  text-align: center;
  margin: 6px 0;
  color: #666;
  font-weight: bold;
}

.bill-meta-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.bill-table {
  width: 100%;
  border-collapse: collapse;
  margin: 8px 0;
}

.bill-table th, .bill-table td {
  padding: 4px 0;
  font-size: 12px;
}

.bill-total-row {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  font-weight: 800;
  margin-top: 4px;
}

.bill-footer-msg {
  text-align: center;
  font-size: 11px;
  margin-top: 10px;
  font-style: italic;
}

/* Checkout Controls */
.checkout-controls {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.method-selector {
  display: flex;
  gap: 10px;
}

.method-card {
  flex: 1;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.method-card input {
  display: none;
}

.method-card.active {
  border-color: var(--flame-primary);
  background: rgba(255, 87, 34, 0.1);
}

.method-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.method-icon {
  font-size: 22px;
}

.method-text {
  font-size: 13px;
  font-weight: 700;
}

.cash-calc-box {
  background: var(--bg-elevated);
  border-radius: var(--radius-md);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.calc-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.input-money {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  color: #fff;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 16px;
  font-weight: 700;
  text-align: right;
  width: 160px;
}

.change-amount {
  font-family: var(--font-mono);
  font-size: 20px;
  color: #10b981;
}

.vietqr-box {
  background: var(--bg-elevated);
  border-radius: var(--radius-md);
  padding: 16px;
  text-align: center;
}

.qr-notice {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.qr-img-wrapper img {
  max-width: 220px;
  border-radius: var(--radius-sm);
  background: #fff;
  padding: 6px;
}

.qr-info-text {
  font-size: 12px;
  font-weight: 700;
  margin-top: 6px;
  color: #6ee7b7;
}

.checkout-footer-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: auto;
}

.confirm-btn {
  height: 52px;
  font-size: 16px;
}

/* ========================================================
   AI COPILOT CHAT VIEW
   ======================================================== */
.ai-container {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ai-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.ai-avatar {
  font-size: 32px;
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-title {
  font-size: 18px;
  font-weight: 800;
}

.ai-desc {
  font-size: 13px;
  color: var(--text-muted);
}

.ai-quick-prompts {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.ai-prompt-btn {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  color: var(--text-main);
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.ai-prompt-btn:hover {
  background: var(--bg-elevated);
  border-color: rgba(139, 92, 246, 0.4);
  color: #c4b5fd;
}

.ai-chat-box {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 20px;
  min-height: 380px;
  max-height: 500px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ai-message {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.ai-message.user {
  flex-direction: row-reverse;
}

.ai-message.user .msg-content {
  background: var(--flame-primary);
  color: #fff;
  border-radius: 14px 14px 2px 14px;
}

.ai-message.assistant .msg-content {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 14px 14px 14px 2px;
}

.msg-avatar {
  font-size: 20px;
}

.msg-content {
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.5;
  max-width: 80%;
}

.ai-input-bar {
  display: flex;
  gap: 10px;
}

.ai-input-bar input {
  flex: 1;
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  color: #fff;
  padding: 12px 18px;
  border-radius: var(--radius-md);
  font-size: 14px;
  outline: none;
}

.ai-input-bar input:focus {
  border-color: #8b5cf6;
}

/* Form Controls */
.form-group {
  margin-bottom: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
}

.form-control {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  color: #fff;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  outline: none;
}

.quick-exp-pills {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.exp-pill {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  color: var(--text-muted);
  padding: 4px 10px;
  border-radius: 14px;
  font-size: 12px;
  cursor: pointer;
}

.exp-pill:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.wifi-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 14px;
}

.qr-code-box img {
  max-width: 200px;
  border-radius: var(--radius-sm);
  background: #fff;
  padding: 8px;
}

.wifi-url-box {
  margin: 12px 0 6px 0;
}

.wifi-url-box code {
  background: var(--bg-elevated);
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--flame-secondary);
}

.wifi-tip {
  font-size: 11px;
  color: var(--text-dim);
}

/* ========================================================
   PRINT BILL FORMAT (K80 / K58)
   ======================================================== */
@media print {
  body * {
    visibility: hidden;
  }
  #printableBill, #printableBill * {
    visibility: visible;
  }
  #printableBill {
    position: absolute;
    left: 0;
    top: 0;
    width: 80mm;
    box-shadow: none;
    padding: 0;
    margin: 0;
  }
}

/* ========================================================
   MOBILE & RESPONSIVE
   ======================================================== */
@media (max-width: 900px) {
  .app-header {
    flex-wrap: wrap;
    padding: 10px 14px;
  }
  .nav-tabs {
    order: 3;
    width: 100%;
    overflow-x: auto;
  }
  .order-layout {
    flex-direction: column;
  }
  .menu-catalog {
    border-right: none;
    border-bottom: 1px solid var(--border-subtle);
    max-height: 45vh;
  }
  .checkout-layout {
    flex-direction: column;
  }
}
`;

fs.writeFileSync(path.join(publicDir, 'style.css'), cssContent, 'utf-8');
console.log('Created public/style.css successfully!');
