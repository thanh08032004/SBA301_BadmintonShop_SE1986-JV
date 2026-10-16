import { Card } from 'react-bootstrap';
import { complaintStatuses } from '../constants/complaintConstants';

function ComplaintStatusOverview() {
  return (
    <Card className="complaint-card h-100">
      <Card.Body className="p-4">
        <div className="d-flex align-items-start justify-content-between gap-3 mb-4">
          <div>
            <h2 className="complaint-section-title">Tình hình xử lý</h2>
            <p className="complaint-section-description mb-0">
              Phân bổ yêu cầu theo trạng thái.
            </p>
          </div>
          <span className="complaint-period-label">Tất cả thời gian</span>
        </div>

        <div className="complaint-empty-state">
          <div className="complaint-empty-illustration" aria-hidden="true">
            <span className="complaint-empty-illustration-inner">0</span>
          </div>
          <h3>Chưa có yêu cầu khiếu nại</h3>
          <p className="mb-0">
            Số liệu sẽ được cập nhật tại đây khi cửa hàng tiếp nhận phản ánh đầu tiên.
          </p>
        </div>

        <div className="complaint-status-legend">
          {complaintStatuses.map((status) => (
            <span key={status.tone}>
              <i className={`complaint-legend-dot complaint-legend-${status.tone}`} />
              {status.label}
              <b>{status.count}</b>
            </span>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
}

export default ComplaintStatusOverview;
