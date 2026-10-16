import BrandLogo from '../../../shared/components/BrandLogo';
import HomeButton from '../../../shared/components/HomeButton';
import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router';
import PublicFooter from '../../../shared/components/PublicFooter';
import '../../shop/shop.css';
import '../assets/LoginPage.css';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="shop-app login-page register-page">
      <div className="shop-topbar">Đồng hành cùng đam mê cầu lông · Sẵn sàng cho trận đấu mới</div>
      <header className="login-header">
        <BrandLogo />
        <HomeButton />
      </header>
      <main className="login-main">
        <Container>
          <Card className="login-card">
            <Row className="g-0">
              <Col lg={6} className="login-welcome">
                <div className="eyebrow">YOUR JOURNEY STARTS HERE</div>
                <h2>Khởi đầu mới.<br />Sẵn sàng ra sân.</h2>
                <p>Tạo tài khoản và tìm người bạn đồng hành cho từng đường cầu của bạn.</p>
                <div className="login-illustration" aria-hidden="true">
                  <div className="login-court" />
                  <img src="/products/racket.svg" alt="" />
                  <span>PLAY<br />YOUR BEST.</span>
                </div>
                <div className="login-welcome-note"><span aria-hidden="true">✓</span> Trang bị tốt hơn. Tự tin trên sân.</div>
              </Col>
              <Col lg={6} className="login-form-column">
                <Card.Body className="login-form-panel">
                  <div className="eyebrow">CHÀO MỪNG ĐẾN BADMINTON SHOP</div>
                  <h1>Tạo tài khoản</h1>
                  <p className="login-intro">Điền thông tin bên dưới để bắt đầu.</p>
                  <Form>
                    <Form.Group className="mb-3" controlId="registerName">
                      <Form.Label>Họ và tên</Form.Label>
                      <Form.Control type="text" autoComplete="name" required maxLength={150} placeholder="Nhập họ và tên của bạn" />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="registerEmail">
                      <Form.Label>Email</Form.Label>
                      <Form.Control type="email" autoComplete="email" required maxLength={190} placeholder="Nhập địa chỉ email của bạn" />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="registerPassword">
                      <Form.Label>Mật khẩu</Form.Label>
                      <div className="login-password-field">
                        <Form.Control type={showPassword ? 'text' : 'password'} autoComplete="new-password" required placeholder="Nhập mật khẩu" />
                        <Button type="button" variant="outline-secondary" className="login-password-toggle" aria-controls="registerPassword registerConfirmPassword" aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)}>{showPassword ? 'Ẩn' : 'Hiện'}</Button>
                      </div>
                    </Form.Group>
                    <Form.Group className="mb-4" controlId="registerConfirmPassword">
                      <Form.Label>Xác nhận mật khẩu</Form.Label>
                      <Form.Control type={showPassword ? 'text' : 'password'} autoComplete="new-password" required placeholder="Nhập lại mật khẩu" />
                    </Form.Group>
                    <Button variant="primary" type="submit" className="w-100 login-submit">Đăng ký</Button>
                  </Form>
                  <div className="login-register">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></div>
                </Card.Body>
              </Col>
            </Row>
          </Card>
        </Container>
      </main>
      <PublicFooter />
    </div>
  );
}
