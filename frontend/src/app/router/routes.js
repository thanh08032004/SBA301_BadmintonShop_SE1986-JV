import { createBrowserRouter } from "react-router";
import { adminRoutes } from "./admin.routes";
import { publicRoutes } from "./public.routes";

export const routes = createBrowserRouter([
  ...adminRoutes,
  ...publicRoutes,
]);
