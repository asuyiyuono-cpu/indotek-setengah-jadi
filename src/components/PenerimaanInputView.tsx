import React, { useState } from 'react';
import { RefreshCw, Search, PlusCircle, Coins, Gift, Calendar, User } from 'lucide-react';
import { Supplier, SupplyArrival } from '../types';

interface PenerimaanInputViewProps {
  suppliers: Supplier[];
  supplyArrivals: SupplyArrival[];
  onAddSupplyArrival: (arr: Omit<SupplyArrival, 'id'>) => void;
}

export default function PenerimaanInputView({
  suppliers,
  supplyArrivals,
  onAddSupplyArrival
}: PenerimaanInputViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(suppliers[0]?.name || 'PT. Sinar Abadi Wool');
  const [materialType, setMaterialType] = useState<'Bahan Baku' | 'Bahan Pembantu'>('Bahan Baku');
  const [itemName, setItemName] = useState('');
  const [qty, setQty] = useState(500);
  const [unit, setUnit] = useState('Kg');
  const [totalPrice, setTotalPrice] = useState(1200000);

  // Format IDR helper
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName) return;

    onAddSupplyArrival({
      date: new Date().toISOString().split('T')[0], // Today's date YYYY-MM-DD
      type: materialType,
      supplierName: selectedSupplier,
      itemName: `${itemName} (${qty})`,
      quantity: qty,
      unit: unit,
      totalPrice: totalPrice
    });

    setItemName('');
    setTotalPrice(1200000);
    setQty(500);
    setShowForm(false);
  };

  return (
    <div id="penerimaan_container" className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 font-display">
            <RefreshCw className="w-5 h-5 text-sky-500" />
            Penerimaan Bahan Baku &amp; Pembantu (Inbound Logistics)
          </h2>
          <p className="text-xs text-slate-500">Gerbang bongkar muat logistik. Laporkan barang masuk untuk mencocokkan stok fisik gudang secara real-time.</p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 self-start cursor-pointer transition-colors shadow-sm shadow-sky-600/10"
        >
          <PlusCircle className="w-4 h-4" />
          Catat Bongkar Muat Baru
        </button>
      </div>

      {/* Form collapse details */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-300 rounded-xl p-6 space-y-4 shadow-md">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest border-b border-slate-105 pb-2">Formulir Bongkar Muat Penerimaan</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Supplier Pemancar</label>
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-850 focus:outline-none focus:border-sky-500 font-medium"
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Klasifikasi Material</label>
              <select
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-850 focus:outline-none focus:border-sky-500 font-medium"
              >
                <option value="Bahan Baku">Bahan Baku (BB)</option>
                <option value="Bahan Pembantu">Bahan Pembantu (BP)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Nama Barang / Material</label>
              <input
                type="text"
                required
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Contoh: Kain katun jepang..."
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Kuantitas Bongkar</label>
              <input
                type="number"
                required
                value={qty}
                onChange={(e) => setQty(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-500 font-mono font-medium"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Satuan</label>
              <input
                type="text"
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Kg, Roll, Yards, Pcs..."
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-500 font-mono font-medium"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Nilai Tagihan Terpaut (IDR)</label>
              <input
                type="number"
                required
                value={totalPrice}
                onChange={(e) => setTotalPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-500 font-mono font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-202 text-slate-650 text-xs font-bold cursor-pointer transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-705 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm shadow-sky-500/10"
            >
              Simpan &amp; Hubungkan Buku Besar
            </button>
          </div>
        </form>
      )}

      {/* History table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-1">Log Transaksi Bongkar Muat Inbound</h3>

        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-2.5 px-4 font-mono">Tanggal Masuk</th>
                <th className="py-2.5 px-4">Klasifikasi</th>
                <th className="py-2.5 px-4">Nama Material</th>
                <th className="py-2.5 px-4">Supplier</th>
                <th className="py-2.5 px-4 text-right">Nilai Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {supplyArrivals.map((arr) => (
                <tr key={arr.id} className="hover:bg-slate-50/75 text-slate-700 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-500">{arr.date}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-bold border ${
                      arr.type === 'Bahan Baku' 
                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-205'
                    }`}>
                      {arr.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800 font-display">{arr.itemName}</td>
                  <td className="py-3 px-4 text-slate-500 font-semibold">{arr.supplierName}</td>
                  <td className="py-3 px-4 text-right font-extrabold text-indigo-600 font-mono">{formatRupiah(arr.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
