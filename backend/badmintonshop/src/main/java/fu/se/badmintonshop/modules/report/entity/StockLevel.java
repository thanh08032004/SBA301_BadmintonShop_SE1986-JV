package fu.se.badmintonshop.modules.report.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;

import java.math.BigDecimal;

/** Product & Inventory Report: tồn kho hiện tại theo biến thể và cảnh báo sắp hết. Chỉ đọc, map vào VIEW v_stock_level trong badminton_shop.sql. */
@Entity
@Immutable
@Table(name = "v_stock_level")
@Getter
@NoArgsConstructor
public class StockLevel {

    @Id
    @Column(name = "variant_id")
    private Long variantId;

    @Column(name = "sku", length = 60)
    private String sku;

    @Column(name = "product_name")
    private String productName;

    @Column(name = "product_type", length = 20)
    private String productType;

    @Column(name = "color", length = 50)
    private String color;

    @Column(name = "size", length = 30)
    private String size;

    @Column(name = "stock_quantity")
    private Integer stockQuantity;

    @Column(name = "low_stock_threshold")
    private Integer lowStockThreshold;

    /** 1 = sắp hết hàng, 0 = bình thường. */
    @Column(name = "is_low_stock")
    private Integer isLowStock;

    @Column(name = "stock_value", precision = 38, scale = 0)
    private BigDecimal stockValue;

    public boolean lowStock() {
        return isLowStock != null && isLowStock == 1;
    }
}