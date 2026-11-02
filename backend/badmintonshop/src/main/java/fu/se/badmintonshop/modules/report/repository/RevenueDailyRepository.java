package fu.se.badmintonshop.modules.report.repository;

import fu.se.badmintonshop.modules.report.entity.RevenueDaily;
import org.springframework.data.repository.Repository;
import java.time.LocalDate;
import java.util.List;

/** Chỉ đọc: view báo cáo không cho thêm/sửa/xóa. */
public interface RevenueDailyRepository extends Repository<RevenueDaily, LocalDate> {
    List<RevenueDaily> findByDayBetweenOrderByDayAsc(LocalDate from, LocalDate to);

    List<RevenueDaily> findAllByOrderByDayAsc();
}