import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Dashboard from '../pages/Dashboard';
import Units from '../pages/Units';
import Calendar from '../pages/Calendar';
import Booking from '../pages/Booking';
import History from '../pages/History';
import Reports from '../pages/Reports';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <Navigate to="/" replace />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'units',
        element: <Units />,
      },
      {
        path: 'calendar',
        element: <Calendar />,
      },
      {
        path: 'booking',
        element: <Booking />,
      },
      {
        path: 'history',
        element: <History />,
      },
      {
        path: 'reports',
        element: <Reports />,
      },
      {
        path: 'settings',
        element: <Navigate to="/units" replace />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
