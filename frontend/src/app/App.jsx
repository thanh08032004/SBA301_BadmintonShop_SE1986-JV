import { RouterProvider } from "react-router";
import AuthsProvider from "./provider/AuthsProvider";
import { routes } from "./router/routes";

function App() {
  return (
    <AuthsProvider>
      <RouterProvider router={routes} />
    </AuthsProvider>
  );
}

export default App;
