import { Navbar } from 'react-bootstrap';
import BrandLogo from './BrandLogo';
export default function AdminHeader() {
  return <Navbar className="bg-white border-bottom px-4 py-3"><BrandLogo /><span className="ms-auto small text-secondary">Quản trị cửa hàng</span></Navbar>;
}
