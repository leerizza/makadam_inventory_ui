import React, { useState } from 'react';
import { Search, Package } from 'lucide-react';
import PlanCard from './PlanCard';

const PlansListView = ({
  plans,
  loading,
  onViewDetail,
  getStatusColor,
  getStatusIcon,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const filteredPlans = plans.filter((plan) => {
    const matchSearch =
      plan.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || plan.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Memuat data...</div>;
  }

  return (
    <div>
      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari supplier atau catatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">Semua Status</option>
          <option value="OPEN">Open</option>
          <option value="PARTIAL">Partial</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Plans Grid */}
      {filteredPlans.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Belum ada rencana pembelian
          </h3>
          <p className="text-gray-600">
            Buat rencana pembelian bertahap untuk mengelola stok lebih fleksibel
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onClick={() => onViewDetail(plan)}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PlansListView;