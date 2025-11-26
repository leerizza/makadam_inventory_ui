import React, { useState, useEffect, useMemo } from "react";
import {
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Plus,
  Search,
  Calendar,
  X,
  Menu,
  LogOut,
  TrendingDown,
  CreditCard,
  Download,
  UploadCloud,
  Database,
  ArrowLeftRight,
  Clock,
  Truck,
  CheckCircle,
  ChevronRight,
  AlertCircle,
  BarChart,
  RefreshCcw,
  ChevronLeft,
  Wallet
} from 'lucide-react';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
} from "react-router-dom";


const API_BASE = 'http://127.0.0.1:8000';

const CHART_COLORS = ['#4f46e5', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777'];

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [currentView, setCurrentView] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Login state
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', loginForm.username);
      formData.append('password', loginForm.password);

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Login failed');

      const data = await res.json();
      localStorage.setItem('token', data.access_token);
      setToken(data.access_token);
    } catch (error) {
      alert('Login failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  if (!token) {
    return (
      <LoginScreen
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        handleLogin={handleLogin}
        loading={loading}
      />
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header handleLogout={handleLogout} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {currentView === 'dashboard' && <Dashboard token={token} />}
          {currentView === 'accounts' && <AccountsView token={token} />}
          {currentView === 'products' && <Products token={token} />}
          {currentView === 'sales' && <Sales token={token} />}
          {currentView === 'customers' && <Customers token={token} />}
          {currentView === 'purchases' && <Purchases token={token} />}
          {currentView === 'expenses' && <Expenses token={token} />}
          {currentView === 'recipes ' && <Recipes  token={token} />}
          {currentView === 'cash_ledger' && <CashLedger token={token} />}
          {currentView === 'suppliers' && <Suppliers token={token} />}
          {currentView === 'stock-movements' && <StockMovements token={token}/>}
          {currentView === 'reports' && <Reports token={token} />}
          {currentView === 'backup' && <BackupRestore token={token} />}
        </main>
      </div>
    </div>
  );
};


const formatCurrency = (value) => {
  const num = Number(value || 0);
  return "Rp " + num.toLocaleString("id-ID");
};

const formatLedgerDate = (value) => {
  if (!value) return '-';

  // Ambil tanggal saja dari ISO / timestamptz
  const dateOnly = value.slice(0, 10); // 'YYYY-MM-DD'
  const [y, m, d] = dateOnly.split('-');
  return `${d}/${m}/${y}`; // 24/11/2025
};



// Login Screen Component
const LoginScreen = ({ loginForm, setLoginForm, handleLogin, loading }) => (
  <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
    <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
          <Package className="text-white" size={36} />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Inventory System</h1>
        <p className="text-gray-600">Selamat datang kembali</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
          <input
            type="text"
            value={loginForm.username}
            onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            placeholder="Masukkan username"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
          <input
            type="password"
            value={loginForm.password}
            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            placeholder="Masukkan password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Masuk...' : 'Masuk'}
        </button>
      </form>
    </div>
  </div>
);

// Header Component
const Header = ({ handleLogout, setSidebarOpen }) => (
  <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 md:px-6 py-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="lg:hidden text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-2 rounded-lg transition-all"
        >
          <Menu size={24} />
        </button>
        <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Inventory Management System
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
          <Calendar size={18} className="text-indigo-600" />
          <span className="text-sm font-medium text-gray-700">
            {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl transition-all shadow-md hover:shadow-lg"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline font-medium">Keluar</span>
        </button>
      </div>
    </div>
  </header>
);

// Sidebar Component
const Sidebar = ({ currentView, setCurrentView, sidebarOpen, setSidebarOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp, color: 'from-indigo-500 to-purple-500' },
    { id: 'accounts', label: 'Accounts Payment', icon: Wallet, color: 'from-indigo-500 to-purple-500' },
    { id: 'products', label: 'Products', icon: Package, color: 'from-blue-500 to-cyan-500' },
    { id: 'sales', label: 'Sales', icon: ShoppingCart, color: 'from-green-500 to-emerald-500' },
    { id: 'customers', label: 'Customers', icon: Users, color: 'from-purple-500 to-pink-500' },
    { id: 'purchases', label: 'Purchases', icon: DollarSign, color: 'from-orange-500 to-red-500' },
    { id: 'expenses', label: 'Expenses', icon: TrendingDown, color: 'from-red-500 to-rose-500' },
    { id: 'recipes ', label: 'Recipes ', icon: CreditCard, color: 'from-emerald-500 to-teal-500' },
    { id: 'cash_ledger', label: 'Cash Ledger', icon: CreditCard, color: 'from-slate-600 to-slate-900' },
    { id: 'suppliers', label: 'Suppliers', icon: Users, color: 'from-sky-500 to-indigo-500' },
    { id: 'stock-movements', label: 'Stock Movements', icon: ArrowLeftRight, color: 'from-sky-500 to-indigo-500' },
    { id: 'reports', label: 'Reports', icon: BarChart, color: 'from-teal-500 to-green-500' },
    { id: 'backup', label: 'Backup & Restore', icon: Database, color: 'from-slate-500 to-slate-700' },
  ];

  return (
    <>
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transition-transform duration-300`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-200">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Package className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Inventory</h1>
              <p className="text-xs text-gray-500">Management System</p>
            </div>
          </div>

          <nav className="space-y-2 flex-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  currentView === item.id
                    ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-lg transform scale-105'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="pt-4 border-t border-gray-200">
            <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
              <p className="text-xs font-semibold text-indigo-600 mb-1">Version 1.0</p>
              <p className="text-xs text-gray-600">© 2024 Inventory System</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

// Dashboard Component
const Dashboard = ({ token }) => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    totalSales: 0,
    totalCustomers: 0,
  });
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [productsRes, lowStockRes, salesRes, customersRes] = await Promise.all([
        fetch(`${API_BASE}/products/`, { headers }),
        fetch(`${API_BASE}/products/low-stock`, { headers }),
        fetch(`${API_BASE}/sales/?limit=5`, { headers }),
        fetch(`${API_BASE}/customers/`, { headers }),
      ]);

      const products = await productsRes.json();
      const lowStock = await lowStockRes.json();
      const sales = await salesRes.json();
      const customers = await customersRes.json();

      setStats({
        totalProducts: products.length,
        lowStockProducts: lowStock.length,
        totalSales: sales.length,
        totalCustomers: customers.length,
      });

      setLowStockProducts(lowStock.slice(0, 5));
      setRecentSales(sales);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          gradient="from-blue-500 to-cyan-500"
          trend="+12%"
        />
        <StatCard
          title="Low Stock Alert"
          value={stats.lowStockProducts}
          icon={AlertTriangle}
          gradient="from-red-500 to-pink-500"
          trend="Critical"
        />
        <StatCard
          title="Total Sales"
          value={stats.totalSales}
          icon={ShoppingCart}
          gradient="from-green-500 to-emerald-500"
          trend="+8%"
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={Users}
          gradient="from-purple-500 to-pink-500"
          trend="+15%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Products */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">Stok Menipis</h3>
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
              <AlertTriangle className="text-white" size={20} />
            </div>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package className="text-green-600" size={32} />
              </div>
              <p className="text-gray-500 font-medium">Semua produk stok aman</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200 hover:shadow-md transition-all"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-600 font-bold text-lg">
                      {product.stock_qty} {product.unit}
                    </p>
                    <p className="text-xs text-gray-500">Min: {product.min_stock}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Sales */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">Penjualan Terbaru</h3>
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
              <ShoppingCart className="text-white" size={20} />
            </div>
          </div>

          {recentSales.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShoppingCart className="text-gray-400" size={32} />
              </div>
              <p className="text-gray-500 font-medium">Belum ada penjualan</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200 hover:shadow-md transition-all"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{sale.customer_name}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(sale.order_date).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-600 font-bold">
                      Rp {Number(sale.total_amount).toLocaleString('id-ID')}
                    </p>
                    <p className="text-xs text-gray-500">{sale.payment_method}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


  // Products Component (simplified - keeping existing logic)
 // Products Component (refactor + edit + delete)
const Products = ({ token }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // add
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: '',
    unit: 'pcs',
    product_type: 'INTERNAL',
    base_cost: 0,
    sell_price: 0,
    stock_qty: 0,
    min_stock: 0,
  });

  // edit
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    sku: '',
    name: '',
    category: '',
    unit: '',
    product_type: 'INTERNAL',
    base_cost: 0,
    sell_price: 0,
    min_stock: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/products/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProducts(data);
      setCurrentPage(1); // reset ke halaman pertama setelah reload data
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // CREATE
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/products/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.detail || 'Error creating product');
        return;
      }

      setShowAddModal(false);
      fetchProducts();
      setFormData({
        sku: '',
        name: '',
        category: '',
        unit: 'pcs',
        product_type: 'INTERNAL',
        base_cost: 0,
        sell_price: 0,
        stock_qty: 0,
        min_stock: 0,
      });
    } catch (error) {
      alert('Error creating product');
    }
  };

  // open edit modal
  const openEditModal = (product) => {
    setEditingProduct(product);
    setEditForm({
      sku: product.sku,
      name: product.name,
      category: product.category || '',
      unit: product.unit || '',
      product_type: product.product_type,
      base_cost: Number(product.base_cost),
      sell_price: Number(product.sell_price),
      min_stock: Number(product.min_stock),
      is_active: product.is_active,
    });
    setShowEditModal(true);
  };

  // UPDATE
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const payload = {
        sku: editForm.sku,
        name: editForm.name,
        category: editForm.category,
        unit: editForm.unit,
        product_type: editForm.product_type,
        base_cost: Number(editForm.base_cost),
        sell_price: Number(editForm.sell_price),
        min_stock: Number(editForm.min_stock),
        is_active: editForm.is_active,
      };

      const res = await fetch(`${API_BASE}/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.detail || 'Error updating product');
        return;
      }

      setShowEditModal(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      alert('Error updating product');
    }
  };

  // DELETE
  const handleDelete = async (product) => {
    const ok = window.confirm(`Hapus produk "${product.name}"?`);
    if (!ok) return;

    try {
      const res = await fetch(`${API_BASE}/products/${product.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.detail || 'Error deleting product');
        return;
      }

      fetchProducts();
    } catch (error) {
      alert('Error deleting product');
    }
  };

  // reset page kalau search berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // pagination calculation
  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const goToPrev = () => {
    setCurrentPage((p) => Math.max(1, p - 1));
  };

  const goToNext = () => {
    setCurrentPage((p) => Math.min(totalPages, p + 1));
  };

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Produk</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          <span className="font-medium">Tambah Produk</span>
        </button>
      </div>

      {/* table + search */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="mb-6">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-slate-50">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Stok
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Harga
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedProducts.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        product.product_type === 'INTERNAL'
                          ? 'bg-blue-100 text-blue-700'
                          : product.product_type === 'RAW'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {product.product_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`font-bold ${
                        Number(product.stock_qty) <= Number(product.min_stock)
                          ? 'text-red-600'
                          : 'text-gray-900'
                      }`}
                    >
                      {Number(product.stock_qty)} {product.unit}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    Rp {Number(product.sell_price).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        product.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {product.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                    <button
                      onClick={() => openEditModal(product)}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-all"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {totalItems === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-6 text-center text-sm text-gray-500">
                    Tidak ada produk.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3 text-sm text-gray-600">
            <span>
              Menampilkan{' '}
              <span className="font-semibold">
                {startIndex + 1}–{endIndex}
              </span>{' '}
              dari <span className="font-semibold">{totalItems}</span> produk
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrev}
                disabled={safePage === 1}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${
                  safePage === 1
                    ? 'cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200'
                    : 'bg-white hover:bg-gray-50 border-gray-300'
                }`}
              >
                ‹ Sebelumnya
              </button>
              <span className="text-xs">
                Halaman{' '}
                <span className="font-semibold">
                  {safePage} / {totalPages}
                </span>
              </span>
              <button
                onClick={goToNext}
                disabled={safePage === totalPages}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${
                  safePage === totalPages
                    ? 'cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200'
                    : 'bg-white hover:bg-gray-50 border-gray-300'
                }`}
              >
                Berikutnya ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        /* ... modal add tetap sama seperti punyamu di atas ... */
        <Modal title="Tambah Produk Baru" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">SKU</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tipe Produk</label>
                <select
                  value={formData.product_type}
                  onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="INTERNAL">Internal (Jual)</option>
                  <option value="RAW">Bahan Baku</option>
                  <option value="SERVICE">Jasa</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Produk</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Satuan</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Harga Modal</label>
                <input
                  type="number"
                  value={formData.base_cost}
                  onChange={(e) =>
                    setFormData({ ...formData, base_cost: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Harga Jual</label>
                <input
                  type="number"
                  value={formData.sell_price}
                  onChange={(e) =>
                    setFormData({ ...formData, sell_price: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Stok Awal</label>
                <input
                  type="number"
                  value={formData.stock_qty}
                  onChange={(e) =>
                    setFormData({ ...formData, stock_qty: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Stok Minimum</label>
                <input
                  type="number"
                  value={formData.min_stock}
                  onChange={(e) =>
                    setFormData({ ...formData, min_stock: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 rounded-xl font-semibold transition-all shadow-lg"
              >
                Simpan
              </button>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-semibold transition-all"
              >
                Batal
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Product Modal */}
      {showEditModal && (
        <Modal title="Edit Produk" onClose={() => setShowEditModal(false)}>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">SKU</label>
                <input
                  type="text"
                  value={editForm.sku}
                  onChange={(e) => setEditForm({ ...editForm, sku: e.target.value })}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tipe Produk</label>
                <select
                  value={editForm.product_type}
                  onChange={(e) => setEditForm({ ...editForm, product_type: e.target.value })}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="INTERNAL">Internal (Jual)</option>
                  <option value="RAW">Bahan Baku</option>
                  <option value="SERVICE">Jasa</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Produk</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori</label>
                <input
                  type="text"
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Satuan</label>
                <input
                  type="text"
                  value={editForm.unit}
                  onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Harga Modal</label>
                <input
                  type="number"
                  value={editForm.base_cost}
                  onChange={(e) =>
                    setEditForm({ ...editForm, base_cost: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Harga Jual</label>
                <input
                  type="number"
                  value={editForm.sell_price}
                  onChange={(e) =>
                    setEditForm({ ...editForm, sell_price: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Stok Minimum</label>
              <input
                type="number"
                value={editForm.min_stock}
                onChange={(e) =>
                  setEditForm({ ...editForm, min_stock: Number(e.target.value) })
                }
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                checked={editForm.is_active}
                onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
              />
              <span className="text-sm text-gray-700">Produk aktif</span>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 rounded-xl font-semibold transition-all shadow-lg"
              >
                Simpan
              </button>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-semibold transition-all"
              >
                Batal
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

// Sales Component - Simplified version
const Sales = ({ token }) => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [accounts, setAccounts] = useState([]);

  // modal create
  const [showCreateModal, setShowCreateModal] = useState(false);

  // modal detail
  const [detailSale, setDetailSale] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // filter tanggal
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // pagination (front-end)
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [formData, setFormData] = useState({
    customer_id: "",
    customer_name: "",
    order_date: new Date().toISOString().split("T")[0],
    payment_method: "CASH",
    source_account_id: "",
    notes: "",
    items: [{ product_id: "", qty: 1, unit_price: 0, discount: 0 }],
  });

  // === FETCH DATA INIT ===
  useEffect(() => {
    fetchSales();
    fetchProducts();
    fetchCustomers();
    fetchAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSales = async () => {
    try {
      const res = await fetch(`${API_BASE}/sales/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSales(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetch sales:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetch products:", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_BASE}/customers/`, {
      headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetch customers:", error);
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await fetch(`${API_BASE}/accounts/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching accounts:", err);
    }
  };

  // === UTIL ===
  const formatDateTime = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateOnly = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // === FORM HANDLERS ===
  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { product_id: "", qty: 1, unit_price: 0, discount: 0 },
      ],
    }));
  };

  const removeItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateItem = (index, field, value) => {
    setFormData((prev) => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };

      if (field === "product_id") {
        const product = products.find((p) => p.id === Number(value));
        if (product) {
          newItems[index].unit_price = Number(product.sell_price || 0);
        }
      }

      return { ...prev, items: newItems };
    });
  };

  const calculateTotal = () =>
    formData.items.reduce((sum, item) => {
      const qty = Number(item.qty || 0);
      const price = Number(item.unit_price || 0);
      const discount = Number(item.discount || 0);
      return sum + (qty * price - discount);
    }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validItems = formData.items.filter(
      (it) => it.product_id && Number(it.qty) > 0
    );
    if (validItems.length === 0) {
      alert("Tambahkan minimal 1 item dengan qty > 0.");
      return;
    }

    const payload = {
      customer_id: formData.customer_id
        ? Number(formData.customer_id)
        : null,
      customer_name: formData.customer_name || null,
      order_date: formData.order_date,
      payment_method: formData.payment_method,
      source_account_id:
        formData.payment_method === "CREDIT"
          ? null
          : formData.source_account_id
          ? Number(formData.source_account_id)
          : null,
      notes: formData.notes || null,
      items: validItems.map((item) => ({
        product_id: Number(item.product_id),
        qty: Number(item.qty),
        unit_price: Number(item.unit_price),
        discount: Number(item.discount || 0),
      })),
    };

    if (
      ["CASH", "TRANSFER"].includes(payload.payment_method) &&
      !payload.source_account_id
    ) {
      alert("Pilih sumber rekening untuk pembayaran CASH/TRANSFER.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/sales/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowCreateModal(false);
        await fetchSales();
        setFormData({
          customer_id: "",
          customer_name: "",
          order_date: new Date().toISOString().split("T")[0],
          payment_method: "CASH",
          source_account_id: "",
          notes: "",
          items: [{ product_id: "", qty: 1, unit_price: 0, discount: 0 }],
        });
      } else {
        const error = await res.json().catch(() => ({}));
        alert("Error: " + (error.detail || "Failed to create sale"));
      }
    } catch (error) {
      console.error("Error creating sale:", error);
      alert("Error creating sale");
    }
  };

  // === DETAIL HANDLER ===
  const openDetail = async (sale) => {
    setDetailLoading(true);
    setDetailSale(null);
    try {
      const res = await fetch(`${API_BASE}/sales/${sale.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDetailSale(data);
    } catch (err) {
      console.error("Error get sale detail:", err);
      alert("Gagal mengambil detail penjualan");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => setDetailSale(null);

  // === FILTER & PAGINATION ===
  const filteredSales = sales.filter((s) => {
    if (!s.order_date) return false;
    const d = new Date(s.order_date);
    if (Number.isNaN(d.getTime())) return false;

    if (startDate) {
      const sd = new Date(startDate);
      if (d < sd) return false;
    }
    if (endDate) {
      const ed = new Date(endDate);
      ed.setHours(23, 59, 59, 999);
      if (d > ed) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredSales.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const pagedSales = filteredSales.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const goPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-gray-800">Penjualan</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          <span className="font-medium">Penjualan Baru</span>
        </button>
      </div>

      {/* Filter + table */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 space-y-4">
        {/* Filter tanggal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setPage(1);
              }}
              className="px-3 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Reset Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-slate-50">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Pembayaran
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pagedSales.map((sale) => (
                <tr
                  key={sale.id}
                  onClick={() => openDetail(sale)}
                  className="hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    #{sale.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {sale.customer_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDateOnly(sale.order_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                    Rp {Number(sale.total_amount || 0).toLocaleString("id-ID")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">
                    {sale.payment_method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        sale.status === "PAID"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {sale.status}
                    </span>
                  </td>
                </tr>
              ))}
              {pagedSales.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-6 text-center text-gray-500 text-sm"
                  >
                    Tidak ada transaksi penjualan pada periode ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-3 text-sm text-gray-600">
          <div>
            Halaman {currentPage} dari {totalPages} • Total data:{" "}
            {filteredSales.length}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => goPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              « Prev
            </button>
            <button
              type="button"
              onClick={() => goPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
            >
              Next »
            </button>
          </div>
        </div>
      </div>

      {/* Modal Create Sale */}
      {showCreateModal && (
        <Modal
          title="Buat Penjualan Baru"
          onClose={() => setShowCreateModal(false)}
          size="large"
        >
          {/* === FORM PENJUALAN BARU === */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Customer & Tanggal */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Customer
                </label>
                <select
                  value={formData.customer_id}
                  onChange={(e) => {
                    const customerId = e.target.value;
                    const customer = customers.find(
                      (c) => c.id === Number(customerId)
                    );
                    setFormData((prev) => ({
                      ...prev,
                      customer_id: customerId,
                      customer_name: customer ? customer.name : "",
                    }));
                  }}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  <option value="">Pilih atau tambah baru...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nama Customer Baru
                </label>
                <input
                  type="text"
                  value={formData.customer_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      customer_name: e.target.value,
                      customer_id: "",
                    }))
                  }
                  placeholder="Isi jika customer baru"
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tanggal Transaksi
                </label>
                <input
                  type="date"
                  value={formData.order_date}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      order_date: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>
            </div>

            {/* Pembayaran & Rekening */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Metode Pembayaran
                </label>
                <select
                  value={formData.payment_method}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      payment_method: e.target.value,
                      source_account_id:
                        e.target.value === "CREDIT"
                          ? ""
                          : prev.source_account_id,
                    }))
                  }
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  <option value="CASH">Cash</option>
                  <option value="TRANSFER">Transfer</option>
                  <option value="CREDIT">Kredit</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sumber Rekening
                </label>
                <select
                  value={formData.source_account_id}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      source_account_id: e.target.value,
                    }))
                  }
                  disabled={formData.payment_method === "CREDIT"}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400 transition-all"
                >
                  <option value="">
                    {formData.payment_method === "CREDIT"
                      ? "Tidak perlu (Kredit)"
                      : "Pilih rekening..."}
                  </option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.number})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Catatan */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Catatan
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                rows={2}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="Opsional, contoh: DP, lunas, dll."
              />
            </div>

            {/* Item List */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-800">Item</h4>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-sm rounded-lg transition-all shadow-md"
                >
                  <Plus size={16} />
                  Tambah
                </button>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {formData.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-2 items-start p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200"
                  >
                    <div className="flex-1">
                      <select
                        value={item.product_id}
                        onChange={(e) =>
                          updateItem(index, "product_id", e.target.value)
                        }
                        className="w-full px-2 py-2 border-2 border-gray-200 rounded-lg text-sm transition-all"
                        required
                      >
                        <option value="">Pilih produk...</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Stok: {p.stock_qty})
                          </option>
                        ))}
                      </select>
                    </div>

                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.qty}
                      onChange={(e) =>
                        updateItem(index, "qty", Number(e.target.value))
                      }
                      className="w-20 px-2 py-2 border-2 border-gray-200 rounded-lg text-sm"
                      min="1"
                      required
                    />

                    <input
                      type="number"
                      placeholder="Harga"
                      value={item.unit_price}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "unit_price",
                          Number(e.target.value)
                        )
                      }
                      className="w-28 px-2 py-2 border-2 border-gray-200 rounded-lg text-sm"
                      min="0"
                      required
                    />

                    <input
                      type="number"
                      placeholder="Diskon"
                      value={item.discount}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "discount",
                          Number(e.target.value)
                        )
                      }
                      className="w-24 px-2 py-2 border-2 border-gray-200 rounded-lg text-sm"
                      min="0"
                    />

                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Total & Buttons */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                <span className="text-lg font-bold text-gray-800">
                  Total Bayar:
                </span>
                <span className="text-3xl font-bold text-green-600">
                  Rp {calculateTotal().toLocaleString("id-ID")}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg"
                >
                  Simpan Penjualan
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-semibold transition-all"
                >
                  Batal
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Detail Sale */}
      {detailSale && (
        <Modal
          title={`Detail Penjualan #${detailSale.id}`}
          onClose={closeDetail}
          size="large"
        >
          {detailLoading ? (
            <div className="py-8 text-center text-gray-500 text-sm">
              Memuat detail...
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header detail */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500">
                    Customer
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    {detailSale.customer_name || "-"}
                  </p>

                  <p className="mt-3 text-xs font-semibold text-gray-500">
                    Metode Pembayaran
                  </p>
                  <p className="text-sm text-gray-800">
                    {detailSale.payment_method}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500">
                    Tanggal
                  </p>
                  <p className="text-sm text-gray-800">
                    {formatDateTime(detailSale.order_date)}
                  </p>

                  <p className="mt-3 text-xs font-semibold text-gray-500">
                    Status
                  </p>
                  <p className="text-sm font-semibold text-emerald-700">
                    {detailSale.status}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-2">
                  Item Penjualan
                </h4>
                <div className="overflow-x-auto border rounded-xl">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-slate-50">
                        <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Produk
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Qty
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Harga
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Diskon
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(() => {
                        const items =
                          (detailSale.items ||
                            detailSale.sale_items ||
                            []) ?? [];

                        if (!items.length) {
                          return (
                            <tr>
                              <td
                                colSpan={5}
                                className="px-4 py-4 text-center text-xs text-gray-500"
                              >
                                Tidak ada item.
                              </td>
                            </tr>
                          );
                        }

                        return items.map((it) => (
                          <tr key={it.id}>
                            <td className="px-4 py-2 text-gray-800">
                              {it.product_name || `Produk #${it.product_id}`}
                            </td>
                            <td className="px-4 py-2 text-right text-gray-800">
                              {Number(it.qty).toLocaleString("id-ID")}
                            </td>
                            <td className="px-4 py-2 text-right text-gray-800">
                              Rp{" "}
                              {Number(
                                it.unit_price || 0
                              ).toLocaleString("id-ID")}
                            </td>
                            <td className="px-4 py-2 text-right text-gray-800">
                              Rp{" "}
                              {Number(
                                it.discount || 0
                              ).toLocaleString("id-ID")}
                            </td>
                            <td className="px-4 py-2 text-right font-semibold text-gray-900">
                              Rp{" "}
                              {Number(
                                it.subtotal || 0
                              ).toLocaleString("id-ID")}
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-end border-t pt-4">
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Total
                  </p>
                  <p className="text-2xl font-bold text-emerald-700">
                    Rp{" "}
                    {Number(
                      detailSale.total_amount || 0
                    ).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};




// Customers Component
const Customers = ({ token }) => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    source_channel: '',
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCustomers(filtered);
    setCurrentPage(1);
  }, [searchTerm, customers]);

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_BASE}/customers/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('Nama harus diisi');
      return;
    }

    try {
      const url = editingCustomer
        ? `${API_BASE}/customers/${editingCustomer.id}/`
        : `${API_BASE}/customers/`;
      const method = editingCustomer ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        fetchCustomers();
        resetForm();
      }
    } catch (error) {
      alert(`Error ${editingCustomer ? 'updating' : 'creating'} customer`);
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      source_channel: customer.source_channel || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus customer ini?')) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/customers/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchCustomers();
      } else {
        alert('Error deleting customer');
      }
    } catch (error) {
      alert('Error deleting customer');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      source_channel: '',
    });
    setEditingCustomer(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Customer
          </h1>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            <span className="text-xl">+</span>
            Tambah Customer
          </button>
        </div>

        {/* Search Filter */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Cari nama customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-96 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Nama</th>
                  <th className="px-6 py-4 text-left font-semibold">Telepon</th>
                  <th className="px-6 py-4 text-left font-semibold">Email</th>
                  <th className="px-6 py-4 text-left font-semibold">Sumber</th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                  <th className="px-6 py-4 text-center font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.length > 0 ? (
                  currentItems.map((customer) => (
                    <tr key={customer.id} className="hover:bg-purple-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{customer.name}</td>
                      <td className="px-6 py-4 text-gray-600">{customer.phone || '-'}</td>
                      <td className="px-6 py-4 text-gray-600">{customer.email || '-'}</td>
                      <td className="px-6 py-4 text-gray-600">{customer.source_channel || 'Direct'}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            customer.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {customer.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(customer)}
                            className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(customer.id)}
                            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      {searchTerm ? 'Tidak ada customer yang cocok dengan pencarian' : 'Belum ada customer'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredCustomers.length)} dari {filteredCustomers.length} customer
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentPage === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => paginate(index + 1)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        currentPage === index + 1
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                          : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentPage === totalPages
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <Modal onClose={handleCloseModal}>
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {editingCustomer ? 'Edit Customer' : 'Tambah Customer Baru'}
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nama *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Telepon
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sumber Channel
                </label>
                <select
                  value={formData.source_channel}
                  onChange={(e) => setFormData({ ...formData, source_channel: e.target.value })}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  <option value="">Pilih sumber...</option>
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Website">Website</option>
                  <option value="Toko Offline">Toko Offline</option>
                  <option value="Referral">Referral</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Alamat
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-semibold transition-all shadow-lg"
              >
                {editingCustomer ? 'Update' : 'Simpan'}
              </button>
              <button
                onClick={handleCloseModal}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-semibold transition-all"
              >
                Batal
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};


// Purchases Component – dengan Purchase Plan & Partial Receive
// Purchases Component – sinkron dengan backend /purchases
// Helper format rupiah (taruh di atas komponen Purchases, tapi masih di dalam App.js)
// const formatCurrency = (value) =>
//   `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

// ============ MAIN PURCHASES COMPONENT ============
const Purchases = ({ token }) => {
  const [activeTab, setActiveTab] = useState('RECEIPTS'); // RECEIPTS | PLANS
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Data
  const [purchases, setPurchases] = useState([]);
  const [plans, setPlans] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  // Modals
  const [showDirectPurchaseModal, setShowDirectPurchaseModal] = useState(false);
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [showPlanDetailModal, setShowPlanDetailModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }),
    [token]
  );

  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch(`${API_BASE}/accounts/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setAccounts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching accounts:', err);
      }
    };

    fetchAccounts();
  }, [token]);

  useEffect(() => {
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [purchasesRes, plansRes, productsRes, suppliersRes] = await Promise.all([
        fetch(`${API_BASE}/purchases/receipts`, { headers }),
        fetch(`${API_BASE}/purchase-plans/`, { headers }),
        fetch(`${API_BASE}/products/`, { headers }),
        fetch(`${API_BASE}/suppliers/`, { headers }),
      ]);

      // Purchases
      if (!purchasesRes.ok) {
        setErrorMsg(`Gagal memuat data pembelian (status ${purchasesRes.status})`);
        setPurchases([]);
      } else {
        const purchasesData = await purchasesRes.json();
        setPurchases(Array.isArray(purchasesData) ? purchasesData : []);
      }

      // Plans
      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setPlans(Array.isArray(plansData) ? plansData : []);
      }

      const [productsData, suppliersData] = await Promise.all([
        productsRes.json(),
        suppliersRes.json(),
      ]);

      setProducts(Array.isArray(productsData) ? productsData : []);
      setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);
    } catch (err) {
      console.error('Error loading data:', err);
      setErrorMsg('Terjadi error saat memuat data.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      OPEN: 'bg-blue-100 text-blue-800',
      PARTIAL: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'OPEN':
        return <Clock className="w-4 h-4" />;
      case 'PARTIAL':
        return <Truck className="w-4 h-4" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      case 'CANCELLED':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const findSupplierName = (purchase) => {
    if (purchase.supplier_name) return purchase.supplier_name;
    const s = suppliers.find((sp) => sp.id === purchase.supplier_id);
    return s ? s.name : '-';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Pembelian</h2>
          <p className="text-sm text-gray-500">
            Kelola pembelian langsung dan bertahap dengan fleksibel
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
          <button
            type="button"
            onClick={() => setActiveTab('PLANS')}
            className={`px-4 py-1.5 text-sm rounded-full transition-all ${
              activeTab === 'PLANS'
                ? 'bg-white text-gray-900 shadow-md'
                : 'text-gray-500'
            }`}
          >
            Rencana Pembelian
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('RECEIPTS')}
            className={`px-4 py-1.5 text-sm rounded-full transition-all ${
              activeTab === 'RECEIPTS'
                ? 'bg-white text-gray-900 shadow-md'
                : 'text-gray-500'
            }`}
          >
            Penerimaan Langsung
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        {activeTab === 'PLANS' ? (
          <button
            onClick={() => setShowCreatePlanModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            <span className="font-medium">Buat Rencana Pembelian</span>
          </button>
        ) : (
          <button
            onClick={() => setShowDirectPurchaseModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            <span className="font-medium">Pembelian Langsung</span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        {activeTab === 'PLANS' ? (
          <PlansListView
            plans={plans}
            loading={loading}
            onViewDetail={(plan) => {
              setSelectedPlan(plan);
              setShowPlanDetailModal(true);
            }}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
          />
        ) : (
          <ReceiptsListView
            purchases={purchases}
            loading={loading}
            errorMsg={errorMsg}
            findSupplierName={findSupplierName}
          />
        )}
      </div>

      {/* Modals */}
      {showDirectPurchaseModal && (
        <DirectPurchaseModal
          products={products}
          suppliers={suppliers}
          headers={headers}
          onClose={() => setShowDirectPurchaseModal(false)}
          onSuccess={fetchInitialData}
        />
      )}

      {showCreatePlanModal && (
        <CreatePlanModal
          products={products}
          suppliers={suppliers}
          headers={headers}
          onClose={() => setShowCreatePlanModal(false)}
          onSuccess={fetchInitialData}
        />
      )}

      {showPlanDetailModal && selectedPlan && (
        <PlanDetailModal
          plan={selectedPlan}
          products={products}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
          onClose={() => {
            setShowPlanDetailModal(false);
            setSelectedPlan(null);
          }}
          onReceive={() => {
            setShowPlanDetailModal(false);
            setShowReceiveModal(true);
          }}
        />
      )}

      {showReceiveModal && selectedPlan && (
        <ReceiveItemsModal
          plan={selectedPlan}
          products={products}
          headers={headers}
          accounts={accounts}
          onClose={() => {
            setShowReceiveModal(false);
            setSelectedPlan(null);
          }}
          onSuccess={() => {
            setShowReceiveModal(false);
            setSelectedPlan(null);
            fetchInitialData();
          }}
        />
      )}
    </div>
  );
};

// ============ PLANS LIST VIEW ============
const PlansListView = ({
  plans,
  loading,
  onViewDetail,
  getStatusColor,
  getStatusIcon,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const filteredPlans = plans.filter((plan) => {
    const matchSearch =
      plan.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || plan.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Memuat data...</div>;
  }

  return (
    <div>
      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari supplier atau catatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">Semua Status</option>
          <option value="OPEN">Open</option>
          <option value="PARTIAL">Partial</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Plans Grid */}
      {filteredPlans.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Belum ada rencana pembelian
          </h3>
          <p className="text-gray-600">
            Buat rencana pembelian bertahap untuk mengelola stok lebih fleksibel
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onClick={() => onViewDetail(plan)}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const PlanCard = ({ plan, onClick, getStatusColor, getStatusIcon }) => {
  const totalPlanned = plan.items.reduce(
    (sum, item) => sum + parseFloat(item.planned_qty),
    0
  );
  const totalReceived = plan.items.reduce(
    (sum, item) => sum + parseFloat(item.received_qty),
    0
  );
  const progress = totalPlanned > 0 ? (totalReceived / totalPlanned) * 100 : 0;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer border-2 border-gray-100 hover:border-blue-300"
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              {plan.supplier_name || 'Tanpa Supplier'}
            </h3>
            <p className="text-sm text-gray-600">
              {plan.items.length} item produk
            </p>
          </div>
          <span
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
              plan.status
            )}`}
          >
            {getStatusIcon(plan.status)}
            {plan.status}
          </span>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium text-gray-900">
              {progress.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-600 mb-1">Target</p>
            <p className="text-lg font-bold text-gray-900">{totalPlanned}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Diterima</p>
            <p className="text-lg font-bold text-green-600">{totalReceived}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            {plan.target_date
              ? new Date(plan.target_date).toLocaleDateString('id-ID')
              : 'Tanpa target'}
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

// ============ RECEIPTS LIST VIEW ============
const ReceiptsListView = ({ purchases, loading, errorMsg, findSupplierName }) => {
  if (loading) {
    return <div className="text-center py-10 text-gray-500">Memuat data...</div>;
  }

  if (errorMsg) {
    return <div className="text-center py-10 text-sm text-red-500">{errorMsg}</div>;
  }

  if (purchases.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 text-sm">
        Belum ada data pembelian.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gradient-to-r from-gray-50 to-slate-50">
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
              Supplier
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
              Invoice
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
              Tanggal
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
              Total
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
              Pembayaran
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {purchases.map((purchase) => (
            <tr
              key={purchase.id}
              className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                #{purchase.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                {findSupplierName(purchase)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {purchase.invoice_number || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {purchase.purchase_date
                  ? new Date(purchase.purchase_date).toLocaleDateString('id-ID')
                  : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                {formatCurrency(purchase.total_amount || 0)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">
                {purchase.payment_method}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ============ DIRECT PURCHASE MODAL ============
const DirectPurchaseModal = ({ products, suppliers, headers, onClose, onSuccess, token }) => {
  const [formData, setFormData] = useState({
    supplier_id: '',
    supplier_name: '',
    invoice_number: '',
    purchase_date: new Date().toISOString().split('T')[0],
    payment_method: 'CASH',
    source_account_id: '', 
    notes: '',
    items: [{ product_id: '', qty: 1, unit_cost: 0, discount: 0 }],
  });

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { product_id: '', qty: 1, unit_cost: 0, discount: 0 }],
    }));
  };

  const handleRemoveItem = (idx) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  };

  const handleChangeItem = (idx, field, value) => {
    setFormData((prev) => {
      const items = [...prev.items];
      if (field === 'product_id') {
        const product = products.find((p) => p.id === Number(value));
        items[idx] = {
          ...items[idx],
          product_id: value,
          unit_cost: product ? Number(product.base_cost || 0) : 0,
        };
      } else if (['qty', 'unit_cost', 'discount'].includes(field)) {
        items[idx] = { ...items[idx], [field]: Number(value) };
      } else {
        items[idx] = { ...items[idx], [field]: value };
      }
      return { ...prev, items };
    });
  };

  const calcTotal = () =>
    formData.items.reduce((sum, it) => {
      const qty = Number(it.qty || 0);
      const cost = Number(it.unit_cost || 0);
      const disc = Number(it.discount || 0);
      return sum + qty * cost - disc;
    }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      supplier_id: formData.supplier_id ? Number(formData.supplier_id) : null,
      supplier_name: formData.supplier_name || null,
      invoice_number: formData.invoice_number || null,
      purchase_date: formData.purchase_date || null,
      payment_method: formData.payment_method,
      notes: formData.notes || null,
      source_account_id:
      formData.payment_method === 'CREDIT'
        ? null                          // kalau kredit boleh kosong
        : formData.source_account_id
        ? Number(formData.source_account_id)
        : null,
      items: formData.items
        .filter((it) => it.product_id && Number(it.qty) > 0)
        .map((it) => ({
          product_id: Number(it.product_id),
          qty: Number(it.qty),
          unit_cost: Number(it.unit_cost),
          discount: Number(it.discount || 0),
        })),
    };

    if (
    ['CASH', 'TRANSFER'].includes(payload.payment_method) &&
    !payload.source_account_id
  ) {
    alert('Pilih sumber rekening terlebih dahulu.');
    return;
  }

    if (!payload.items.length) {
      alert('Minimal 1 item produk.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/purchases/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert('Gagal menyimpan: ' + (err.detail || res.statusText));
        return;
      }

      alert('Pembelian berhasil disimpan!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi error saat membuat pembelian.');
    }
  };

  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch(`${API_BASE}/accounts/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setAccounts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching accounts:', err);
      }
    };

    fetchAccounts();
  }, [token]);

  return (
    <Modal title="Pembelian Langsung" onClose={onClose} size="large">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Supplier Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Supplier
            </label>
            <select
              value={formData.supplier_id}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, supplier_id: e.target.value }))
              }
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
            >
              <option value="">Pilih supplier...</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nama Supplier (manual)
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value. id }))
              }
              placeholder="Isi jika tidak pakai master"
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Purchase Info */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              No. Invoice
            </label>
            <input
              type="text"
              value={formData.invoice_number}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  invoice_number: e.target.value,
                }))
              }
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tanggal
            </label>
            <input
              type="date"
              value={formData.purchase_date}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  purchase_date: e.target.value,
                }))
              }
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Metode Pembayaran
            </label>
            <select
              value={formData.payment_method}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  payment_method: e.target.value,
                }))
              }
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="CASH">Cash</option>
              <option value="TRANSFER">Transfer</option>
              {/* kalau mau: QRIS, E-WALLET, dll */}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Sumber Rekening
            </label>
            <select
                value={formData.source_account_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    source_account_id: e.target.value || null,
                  })
                }
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option value="">Pilih rekening...</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {/* contoh label: BCA 2330171191 (Saldo: Rp xxx) */}
                    {acc.name || acc.bank_name}{" "}
                    {acc.account_number ? `(${acc.account_number})` : ""}
                  </option>
                ))}
              </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Catatan
          </label>
          <textarea
            rows={2}
            value={formData.notes}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notes: e.target.value }))
            }
            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Items */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-gray-800">Item Pembelian</h4>
            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-sm rounded-lg"
            >
              <Plus size={16} />
              Tambah
            </button>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {formData.items.map((it, idx) => (
              <div
                key={idx}
                className="flex gap-2 items-start p-3 bg-gray-50 rounded-xl border-2 border-gray-200"
              >
                <div className="flex-1">
                  <select
                    value={it.product_id}
                    onChange={(e) =>
                      handleChangeItem(idx, 'product_id', e.target.value)
                    }
                    className="w-full px-2 py-2 border-2 border-gray-200 rounded-lg text-sm"
                    required
                  >
                    <option value="">Pilih produk...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku}) • stok: {p.stock_qty}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={it.qty}
                  onChange={(e) =>
                    handleChangeItem(idx, 'qty', e.target.value)
                  }
                  placeholder="Qty"
                  className="w-20 px-2 py-2 border-2 border-gray-200 rounded-lg text-sm"
                  required
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={it.unit_cost}
                  onChange={(e) =>
                    handleChangeItem(idx, 'unit_cost', e.target.value)
                  }
                  placeholder="Harga"
                  className="w-24 px-2 py-2 border-2 border-gray-200 rounded-lg text-sm"
                  required
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={it.discount}
                  onChange={(e) =>
                    handleChangeItem(idx, 'discount', e.target.value)
                  }
                  placeholder="Diskon"
                  className="w-24 px-2 py-2 border-2 border-gray-200 rounded-lg text-sm"
                />

                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Total & Actions */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
            <span className="text-lg font-bold text-gray-800">Total Bayar</span>
            <span className="text-3xl font-bold text-green-600">
              {formatCurrency(calcTotal())}
            </span>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-xl font-bold"
            >
              Simpan Pembelian
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-semibold"
            >
              Batal
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

// ============ CREATE PLAN MODAL ============
const CreatePlanModal = ({ products, suppliers, headers, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    supplier_id: '',
    supplier_name: '',
    target_date: '',
    notes: '',
    items: [],
  });

  const [newItem, setNewItem] = useState({
    product_id: '',
    planned_qty: '',
  });

  const handleAddItem = () => {
    if (!newItem.product_id || !newItem.planned_qty || parseFloat(newItem.planned_qty) <= 0) {
      alert('Pilih produk dan masukkan qty yang valid');
      return;
    }

    const product = products.find((p) => p.id === parseInt(newItem.product_id));
    if (!product) return;

    if (formData.items.some((item) => item.product_id === parseInt(newItem.product_id))) {
      alert('Produk sudah ditambahkan');
      return;
    }

    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          product_id: parseInt(newItem.product_id),
          product_name: product.name,
          planned_qty: parseFloat(newItem.planned_qty),
        },
      ],
    });

    setNewItem({ product_id: '', planned_qty: '' });
  };

  const handleRemoveItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.items.length === 0) {
      alert('Tambahkan minimal 1 item produk');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/purchase-plans/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          supplier_id: formData.supplier_id || null,
          supplier_name: formData.supplier_name || null,
          target_date: formData.target_date || null,
          notes: formData.notes || null,
          items: formData.items.map((item) => ({
            product_id: item.product_id,
            planned_qty: item.planned_qty,
          })),
        }),
      });

      if (response.ok) {
        alert('Rencana pembelian berhasil dibuat!');
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail || 'Gagal membuat rencana'}`);
      }
    } catch (error) {
      console.error('Error creating plan:', error);
      alert('Terjadi kesalahan saat membuat rencana');
    }
  };

  return (
    <Modal title="Buat Rencana Pembelian" onClose={onClose} size="large">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Supplier Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Supplier (Opsional)
            </label>
            <select
              value={formData.supplier_id}
              onChange={(e) => {
                const supplier = suppliers.find(
                  (s) => s.id === parseInt(e.target.value)
                );
                setFormData({
                  ...formData,
                  supplier_id: e.target.value,
                  supplier_name: supplier ? supplier.name : '',
                });
              }}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih Supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Target Tanggal (Opsional)
            </label>
            <input
              type="date"
              value={formData.target_date}
              onChange={(e) =>
                setFormData({ ...formData, target_date: e.target.value })
              }
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Catatan (Opsional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            rows={3}
            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
            placeholder="Tambahkan catatan untuk rencana ini..."
          />
        </div>

        {/* Add Items */}
        <div className="border-t pt-4">
          <h4 className="font-bold text-gray-800 mb-3">Daftar Produk</h4>

          <div className="flex gap-4 mb-4">
            <select
              value={newItem.product_id}
              onChange={(e) =>
                setNewItem({ ...newItem, product_id: e.target.value })
              }
              className="flex-1 px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih Produk</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              value={newItem.planned_qty}
              onChange={(e) =>
                setNewItem({ ...newItem, planned_qty: e.target.value })
              }
              placeholder="Qty Rencana"
              min="0.01"
              step="0.01"
              className="w-40 px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="button"
              onClick={handleAddItem}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          {formData.items.length > 0 ? (
            <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Produk
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                      Qty Rencana
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {formData.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.product_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                        {item.planned_qty}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">Belum ada produk ditambahkan</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl font-bold"
          >
            Simpan Rencana
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-semibold"
          >
            Batal
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ============ PLAN DETAIL MODAL ============
const PlanDetailModal = ({
  plan,
  products,
  getStatusColor,
  getStatusIcon,
  onClose,
  onReceive,
}) => {
  const totalPlanned = plan.items.reduce(
    (sum, item) => sum + parseFloat(item.planned_qty),
    0
  );
  const totalReceived = plan.items.reduce(
    (sum, item) => sum + parseFloat(item.received_qty),
    0
  );
  const progress = totalPlanned > 0 ? (totalReceived / totalPlanned) * 100 : 0;

  return (
    <Modal title="Detail Rencana Pembelian" onClose={onClose} size="large">
      <div className="space-y-6">
        {/* Header Info */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {plan.supplier_name || 'Tanpa Supplier'}
            </h3>
            <p className="text-sm text-gray-600">ID: #{plan.id}</p>
          </div>
          <span
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
              plan.status
            )}`}
          >
            {getStatusIcon(plan.status)}
            {plan.status}
          </span>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Target Date</p>
                <p className="font-semibold text-gray-900">
                  {plan.target_date
                    ? new Date(plan.target_date).toLocaleDateString('id-ID')
                    : 'Tidak ada'}
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-xs text-gray-600">Total Items</p>
                <p className="font-semibold text-gray-900">
                  {plan.items.length} produk
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
            <div className="flex items-center gap-3">
              <Truck className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Progress</p>
                <p className="font-semibold text-gray-900">
                  {progress.toFixed(0)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {plan.notes && (
          <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
            <p className="text-sm text-gray-700">
              <strong>Catatan:</strong> {plan.notes}
            </p>
          </div>
        )}

        {/* Items Table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-gray-900">Daftar Produk</h4>
            {plan.status !== 'COMPLETED' && plan.status !== 'CANCELLED' && (
              <button
                onClick={onReceive}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-medium"
              >
                <Truck className="w-5 h-5" />
                Terima Barang
              </button>
            )}
          </div>

          <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                    Produk ID
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">
                    Rencana
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">
                    Diterima
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">
                    Sisa
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-gray-700">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {plan.items.map((item) => {
                  const planned = parseFloat(item.planned_qty);
                  const received = parseFloat(item.received_qty);
                  const remaining = planned - received;
                  const itemProgress = planned > 0 ? (received / planned) * 100 : 0;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        Product #{item.product_id}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                        {planned}
                      </td>
                      <td className="px-4 py-3 text-sm text-green-600 text-right font-bold">
                        {received}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">
                        {remaining}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                itemProgress === 100 ? 'bg-green-600' : 'bg-blue-600'
                              }`}
                              style={{ width: `${itemProgress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 w-12 text-right">
                            {itemProgress.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// ============ RECEIVE ITEMS MODAL ============
const ReceiveItemsModal = ({ plan, products, headers, onClose, onSuccess, token }) => {
  const [receiveData, setReceiveData] = useState({
    supplier_id: plan.supplier_id || null,
    supplier_name: plan.supplier_name || '',
    invoice_number: '',
    purchase_date: new Date().toISOString().split('T')[0],
    payment_method: 'CASH',
    notes: '',
    source_account_id: '', 
    items: plan.items
      .filter(
        (item) =>
          parseFloat(item.received_qty) < parseFloat(item.planned_qty)
      )
      .map((item) => ({
        product_id: item.product_id,
        plan_item_id: item.id,
        planned_qty: parseFloat(item.planned_qty),
        received_qty: parseFloat(item.received_qty),
        remaining_qty:
          parseFloat(item.planned_qty) - parseFloat(item.received_qty),
        qty: 0,
        unit_cost: 0,
        discount: 0,
      })),
  });

  const handleQtyChange = (index, qty) => {
    const newItems = [...receiveData.items];
    const qtyNum = parseFloat(qty) || 0;

    if (qtyNum > newItems[index].remaining_qty) {
      alert(`Qty tidak boleh melebihi sisa: ${newItems[index].remaining_qty}`);
      return;
    }

    newItems[index].qty = qtyNum;
    setReceiveData({ ...receiveData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const itemsToReceive = receiveData.items.filter((item) => item.qty > 0);

    if (itemsToReceive.length === 0) {
      alert('Masukkan qty untuk minimal 1 produk');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/purchases/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          supplier_id: receiveData.supplier_id,
          supplier_name: receiveData.supplier_name,
          invoice_number: receiveData.invoice_number,
          purchase_date: receiveData.purchase_date,
          payment_method: receiveData.payment_method,
          notes: receiveData.notes,
          source_account_id:
            receiveData.payment_method === 'CREDIT'
              ? null                          // kalau kredit boleh kosong
              : receiveData.source_account_id
              ? Number(receiveData.source_account_id)
              : null,
          items: itemsToReceive.map((item) => ({
            product_id: item.product_id,
            qty: item.qty,
            unit_cost: item.unit_cost,
            discount: item.discount,
            plan_item_id: item.plan_item_id,
          })),
        }),
      });

      if (response.ok) {
        alert('Penerimaan barang berhasil dicatat!');
        onSuccess();
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail || 'Gagal mencatat penerimaan'}`);
      }
    } catch (error) {
      console.error('Error receiving items:', error);
      alert('Terjadi kesalahan saat mencatat penerimaan');
    }
  };

  const totalAmount = receiveData.items.reduce((sum, item) => {
    return sum + (item.qty * item.unit_cost - item.discount);
  }, 0);

  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch(`${API_BASE}/accounts/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setAccounts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching accounts:', err);
      }
    };

    fetchAccounts();
  }, [token]);

  return (
    <Modal title="Terima Barang Bertahap" onClose={onClose} size="large">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Info */}
        <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>💡 Tips:</strong> Anda bisa menerima barang sebagian sesuai
            ketersediaan. Sistem akan otomatis mencatat progress dan mengupdate
            status rencana pembelian.
          </p>
        </div>

        {/* Purchase Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nomor Invoice
            </label>
            <input
              type="text"
              value={receiveData.invoice_number}
              onChange={(e) =>
                setReceiveData({ ...receiveData, invoice_number: e.target.value })
              }
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
              placeholder="INV-001"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tanggal Pembelian *
            </label>
            <input
              type="date"
              value={receiveData.purchase_date}
              onChange={(e) =>
                setReceiveData({ ...receiveData, purchase_date: e.target.value })
              }
              required
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Metode Pembayaran
            </label>
            <select
              value={receiveData.payment_method}
              onChange={(e) =>
                setReceiveData((prev) => ({
                  ...prev,
                  payment_method: e.target.value,
                }))
              }
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="CASH">Cash</option>
              <option value="TRANSFER">Transfer</option>
              {/* kalau mau: QRIS, E-WALLET, dll */}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Sumber Rekening
            </label>
            <select
              value={receiveData.source_account_id}
              onChange={(e) =>
                setReceiveData((prev) => ({
                  ...prev,
                  source_account_id: e.target.value,
                }))
              }
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="">Pilih rekening...</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} {acc.number ? `(${acc.number})` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Catatan
            </label>
            <input
              type="text"
              value={receiveData.notes}
              onChange={(e) =>
                setReceiveData({ ...receiveData, notes: e.target.value })
              }
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
              placeholder="Catatan tambahan..."
            />
          </div>
        </div>

        {/* Items */}
        <div>
          <h4 className="font-bold text-gray-800 mb-3">Produk yang Diterima</h4>

          <div className="border-2 border-gray-200 rounded-xl overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                    Produk
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">
                    Sisa
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">
                    Qty Terima *
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">
                    Harga Satuan *
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">
                    Diskon
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {receiveData.items.map((item, index) => {
                  const product = products.find((p) => p.id === item.product_id);
                  const subtotal = item.qty * item.unit_cost - item.discount;

                  return (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {product?.name || `Product #${item.product_id}`}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right font-medium">
                        {item.remaining_qty}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.qty || ''}
                          onChange={(e) => handleQtyChange(index, e.target.value)}
                          min="0"
                          max={item.remaining_qty}
                          step="0.01"
                          className="w-24 px-3 py-2 border-2 border-gray-200 rounded-lg text-right focus:ring-2 focus:ring-green-500"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.unit_cost || ''}
                          onChange={(e) => {
                            const newItems = [...receiveData.items];
                            newItems[index].unit_cost =
                              parseFloat(e.target.value) || 0;
                            setReceiveData({ ...receiveData, items: newItems });
                          }}
                          min="0"
                          step="0.01"
                          className="w-32 px-3 py-2 border-2 border-gray-200 rounded-lg text-right focus:ring-2 focus:ring-green-500"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.discount || ''}
                          onChange={(e) => {
                            const newItems = [...receiveData.items];
                            newItems[index].discount =
                              parseFloat(e.target.value) || 0;
                            setReceiveData({ ...receiveData, items: newItems });
                          }}
                          min="0"
                          step="0.01"
                          className="w-32 px-3 py-2 border-2 border-gray-200 rounded-lg text-right focus:ring-2 focus:ring-green-500"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right font-bold">
                        {formatCurrency(subtotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gradient-to-r from-green-50 to-emerald-50 border-t-2 border-green-200">
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 py-4 text-right text-lg font-bold text-gray-900"
                  >
                    Total
                  </td>
                  <td className="px-4 py-4 text-right text-2xl font-bold text-green-600">
                    {formatCurrency(totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-xl font-bold"
          >
            Simpan Penerimaan
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-semibold"
          >
            Batal
          </button>
        </div>
      </form>
    </Modal>
  );
};




// Expenses Component
const Expenses = ({ token }) => {
  const today = new Date().toISOString().slice(0, 10);

  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    amount: 0,
    payment_method: "CASH",
    notes: "",
    expense_date: today,
    source_account_id: "",
  });

  // Filter & Pagination
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ====== LOAD ACCOUNTS ======
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch(`${API_BASE}/accounts/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setAccounts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching accounts:", err);
      }
    };

    fetchAccounts();
  }, [token]);

  // ====== LOAD DATA ======
  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await fetch(`${API_BASE}/expenses/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setExpenses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // ====== FILTER DATA ======
  const filteredExpenses = expenses.filter((expense) => {
    if (!startDate && !endDate) return true;
    
    const expenseDate = new Date(expense.expense_date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && end) {
      return expenseDate >= start && expenseDate <= end;
    } else if (start) {
      return expenseDate >= start;
    } else if (end) {
      return expenseDate <= end;
    }
    return true;
  });

  // ====== PAGINATION ======
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentExpenses = filteredExpenses.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate]);

  // ====== OPEN EDIT MODAL ======
  const handleEdit = (expense) => {
    setEditingId(expense.id);
    setFormData({
      category: expense.category,
      description: expense.description || "",
      amount: expense.amount,
      payment_method: expense.payment_method,
      notes: expense.notes || "",
      expense_date: expense.expense_date || today,
      source_account_id: expense.source_account_id || "",
    });
    setShowModal(true);
  };

  // ====== SUBMIT (CREATE OR UPDATE) ======
  const handleSubmit = async () => {
    // Validasi rekening: wajib kalau CASH / TRANSFER
    if (
      formData.payment_method !== "CREDIT" &&
      !formData.source_account_id
    ) {
      alert("Gagal menyimpan: sumber_account_id wajib diisi untuk pembayaran CASH / TRANSFER");
      return;
    }

    try {
      const payload = {
        category: formData.category,
        description: formData.description || null,
        amount: Number(formData.amount || 0),
        payment_method: formData.payment_method,
        notes: formData.notes || null,
        expense_date: formData.expense_date || null,
        source_account_id: formData.source_account_id
          ? Number(formData.source_account_id)
          : null,
      };

      const url = editingId
        ? `${API_BASE}/expenses/${editingId}`
        : `${API_BASE}/expenses/`;
      
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowModal(false);
        setEditingId(null);
        await fetchExpenses();

        // reset form
        setFormData({
          category: "",
          description: "",
          amount: 0,
          payment_method: "CASH",
          notes: "",
          expense_date: today,
          source_account_id: "",
        });
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`Gagal ${editingId ? 'mengupdate' : 'membuat'} pengeluaran: ` + (err.detail || res.statusText));
      }
    } catch (error) {
      console.error("Error saving expense:", error);
      alert("Error saving expense");
    }
  };

  // ====== CLOSE MODAL ======
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      category: "",
      description: "",
      amount: 0,
      payment_method: "CASH",
      notes: "",
      expense_date: today,
      source_account_id: "",
    });
  };

  // ====== CLEAR FILTER ======
  const handleClearFilter = () => {
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Pengeluaran</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          <span className="font-medium">Tambah Pengeluaran</span>
        </button>
      </div>

      {/* FILTER TANGGAL */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-sm font-bold text-gray-700 mb-4">Filter Berdasarkan Tanggal</h3>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              Tanggal Akhir
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <button
            onClick={handleClearFilter}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-all"
          >
            Reset Filter
          </button>
        </div>
        <div className="mt-3 text-sm text-gray-600">
          Menampilkan <span className="font-bold">{filteredExpenses.length}</span> dari {expenses.length} pengeluaran
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-slate-50">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Deskripsi
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Jumlah
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Pembayaran
                </th>
                {/* <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Aksi
                </th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentExpenses.map((expense) => (
                <tr
                  key={expense.id}
                  className="hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    #{expense.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {expense.description || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {expense.expense_date
                      ? new Date(expense.expense_date).toLocaleDateString(
                          "id-ID"
                        )
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                    Rp {Number(expense.amount).toLocaleString("id-ID")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">
                    {expense.payment_method}
                  </td>
                  
                </tr>
              ))}
            </tbody>
          </table>

          {currentExpenses.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Tidak ada data pengeluaran
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
            <div className="text-sm text-gray-600">
              Halaman {currentPage} dari {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 rounded-lg text-sm font-medium transition-all disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
                Sebelumnya
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 rounded-lg text-sm font-medium transition-all disabled:cursor-not-allowed"
              >
                Selanjutnya
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL FORM */}
      {showModal && (
        <Modal
          title={editingId ? "Edit Pengeluaran" : "Tambah Pengeluaran Baru"}
          onClose={handleCloseModal}
        >
          <div className="space-y-4">
            {/* Tanggal */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tanggal Pengeluaran
              </label>
              <input
                type="date"
                value={formData.expense_date}
                onChange={(e) =>
                  setFormData({ ...formData, expense_date: e.target.value })
                }
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Kategori *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                required
              >
                <option value="">Pilih kategori...</option>
                <option value="ONGKIR">Ongkir</option>
                <option value="LISTRIK">Listrik</option>
                <option value="INTERNET">Internet</option>
                <option value="SEWA">Sewa Tempat</option>
                <option value="GAJI">Gaji Karyawan</option>
                <option value="OPERASIONAL">Operasional</option>
                <option value="MARKETING">Marketing</option>
                <option value="MAINTENANCE">Perawatan</option>
                <option value="LAINNYA">Lainnya</option>
              </select>
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Deskripsi
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Contoh: Bayar listrik bulan Januari"
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Jumlah */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Jumlah *
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amount: Number(e.target.value),
                  })
                }
                placeholder="0"
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                required
                min="1"
              />
            </div>

            {/* Metode Pembayaran */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Metode Pembayaran
              </label>
              <select
                value={formData.payment_method}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    payment_method: e.target.value,
                    source_account_id:
                      e.target.value === "CREDIT"
                        ? ""
                        : formData.source_account_id,
                  })
                }
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option value="CASH">Cash</option>
                <option value="TRANSFER">Transfer</option>
                <option value="CREDIT">Kredit</option>
              </select>
            </div>

            {/* Sumber Rekening */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sumber Rekening
                {formData.payment_method !== "CREDIT" && (
                  <span className="text-red-500"> *</span>
                )}
              </label>
              <select
                value={formData.source_account_id || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    source_account_id: e.target.value || "",
                  })
                }
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                disabled={formData.payment_method === "CREDIT"}
              >
                <option value="">Pilih rekening...</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} {acc.number ? `(${acc.number})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Catatan */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Catatan
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows="3"
                placeholder="Catatan tambahan..."
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-3 rounded-xl font-semibold transition-all shadow-lg"
              >
                {editingId ? "Update" : "Simpan"}
              </button>
              <button
                onClick={handleCloseModal}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-semibold transition-all"
              >
                Batal
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};



// Recipes Component – sesuai backend /recipes + build dari BOM
const Recipes = ({ token }) => {
  const [products, setProducts] = useState([]);
  const [recipes, setRecipes] = useState([]);       // list ProductRecipe
  const [selectedProductId, setSelectedProductId] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal tambah komponen
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    component_product_id: '',
    qty_per_unit: 1,
  });

  // Modal build dari recipe (restock BOM)
  const [buildModalOpen, setBuildModalOpen] = useState(false);
  const [buildQty, setBuildQty] = useState(1);
  const [buildLoading, setBuildLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products for recipes:', error);
    }
  };

  const fetchRecipes = async (productId) => {
    if (!productId) {
      setRecipes([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/recipes/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      // backend: response_model=list[schemas.RecipeComponentOut] → harusnya array
      if (Array.isArray(data)) {
        setRecipes(data);
      } else {
        setRecipes([]);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProductId(productId);
    setFormData((prev) => ({
      ...prev,
      product_id: productId ? Number(productId) : '',
    }));
    fetchRecipes(productId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        product_id: Number(selectedProductId),
        component_product_id: Number(formData.component_product_id),
        qty_per_unit: Number(formData.qty_per_unit),
      };

      const res = await fetch(`${API_BASE}/recipes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({
          product_id: selectedProductId ? Number(selectedProductId) : '',
          component_product_id: '',
          qty_per_unit: 1,
        });
        fetchRecipes(selectedProductId);
      } else {
        const err = await res.json();
        alert('Error: ' + (err.detail || 'Gagal menambah recipe'));
      }
    } catch (error) {
      console.error('Error creating recipe:', error);
      alert('Error creating recipe');
    }
  };

  // ===== Build dari Recipe (restock BOM) =====
  const handleBuild = async (e) => {
    e.preventDefault();
    if (!selectedProductId) {
      alert('Pilih produk INTERNAL dulu.');
      return;
    }
    if (!buildQty || Number(buildQty) <= 0) {
      alert('Qty harus lebih dari 0');
      return;
    }

    try {
      setBuildLoading(true);
      const res = await fetch(`${API_BASE}/recipes/build`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: Number(selectedProductId),
          qty_to_build: Number(buildQty),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert('Gagal build: ' + (err.detail || res.statusText));
        return;
      }

      const data = await res.json();
      console.log('Build result:', data);

      alert(
        `Berhasil build ${data.qty_built} ${data.product_name}\n` +
        `Stok: ${data.stock_before} → ${data.stock_after}`
      );

      setBuildModalOpen(false);
      setBuildQty(1);

      // opsional: refresh products / recipes supaya stok di UI update
      fetchProducts();
      fetchRecipes(selectedProductId);
    } catch (error) {
      console.error('Error build:', error);
      alert('Error saat build product');
    } finally {
      setBuildLoading(false);
    }
  };

  const internalProducts = products.filter((p) => p.product_type === 'INTERNAL');
  const componentProducts = products.filter((p) => p.product_type === 'RAW'); // sesuai rules di backend

  const findProductById = (id) => products.find((p) => p.id === id);
  const selectedProduct =
    selectedProductId ? findProductById(Number(selectedProductId)) : null;

  // ====== HPP / COST CALC ======
  const computeComponentCost = (rc) => {
    const comp = findProductById(rc.component_product_id);
    if (!comp) return 0;
    const qty = Number(rc.qty_per_unit || 0);
    const baseCost = Number(comp.base_cost || 0);
    return qty * baseCost;
  };

  const totalHppPerUnit =
    Array.isArray(recipes) && recipes.length > 0
      ? recipes.reduce((sum, rc) => sum + computeComponentCost(rc), 0)
      : 0;

  const formatCurrency = (value) =>
    `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Recipes / Bill of Materials</h2>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* Tombol Build dari Recipe */}
          <button
            type="button"
            onClick={() => setBuildModalOpen(true)}
            disabled={!selectedProductId}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TrendingUp size={18} />
            <span className="font-medium">
              Build dari Recipe
              {selectedProduct && ` (${selectedProduct.name})`}
            </span>
          </button>

          {/* Tombol tambah komponen */}
          <button
            onClick={() => setShowModal(true)}
            disabled={!selectedProductId}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={20} />
            <span className="font-medium">
              Tambah Komponen
              {selectedProductId ? ` (Product #${selectedProductId})` : ''}
            </span>
          </button>
        </div>
      </div>

      {/* Pilih Product yang mau di-set resepnya */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Pilih Produk (INTERNAL)
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => handleSelectProduct(e.target.value)}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="">Pilih produk yang akan dibuat resepnya...</option>
              {internalProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
              <p className="text-xs font-semibold text-emerald-600 mb-1">
                Produk Terpilih
              </p>
              <p className="text-sm font-bold text-gray-800">
                {selectedProduct.name} ({selectedProduct.sku})
              </p>
              <p className="text-xs text-gray-600">
                Tipe: {selectedProduct.product_type} • Stok: {selectedProduct.stock_qty}{' '}
                {selectedProduct.unit}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tabel recipes + HPP */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Daftar Komponen Resep</h3>

          {/* Card HPP per 1 unit produk INTERNAL */}
          {selectedProduct && (
            <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-4">
              <div>
                <p className="text-xs font-semibold text-emerald-700 uppercase">
                  HPP PER 1 UNIT
                </p>
                <p className="text-xs text-gray-600">
                  {selectedProduct.name} ({selectedProduct.sku})
                </p>
              </div>
              <p className="text-xl font-bold text-emerald-700">
                {formatCurrency(totalHppPerUnit)}
              </p>
            </div>
          )}
        </div>

        {!selectedProductId ? (
          <div className="text-center py-8 text-gray-500">
            Pilih produk terlebih dahulu untuk melihat / mengatur resep.
          </div>
        ) : loading ? (
          <div className="text-center py-8 text-gray-500">Memuat data resep...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-slate-50">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Komponen
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Qty per Unit
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Harga Modal (per unit)
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Biaya Komponen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Array.isArray(recipes) && recipes.length > 0 ? (
                  recipes.map((rc) => {
                    const comp = findProductById(rc.component_product_id);
                    const componentCost = computeComponentCost(rc);

                    return (
                      <tr
                        key={rc.id}
                        className="hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all"
                      >
                        {/* Komponen (RAW) */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {comp?.name || `Component #${rc.component_product_id}`}
                        </td>

                        {/* SKU */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {comp?.sku || '-'}
                        </td>

                        {/* Qty per Unit (Decimal) */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                          {Number(rc.qty_per_unit)}
                        </td>

                        {/* Harga Modal per unit RAW */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatCurrency(comp?.base_cost || 0)}
                        </td>

                        {/* Biaya Komponen = qty_per_unit * base_cost */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                          {formatCurrency(componentCost)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-6 text-center text-sm text-gray-500"
                    >
                      Belum ada komponen untuk produk ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal tambah component */}
      {showModal && (
        <Modal
          title="Tambah Komponen Resep"
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {!selectedProductId && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800 mb-2">
                Pilih dulu produk INTERNAL yang mau dibuat resepnya.
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Produk (INTERNAL)
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => handleSelectProduct(e.target.value)}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                required
              >
                <option value="">Pilih produk...</option>
                {internalProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Komponen (RAW)
              </label>
              <select
                value={formData.component_product_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    component_product_id: e.target.value,
                  })
                }
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                required
              >
                <option value="">Pilih produk bahan baku...</option>
                {componentProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Qty per Unit
              </label>
              <input
                type="number"
                min="0.0001"
                step="0.0001"
                value={formData.qty_per_unit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    qty_per_unit: e.target.value,
                  })
                }
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={!selectedProductId}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 rounded-xl font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Simpan Komponen
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-semibold transition-all"
              >
                Batal
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Build dari Recipe */}
      {buildModalOpen && (
        <Modal
          title="Build Stok dari Recipe"
          onClose={() => setBuildModalOpen(false)}
        >
          <form onSubmit={handleBuild} className="space-y-4">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800">
              {selectedProduct ? (
                <>
                  <p className="font-semibold">
                    Produk: {selectedProduct.name} ({selectedProduct.sku})
                  </p>
                  <p className="text-xs">
                    Stok saat ini: {selectedProduct.stock_qty} {selectedProduct.unit}
                  </p>
                </>
              ) : (
                <p>Pilih produk INTERNAL terlebih dahulu.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Qty yang akan diproduksi
              </label>
              <input
                type="number"
                min="1"
                value={buildQty}
                onChange={(e) => setBuildQty(e.target.value)}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={buildLoading || !selectedProductId}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-xl font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {buildLoading ? 'Memproses...' : 'Proses Build'}
              </button>
              <button
                type="button"
                onClick={() => setBuildModalOpen(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-semibold transition-all"
              >
                Batal
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};



// Suppliers Component (master supplier)
const Suppliers = ({ token }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    supplier_type: '',
  });

  useEffect(() => {
    fetchSuppliers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await fetch(`${API_BASE}/suppliers/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSuppliers(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/suppliers/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        fetchSuppliers();
        setFormData({
          name: '',
          contact_person: '',
          phone: '',
          email: '',
          address: '',
          supplier_type: '',
        });
      }
    } catch (error) {
      alert('Error creating supplier');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Suppliers</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          <span className="font-medium">Tambah Supplier</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-slate-50">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Telepon
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Alamat
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Tipe
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {suppliers.map((supplier) => (
                <tr
                  key={supplier.id}
                  className="hover:bg-gradient-to-r hover:from-sky-50 hover:to-indigo-50 transition-all"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {supplier.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {supplier.phone || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {supplier.address || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700">
                      {supplier.supplier_type || 'SUPPLIER'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        supplier.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {supplier.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title="Tambah Supplier Baru" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nama *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                PIC / Contact Person
              </label>
              <input
                type="text"
                value={formData.contact_person}
                onChange={(e) =>
                  setFormData({ ...formData, contact_person: e.target.value })
                }
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Telepon</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tipe Supplier</label>
              <input
                type="text"
                value={formData.supplier_type}
                onChange={(e) =>
                  setFormData({ ...formData, supplier_type: e.target.value })
                }
                placeholder="Contoh: Bahan baku, packaging"
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Alamat</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows="3"
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white py-3 rounded-xl font-semibold transition-all shadow-lg"
              >
                Simpan
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-semibold transition-all"
              >
                Batal
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

// Reports Component
const Reports = ({ token }) => {
  const [reportData, setReportData] = useState(null);
  const [channelData, setChannelData] = useState([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchChannelReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/reports/range?start_date=${startDate}&end_date=${endDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setReportData(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error fetching report');
    } finally {
      setLoading(false);
    }
  };

  const fetchChannelReport = async () => {
    try {
      const res = await fetch(`${API_BASE}/reports/customers-by-channel`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setChannelData(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Export summary ke CSV (bisa dibuka di Excel)
  const handleDownloadCsv = () => {
    if (!reportData || !reportData.summary) return;

    const rows = [
      ['Metric', 'Value'],
      ['Total Sales', reportData.summary.total_sales],
      ['Total Purchase', reportData.summary.total_purchase],
      ['Total Expense', reportData.summary.total_expense],
      ['Net Income', reportData.summary.net_income],
      ['Start Date', startDate],
      ['End Date', endDate],
    ];

    const csvContent = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `report_${startDate}_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Laporan Keuangan</h2>

      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tanggal Akhir
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={fetchReports}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Generate Laporan'}
            </button>

            {reportData && (
              <button
                type="button"
                onClick={handleDownloadCsv}
                className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl transition-all shadow-md font-semibold flex items-center justify-center gap-2"
              >
                <Download size={18} />
                <span>Download CSV (Excel)</span>
              </button>
            )}
          </div>
        </div>

        {reportData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-600">Total Penjualan</p>
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-md">
                  <TrendingUp className="text-white" size={20} />
                </div>
              </div>
              <p className="text-3xl font-bold text-green-600">
                Rp {reportData.summary.total_sales.toLocaleString('id-ID')}
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border-2 border-red-200 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-600">Total Pembelian</p>
                <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center shadow-md">
                  <DollarSign className="text-white" size={20} />
                </div>
              </div>
              <p className="text-3xl font-bold text-red-600">
                Rp {reportData.summary.total_purchase.toLocaleString('id-ID')}
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border-2 border-yellow-200 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-600">Total Pengeluaran</p>
                <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center shadow-md">
                  <TrendingDown className="text-white" size={20} />
                </div>
              </div>
              <p className="text-3xl font-bold text-yellow-600">
                Rp {reportData.summary.total_expense.toLocaleString('id-ID')}
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200 shadow-md sm:col-span-2 lg:col-span-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-600">Laba Bersih</p>
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
                    reportData.summary.net_income >= 0 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                >
                  <CreditCard className="text-white" size={20} />
                </div>
              </div>
              <p
                className={`text-4xl font-bold ${
                  reportData.summary.net_income >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                Rp {reportData.summary.net_income.toLocaleString('id-ID')}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Periode: {new Date(startDate).toLocaleDateString('id-ID')} -{' '}
                {new Date(endDate).toLocaleDateString('id-ID')}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Customer Berdasarkan Channel</h3>
        {channelData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={channelData}
                dataKey="total_customers"
                nameKey="source_channel"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.source_channel}: ${entry.total_customers}`}
              >
                {channelData.map((entry, index) => (
                  <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Belum ada data customer</p>
          </div>
        )}
      </div>
    </div>
  );
};


// Backup & Restore Component
const BackupRestore = ({ token }) => {
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [restoreFile, setRestoreFile] = useState(null);
  const [restoreMessage, setRestoreMessage] = useState(null);

  const headers = { Authorization: `Bearer ${token}` };

  const safeFetchJson = async (url) => {
    try {
      const res = await fetch(url, { headers });
      if (!res.ok) {
        console.error('Failed to fetch', url, 'status:', res.status);
        return null;
      }
      return await res.json();
    } catch (err) {
      console.error('Error fetching', url, err);
      return null;
    }
  };

  const handleDownloadBackup = async () => {
    setBackupLoading(true);
    setRestoreMessage(null);

    try {
      // Ambil master & transaksi dasar
      const [products, customers, suppliers, sales, purchases, expenses] =
        await Promise.all([
          safeFetchJson(`${API_BASE}/products/`),
          safeFetchJson(`${API_BASE}/customers/`),
          safeFetchJson(`${API_BASE}/suppliers/`),
          safeFetchJson(`${API_BASE}/sales/`),
          safeFetchJson(`${API_BASE}/purchases/`),
          safeFetchJson(`${API_BASE}/expenses/`),
        ]);

      // recipes per product_id
      const recipesByProduct = {};
      if (Array.isArray(products)) {
        await Promise.all(
          products.map(async (p) => {
            const r = await safeFetchJson(`${API_BASE}/recipes/${p.id}`);
            if (Array.isArray(r) && r.length > 0) {
              recipesByProduct[p.id] = r;
            }
          })
        );
      }

      const backupPayload = {
        meta: {
          generated_at: new Date().toISOString(),
          app: 'Inventory System',
          version: '1.0',
        },
        products: Array.isArray(products) ? products : [],
        customers: Array.isArray(customers) ? customers : [],
        suppliers: Array.isArray(suppliers) ? suppliers : [],
        sales: Array.isArray(sales) ? sales : [],
        purchases: Array.isArray(purchases) ? purchases : [],
        expenses: Array.isArray(expenses) ? expenses : [],
        recipes: recipesByProduct,
      };

      const blob = new Blob([JSON.stringify(backupPayload, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');

      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `inventory_backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setRestoreMessage({
        type: 'success',
        text: 'Backup berhasil dibuat dan diunduh.',
      });
    } catch (error) {
      console.error('Error during backup:', error);
      setRestoreMessage({
        type: 'error',
        text: 'Gagal membuat backup. Cek console untuk detail.',
      });
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!restoreFile) {
      setRestoreMessage({
        type: 'error',
        text: 'Silakan pilih file backup (.json) terlebih dahulu.',
      });
      return;
    }

    setRestoreLoading(true);
    setRestoreMessage(null);

    try {
      const text = await restoreFile.text();
      const jsonData = JSON.parse(text);

      // Kirim ke backend untuk diproses
      const res = await fetch(`${API_BASE}/admin/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jsonData),
      });

      if (!res.ok) {
        let errText = 'Restore gagal.';
        try {
          const errJson = await res.json();
          errText = errJson.detail || errText;
        } catch (_) {
          // ignore
        }
        throw new Error(errText);
      }

      setRestoreMessage({
        type: 'success',
        text: 'Restore berhasil diproses oleh server.',
      });
    } catch (error) {
      console.error('Error during restore:', error);
      setRestoreMessage({
        type: 'error',
        text: error.message || 'Terjadi kesalahan saat restore.',
      });
    } finally {
      setRestoreLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Backup & Restore Data</h2>

      {/* Info / alert */}
      {restoreMessage && (
        <div
          className={`p-4 rounded-2xl border text-sm ${
            restoreMessage.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {restoreMessage.text}
        </div>
      )}

      {/* Backup Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-900 flex items-center justify-center shadow-md">
            <Download className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Backup Data</h3>
            <p className="text-sm text-gray-600">
              Backup akan berisi master & transaksi (products, customers, suppliers, sales, purchases, expenses, recipes).
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadBackup}
          disabled={backupLoading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black text-white rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {backupLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Menghasilkan backup...</span>
            </>
          ) : (
            <>
              <Download size={18} />
              <span>Download Backup (.json)</span>
            </>
          )}
        </button>
      </div>

      {/* Restore Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-md">
            <UploadCloud className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Restore Data</h3>
            <p className="text-sm text-gray-600">
              Restore akan mengirim file backup ke server. Proses penimpaan / merge data diatur di backend
              (<code className="bg-gray-100 px-1 rounded text-xs">POST /admin/restore</code>).
            </p>
          </div>
        </div>

        <div className="p-4 mb-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-800">
          <p className="font-semibold mb-1">⚠️ Peringatan</p>
          <p>
            Pastikan Anda mengerti konsekuensi restore. Sebaiknya lakukan di environment staging / dev terlebih dulu.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <input
            type="file"
            accept="application/json"
            onChange={(e) => {
              setRestoreFile(e.target.files?.[0] || null);
              setRestoreMessage(null);
            }}
            className="flex-1 text-sm text-gray-700 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />

          <button
            onClick={handleRestore}
            disabled={restoreLoading || !restoreFile}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {restoreLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Memproses restore...</span>
              </>
            ) : (
              <>
                <UploadCloud size={18} />
                <span>Upload & Restore</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};


// Reusable Components
const StatCard = ({ title, value, icon: Icon, gradient, trend }) => {
  const isPositive = trend && trend.startsWith('+');

  return (
    <div className="p-4 bg-white rounded-xl shadow-md flex items-center justify-between">
      <div>
        <h3 className="text-sm text-gray-500">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{value}</p>

        {trend && (
          <span
            className={`text-sm font-semibold ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend}
          </span>
        )}
      </div>

      <div className={`p-3 rounded-xl bg-gradient-to-r ${gradient} text-white`}>
        <Icon size={28} />
      </div>
    </div>
  );
};
const Modal = ({ title, children, onClose, size = 'medium' }) => (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
    <div
      className={`bg-white rounded-3xl shadow-2xl ${
        size === 'large' ? 'max-w-4xl w-full' : 'max-w-md w-full'
      } max-h-[90vh] overflow-y-auto`}
    >
      <div className="sticky top-0 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-xl transition-all"
        >
          <X size={24} />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);


// Cash Ledger
const PAGE_SIZE = 15;

const CashLedger = ({ token }) => {
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // filter tanggal
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // pagination
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [sRes, pRes, eRes] = await Promise.all([
          fetch(`${API_BASE}/sales/`, { headers }),
          fetch(`${API_BASE}/purchases/`, { headers }),
          fetch(`${API_BASE}/expenses/`, { headers }),
        ]);
        const s = await sRes.json();
        const p = await pRes.json();
        const e = await eRes.json();

        setSales(Array.isArray(s) ? s : []);
        setPurchases(Array.isArray(p) ? p : []);
        setExpenses(Array.isArray(e) ? e : []);
      } catch (err) {
        console.error('Error fetching ledger data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [token]);

  // helper: pilih tanggal yang dipakai untuk ledger (prioritas created_at)
  const getEntryDate = (obj, primaryField, fallbackField) => {
    return obj[primaryField] || obj[fallbackField] || null;
  };

  // gabungkan jadi ledger
  const ledgerEntries = useMemo(() => {
  const entries = [];

  // Sales → cash IN
  sales.forEach((s) => {
    if (!s.payment_method) return;
    if (!['CASH', 'TRANSFER'].includes(s.payment_method)) return;
    // kalau mau hanya PAID:
    // if (s.status !== 'PAID') return;

    entries.push({
      type: 'SALE',
      date: getEntryDate(s, 'entry_date', 'order_date'),
      label: `Penjualan #${s.id} - ${s.customer_name || ''}`.trim(),
      in: Number(s.total_amount || 0),
      out: 0,
      payment_method: s.payment_method,
      // ⬇️ INI PENTING: ambil dari response baru
      account_id: s.source_account_id,
      account_name: s.source_account?.name || null,
    });
  });

    // Purchases → cash OUT
  purchases.forEach((p) => {
    if (!p.payment_method) return;
    if (!['CASH', 'TRANSFER'].includes(p.payment_method)) return;

    entries.push({
      type: 'PURCHASE',
      date: getEntryDate(p, 'entry_date', 'purchase_date'),
      label: `Pembelian #${p.id} - ${p.supplier_name || ''}`.trim(),
      in: 0,
      out: Number(p.total_amount || 0),
      payment_method: p.payment_method,
      account_id: p.source_account_id,
      account_name: p.source_account?.name || null,
    });
  });

    // Expenses → cash OUT
    expenses.forEach((ex) => {
    if (!ex.payment_method) return;
    if (!['CASH', 'TRANSFER'].includes(ex.payment_method)) return;

    entries.push({
      type: 'EXPENSE',
      date: getEntryDate(ex, 'expense_date', 'expense_date'),
      label: `Pengeluaran #${ex.id} - ${ex.category || ''}`.trim(),
      in: 0,
      out: Number(ex.amount || 0),
      payment_method: ex.payment_method,
      account_id: ex.source_account_id,
      account_name: ex.source_account?.name || null,
    });
  });

    // sort by date ASC
     entries.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));

  let balance = 0;
  return entries.map((e, idx) => {
    balance += e.in - e.out;
    return { ...e, balance, id: idx + 1 };
  });
}, [sales, purchases, expenses]);

  // filter tanggal (berlaku ke summary, tabel, dan CSV)
  const filteredEntries = useMemo(() => {
    if (!startDate && !endDate) return ledgerEntries;

    return ledgerEntries.filter((e) => {
      if (!e.date) return false;
      const d = new Date(e.date);

      if (startDate) {
        const s = new Date(startDate);
        if (d < s) return false;
      }
      if (endDate) {
        const eEnd = new Date(endDate);
        eEnd.setHours(23, 59, 59, 999);
        if (d > eEnd) return false;
      }
      return true;
    });
  }, [ledgerEntries, startDate, endDate]);

  // reset page ke 1 kalau filter berubah
  useEffect(() => {
    setPage(1);
  }, [startDate, endDate]);

  // summary pakai filteredEntries
  const totalIn = filteredEntries.reduce((s, e) => s + e.in, 0);
  const totalOut = filteredEntries.reduce((s, e) => s + e.out, 0);
  const finalBalance = totalIn - totalOut;

  // pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredEntries.length / PAGE_SIZE)
  );
  const pageEntries = useMemo(() => {
    const startIdx = (page - 1) * PAGE_SIZE;
    return filteredEntries.slice(startIdx, startIdx + PAGE_SIZE);
  }, [filteredEntries, page]);

  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () =>
    setPage((p) => Math.min(totalPages, p + 1));

  // export CSV (pakai filteredEntries, bukan cuma page ini)
  const handleExportCsv = () => {
    if (filteredEntries.length === 0) {
      alert('Tidak ada data untuk di-export.');
      return;
    }

    const headers = [
      'Tanggal',
      'Jenis',
      'Deskripsi',
      'Metode',
      'Akun',
      'Cash In',
      'Cash Out',
      'Saldo',
    ];

    const rows = filteredEntries.map((row) => {
      const dateStr = row.date
        ? new Date(row.date).toLocaleString('id-ID')
        : '';
      const safeLabel = (row.label || '').replace(/"/g, '""');
      const safeMethod = (row.payment_method || '').replace(/"/g, '""');
      const safeAccount = (row.account_name || '').replace(/"/g, '""');

      return [
        `"${dateStr}"`,
        `"${row.type}"`,
        `"${safeLabel}"`,
        `"${safeMethod}"`,
        `"${safeAccount}"`,
        row.in,
        row.out,
        row.balance,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `cash_ledger_${startDate || 'all'}_${endDate || 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">
            Menghitung cash ledger...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + filter + export */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Cash Ledger</h2>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Calendar size={16} className="text-gray-500" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2 py-1.5 rounded-lg border border-gray-200 text-sm"
              />
            </div>
            <span className="text-xs text-gray-500">s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2 py-1.5 rounded-lg border border-gray-200 text-sm"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setStartDate('');
              setEndDate('');
            }}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200"
          >
            <RefreshCcw size={14} />
            Reset
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 shadow-sm">
          <p className="text-xs font-semibold text-green-700 mb-1">
            Total Cash In
          </p>
          <p className="text-2xl font-bold text-green-700">
            Rp {totalIn.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 shadow-sm">
          <p className="text-xs font-semibold text-red-700 mb-1">
            Total Cash Out
          </p>
          <p className="text-2xl font-bold text-red-700">
            Rp {totalOut.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-gray-100 border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-700 mb-1">
            Saldo Akhir
          </p>
          <p
            className={`text-2xl font-bold ${
              finalBalance >= 0 ? 'text-emerald-700' : 'text-red-700'
            }`}
          >
            Rp {finalBalance.toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      {/* Tabel Ledger + Pagination */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-slate-50">
                <th className="px-4 py-3 text-left font-bold text-gray-600 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-4 py-3 text-left font-bold text-gray-600 uppercase tracking-wider">
                  Jenis
                </th>
                <th className="px-4 py-3 text-left font-bold text-gray-600 uppercase tracking-wider">
                  Deskripsi
                </th>
                <th className="px-4 py-3 text-left font-bold text-gray-600 uppercase tracking-wider">
                  Metode
                </th>
                <th className="px-4 py-3 text-left font-bold text-gray-600 uppercase tracking-wider">
                  Akun
                </th>
                <th className="px-4 py-3 text-right font-bold text-gray-600 uppercase tracking-wider">
                  Cash In
                </th>
                <th className="px-4 py-3 text-right font-bold text-gray-600 uppercase tracking-wider">
                  Cash Out
                </th>
                <th className="px-4 py-3 text-right font-bold text-gray-600 uppercase tracking-wider">
                  Saldo
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageEntries.length > 0 ? (
                pageEntries.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50 transition-all"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                      {formatLedgerDate(row.date)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          row.type === 'SALE'
                            ? 'bg-green-100 text-green-700'
                            : row.type === 'PURCHASE'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {row.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {row.label}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                      {row.payment_method || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                      {row.account_name || '-'}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-700 font-semibold">
                      {row.in
                        ? `Rp ${row.in.toLocaleString('id-ID')}`
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-right text-red-700 font-semibold">
                      {row.out
                        ? `Rp ${row.out.toLocaleString('id-ID')}`
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">
                      Rp {row.balance.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    Belum ada transaksi cash terkait (sales/purchases/expenses)
                    untuk periode ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {filteredEntries.length > 0 && (
          <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
            <div>
              Menampilkan{' '}
              <span className="font-semibold">
                {filteredEntries.length === 0
                  ? 0
                  : (page - 1) * PAGE_SIZE + 1}
              </span>{' '}
              -{' '}
              <span className="font-semibold">
                {Math.min(page * PAGE_SIZE, filteredEntries.length)}
              </span>{' '}
              dari{' '}
              <span className="font-semibold">
                {filteredEntries.length}
              </span>{' '}
              transaksi
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={page === 1}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <span>
                Page{' '}
                <span className="font-semibold">{page}</span> /{' '}
                <span className="font-semibold">{totalPages}</span>
              </span>
              <button
                type="button"
                onClick={handleNextPage}
                disabled={page === totalPages}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};



// Stock Movements Component
//const PAGE_SIZE = 25;

const StockMovements = ({ token }) => {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [loading, setLoading] = useState(true);

  // filter tanggal (YYYY-MM-DD)
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // pagination
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchProducts();
    fetchMovements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('limit', '100');
      if (selectedProduct) {
        params.append('product_id', selectedProduct);
      }

      const res = await fetch(
        `${API_BASE}/stock-movements/?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        console.error('Failed to fetch stock movements', res.status);
        setMovements([]);
        return;
      }

      const data = await res.json();
      console.log('RAW stock movements response:', data);

      const items = Array.isArray(data)
        ? data
        : Array.isArray(data.results)
        ? data.results
        : Array.isArray(data.items)
        ? data.items
        : Array.isArray(data.data)
        ? data.data
        : [];

      setMovements(items);
    } catch (error) {
      console.error('Error fetching stock movements:', error);
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  // kalau filter (tanggal/produk) berubah → balik ke page 1
  useEffect(() => {
    setPage(1);
  }, [startDate, endDate, selectedProduct]);

  // helper format tanggal: hanya DD/MM/YYYY
  const formatDate = (value) => {
    if (!value) return '-';
    try {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return value;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return value;
    }
  };

  // filter + sort DESC by movement_date
  const filteredAndSorted = useMemo(() => {
    let rows = [...movements];

    rows = rows.filter((mv) => {
      if (!mv.movement_date) return false;
      const d = new Date(mv.movement_date);

      if (startDate) {
        const s = new Date(startDate);
        if (d < s) return false;
      }
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        if (d > e) return false;
      }
      return true;
    });

    rows.sort(
      (a, b) =>
        new Date(b.movement_date || 0) - new Date(a.movement_date || 0)
    );

    return rows;
  }, [movements, startDate, endDate]);

  // pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSorted.length / PAGE_SIZE)
  );
  const pageData = useMemo(() => {
    const startIdx = (page - 1) * PAGE_SIZE;
    return filteredAndSorted.slice(startIdx, startIdx + PAGE_SIZE);
  }, [filteredAndSorted, page]);

  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () =>
    setPage((p) => Math.min(totalPages, p + 1));

  // Export CSV pakai data yang sudah difilter+sort (bukan cuma current page)
  const handleExportCsv = () => {
    if (filteredAndSorted.length === 0) {
      alert('Tidak ada data pergerakan stok untuk di-export.');
      return;
    }

    const headers = [
      'Tanggal',
      'Produk',
      'Tipe',
      'Ref',
      'Qty',
      'Before',
      'After',
      'Notes',
    ];

    const rows = filteredAndSorted.map((mv) => {
      const productName =
        mv.product_name || (mv.product && mv.product.name) || '';
      const ref = `${mv.ref_type || ''}${
        mv.ref_id ? ` #${mv.ref_id}` : ''
      }`.trim();
      const notes = mv.notes || '';

      const safeProduct = productName.replace(/"/g, '""');
      const safeRef = ref.replace(/"/g, '""');
      const safeNotes = notes.replace(/"/g, '""');

      return [
        `"${formatDate(mv.movement_date)}"`,
        `"${safeProduct}"`,
        `"${mv.type || ''}"`,
        `"${safeRef}"`,
        mv.qty_change ?? 0,
        mv.stock_before ?? '',
        mv.stock_after ?? '',
        `"${safeNotes}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `stock_movements_${startDate || 'all'}_${
      endDate || 'all'
    }.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Stock Movements</h2>
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {/* Filter produk */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Filter Produk
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="">Semua Produk</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>

          {/* Filter tanggal dari */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mulai Tanggal
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
            />
          </div>

          {/* Filter tanggal sampai */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              s/d Tanggal
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={fetchMovements}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl font-semibold shadow-md transition-all"
          >
            Terapkan Filter & Refresh
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedProduct('');
              setStartDate('');
              setEndDate('');
            }}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-all"
          >
            Reset Filter
          </button>
        </div>
      </div>

      {/* Tabel Stock Movements */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4 gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-800">
              Riwayat Pergerakan Stok
            </h3>
            {loading && (
              <span className="text-xs font-medium text-gray-500">
                Memuat...
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-slate-50">
                <th className="px-4 py-3 text-left font-bold text-gray-600 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-4 py-3 text-left font-bold text-gray-600 uppercase tracking-wider">
                  Produk
                </th>
                <th className="px-4 py-3 text-left font-bold text-gray-600 uppercase tracking-wider">
                  Tipe
                </th>
                <th className="px-4 py-3 text-left font-bold text-gray-600 uppercase tracking-wider">
                  Ref
                </th>
                <th className="px-4 py-3 text-right font-bold text-gray-600 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-4 py-3 text-right font-bold text-gray-600 uppercase tracking-wider">
                  Before
                </th>
                <th className="px-4 py-3 text-right font-bold text-gray-600 uppercase tracking-wider">
                  After
                </th>
                <th className="px-4 py-3 text-left font-bold text-gray-600 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!loading && pageData.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    Belum ada data pergerakan stok untuk filter ini.
                  </td>
                </tr>
              )}

              {pageData.map((mv) => {
                const productName =
                  mv.product_name || (mv.product && mv.product.name) || '';

                return (
                  <tr
                    key={mv.id}
                    className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 transition-all"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                      {formatDate(mv.movement_date)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-800 font-medium">
                      {productName
                        ? `${productName} (ID: ${mv.product_id})`
                        : `ID: ${mv.product_id}`}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          mv.type === 'IN'
                            ? 'bg-green-100 text-green-700'
                            : mv.type === 'OUT'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {mv.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                      {mv.ref_type || '-'} {mv.ref_id ? `#${mv.ref_id}` : ''}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-800 font-semibold">
                      {Number(mv.qty_change || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {mv.stock_before !== null &&
                      mv.stock_before !== undefined
                        ? Number(mv.stock_before).toLocaleString('id-ID')
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900 font-semibold">
                      {mv.stock_after !== null &&
                      mv.stock_after !== undefined
                        ? Number(mv.stock_after).toLocaleString('id-ID')
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {mv.notes || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {filteredAndSorted.length > 0 && (
          <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
            <div>
              Menampilkan{' '}
              <span className="font-semibold">
                {(page - 1) * PAGE_SIZE + 1}
              </span>{' '}
              -{' '}
              <span className="font-semibold">
                {Math.min(page * PAGE_SIZE, filteredAndSorted.length)}
              </span>{' '}
              dari{' '}
              <span className="font-semibold">
                {filteredAndSorted.length}
              </span>{' '}
              pergerakan stok
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={page === 1}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 disabled:opacity-40"
              >
                ‹
              </button>
              <span>
                Page{' '}
                <span className="font-semibold">{page}</span> /{' '}
                <span className="font-semibold">{totalPages}</span>
              </span>
              <button
                type="button"
                onClick={handleNextPage}
                disabled={page === totalPages}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 disabled:opacity-40"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


// Accounts

const AccountsView = ({ token }) => {
  const [accounts, setAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    number: "",
    current_balance: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await fetch(`${API_BASE}/accounts/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching accounts:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/accounts/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({
          name: "",
          type: "",
          number: "",
          current_balance: 0,
          is_active: true,
        });
        fetchAccounts();
      } else {
        const err = await res.json().catch(() => ({}));
        alert("Error: " + (err.detail || "Gagal membuat account"));
      }
    } catch (err) {
      console.error("Error creating account:", err);
      alert("Error creating account");
    }
  };

  const formatDateTime = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleString('id-ID', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Accounts / Rekening</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          <span className="font-medium">Tambah Account</span>
        </button>
      </div>

      {/* Tabel Accounts */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-slate-50">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Nama Rekening
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Tipe
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Nomor
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Saldo Saat Ini
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Update Terakhir
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {accounts.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-6 text-center text-gray-500 text-sm"
                  >
                    Belum ada rekening. Tambahkan terlebih dahulu.
                  </td>
                </tr>
              ) : (
                accounts.map((acc) => (
                  <tr
                    key={acc.id}
                    className="hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all"
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                      {acc.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {acc.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {acc.number || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-gray-900">
                      {formatCurrency(acc.current_balance || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          acc.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                        {acc.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600">
                      {formatDateTime(acc.updated_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal tambah account (kalau kamu pakai) */}
      {showModal && (
        <Modal
          title="Tambah Rekening"
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nama Rekening *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tipe
              </label>
              <input
                type="text"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                placeholder="Contoh: BANK, CASH, E-WALLET"
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nomor Rekening / No Akun
              </label>
              <input
                type="text"
                value={formData.number}
                onChange={(e) =>
                  setFormData({ ...formData, number: e.target.value })
                }
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Saldo Awal
              </label>
              <input
                type="number"
                value={formData.current_balance}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    current_balance: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all"
                min="0"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="is_active"
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="h-4 w-4 text-emerald-600 border-gray-300 rounded"
              />
              <label
                htmlFor="is_active"
                className="text-sm font-medium text-gray-700"
              >
                Aktif
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 rounded-xl font-semibold transition-all shadow-lg"
              >
                Simpan
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-semibold transition-all"
              >
                Batal
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default App;
