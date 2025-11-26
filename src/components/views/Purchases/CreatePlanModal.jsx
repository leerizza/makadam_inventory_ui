import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../../utils/constants';
import { Plus, X, Package } from 'lucide-react';
import Modal from '../../../common/Modal'


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

export default CreatePlanModal;