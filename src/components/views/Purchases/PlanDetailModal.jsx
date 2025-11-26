import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../../utils/constants';
import { Calendar, Package, Truck } from 'lucide-react';
import Modal from '../../../common/Modal'


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

export default PlanDetailModal;