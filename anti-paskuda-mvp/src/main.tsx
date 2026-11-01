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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="" element={<Dashboard />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="debt" element={<Debt />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
