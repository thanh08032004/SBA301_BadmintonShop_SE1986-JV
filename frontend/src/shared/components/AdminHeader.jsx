import { useContext } from 'react';
import { Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import { AuthsContext } from '../../app/provider/AuthsContext';
import BrandLogo from './BrandLogo';

export default function AdminHeader() {
  const { user, logout } = useContext(AuthsContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const headerStyle = {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '12px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '64px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  };

  const userBlockStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const avatarStyle = {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#0ea5e9',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '14px',
  };

  const userNameStyle = {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1e293b',
    lineHeight: 1.2,
  };

  const userEmailStyle = {
    fontSize: '12px',
    color: '#64748b',
  };

  const initial = (user?.fullName || user?.email || 'A').charAt(0).toUpperCase();

  return (
    <header style={headerStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <BrandLogo />
      </div>

      <div style={userBlockStyle}>
        <div style={avatarStyle}>{initial}</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={userNameStyle}>{user?.fullName || 'Administrator'}</span>
          <span style={userEmailStyle}>{user?.email || 'admin@badminton.vn'}</span>
        </div>
        <Button
          variant="outline-danger"
          size="sm"
          onClick={handleLogout}
          style={{ marginLeft: '12px', borderRadius: '6px', fontSize: '13px' }}
        >
          Đăng xuất
        </Button>
      </div>
    </header>
  );
}
