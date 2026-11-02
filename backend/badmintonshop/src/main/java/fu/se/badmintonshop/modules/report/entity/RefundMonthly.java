package fu.se.badmintonshop.modules.report.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;

import java.math.BigDecimal;

/** Return & Refund Report: số khoản và số tiền đã hoàn theo tháng. Chỉ đọc, map vào VIEW v_refund_monthly trong badminton_shop.sql. */
@Entity
@Immutable
@Table(name = "v_refund_monthly")
@Getter
@NoArgsConstructor
public class RefundMonthly {

    @Id
    @Column(name = "`month`", length = 7)
    private String month;

    @Column(name = "refund_count")
    private Integer refundCount;

    @Column(name = "refunded_amount", precision = 38, scale = 0)
    private BigDecimal refundedAmount;
}