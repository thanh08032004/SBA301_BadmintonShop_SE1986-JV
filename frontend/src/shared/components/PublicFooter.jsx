import { Container } from 'react-bootstrap';

const PublicFooter = () => {
  return (
    <footer className="mt-auto border-top shadow-sm">
      <Container fluid>
        <span>&copy; {new Date().getFullYear()} Badminton Shop</span>
      </Container>
    </footer>
  );
};

export default PublicFooter;
