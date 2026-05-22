import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Dashboard from '../pages/Dashboard';
import Units from '../pages/Units';
import Calendar from '../pages/Calendar';
import Booking from '../pages/Booking';
import History from '../pages/History';
import Reports from '../pages/Reports';
import Login from '../pages/Login';
import Attendance from '../pages/Attendance';
import AdminAttendance from '../pages/AdminAttendance';
import ProtectedRoute from '../components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/attendance',
    element: (
      <ProtectedRoute>
        <Attendance />
      </ProtectedRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute requireAdmin={true}>
        <MainLayout />
      </ProtectedRoute>
    ),
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
        path: 'admin-attendance',
        element: <AdminAttendance />,
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
