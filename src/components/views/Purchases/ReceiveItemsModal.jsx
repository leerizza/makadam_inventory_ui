import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../../utils/constants';
import { Calendar, Package, Truck } from 'lucide-react';
import formatCurrency from '../../../utils/helpers';
import Modal from '../../../common/Modal';

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

export default ReceiveItemsModal;