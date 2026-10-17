import { useContext } from "react";
import { Nav } from "react-bootstrap";
import { NavLink } from "react-router";
import { AuthsContext } from "../../app/provider/AuthsContext";
import Icon from "./Icon";
import "./PublicSidebar.css";
export default function ManagementSidebar() {
 const { user } = useContext(AuthsContext);
 const links = [["/management","Dashboard tổng quan","receipt"],["/management/orders","Đơn hàng khách hàng","bag"],["/management/inventory","Quản lý kho","card"],["/management/invoices","Hóa đơn","receipt"],...[ ["products", "Sản phẩm"], ["brands", "Thương hiệu"], ["categories", "Danh mục"], ["vouchers", "Voucher"] ].map(([key,label])=>["/management/catalog/"+key,label,"card"]),["/management/support-tickets","Support tickets","shield"],["/management/deliveries","Quản lý giao hàng","truck"]];
 return <aside className="shop-sidebar manager-sidebar"><div className="eyebrow">QUẢN LÝ CỬA HÀNG</div><Nav className="flex-column gap-2">{links.map(([to,label,icon])=><Nav.Link as={NavLink} end={to === '/management'} to={to} key={to}><span className="sidebar-icon"><Icon name={icon}/></span><span>{label}</span></Nav.Link>)}</Nav><div className="sidebar-tip"><strong>Cùng cửa hàng phát triển</strong><p className="small mt-2 mb-0">Theo dõi doanh thu và chăm sóc từng đơn hàng.</p></div></aside>;
}
