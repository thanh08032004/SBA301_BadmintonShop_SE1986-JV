import { AuthsContext } from "../../../app/provider/AuthsContext";
import Icon from "../../../shared/components/Icon";
import "../../shop/commerce.css";
import { useContext, useState } from "react";
import { Alert, Badge, Button, Card, Col, Form, Row } from "react-bootstrap";
import { Link, useNavigate } from "react-router";
import { useShop, money } from "../../shop/ShopContext";
export default function HomePage({ catalog = false }) {
  const { user } = useContext(AuthsContext);
  const { data, busy, act } = useShop(),
    [search, setSearch] = useState(""),
    [type, setType] = useState(""),
    [choices, setChoices] = useState({}),
    [notice, setNotice] = useState("");
  const navigate = useNavigate();
  async function add(id, buy) {
    if (!(user?.authToken || user?.token)) {
      navigate("/login", {
        state: {
          from: {
            pathname: buy ? "/order" : "/cart",
            search: buy ? "?variant=" + encodeURIComponent(id) : "",
          },
          message: "Vui lòng đăng nhập để mua hàng.",
        },
      });
      return;
    }
    if (buy) {
      navigate("/order?variant=" + encodeURIComponent(id));
      return;
    }
    try {
      await act({ type: "add", variant_id: id });
      setNotice("Đã thêm sản phẩm vào giỏ hàng.");
    } catch {
      /* Error shown by provider. */
    }
  }
  const products = data.products.filter(
    (p) =>
      p.name.toLocaleLowerCase("vi").includes(search.toLocaleLowerCase("vi")) &&
      (!type || p.product_type === type),
  );
  return (
    <div className="commerce-page catalog-page">
      {!catalog && (
        <>
          <section className="shop-hero mb-4">
            <div>
              <div className="eyebrow">FOR YOUR NEXT MATCH</div>
              <h1>
                Nâng tầm từng
                <br />
                đường cầu.
              </h1>
              <p>
                Vợt, giày và trang phục cầu lông.
                <br />
                Cùng bạn tự tin trong mỗi trận đấu.
              </p>
              <Button as={Link} to="/products">
                <Icon name="bag" size={18} /> Khám phá sản phẩm
              </Button>
            </div>
            <div className="hero-art" aria-hidden="true">
              <img src="/products/racket.svg" alt="" />
              <span>
                PLAY
                <br />
                YOUR BEST.
              </span>
            </div>
          </section>
          <Row className="g-3 mb-5">
            {[
              ["shield", "Sản phẩm chính hãng"],
              ["check", "Chọn đúng phong cách"],
              ["truck", "Mua sắm thật dễ dàng"],
            ].map(([icon, text]) => (
              <Col md={4} key={icon}>
                <div className="shop-perk">
                  <Icon name={icon} />
                  <span>{text}</span>
                </div>
              </Col>
            ))}
          </Row>
        </>
      )}
      <div className="eyebrow">BỘ SƯU TẬP CẦU LÔNG</div>
      <h2 className="h3 fw-bold">
        {catalog ? "Tất cả sản phẩm" : "Sẵn sàng cho trận đấu mới"}
      </h2>
      <p className="text-secondary">
        Tìm người bạn đồng hành trên sân của bạn.
      </p>
      <Row className="g-3 mb-4 catalog-toolbar">
        <Col md={8}>
          <div className="catalog-search">
            <Icon name="search" />
            <Form.Control
              aria-label="Tìm sản phẩm"
              placeholder="Tìm tên sản phẩm…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </Col>
        <Col md={4}>
          <Form.Select
            aria-label="Danh mục"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">Tất cả danh mục</option>
            <option value="racket">Vợt cầu lông</option>
            <option value="shoes">Giày cầu lông</option>
            <option value="apparel">Trang phục</option>
          </Form.Select>
        </Col>
      </Row>
      {notice && (
        <Alert variant="success" dismissible onClose={() => setNotice("")}>
          {notice} <Link to="/cart">Xem giỏ hàng</Link>
        </Alert>
      )}
      {!products.length && (
        <div className="empty-state">Không tìm thấy sản phẩm phù hợp.</div>
      )}
      <Row className="g-4">
        {products.map((p) => {
          const options = data.product_variants.filter(
              (v) => v.product_id === p.id,
            ),
            v = options.find((v) => v.id === choices[p.id]) || options[0];
          return (
            <Col sm={6} xl={4} key={p.id}>
              <Card className="product-card h-100">
                <div className={"product-art art-" + p.product_type}>
                  <Badge bg="light" text="primary">
                    {p.brand}
                  </Badge>
                  <img
                    src={"/products/" + p.product_type + ".svg"}
                    alt={p.name}
                  />
                </div>
                <Card.Body className="d-flex flex-column">
                  <small className="text-secondary">
                    {p.product_type === "racket"
                      ? "VỢT CẦU LÔNG"
                      : p.product_type === "shoes"
                        ? "GIÀY CẦU LÔNG"
                        : "TRANG PHỤC"}
                  </small>
                  <Card.Title as="h3" className="h6 fw-bold mt-2">
                    {p.name}
                  </Card.Title>
                  <p className="product-description">{p.description}</p>
                  <Form.Select
                    size="sm"
                    aria-label={"Biến thể " + p.name}
                    value={v.id}
                    onChange={(e) =>
                      setChoices({ ...choices, [p.id]: e.target.value })
                    }
                  >
                    {options.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.color} / {o.size}
                      </option>
                    ))}
                  </Form.Select>
                  <div className="product-price-row">
                    <strong className="text-primary">{money(v.price)}</strong>
                    <small className="text-secondary">
                      Còn {v.stock_quantity}
                    </small>
                  </div>
                  <div className="product-actions mt-auto">
                    <Button
                      variant="outline-primary"
                      className="icon-button"
                      disabled={busy || !v.stock_quantity}
                      onClick={() => add(v.id, false)}
                    >
                      <Icon name="cart" size={18} />
                      Thêm vào giỏ
                    </Button>
                    <Button
                      className="icon-button"
                      disabled={busy || !v.stock_quantity}
                      onClick={() => add(v.id, true)}
                    >
                      <Icon name="bag" size={18} />
                      Đặt hàng
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}
