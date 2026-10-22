const fs = require('fs');
const path = require('path');

const targetDir = 'd:/dự án antigravity/Xieng_Nuong_Be_Huyen';
const publicDir = path.join(targetDir, 'public');
const dataDir = path.join(targetDir, 'data');

[targetDir, publicDir, dataDir].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// ==========================================
// 1. WRITE server.js
// ==========================================
const serverCode = `/**
 * XIÊNG NƯỚNG BÉ HUYỀN - POS & RESTAURANT MANAGEMENT SERVER
 * Tác giả: Tris & ENI
 * Chạy độc lập, không cần thư viện bên ngoài (Zero Dependencies)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const url = require('url');

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data', 'database.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

// Global state
let db = null;
let sseClients = [];

// Helper: Get local LAN IP address
function getLanIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Load database with fallback
function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(raw);
    } else {
      initDefaultDB();
    }
  } catch (err) {
    console.error('Error loading DB, initializing default:', err.message);
    initDefaultDB();
  }
}

function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB:', err.message);
  }
}

function broadcastUpdate(type, payload) {
  const data = JSON.stringify({ type, payload, timestamp: Date.now() });
  sseClients.forEach(client => {
    try {
      client.write(\`data: \${data}\\n\\n\`);
    } catch (e) {}
  });
}

function initDefaultDB() {
  db = {
    settings: {
      storeName: "Xiêng Nướng Bé Huyền",
      tagline: "Ngon Đậm Đà - Đậm Chất Phố",
      address: "123 Đường Ẩm Thực, TP.HCM",
      phone: "0908.123.456",
      bankId: "MB",
      accountNo: "0908123456",
      accountName: "NGUYEN THI BE HUYEN",
      tableCount: 20
    },
    tables: Array.from({ length: 20 }, (_, i) => {
      const id = (i + 1).toString().padStart(2, '0');
      return {
        id: id,
        name: \`Bàn \${id}\`,
        status: "empty", // "empty", "serving", "waiting_payment"
        items: [],
        openedAt: null,
        totalAmount: 0,
        customerCount: 0,
        note: ""
      };
    }),
    menu: [
      { id: "m1", name: "Xiên nướng", price: 6000, unit: "cây", category: "Xiên Nướng", icon: "🍢", bom: { "thit_heo": 50, "que_tre": 1 } },
      { id: "m2", name: "Thịt xiên", price: 7000, unit: "cây", category: "Xiên Nướng", icon: "🥩", bom: { "thit_dam": 60, "que_tre": 1 } },
      { id: "m3", name: "Bò lá lốt", price: 7000, unit: "cây", category: "Xiên Nướng", icon: "🥬", bom: { "thit_bo": 40, "la_lot": 5, "que_tre": 1 } },
      { id: "m4", name: "Lòng nướng sa tế", price: 30000, unit: "phần", category: "Món Nóng", icon: "🥘", bom: { "long_heo": 150 } },
      { id: "m5", name: "Ốc nướng tiêu / mỡ hành", price: 30000, unit: "phần", category: "Món Nóng", icon: "🐚", bom: { "oc_buou": 200 } },
      { id: "m6", name: "Cút nướng mật ong", price: 15000, unit: "con", category: "Xiên Nướng", icon: "🍗", bom: { "chim_cut": 1 } },
      { id: "m7", name: "Bánh tráng mắm ruốc", price: 15000, unit: "cái", category: "Ăn Vặt", icon: "🍘", bom: { "banh_trang": 1, "mam_ruoc": 20 } },
      { id: "m8", name: "Chân gà nướng muối ớt", price: 20000, unit: "cặp", category: "Xiên Nướng", icon: "🍖", bom: { "chan_ga": 2 } },
      { id: "m9", name: "Nem nướng Nha Trang", price: 12000, unit: "cây", category: "Xiên Nướng", icon: "🌭", bom: { "nem_song": 1 } },
      { id: "m10", name: "Tôm nướng sa tế", price: 35000, unit: "phần", category: "Món Nóng", icon: "🦐", bom: { "tom_tuoi": 150 } },
      { id: "m11", name: "Đậu bắp nướng mỡ hành", price: 10000, unit: "dĩa", category: "Ăn Vặt", icon: "🥢", bom: { "dau_bap": 100 } },
      { id: "m12", name: "Trà tắc khổng lồ", price: 12000, unit: "ly", category: "Đồ Uống", icon: "🥤", bom: { "tra_tac": 1 } },
      { id: "m13", name: "Nước ngọt lon (Coca/Pepsi)", price: 12000, unit: "lon", category: "Đồ Uống", icon: "🥫", bom: { "nuoc_ngot": 1 } },
      { id: "m14", name: "Bia Saigon / Tiger", price: 18000, unit: "lon", category: "Đồ Uống", icon: "🍺", bom: { "bia": 1 } },
      { id: "m15", name: "Khăn lạnh", price: 2000, unit: "cái", category: "Khác", icon: "🧊", bom: {} }
    ],
    inventory: [
      { id: "thit_heo", name: "Thịt heo (ướp xiên)", unit: "g", stock: 80000, minStock: 20000 },
      { id: "thit_dam", name: "Thịt nạc dăm", unit: "g", stock: 50000, minStock: 15000 },
      { id: "thit_bo", name: "Thịt bò băm", unit: "g", stock: 30000, minStock: 10000 },
      { id: "que_tre", name: "Que tre xiên nướng", unit: "que", stock: 3000, minStock: 500 },
      { id: "la_lot", name: "Lá lốt tươi", unit: "lá", stock: 2000, minStock: 500 },
      { id: "long_heo", name: "Lòng heo sạch", unit: "g", stock: 25000, minStock: 5000 },
      { id: "oc_buou", name: "Ốc tươi các loại", unit: "g", stock: 20000, minStock: 5000 },
      { id: "chim_cut", name: "Chim cút làm sẵn", unit: "con", stock: 200, minStock: 50 },
      { id: "banh_trang", name: "Bánh tráng nướng", unit: "cái", stock: 300, minStock: 50 },
      { id: "chan_ga", name: "Chân gà làm sạch", unit: "cặp", stock: 150, minStock: 30 }
    ],
    expenses: [
      { id: "e1", category: "Nguyên liệu", description: "Nhập thịt heo & bò tươi", amount: 3500000, time: "08:30" },
      { id: "e2", category: "Nguyên liệu", description: "Nhập que xiên & túi nilon", amount: 1800000, time: "09:00" },
      { id: "e3", category: "Nguyên liệu", description: "Rau sống, lá lốt, dưa leo", amount: 450000, time: "09:15" },
      { id: "e4", category: "Nhiên liệu", description: "Than hoa không khói", amount: 200000, time: "10:00" },
      { id: "e5", category: "Nhiên liệu", description: "Nước đá cây & đá bi", amount: 150000, time: "14:00" },
      { id: "e6", category: "Nhiên liệu", description: "Đổi 1 bình gas công nghiệp", amount: 300000, time: "15:00" },
      { id: "e7", category: "Nhân sự", description: "Tạm ứng lương 2 nhân viên nướng", amount: 1500000, time: "17:00" },
      { id: "e8", category: "Chi khác", description: "Gia vị, dầu ăn, tương ớt", amount: 200000, time: "17:30" }
    ],
    completedOrders: []
  };

  // Seed sample demo data so Tris can immediately test!
  seedSampleOrders();
  saveDB();
}

function seedSampleOrders() {
  // Demo orders matching Tris prompt:
  // Revenue 24.865.000đ, 87 table turns, Xiên nướng 1248, Thịt xiên 684, Bò lá lốt 532, Lòng 126, Ốc 98, Cút 143...
  db.completedOrders = [
    {
      id: "demo-sum",
      isSummarySeed: true,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('vi-VN'),
      tableId: "05",
      tableName: "Bàn 05 (Mẫu)",
      paymentMethod: "cash",
      cashAmount: 18265000,
      transferAmount: 6600000,
      totalAmount: 24865000,
      tableTurnCount: 87,
      items: [
        { id: "m1", name: "Xiên nướng", price: 6000, unit: "cây", quantity: 1248, amount: 7488000 },
        { id: "m2", name: "Thịt xiên", price: 7000, unit: "cây", quantity: 684, amount: 4788000 },
        { id: "m3", name: "Bò lá lốt", price: 7000, unit: "cây", quantity: 532, amount: 3724000 },
        { id: "m4", name: "Lòng nướng sa tế", price: 30000, unit: "phần", quantity: 126, amount: 3780000 },
        { id: "m5", name: "Ốc nướng tiêu / mỡ hành", price: 30000, unit: "phần", quantity: 98, amount: 2940000 },
        { id: "m6", name: "Cút nướng mật ong", price: 15000, unit: "con", quantity: 143, amount: 2145000 }
      ]
    }
  ];

  // Set Table 05 to current demo order from prompt!
  const t5 = db.tables.find(t => t.id === "05");
  if (t5) {
    t5.status = "serving";
    t5.openedAt = "18:15";
    t5.items = [
      { id: "m1", name: "Xiên nướng", price: 6000, unit: "cây", quantity: 10, amount: 60000 },
      { id: "m2", name: "Thịt xiên", price: 7000, unit: "cây", quantity: 8, amount: 56000 },
      { id: "m3", name: "Bò lá lốt", price: 7000, unit: "cây", quantity: 6, amount: 42000 },
      { id: "m4", name: "Lòng nướng sa tế", price: 30000, unit: "phần", quantity: 2, amount: 60000 },
      { id: "m5", name: "Ốc nướng tiêu / mỡ hành", price: 30000, unit: "phần", quantity: 1, amount: 30000 },
      { id: "m6", name: "Cút nướng mật ong", price: 15000, unit: "con", quantity: 3, amount: 45000 },
      { id: "m7", name: "Bánh tráng mắm ruốc", price: 15000, unit: "cái", quantity: 2, amount: 30000 }
    ];
    t5.totalAmount = t5.items.reduce((s, it) => s + (it.price * it.quantity), 0); // 323.000 or 329.000
  }

  // Set Table 02 and 06 to active as in Tris's UI sketch
  const t2 = db.tables.find(t => t.id === "02");
  if (t2) {
    t2.status = "serving";
    t2.openedAt = "18:00";
    t2.items = [
      { id: "m1", name: "Xiên nướng", price: 6000, unit: "cây", quantity: 20, amount: 120000 },
      { id: "m4", name: "Lòng nướng sa tế", price: 30000, unit: "phần", quantity: 4, amount: 120000 },
      { id: "m14", name: "Bia Saigon / Tiger", price: 18000, unit: "lon", quantity: 8, amount: 144000 }
    ];
    t2.totalAmount = 384000;
  }

  const t6 = db.tables.find(t => t.id === "06");
  if (t6) {
    t6.status = "serving";
    t6.openedAt = "18:20";
    t6.items = [
      { id: "m2", name: "Thịt xiên", price: 7000, unit: "cây", quantity: 15, amount: 105000 },
      { id: "m8", name: "Chân gà nướng muối ớt", price: 20000, unit: "cặp", quantity: 4, amount: 80000 },
      { id: "m12", name: "Trà tắc khổng lồ", price: 12000, unit: "ly", quantity: 5, amount: 60000 }
    ];
    t6.totalAmount = 245000;
  }
}

// MIME Types dictionary
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(data));
}

// Deduct inventory raw materials based on BOM
function deductBOM(items) {
  items.forEach(it => {
    const menuItem = db.menu.find(m => m.id === it.id || m.name === it.name);
    if (menuItem && menuItem.bom) {
      for (const [ingId, qtyNeededPerUnit] of Object.entries(menuItem.bom)) {
        const ing = db.inventory.find(inv => inv.id === ingId);
        if (ing) {
          const totalDeduct = qtyNeededPerUnit * it.quantity;
          ing.stock = Math.max(0, ing.stock - totalDeduct);
        }
      }
    }
  });
}

// AI Copilot Logic (Instant Local Restaurant Advisor)
function handleAiChat(prompt) {
  const p = (prompt || "").toLowerCase();
  
  // Calculate live stats
  const totalRev = db.completedOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const totalExp = db.expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const netProfit = totalRev - totalExp;
  const totalTurns = db.completedOrders.reduce((s, o) => s + (o.tableTurnCount || 1), 0);

  // Aggregated sold items
  const itemMap = {};
  db.completedOrders.forEach(o => {
    (o.items || []).forEach(it => {
      if (!itemMap[it.name]) {
        itemMap[it.name] = { quantity: 0, amount: 0, unit: it.unit || 'phần' };
      }
      itemMap[it.name].quantity += it.quantity;
      itemMap[it.name].amount += (it.price * it.quantity);
    });
  });
  const sortedItems = Object.entries(itemMap).sort((a, b) => b[1].quantity - a[1].quantity);
  const top1 = sortedItems[0] || ["Xiên nướng", { quantity: 1248, unit: "cây" }];
  const top2 = sortedItems[1] || ["Thịt xiên", { quantity: 684, unit: "cây" }];
  const top3 = sortedItems[2] || ["Bò lá lốt", { quantity: 532, unit: "cây" }];

  if (p.includes("lời") || p.includes("lợi nhuận") || p.includes("thấp hơn") || p.includes("tại sao")) {
    return \`### 📊 Phân Tích Lợi Nhuận Hôm Nay

- **Tổng Doanh Thu:** \${totalRev.toLocaleString('vi-VN')}đ
- **Tổng Chi Phí:** \${totalExp.toLocaleString('vi-VN')}đ
- **Lợi Nhuận Ròng (Tiền còn lại):** **\${netProfit.toLocaleString('vi-VN')}đ** (Tỉ suất lợi nhuận: \${((netProfit / (totalRev || 1)) * 100).toFixed(1)}%)

💡 **Lý do & Nhận định:**
1. **Chi phí nguyên liệu nhập đầu ngày chiếm tỉ trọng lớn** (\${((3500000 + 1800000) / totalExp * 100).toFixed(1)}% tổng chi), gồm đợt nhập que tre và thịt số lượng lớn để dự trữ cho cả 2 ngày cuối tuần.
2. Món **\${top1[0]}** bán chạy nhất đạt **\${top1[1].quantity.toLocaleString('vi-VN')} \${top1[1].unit}**, mang lại biên lợi nhuận ổn định nhưng đơn giá 6.000đ cần đẩy thêm các món có biên lãi cao như *Ốc nướng* và *Đồ uống (Trà tắc/Bia)*.
3. Nếu trừ đi khoản tạm ứng lương nhân viên (\${(1500000).toLocaleString('vi-VN')}đ), dòng tiền thuần tại quán còn lại rất dồi dào!\`;
  }

  if (p.includes("chuẩn bị") || p.includes("ngày mai") || p.includes("bao nhiêu") || p.includes("kho") || p.includes("thịt")) {
    const xienQty = top1[1].quantity;
    const thitQty = top2[1].quantity;
    const boQty = top3[1].quantity;

    // Projected meat in kg
    const kgThitHeo = ((xienQty * 50 + thitQty * 60) / 1000).toFixed(1);
    const kgThitBo = ((boQty * 40) / 1000).toFixed(1);
    const queTre = Math.round((xienQty + thitQty + boQty) * 1.1);

    return \`### 🍢 Dự Báo Chuẩn Bị Nguyên Liệu Cho Ngày Mai

Dựa trên dữ liệu bán ra của **\${totalTurns} lượt bàn** hôm nay, hệ thống khuyến nghị anh chuẩn bị cho ngày mai:

1. **Thịt Heo (Xiên & Thịt nạc dăm):** Cần khoảng **\${kgThitHeo} kg** thịt tươi làm sạch, ướp trước 14:00 chiều để ngấm vị sa tế.
2. **Thịt Bò Băm (Bò lá lốt):** Cần khoảng **\${kgThitBo} kg** thịt bò mềm + khoảng **\${(boQty * 5).toLocaleString('vi-VN')} lá lốt**.
3. **Que Tre Xiên:** Cần tối thiểu **\${queTre.toLocaleString('vi-VN')} que** (đã cộng dư 10% gãy/hỏng lúc nướng).
4. **Than nướng & Gas:** Hôm nay chi 200.000đ than, ngày mai cuối tuần nên chuẩn bị thêm 2 bao than hoa không khói để phục vụ giờ cao điểm 19:30 - 21:30.\`;
  }

  if (p.includes("bán chạy") || p.includes("món") || p.includes("bán chậm") || p.includes("thực đơn")) {
    let res = \`### 🔥 Xếp Hạng Món Ăn Hôm Nay\\n\\n\`;
    res += \`**Top 5 Món Cháy Hàng Nhất:**\\n\`;
    sortedItems.slice(0, 5).forEach((item, idx) => {
      res += \`\${idx + 1}. **\${item[0]}** — \${item[1].quantity.toLocaleString('vi-VN')} \${item[1].unit} (Thu về \${item[1].amount.toLocaleString('vi-VN')}đ)\\n\`;
    });
    res += \`\\n⚠️ **Món Bán Chậm Cần Chú Ý:**\\n- *Đậu bắp nướng*: Khách ít gọi lẻ, nên đóng thành combo kèm xiên nướng tặng kèm để kích cầu.\\n- *Nem nướng*: Nên cho nhân viên mời chào khi khách vừa ngồi bàn gọi nước!\`;
    return res;
  }

  // Default summary response
  return \`### 🌟 Báo Cáo Nhanh Quán Xiêng Nướng Bé Huyền

- **Doanh Thu Ngày:** \${totalRev.toLocaleString('vi-VN')}đ
- **Chi Phí Hôm Nay:** \${totalExp.toLocaleString('vi-VN')}đ
- **Lợi Nhuận Thuần:** **\${netProfit.toLocaleString('vi-VN')}đ**
- **Lượt Khách Phục Vụ:** \${totalTurns} lượt bàn
- **Món Best-Seller:** \${top1[0]} (\${top1[1].quantity.toLocaleString('vi-VN')} \${top1[1].unit})

Anh có thể bấm các câu hỏi gợi ý bên dưới hoặc hỏi em bất kỳ điều gì về kho, doanh thu và gợi ý tối ưu chi phí quán nhé!\`;
}

// Create HTTP Server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Handle CORS
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  // 1. SSE Events endpoint
  if (pathname === '/api/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    res.write('retry: 3000\\n\\n');
    sseClients.push(res);
    req.on('close', () => {
      sseClients = sseClients.filter(c => c !== res);
    });
    return;
  }

  // 2. REST API Routes
  if (pathname === '/api/state' && req.method === 'GET') {
    return sendJson(res, 200, db);
  }

  if (pathname === '/api/table/update' && req.method === 'POST') {
    try {
      const data = await readJsonBody(req);
      const table = db.tables.find(t => t.id === data.tableId);
      if (!table) return sendJson(res, 404, { error: 'Không tìm thấy bàn' });

      table.items = data.items || [];
      table.totalAmount = table.items.reduce((s, it) => s + (it.price * it.quantity), 0);
      table.note = data.note || "";
      table.customerCount = data.customerCount || table.customerCount || 1;

      if (table.items.length > 0) {
        table.status = 'serving';
        if (!table.openedAt) {
          table.openedAt = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        }
      } else {
        table.status = 'empty';
        table.openedAt = null;
      }

      saveDB();
      broadcastUpdate('table_updated', table);
      return sendJson(res, 200, { success: true, table });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  if (pathname === '/api/table/checkout' && req.method === 'POST') {
    try {
      const data = await readJsonBody(req);
      const table = db.tables.find(t => t.id === data.tableId);
      if (!table) return sendJson(res, 404, { error: 'Không tìm thấy bàn' });

      if (table.items.length === 0) {
        return sendJson(res, 400, { error: 'Bàn chưa có món' });
      }

      // Record completed order
      const completedOrder = {
        id: 'ord_' + Date.now(),
        date: new Date().toLocaleDateString('vi-VN'),
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        tableId: table.id,
        tableName: table.name,
        paymentMethod: data.paymentMethod || 'cash', // 'cash' or 'transfer'
        cashAmount: data.paymentMethod === 'cash' ? table.totalAmount : 0,
        transferAmount: data.paymentMethod === 'transfer' ? table.totalAmount : 0,
        totalAmount: table.totalAmount,
        tableTurnCount: 1,
        items: JSON.parse(JSON.stringify(table.items)),
        note: table.note || ""
      };

      db.completedOrders.push(completedOrder);

      // Deduct BOM inventory
      deductBOM(table.items);

      // Reset table
      table.status = 'empty';
      table.items = [];
      table.totalAmount = 0;
      table.openedAt = null;
      table.note = "";

      saveDB();
      broadcastUpdate('table_checkout', { table, order: completedOrder });
      return sendJson(res, 200, { success: true, order: completedOrder });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  if (pathname === '/api/table/clear' && req.method === 'POST') {
    try {
      const data = await readJsonBody(req);
      const table = db.tables.find(t => t.id === data.tableId);
      if (table) {
        table.status = 'empty';
        table.items = [];
        table.totalAmount = 0;
        table.openedAt = null;
        table.note = "";
        saveDB();
        broadcastUpdate('table_cleared', table);
      }
      return sendJson(res, 200, { success: true });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

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
      db.expenses.push(newExp);
      saveDB();
      broadcastUpdate('expense_added', newExp);
      return sendJson(res, 200, { success: true, expense: newExp });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  if (pathname === '/api/expenses/delete' && req.method === 'POST') {
    try {
      const data = await readJsonBody(req);
      db.expenses = db.expenses.filter(e => e.id !== data.id);
      saveDB();
      broadcastUpdate('expense_deleted', { id: data.id });
      return sendJson(res, 200, { success: true });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  if (pathname === '/api/ai/chat' && req.method === 'POST') {
    try {
      const data = await readJsonBody(req);
      const answer = handleAiChat(data.prompt);
      return sendJson(res, 200, { answer });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  if (pathname === '/api/seed' && req.method === 'POST') {
    seedSampleOrders();
    saveDB();
    broadcastUpdate('data_seeded', {});
    return sendJson(res, 200, { success: true, message: 'Đã nạp số liệu mẫu của Tris!' });
  }

  // 3. Static File Serving
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  const ext = path.extname(filePath).toLowerCase();

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }
    const contentType = MIME_TYPES[path.extname(filePath).toLowerCase()] || 'text/plain';
    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

// Startup initialization
loadDB();
server.listen(PORT, '0.0.0.0', () => {
  const lanIp = getLanIp();
  console.log('\\n=============================================================');
  console.log('  🔥 XIÊNG NƯỚNG BÉ HUYỀN - HỆ THỐNG POS 20 BÀN & QUẢN LÝ 🔥');
  console.log('=============================================================');
  console.log(\`👉 Máy tính thu ngân (Local):   http://localhost:\${PORT}\`);
  console.log(\`👉 Điện thoại / iPad của Quán:  http://\${lanIp}:\${PORT}\`);
  console.log('=============================================================\\n');
});
`;

fs.writeFileSync(path.join(targetDir, 'server.js'), serverCode, 'utf-8');
console.log('Created server.js successfully!');
