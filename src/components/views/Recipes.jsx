import React, { useState, useEffect, useMemo } from 'react';
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

import Modal from '../../common/Modal';

const Recipes = ({ token }) => {
  const [products, setProducts] = useState([]);
  const [recipes, setRecipes] = useState([]);       // list ProductRecipe
  const [selectedProductId, setSelectedProductId] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal tambah komponen
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    component_product_id: '',
    qty_per_unit: 1,
  });

  // Modal build dari recipe (restock BOM)
  const [buildModalOpen, setBuildModalOpen] = useState(false);
  const [buildQty, setBuildQty] = useState(1);
  const [buildLoading, setBuildLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products for recipes:', error);
    }
  };

  const fetchRecipes = async (productId) => {
    if (!productId) {
      setRecipes([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/recipes/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      // backend: response_model=list[schemas.RecipeComponentOut] → harusnya array
      if (Array.isArray(data)) {
        setRecipes(data);
      } else {
        setRecipes([]);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProductId(productId);
    setFormData((prev) => ({
      ...prev,
      product_id: productId ? Number(productId) : '',
    }));
    fetchRecipes(productId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        product_id: Number(selectedProductId),
        component_product_id: Number(formData.component_product_id),
        qty_per_unit: Number(formData.qty_per_unit),
      };

      const res = await fetch(`${API_BASE}/recipes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({
          product_id: selectedProductId ? Number(selectedProductId) : '',
          component_product_id: '',
          qty_per_unit: 1,
        });
        fetchRecipes(selectedProductId);
      } else {
        const err = await res.json();
        alert('Error: ' + (err.detail || 'Gagal menambah recipe'));
      }
    } catch (error) {
      console.error('Error creating recipe:', error);
      alert('Error creating recipe');
    }
  };

  // ===== Build dari Recipe (restock BOM) =====
  const handleBuild = async (e) => {
    e.preventDefault();
    if (!selectedProductId) {
      alert('Pilih produk INTERNAL dulu.');
      return;
    }
    if (!buildQty || Number(buildQty) <= 0) {
      alert('Qty harus lebih dari 0');
      return;
    }

    try {
      setBuildLoading(true);
      const res = await fetch(`${API_BASE}/recipes/build`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: Number(selectedProductId),
          qty_to_build: Number(buildQty),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert('Gagal build: ' + (err.detail || res.statusText));
        return;
      }

      const data = await res.json();
      console.log('Build result:', data);

      alert(
        `Berhasil build ${data.qty_built} ${data.product_name}\n` +
        `Stok: ${data.stock_before} → ${data.stock_after}`
      );

      setBuildModalOpen(false);
      setBuildQty(1);

      // opsional: refresh products / recipes supaya stok di UI update
      fetchProducts();
      fetchRecipes(selectedProductId);
    } catch (error) {
      console.error('Error build:', error);
      alert('Error saat build product');
    } finally {
      setBuildLoading(false);
    }
  };

  const internalProducts = products.filter((p) => p.product_type === 'INTERNAL');
  const componentProducts = products.filter((p) => p.product_type === 'RAW'); // sesuai rules di backend

  const findProductById = (id) => products.find((p) => p.id === id);
  const selectedProduct =
    selectedProductId ? findProductById(Number(selectedProductId)) : null;

  // ====== HPP / COST CALC ======
  const computeComponentCost = (rc) => {
    const comp = findProductById(rc.component_product_id);
    if (!comp) return 0;
    const qty = Number(rc.qty_per_unit || 0);
    const baseCost = Number(comp.base_cost || 0);
    return qty * baseCost;
  };

  const totalHppPerUnit =
    Array.isArray(recipes) && recipes.length > 0
      ? recipes.reduce((sum, rc) => sum + computeComponentCost(rc), 0)
      : 0;

  const formatCurrency = (value) =>
    `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Recipes / Bill of Materials</h2>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* Tombol Build dari Recipe */}
          <button
            type="button"
            onClick={() => setBuildModalOpen(true)}
            disabled={!selectedProductId}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TrendingUp size={18} />
            <span className="font-medium">
              Build dari Recipe
              {selectedProduct && ` (${selectedProduct.name})`}
            </span>
          </button>

          {/* Tombol tambah komponen */}
          <button
            onClick={() => setShowModal(true)}
            disabled={!selectedProductId}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={20} />
            <span className="font-medium">
              Tambah Komponen
              {selectedProductId ? ` (Product #${selectedProductId})` : ''}
            </span>
          </button>
        </div>
      </div>

      {/* Pilih Product yang mau di-set resepnya */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Pilih Produk (INTERNAL)
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => handleSelectProduct(e.target.value)}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="">Pilih produk yang akan dibuat resepnya...</option>
              {internalProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
              <p className="text-xs font-semibold text-emerald-600 mb-1">
                Produk Terpilih
              </p>
              <p className="text-sm font-bold text-gray-800">
                {selectedProduct.name} ({selectedProduct.sku})
              </p>
              <p className="text-xs text-gray-600">
                Tipe: {selectedProduct.product_type} • Stok: {selectedProduct.stock_qty}{' '}
                {selectedProduct.unit}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tabel recipes + HPP */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Daftar Komponen Resep</h3>

          {/* Card HPP per 1 unit produk INTERNAL */}
          {selectedProduct && (
            <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-4">
              <div>
                <p className="text-xs font-semibold text-emerald-700 uppercase">
                  HPP PER 1 UNIT
                </p>
                <p className="text-xs text-gray-600">
                  {selectedProduct.name} ({selectedProduct.sku})
                </p>
              </div>
              <p className="text-xl font-bold text-emerald-700">
                {formatCurrency(totalHppPerUnit)}
              </p>
            </div>
          )}
        </div>

        {!selectedProductId ? (
          <div className="text-center py-8 text-gray-500">
            Pilih produk terlebih dahulu untuk melihat / mengatur resep.
          </div>
        ) : loading ? (
          <div className="text-center py-8 text-gray-500">Memuat data resep...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-slate-50">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Komponen
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Qty per Unit
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Harga Modal (per unit)
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Biaya Komponen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Array.isArray(recipes) && recipes.length > 0 ? (
                  recipes.map((rc) => {
                    const comp = findProductById(rc.component_product_id);
                    const componentCost = computeComponentCost(rc);

                    return (
                      <tr
                        key={rc.id}
                        className="hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all"
                      >
                        {/* Komponen (RAW) */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {comp?.name || `Component #${rc.component_product_id}`}
                        </td>

                        {/* SKU */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {comp?.sku || '-'}
                        </td>

                        {/* Qty per Unit (Decimal) */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                          {Number(rc.qty_per_unit)}
                        </td>

                        {/* Harga Modal per unit RAW */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatCurrency(comp?.base_cost || 0)}
                        </td>

                        {/* Biaya Komponen = qty_per_unit * base_cost */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                          {formatCurrency(componentCost)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-6 text-center text-sm text-gray-500"
                    >
                      Belum ada komponen untuk produk ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal tambah component */}
      {showModal && (
        <Modal
          title="Tambah Komponen Resep"
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {!selectedProductId && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800 mb-2">
                Pilih dulu produk INTERNAL yang mau dibuat resepnya.
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Produk (INTERNAL)
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => handleSelectProduct(e.target.value)}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                required
              >
                <option value="">Pilih produk...</option>
                {internalProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Komponen (RAW)
              </label>
              <select
                value={formData.component_product_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    component_product_id: e.target.value,
                  })
                }
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                required
              >
                <option value="">Pilih produk bahan baku...</option>
                {componentProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Qty per Unit
              </label>
              <input
                type="number"
                min="0.0001"
                step="0.0001"
                value={formData.qty_per_unit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    qty_per_unit: e.target.value,
                  })
                }
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={!selectedProductId}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 rounded-xl font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Simpan Komponen
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-semibold transition-all"
              >
                Batal
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Build dari Recipe */}
      {buildModalOpen && (
        <Modal
          title="Build Stok dari Recipe"
          onClose={() => setBuildModalOpen(false)}
        >
          <form onSubmit={handleBuild} className="space-y-4">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800">
              {selectedProduct ? (
                <>
                  <p className="font-semibold">
                    Produk: {selectedProduct.name} ({selectedProduct.sku})
                  </p>
                  <p className="text-xs">
                    Stok saat ini: {selectedProduct.stock_qty} {selectedProduct.unit}
                  </p>
                </>
              ) : (
                <p>Pilih produk INTERNAL terlebih dahulu.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Qty yang akan diproduksi
              </label>
              <input
                type="number"
                min="1"
                value={buildQty}
                onChange={(e) => setBuildQty(e.target.value)}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={buildLoading || !selectedProductId}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-xl font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {buildLoading ? 'Memproses...' : 'Proses Build'}
              </button>
              <button
                type="button"
                onClick={() => setBuildModalOpen(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-semibold transition-all"
              >
                Batal
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Recipes;