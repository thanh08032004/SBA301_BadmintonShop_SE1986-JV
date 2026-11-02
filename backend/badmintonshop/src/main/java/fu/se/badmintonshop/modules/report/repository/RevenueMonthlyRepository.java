package fu.se.badmintonshop.modules.report.repository;

import fu.se.badmintonshop.modules.report.entity.RevenueMonthly;
import org.springframework.data.repository.Repository;

import java.util.List;

/** Chỉ đọc: view báo cáo không cho thêm/sửa/xóa. */
public interface RevenueMonthlyRepository extends Repository<RevenueMonthly, String> {
    /** from/to dạng yyyy-MM. */
    List<RevenueMonthly> findByMonthBetweenOrderByMonthAsc(String from, String to);

    List<RevenueMonthly> findAllByOrderByMonthAsc();
}