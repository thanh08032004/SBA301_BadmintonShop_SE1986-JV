package com.fastship.dto;

public class CalculateFeeRequest {
    private String serviceType = "standard";
    private Integer weightGram = 500;

    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }
    public Integer getWeightGram() { return weightGram; }
    public void setWeightGram(Integer weightGram) { this.weightGram = weightGram; }
}
