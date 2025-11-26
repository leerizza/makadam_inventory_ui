import React from 'react';
import { formatCurrency } from "../../../utils/helpers";

const ReceiptsListView = ({ purchases, loading, errorMsg, findSupplierName }) => {
  if (loading) {
    return <div className="text-center py-10 text-gray-500">Memuat data...</div>;
  }

  if (errorMsg) {
    return <div className="text-center py-10 text-sm text-red-500">{errorMsg}</div>;
  }

  if (purchases.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 text-sm">
        Belum ada data pembelian.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gradient-to-r from-gray-50 to-slate-50">
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
              Supplier
            </th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
              Invoice
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
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {purchases.map((purchase) => (
            <tr
              key={purchase.id}
              className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                #{purchase.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                {findSupplierName(purchase)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {purchase.invoice_number || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {purchase.purchase_date
                  ? new Date(purchase.purchase_date).toLocaleDateString('id-ID')
                  : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                {formatCurrency(purchase.total_amount || 0)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">
                {purchase.payment_method}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReceiptsListView;