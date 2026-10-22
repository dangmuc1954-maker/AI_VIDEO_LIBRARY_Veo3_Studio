const fs = require('fs');
const path = require('path');

const targetDir = 'd:/dự án antigravity/Xieng_Nuong_Be_Huyen';
const cssPath = path.join(targetDir, 'public', 'style.css');

let css = fs.readFileSync(cssPath, 'utf-8');

const additionalCss = `
/* ========================================================
   SALES SESSION BAR & SHIFT CONTROLS
   ======================================================== */
.session-bar {
  background: #FFFFFF;
  border: 1.5px solid var(--gold-border);
  border-radius: var(--radius-lg);
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 16px;
  box-shadow: var(--shadow-card);
  flex-wrap: wrap;
}

.session-bar-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.session-date-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-elevated);
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--gold-border);
}

.session-label {
  font-size: 13px;
  font-weight: 800;
  color: var(--gold-dark);
}

.session-date-display {
  background: #FFFFFF;
  border: 1px solid var(--gold-border);
  border-radius: 4px;
  padding: 4px 8px;
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 800;
  color: var(--text-main);
  outline: none;
  width: 120px;
  text-align: center;
}

.session-status-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-subtle);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 800;
  color: var(--text-muted);
  border: 1px solid rgba(217, 119, 6, 0.15);
}

.session-status-pill.active {
  background: var(--color-free-bg);
  border-color: var(--color-free-border);
  color: #065f46;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #94A3B8;
}

.session-status-pill.active .status-indicator {
  background: var(--color-free);
  box-shadow: 0 0 8px var(--color-free);
  animation: pulseGreen 2s infinite;
}

@keyframes pulseGreen {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.session-time-chip {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.8);
  padding: 2px 8px;
  border-radius: 10px;
}

.session-bar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-session {
  padding: 10px 18px;
  border-radius: var(--radius-md);
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.btn-session.start {
  background: var(--color-free-bg);
  border-color: var(--color-free-border);
  color: #065f46;
}

.btn-session.start:hover {
  background: var(--color-free);
  color: #FFFFFF;
}

.btn-session.end {
  background: var(--bg-gold-tint);
  border-color: var(--gold-primary);
  color: var(--gold-dark);
}

.btn-session.end:hover {
  background: #FDE68A;
}

/* ========================================================
   DAILY DASHBOARDS HUB & CARDS
   ======================================================== */
.daily-dashboards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-top: 16px;
}

.daily-dashboard-card {
  background: #FFFFFF;
  border: 1.5px solid var(--gold-border);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: var(--shadow-card);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.daily-dashboard-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
  border-color: var(--gold-primary);
}

.daily-dashboard-card.today-card {
  border-color: var(--gold-primary);
  background: linear-gradient(180deg, var(--bg-elevated) 0%, #FFFFFF 30%);
}

.card-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.card-date-badge {
  font-size: 16px;
  font-weight: 800;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 6px;
}

.card-day-name {
  font-size: 12px;
  color: var(--gold-dark);
  background: var(--bg-gold-tint);
  padding: 3px 8px;
  border-radius: 12px;
  font-weight: 700;
}

.card-time-span {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 600;
  margin-bottom: 14px;
}

.card-finance-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  background: var(--bg-subtle);
  padding: 12px;
  border-radius: var(--radius-md);
  margin-bottom: 14px;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-item-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-muted);
}

.stat-item-num {
  font-family: var(--font-mono);
  font-size: 16px;
  font-weight: 800;
  color: var(--text-main);
}

.stat-item-num.rev {
  color: var(--gold-dark);
}

.stat-item-num.exp {
  color: #ef4444;
}

.card-net-profit-banner {
  background: var(--color-free-bg);
  border: 1px solid var(--color-free-border);
  padding: 10px 14px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.banner-label {
  font-size: 12px;
  font-weight: 800;
  color: #065f46;
}

.banner-profit {
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 800;
  color: var(--color-free);
}

.card-meta-chips {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 600;
  margin-bottom: 14px;
}

.btn-open-dashboard-detail {
  width: 100%;
  padding: 10px;
  border-radius: var(--radius-md);
  background: var(--bg-elevated);
  border: 1px solid var(--gold-border);
  color: var(--gold-dark);
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
}

.daily-dashboard-card:hover .btn-open-dashboard-detail {
  background: var(--gold-primary);
  color: #FFFFFF;
  border-color: var(--gold-primary);
}

/* ========================================================
   DETAIL VIEW STYLES
   ======================================================== */
.detail-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
  gap: 16px;
  flex-wrap: wrap;
}

.back-btn {
  background: var(--bg-subtle);
  border: 1px solid var(--gold-border);
  color: var(--gold-dark);
}

.back-btn:hover {
  background: var(--bg-elevated);
}

.session-summary-box {
  background: var(--bg-elevated);
  border: 1px solid var(--gold-border);
  border-radius: var(--radius-md);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sum-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: var(--text-main);
}

.sum-row.highlight {
  padding-top: 8px;
  border-top: 1px dashed var(--gold-border);
  margin-top: 4px;
}
`;

css += additionalCss;
fs.writeFileSync(cssPath, css, 'utf-8');
console.log('Appended Session and Daily Dashboard styles to public/style.css!');
