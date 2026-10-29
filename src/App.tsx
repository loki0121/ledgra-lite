import { lazy, Suspense, type ReactElement } from 'react';
import { createHashRouter, Navigate, RouterProvider } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ForgotPassword, Login, Register } from '@/pages/auth/AuthPages';

// Pages are code-split so the first load stays small.
const FinanceDashboard = lazy(() => import('@/pages/dashboard/FinanceDashboard'));
const Transactions = lazy(() => import('@/pages/transactions/Transactions'));
const InvoiceList = lazy(() => import('@/pages/invoices/InvoiceList'));
const Settings = lazy(() => import('@/pages/settings/Settings'));
const NotFound = lazy(() => import('@/pages/errors/NotFound'));
const ProFeature = lazy(() => import('@/pages/pro/ProFeature'));

function PageFallback() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading">
      <div className="h-9 w-64 animate-pulse rounded-lg bg-line" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card h-[124px] animate-pulse" />
        ))}
      </div>
      <div className="card h-[360px] animate-pulse" />
    </div>
  );
}

const page = (el: ReactElement) => <Suspense fallback={<PageFallback />}>{el}</Suspense>;

/**
 * Hash routing works on any static host (and inside a sub-folder) with no
 * server rewrites. Prefer clean URLs? Swap createHashRouter for
 * createBrowserRouter and add an SPA fallback on your server.
 */
const pro = page(<ProFeature />);
const proPaths = [
  'invoices/new', 'invoices/:id', 'crm', 'crm/*', 'hr', 'inventory', 'dashboards/*', 'projects/*', 'profile', 'reports',
  'inventory/*', 'hr/*', 'calendar', 'notifications', 'pricing', '500',
];

const router = createHashRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: page(<FinanceDashboard />) },
      { path: 'transactions', element: page(<Transactions />) },
      { path: 'invoices', element: page(<InvoiceList />) },
      { path: 'settings', element: page(<Settings />) },
      ...proPaths.map((path) => ({ path, element: pro })),
      { path: '404', element: page(<NotFound />) },
      { path: '*', element: page(<NotFound />) },
    ],
  },
  {
    path: 'auth',
    element: <AuthLayout />,
    children: [
      { index: true, element: <Navigate to="/auth/login" replace /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
    ],
  },
], {
  // Opt in to React Router v7 behaviour now (silences upgrade warnings).
  future: {
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
  },
});

export default function App() {
  return <RouterProvider router={router} future={{ v7_startTransition: true }} />;
}
