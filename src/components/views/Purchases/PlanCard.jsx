import React from 'react';
import { Calendar, ChevronRight } from 'lucide-react';

const PlanCard = ({ plan, onClick, getStatusColor, getStatusIcon }) => {
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
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer border-2 border-gray-100 hover:border-blue-300"
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              {plan.supplier_name || 'Tanpa Supplier'}
            </h3>
            <p className="text-sm text-gray-600">
              {plan.items.length} item produk
            </p>
          </div>
          <span
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
              plan.status
            )}`}
          >
            {getStatusIcon(plan.status)}
            {plan.status}
          </span>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium text-gray-900">
              {progress.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-600 mb-1">Target</p>
            <p className="text-lg font-bold text-gray-900">{totalPlanned}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Diterima</p>
            <p className="text-lg font-bold text-green-600">{totalReceived}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            {plan.target_date
              ? new Date(plan.target_date).toLocaleDateString('id-ID')
              : 'Tanpa target'}
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

export default PlanCard;