package com.fastship.dto;

import java.math.BigDecimal;

public class CreateShipmentRequest {
    private String shopOrderId;
    private String orderCode;
    private String serviceType = "standard";
    private BigDecimal shippingFee;
    private BigDecimal codAmount = BigDecimal.ZERO;
    private String receiverName;
    private String receiverPhone;
    private String shippingAddress;
    private String packageDesc;
    private Integer packageWeightGram = 500;
    private String webhookUrl;

    public String getShopOrderId() { return shopOrderId; }
    public void setShopOrderId(String shopOrderId) { this.shopOrderId = shopOrderId; }
    public String getOrderCode() { return orderCode; }
    public void setOrderCode(String orderCode) { this.orderCode = orderCode; }
    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }
    public BigDecimal getShippingFee() { return shippingFee; }
    public void setShippingFee(BigDecimal shippingFee) { this.shippingFee = shippingFee; }
    public BigDecimal getCodAmount() { return codAmount; }
    public void setCodAmount(BigDecimal codAmount) { this.codAmount = codAmount; }
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
    public String getWebhookUrl() { return webhookUrl; }
    public void setWebhookUrl(String webhookUrl) { this.webhookUrl = webhookUrl; }
}
