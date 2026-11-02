package fu.se.badmintonshop.modules.report.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Sales Report: doanh thu theo ngày (đơn completed + paid). Chỉ đọc, map vào VIEW v_revenue_daily trong badminton_shop.sql. */
@Entity
@Immutable
@Table(name = "v_revenue_daily")
@Getter
@NoArgsConstructor
public class RevenueDaily {

    @Id
    @Column(name = "`day`")
    private LocalDate day;

    @Column(name = "orders")
    private Integer orders;

    @Column(name = "revenue", precision = 38, scale = 0)
    private BigDecimal revenue;
}