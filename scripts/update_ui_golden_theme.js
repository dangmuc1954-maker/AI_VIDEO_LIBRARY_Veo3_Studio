const fs = require('fs');
const path = require('path');

const targetDir = 'd:/dự án antigravity/Xieng_Nuong_Be_Huyen';
const publicDir = path.join(targetDir, 'public');

// ==========================================
// 1. REWRITE public/style.css with Warm Golden Theme
// ==========================================
const cssContent = `/* ========================================================
   XIÊNG NƯỚNG BÉ HUYỀN - GOLDEN APETITE DESIGN SYSTEM
   Theme: Warm Soft Golden Butter & Cream (Màu Vàng Nhẹ Tinh Tế)
   Professional Restaurant Table Visuals & Modern Aesthetics
   ======================================================== */

:root {
  /* Warm Soft Golden Palette */
  --bg-main: #FAF7F0;
  --bg-subtle: #F3ECE1;
  --bg-card: #FFFFFF;
  --bg-card-hover: #FFFCF7;
  --bg-elevated: #FFFBEB;
  --bg-gold-tint: #FEF3C7;

  /* Golden Brand Accents */
  --gold-primary: #F59E0B;
  --gold-secondary: #D97706;
  --gold-dark: #92400E;
  --gold-light: #FDE68A;
  --gold-border: rgba(217, 119, 6, 0.22);
  --gold-glow: rgba(245, 158, 11, 0.2);

  /* Status Colors */
  --color-free: #059669;
  --color-free-bg: #ECFDF5;
  --color-free-border: rgba(16, 185, 129, 0.35);

  --color-occupied: #E11D48;
  --color-occupied-bg: #FFF1F2;
  --color-occupied-border: rgba(225, 29, 72, 0.35);

  /* High Contrast Typography */
  --text-main: #1E293B;
  --text-muted: #64748B;
  --text-dim: #94A3B8;

  --font-sans: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 20px;

  --shadow-card: 0 4px 16px rgba(180, 130, 40, 0.07);
  --shadow-hover: 0 10px 28px rgba(180, 130, 40, 0.14);
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
    radial-gradient(circle at 15% 15%, rgba(245, 158, 11, 0.06) 0%, transparent 45%),
    radial-gradient(circle at 85% 85%, rgba(217, 119, 6, 0.05) 0%, transparent 45%);
  color: var(--text-main);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

/* ========================================================
   HEADER: WARM GOLDEN ACCENT
   ======================================================== */
.app-header {
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--gold-border);
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 10px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(180, 130, 40, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 18px;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-icon {
  font-size: 30px;
  background: var(--bg-gold-tint);
  width: 46px;
  height: 46px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px var(--gold-glow);
  border: 1px solid var(--gold-border);
}

.brand-title {
  font-size: 19px;
  font-weight: 800;
  letter-spacing: 0.3px;
  color: var(--gold-dark);
}

.brand-sub {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 600;
}

.realtime-status {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--color-free-bg);
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid var(--color-free-border);
}

.status-dot {
  width: 8px;
  height: 8px;
  background: var(--color-free);
  border-radius: 50%;
  box-shadow: 0 0 6px var(--color-free);
}

.status-text {
  font-size: 12px;
  color: #065f46;
  font-weight: 700;
}

/* Nav Tabs */
.nav-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-subtle);
  padding: 5px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(217, 119, 6, 0.12);
}

.nav-tab {
  background: transparent;
  border: none;
  color: var(--text-muted);
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.nav-tab:hover {
  color: var(--text-main);
  background: rgba(255, 255, 255, 0.6);
}

.nav-tab.active {
  background: #FFFFFF;
  color: var(--gold-dark);
  box-shadow: 0 2px 8px rgba(180, 130, 40, 0.12);
  border: 1px solid var(--gold-border);
}

.nav-tab.ai-tab.active {
  background: linear-gradient(135deg, #7C3AED, #DB2777);
  color: #FFFFFF;
  border-color: transparent;
}

.tab-badge {
  background: var(--bg-gold-tint);
  color: var(--gold-dark);
  padding: 2px 7px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 800;
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
  background: #FFFFFF;
  padding: 5px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--gold-border);
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
  background: #FFFFFF;
  border: 1px solid var(--gold-border);
  color: var(--text-main);
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-tool:hover {
  background: var(--bg-elevated);
  border-color: var(--gold-primary);
}

.btn-seed {
  background: var(--bg-gold-tint);
  border-color: var(--gold-primary);
  color: var(--gold-dark);
}

.btn-seed:hover {
  background: #FDE68A;
}

/* ========================================================
   MAIN CONTAINER
   ======================================================== */
.app-main {
  flex: 1;
  padding: 24px;
  max-width: 1440px;
  margin: 0 auto;
  width: 100%;
}

.tab-view {
  display: none;
  animation: fadeIn 0.2s ease-out;
}

.tab-view.active {
  display: block;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
  flex-wrap: wrap;
  gap: 14px;
}

.view-title {
  font-size: 21px;
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
  background: var(--bg-subtle);
  padding: 4px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(217, 119, 6, 0.12);
}

.filter-pill {
  background: transparent;
  border: none;
  color: var(--text-muted);
  padding: 6px 16px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-pill.active {
  background: #FFFFFF;
  color: var(--gold-dark);
  box-shadow: 0 2px 6px rgba(180, 130, 40, 0.1);
}

.summary-chips {
  display: flex;
  gap: 10px;
}

.chip {
  background: #FFFFFF;
  border: 1px solid var(--gold-border);
  padding: 8px 16px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  box-shadow: var(--shadow-card);
}

.chip.highlight {
  background: var(--bg-elevated);
  border-color: var(--gold-primary);
}

.chip-val {
  color: var(--gold-dark);
  font-family: var(--font-mono);
  font-weight: 800;
}

/* ========================================================
   TABLES GRID WITH PROFESSIONAL TABLE VISUALS
   ======================================================== */
.tables-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 18px;
}

.table-card {
  background: var(--bg-card);
  border: 1.5px solid rgba(217, 119, 6, 0.12);
  border-radius: var(--radius-lg);
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 250px;
  position: relative;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: var(--shadow-card);
  cursor: pointer;
  overflow: hidden;
}

.table-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
  border-color: var(--gold-primary);
}

/* Card Status Variants */
.table-card.status-empty {
  background: #FFFFFF;
  border-top: 4px solid var(--color-free);
}

.table-card.status-serving {
  background: #FFFFFF;
  border-top: 4px solid var(--color-occupied);
  box-shadow: 0 8px 24px rgba(225, 29, 72, 0.12);
}

/* Top bar inside card */
.table-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.table-number {
  font-size: 17px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-main);
}

.table-status-tag {
  font-size: 11px;
  font-weight: 800;
  padding: 3px 9px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.status-empty .table-status-tag {
  background: var(--color-free-bg);
  color: var(--color-free);
  border: 1px solid var(--color-free-border);
}

.status-serving .table-status-tag {
  background: var(--color-occupied-bg);
  color: var(--color-occupied);
  border: 1px solid var(--color-occupied-border);
  animation: pulseRose 2s infinite;
}

@keyframes pulseRose {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.65; }
}

/* ========================================================
   DEDICATED PROFESSIONAL TABLE GRAPHIC (SVG ILLUSTRATION)
   ======================================================== */
.table-visual-container {
  width: 100%;
  height: 95px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 4px 0 8px 0;
  position: relative;
}

.table-svg {
  width: 100%;
  max-width: 190px;
  height: 90px;
  filter: drop-shadow(0 4px 8px rgba(180, 130, 40, 0.12));
}

/* Steam animation for active grill */
.steam-path {
  animation: steamRise 2s infinite ease-out;
  transform-origin: center;
}

@keyframes steamRise {
  0% { opacity: 0.2; transform: translateY(2px) scale(0.9); }
  50% { opacity: 0.8; transform: translateY(-4px) scale(1.05); }
  100% { opacity: 0; transform: translateY(-8px) scale(1.15); }
}

/* Amount & Meta */
.table-body {
  text-align: center;
  margin-bottom: 12px;
}

.table-amount {
  font-family: var(--font-mono);
  font-size: 24px;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.5px;
}

.status-empty .table-amount {
  color: #94A3B8;
  font-size: 18px;
}

.status-serving .table-amount {
  color: var(--color-occupied);
  background: var(--color-occupied-bg);
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  display: inline-block;
  border: 1px solid var(--color-occupied-border);
}

.table-meta {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: 600;
}

.table-actions {
  display: flex;
  gap: 8px;
}

.btn-table-action {
  flex: 1;
  padding: 9px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--gold-border);
  background: var(--bg-elevated);
  color: var(--gold-dark);
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.15s ease;
}

.btn-table-action:hover {
  background: #FDE68A;
  border-color: var(--gold-primary);
}

.btn-table-action.pay-fast {
  background: var(--color-free-bg);
  border-color: var(--color-free-border);
  color: #065f46;
}

.btn-table-action.pay-fast:hover {
  background: var(--color-free);
  color: #FFFFFF;
}

/* ========================================================
   REPORTS & METRICS CARDS
   ======================================================== */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 22px;
}

.metric-card {
  background: #FFFFFF;
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--shadow-card);
}

.metric-icon {
  font-size: 34px;
  width: 58px;
  height: 58px;
  background: var(--bg-gold-tint);
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
  font-weight: 800;
  color: var(--text-muted);
  letter-spacing: 0.5px;
}

.metric-num {
  font-family: var(--font-mono);
  font-size: 24px;
  font-weight: 800;
  color: var(--text-main);
  margin: 4px 0 2px 0;
}

.metric-sub {
  font-size: 12px;
  color: var(--text-muted);
}

.highlight-profit {
  color: var(--color-free);
}

.payment-split-bar {
  display: flex;
  gap: 20px;
  background: #FFFFFF;
  padding: 14px 22px;
  border-radius: var(--radius-md);
  border: 1px solid var(--gold-border);
  margin-bottom: 24px;
  flex-wrap: wrap;
  box-shadow: var(--shadow-card);
}

.split-item {
  font-size: 14px;
  color: var(--text-muted);
  font-weight: 600;
}

.split-item strong {
  color: var(--text-main);
  font-family: var(--font-mono);
  font-weight: 800;
}

/* ========================================================
   DATA TABLES
   ======================================================== */
.table-container {
  background: #FFFFFF;
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-card);
}

.table-title-bar {
  padding: 16px 22px;
  border-bottom: 1px solid rgba(217, 119, 6, 0.12);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-card);
}

.table-title {
  font-size: 16px;
  font-weight: 800;
  color: var(--text-main);
}

.table-badge {
  font-size: 12px;
  color: var(--gold-dark);
  background: var(--bg-gold-tint);
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 700;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.data-table th {
  background: var(--bg-elevated);
  padding: 12px 20px;
  font-size: 12px;
  font-weight: 800;
  color: var(--gold-dark);
  text-transform: uppercase;
  border-bottom: 1px solid rgba(217, 119, 6, 0.12);
}

.data-table td {
  padding: 14px 20px;
  font-size: 14px;
  border-bottom: 1px solid rgba(217, 119, 6, 0.08);
  color: var(--text-main);
}

.data-table tr:hover td {
  background: #FFFCF7;
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
  background: #FFFFFF;
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: var(--shadow-card);
}

.finance-box.net {
  background: var(--color-free-bg);
  border-color: var(--color-free-border);
}

.fin-title {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 800;
  text-transform: uppercase;
}

.fin-val {
  font-family: var(--font-mono);
  font-size: 26px;
  font-weight: 800;
  color: var(--text-main);
}

.finance-sign {
  font-size: 28px;
  font-weight: 800;
  color: var(--text-dim);
}

.net-val {
  color: var(--color-free);
}

/* ========================================================
   MODALS & DRAWERS
   ======================================================== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(30, 41, 59, 0.45);
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
  background: #FFFFFF;
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 50px rgba(180, 130, 40, 0.16);
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
  padding: 16px 22px;
  border-bottom: 1px solid var(--gold-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-elevated);
}

.modal-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-badge-table {
  background: var(--gold-primary);
  color: #FFFFFF;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 800;
}

.modal-time-label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 600;
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
  color: var(--text-main);
}

/* Order Layout: Two Columns */
.order-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.menu-catalog {
  flex: 3;
  padding: 18px;
  overflow-y: auto;
  border-right: 1px solid rgba(217, 119, 6, 0.12);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.menu-category-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.cat-pill {
  background: var(--bg-subtle);
  border: 1px solid rgba(217, 119, 6, 0.12);
  color: var(--text-muted);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.cat-pill.active {
  background: var(--gold-primary);
  color: #FFFFFF;
  border-color: var(--gold-primary);
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 14px;
}

.menu-item-card {
  background: #FFFFFF;
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-md);
  padding: 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: var(--shadow-card);
}

.menu-item-card:hover {
  border-color: var(--gold-primary);
  background: var(--bg-elevated);
}

.item-icon {
  font-size: 28px;
}

.item-name {
  font-size: 14px;
  font-weight: 800;
  color: var(--text-main);
}

.item-price {
  font-family: var(--font-mono);
  font-size: 15px;
  font-weight: 800;
  color: var(--gold-dark);
}

.item-rapid-buttons {
  display: flex;
  gap: 5px;
  margin-top: 4px;
}

.rapid-btn {
  flex: 1;
  padding: 5px 0;
  background: var(--bg-gold-tint);
  border: 1px solid var(--gold-border);
  color: var(--gold-dark);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

.rapid-btn:hover {
  background: var(--gold-primary);
  color: #FFFFFF;
}

/* Order Cart (Right Column) */
.order-cart {
  flex: 2;
  display: flex;
  flex-direction: column;
  background: #FCFAF6;
}

.cart-header {
  padding: 14px 18px;
  border-bottom: 1px solid rgba(217, 119, 6, 0.12);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cart-items-list {
  flex: 1;
  overflow-y: auto;
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cart-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #FFFFFF;
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
}

.cart-item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cart-item-title {
  font-size: 13px;
  font-weight: 800;
  color: var(--text-main);
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
  width: 30px;
  height: 30px;
  background: var(--bg-gold-tint);
  border: 1px solid var(--gold-border);
  color: var(--gold-dark);
  border-radius: var(--radius-sm);
  font-size: 16px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.qty-btn:hover {
  background: var(--gold-primary);
  color: #FFFFFF;
}

.cart-item-qty {
  font-family: var(--font-mono);
  font-size: 15px;
  font-weight: 800;
  min-width: 26px;
  text-align: center;
  color: var(--text-main);
}

.cart-footer {
  padding: 18px;
  border-top: 1px solid var(--gold-border);
  background: #FFFFFF;
}

.cart-total-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.total-label {
  font-size: 13px;
  font-weight: 800;
  color: var(--text-muted);
}

.total-value {
  font-family: var(--font-mono);
  font-size: 26px;
  font-weight: 800;
  color: var(--color-occupied);
}

.cart-actions-row {
  display: flex;
  gap: 10px;
}

.btn-action {
  padding: 12px 20px;
  border-radius: var(--radius-md);
  border: 1px solid var(--gold-border);
  background: #FFFFFF;
  color: var(--text-main);
  font-family: inherit;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-action.primary {
  background: var(--gold-primary);
  border-color: var(--gold-primary);
  color: #FFFFFF;
  box-shadow: 0 4px 14px var(--gold-glow);
}

.btn-action.checkout-btn {
  flex: 1;
  background: var(--color-free);
  border-color: var(--color-free);
  color: #FFFFFF;
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
  background: #FFFFFF;
  color: #000000;
  padding: 20px;
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 13px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #E2E8F0;
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
  background: var(--bg-card);
  border: 1.5px solid var(--gold-border);
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
  border-color: var(--gold-primary);
  background: var(--bg-elevated);
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
  font-weight: 800;
}

.cash-calc-box {
  background: var(--bg-elevated);
  border: 1px solid var(--gold-border);
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
  background: #FFFFFF;
  border: 1.5px solid var(--gold-border);
  color: var(--text-main);
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 16px;
  font-weight: 800;
  text-align: right;
  width: 170px;
}

.change-amount {
  font-family: var(--font-mono);
  font-size: 20px;
  color: var(--color-free);
  font-weight: 800;
}

.vietqr-box {
  background: var(--bg-elevated);
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-md);
  padding: 16px;
  text-align: center;
}

.qr-notice {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 8px;
  font-weight: 600;
}

.qr-img-wrapper img {
  max-width: 210px;
  border-radius: var(--radius-sm);
  background: #fff;
  padding: 6px;
  border: 1px solid var(--gold-border);
}

.qr-info-text {
  font-size: 12px;
  font-weight: 800;
  margin-top: 6px;
  color: var(--gold-dark);
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
  max-width: 920px;
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
  background: linear-gradient(135deg, #7C3AED, #DB2777);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.ai-title {
  font-size: 19px;
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
  background: #FFFFFF;
  border: 1px solid var(--gold-border);
  color: var(--gold-dark);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: var(--shadow-card);
}

.ai-prompt-btn:hover {
  background: var(--bg-elevated);
  border-color: var(--gold-primary);
}

.ai-chat-box {
  background: #FFFFFF;
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-lg);
  padding: 20px;
  min-height: 380px;
  max-height: 500px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: var(--shadow-card);
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
  background: var(--gold-primary);
  color: #FFFFFF;
  border-radius: 14px 14px 2px 14px;
}

.ai-message.assistant .msg-content {
  background: var(--bg-elevated);
  border: 1px solid var(--gold-border);
  border-radius: 14px 14px 14px 2px;
  color: var(--text-main);
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
  background: #FFFFFF;
  border: 1.5px solid var(--gold-border);
  color: var(--text-main);
  padding: 12px 18px;
  border-radius: var(--radius-md);
  font-size: 14px;
  outline: none;
  font-weight: 600;
}

.ai-input-bar input:focus {
  border-color: var(--gold-primary);
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
  font-weight: 800;
  color: var(--text-muted);
}

.form-control {
  background: #FFFFFF;
  border: 1.5px solid var(--gold-border);
  color: var(--text-main);
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  outline: none;
  font-weight: 600;
}

.quick-exp-pills {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.exp-pill {
  background: var(--bg-gold-tint);
  border: 1px solid var(--gold-border);
  color: var(--gold-dark);
  padding: 5px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.exp-pill:hover {
  background: var(--gold-primary);
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
  border: 1px solid var(--gold-border);
}

.wifi-url-box {
  margin: 12px 0 6px 0;
}

.wifi-url-box code {
  background: var(--bg-elevated);
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--gold-dark);
  font-weight: 800;
  border: 1px solid var(--gold-border);
}

.wifi-tip {
  font-size: 11px;
  color: var(--text-dim);
}

/* ========================================================
   PRINT BILL FORMAT
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
   MOBILE RESPONSIVE
   ======================================================== */
@media (max-width: 900px) {
  .app-header {
    flex-wrap: wrap;
    padding: 10px 16px;
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
    border-bottom: 1px solid var(--gold-border);
    max-height: 45vh;
  }
  .checkout-layout {
    flex-direction: column;
  }
}
`;

fs.writeFileSync(path.join(publicDir, 'style.css'), cssContent, 'utf-8');
console.log('Updated public/style.css with Warm Golden Theme!');
