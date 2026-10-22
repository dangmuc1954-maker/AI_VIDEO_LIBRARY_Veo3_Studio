const fs = require('fs');
const path = require('path');

const targetDir = 'd:/dự án antigravity/Xieng_Nuong_Be_Huyen';
const publicDir = path.join(targetDir, 'public');
const serverJsPath = path.join(targetDir, 'server.js');
const htmlPath = path.join(publicDir, 'index.html');
const appJsPath = path.join(publicDir, 'app.js');
const cssPath = path.join(publicDir, 'style.css');

// ========================================================
// 1. UPDATE server.js WITH INVENTORY & BOM EDIT ENDPOINTS
// ========================================================
let serverJs = fs.readFileSync(serverJsPath, 'utf-8');

const inventoryEndpoints = `
  // 7. INVENTORY & BOM MANAGEMENT ENDPOINTS
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
      broadcastUpdate('inventory_updated', ing);
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

      // Optional: automatically record expense if cost is provided
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
        broadcastUpdate('expense_added', exp);
      }

      saveDB();
      broadcastUpdate('inventory_updated', ing);
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
      broadcastUpdate('inventory_added', newIng);
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
      broadcastUpdate('menu_updated', menuItem);
      return sendJson(res, 200, { success: true, menuItem });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }
`;

// Insert inventory endpoints before Static File Serving
serverJs = serverJs.replace('  // Static File Serving', inventoryEndpoints + '\n  // Static File Serving');
fs.writeFileSync(serverJsPath, serverJs, 'utf-8');
console.log('Updated server.js with Inventory & BOM edit APIs!');
