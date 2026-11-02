package fu.se.badmintonshop.modules.report.repository;

import fu.se.badmintonshop.modules.report.entity.CustomerSummary;
import org.springframework.data.repository.Repository;

import java.util.List;

/** Chỉ đọc: view báo cáo không cho thêm/sửa/xóa. */
public interface CustomerSummaryRepository extends Repository<CustomerSummary, Long> {
    List<CustomerSummary> findTop10ByOrderByTotalSpentDesc();

    List<CustomerSummary> findAllByOrderByTotalSpentDesc();
}