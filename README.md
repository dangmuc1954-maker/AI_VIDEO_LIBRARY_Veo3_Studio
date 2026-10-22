# 🎬 Veo 3 Studio Pro — Độc Lập 100% & Toàn Quyền Sở Hữu

Bộ công cụ Desktop sản xuất video AI tự động hóa kết nối trực tiếp **Google Labs (Veo 3 / Banana Flow)**, **Grok Video & Image**, **ChatGPT**, **ElevenLabs (TTS)** và hệ thống **Visual Node Canvas Workflow**.

Toàn bộ mã nguồn đã được tách biệt hoàn toàn, **100% độc lập, không còn bất kỳ liên kết hay phụ thuộc nào vào máy chủ bên ngoài của bên thứ ba**.

---

## 🌟 Độc Quyền & Độc Lập Tuyệt Đối

1. **Không phụ thuộc Server bên thứ ba**:
   - Mọi cơ chế kiểm tra bản quyền, telemetries, và cập nhật từ bên ngoài đã bị cắt bỏ hoàn toàn.
   - Ứng dụng chạy offline/standalone vĩnh viễn với quyền **Lifetime Enterprise Pro Unlimited** cho chính bạn.
2. **Hệ Thống Cho Thuê License Thương Mại Độc Quyền Duy Nhất**:
   - **Web Cấp Key & Quản Trị Duy Nhất**: 👉 **`https://vercelserver-eight.vercel.app/admin`**
   - **Mã nguồn Serverless Cloud**: Thư mục `vercel_server/`
   - Quản trị viên quản lý toàn diện: Bảng doanh thu theo tháng, cấp key, gia hạn, Reset máy (ngắt license tức thì), Ban HWID / Ban IP (Blacklist), tích hợp thanh toán tự động VietQR SePay.
3. **Bộ Cài Đặt Giao Khách Hàng**:
   - 👉 **`dist/AI_VIDEO_LIBRARY_Setup_v3.0.exe`** (Bộ cài đặt Native 1-click tự động).

---

## 📁 Cấu Trúc Dự Án Hoàn Chỉnh

```text
AIForge_Veo3_Studio/
├── app/                        # Ứng dụng Desktop Độc Lập (Veo 3 Studio Pro)
│   ├── out/
│   │   ├── main/               # Backend Electron Engine (Tự động hóa Veo3, Grok, TTS)
│   │   ├── preload/            # Preload IPC Bridge
│   │   └── renderer/           # Giao diện Studio Dark Glassmorphism
│   └── package.json            # Thông tin định danh ứng dụng riêng của bạn
├── electron_bin/                # Bộ chạy Electron nhúng sẵn offline
├── license_server/             # Máy chủ cấp phép & quản trị cho thuê bản quyền riêng
│   ├── admin/                  # Giao diện Web Admin Dashboard quản lý key
│   ├── data/                   # Cơ sở dữ liệu key & khách hàng
│   ├── cryptoUtils.js          # Bộ sinh mã & ký số Ed25519
│   └── server.js               # Máy chủ cấp phép độc lập
├── scripts/                    # Các công cụ build, vá lỗi và đóng gói
│   ├── apply_standalone_patch.js
│   ├── build_distributable_client.js
│   └── test_license_flow.js
├── dist/                       # Thư mục xuất bản gói cho khách thuê
├── run.bat                     # File 1-click khởi chạy Veo 3 Studio Pro cho bạn
├── run_license_server.bat      # File 1-click chạy máy chủ cấp phép cho thuê
└── README.md                   # Hướng dẫn chi tiết
```

---

## ⚡ Hướng Dẫn Sử Dụng

### 1. Dùng Cho Bản Thân (Full Tính Năng Vĩnh Viễn):
Nhấp đúp chuột vào file:
📂 [`run.bat`](file:///d:/dự%20án%20antigravity/AIForge_Veo3_Studio/run.bat)

### 2. Mở Máy Chủ Quản Trị Cho Thuê Key:
Nhấp đúp chuột vào file:
📂 [`run_license_server.bat`](file:///d:/dự%20án%20antigravity/AIForge_Veo3_Studio/run_license_server.bat)
Truy cập Web Quản Trị: `http://localhost:8787/admin`
