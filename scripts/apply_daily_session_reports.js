const fs = require('fs');
const path = require('path');

const targetDir = 'd:/dự án antigravity/Xieng_Nuong_Be_Huyen';
const publicDir = path.join(targetDir, 'public');
const dataDir = path.join(targetDir, 'data');

// ========================================================
// 1. UPDATE data/database.json with Current Session & History
// ========================================================
const dbPath = path.join(dataDir, 'database.json');
let db = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath, 'utf-8')) : {};

// Ensure settings exist
db.settings = db.settings || {
  storeName: "Xiêng Nướng Bé Huyền",
  tagline: "Ngon Đậm Đà - Đậm Chất Phố",
  address: "123 Đường Ẩm Thực, TP.HCM",
  phone: "0908.123.456",
  bankId: "MB",
  accountNo: "0908123456",
  accountName: "NGUYEN THI BE HUYEN",
  tableCount: 20
};

// Current Active Sales Session
const todayStr = new Date().toLocaleDateString('vi-VN'); // e.g. 27/09/2026
db.currentSession = db.currentSession || {
  isActive: true,
  date: todayStr,
  startTime: "16:30",
  endTime: null,
  initialCash: 1000000,
  orders: db.completedOrders || [],
  expenses: db.expenses || [],
  note: "Ca bán chiều - tối"
};

// Seed Daily Reports History for past days as Tris requested!
// Day 1: 26/09/2026 (Matching Tris's exact prompt numbers: 24.865.000đ revenue, 8.100.000đ expense, 16.765.000đ profit, 87 turns, 1.248 xiên nướng...)
// Day 2: 25/09/2026 (21.420.000đ revenue, 7.350.000đ expense, 14.070.000đ profit, 74 turns)
// Day 3: 24/09/2026 (19.850.000đ revenue, 6.800.000đ expense, 13.050.000đ profit, 68 turns)
db.reportsHistory = [
  {
    id: "rep_20260926",
    date: "26/09/2026",
    dayOfWeek: "Thứ Bảy",
    startTime: "16:00",
    endTime: "23:45",
    duration: "7 giờ 45 phút",
    totalRevenue: 24865000,
    totalExpense: 8100000,
    netProfit: 16765000,
    cashAmount: 18265000,
    transferAmount: 6600000,
    tableTurnCount: 87,
    totalItemsCount: 3842,
    note: "Ngày cuối tuần khách cực đông, xiên nướng và thịt xiên cháy hàng từ 21h.",
    itemsSoldSummary: [
      { id: "m1", name: "Xiên nướng", unit: "cây", price: 6000, quantity: 1248, totalAmount: 7488000 },
      { id: "m2", name: "Thịt xiên", unit: "cây", price: 7000, quantity: 684, totalAmount: 4788000 },
      { id: "m3", name: "Bò lá lốt", unit: "cây", price: 7000, quantity: 532, totalAmount: 3724000 },
      { id: "m4", name: "Lòng nướng sa tế", unit: "phần", price: 30000, quantity: 126, totalAmount: 3780000 },
      { id: "m5", name: "Ốc nướng tiêu / mỡ hành", unit: "phần", price: 30000, quantity: 98, totalAmount: 2940000 },
      { id: "m6", name: "Cút nướng mật ong", unit: "con", price: 15000, quantity: 143, totalAmount: 2145000 }
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
    orders: [
      { id: "ord_01", time: "18:30", tableName: "Bàn 05", paymentMethod: "cash", totalAmount: 329000, itemCount: 7 },
      { id: "ord_02", time: "19:15", tableName: "Bàn 02", paymentMethod: "transfer", totalAmount: 384000, itemCount: 8 },
      { id: "ord_03", time: "20:00", tableName: "Bàn 06", paymentMethod: "transfer", totalAmount: 245000, itemCount: 5 }
    ]
  },
  {
    id: "rep_20260925",
    date: "25/09/2026",
    dayOfWeek: "Thứ Sáu",
    startTime: "16:30",
    endTime: "23:15",
    duration: "6 giờ 45 phút",
    totalRevenue: 21420000,
    totalExpense: 7350000,
    netProfit: 14070000,
    cashAmount: 15420000,
    transferAmount: 6000000,
    tableTurnCount: 74,
    totalItemsCount: 3120,
    note: "Khách gia đình đi đông, các món ăn vặt và bánh tráng mắm ruốc bán chạy.",
    itemsSoldSummary: [
      { id: "m1", name: "Xiên nướng", unit: "cây", price: 6000, quantity: 1050, totalAmount: 6300000 },
      { id: "m2", name: "Thịt xiên", unit: "cây", price: 7000, quantity: 580, totalAmount: 4060000 },
      { id: "m3", name: "Bò lá lốt", unit: "cây", price: 7000, quantity: 460, totalAmount: 3220000 },
      { id: "m4", name: "Lòng nướng sa tế", unit: "phần", price: 30000, quantity: 110, totalAmount: 3300000 },
      { id: "m7", name: "Bánh tráng mắm ruốc", unit: "cái", price: 15000, quantity: 140, totalAmount: 2100000 }
    ],
    expenses: [
      { id: "e10", category: "Nguyên liệu", description: "Nhập thịt heo tươi", amount: 3200000, time: "09:00" },
      { id: "e11", category: "Nguyên liệu", description: "Rau củ, gia vị", amount: 650000, time: "10:00" },
      { id: "e12", category: "Nhiên liệu", description: "Than nướng & đá", amount: 350000, time: "14:00" },
      { id: "e13", category: "Nhân sự", description: "Lương nhân viên phụ ca", amount: 1200000, time: "23:00" },
      { id: "e14", category: "Chi khác", description: "Sửa vỉ nướng & bóng đèn", amount: 1950000, time: "15:00" }
    ],
    orders: []
  },
  {
    id: "rep_20260924",
    date: "24/09/2026",
    dayOfWeek: "Thứ Năm",
    startTime: "16:30",
    endTime: "22:45",
    duration: "6 giờ 15 phút",
    totalRevenue: 19850000,
    totalExpense: 6800000,
    netProfit: 13050000,
    cashAmount: 14200000,
    transferAmount: 5650000,
    tableTurnCount: 68,
    totalItemsCount: 2890,
    note: "Ngày trong tuần doanh thu duy trì mức tốt, tỉ lệ chuyển khoản VietQR tăng.",
    itemsSoldSummary: [
      { id: "m1", name: "Xiên nướng", unit: "cây", price: 6000, quantity: 980, totalAmount: 5880000 },
      { id: "m2", name: "Thịt xiên", unit: "cây", price: 7000, quantity: 510, totalAmount: 3570000 },
      { id: "m3", name: "Bò lá lốt", unit: "cây", price: 7000, quantity: 420, totalAmount: 2940000 }
    ],
    expenses: [
      { id: "e20", category: "Nguyên liệu", description: "Nhập thịt & que", amount: 4800000, time: "09:00" },
      { id: "e21", category: "Nhiên liệu", description: "Than & gas", amount: 500000, time: "14:00" },
      { id: "e22", category: "Nhân sự", description: "Lương phục vụ bàn", amount: 1500000, time: "22:00" }
    ],
    orders: []
  }
];

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
console.log('Updated database.json with currentSession and reportsHistory!');
