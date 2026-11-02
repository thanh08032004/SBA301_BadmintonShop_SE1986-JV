package fu.se.badmintonshop.modules.report.repository;

import fu.se.badmintonshop.modules.report.entity.BestSellingProduct;
import org.springframework.data.repository.Repository;

import java.util.List;

/** Chỉ đọc: view báo cáo không cho thêm/sửa/xóa. */
public interface BestSellingProductRepository extends Repository<BestSellingProduct, Long> {
    List<BestSellingProduct> findTop10ByOrderByUnitsSoldDesc();

    List<BestSellingProduct> findTop10ByOrderByRevenueDesc();
}