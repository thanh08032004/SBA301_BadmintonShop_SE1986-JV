import { ManagerSearch, ManagerPagination } from '../../management/ManagerControls';
import { useMemo, useState } from "react";
import { Alert, Badge, Card, Form, Table } from "react-bootstrap";
import { Link, useLocation } from "react-router";
import {
  ticketStatuses,
  ticketTypes,
} from "../supportTicketConstants";
import { useShop } from "../../shop/ShopContext";

const EMPTY_LIST = [];

function formatDate(date) {
  if (!date) return "Chưa cập nhật";
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "Chưa cập nhật";
  return parsedDate.toLocaleString("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function SupportTicketManagementPage() {
  const { data } = useShop();
  const { state } = useLocation();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const tickets = data.support_tickets || EMPTY_LIST;
  const orders = data.orders || EMPTY_LIST;
  const normalizedQuery = query.trim().toLocaleLowerCase("vi");

  const filteredTickets = useMemo(
    () =>
      [...tickets]
        .filter((ticket) => {
          const order = orders.find((item) => item.id === ticket.order_id);
          const matchesStatus =
            statusFilter === "all" || ticket.status === statusFilter;
          const searchableText = [
            ticket.ticket_code,
            ticket.reason,
            ticket.user_id,
            order?.order_code,
            order?.receiver_name,
            order?.receiver_phone,
          ]
            .filter(Boolean)
            .join(" ")
            .toLocaleLowerCase("vi");
          return (
            matchesStatus &&
            (!normalizedQuery || searchableText.includes(normalizedQuery))
          );
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    [normalizedQuery, orders, statusFilter, tickets],
  );

  const countByStatus = (status) =>
    tickets.filter((ticket) => ticket.status === status).length;

  return (
    <section className="manager-page manager-support-page">
      <div className="eyebrow">QUẢN LÝ VẬN HÀNH</div>
      <div className="manager-title">
        <div>
          <h1 className="h2 fw-bold mb-2">Quản lý support ticket</h1>
          <p className="text-secondary mb-0">
            Tiếp nhận yêu cầu, theo dõi trạng thái và phản hồi khách hàng.
          </p>
        </div>
        <Badge bg="light" text="dark" className="fs-6">
          {tickets.length} phiếu
        </Badge>
      </div>

      {state?.updated && (
        <Alert variant="success">Đã cập nhật xử lý phiếu hỗ trợ.</Alert>
      )}

      <div className="row g-3 mb-4">
        {[
          ["Mới gửi", countByStatus("open"), "primary"],
          ["Đang xem xét", countByStatus("under_review"), "warning"],
          ["Đã chấp thuận", countByStatus("approved"), "success"],
          ["Đã hoàn tất", countByStatus("resolved"), "success"],
        ].map(([label, count, variant]) => (
          <div className="col-6 col-xl-3" key={label}>
            <Card className="border-0 h-100">
              <Card.Body className="p-3">
                <div className="small text-secondary">{label}</div>
                <div className={`fs-3 fw-bold text-${variant}`}>{count}</div>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>

      <Card className="border-0">
        <Card.Body className="p-3 p-md-4">
          <div className="row g-3 mb-3">
            <div className="col-md-8">
              <Form.Label htmlFor="ticket-search">Tìm kiếm phiếu</Form.Label>
              <ManagerSearch label="Tìm kiếm phiếu" value={query} onChange={value => { setQuery(value); setPage(1); }} placeholder="Tìm mã phiếu, khách hàng, đơn hàng…" />
            </div>
            <div className="col-md-4">
              <Form.Label htmlFor="ticket-status-filter">Trạng thái</Form.Label>
              <Form.Select
                id="ticket-status-filter"
                value={statusFilter}
                onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}
              >
                <option value="all">Tất cả trạng thái</option>
                {Object.entries(ticketStatuses).map(([value, status]) => (
                  <option key={value} value={value}>
                    {status.label}
                  </option>
                ))}
              </Form.Select>
            </div>
          </div>

          {filteredTickets.length === 0 ? (
            <div className="empty-state">
              <h2 className="h5 fw-bold">Không tìm thấy phiếu hỗ trợ</h2>
              <p className="text-secondary mb-0">
                Thử thay đổi từ khóa hoặc bộ lọc trạng thái.
              </p>
            </div>
          ) : (
            <Table responsive hover className="manager-table align-middle mb-0">
              <thead>
                <tr>
                  <th>Mã phiếu</th>
                  <th>Khách hàng / Đơn hàng</th>
                  <th>Loại yêu cầu</th>
                  
                  <th>Trạng thái</th>
                  <th className="manager-action-cell text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.slice((Math.min(page, Math.max(1, Math.ceil(filteredTickets.length / 10))) - 1) * 10, Math.min(page, Math.max(1, Math.ceil(filteredTickets.length / 10))) * 10).map((ticket) => {
                  const status = ticketStatuses[ticket.status] || {
                    label: ticket.status || "Chưa xác định",
                    variant: "secondary",
                  };
                  const order = orders.find(
                    (item) => item.id === ticket.order_id,
                  );
                  return (
                    <tr key={ticket.id}>
                      <td>
                        <Link
                          to={`/management/support-tickets/${encodeURIComponent(ticket.id)}`}
                          className="fw-semibold text-decoration-none"
                        >
                          {ticket.ticket_code}
                        </Link>
                        <small className="d-block text-secondary">{formatDate(ticket.created_at)}</small>
                      </td>
                      <td>
                        <div>{order?.receiver_name || ticket.user_id}</div>
                        <div className="small text-secondary">
                          {order?.order_code || "Không có thông tin đơn hàng"}
                        </div>
                      </td>
                      <td>{ticketTypes[ticket.ticket_type] || ticket.ticket_type}</td>

                      <td>
                        <Badge
                          bg={status.variant}
                          text={status.variant === "warning" ? "dark" : undefined}
                        >
                          {status.label}
                        </Badge>
                      </td>
                      <td className="text-end">
                        <Link
                          to={`/management/support-tickets/${encodeURIComponent(ticket.id)}`}
                          className="btn btn-sm btn-outline-primary text-nowrap"
                        >
                          Xem / xử lý
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
          <ManagerPagination total={filteredTickets.length} page={page} onChange={setPage} />
        </Card.Body>
      </Card>
    </section>
  );
}
