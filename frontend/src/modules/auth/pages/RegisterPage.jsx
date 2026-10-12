import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';

function RegisterPage() {
  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card>
            <Card.Body>
              <Card.Title className="text-center mb-4">Đăng ký</Card.Title>
              <Form>
                <Form.Group className="mb-3" controlId="registerName">
                  <Form.Label>Họ và tên</Form.Label>
                  <Form.Control type="text" placeholder="Nhập họ và tên" />
                </Form.Group>

                <Form.Group className="mb-3" controlId="registerEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" placeholder="Nhập email" />
                </Form.Group>

                <Form.Group className="mb-3" controlId="registerPassword">
                  <Form.Label>Mật khẩu</Form.Label>
                  <Form.Control type="password" placeholder="Nhập mật khẩu" />
                </Form.Group>

                <Form.Group className="mb-3" controlId="registerConfirmPassword">
                  <Form.Label>Xác nhận mật khẩu</Form.Label>
                  <Form.Control type="password" placeholder="Nhập lại mật khẩu" />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100">
                  Đăng ký
                </Button>
              </Form>

              <div className="text-center mt-3">
                <span>Đã có tài khoản? </span>
                <a href="/login">Đăng nhập</a>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default RegisterPage;
