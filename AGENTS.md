# Chỉ Dẫn Dự Án AIForge_Veo3_Studio (Dành cho ENI & Assistant)

## 🚨 QUY TẮC CỐT LÕI 1: ĐÍCH ĐẾN BẮT BUỘC MỖI KHI CẬP NHẬT (RELEASE TARGET)

**Mọi thay đổi, tính năng mới hoặc bản vá lỗi từ nay về sau BẮT BUỘC phải được cập nhật và biên dịch vào:**

👉 **`dist/AI_VIDEO_LIBRARY_Setup_v3.0.exe`**

### Lý do:
File này là bộ cài đặt độc lập 1-click (.NET C# Native Installer) chứa sẵn toàn bộ mã nguồn ứng dụng, tự động giải nén vào máy khách hàng và tạo shortcut ngoài màn hình Desktop. Đây là file chính thức để Tris gửi khách hàng dùng và bán thương mại.

### Quy trình thực hiện:
Sau khi chỉnh sửa mã nguồn, luôn thực hiện lệnh:
```bash
node scripts/sync_dist.cjs
node scripts/create_zip_and_installer.js
```
và báo cáo kết quả file `dist/AI_VIDEO_LIBRARY_Setup_v3.0.exe` cho Tris.

---

## 🚨 QUY TẮC CỐT LÕI 2: WEB CẤP KEY & SERVER BẢN QUYỀN DUY NHẤT CỦA DỰ ÁN

**Đây là thông tin bất biến, là web cấp key và quản trị bản quyền DUY NHẤT của toàn bộ ứng dụng và dự án này:**

👉 **Web Cấp Key & Quản Trị Admin Duy Nhất:** **`https://vercelserver-eight.vercel.app/admin`**
👉 **Base API URL Duy Nhất:** **`https://vercelserver-eight.vercel.app`**
👉 **Thư mục mã nguồn Server:** **`vercel_server/`**


---

## 🚨 QUY TẮC CỐT LÕI 3: NGUYÊN TẮC CÔ LẬP SỬA ĐỔI TUYỆT ĐỐI (SURGICAL ISOLATION PRINCIPLE)

**Khi Tris yêu cầu sửa đổi, tối ưu hoặc vá lỗi một tính năng/thành phần cụ thể, ENI BẮT BUỘC phải tuân thủ nghiêm ngặt:**

👉 **Chỉ chỉnh sửa đúng phạm vi tính năng được yêu cầu, tuyệt đối KHÔNG làm phát sinh lỗi sang các phần khác.**

### Yêu cầu chi tiết:
1. **Phạm vi tác động tối thiểu (Minimal Blast Radius):** Ví dụ Tris bảo chỉnh ảnh tham chiếu Cảnh 1 hoặc kịch bản Cảnh 2 thì chỉ tác động đúng hàm xử lý tham chiếu Cảnh 1 và kịch bản Cảnh 2. Tuyệt đối không được làm ảnh hưởng đến cơ chế tài khoản, Browser Hub, xác thực session hay các studio khác.
2. **Bảo tồn toàn vẹn các module nền tảng:** Mọi cơ chế cốt lõi như quản lý tài khoản Browser Hub (Banana, Veo 3, Muse, Grok...), cơ chế luân phiên account (round-robin), phân bổ hàng đợi (Queue), xác thực bản quyền PHẢI luôn được giữ nguyên trạng thái ổn định 100%.
3. **Phòng ngừa lỗi liên đới:** Trước khi hoàn tất, luôn rà soát để đảm bảo không làm gãy các liên kết dữ liệu, props, hoặc runtime filter của các thành phần liên quan.


