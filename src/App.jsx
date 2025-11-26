// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Layout
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import LoginScreen from './components/layout/LoginScreen';

// Views
import Dashboard from './components/views/Dashboard';
import Products from './components/views/Products';
import Sales from './components/views/Sales';
import Customers from './components/views/Customers';
import Purchases from './components/views/Purchases/Purchases';
import Expenses from './components/views/Expenses';
import Recipes from './components/views/Recipes';
import CashLedger from './components/views/CashLedger';
import Suppliers from './components/views/Suppliers';
import StockMovements from './components/views/StockMovements';
import Reports from './components/views/Reports';
import BackupRestore from './components/views/BackupRestore';
import AccountsView from './components/views/Accounts';

const App = () => {
  const { token, login, logout } = useAuth();

  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(loginForm.username, loginForm.password);
    } catch (error) {
      alert('Login failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Router>
      {/* Kalau belum login → cuma boleh ke /login */}
      {!token ? (
        <Routes>
          <Route
            path="/login"
            element={
              <LoginScreen
                loginForm={loginForm}
                setLoginForm={setLoginForm}
                handleLogin={handleLogin}
                loading={loading}
              />
            }
          />
          {/* semua path lain diarahkan ke /login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        // Kalau SUDAH login → pakai layout penuh + routes di dalamnya
        <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
          <Sidebar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header handleLogout={logout} setSidebarOpen={setSidebarOpen} />
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              <Routes>
                <Route path="/" element={<Dashboard token={token} />} />
                <Route path="/accounts" element={<AccountsView token={token} />} />
                <Route path="/products" element={<Products token={token} />} />
                <Route path="/sales" element={<Sales token={token} />} />
                <Route path="/customers" element={<Customers token={token} />} />
                <Route path="/purchases" element={<Purchases token={token} />} />
                <Route path="/expenses" element={<Expenses token={token} />} />
                <Route path="/recipes" element={<Recipes token={token} />} />
                <Route path="/cash-ledger" element={<CashLedger token={token} />} />
                <Route path="/suppliers" element={<Suppliers token={token} />} />
                <Route path="/stock-movements" element={<StockMovements token={token} />} />
                <Route path="/reports" element={<Reports token={token} />} />
                <Route path="/backup" element={<BackupRestore token={token} />} />

                {/* kalau path nggak dikenal → balik ke dashboard */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      )}
    </Router>
  );
};

export default App;
