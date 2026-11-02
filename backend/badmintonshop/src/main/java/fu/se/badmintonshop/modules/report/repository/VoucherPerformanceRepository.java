package fu.se.badmintonshop.modules.report.repository;

import fu.se.badmintonshop.modules.report.entity.VoucherPerformance;
import org.springframework.data.repository.Repository;

import java.util.List;

/** Chỉ đọc: view báo cáo không cho thêm/sửa/xóa. */
public interface VoucherPerformanceRepository extends Repository<VoucherPerformance, Integer> {
    List<VoucherPerformance> findAllByOrderByTimesUsedDesc();
}