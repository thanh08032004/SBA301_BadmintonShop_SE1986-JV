package fu.se.badmintonshop.modules.report.repository;

import fu.se.badmintonshop.modules.report.entity.ReturnTicketMonthly;
import org.springframework.data.repository.Repository;

import java.util.List;

/** Chỉ đọc: view báo cáo không cho thêm/sửa/xóa. */
public interface ReturnTicketMonthlyRepository extends Repository<ReturnTicketMonthly, String> {
    /** from/to dạng yyyy-MM. */
    List<ReturnTicketMonthly> findByMonthBetweenOrderByMonthAsc(String from, String to);
}