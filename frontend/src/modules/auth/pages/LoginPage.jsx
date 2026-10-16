import BrandLogo from '../../../shared/components/BrandLogo';
import HomeButton from '../../../shared/components/HomeButton';
import { useContext, useRef, useState } from 'react';
import { Alert, Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router';
import { AuthsContext } from '../../../app/provider/AuthsContext';
import { getRoleHomePath } from '../../../app/router/rolePaths';
import PublicFooter from '../../../shared/components/PublicFooter';
import '../../shop/shop.css';
import '../assets/LoginPage.css';

export default function LoginPage() {
  const { login } = useContext(AuthsContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const submitting = useRef(false);

  async function submit(event) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) throw new Error('Hãy khởi động lại server bằng npm run server để dùng API đăng nhập.');
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Đăng nhập không thành công.');
      login(result);
      const from = location.state?.from;
      const returnPath = typeof from?.pathname === 'string' && /^\/(cart|order|orders|payment)(\/|$)/.test(from.pathname)
        ? from.pathname + (from.search || '') : getRoleHomePath(result.roles);
      navigate(returnPath, { replace: true });
    } catch (err) {
      setError(err instanceof TypeError ? 'Không kết nối được server. Hãy chạy npm run server.' : err.message);
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  return (
    <div className="shop-app login-page">
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
                <div className="eyebrow">FOR YOUR NEXT MATCH</div>
                <h2>Nâng tầm từng<br />đường cầu.</h2>
                <p>Đăng nhập để tiếp tục hành trình mua sắm  và tìm trang bị phù hợp cho bạn.</p>
                <div className="login-illustration" aria-hidden="true">
                  <div className="login-court" />
                  <img src="/products/racket.svg" alt="" />
                  <span>PLAY<br />YOUR BEST.</span>
                </div>
                <div className="login-welcome-note"><span aria-hidden="true">✓</span> Trang bị tốt hơn. Tự tin trên sân.</div>
              </Col>
              <Col lg={6} className="login-form-column">
                <Card.Body className="login-form-panel">
                  <div className="eyebrow">CHÀO MỪNG BẠN TRỞ LẠI</div>
                  <h1>Đăng nhập</h1>
                  <p className="login-intro">Thật vui khi gặp lại bạn tại Badminton Shop.</p>
                  {location.state?.message && !error && <Alert variant="info">{location.state.message}</Alert>}
                  {error && <Alert variant="danger" role="alert">{error}</Alert>}
                  <Form onSubmit={submit} aria-busy={busy}>
                    <Form.Group className="mb-4" controlId="loginEmail">
                      <Form.Label>Email</Form.Label>
                      <Form.Control type="email" autoComplete="username" required disabled={busy} value={email} onChange={e => setEmail(e.target.value)} placeholder="Nhập địa chỉ email của bạn" />
                    </Form.Group>
                    <Form.Group className="mb-4" controlId="loginPassword">
                      <Form.Label>Mật khẩu</Form.Label>
                      <div className="login-password-field">
                        <Form.Control type={showPassword ? 'text' : 'password'} autoComplete="current-password" required disabled={busy} value={password} onChange={e => setPassword(e.target.value)} placeholder="Nhập mật khẩu" />
                        <Button type="button" variant="outline-secondary" className="login-password-toggle" aria-controls="loginPassword" aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)}>{showPassword ? 'Ẩn' : 'Hiện'}</Button>
                      </div>
                    </Form.Group>
                    <Button type="submit" className="w-100 login-submit" disabled={busy}>
                      {busy ? <><Spinner size="sm" animation="border" aria-hidden="true" className="me-2" />Đang đăng nhập…</> : 'Đăng nhập'}
                    </Button>
                  </Form>
                  <div className="login-register">Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></div>
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
