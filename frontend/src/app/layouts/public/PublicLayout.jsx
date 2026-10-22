import { useAuth } from '@/app/providers/auth/AuthContext';
import { Outlet } from 'react-router';
import PublicHeader from './PublicHeader';
import PublicSidebar from './PublicSidebar';
import PublicFooter from '@/shared/components/PublicFooter';
import ShopProvider from '@/app/providers/shop/ShopProvider';
import '@/shared/styles/app.css';
import { getToken } from '@/shared/auth/session';
export default function PublicLayout() {
  const { user } = useAuth();
  return (
    <ShopProvider key={getToken(user) || 'guest'}>
      <div className="shop-app">
        <PublicHeader />
        <div className="shop-layout">
          <PublicSidebar />
          <main className="shop-main">
            <Outlet />
          </main>
        </div>
        <PublicFooter />
      </div>
    </ShopProvider>
  );
}
