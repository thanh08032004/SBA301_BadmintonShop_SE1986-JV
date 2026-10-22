import { Button, Form } from 'react-bootstrap';
import Icon from './Icon';

export function ManagerSearch({ value, onChange, placeholder = 'Tìm kiếm…', label = 'Tìm kiếm' }) {
  return (
    <div className="manager-search">
      <Icon name="search" size={19} />
      <Form.Control
        type="search"
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
export function ManagerPagination({ total, page, pageSize = 10, onChange }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, pages);
  const start = Math.max(1, Math.min(current - 2, pages - 4));
  const numbers = Array.from({ length: Math.min(5, pages) }, (_, i) => start + i);
  return (
    <div className="manager-pagination">
      <span className="manager-result-count">
        Hiển thị{' '}
        <strong>
          {total ? (current - 1) * pageSize + 1 : 0}–{Math.min(current * pageSize, total)}
        </strong>{' '}
        trong <strong>{total}</strong> kết quả
      </span>
      <nav aria-label="Phân trang danh sách">
        <Button
          variant="light"
          disabled={current === 1}
          onClick={() => onChange(current - 1)}
          aria-label="Trang trước"
        >
          ‹
        </Button>
        {start > 1 && (
          <>
            <Button variant="light" onClick={() => onChange(1)}>
              1
            </Button>
            {start > 2 && <span>…</span>}
          </>
        )}
        {numbers.map((number) => (
          <Button
            key={number}
            variant={number === current ? 'primary' : 'light'}
            aria-label={'Trang ' + number}
            aria-current={number === current ? 'page' : undefined}
            onClick={() => onChange(number)}
          >
            {number}
          </Button>
        ))}
        {numbers.at(-1) < pages && (
          <>
            {numbers.at(-1) < pages - 1 && <span>…</span>}
            <Button variant="light" onClick={() => onChange(pages)}>
              {pages}
            </Button>
          </>
        )}
        <Button
          variant="light"
          disabled={current === pages}
          onClick={() => onChange(current + 1)}
          aria-label="Trang tiếp theo"
        >
          ›
        </Button>
      </nav>
    </div>
  );
}
