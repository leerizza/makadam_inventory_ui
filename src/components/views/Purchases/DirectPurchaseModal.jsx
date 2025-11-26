import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../../utils/constants';
import { Plus, X, Package } from 'lucide-react';
import formatCurrency from '../../../utils/helpers';
import Modal from '../../../common/Modal'

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

export default DirectPurchaseModal;