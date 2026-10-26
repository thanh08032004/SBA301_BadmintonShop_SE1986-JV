# Kế Hoạch Xây Dựng Backend Delivery Module & Hệ Thống Đối Tác Vận Chuyển Giả Lập (Mock Partner System)

Tài liệu này vạch ra toàn bộ kiến trúc, thiết kế API, cơ sở dữ liệu và lộ trình triển khai cho **Delivery Module** của Badminton Shop và **Hệ thống Đối tác Vận chuyển Giả lập (Mock 3rd-Party Carrier)**.

> [!IMPORTANT]
> **Công nghệ & Môi trường đã chốt:**
> - **Shop Backend**: **Java Spring Boot** (Spring Data JPA, REST Controller, SQL Server theo file `badminton_shop.sql`, port `8080`).
> - **Shop Frontend**: **React + Vite** hiện tại (port `5173`).
> - **Đối tác (FastShip) Backend**: **Node.js / Express** (nhẹ, độc lập, cung cấp mock REST API + Webhook, port `4000`).
> - **Đối tác (FastShip) Frontend**: **Ứng dụng Web mini độc lập** chuyên tra cứu bưu phẩm (port `5174`, redirect từ Shop qua `http://localhost:5174/track?code=...`).

---

## 1. Tổng Quan Kiến Trúc & Luồng Hoạt Động (Architecture Overview)

Hệ thống được chia thành 2 phân hệ độc lập:

1. **Hệ thống Đối tác Giả lập (Mock Partner - FastShip Express)**:
   - **Partner Backend (BE)**: Đóng vai trò là hệ thống bưu cục bên thứ 3 (tương tự API của GHN / GHTK / Viettel Post), cung cấp API tạo đơn, tính phí, tra cứu, hủy và cơ chế bắn Webhook về Shop.
   - **Partner Frontend (FE)**: Trang web tra cứu công khai bưu phẩm (`FastShip Tracking Portal`), mở ra khi quản trị viên hoặc khách hàng bấm *"Tra cứu trên website đối tác"*. Trang này tích hợp **Sandbox Control Panel** để người demo có thể trực tiếp chuyển trạng thái đơn hàng (Lấy hàng -> Đang phát -> Giao thành công).
2. **Badminton Shop Delivery Backend**:
   - Quản lý vận đơn nội bộ shop, ánh xạ đơn hàng (`orders`) sang vận đơn (`shipments`).
   - Gọi sang API của Partner qua tầng `CarrierGatewayAdapter`.
   - Nhận Webhook từ Partner hoặc cung cấp nút "Đồng bộ trạng thái" (Pull Sync).
   - Tự động cập nhật trạng thái đơn hàng (`orders.status`) và thanh toán COD khi giao thành công.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Nhân viên / Quản trị Shop
    participant ShopFE as Badminton Shop (FE)
    participant ShopBE as Badminton Shop (BE)
    participant PartnerBE as FastShip Express (BE)
    participant PartnerFE as FastShip Tracking (FE)
    actor Customer as Khách mua hàng

    Note over Admin, PartnerBE: Luồng 1: Tạo vận đơn
    Admin->>ShopFE: Bấm "Tạo vận đơn" cho đơn hàng đã chuẩn bị
    ShopFE->>ShopBE: POST /api/deliveries (order_id, service_type, note)
    ShopBE->>PartnerBE: POST /api/v1/shipments/create (API Key, thông tin người nhận, COD)
    PartnerBE-->>ShopBE: 201 Created (tracking_code: "FS-882910", public_tracking_url)
    ShopBE->>ShopBE: Lưu vào bảng shipments & shipment_events
    ShopBE-->>ShopFE: Tạo vận đơn thành công

    Note over Customer, PartnerFE: Luồng 2: Tra cứu ngoài trang đối tác
    Customer->>ShopFE: Bấm "Tra cứu trên website đối tác"
    ShopFE->>PartnerFE: Redirect / Open tab mới: https://fastship.vn/tracking?code=FS-882910
    PartnerFE->>PartnerBE: GET /api/v1/shipments/track/FS-882910
    PartnerBE-->>PartnerFE: Trả về toàn bộ hành trình, vị trí, shipper
    PartnerFE-->>Customer: Hiển thị giao diện bưu cục đối tác sang xịn

    Note over PartnerFE, ShopBE: Luồng 3: Cập nhật & Đồng bộ trạng thái
    PartnerFE->>PartnerBE: Demo Sandbox: Bấm "Bưu tá giao hàng thành công"
    PartnerBE->>PartnerBE: Cập nhật status = "delivered", thêm event log
    alt Cách A: Webhook (Tự động)
        PartnerBE->>ShopBE: POST /api/deliveries/webhook (tracking_code, status, signature)
        ShopBE->>ShopBE: Cập nhật shipment status, order.status = "completed"
    else Cách B: Shop chủ động bấm Đồng bộ (Pull Sync)
        Admin->>ShopFE: Bấm "Đồng bộ từ ĐVVC"
        ShopFE->>ShopBE: POST /api/deliveries/{id}/sync
        ShopBE->>PartnerBE: GET /api/v1/shipments/track/{code}
        PartnerBE-->>ShopBE: Status mới nhất
        ShopBE->>ShopBE: Cập nhật local DB
    end
