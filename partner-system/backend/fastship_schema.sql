-- =====================================================================
-- FASTSHIP EXPRESS - MOCK CARRIER DATABASE (MS SQL SERVER)
-- =====================================================================
IF NOT EXISTS (SELECT name FROM master.dbo.sysdatabases WHERE name = N'fastship_db')
BEGIN
    CREATE DATABASE fastship_db;
END
GO

USE fastship_db;
GO

-- 1. BẢNG QUẢN LÝ VẬN ĐƠN (PARTNER SHIPMENTS)
IF OBJECT_ID('partner_tracking_events', 'U') IS NOT NULL DROP TABLE partner_tracking_events;
IF OBJECT_ID('partner_shipments', 'U') IS NOT NULL DROP TABLE partner_shipments;
GO

CREATE TABLE partner_shipments (
    tracking_code           VARCHAR(50) PRIMARY KEY,
    shop_order_id           VARCHAR(100) NULL,
    order_code              VARCHAR(100) NULL,
    service_type            VARCHAR(50) NOT NULL DEFAULT 'standard',
    service_name            NVARCHAR(100) NOT NULL DEFAULT N'FastShip Tiêu Chuẩn',
    shipping_fee            DECIMAL(18, 0) NOT NULL DEFAULT 30000,
    cod_amount              DECIMAL(18, 0) NOT NULL DEFAULT 0,
    status                  VARCHAR(50) NOT NULL DEFAULT 'pending_pickup',
    status_text             NVARCHAR(255) NULL,
    receiver_name           NVARCHAR(150) NOT NULL,
    receiver_phone          VARCHAR(30) NOT NULL,
    shipping_address        NVARCHAR(500) NOT NULL,
    package_desc            NVARCHAR(255) NULL,
    package_weight_gram     INT NOT NULL DEFAULT 500,
    shipper_name            NVARCHAR(100) NULL DEFAULT N'Nguyễn Văn Tuấn (FastShip)',
    shipper_phone           VARCHAR(30) NULL DEFAULT '0987.654.321',
    shipper_license         VARCHAR(50) NULL DEFAULT '29-B1 999.88',
    estimated_delivery_date DATETIME2 NULL,
    created_at              DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    shipped_at              DATETIME2 NULL,
    delivered_at            DATETIME2 NULL,
    webhook_url             VARCHAR(500) NOT NULL DEFAULT 'http://localhost:8080/api/deliveries/webhook'
);
GO

-- 2. BẢNG NHẬT KÝ HÀNH TRÌNH BƯU CỤC (PARTNER TRACKING EVENTS)
CREATE TABLE partner_tracking_events (
    id                      BIGINT IDENTITY(1,1) PRIMARY KEY,
    tracking_code           VARCHAR(50) NOT NULL,
    status                  VARCHAR(50) NOT NULL,
    title                   NVARCHAR(150) NOT NULL,
    location                NVARCHAR(255) NOT NULL,
    description             NVARCHAR(500) NULL,
    occurred_at             DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT fk_tracking_shipment FOREIGN KEY (tracking_code) 
        REFERENCES partner_shipments(tracking_code) ON DELETE CASCADE
);
CREATE INDEX idx_pte_code_time ON partner_tracking_events(tracking_code, occurred_at DESC);
GO

-- 3. SEED DỮ LIỆU MẪU ĐỂ TEST
INSERT INTO partner_shipments (
    tracking_code, shop_order_id, order_code, service_type, service_name, shipping_fee, cod_amount,
    status, status_text, receiver_name, receiver_phone, shipping_address, package_desc, package_weight_gram,
    shipper_name, shipper_phone, shipper_license, estimated_delivery_date, created_at, shipped_at, delivered_at
) VALUES 
('FS-882910', '01a01a92-e0a8-43f7-8aaf-fb7f823b9a7b', 'BS-1792148654606-01a0', 'standard', N'FastShip Tiêu Chuẩn', 30000, 0,
 'in_transit', N'Đang luân chuyển qua Kho trung chuyển Miền Bắc', N'Phạm Thành', '0326538343', 
 N'Số 12 ngõ 45, Đường Lê Lợi, Phường Bãi Cháy, TP. Hạ Long, Quảng Ninh', N'1x Vợt Yonex Astrox 88D Play, 1x Bao vợt', 650,
 N'Nguyễn Hoàng Nam', '0987.654.321', '29-G1 888.99', DATEADD(day, 2, SYSDATETIME()), DATEADD(day, -1, SYSDATETIME()), SYSDATETIME(), NULL),

('FS-449102', '10ca4e90-90a9-4c9f-bc14-a5739b90aaa6', 'BS-1792149500903-10ca', 'fast', N'FastShip Hỏa Tốc', 45000, 1280000,
 'out_for_delivery', N'Bưu tá đang trên đường đi giao', N'Trần Đức Thắng', '0912.334.455',
 N'Tầng 5, Tòa nhà FPT Tower, Cầu Giấy, Hà Nội', N'1x Giày cầu lông Yonex Power Cushion 39', 900,
 N'Lê Văn Hưng', '0904.556.778', '30-P4 234.56', SYSDATETIME(), DATEADD(hour, -5, SYSDATETIME()), DATEADD(hour, -3, SYSDATETIME()), NULL);

INSERT INTO partner_tracking_events (tracking_code, status, title, location, description, occurred_at) VALUES
('FS-882910', 'in_transit', N'Nhập kho trung chuyển Miền Bắc', N'Trung tâm khai thác FastShip Long Biên, Hà Nội', N'Kiện hàng đang được phân loại tự động và xếp lên xe tuyến Hà Nội - Quảng Ninh.', SYSDATETIME()),
('FS-882910', 'picked_up', N'Bưu tá lấy hàng thành công', N'Bưu cục Cầu Giấy, Hà Nội', N'Bưu tá Nguyễn Hoàng Nam đã nhận bưu kiện từ Badminton Shop.', DATEADD(hour, -4, SYSDATETIME())),
('FS-882910', 'pending_pickup', N'Tạo vận đơn thành công', N'Cổng API FastShip Express', N'Badminton Shop đã tạo đơn vận chuyển trên cổng API FastShip.', DATEADD(hour, -6, SYSDATETIME())),

('FS-449102', 'out_for_delivery', N'Bưu tá bắt đầu phát hàng', N'Bưu cục Dịch Vọng Hậu, Cầu Giấy', N'Bưu tá Lê Văn Hưng (0904.556.778) đang mang kiện hàng đi giao.', SYSDATETIME()),
('FS-449102', 'in_transit', N'Đến bưu cục phát', N'Bưu cục Dịch Vọng Hậu, Cầu Giấy', N'Kiện hàng đã cập bến bưu cục phát.', DATEADD(hour, -2, SYSDATETIME())),
('FS-449102', 'pending_pickup', N'Tạo đơn hỏa tốc', N'Cổng API FastShip Express', N'Đơn hỏa tốc được tiếp nhận ưu tiên.', DATEADD(hour, -5, SYSDATETIME()));
GO
