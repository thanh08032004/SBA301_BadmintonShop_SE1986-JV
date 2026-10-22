import { Spinner } from 'react-bootstrap';

export default function Loading({ text = 'Đang tải…' }) {
  return (
    <div className="p-5 text-center" role="status">
      <Spinner animation="border" />
      <p className="mt-2 mb-0">{text}</p>
    </div>
  );
}