```

---

## 2. Giai Đoạn 1: Xây Dựng Hệ Thống Đối Tác Giả Lập (Mock Partner)

Đặt tên đối tác: **FastShip Express** (Mã ĐVVC: `fastship`).

### 2.1. Thiết kế Cơ sở Dữ liệu của Đối tác (FastShip DB)
Bảng dữ liệu độc lập (lưu trữ riêng, không chung database với shop):
- **`partner_orders`**:
  - `tracking_code` (PK, VARCHAR 30, e.g. `FS1202610189`): Mã vận đơn đối tác cấp.
  - `shop_order_id`: Mã tham chiếu đơn hàng của Shop.
  - `shop_api_key`: API key xác thực của shop.
  - `sender_name`, `sender_phone`, `sender_address`: Thông tin bưu cục gửi hàng của Shop.
  - `receiver_name`, `receiver_phone`, `receiver_address`: Thông tin người nhận.
  - `package_weight_gram`, `package_items_desc`: Trọng lượng, mô tả kiện hàng.
  - `service_type` (`standard` | `fast` | `express`).
  - `cod_amount` (Số tiền thu hộ COD).
  - `shipping_fee` (Cước phí vận chuyển).
  - `status` (`pending_pickup` -> `in_transit` -> `out_for_delivery` -> `delivered` / `delivery_failed` / `cancelled`).
  - `shipper_name`, `shipper_phone`: Bưu tá phân công phụ trách.
  - `estimated_delivery_date`: Dự kiến giao.
  - `webhook_url`: URL webhook của Shop đăng ký khi tạo đơn.
- **`partner_tracking_events`**:
  - `id`, `tracking_code` (FK).
  - `status`: Trạng thái tại thời điểm ghi nhận.
  - `location`: Bưu cục / Trạm trung chuyển (Ví dụ: "Kho trung chuyển Cầu Giấy, Hà Nội").
  - `description`: Chi tiết hành trình.
  - `occurred_at`: Thời gian xảy ra.

### 2.2. Danh Sách API của FastShip Express (Partner Backend)
Tất cả API bưu cục sử dụng Header: `Authorization: Bearer fastship_secret_key_sba301`.

| Phương thức | Endpoint | Mô tả chức năng | Request Body chính | Response chính |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/shipments/calculate-fee` | Báo giá cước vận chuyển & thời gian giao dự kiến | `weight`, `from_province`, `to_province`, `service_type` | `shipping_fee`, `estimated_delivery_days` |
| `POST` | `/api/v1/shipments/create` | Tạo vận đơn bưu cục mới | `shop_order_id`, `receiver_info`, `cod_amount`, `package_desc`, `webhook_url` | `tracking_code`, `tracking_url`, `status`, `estimated_delivery` |
| `GET` | `/api/v1/shipments/track/:code` | Tra cứu chi tiết vận đơn & timeline hành trình | Không có | Chi tiết bưu kiện, shipper, danh sách `events` sắp xếp theo thời gian |
| `POST` | `/api/v1/shipments/:code/cancel` | Hủy vận đơn (khi bưu tá chưa lấy hàng) | `reason` | `success: true`, `status: "cancelled"` |
| `POST` | `/api/v1/shipments/:code/simulate-status` | **API Sandbox (Dành riêng cho test & demo)**: Đổi trạng thái sang bước tiếp theo hoặc chỉ định trạng thái cụ thể | `status` (`in_transit`, `out_for_delivery`, `delivered`, ...), `note`, `location` | `tracking_code`, `new_status`, `events`, tự động trigger webhook gửi sang Shop |

