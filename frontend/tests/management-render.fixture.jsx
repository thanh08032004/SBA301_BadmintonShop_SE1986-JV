import DeliveryManagementPage from '../src/modules/delivery/pages/DeliveryManagementPage';
import SupportTicketManagementPage from '../src/modules/support/pages/SupportTicketManagementPage';
import SupportTicketManagementDetailPage from '../src/modules/support/pages/SupportTicketManagementDetailPage';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router';
import { AuthContext } from '../src/app/providers/auth/AuthContext';
import { ShopContext } from '../src/app/providers/shop/ShopContext';
import PublicHeader from '../src/app/layouts/public/PublicHeader';
import ManagementSidebar from '../src/app/layouts/management/ManagementSidebar';
import DashboardPage from '../src/modules/management/pages/DashboardPage';
import CatalogPage from '../src/modules/management/pages/CatalogPage';
import ManagerOrdersPage from '../src/modules/management/pages/ManagerOrdersPage';
import InventoryManagementPage from '../src/modules/management/pages/InventoryManagementPage';
import InvoiceManagementPage from '../src/modules/management/pages/InvoiceManagementPage';

export function renderManagement(path, data, roles = ['MANAGER']) {
  return renderToStaticMarkup(
    <AuthContext.Provider
      value={{
        user: { email: 'manager1@gmail.com', fullName: 'Manager', roles },
        logout: () => {},
      }}
    >
      <ShopContext.Provider
        value={{ data, busy: false, act: async () => data, refresh: async () => data }}
      >
        <MemoryRouter initialEntries={[path]}>
          <div className="shop-app">
            <PublicHeader management />
            <div className="shop-layout">
              <ManagementSidebar />
              <main
                className={
                  path.startsWith('/management/deliveries')
                    ? 'management-delivery'
                    : 'shop-main management-content'
                }
              >
                <Routes>
                  <Route path="/management/deliveries" element={<DeliveryManagementPage />} />
                  <Route
                    path="/management/support-tickets"
                    element={<SupportTicketManagementPage />}
                  />
                  <Route
                    path="/management/support-tickets/:ticketId"
                    element={<SupportTicketManagementDetailPage />}
                  />
                  <Route path="/management" element={<DashboardPage />} />
                  <Route path="/management/inventory" element={<InventoryManagementPage />} />
                  <Route path="/management/invoices" element={<InvoiceManagementPage />} />
                  <Route path="/management/catalog/:catalog" element={<CatalogPage />} />
                  <Route path="/management/orders" element={<ManagerOrdersPage />} />
                </Routes>
              </main>
            </div>
          </div>
        </MemoryRouter>
      </ShopContext.Provider>
    </AuthContext.Provider>,
  );
}
