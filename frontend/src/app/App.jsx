import { RouterProvider } from 'react-router';
import AuthProvider from '@/app/providers/auth/AuthProvider';
import { router } from '@/app/router/routes';

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
