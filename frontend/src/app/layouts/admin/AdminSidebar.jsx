import { NavLink } from 'react-router';

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-title">QUẢN TRỊ VIÊN</div>

      <nav className="admin-nav">
        <NavLink to="/admin" end className="admin-nav-link">
          <span className="admin-nav-icon">👥</span>
          <span>Quản lý tài khoản</span>
        </NavLink>
      </nav>
    </aside>
  );
}
