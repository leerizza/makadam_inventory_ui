import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../utils/constants';
import { Plus, X } from 'lucide-react';
import Modal from '../../common/Modal'

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

export default Sales;