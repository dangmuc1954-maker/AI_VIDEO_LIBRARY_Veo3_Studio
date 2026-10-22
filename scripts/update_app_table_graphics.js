const fs = require('fs');
const path = require('path');

const targetDir = 'd:/dự án antigravity/Xieng_Nuong_Be_Huyen';
const appJsPath = path.join(targetDir, 'public', 'app.js');

let appJs = fs.readFileSync(appJsPath, 'utf-8');

// SVG Generator Functions for Table Visuals
const svgHelpers = `
// Generate Professional Table Illustration (SVG)
function getTableIllustrationSvg(table, isServing) {
  if (isServing) {
    // ACTIVE / SERVING TABLE: Steaming charcoal skewer grill, plates of meat, beer glasses, vibrant dining atmosphere
    return \`
    <svg class="table-svg" viewBox="0 0 200 95" xmlns="http://www.w3.org/2000/svg">
      <!-- 4 Chairs around table (Wood with cushions) -->
      <rect x="22" y="28" width="12" height="38" rx="4" fill="#C28E58" stroke="#8C5C2E" stroke-width="1.5"/>
      <rect x="24" y="32" width="8" height="30" rx="3" fill="#E11D48"/>
      
      <rect x="166" y="28" width="12" height="38" rx="4" fill="#C28E58" stroke="#8C5C2E" stroke-width="1.5"/>
      <rect x="168" y="32" width="8" height="30" rx="3" fill="#E11D48"/>
      
      <rect x="68" y="6" width="38" height="12" rx="4" fill="#C28E58" stroke="#8C5C2E" stroke-width="1.5"/>
      <rect x="72" y="8" width="30" height="8" rx="3" fill="#E11D48"/>

      <rect x="68" y="78" width="38" height="12" rx="4" fill="#C28E58" stroke="#8C5C2E" stroke-width="1.5"/>
      <rect x="72" y="80" width="30" height="8" rx="3" fill="#E11D48"/>

      <!-- Main Wooden Dining Table -->
      <rect x="38" y="16" width="124" height="64" rx="14" fill="#DEB887" stroke="#A0522D" stroke-width="2.5"/>
      <rect x="42" y="20" width="116" height="56" rx="10" fill="#EED9B7"/>

      <!-- Center Charcoal BBQ Grill -->
      <rect x="80" y="26" width="40" height="44" rx="6" fill="#292524" stroke="#44403C" stroke-width="1.5"/>
      <!-- Glowing Embers & Grate lines -->
      <circle cx="92" cy="48" r="6" fill="#EF4444" opacity="0.8"/>
      <circle cx="108" cy="48" r="7" fill="#F59E0B" opacity="0.85"/>
      <line x1="84" y1="32" x2="116" y2="32" stroke="#78716C" stroke-width="1.5"/>
      <line x1="84" y1="38" x2="116" y2="38" stroke="#78716C" stroke-width="1.5"/>
      <line x1="84" y1="44" x2="116" y2="44" stroke="#78716C" stroke-width="1.5"/>
      <line x1="84" y1="50" x2="116" y2="50" stroke="#78716C" stroke-width="1.5"/>
      <line x1="84" y1="56" x2="116" y2="56" stroke="#78716C" stroke-width="1.5"/>
      <line x1="84" y1="62" x2="116" y2="62" stroke="#78716C" stroke-width="1.5"/>

      <!-- Skewers on Grill (Sizzling Meat) -->
      <line x1="77" y1="36" x2="118" y2="36" stroke="#FDE68A" stroke-width="1.5"/>
      <rect x="86" y="34" width="22" height="4" rx="2" fill="#B91C1C"/>
      <line x1="82" y1="48" x2="123" y2="48" stroke="#FDE68A" stroke-width="1.5"/>
      <rect x="90" y="46" width="22" height="4" rx="2" fill="#D97706"/>
      <line x1="77" y1="60" x2="118" y2="60" stroke="#FDE68A" stroke-width="1.5"/>
      <rect x="86" y="58" width="22" height="4" rx="2" fill="#15803D"/>

      <!-- Side Plates of Skewers & Drinks -->
      <!-- Left plate -->
      <ellipse cx="58" cy="48" rx="10" ry="14" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1"/>
      <line x1="50" y1="42" x2="66" y2="42" stroke="#B45309" stroke-width="1.5"/>
      <line x1="50" y1="48" x2="66" y2="48" stroke="#B91C1C" stroke-width="1.5"/>
      <line x1="50" y1="54" x2="66" y2="54" stroke="#D97706" stroke-width="1.5"/>

      <!-- Right: Cold Beer / Soft drink mugs -->
      <rect x="134" y="32" width="10" height="12" rx="2" fill="#FDE047" stroke="#CA8A04" stroke-width="1"/>
      <rect x="134" y="30" width="10" height="3" rx="1" fill="#FFFFFF"/>
      <rect x="134" y="52" width="10" height="12" rx="2" fill="#DC2626" stroke="#991B1B" stroke-width="1"/>

      <!-- Rising Hot Steam Wisps -->
      <path class="steam-path" d="M96 24 Q93 16 97 10 Q101 4 96 0" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
      <path class="steam-path" d="M104 22 Q107 14 103 8 Q99 2 105 -2" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
    </svg>
    \`;
  } else {
    // EMPTY / AVAILABLE TABLE: Clean wooden table, polished, sparkling clean icon, ready for guests
    return \`
    <svg class="table-svg" viewBox="0 0 200 95" xmlns="http://www.w3.org/2000/svg">
      <!-- 4 Chairs around table (Tucked in neatly) -->
      <rect x="25" y="28" width="10" height="38" rx="4" fill="#D6A56E" stroke="#9E6E3E" stroke-width="1.5"/>
      <rect x="165" y="28" width="10" height="38" rx="4" fill="#D6A56E" stroke="#9E6E3E" stroke-width="1.5"/>
      <rect x="75" y="8" width="38" height="10" rx="4" fill="#D6A56E" stroke="#9E6E3E" stroke-width="1.5"/>
      <rect x="75" y="78" width="38" height="10" rx="4" fill="#D6A56E" stroke="#9E6E3E" stroke-width="1.5"/>

      <!-- Main Clean Wooden Tabletop -->
      <rect x="38" y="16" width="124" height="64" rx="14" fill="#EAD4B4" stroke="#B8864E" stroke-width="2"/>
      <rect x="42" y="20" width="116" height="56" rx="10" fill="#FBF5EA"/>

      <!-- Center Table Number Stand / Clean Plate -->
      <circle cx="100" cy="48" r="16" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
      <circle cx="100" cy="48" r="11" fill="#FEF3C7" stroke="#F59E0B" stroke-width="1"/>
      <text x="100" y="52" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="bold" fill="#B45309" text-anchor="middle">\${table.id}</text>

      <!-- Sparkle / Clean badges -->
      <path d="M60 30 L62 34 L66 36 L62 38 L60 42 L58 38 L54 36 L58 34 Z" fill="#F59E0B" opacity="0.6"/>
      <path d="M140 60 L141 63 L144 64 L141 65 L140 68 L139 65 L136 64 L139 63 Z" fill="#10B981" opacity="0.7"/>
    </svg>
    \`;
  }
}
`;

