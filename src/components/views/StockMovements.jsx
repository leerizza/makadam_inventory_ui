import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE } from '../../utils/constants';
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

const PAGE_SIZE = 15;

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

export default StockMovements;