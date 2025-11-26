import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  DollarSign,
  BarChart2,
} from 'lucide-react';
import { API_BASE } from '../../utils/constants';
import StatCard from '../../common/StatCard';

const Dashboard = ({ token }) => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    totalSalesAmount: 0, // Rp
    totalOrders: 0,      // jumlah transaksi
  });

  const [totalCustomers, setTotalCustomers] = useState(0);

  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [topProducts, setTopProducts] = useState([]); // top 5 produk terlaris (by QTY)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // ambil cukup banyak sales supaya agregasi produk akurat
      const [productsRes, lowStockRes, salesRes, customersRes] = await Promise.all([
        fetch(`${API_BASE}/products/`, { headers }),
        fetch(`${API_BASE}/products/low-stock`, { headers }),
        fetch(`${API_BASE}/sales/?limit=200`, { headers }), // SESUAIKAN kalau backend beda
        fetch(`${API_BASE}/customers/`, { headers }),
      ]);

      const products = await productsRes.json();
      const lowStock = await lowStockRes.json();
      const sales = await salesRes.json();
      const customers = await customersRes.json();

      // ---- TOTAL PENJUALAN & JUMLAH ORDER ----
      const totalSalesAmount = Array.isArray(sales)
        ? sales.reduce(
            (sum, sale) => sum + Number(sale.total_amount || 0), // SESUAIKAN jika field beda
            0
          )
        : 0;

      const totalOrders = Array.isArray(sales) ? sales.length : 0;

      // ---- TOP PRODUK TERLARIS (BY QTY) ----
      const productMap = {}; // key: product_id / name

      if (Array.isArray(sales)) {
        sales.forEach((sale) => {
          if (!Array.isArray(sale.items)) return;

          sale.items.forEach((item) => {
            // SESUAIKAN nama field di sini
            const productId = item.product_id;
            const productName = item.product_name || item.name || `Produk #${productId}`;
            const qty = Number(item.quantity ?? item.qty ?? 0);
            const lineAmount = Number(
              item.line_total ??
                item.total ??
                qty * Number(item.unit_price ?? 0)
            );

            if (!productId && !productName) return;

            const key = productId || productName;

            if (!productMap[key]) {
              productMap[key] = {
                product_id: productId,
                product_name: productName,
                totalQty: 0,
                totalAmount: 0,
              };
            }

            productMap[key].totalQty += qty;
            productMap[key].totalAmount += lineAmount;
          });
        });
      }

      const topProductsLocal = Object.values(productMap)
        .filter((p) => p.totalQty > 0)
        .sort((a, b) => b.totalQty - a.totalQty)
        .slice(0, 5);

      // ---- PENJUALAN TERBARU ----
      const recentSalesLocal = Array.isArray(sales) ? sales.slice(0, 5) : [];

      // ---- SET STATE ----
      setStats({
        totalProducts: Array.isArray(products) ? products.length : 0,
        lowStockProducts: Array.isArray(lowStock) ? lowStock.length : 0,
        totalSalesAmount,
        totalOrders,
      });

      setTotalCustomers(Array.isArray(customers) ? customers.length : 0);

      setLowStockProducts(Array.isArray(lowStock) ? lowStock.slice(0, 5) : []);
      setRecentSales(recentSalesLocal);
      setTopProducts(topProductsLocal);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) =>
    `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ================== STAT CARDS ATAS ================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          gradient="from-sky-500 to-cyan-500"
          trend={`${stats.totalProducts} item`}
        />

        <StatCard
          title="Low Stock Alert"
          value={stats.lowStockProducts}
          icon={AlertTriangle}
          gradient="from-rose-500 to-red-500"
          trend={
            stats.lowStockProducts > 0
              ? 'Perlu restock'
              : 'Semua stok aman'
          }
        />

        <StatCard
          title="Total Sales (Rp)"
          value={formatCurrency(stats.totalSalesAmount)}
          icon={DollarSign}
          gradient="from-emerald-500 to-green-500"
          trend={`${stats.totalOrders} transaksi`}
        />

        <StatCard
          title="Total Customers"
          value={totalCustomers}
          icon={Users}
          gradient="from-violet-500 to-fuchsia-500"
          trend="Pelanggan aktif"
        />
      </div>

      {/* ================== GRID BAWAH ================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kiri: 2 kartu (top produk + recent sales) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top 5 Produk Terlaris */}
          <div className="bg-white rounded-3xl shadow-lg p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Top 5 Produk Terlaris
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Berdasarkan total quantity terjual
                </p>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-amber-500/90 flex items-center justify-center shadow-md">
                <BarChart2 className="text-white" size={20} />
              </div>
            </div>

            {topProducts.length === 0 ? (
              <p className="text-center text-slate-500 py-6">
                Belum ada data penjualan produk untuk ditampilkan.
              </p>
            ) : (
              <div className="space-y-2">
                {topProducts.map((p, idx) => (
                  <div
                    key={p.product_id || p.product_name || idx}
                    className="flex items-center justify-between px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-xs font-bold text-amber-600 border border-amber-200">
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">
                          {p.product_name}
                        </p>
                        {p.totalAmount > 0 && (
                          <p className="text-[11px] text-slate-500">
                            Total nilai: {formatCurrency(p.totalAmount)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-amber-700 font-bold text-sm">
                        {p.totalQty} pcs
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Penjualan Terbaru */}
          <div className="bg-white rounded-3xl shadow-lg p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Penjualan Terbaru
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Total customers: {totalCustomers} • Total transaksi:{' '}
                  {stats.totalOrders}
                </p>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-md">
                <ShoppingCart className="text-white" size={20} />
              </div>
            </div>

            {recentSales.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShoppingCart className="text-slate-400" size={32} />
                </div>
                <p className="text-slate-500 font-medium">Belum ada penjualan</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">
                        {sale.customer_name || 'Tanpa nama'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(sale.order_date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-600 font-semibold text-sm">
                        {formatCurrency(sale.total_amount)}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {sale.payment_method || 'Metode tidak diketahui'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Kanan: panel stok menipis */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-lg p-6 border border-slate-100 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Stok Menipis</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Produk yang berada di bawah minimum stock
                </p>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-rose-500 flex items-center justify-center shadow-md">
                <AlertTriangle className="text-white" size={20} />
              </div>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                  <Package className="text-emerald-600" size={32} />
                </div>
                <p className="text-slate-500 font-medium">
                  Semua produk stok aman
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between px-4 py-3 rounded-2xl bg-gradient-to-r from-rose-50 to-red-50 border border-rose-100 hover:shadow-md transition-all"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">
                        {product.name}
                      </p>
                      <p className="text-xs text-slate-500">{product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-rose-600 font-bold text-sm">
                        {product.stock_qty} {product.unit}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Min: {product.min_stock}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
