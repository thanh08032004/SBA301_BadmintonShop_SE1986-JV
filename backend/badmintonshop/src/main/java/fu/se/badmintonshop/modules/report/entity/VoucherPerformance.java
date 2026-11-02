package fu.se.badmintonshop.modules.report.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;

import java.math.BigDecimal;

/** Sales Report: hiệu quả voucher: số lần dùng, tổng giảm giá, doanh thu kèm voucher. Chỉ đọc, map vào VIEW v_voucher_performance trong badminton_shop.sql. */
@Entity
@Immutable
@Table(name = "v_voucher_performance")
@Getter
@NoArgsConstructor
public class VoucherPerformance {

    @Id
    @Column(name = "voucher_id")
    private Integer voucherId;

    @Column(name = "code", length = 40)
    private String code;

    @Column(name = "name")
    private String name;

    @Column(name = "times_used")
    private Integer timesUsed;

    @Column(name = "total_discount", precision = 38, scale = 0)
    private BigDecimal totalDiscount;

    @Column(name = "revenue_with_voucher", precision = 38, scale = 0)
    private BigDecimal revenueWithVoucher;
}