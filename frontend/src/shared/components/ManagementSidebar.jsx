import { Nav } from "react-bootstrap";
import { NavLink } from "react-router";

const ManagementSidebar = () => {
  return (
    <aside className="d-flex flex-column h-100 bg-white p-3">
      <div className="eyebrow mb-3">QUẢN LÝ CỬA HÀNG</div>
      <Nav className="flex-column gap-1 flex-grow-1">
        <NavLink
          end
          to="/management/support-tickets"
          className={({ isActive }) =>
            `nav-link rounded ${isActive ? "active bg-primary text-white" : "text-dark"}`
          }
        >
          Support tickets
        </NavLink>
        <NavLink
          to="/management/deliveries"
          className={({ isActive }) =>
            `nav-link rounded ${isActive ? "active bg-primary text-white" : "text-dark"}`
          }
        >
          Quản lý giao hàng
        </NavLink>
      </Nav>
    </aside>
  );
};

export default ManagementSidebar;
