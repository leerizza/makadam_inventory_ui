import React, { useState, useEffect } from 'react';
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
import Modal from '../../common/Modal'


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



export default Expenses;