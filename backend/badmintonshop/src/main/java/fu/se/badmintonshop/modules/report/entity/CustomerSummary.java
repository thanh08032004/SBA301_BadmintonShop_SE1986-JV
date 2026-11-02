package fu.se.badmintonshop.modules.report.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Customer & Membership Report: tổng hợp mua hàng của từng khách. Chỉ đọc, map vào VIEW v_customer_summary trong badminton_shop.sql. */
@Entity
@Immutable
@Table(name = "v_customer_summary")
@Getter
@NoArgsConstructor
public class CustomerSummary {

    @Id
    @Column(name = "customer_id")
    private Long customerId;

    @Column(name = "full_name", length = 150)
    private String fullName;

    @Column(name = "email", length = 190)
    private String email;

    @Column(name = "phone", length = 20)
    private String phone;

    /** active | inactive | locked */
    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "registered_at")
    private LocalDateTime registeredAt;

    @Column(name = "total_orders")
    private Integer totalOrders;

    @Column(name = "completed_orders")
    private Integer completedOrders;

    /** Tổng tiền các đơn completed + paid. */
    @Column(name = "total_spent", precision = 38, scale = 0)
    private BigDecimal totalSpent;

    @Column(name = "first_order_at")
    private LocalDateTime firstOrderAt;

    @Column(name = "last_order_at")
    private LocalDateTime lastOrderAt;
}