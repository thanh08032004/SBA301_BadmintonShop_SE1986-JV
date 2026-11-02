package fu.se.badmintonshop.modules.report.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;

import java.time.LocalDate;

/** Customer & Membership Report: khách hàng mới theo ngày và lũy kế. Chỉ đọc, map vào VIEW v_customer_growth trong badminton_shop.sql. */
@Entity
@Immutable
@Table(name = "v_customer_growth")
@Getter
@NoArgsConstructor
public class CustomerGrowth {

    @Id
    @Column(name = "`day`")
    private LocalDate day;

    @Column(name = "new_customers")
    private Integer newCustomers;

    @Column(name = "cumulative_customers")
    private Integer cumulativeCustomers;
}