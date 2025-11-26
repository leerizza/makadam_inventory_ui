import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Truck,
  CheckCircle,
  AlertCircle,
  Plus,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { API_BASE } from '../../../utils/constants';

import PlansListView from './PlansListView';
import ReceiptsListView from './ReceiptsListView';
import DirectPurchaseModal from './DirectPurchaseModal';
import CreatePlanModal from './CreatePlanModal';
import PlanDetailModal from './PlanDetailModal';
import ReceiveItemsModal from './ReceiveItemsModal';

const RECEIPTS_PAGE_SIZE = 10; // jumlah baris per halaman

const Purchases = ({ token }) => {
  const [activeTab, setActiveTab] = useState('RECEIPTS'); // RECEIPTS | PLANS
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Data
  const [purchases, setPurchases] = useState([]);
  const [plans, setPlans] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  // Filter tanggal untuk RECEIPTS
  const [receiptDateFrom, setReceiptDateFrom] = useState('');
  const [receiptDateTo, setReceiptDateTo] = useState('');

  // Pagination untuk RECEIPTS
  const [receiptPage, setReceiptPage] = useState(1);

  // Modals
  const [showDirectPurchaseModal, setShowDirectPurchaseModal] = useState(false);
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [showPlanDetailModal, setShowPlanDetailModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }),
    [token]
  );

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

  useEffect(() => {
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [purchasesRes, plansRes, productsRes, suppliersRes] = await Promise.all([
        fetch(`${API_BASE}/purchases/receipts`, { headers }),
        fetch(`${API_BASE}/purchase-plans/`, { headers }),
        fetch(`${API_BASE}/products/`, { headers }),
        fetch(`${API_BASE}/suppliers/`, { headers }),
      ]);

      // Purchases
      if (!purchasesRes.ok) {
        setErrorMsg(`Gagal memuat data pembelian (status ${purchasesRes.status})`);
        setPurchases([]);
      } else {
        const purchasesData = await purchasesRes.json();
        setPurchases(Array.isArray(purchasesData) ? purchasesData : []);
      }

      // Plans
      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setPlans(Array.isArray(plansData) ? plansData : []);
      }

      const [productsData, suppliersData] = await Promise.all([
        productsRes.json(),
        suppliersRes.json(),
      ]);

      setProducts(Array.isArray(productsData) ? productsData : []);
      setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);
    } catch (err) {
      console.error('Error loading data:', err);
      setErrorMsg('Terjadi error saat memuat data.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      OPEN: 'bg-blue-100 text-blue-800',
      PARTIAL: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'OPEN':
        return <Clock className="w-4 h-4" />;
      case 'PARTIAL':
        return <Truck className="w-4 h-4" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      case 'CANCELLED':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const findSupplierName = (purchase) => {
    if (purchase.supplier_name) return purchase.supplier_name;
    const s = suppliers.find((sp) => sp.id === purchase.supplier_id);
    return s ? s.name : '-';
  };

  // ===== Helper: ambil field tanggal dari purchase =====
  const getPurchaseDate = (purchase) => {
    // SESUAIKAN dengan field di API kamu
    // misal kalau backend pakai "receipt_date" (yyyy-mm-dd)
    return (
      purchase.receipt_date ||
      purchase.purchase_date ||
      purchase.date ||
      purchase.created_at ||
      null
    );
  };

  // Reset page kalau filter tanggal berubah atau ganti tab
  useEffect(() => {
    setReceiptPage(1);
  }, [receiptDateFrom, receiptDateTo, activeTab]);

  // ===== Filter & Pagination untuk RECEIPTS =====
  const filteredReceipts = useMemo(() => {
    if (!Array.isArray(purchases)) return [];

    return purchases.filter((p) => {
      const dateStr = getPurchaseDate(p);
      if (!dateStr) return true; // kalau tidak ada tanggal, tidak difilter

      const d = new Date(dateStr);

      if (receiptDateFrom) {
        const from = new Date(receiptDateFrom);
        if (d < from) return false;
      }

      if (receiptDateTo) {
        const to = new Date(receiptDateTo);
        // supaya inclusive s/d akhir hari
        to.setHours(23, 59, 59, 999);
        if (d > to) return false;
      }

      return true;
    });
  }, [purchases, receiptDateFrom, receiptDateTo]);

  const totalReceiptPages = Math.max(
    1,
    Math.ceil(filteredReceipts.length / RECEIPTS_PAGE_SIZE)
  );

  const paginatedReceipts = useMemo(() => {
    const startIndex = (receiptPage - 1) * RECEIPTS_PAGE_SIZE;
    return filteredReceipts.slice(startIndex, startIndex + RECEIPTS_PAGE_SIZE);
  }, [filteredReceipts, receiptPage]);

  const handlePrevPage = () => {
    setReceiptPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setReceiptPage((prev) => Math.min(totalReceiptPages, prev + 1));
  };

  const handleResetFilters = () => {
    setReceiptDateFrom('');
    setReceiptDateTo('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Pembelian</h2>
          <p className="text-sm text-gray-500">
            Kelola pembelian langsung dan bertahap dengan fleksibel
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
          <button
            type="button"
            onClick={() => setActiveTab('PLANS')}
            className={`px-4 py-1.5 text-sm rounded-full transition-all ${
              activeTab === 'PLANS'
                ? 'bg-white text-gray-900 shadow-md'
                : 'text-gray-500'
            }`}
          >
            Rencana Pembelian
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('RECEIPTS')}
            className={`px-4 py-1.5 text-sm rounded-full transition-all ${
              activeTab === 'RECEIPTS'
                ? 'bg-white text-gray-900 shadow-md'
                : 'text-gray-500'
            }`}
          >
            Penerimaan Langsung
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        {activeTab === 'PLANS' ? (
          <button
            onClick={() => setShowCreatePlanModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            <span className="font-medium">Buat Rencana Pembelian</span>
          </button>
        ) : (
          <button
            onClick={() => setShowDirectPurchaseModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            <span className="font-medium">Pembelian Langsung</span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        {/* Filter tanggal + info + pagination khusus RECEIPTS */}
        {activeTab === 'RECEIPTS' && (
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
            {/* Filter tanggal */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Tanggal dari
                </label>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <input
                    type="date"
                    value={receiptDateFrom}
                    onChange={(e) => setReceiptDateFrom(e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Tanggal sampai
                </label>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <input
                    type="date"
                    value={receiptDateTo}
                    onChange={(e) => setReceiptDateTo(e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Reset filter
                </button>
              </div>
            </div>

            {/* Info jumlah + pagination */}
            <div className="flex flex-col items-start md:items-end gap-2">
              <p className="text-xs text-gray-500">
                Menampilkan{' '}
                <span className="font-semibold text-gray-700">
                  {filteredReceipts.length === 0
                    ? 0
                    : (receiptPage - 1) * RECEIPTS_PAGE_SIZE + 1}
                  {' - '}
                  {Math.min(
                    receiptPage * RECEIPTS_PAGE_SIZE,
                    filteredReceipts.length
                  )}
                </span>{' '}
                dari{' '}
                <span className="font-semibold text-gray-700">
                  {filteredReceipts.length}
                </span>{' '}
                penerimaan
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevPage}
                  disabled={receiptPage <= 1}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs text-gray-600">
                  Halaman{' '}
                  <span className="font-semibold">{receiptPage}</span> /{' '}
                  <span className="font-semibold">{totalReceiptPages}</span>
                </span>
                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={receiptPage >= totalReceiptPages}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* List content */}
        {activeTab === 'PLANS' ? (
          <PlansListView
            plans={plans}
            loading={loading}
            onViewDetail={(plan) => {
              setSelectedPlan(plan);
              setShowPlanDetailModal(true);
            }}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
          />
        ) : (
          <ReceiptsListView
            purchases={paginatedReceipts} // <-- pakai hasil filter + pagination
            loading={loading}
            errorMsg={errorMsg}
            findSupplierName={findSupplierName}
          />
        )}
      </div>

      {/* Modals */}
      {showDirectPurchaseModal && (
        <DirectPurchaseModal
          products={products}
          suppliers={suppliers}
          headers={headers}
          onClose={() => setShowDirectPurchaseModal(false)}
          onSuccess={fetchInitialData}
        />
      )}

      {showCreatePlanModal && (
        <CreatePlanModal
          products={products}
          suppliers={suppliers}
          headers={headers}
          onClose={() => setShowCreatePlanModal(false)}
          onSuccess={fetchInitialData}
        />
      )}

      {showPlanDetailModal && selectedPlan && (
        <PlanDetailModal
          plan={selectedPlan}
          products={products}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
          onClose={() => {
            setShowPlanDetailModal(false);
            setSelectedPlan(null);
          }}
          onReceive={() => {
            setShowPlanDetailModal(false);
            setShowReceiveModal(true);
          }}
        />
      )}

      {showReceiveModal && selectedPlan && (
        <ReceiveItemsModal
          plan={selectedPlan}
          products={products}
          headers={headers}
          accounts={accounts}
          onClose={() => {
            setShowReceiveModal(false);
            setSelectedPlan(null);
          }}
          onSuccess={() => {
            setShowReceiveModal(false);
            setSelectedPlan(null);
            fetchInitialData();
          }}
        />
      )}
    </div>
  );
};

export default Purchases;
