import { Outlet } from "react-router";
import PublicHeader from "../../shared/components/PublicHeader";
import PublicFooter from "../../shared/components/PublicFooter";

const PublicLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <PublicHeader />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
};

export default PublicLayout;
