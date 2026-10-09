import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';

// Workspace Pages
import DashboardPage from './pages/DashboardPage.jsx';
import TransactionsPage from './pages/TransactionsPage.jsx';
import AccountsPage from './pages/AccountsPage.jsx';
import BudgetsPage from './pages/BudgetsPage.jsx';
import GoalsPage from './pages/GoalsPage.jsx';
import LoansPage from './pages/LoansPage.jsx';
import InvestmentsPage from './pages/InvestmentsPage.jsx';
import InsurancePage from './pages/InsurancePage.jsx';
import AiAnalystPage from './pages/AiAnalystPage.jsx';
import BillingPage from './pages/BillingPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

export default function App() {
  return (
    <Routes>
      {/* Public Marketing & Auth Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Protected Workspace Routes */}
      <Route path="/workspace" element={<ProtectedRoute />}>
        <Route index element={<Navigate to="/workspace/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="accounts" element={<AccountsPage />} />
        <Route path="budgets" element={<BudgetsPage />} />
        <Route path="goals" element={<GoalsPage />} />
        <Route path="loans" element={<LoansPage />} />
        <Route path="investments" element={<InvestmentsPage />} />
        <Route path="insurance" element={<InsurancePage />} />
        <Route path="ai" element={<AiAnalystPage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
