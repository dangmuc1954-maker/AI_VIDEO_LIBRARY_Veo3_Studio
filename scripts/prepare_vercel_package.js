const fs = require('fs');
const path = require('path');

const targetDir = 'd:/dự án antigravity/Xieng_Nuong_Be_Huyen';
const apiDir = path.join(targetDir, 'api');

if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir, { recursive: true });
}

// ========================================================
// 1. CREATE vercel.json
// ========================================================
const vercelConfig = {
  version: 2,
  cleanUrls: true,
  rewrites: [
    { source: "/api/(.*)", destination: "/api/index.js" },
    { source: "/(.*)", destination: "/public/$1" }
  ]
};

fs.writeFileSync(path.join(targetDir, 'vercel.json'), JSON.stringify(vercelConfig, null, 2), 'utf-8');
console.log('Created vercel.json!');

// ========================================================
// 2. CREATE api/index.js (Vercel Serverless Function)
// ========================================================
const serverJs = fs.readFileSync(path.join(targetDir, 'server.js'), 'utf-8');

// Build api/index.js adapted for Vercel Serverless
const apiIndexCode = `const fs = require('fs');
const path = require('path');
const url = require('url');

// Database initialization
const dataDir = path.join(process.cwd(), 'data');
const localDbPath = path.join(dataDir, 'database.json');
const tmpDbPath = '/tmp/database.json';

// In-memory state with persistence
let db = null;

function loadDB() {
  if (db) return db;

  // 1. Try /tmp/database.json (writable in serverless)
  if (fs.existsSync(tmpDbPath)) {
    try {
      db = JSON.parse(fs.readFileSync(tmpDbPath, 'utf-8'));
      return db;
    } catch (e) {
      console.error('Error loading from /tmp:', e);
    }
  }

  // 2. Fallback to bundled data/database.json
  if (fs.existsSync(localDbPath)) {
    try {
      db = JSON.parse(fs.readFileSync(localDbPath, 'utf-8'));
      return db;
    } catch (e) {
      console.error('Error loading localDb:', e);
    }
  }

  // 3. Fallback default
  db = {
    tables: Array.from({ length: 20 }, (_, i) => ({
      id: String(i + 1).padStart(2, '0'),
      name: \`Bàn \${String(i + 1).padStart(2, '0')}\`,
      status: "empty",
      items: [],
      totalAmount: 0,
      openedAt: null,
      note: ""
    })),
    menu: [],
    completedOrders: [],
    expenses: [],
    reportsHistory: [],
    currentSession: { isActive: false, orders: [], expenses: [] }
  };
  return db;
}

function saveDB() {
  if (!db) return;
  try {
    fs.writeFileSync(tmpDbPath, JSON.stringify(db, null, 2), 'utf-8');
  } catch (e) {
    // Read-only filesystem warning
    console.warn('Could not write to tmp:', e.message);
  }
}

// Helpers
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body && typeof req.body === 'object') {
      return resolve(req.body);
    }
    if (req.body && typeof req.body === 'string') {
      try {
        return resolve(JSON.parse(req.body));
      } catch (e) {
        return reject(e);
      }
    }
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// Main Vercel Serverless Handler
module.exports = async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  loadDB();

  // 1. GET STATE
  if (pathname === '/api/state' && req.method === 'GET') {
    return sendJson(res, 200, db);
  }

  // 2. ORDER ITEMS FOR TABLE
  if (pathname === '/api/tables/order' && req.method === 'POST') {
    try {
      const data = await readJsonBody(req);
      const table = db.tables.find(t => t.id === data.tableId);
      if (!table) return sendJson(res, 404, { error: 'Không tìm thấy bàn' });

      if (table.status === 'empty') {
        table.status = 'active';
        table.openedAt = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      }

      data.items.forEach(newItem => {
        const existing = table.items.find(i => i.id === newItem.id);
        if (existing) {
          existing.quantity += newItem.quantity;
        } else {
          table.items.push({
            id: newItem.id,
            name: newItem.name,
            price: newItem.price,
            unit: newItem.unit,
            quantity: newItem.quantity
          });
        }
      });

      table.totalAmount = table.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      saveDB();
      return sendJson(res, 200, { success: true, table });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // 3. PAY BILL FOR TABLE
  if (pathname === '/api/tables/pay' && req.method === 'POST') {
    try {
      const data = await readJsonBody(req);
      const table = db.tables.find(t => t.id === data.tableId);
      if (!table) return sendJson(res, 404, { error: 'Không tìm thấy bàn' });

      const finalAmount = data.finalAmount || table.totalAmount;
      const paymentMethod = data.paymentMethod || 'cash';
      const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const dateStr = new Date().toLocaleDateString('vi-VN');

      // Deduct inventory BOM
      table.items.forEach(orderItem => {
        const menuItem = db.menu.find(m => m.id === orderItem.id || m.name === orderItem.name);
        if (menuItem && menuItem.bom) {
          for (const [ingId, qtyNeeded] of Object.entries(menuItem.bom)) {
            const ing = db.inventory.find(i => i.id === ingId);
            if (ing) {
              ing.stock = Math.max(0, ing.stock - (qtyNeeded * orderItem.quantity));
            }
          }
        }
      });

      const orderRecord = {
        id: 'ord_' + Date.now(),
        date: dateStr,
        time: nowStr,
        tableId: table.id,
        tableName: table.name,
        paymentMethod: paymentMethod,
        cashAmount: paymentMethod === 'cash' ? finalAmount : 0,
        transferAmount: paymentMethod === 'vietqr' ? finalAmount : 0,
        totalAmount: finalAmount,
        itemCount: table.items.reduce((s, it) => s + it.quantity, 0),
        items: [...table.items],
        note: data.note || ''
      };

      if (!db.completedOrders) db.completedOrders = [];
      db.completedOrders.push(orderRecord);

      if (db.currentSession && db.currentSession.isActive) {
        if (!db.currentSession.orders) db.currentSession.orders = [];
        db.currentSession.orders.push(orderRecord);
      }

      table.status = 'empty';
      table.items = [];
      table.totalAmount = 0;
      table.openedAt = null;
      table.note = '';

      saveDB();
      return sendJson(res, 200, { success: true, order: orderRecord, table });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // 4. CANCEL / CLEAR TABLE
  if (pathname === '/api/tables/cancel' && req.method === 'POST') {
    try {
      const data = await readJsonBody(req);
      const table = db.tables.find(t => t.id === data.tableId);
      if (!table) return sendJson(res, 404, { error: 'Không tìm thấy bàn' });

      table.status = 'empty';
      table.items = [];
      table.totalAmount = 0;
      table.openedAt = null;
      table.note = '';

      saveDB();
      return sendJson(res, 200, { success: true, table });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // 5. SESSION: START
  if (pathname === '/api/session/start' && req.method === 'POST') {
    try {
      const data = await readJsonBody(req);
      const now = new Date();
      const dateStr = now.toLocaleDateString('vi-VN');
      const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

      db.currentSession = {
        isActive: true,
        date: dateStr,
        startTime: timeStr,
        endTime: null,
        initialCash: Number(data.initialCash) || 0,
        orders: [],
        expenses: [],
        note: data.note || ''
      };

      saveDB();
      return sendJson(res, 200, { success: true, session: db.currentSession });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // 6. SESSION: END & SAVE REPORT
  if (pathname === '/api/session/end' && req.method === 'POST') {
    try {
      const data = await readJsonBody(req);
      if (!db.currentSession || !db.currentSession.isActive) {
        return sendJson(res, 400, { error: 'Không có ca bán hàng nào đang mở' });
      }

      const now = new Date();
      const endTimeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const orders = db.currentSession.orders || [];
      const expenses = db.currentSession.expenses || [];

      const totalRevenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
      const cashAmount = orders.filter(o => o.paymentMethod === 'cash').reduce((s, o) => s + (o.totalAmount || 0), 0);
      const transferAmount = orders.filter(o => o.paymentMethod === 'vietqr').reduce((s, o) => s + (o.totalAmount || 0), 0);
      const totalExpense = expenses.reduce((s, e) => s + (e.amount || 0), 0);
      const netProfit = totalRevenue - totalExpense;

      const itemMap = {};
      orders.forEach(o => {
        (o.items || []).forEach(it => {
          if (!itemMap[it.name]) {
            itemMap[it.name] = { id: it.id, name: it.name, unit: it.unit || 'phần', price: it.price, quantity: 0, totalAmount: 0 };
          }
          itemMap[it.name].quantity += it.quantity;
          itemMap[it.name].totalAmount += (it.price * it.quantity);
        });
      });
      const itemsSoldSummary = Object.values(itemMap).sort((a, b) => b.quantity - a.quantity);

      const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const dayOfWeek = daysOfWeek[now.getDay()];

      const report = {
        id: 'rep_' + Date.now(),
        date: db.currentSession.date,
        dayOfWeek: dayOfWeek,
        startTime: db.currentSession.startTime,
        endTime: endTimeStr,
        duration: \`\${db.currentSession.startTime} - \${endTimeStr}\`,
        totalRevenue: totalRevenue,
        totalExpense: totalExpense,
        netProfit: netProfit,
        cashAmount: cashAmount,
        transferAmount: transferAmount,
        tableTurnCount: orders.length,
        totalItemsCount: itemsSoldSummary.reduce((s, it) => s + it.quantity, 0),
        note: data.note || db.currentSession.note || 'Ca bán hoàn tất',
        itemsSoldSummary: itemsSoldSummary,
        expenses: [...expenses],
        orders: [...orders]
      };

      if (!db.reportsHistory) db.reportsHistory = [];
      db.reportsHistory.unshift(report);

      db.currentSession = {
        isActive: false,
        date: db.currentSession.date,
        startTime: db.currentSession.startTime,
        endTime: endTimeStr,
        initialCash: db.currentSession.initialCash,
        orders: [],
        expenses: [],
        note: ''
      };

      saveDB();
      return sendJson(res, 200, { success: true, report });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // 7. EXPENSES
  if (pathname === '/api/expenses/add' && req.method === 'POST') {
    try {
      const data = await readJsonBody(req);
      const newExp = {
        id: 'e_' + Date.now(),
        category: data.category || 'Chi khác',
        description: data.description || 'Chi phí',
        amount: Number(data.amount) || 0,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };

      const reportId = data.reportId;
      if (reportId && db.reportsHistory) {
        const rep = db.reportsHistory.find(r => r.id === reportId);
        if (rep) {
          if (!rep.expenses) rep.expenses = [];
          rep.expenses.push(newExp);
          rep.totalExpense = rep.expenses.reduce((s, e) => s + (e.amount || 0), 0);
          rep.netProfit = rep.totalRevenue - rep.totalExpense;
        }
      }

      if (db.currentSession && db.currentSession.isActive) {
        if (!db.currentSession.expenses) db.currentSession.expenses = [];
        db.currentSession.expenses.push(newExp);
      }
      if (!db.expenses) db.expenses = [];
      db.expenses.push(newExp);

      saveDB();
      return sendJson(res, 200, { success: true, expense: newExp });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  if (pathname === '/api/expenses/delete' && req.method === 'POST') {
    try {
      const data = await readJsonBody(req);
      const reportId = data.reportId;
      if (reportId && db.reportsHistory) {
        const rep = db.reportsHistory.find(r => r.id === reportId);
        if (rep && rep.expenses) {
          rep.expenses = rep.expenses.filter(e => e.id !== data.id);
          rep.totalExpense = rep.expenses.reduce((s, e) => s + (e.amount || 0), 0);
          rep.netProfit = rep.totalRevenue - rep.totalExpense;
        }
      }

      if (db.currentSession && db.currentSession.expenses) {
        db.currentSession.expenses = db.currentSession.expenses.filter(e => e.id !== data.id);
      }
      if (db.expenses) {
        db.expenses = db.expenses.filter(e => e.id !== data.id);
      }
      saveDB();
      return sendJson(res, 200, { success: true });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // 8. INVENTORY & BOM ENDPOINTS
  if (pathname === '/api/inventory/update' && req.method === 'POST') {
    try {
      const data = await readJsonBody(req);
      const ing = db.inventory.find(i => i.id === data.id);
      if (!ing) return sendJson(res, 404, { error: 'Không tìm thấy nguyên liệu' });

      if (data.stock !== undefined) ing.stock = Number(data.stock) || 0;
      if (data.minStock !== undefined) ing.minStock = Number(data.minStock) || 0;
      if (data.name) ing.name = data.name;
      if (data.unit) ing.unit = data.unit;

      saveDB();
      return sendJson(res, 200, { success: true, ingredient: ing });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  if (pathname === '/api/inventory/import' && req.method === 'POST') {
    try {
      const data = await readJsonBody(req);
      const ing = db.inventory.find(i => i.id === data.id);
      if (!ing) return sendJson(res, 404, { error: 'Không tìm thấy nguyên liệu' });

      const addQty = Number(data.quantity) || 0;
      ing.stock += addQty;

      const cost = Number(data.cost) || 0;
      if (cost > 0 && data.recordExpense) {
        const exp = {
          id: 'e_' + Date.now(),
          category: 'Nguyên liệu',
          description: \`Nhập kho \${ing.name} (+\${addQty} \${ing.unit})\`,
          amount: cost,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };
        if (db.currentSession && db.currentSession.isActive) {
          if (!db.currentSession.expenses) db.currentSession.expenses = [];
          db.currentSession.expenses.push(exp);
        }
        if (!db.expenses) db.expenses = [];
        db.expenses.push(exp);
      }

      saveDB();
      return sendJson(res, 200, { success: true, ingredient: ing });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  if (pathname === '/api/inventory/add' && req.method === 'POST') {
    try {
      const data = await readJsonBody(req);
      if (!data.name || !data.unit) return sendJson(res, 400, { error: 'Thiếu tên hoặc đơn vị' });

      const newId = 'ing_' + Date.now();
      const newIng = {
        id: newId,
        name: data.name,
        unit: data.unit,
        stock: Number(data.stock) || 0,
        minStock: Number(data.minStock) || 0
      };
      if (!db.inventory) db.inventory = [];
      db.inventory.push(newIng);

      saveDB();
      return sendJson(res, 200, { success: true, ingredient: newIng });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  if (pathname === '/api/menu/update-bom' && req.method === 'POST') {
    try {
      const data = await readJsonBody(req);
      const menuItem = db.menu.find(m => m.id === data.menuId);
      if (!menuItem) return sendJson(res, 404, { error: 'Không tìm thấy món ăn' });

      menuItem.bom = data.bom || {};
      saveDB();
      return sendJson(res, 200, { success: true, menuItem });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // 9. AI COPILOT
  if (pathname === '/api/ai/chat' && req.method === 'POST') {
    try {
      const data = await readJsonBody(req);
      const msg = (data.message || '').toLowerCase();
      let reply = '';

      if (msg.includes('doanh thu') || msg.includes('tiền')) {
        const lastRep = db.reportsHistory && db.reportsHistory[0];
        if (lastRep) {
          reply = \`Chào anh Tris! Doanh thu ca gần nhất (\${lastRep.date}) đạt \${lastRep.totalRevenue.toLocaleString('vi-VN')}đ, lợi nhuận thực còn lại \${lastRep.netProfit.toLocaleString('vi-VN')}đ sau khi trừ \${lastRep.totalExpense.toLocaleString('vi-VN')}đ chi phí ạ! 🍢\`;
        } else {
          reply = 'Hôm nay quán mình vừa khởi động ca mới, anh em đang chuẩn bị than hồng và nướng xiên rồi anh nhé! 🔥';
        }
      } else if (msg.includes('kho') || msg.includes('thịt') || msg.includes('que')) {
        const low = (db.inventory || []).filter(i => i.stock <= i.minStock);
        if (low.length > 0) {
          reply = \`Anh Tris ơi, kho đang có \${low.length} món sắp hết cần nhập thêm sớm: \${low.map(x => x.name + ' (còn ' + x.stock + ' ' + x.unit + ')').join(', ')} anh nhé! ⚠️\`;
        } else {
          reply = 'Dạ kho nguyên liệu thịt, que tre, cút và ốc hiện tại đều đang rất dồi dào, sẵn sàng phục vụ full 20 bàn tối nay ạ! ✨';
        }
      } else {
        reply = 'Dạ Bé Huyền AI Copilot nghe đây ạ! Em có thể giúp anh theo dõi doanh thu hôm nay, kiểm tra kho thịt que, tư vấn giờ cao điểm hoặc phân tích món nào bán chạy nhất cho quán mình nha! 💕';
      }

      return sendJson(res, 200, { reply });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // Fallback 404 for unhandled API routes
  return sendJson(res, 404, { error: 'API route not found' });
};
`;

fs.writeFileSync(path.join(apiDir, 'index.js'), apiIndexCode, 'utf-8');
console.log('Created api/index.js for Vercel Serverless Function!');

// ========================================================
// 3. CREATE deploy_vercel.bat
// ========================================================
const batContent = `@echo off
chcp 65001 >nul
title Triển Khai Xiêng Nướng Bé Huyền Lên Vercel 24/24
cd /d "%~dp0"
echo ===================================================================
echo   🔥 XIÊNG NƯỚNG BÉ HUYỀN - TRIỂN KHAI LÊN VERCEL SERVERLESS 24/24 🔥
echo ===================================================================
echo.
echo Đang kết nối Vercel Cloud và triển khai hệ thống...
echo.
npx -y vercel --prod
echo.
echo ===================================================================
echo Hoàn tất! Nhấn phím bất kỳ để đóng cửa sổ.
pause >nul
`;

fs.writeFileSync(path.join(targetDir, 'deploy_vercel.bat'), batContent, 'utf-8');
console.log('Created deploy_vercel.bat!');
