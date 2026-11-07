package com.fastship.service;

import com.fastship.dto.*;
import com.fastship.entity.PartnerShipment;
import com.fastship.entity.PartnerTrackingEvent;
import com.fastship.repository.PartnerShipmentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class ShipmentService {

    private final PartnerShipmentRepository shipmentRepo;
    private final RestTemplate restTemplate;

    @Value("${shop.webhook.url:http://localhost:8080/api/deliveries/webhook}")
    private String defaultWebhookUrl;

    @Value("${tracking.portal.url:http://localhost:8082/track}")
    private String trackingPortalUrl;

    public ShipmentService(PartnerShipmentRepository shipmentRepo, RestTemplate restTemplate) {
        this.shipmentRepo = shipmentRepo;
        this.restTemplate = restTemplate;
    }

    public List<PartnerShipment> getAllShipments() {
        return shipmentRepo.findAll();
    }

    public PartnerShipment getShipment(String trackingCode) {
        return shipmentRepo.findById(trackingCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bưu phẩm với mã vận đơn: " + trackingCode));
    }

    @Transactional
    public Map<String, Object> createShipment(CreateShipmentRequest req) {
        if (req.getReceiverName() == null || req.getReceiverPhone() == null || req.getShippingAddress() == null) {
            throw new IllegalArgumentException("Thiếu thông tin người nhận hoặc địa chỉ giao hàng.");
        }

        String trackingCode = "FS-" + (100000 + new Random().nextInt(900000));
        String serviceType = req.getServiceType() != null ? req.getServiceType() : "standard";

        BigDecimal fee = "express".equalsIgnoreCase(serviceType) ? BigDecimal.valueOf(60000)
                : "fast".equalsIgnoreCase(serviceType) ? BigDecimal.valueOf(45000)
                : BigDecimal.valueOf(30000);

        int days = "express".equalsIgnoreCase(serviceType) ? 1 : "fast".equalsIgnoreCase(serviceType) ? 2 : 3;
        LocalDateTime estDate = LocalDateTime.now().plusDays(days);

        PartnerShipment shipment = new PartnerShipment();
        shipment.setTrackingCode(trackingCode);
        shipment.setShopOrderId(req.getShopOrderId());
        shipment.setOrderCode(req.getOrderCode());
        shipment.setServiceType(serviceType);
        shipment.setServiceName("express".equalsIgnoreCase(serviceType) ? "FastShip Hỏa Tốc"
                : "fast".equalsIgnoreCase(serviceType) ? "FastShip Giao Nhanh" : "FastShip Tiêu Chuẩn");
        shipment.setShippingFee(req.getShippingFee() != null ? req.getShippingFee() : fee);
        shipment.setCodAmount(req.getCodAmount() != null ? req.getCodAmount() : BigDecimal.ZERO);
        shipment.setStatus("pending_pickup");
        shipment.setStatusText("Đã tạo vận đơn trên FastShip Express - Chờ bưu tá đến lấy hàng");
        shipment.setReceiverName(req.getReceiverName());
        shipment.setReceiverPhone(req.getReceiverPhone());
        shipment.setShippingAddress(req.getShippingAddress());
        shipment.setPackageDesc(req.getPackageDesc() != null ? req.getPackageDesc() : "Dụng cụ cầu lông");
        shipment.setPackageWeightGram(req.getPackageWeightGram() != null ? req.getPackageWeightGram() : 500);
        shipment.setEstimatedDeliveryDate(estDate);
        shipment.setWebhookUrl(req.getWebhookUrl() != null ? req.getWebhookUrl() : defaultWebhookUrl);

        PartnerTrackingEvent initialEvent = new PartnerTrackingEvent(
                "pending_pickup",
                "Tạo vận đơn thành công",
                "Cổng API FastShip Express",
                "Shop đã đẩy thông tin và được cấp mã vận đơn " + trackingCode + ". Đang điều phối bưu tá lấy hàng."
        );
        shipment.addEvent(initialEvent);

        shipmentRepo.save(shipment);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("tracking_code", trackingCode);
        result.put("tracking_url", trackingPortalUrl + "?code=" + trackingCode);
        result.put("carrier", "fastship");
        result.put("service_type", serviceType);
        result.put("shipping_fee", shipment.getShippingFee());
        result.put("estimated_delivery_date", estDate);
        result.put("status", shipment.getStatus());
        result.put("status_text", shipment.getStatusText());
        return result;
    }

    public Map<String, Object> calculateFee(CalculateFeeRequest req) {
        String serviceType = req.getServiceType() != null ? req.getServiceType() : "standard";
        int baseFee = "express".equalsIgnoreCase(serviceType) ? 60000 : "fast".equalsIgnoreCase(serviceType) ? 45000 : 30000;
        int weight = req.getWeightGram() != null ? req.getWeightGram() : 500;
        int extraFee = weight > 1000 ? (int) Math.ceil((weight - 1000) / 500.0) * 5000 : 0;
        int days = "express".equalsIgnoreCase(serviceType) ? 1 : "fast".equalsIgnoreCase(serviceType) ? 2 : 3;

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("shipping_fee", baseFee + extraFee);
        res.put("service_type", serviceType);
        res.put("estimated_delivery_days", days);
        res.put("currency", "VND");
        return res;
    }

    @Transactional
    public PartnerShipment advanceStatus(String trackingCode, AdvanceStatusRequest req) {
        PartnerShipment shipment = getShipment(trackingCode);
        String targetStatus = req.getStatus();
        String note = req.getNote();
        LocalDateTime now = LocalDateTime.now();

        shipment.setStatus(targetStatus);
        String eventTitle = "Cập nhật hành trình";
        String eventLocation = "Bưu cục FastShip";

        if ("in_transit".equals(targetStatus) || "picked_up".equals(targetStatus)) {
            shipment.setStatusText("Đã lấy hàng - Đang luân chuyển qua kho trung chuyển");
            if (shipment.getShippedAt() == null) shipment.setShippedAt(now);
            eventTitle = "Bưu tá đã lấy hàng thành công";
            eventLocation = "Kho đóng gói Badminton Shop";
        } else if ("out_for_delivery".equals(targetStatus)) {
            shipment.setStatusText("Bưu tá đang trên đường đi giao cho người nhận");
            eventTitle = "Bưu tá bắt đầu phát hàng";
            eventLocation = "Bưu cục phát gần nhất";
        } else if ("delivered".equals(targetStatus)) {
            shipment.setStatusText("Giao hàng thành công - Khách đã nhận và ký xác nhận");
            shipment.setDeliveredAt(now);
            eventTitle = "Giao hàng thành công";
            eventLocation = shipment.getShippingAddress();
        } else if ("delivery_failed".equals(targetStatus)) {
            shipment.setStatusText("Giao không thành công - Chờ liên hệ phát lại");
            eventTitle = "Giao hàng không thành công";
            eventLocation = shipment.getShippingAddress();
        }

        PartnerTrackingEvent event = new PartnerTrackingEvent(
                targetStatus,
                eventTitle,
                eventLocation,
                note != null && !note.isEmpty() ? note : shipment.getStatusText()
        );
        shipment.addEvent(event);
        shipmentRepo.save(shipment);

        // Kích hoạt Webhook gửi sang Badminton Shop Backend
        triggerShopWebhook(shipment, "status_updated");

        return shipment;
    }

    @Transactional
    public PartnerShipment cancelShipment(String trackingCode) {
        PartnerShipment shipment = getShipment(trackingCode);
        shipment.setStatus("cancelled");
        shipment.setStatusText("Vận đơn đã bị hủy theo yêu cầu của Shop");

        PartnerTrackingEvent event = new PartnerTrackingEvent(
                "cancelled",
                "Hủy vận đơn",
                "Hệ thống FastShip Express",
                "Shop đã hủy yêu cầu vận chuyển kiện hàng này."
        );
        shipment.addEvent(event);
        shipmentRepo.save(shipment);

        triggerShopWebhook(shipment, "cancelled");
        return shipment;
    }

    public void triggerShopWebhook(PartnerShipment shipment, String eventType) {
        String targetUrl = shipment.getWebhookUrl() != null ? shipment.getWebhookUrl() : defaultWebhookUrl;
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-Partner-Carrier", "FastShip-Express");
            headers.set("X-Partner-Signature", "sig_" + Base64.getEncoder().encodeToString(shipment.getTrackingCode().getBytes()));

            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("event", eventType);
            payload.put("carrier", "fastship");
            payload.put("tracking_code", shipment.getTrackingCode());
            payload.put("order_code", shipment.getOrderCode());
            payload.put("shop_order_id", shipment.getShopOrderId());
            payload.put("status", shipment.getStatus());
            payload.put("status_text", shipment.getStatusText());
            payload.put("cod_amount", shipment.getCodAmount());
            payload.put("shipper_name", shipment.getShipperName());
            payload.put("shipper_phone", shipment.getShipperPhone());
            payload.put("shipped_at", shipment.getShippedAt());
            payload.put("delivered_at", shipment.getDeliveredAt());
            payload.put("timestamp", LocalDateTime.now().toString());

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            restTemplate.postForEntity(targetUrl, entity, String.class);
            System.out.println("[FastShip Webhook] Đã gửi thông báo thành công tới " + targetUrl);
        } catch (Exception e) {
            System.out.println("[FastShip Webhook] Chưa thể kết nối Shop BE tại " + targetUrl + " (" + e.getMessage() + ")");
        }
    }
}
