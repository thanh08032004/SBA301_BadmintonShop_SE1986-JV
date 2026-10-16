import { Card, Col, Row } from 'react-bootstrap';

function ComplaintStats({ stats }) {
  return (
    <Row className="g-3 g-xl-4 mb-4">
      {stats.map((stat) => (
        <Col key={stat.label} xs={12} sm={6} xl={3}>
          <Card className="complaint-stat-card h-100">
            <Card.Body className="d-flex align-items-center gap-3">
              <div className={`complaint-stat-icon complaint-stat-icon-${stat.tone}`}>
                {stat.icon}
              </div>
              <div className="flex-grow-1">
                <div className="complaint-stat-label">{stat.label}</div>
                <div className="complaint-stat-value">{stat.value}</div>
              </div>
              <span className="complaint-stat-period">Hiện tại</span>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}

export default ComplaintStats;
