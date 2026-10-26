package com.fastship.controller;

import com.fastship.dto.*;
import com.fastship.entity.PartnerShipment;
import com.fastship.service.ShipmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/shipments")
@CrossOrigin(origins = "*")
public class ShipmentController {

    private final ShipmentService shipmentService;

    public ShipmentController(ShipmentService shipmentService) {
        this.shipmentService = shipmentService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PartnerShipment>>> getAllShipments() {
        return ResponseEntity.ok(ApiResponse.ok(shipmentService.getAllShipments()));
    }

    @GetMapping("/track/{trackingCode}")
    public ResponseEntity<ApiResponse<PartnerShipment>> getShipment(@PathVariable String trackingCode) {
        return ResponseEntity.ok(ApiResponse.ok(shipmentService.getShipment(trackingCode)));
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createShipment(@RequestBody CreateShipmentRequest req) {
        Map<String, Object> data = shipmentService.createShipment(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Tạo vận đơn FastShip thành công.", data));
    }

    @PostMapping("/calculate-fee")
    public ResponseEntity<ApiResponse<Map<String, Object>>> calculateFee(@RequestBody CalculateFeeRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(shipmentService.calculateFee(req)));
    }

    @PostMapping("/{trackingCode}/advance-status")
    public ResponseEntity<ApiResponse<PartnerShipment>> advanceStatus(
            @PathVariable String trackingCode,
            @RequestBody AdvanceStatusRequest req) {
        PartnerShipment updated = shipmentService.advanceStatus(trackingCode, req);
        return ResponseEntity.ok(ApiResponse.ok("Đã cập nhật trạng thái vận đơn thành công.", updated));
    }

    @PostMapping("/{trackingCode}/cancel")
    public ResponseEntity<ApiResponse<PartnerShipment>> cancelShipment(@PathVariable String trackingCode) {
        PartnerShipment cancelled = shipmentService.cancelShipment(trackingCode);
        return ResponseEntity.ok(ApiResponse.ok("Đã hủy vận đơn thành công.", cancelled));
    }

    @PostMapping("/{trackingCode}/dispatch-webhook")
    public ResponseEntity<ApiResponse<String>> dispatchWebhook(@PathVariable String trackingCode) {
        PartnerShipment shipment = shipmentService.getShipment(trackingCode);
        shipmentService.triggerShopWebhook(shipment, "manual_sync");
        return ResponseEntity.ok(ApiResponse.ok("Đã kích hoạt Webhook bắn sang Shop BE.", trackingCode));
    }
}
