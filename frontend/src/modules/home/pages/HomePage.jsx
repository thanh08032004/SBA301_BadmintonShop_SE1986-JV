import { Button, Container } from 'react-bootstrap';
import { Link } from 'react-router';

function HomePage() {
  return (
    <Container className="py-5">
      <div className="mb-4">
        <p className="text-primary fw-semibold mb-2">BADMINTON SHOP</p>
        <h1 className="h2 mb-0">Dashboard</h1>
      </div>

      <div className="d-flex flex-wrap gap-2">
        <Button as={Link} to="/payment" variant="outline-secondary">
          Payment
        </Button>
        <Button as={Link} to="/login" variant="outline-secondary">
          Login
        </Button>
      </div>
    </Container>
  );
}

export default HomePage;
