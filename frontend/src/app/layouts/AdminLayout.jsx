import { Col, Container, Row } from 'react-bootstrap'
import { Outlet } from 'react-router'
import AdminFooter from '../../shared/components/AdminFooter'
import AdminHeader from '../../shared/components/AdminHeader'
import AdminSidebar from '../../shared/components/AdminSidebar'

const AdminLayout = () => {
  return (
    <div className="min-vh-100 bg-light">
      <AdminHeader />

      <Container fluid className="px-0">
        <Row className="g-0">
          <Col lg={3} xl={2} className="d-none d-lg-block bg-white border-end">
            <AdminSidebar />
          </Col>

          <Col lg={9} xl={10}>
            <main className="min-vh-100 p-3 p-md-4 p-xl-5">
              <Outlet />
            </main>
          </Col>
        </Row>
      </Container>

      <AdminFooter />
    </div>
  )
}

export default AdminLayout
