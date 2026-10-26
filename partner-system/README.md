# FastShip Express - Hệ Thống Đối Tác Vận Chuyển Giả Lập (Mock Carrier)

Hệ thống độc lập mô phỏng đơn vị giao vận bên thứ 3 (như GHN / GHTK) cho đồ án **Badminton Shop (SBA301 SE1986-JV)**.

---

## 📌 Phân Bổ Cổng & Công Nghệ

| Thành phần | Cổng (Port) | Công nghệ | Database | Đường dẫn |
| :--- | :---: | :--- | :--- | :--- |
| **FastShip Backend (Partner API)** | **`8081`** | **Java Spring Boot (Java 21)** | **MS SQL Server (`fastship_db`)** | `partner-system/backend` |
| **FastShip Frontend (Tracking Portal)** | **`8082`** | **React.js (Vite)** | -- | `partner-system/frontend` |
| **Badminton Shop Backend** | **`8080`** | **Java Spring Boot (Java 21)** | **MS SQL Server (`badminton_shop`)** | Dự án Shop chính |
| **Badminton Shop Frontend** | **`5173`** | **React.js (Vite)** | -- | `frontend/` |

---

## 🗄️ Hướng Dẫn Cài Đặt Database MS SQL Server

Chạy file script SQL Server tại:
👉 `partner-system/backend/fastship_schema.sql`

File này sẽ:
1. Tạo database: `fastship_db`
2. Tạo 2 bảng: `partner_shipments` và `partner_tracking_events`
3. Nạp sẵn 2 mã vận đơn mẫu để demo: `FS-882910` và `FS-449102`.

---

## 🚀 Hướng Dẫn Khởi Chạy

### 1. Khởi chạy Backend Đối Tác (Port 8081)
Mở terminal tại thư mục `partner-system/backend` (hoặc mở trong IntelliJ / VS Code / Eclipse):
```bash
# Chạy qua Maven
mvn spring-boot:run
```
*(Hoặc chạy trực tiếp file `com.fastship.FastShipApplication.java`)*

### 2. Khởi chạy Frontend Tra Cứu Đối Tác (Port 8082)
Mở terminal tại thư mục `partner-system/frontend`:
```bash
npm install
npm run dev
```
Trình duyệt sẽ mở trang tra cứu tại:
👉 **`http://localhost:8082/track?code=FS-882910`**
