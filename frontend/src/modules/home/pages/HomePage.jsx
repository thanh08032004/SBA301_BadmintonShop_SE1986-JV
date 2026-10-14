import { Button, Container } from 'react-bootstrap';
import { Link } from 'react-router';

function HomePage() {
  return (
    <Container className="py-5">
      <div className="mb-4">
        <p className="text-primary fw-semibold mb-2">BADMINTON SHOP</p>
        <h1 className="h2 mb-0">Dashboard</h1>
      </div>

      <Button as={Link} to="/payment" variant="outline-secondary">
        Payment
      </Button>
    </Container>
  );
}

export default HomePage;