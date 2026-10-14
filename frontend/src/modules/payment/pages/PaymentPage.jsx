import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';

function PaymentPage() {
  return (
    <Container className="mt-5 mb-5">
      <Row className="justify-content-center">
        <Col xs={12} md={10} lg={8}>
          <Card>
            <Card.Body className="p-4">
              <Card.Title className="text-center mb-4">Thanh toán</Card.Title>
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="paymentName">
                      <Form.Label>Họ và tên người nhận</Form.Label>
                      <Form.Control type="text" placeholder="Nhập họ và tên" required />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="paymentPhone">
                      <Form.Label>Số điện thoại</Form.Label>
                      <Form.Control type="tel" placeholder="Nhập số điện thoại" required />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3" controlId="paymentEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" placeholder="Nhập email" required />
                </Form.Group>

                <Form.Group className="mb-3" controlId="paymentAddress">
                  <Form.Label>Địa chỉ nhận hàng</Form.Label>
                  <Form.Control as="textarea" rows={2} placeholder="Nhập địa chỉ nhận hàng" required />
                </Form.Group>

                <fieldset className="mb-4">
                  <legend className="fs-6 fw-semibold">Phương thức thanh toán</legend>
                  <Form.Check
                    type="radio"
                    name="paymentMethod"
                    id="paymentOnDelivery"
                    label="Thanh toán khi nhận hàng (COD)"
                    value="cod"
                    defaultChecked
                  />
                  <Form.Check
                    type="radio"
                    name="paymentMethod"
                    id="paymentBankTransfer"
                    label="Chuyển khoản ngân hàng"
                    value="bank-transfer"
                  />
                </fieldset>

                <Button variant="primary" type="submit" className="w-100">
                  Xác nhận thanh toán
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default PaymentPage;