import { Navigate, useParams } from 'react-router';
import CatalogSection from './CatalogSection';
import ProductManagementPage from './ProductManagementPage';
import VoucherManagementPage from './VoucherManagementPage';
import { legacyCatalogs } from './catalogNavigation';
export default function CatalogPage() {
  const { catalog } = useParams();
  const legacy = legacyCatalogs[catalog];
  if (legacy) return <Navigate replace to={'/management/catalog/' + legacy.parent + '?tab=' + legacy.tab} />;
  if (catalog === 'products') return <ProductManagementPage />;
  if (catalog === 'vouchers') return <VoucherManagementPage />;
  return <CatalogSection key={catalog} catalog={catalog} />;
}
