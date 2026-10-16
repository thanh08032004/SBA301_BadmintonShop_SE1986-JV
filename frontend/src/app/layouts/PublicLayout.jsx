import { useContext } from 'react';
import { AuthsContext } from '../provider/AuthsContext';
import { Outlet } from 'react-router';
import PublicHeader from '../../shared/components/PublicHeader';
import PublicSidebar from '../../shared/components/PublicSidebar';
import PublicFooter from '../../shared/components/PublicFooter';
import ShopProvider from '../../modules/shop/ShopProvider';
import '../../modules/shop/shop.css';
export default function PublicLayout(){const {user}=useContext(AuthsContext);return <ShopProvider key={user?.authToken || user?.token || 'guest'}><div className="shop-app"><PublicHeader/><div className="shop-layout"><PublicSidebar/><main className="shop-main"><Outlet/></main></div><PublicFooter/></div></ShopProvider>}
