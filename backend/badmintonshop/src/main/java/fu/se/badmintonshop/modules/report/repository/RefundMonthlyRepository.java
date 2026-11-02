package fu.se.badmintonshop.modules.report.repository;

import fu.se.badmintonshop.modules.report.entity.RefundMonthly;
import org.springframework.data.repository.Repository;

import java.util.List;

/** Chỉ đọc: view báo cáo không cho thêm/sửa/xóa. */
public interface RefundMonthlyRepository extends Repository<RefundMonthly, String> {
    /** from/to dạng yyyy-MM. */
    List<RefundMonthly> findByMonthBetweenOrderByMonthAsc(String from, String to);
}