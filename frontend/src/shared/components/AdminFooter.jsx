import { Container } from "react-bootstrap";

const AdminFooter = () => {
  return (
    <footer className="bg-white border-top py-3 text-center text-muted small mt-auto">
      <Container fluid>
        <span>
          &copy; {new Date().getFullYear()} Badminton Shop SE1986-JV. Hệ thống
          Quản trị & Bán hàng Cầu lông.
        </span>
      </Container>
    </footer>
  );
};

export default AdminFooter;
