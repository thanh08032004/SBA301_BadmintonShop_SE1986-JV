import { Col, Container, Row } from 'react-bootstrap';
import ComplaintStats from '../components/ComplaintStats';
import ComplaintStatusOverview from '../components/ComplaintStatusOverview';
import ComplaintWorkflow from '../components/ComplaintWorkflow';
import { complaintStats } from '../constants/complaintConstants';
import '../assets/ComplaintDashboard.css';

function ComplaintDashboard() {
  return (
    <Container fluid className="complaint-page px-0 py-4 py-lg-5">
      <div className="complaint-heading mb-4">
        <div className="complaint-heading-copy">
          <p className="complaint-eyebrow mb-2">BADMINTON SHOP</p>
          <h1 className="h3 fw-bold mb-2">Tổng quan khiếu nại</h1>
          <p className="text-secondary mb-0">
            Theo dõi và quản lý các phản ánh từ khách hàng.
          </p>
        </div>
        <span className="complaint-live-badge">
          <span className="complaint-live-dot" />
          Trung tâm khiếu nại
        </span>
      </div>

      <ComplaintStats stats={complaintStats} />

      <Row className="g-4 align-items-stretch">
        <Col xl={7}>
          <ComplaintStatusOverview />
        </Col>

        <Col xl={5}>
          <ComplaintWorkflow />
        </Col>
      </Row>

      <div className="complaint-note mt-4">
        <span className="complaint-note-mark" aria-hidden="true">i</span>
        <p className="mb-0">
          Dashboard hiện chỉ hiển thị số liệu tổng quan, chưa có danh sách yêu cầu khiếu nại.
        </p>
      </div>
    </Container>
  );
}

export default ComplaintDashboard;