// Replace renderTablesGrid implementation in app.js
const oldRenderRegex = /\/\/ =+\s*\/\/ 1\. RENDER 20 TABLES GRID[\s\S]*?function renderTablesGrid\(\)[\s\S]*?\n\}/;

const newRenderCode = `// ========================================================
// 1. RENDER 20 TABLES GRID (WITH PROFESSIONAL TABLE VISUALS)
// ========================================================
${svgHelpers}

function renderTablesGrid() {
  const grid = document.getElementById('tablesGrid');
  grid.innerHTML = '';

  let filteredTables = state.tables;
  if (state.activeFilter === 'serving') {
    filteredTables = state.tables.filter(t => t.status === 'serving');
  } else if (state.activeFilter === 'empty') {
    filteredTables = state.tables.filter(t => t.status === 'empty');
  }

  filteredTables.forEach(t => {
    const isServing = t.status === 'serving';
    const card = document.createElement('div');
    card.className = \`table-card status-\${t.status}\`;

    const itemCount = (t.items || []).reduce((s, it) => s + it.quantity, 0);
    const tableSvg = getTableIllustrationSvg(t, isServing);

    card.innerHTML = \`
      <div class="table-top">
        <div class="table-number">
          <span>\${t.name}</span>
        </div>
        <span class="table-status-tag">\${isServing ? '🔴 Có khách' : '🟢 Bàn trống'}</span>
      </div>

      <!-- Professional Restaurant Table Visual Graphic -->
      <div class="table-visual-container">
        \${tableSvg}
      </div>

      <div class="table-body">
        <div class="table-amount">\${formatMoney(t.totalAmount || 0)}</div>
        <div class="table-meta">
          <span>\${isServing ? \`⏰ \${t.openedAt || '--:--'}\` : '✨ Sẵn sàng đón khách'}</span>
          <span>\${isServing ? \`🍢 \${itemCount} món\` : ''}</span>
        </div>
      </div>

      <div class="table-actions">
        <button class="btn-table-action add-order" data-id="\${t.id}">
          ➕ Gọi Món
        </button>
        \${isServing ? \`
          <button class="btn-table-action pay-fast" data-id="\${t.id}">
            💳 Tính Tiền
          </button>
        \` : ''}
      </div>
    \`;

    // Click card or action
    card.addEventListener('click', (e) => {
      if (e.target.closest('.pay-fast')) {
        e.stopPropagation();
        openCheckoutModal(t.id);
      } else {
        openOrderModal(t.id);
      }
    });

    grid.appendChild(card);
  });
}`;

appJs = appJs.replace(oldRenderRegex, newRenderCode);
fs.writeFileSync(appJsPath, appJs, 'utf-8');
console.log('Updated public/app.js with Professional Table Visuals!');
