import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import InstallPWA from './components/InstallPWA';

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <InstallPWA />
    </>
  );
}

export default App;
