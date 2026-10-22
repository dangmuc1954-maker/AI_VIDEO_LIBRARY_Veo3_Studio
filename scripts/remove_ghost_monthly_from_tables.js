const fs = require('fs');
const path = require('path');

const targetDir = 'd:/dự án antigravity/Xieng_Nuong_Be_Huyen';
const htmlPath = path.join(targetDir, 'public', 'index.html');

let html = fs.readFileSync(htmlPath, 'utf-8');

// Find the tablesGrid in #view-tables
const tablesGridEndStr = '<!-- Rendered dynamically by JavaScript (Tables 01 to 20) -->\n      </div>';
const tablesGridIdx = html.indexOf(tablesGridEndStr);

if (tablesGridIdx === -1) {
  console.error('Could not find tablesGridEndStr');
  process.exit(1);
}

// Find the start of #view-reports
const viewReportsStartStr = '<section id="view-reports" class="tab-view">';
const viewReportsIdx = html.indexOf(viewReportsStartStr);

if (viewReportsIdx === -1) {
  console.error('Could not find viewReportsStartStr');
  process.exit(1);
}

// The content between tablesGridEndStr and viewReportsStartStr should simply be:
// \n    </section>\n\n    <!-- ============================================== -->\n    <!-- VIEW 2: BÁO CÁO & TỔNG MÓN                    -->\n    <!-- ============================================== -->\n    
const cleanCut = `\n    </section>\n\n    <!-- ============================================== -->\n    <!-- VIEW 2: BÁO CÁO & TỔNG MÓN                    -->\n    <!-- ============================================== -->\n    `;

const before = html.slice(0, tablesGridIdx + tablesGridEndStr.length);
const after = html.slice(viewReportsIdx);

html = before + cleanCut + after;

fs.writeFileSync(htmlPath, html, 'utf-8');
console.log('Successfully eliminated the ghost duplicate monthly block from #view-tables!');
