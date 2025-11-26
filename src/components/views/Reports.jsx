import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../utils/constants';
import { CHART_COLORS } from '../../utils/constants';
import {
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Download
} from 'lucide-react';



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

export default Reports;