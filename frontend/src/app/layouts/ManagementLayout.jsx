import { Outlet, useLocation } from 'react-router';
import { useContext } from 'react';
import { AuthsContext } from '../provider/AuthsContext';
import ManagementSidebar from '../../shared/components/ManagementSidebar';
import ShopProvider from '../../modules/shop/ShopProvider';
import PublicHeader from '../../shared/components/PublicHeader';
import PublicFooter from '../../shared/components/PublicFooter';
import '../../modules/shop/shop.css';
import '../../modules/management/management.css';

export default function ManagementLayout() {
  const { user } = useContext(AuthsContext);
  const delivery = useLocation().pathname.startsWith('/management/deliveries');
  return <ShopProvider key={user?.authToken || user?.token || 'management'}>
    <div className="shop-app management-app"><PublicHeader management />
      <div className="shop-layout"><ManagementSidebar />
        <main className={delivery ? 'management-delivery min-vh-100 p-3 p-md-4 p-xl-5' : 'shop-main management-content'}><Outlet /></main>
      </div><PublicFooter />
    </div>
  </ShopProvider>;
}
