import { NavLink } from 'react-router';

export default function AdminSidebar() {
  const sidebarStyle = {
    width: '260px',
    minWidth: '260px',
    backgroundColor: '#0f172a',
    color: '#e2e8f0',
    height: '100vh',
    position: 'sticky',
    top: 0,
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #1e293b',
    padding: '24px 16px',
    zIndex: 99,
    overflowY: 'auto',
  };

  const titleStyle = {
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    color: '#94a3b8',
    marginBottom: '16px',
    paddingLeft: '12px',
  };

  const getLinkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: isActive ? '600' : '500',
    color: isActive ? '#ffffff' : '#94a3b8',
    backgroundColor: isActive ? '#2563eb' : 'transparent',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    marginBottom: '4px',
  });

  return (
    <aside style={sidebarStyle}>
      <div style={titleStyle}>QUẢN TRỊ VIÊN</div>

      <nav style={{ display: 'flex', flexDirection: 'column' }}>
        <NavLink to="/admin" end style={getLinkStyle}>
          <span style={{ fontSize: '18px' }}>👥</span>
          <span>Quản lý tài khoản</span>
        </NavLink>
      </nav>
    </aside>
  );
}