### 2.3. Thiết Kế Frontend của Đối Tác (FastShip Tracking Portal)
Trang web chuyên biệt phục vụ redirect tra cứu:
- **Địa chỉ truy cập**: `http://localhost:port/tracking?code=FS...` (hoặc mở cửa sổ popup / tab mới).
- **Giao diện người dùng (UI)**:
  - Header: Logo **FastShip Express**, Hotline hỗ trợ bưu chính `1900 6868`, ô nhập tìm kiếm mã vận đơn khác.
  - Thanh tiến trình trạng thái trực quan (Status Stepper Bar):
    - Đã tạo đơn -> Bưu tá tiếp nhận -> Đang trung chuyển -> Đang phát hàng -> Giao thành công.
  - Bảng thông tin kiện hàng: Người nhận (ẩn 3 số giữa điện thoại để bảo mật), địa chỉ giao, trọng lượng, số tiền COD cần thu.
  - Thẻ thông tin bưu tá (Shipper Card): Tên tài xế, số điện thoại, biển số xe, đánh giá sao.
  - Nhật ký hành trình thời gian thực (Timeline Event History): Thời gian, trạm bưu cục, ghi chú bưu tá.
  - **Khung Điều Khiển Giả Lập (Sandbox Tool) ở góc màn hình**:
    - Chỉ hiển thị trong môi trường demo/dev.
    - Cung cấp các nút: *"Bưu tá lấy hàng"*, *"Đang giao hàng"*, *"Giao thành công & Ký nhận"*, *"Giao thất bại"*, *"Bắn Webhook về Shop ngay"*.
    - Giúp giảng viên / hội đồng / nhóm có thể kiểm chứng luồng hoạt động 2 chiều một cách ấn tượng.

---

## 3. Giai Đoạn 2: Xây Dựng Backend Delivery Module (Badminton Shop)

