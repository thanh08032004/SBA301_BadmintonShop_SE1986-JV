package fu.se.badmintonshop.modules.report.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;

import java.math.BigDecimal;

/** Product & Inventory Report: sản phẩm bán chạy (tính trên đơn completed + paid). Chỉ đọc, map vào VIEW v_best_selling_products trong badminton_shop.sql. */
@Entity
@Immutable
@Table(name = "v_best_selling_products")
@Getter
@NoArgsConstructor
public class BestSellingProduct {

    @Id
    @Column(name = "product_id")
    private Long productId;

    @Column(name = "name")
    private String name;

    @Column(name = "product_type", length = 20)
    private String productType;

    @Column(name = "units_sold")
    private Integer unitsSold;

    @Column(name = "revenue", precision = 38, scale = 0)
    private BigDecimal revenue;
}