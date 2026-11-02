package fu.se.badmintonshop.modules.report.repository;

import fu.se.badmintonshop.modules.report.entity.CustomerGrowth;
import org.springframework.data.repository.Repository;
import java.time.LocalDate;
import java.util.List;

/** Chỉ đọc: view báo cáo không cho thêm/sửa/xóa. */
public interface CustomerGrowthRepository extends Repository<CustomerGrowth, LocalDate> {
    List<CustomerGrowth> findByDayBetweenOrderByDayAsc(LocalDate from, LocalDate to);
}