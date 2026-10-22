import { Button } from 'react-bootstrap';
import { Link } from 'react-router';

export default function HomeButton({ onClick }) {
  return (
    <Button
      {...(onClick ? { onClick } : { as: Link, to: '/' })}
      variant="outline-secondary"
      className="home-button"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" />
      </svg>
      <span>Về trang chủ</span>
    </Button>
  );
}
