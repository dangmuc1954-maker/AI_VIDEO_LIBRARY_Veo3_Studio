# 🚀 HƯỚNG DẪN BẬT TỰ ĐỘNG HÓA THƯƠNG MẠI (SEPAY ➔ TỰ ĐỘNG CẤP KEY)

Tài liệu chuẩn bị đầy đủ 100% để ngày mai anh liên kết SePay với tài khoản BIDV và tự động hóa toàn bộ việc bán/cho thuê app!

---

## 🏗️ 1. Sơ Đồ Quy Trình Tự Động Hoá Hoàn Chỉnh

```text
Khách Mở App ➔ Bấm "Buy Pro" (299k)
       │
       ▼
App Hiện Mã QR VietQR BIDV (5902789999 - Phan Đặng Hồng Hà)
       │
       ▼
Khách Quét Mã Chuyển Khoản (Nội dung: AIFORGE AFxxxxxx)
       │
       ▼
Ngân hàng BIDV nhận tiền ➔ Báo về SePay.vn (1 giây)
       │
       ▼
SePay bắn Webhook về Server của anh: /api/webhook/payment
       │
       ▼
Server tự động sinh Key Pro + Ký Chữ Ký Số Ed25519
       │
       ▼
App của khách tự động nhận Key ➔ Bật Xanh Lá "Active License"
       │
       ▼
🎉 Khách dùng Full tính năng ngay tại chỗ! (Tris nhận 100% tiền về BIDV)
```

---

## 🛠️ 2. Các Bước Kết Nối SePay Ngày Mai (Mất 2 Phút)

### Bước 1: Đăng ký SePay
- Vào trang: **`https://my.sepay.vn`**
- Đăng ký tài khoản (Dùng gói Miễn Phí).

### Bước 2: Thêm Ngân Hàng BIDV
- Vào menu **"Tài khoản ngân hàng"** ➔ Bấm **"Thêm tài khoản"**.
- Chọn **BIDV** ➔ Nhập STK: **`5902789999`** ➔ Tên: **PHAN DANG HONG HA**.
- Làm theo hướng dẫn kết nối của SePay để nhận biến động số dư.

### Bước 3: Cài Webhook về Server của Anh
- Vào menu **"Tích hợp Webhook"** trên SePay:
  - **URL Webhook**: `http://IP_VPS_CUA_ANH:8787/api/webhook/payment`
    *(Nếu anh test trên máy tính ở nhà, có thể dùng Ngrok/Cloudflare Tunnel hoặc đưa server lên VPS)*
  - **Kiểu dữ liệu (Content-Type)**: `application/json`
- Bấm **"Lưu Webhook"**.

---

## 📁 3. Danh Mục Các File Đã Chuẩn Bị Xong

| Tên File | Chức Năng |
| :--- | :--- |
| **`dist/AIForge_Studio_Customer_Edition`** | Thư mục nén gửi cho khách tải về (đã khóa bản quyền, sạch 100% tài khoản, không hiện CMD). |
| **`Start_License_Server_Silent.vbs`** | Chạy máy chủ quản trị ngầm (0% hiện CMD đen) + tự mở Web Admin `http://localhost:8787/admin`. |
| **`Stop_License_Server.bat`** | Dừng máy chủ khi cần. |
| **`Tao_Key_Nhanh.bat`** | Công cụ tạo Key nhanh 1 giây (dành cho bán qua Zalo/Facebook). |
| **`run.bat`** | Bản VIP mở khóa vĩnh viễn dùng cho riêng anh Tris. |

---

## 🌟 Tất cả đã sẵn sàng 100% cho ngày mai anh nhé!
