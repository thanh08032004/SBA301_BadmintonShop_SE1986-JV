import { Nav } from "react-bootstrap";
import { NavLink } from "react-router";
import "./PublicSidebar.css";

const links = [
  { to: "/", label: "Trang chủ", icon: "home" },
  { to: "/products", label: "Tất cả sản phẩm", icon: "products" },
  { to: "/cart", label: "Giỏ hàng", icon: "cart" },
  { to: "/orders", label: "Đơn hàng của tôi", icon: "orders" },
];

function SidebarIcon({ type }) {
  const paths = {
    home: (
      <>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v11a1 1 0 0 0 1 1h4v-7h4v7h4a1 1 0 0 0 1-1V9" />
      </>
    ),
    products: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    cart: (
      <>
        <path d="M3 3h2l2.4 11.2a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 2-1.6L22 7H6" />
        <circle cx="10" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
      </>
    ),
    orders: (
      <>
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <rect x="9" y="2" width="6" height="4" rx="1" />
        <path d="M9 11h6M9 15h6" />
      </>
    ),
  };
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[type]}
    </svg>
  );
}

export default function PublicSidebar() {
  return (
    <aside className="shop-sidebar">
      <div className="eyebrow">KHÁM PHÁ CỬA HÀNG</div>
      <Nav className="flex-column gap-2">
        {links.map(({ to, label, icon }) => (
          <Nav.Link as={NavLink} end to={to} key={to}>
            <span className="sidebar-icon">
              <SidebarIcon type={icon} />
            </span>
            <span>{label}</span>
          </Nav.Link>
        ))}
      </Nav>
      <div className="sidebar-tip">
        <strong>Sẵn sàng ra sân?</strong>
        <p className="small mt-2 mb-0">
          Chọn trang bị phù hợp và tận hưởng từng đường cầu.
        </p>
      </div>
      <p className="small text-secondary mt-4">
        Bạn đang mua sắm bằng tài khoản mẫu.
      </p>
    </aside>
  );
}
