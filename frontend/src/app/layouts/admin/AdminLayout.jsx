import { Outlet } from 'react-router';
import AdminFooter from './AdminFooter';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import './AdminLayout.css';

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <AdminHeader />
        <main className="admin-content">
          <Outlet />
        </main>
        <AdminFooter />
      </div>
    </div>
  );
}
