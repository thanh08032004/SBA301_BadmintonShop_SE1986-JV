import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import { useAuth } from '@/app/providers/auth/AuthContext';
import BrandLogo from '@/shared/components/BrandLogo';

export default function AdminHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initial = (user?.fullName || user?.email || 'A').charAt(0).toUpperCase();

  return (
    <header className="admin-header">
      <div className="admin-header-brand">
        <BrandLogo />
      </div>

      <div className="admin-user">
        <div className="admin-avatar">{initial}</div>
        <div className="admin-user-info">
          <span className="admin-user-name">{user?.fullName || 'Administrator'}</span>
          <span className="admin-user-email">{user?.email || 'admin@badminton.vn'}</span>
        </div>
        <Button variant="outline-danger" size="sm" className="admin-logout" onClick={handleLogout}>
          Đăng xuất
        </Button>
      </div>
    </header>
  );
}
