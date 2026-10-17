import { Outlet } from 'react-router';
import AdminHeader from '../../shared/components/AdminHeader';
import AdminSidebar from '../../shared/components/AdminSidebar';
import AdminFooter from '../../shared/components/AdminFooter';

export default function AdminLayout() {
    const layoutContainerStyle = {
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#f8fafc',
    };

    const mainAreaStyle = {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minWidth: 0,
    };

    const contentContainerStyle = {
        flex: 1,
        padding: '28px 36px',
        overflowY: 'auto',
    };

    return (
        <div style={layoutContainerStyle}>
            <AdminSidebar />
            <div style={mainAreaStyle}>
                <AdminHeader />
                <main style={contentContainerStyle}>
                    <Outlet />
                </main>
                <AdminFooter />
            </div>
        </div>
    );
}
