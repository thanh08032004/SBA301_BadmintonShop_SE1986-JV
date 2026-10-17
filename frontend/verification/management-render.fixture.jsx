import DeliveryManagementPage from '../src/modules/delivery/pages/DeliveryManagementPage';
import SupportTicketManagementPage from '../src/modules/support/pages/SupportTicketManagementPage';
import SupportTicketManagementDetailPage from '../src/modules/support/pages/SupportTicketManagementDetailPage';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router';
import { AuthsContext } from '../src/app/provider/AuthsContext';
import { ShopContext } from '../src/modules/shop/ShopContext';
import PublicHeader from '../src/shared/components/PublicHeader';
import ManagementSidebar from '../src/shared/components/ManagementSidebar';
import DashboardPage from '../src/modules/management/DashboardPage';
import CatalogPage from '../src/modules/management/CatalogPage';
import ManagerOrdersPage from '../src/modules/management/ManagerOrdersPage';

export function renderManagement(path, data) {
  return renderToStaticMarkup(
    <AuthsContext.Provider value={{ user: { email: 'manager1@gmail.com', fullName: 'Manager', roles: ['MANAGER'] }, logout: () => {} }}>
      <ShopContext.Provider value={{ data, busy: false, act: async () => data, refresh: async () => data }}>
        <MemoryRouter initialEntries={[path]}>
          <div className="shop-app"><PublicHeader management /><div className="shop-layout"><ManagementSidebar /><main className={path.startsWith('/management/deliveries') ? 'management-delivery' : 'shop-main management-content'}>
            <Routes><Route path="/management/deliveries" element={<DeliveryManagementPage />} /><Route path="/management/support-tickets" element={<SupportTicketManagementPage />} /><Route path="/management/support-tickets/:ticketId" element={<SupportTicketManagementDetailPage />} /><Route path="/management" element={<DashboardPage />} /><Route path="/management/catalog/:catalog" element={<CatalogPage />} /><Route path="/management/orders" element={<ManagerOrdersPage />} /></Routes>
          </main></div></div>
        </MemoryRouter>
      </ShopContext.Provider>
    </AuthsContext.Provider>,
  );
}
