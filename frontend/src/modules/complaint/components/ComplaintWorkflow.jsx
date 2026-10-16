import { Card } from 'react-bootstrap';
import { complaintWorkflowSteps } from '../constants/complaintConstants';

function ComplaintWorkflow() {
  return (
    <Card className="complaint-card h-100">
      <Card.Body className="p-4">
        <div className="mb-4">
          <h2 className="complaint-section-title">Quy trình xử lý</h2>
          <p className="complaint-section-description mb-0">
            Các bước xử lý một phản ánh từ lúc tiếp nhận đến khi hoàn tất.
          </p>
        </div>

        <div className="complaint-workflow">
          {complaintWorkflowSteps.map((step, index) => (
            <div className="complaint-workflow-step" key={step.number}>
              <div className="complaint-workflow-marker">
                <span>{step.number}</span>
                {index < complaintWorkflowSteps.length - 1 && <i />}
              </div>
              <div className="complaint-workflow-copy">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
}

export default ComplaintWorkflow;
