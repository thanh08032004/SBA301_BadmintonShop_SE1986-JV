import { useContext } from 'react';
import { Navbar, Container, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router';

const AdminHeader = () => {
  return (
    <Navbar variant="dark" expand="lg" className="border-bottom shadow-sm px-3">
      Admin, Manager, Staff Header
    </Navbar>
  );
};

export default AdminHeader;
