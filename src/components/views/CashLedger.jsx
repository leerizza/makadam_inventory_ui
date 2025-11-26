import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE } from '../../utils/constants';
import formatLedgerDate from '../../utils/helpers_date';
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

export default CashLedger;