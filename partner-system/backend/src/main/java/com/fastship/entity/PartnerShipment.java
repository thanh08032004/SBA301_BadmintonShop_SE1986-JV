package com.fastship.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "partner_shipments")
public class PartnerShipment {

    @Id
    @Column(name = "tracking_code", length = 50)
    private String trackingCode;

    @Column(name = "shop_order_id", length = 100)
    private String shopOrderId;

    @Column(name = "order_code", length = 100)
    private String orderCode;

    @Column(name = "service_type", length = 50, nullable = false)
    private String serviceType = "standard";

    @Column(name = "service_name", length = 100, nullable = false)
    private String serviceName = "FastShip Tiêu Chuẩn";

    @Column(name = "shipping_fee", nullable = false)
    private BigDecimal shippingFee = BigDecimal.valueOf(30000);

    @Column(name = "cod_amount", nullable = false)
    private BigDecimal codAmount = BigDecimal.ZERO;

    @Column(name = "status", length = 50, nullable = false)
    private String status = "pending_pickup";

    @Column(name = "status_text")
    private String statusText;

    @Column(name = "receiver_name", length = 150, nullable = false)
    private String receiverName;

    @Column(name = "receiver_phone", length = 30, nullable = false)
    private String receiverPhone;

    @Column(name = "shipping_address", length = 500, nullable = false)
    private String shippingAddress;

    @Column(name = "package_desc")
    private String packageDesc;

    @Column(name = "package_weight_gram", nullable = false)
    private Integer packageWeightGram = 500;

    @Column(name = "shipper_name", length = 100)
    private String shipperName = "Nguyễn Văn Tuấn (FastShip)";

    @Column(name = "shipper_phone", length = 30)
    private String shipperPhone = "0987.654.321";

    @Column(name = "shipper_license", length = 50)
    private String shipperLicense = "29-B1 999.88";

    @Column(name = "estimated_delivery_date")
    private LocalDateTime estimatedDeliveryDate;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "shipped_at")
    private LocalDateTime shippedAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "webhook_url", length = 500)
    private String webhookUrl = "http://localhost:8080/api/deliveries/webhook";

    @OneToMany(mappedBy = "shipment", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("occurredAt DESC")
    private List<PartnerTrackingEvent> events = new ArrayList<>();

    public PartnerShipment() {}

    // Getters and Setters
    public String getTrackingCode() { return trackingCode; }
    public void setTrackingCode(String trackingCode) { this.trackingCode = trackingCode; }

    public String getShopOrderId() { return shopOrderId; }
    public void setShopOrderId(String shopOrderId) { this.shopOrderId = shopOrderId; }

    public String getOrderCode() { return orderCode; }
    public void setOrderCode(String orderCode) { this.orderCode = orderCode; }

    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }

    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }

    public BigDecimal getShippingFee() { return shippingFee; }
    public void setShippingFee(BigDecimal shippingFee) { this.shippingFee = shippingFee; }

    public BigDecimal getCodAmount() { return codAmount; }
    public void setCodAmount(BigDecimal codAmount) { this.codAmount = codAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getStatusText() { return statusText; }
    public void setStatusText(String statusText) { this.statusText = statusText; }

    public String getReceiverName() { return receiverName; }
    public void setReceiverName(String receiverName) { this.receiverName = receiverName; }

    public String getReceiverPhone() { return receiverPhone; }
    public void setReceiverPhone(String receiverPhone) { this.receiverPhone = receiverPhone; }

    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }

    public String getPackageDesc() { return packageDesc; }
    public void setPackageDesc(String packageDesc) { this.packageDesc = packageDesc; }

    public Integer getPackageWeightGram() { return packageWeightGram; }
    public void setPackageWeightGram(Integer packageWeightGram) { this.packageWeightGram = packageWeightGram; }

    public String getShipperName() { return shipperName; }
    public void setShipperName(String shipperName) { this.shipperName = shipperName; }

    public String getShipperPhone() { return shipperPhone; }
    public void setShipperPhone(String shipperPhone) { this.shipperPhone = shipperPhone; }

    public String getShipperLicense() { return shipperLicense; }
    public void setShipperLicense(String shipperLicense) { this.shipperLicense = shipperLicense; }

    public LocalDateTime getEstimatedDeliveryDate() { return estimatedDeliveryDate; }
    public void setEstimatedDeliveryDate(LocalDateTime estimatedDeliveryDate) { this.estimatedDeliveryDate = estimatedDeliveryDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getShippedAt() { return shippedAt; }
    public void setShippedAt(LocalDateTime shippedAt) { this.shippedAt = shippedAt; }

    public LocalDateTime getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(LocalDateTime deliveredAt) { this.deliveredAt = deliveredAt; }

    public String getWebhookUrl() { return webhookUrl; }
    public void setWebhookUrl(String webhookUrl) { this.webhookUrl = webhookUrl; }

    public List<PartnerTrackingEvent> getEvents() { return events; }
    public void setEvents(List<PartnerTrackingEvent> events) { this.events = events; }

    public void addEvent(PartnerTrackingEvent event) {
        events.add(0, event);
        event.setShipment(this);
    }
}
