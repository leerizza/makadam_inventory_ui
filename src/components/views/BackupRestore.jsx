import React, { useState, useEffect } from 'react';
import { Download, UploadCloud } from 'lucide-react';
import { API_BASE } from '../../utils/constants';

const BackupRestore = ({ token }) => {
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [restoreFile, setRestoreFile] = useState(null);
  const [restoreMessage, setRestoreMessage] = useState(null);

  const headers = { Authorization: `Bearer ${token}` };

  const safeFetchJson = async (url) => {
    try {
      const res = await fetch(url, { headers });
      if (!res.ok) {
        console.error('Failed to fetch', url, 'status:', res.status);
        return null;
      }
      return await res.json();
    } catch (err) {
      console.error('Error fetching', url, err);
      return null;
    }
  };

  const handleDownloadBackup = async () => {
    setBackupLoading(true);
    setRestoreMessage(null);

    try {
      // Ambil master & transaksi dasar
      const [products, customers, suppliers, sales, purchases, expenses] =
        await Promise.all([
          safeFetchJson(`${API_BASE}/products/`),
          safeFetchJson(`${API_BASE}/customers/`),
          safeFetchJson(`${API_BASE}/suppliers/`),
          safeFetchJson(`${API_BASE}/sales/`),
          safeFetchJson(`${API_BASE}/purchases/`),
          safeFetchJson(`${API_BASE}/expenses/`),
        ]);

      // recipes per product_id
      const recipesByProduct = {};
      if (Array.isArray(products)) {
        await Promise.all(
          products.map(async (p) => {
            const r = await safeFetchJson(`${API_BASE}/recipes/${p.id}`);
            if (Array.isArray(r) && r.length > 0) {
              recipesByProduct[p.id] = r;
            }
          })
        );
      }

      const backupPayload = {
        meta: {
          generated_at: new Date().toISOString(),
          app: 'Inventory System',
          version: '1.0',
        },
        products: Array.isArray(products) ? products : [],
        customers: Array.isArray(customers) ? customers : [],
        suppliers: Array.isArray(suppliers) ? suppliers : [],
        sales: Array.isArray(sales) ? sales : [],
        purchases: Array.isArray(purchases) ? purchases : [],
        expenses: Array.isArray(expenses) ? expenses : [],
        recipes: recipesByProduct,
      };

      const blob = new Blob([JSON.stringify(backupPayload, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');

      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `inventory_backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setRestoreMessage({
        type: 'success',
        text: 'Backup berhasil dibuat dan diunduh.',
      });
    } catch (error) {
      console.error('Error during backup:', error);
      setRestoreMessage({
        type: 'error',
        text: 'Gagal membuat backup. Cek console untuk detail.',
      });
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!restoreFile) {
      setRestoreMessage({
        type: 'error',
        text: 'Silakan pilih file backup (.json) terlebih dahulu.',
      });
      return;
    }

    setRestoreLoading(true);
    setRestoreMessage(null);

    try {
      const text = await restoreFile.text();
      const jsonData = JSON.parse(text);

      // Kirim ke backend untuk diproses
      const res = await fetch(`${API_BASE}/admin/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jsonData),
      });

      if (!res.ok) {
        let errText = 'Restore gagal.';
        try {
          const errJson = await res.json();
          errText = errJson.detail || errText;
        } catch (_) {
          // ignore
        }
        throw new Error(errText);
      }

      setRestoreMessage({
        type: 'success',
        text: 'Restore berhasil diproses oleh server.',
      });
    } catch (error) {
      console.error('Error during restore:', error);
      setRestoreMessage({
        type: 'error',
        text: error.message || 'Terjadi kesalahan saat restore.',
      });
    } finally {
      setRestoreLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Backup & Restore Data</h2>

      {/* Info / alert */}
      {restoreMessage && (
        <div
          className={`p-4 rounded-2xl border text-sm ${
            restoreMessage.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {restoreMessage.text}
        </div>
      )}

      {/* Backup Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-900 flex items-center justify-center shadow-md">
            <Download className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Backup Data</h3>
            <p className="text-sm text-gray-600">
              Backup akan berisi master & transaksi (products, customers, suppliers, sales, purchases, expenses, recipes).
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadBackup}
          disabled={backupLoading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black text-white rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {backupLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Menghasilkan backup...</span>
            </>
          ) : (
            <>
              <Download size={18} />
              <span>Download Backup (.json)</span>
            </>
          )}
        </button>
      </div>

      {/* Restore Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-md">
            <UploadCloud className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Restore Data</h3>
            <p className="text-sm text-gray-600">
              Restore akan mengirim file backup ke server. Proses penimpaan / merge data diatur di backend
              (<code className="bg-gray-100 px-1 rounded text-xs">POST /admin/restore</code>).
            </p>
          </div>
        </div>

        <div className="p-4 mb-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-800">
          <p className="font-semibold mb-1">⚠️ Peringatan</p>
          <p>
            Pastikan Anda mengerti konsekuensi restore. Sebaiknya lakukan di environment staging / dev terlebih dulu.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <input
            type="file"
            accept="application/json"
            onChange={(e) => {
              setRestoreFile(e.target.files?.[0] || null);
              setRestoreMessage(null);
            }}
            className="flex-1 text-sm text-gray-700 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />

          <button
            onClick={handleRestore}
            disabled={restoreLoading || !restoreFile}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {restoreLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Memproses restore...</span>
              </>
            ) : (
              <>
                <UploadCloud size={18} />
                <span>Upload & Restore</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};


export default BackupRestore;