# SBA301 Badminton Shop

Web bán đồ cầu lông của nhóm SE1986-JV (môn SBA301).

| Phần | Công nghệ | Thư mục |
| --- | --- | --- |
| Frontend | React 19, Vite, React Router, React Bootstrap | `frontend/` |
| Backend (chưa làm) | Spring Boot REST API, chạy ở `http://localhost:8080` | `backend/` |
| Cơ sở dữ liệu | MS SQL Server | |
| Hệ thống giao hàng đối tác (giả lập) | FastShip | `partner-system/` (chạy bằng `npm run partner` trong `frontend/`) |

Hiện frontend dùng mock API (Vite middleware, dữ liệu ở `frontend/mock/db.json`). Khi có backend, đặt `VITE_USE_MOCK=false` trong `frontend/.env` để chuyển `/api` sang backend.

## Bắt đầu

```bash
cd frontend
npm install
npm run dev
```

## Tài liệu

- [Hướng dẫn sử dụng frontend](frontend/README.md)
- [Quy tắc đóng góp và clean code](frontend/CONTRIBUTING.md)
