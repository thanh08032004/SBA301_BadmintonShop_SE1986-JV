package fu.se.badmintonshop.modules.report.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;

import java.math.BigDecimal;

/** Sales Report: doanh thu theo tháng, month dạng yyyy-MM. Chỉ đọc, map vào VIEW v_revenue_monthly trong badminton_shop.sql. */
@Entity
@Immutable
@Table(name = "v_revenue_monthly")
@Getter
@NoArgsConstructor
public class RevenueMonthly {

    @Id
    @Column(name = "`month`", length = 7)
    private String month;

    @Column(name = "orders")
    private Integer orders;

    @Column(name = "revenue", precision = 38, scale = 0)
    private BigDecimal revenue;
}