package fu.se.badmintonshop.modules.report.repository;

import fu.se.badmintonshop.modules.report.entity.StockLevel;
import org.springframework.data.repository.Repository;

import java.util.List;

/** Chỉ đọc: view báo cáo không cho thêm/sửa/xóa. */
public interface StockLevelRepository extends Repository<StockLevel, Long> {
    List<StockLevel> findByIsLowStockOrderByStockQuantityAsc(Integer isLowStock);

    List<StockLevel> findAllByOrderByProductNameAsc();
}