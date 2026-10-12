import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';

function LoginPage() {
  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card>
            <Card.Body>
              <Card.Title className="text-center mb-4">Đăng nhập</Card.Title>
              <Form>
                <Form.Group className="mb-3" controlId="loginEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" placeholder="Nhập email" />
                </Form.Group>

                <Form.Group className="mb-3" controlId="loginPassword">
                  <Form.Label>Mật khẩu</Form.Label>
                  <Form.Control type="password" placeholder="Nhập mật khẩu" />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100">
                  Đăng nhập
                </Button>
              </Form>

              <div className="text-center mt-3">
                <span>Chưa có tài khoản? </span>
                <a href="/register">Đăng ký</a>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default LoginPage;
