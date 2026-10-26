package com.fastship.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "partner_tracking_events")
public class PartnerTrackingEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tracking_code", nullable = false)
    @JsonIgnore
    private PartnerShipment shipment;

    @Column(name = "status", length = 50, nullable = false)
    private String status;

    @Column(name = "title", length = 150, nullable = false)
    private String title;

    @Column(name = "location", length = 255, nullable = false)
    private String location;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "occurred_at", nullable = false)
    private LocalDateTime occurredAt = LocalDateTime.now();

    public PartnerTrackingEvent() {}

    public PartnerTrackingEvent(String status, String title, String location, String description) {
        this.status = status;
        this.title = title;
        this.location = location;
        this.description = description;
        this.occurredAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public PartnerShipment getShipment() { return shipment; }
    public void setShipment(PartnerShipment shipment) { this.shipment = shipment; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getOccurredAt() { return occurredAt; }
    public void setOccurredAt(LocalDateTime occurredAt) { this.occurredAt = occurredAt; }
}
