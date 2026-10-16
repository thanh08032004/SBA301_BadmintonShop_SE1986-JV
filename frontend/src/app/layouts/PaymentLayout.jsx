import BrandLogo from "../../shared/components/BrandLogo";
import HomeButton from "../../shared/components/HomeButton";
import PublicFooter from "../../shared/components/PublicFooter";
import "../../modules/shop/shop.css";

export default function PaymentLayout({ children }) {
  return (
    <div className="shop-app">
      <header className="simple-page-header">
        <BrandLogo />
        <HomeButton />
      </header>
      <div className="flex-grow-1">{children}</div>
      <PublicFooter />
    </div>
  );
}