### 3.1. Thiết kế Cơ sở Dữ liệu của Shop (Dựa trên SQL Server Schema đã có)
Khớp với bảng `carriers`, `shipments`, `shipment_events` trong [badminton_shop.sql](file:///d:/Documents/Ki%207/SBA301/Group%20Project/SBA301_BadmintonShop_SE1986-JV/badminton_shop.sql):
- **`carriers`**:
  - `id`: 1
  - `code`: `fastship` (mặc định đối tác chính)
  - `name`: `FastShip Express`
  - `is_active`: 1
  - `api_endpoint`: `http://localhost:PORT_PARTNER/api/v1`
  - `api_token`: `fastship_secret_key_sba301`
- **`shipments`**:
  - `id` (BIGINT IDENTITY PK)
  - `order_id` (FK -> `orders.id`)
  - `carrier_id` (FK -> `carriers.id`)
  - `tracking_code` (VARCHAR 80, lưu mã của FastShip cấp)
  - `status` (`preparing`, `picked_up`, `in_transit`, `out_for_delivery`, `delivered`, `failed`, `returned`, `cancelled`)
  - `cod_amount` (DECIMAL)
  - `cod_collected_at` (DATETIME2)
  - `shipped_at`, `delivered_at`
  - `carrier_tracking_url` (NVARCHAR 500: URL redirect sang trang tra cứu đối tác)
  - `last_synced_at` (DATETIME2)
- **`shipment_events`**:
  - `id`, `shipment_id` (FK)
  - `status`, `description`, `location`, `occurred_at`

### 3.2. Cấu Trúc Mã Nguồn Backend (Clean Layered Architecture)
```text
delivery-module/
├── controllers/
│   └── DeliveryController.js (hoặc DeliveryController.java)
│       ├── POST /api/deliveries           (Tạo vận đơn)
│       ├── GET  /api/deliveries           (Danh sách vận đơn, lọc, phân trang)
│       ├── GET  /api/deliveries/:id       (Chi tiết vận đơn & logs)
│       ├── POST /api/deliveries/:id/sync  (Chủ động kéo dữ liệu từ FastShip)
│       ├── POST /api/deliveries/:id/cancel(Hủy vận đơn)
│       └── POST /api/deliveries/webhook   (Nhận sự kiện Webhook từ FastShip)
├── services/
│   ├── DeliveryService            (Xử lý nghiệp vụ lưu trữ, kiểm tra đơn hàng, cập nhật Order status)
│   └── CarrierIntegrationService  (Giao tiếp HTTP sang hệ thống đối tác)
├── gateways/
│   ├── ICaptierGateway.js/java    (Interface chung để mở rộng sau này)
│   └── FastShipGatewayAdapter     (Hiện thực hóa giao tiếp với FastShip Express)
└── models / repositories/
    ├── ShipmentRepository
    └── ShipmentEventRepository
```

### 3.3. Các Nghiệp Vụ Xử Lý Quan Trọng
1. **Tạo vận đơn (`create_shipment`)**:
   - Kiểm tra `order.status` phải là `pending` hoặc `processing`.
   - Kiểm tra đơn chưa có shipment hoặc shipment cũ đã hủy.
   - Gọi `FastShipGatewayAdapter.createShipment()`.
   - Nhận về `tracking_code` và `tracking_url`.
   - Cập nhật `orders.status = 'shipping'`.
   - Ghi nhận event khởi tạo vào `shipment_events`.
2. **Đồng bộ trạng thái (`sync_carrier_status` & `webhook`)**:
   - Khi trạng thái từ FastShip chuyển sang `delivered`:
     - Cập nhật `shipment.status = 'delivered'`, `delivered_at = NOW()`.
     - Nếu có COD, cập nhật `cod_collected_at = NOW()`.
     - Cập nhật `orders.status = 'completed'`.
     - Nếu đơn hàng chưa thanh toán (`unpaid`), cập nhật `orders.payment_status = 'paid'`, hoàn tất thanh toán COD.
   - Khi trạng thái là `delivery_failed`:
     - Ghi nhận lý do thất bại vào `shipment_events` để CSKH liên hệ khách.

---

## 4. Giai Đoạn 3: Tích Hợp Frontend Shop Với Trang Đối Tác

1. **Cập nhật cấu hình Carrier**:
   - Sửa file [deliveryConstants.js](file:///d:/Documents/Ki%207/SBA301/Group%20Project/SBA301_BadmintonShop_SE1986-JV/frontend/src/modules/delivery/deliveryConstants.js):
   - Đặt `fastship` làm đối tác mặc định.
   - Cấu hình `trackingUrl`:
     ```javascript
     fastship: {
       code: "fastship",
       name: "FastShip Express",
       shortName: "FastShip",
       badgeColor: "#2563eb",
       badgeBg: "#dbeafe",
       hotline: "1900 6868",
       website: "http://localhost:5174/fastship",
       trackingUrl: (code) => `http://localhost:5174/fastship/track?code=${encodeURIComponent(code)}`,
     }
     ```
2. **Kiểm tra liên kết Redirect tại 3 trang**:
   - [DeliveryManagementPage.jsx](file:///d:/Documents/Ki%207/SBA301/Group%20Project/SBA301_BadmintonShop_SE1986-JV/frontend/src/modules/delivery/pages/DeliveryManagementPage.jsx): Icon link mở trang tra cứu của FastShip trong tab mới.
   - [DeliveryManagementDetailPage.jsx](file:///d:/Documents/Ki%207/SBA301/Group%20Project/SBA301_BadmintonShop_SE1986-JV/frontend/src/modules/delivery/pages/DeliveryManagementDetailPage.jsx): Nút "Tra cứu trên website ĐVVC".
   - [OrderTrackingPage.jsx](file:///d:/Documents/Ki%207/SBA301/Group%20Project/SBA301_BadmintonShop_SE1986-JV/frontend/src/modules/delivery/pages/OrderTrackingPage.jsx): Nút ngoài trang khách hàng.

---

## 5. Lộ Trình Triển Khai Chi Tiết (Implementation Roadmap)

| Bước | Hạng mục công việc | Sản phẩm đầu ra | Ước lượng |
| :---: | :--- | :--- | :---: |
| **Bước 1** | **Xây dựng FastShip Mock Backend (API Carrier)**<br>- Khởi tạo service FastShip với Express/Node hoặc Spring Boot.<br>- Viết API tạo đơn, tra cứu, hủy, mô phỏng đổi trạng thái, webhook push. | Chạy cổng riêng (ví dụ `PORT: 4000`), có tài liệu Postman hoặc Swagger để test độc lập. | 1 buổi |
| **Bước 2** | **Xây dựng FastShip Tracking Portal (Frontend đối tác)**<br>- Trang giao diện tra cứu bưu cục theo mã `?code=FS...`<br>- Thiết kế Stepper hành trình, bản đồ giả lập, bưu tá.<br>- Tích hợp thanh Sandbox Control Panel để đổi trạng thái tức thì. | Trang web tra cứu độc lập, redirect được từ URL có param `code`. | 1 buổi |
| **Bước 3** | **Xây dựng Shop Delivery Backend (Tích hợp)**<br>- Hiện thực các bảng `shipments`, `shipment_events`.<br>- Viết Service gọi API FastShip (`create_shipment`, `sync`).<br>- Viết endpoint nhận Webhook từ FastShip. | Backend Shop hoàn chỉnh, có test case tích hợp với FastShip. | 1 buổi |
| **Bước 4** | **Kết nối Frontend Shop & Hoàn thiện E2E Flow**<br>- Cập nhật `deliveryConstants.js`.<br>- Kết nối các nút "Tạo vận đơn", "Đồng bộ", "Tra cứu đối tác" trên Shop UI.<br>- Test kịch bản luân chuyển trạng thái từ FastShip FE -> Shop FE. | Luồng hoạt động mượt mà từ A đến Z, sẵn sàng demo bảo vệ dự án. | Nửa buổi |

---

## 6. Kịch Bản Demo Chuẩn (Showcase Script Cho Thầy Cô / Hội Đồng)

1. **Bước 1 (Tại Shop Admin)**: Vào trang quản lý đơn hàng -> Chọn đơn ở trạng thái đã chuẩn bị hàng -> Bấm **"Tạo vận đơn FastShip"**. Hệ thống gọi sang FastShip BE, sinh mã `FS-882901`.
2. **Bước 2 (Mở Trang Đối Tác)**: Tại trang Vận đơn, bấm icon **"Tra cứu trên website đối tác"** -> Trình duyệt mở sang **FastShip Tracking Portal** hiển thị giao diện của công ty bưu chính với mã `FS-882901`, trạng thái "Chờ lấy hàng".
3. **Bước 3 (Thao tác trên Trang Đối Tác)**: Trên trang FastShip, sử dụng thanh công cụ Sandbox bấm **"Bưu tá tiếp nhận kiện hàng"** rồi bấm **"Giao hàng thành công"**. FastShip BE tự động bắn Webhook về Shop BE.
4. **Bước 4 (Quay lại Shop)**: Quay lại trang Quản lý đơn hàng của Badminton Shop -> Thấy đơn đã tự động chuyển sang **"Hoàn thành"**, tiền COD đã được đối soát thành công mà không cần sửa tay trong database.
