import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

// Layout
import { AppLayout } from '../components/layout/AppLayout';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';

// Public Pages
import { LandingPage } from './LandingPage';
import { LoginPage, SignUpPage, ResetPasswordPage } from '../features/auth/components';

// Protected Pages
import {
  FieldsPage,
  AddFieldPage,
  EditFieldPage,
  FieldDetailPage,
  DashboardPage,
} from '../features/fields/components';
import { CheckinPage } from '../features/checkin/components';
import { StrategiesPage } from '../features/strategies/components';
import {
  CommunityPage,
  NewPostPage,
  PostDetailPage,
} from '../features/community/components';
import { ReportPage } from '../features/reports/components';
import { SettingsPage } from '../features/settings/components';

const router = createBrowserRouter([
  // Public Routes
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignUpPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },

  // Protected App Routes
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/fields',
        element: <FieldsPage />,
      },
      {
        path: '/fields/new',
        element: <AddFieldPage />,
      },
      {
        path: '/fields/:fieldId',
        element: <FieldDetailPage />,
      },
      {
        path: '/fields/:fieldId/edit',
        element: <EditFieldPage />,
      },
      {
        path: '/fields/:fieldId/checkin',
        element: <CheckinPage />,
      },
      {
        path: '/fields/:fieldId/strategies',
        element: <StrategiesPage />,
      },
      {
        path: '/community',
        element: <CommunityPage />,
      },
      {
        path: '/community/new',
        element: <NewPostPage />,
      },
      {
        path: '/community/:postId',
        element: <PostDetailPage />,
      },
      {
        path: '/reports/:fieldId',
        element: <ReportPage />,
      },
      {
        path: '/settings',
        element: <SettingsPage />,
      },
      {
        path: '*',
        element: <Navigate to="/fields" replace />,
      },
    ],
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
