import BrandLogo from './BrandLogo';
import { Link } from 'react-router';
export default function PublicFooter(){return <footer className="shop-footer"><div><BrandLogo compact /><p className="small mb-0 mt-2">Trang bị tốt hơn. Tự tin trên sân.</p></div><div className="d-flex gap-4"><Link to="/products">Sản phẩm</Link><Link to="/cart">Giỏ hàng</Link><Link to="/orders">Đơn hàng</Link></div><small>© {new Date().getFullYear()} Badminton Shop</small></footer>}
