import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './i18n';
import { BrowserRouter, Route, Routes } from 'react-router';
import AppLayout from './layouts/AppLayout.tsx';
import Profile from './pages/Profile.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Expenses from './pages/Expenses.tsx';
import Debt from './pages/Debt.tsx';
import AuthProvider from './auth/AuthProvider.tsx';
import ProtectedRoute from './auth/ProtectedRoute.tsx';
import Login from './pages/auth/Login.tsx';
import { Provider } from 'react-redux';
import { store } from './app/store.ts';
import SetupProfile from './pages/setup/SetupProfile.tsx';
import SetupPlan from './pages/setup/SetupPlan.tsx';
import SetupLayout from './layouts/SetupLayout.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="" element={<Dashboard />} />
                <Route path="expenses" element={<Expenses />} />
                <Route path="debt" element={<Debt />} />
                <Route path="profile" element={<Profile />} />
              </Route>

              <Route path="setup" element={<SetupLayout />}>
                <Route path="profile" element={<SetupProfile />} />
                <Route path="plan" element={<SetupPlan />} />
              </Route>
            </Route>

            <Route path="*" element={<h1>Page not found</h1>} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
