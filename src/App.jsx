import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import InstallPWA from './components/InstallPWA';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <InstallPWA />
    </AuthProvider>
  );
}

export default App;
