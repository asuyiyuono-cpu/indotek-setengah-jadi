import React, { useState } from 'react';
import { FileText, PlusCircle, Eye, CheckCircle, Ban, Clock } from 'lucide-react';
import { Supplier, PurchaseOrder } from '../types';

interface PurchaseOrderViewProps {
  purchaseOrders: PurchaseOrder[];
  suppliers: Supplier[];
  onAddPurchaseOrder: (po: PurchaseOrder) => void;
  onUpdatePOStatus: (id: string, status: 'Pending' | 'Selesai' | 'Dibatalkan') => void;
}

export default function PurchaseOrderView({
  purchaseOrders,
  suppliers,
  onAddPurchaseOrder,
  onUpdatePOStatus
}: PurchaseOrderViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [itemName, setItemName] = useState('');
  const [itemQty, setItemQty] = useState(100);
  const [itemUnit, setItemUnit] = useState('Kg');
  const [itemPrice, setItemPrice] = useState(15000);
  
  // Format currency
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    const vendor = suppliers.find(s => s.id === selectedSupplierId);
    if (!vendor) return;

    const total = itemQty * itemPrice;
    const poNum = `PO-2026-${String(purchaseOrders.length + 1).padStart(3, '0')}`;

    onAddPurchaseOrder({
      id: `po-${Date.now()}`,
      poNumber: poNum,
      supplierId: vendor.id,
      supplierName: vendor.name,
      orderDate: new Date().toISOString().split('T')[0],
      estimatedDelivery: new Date(Date.now() + 5*24*60*60*1000).toISOString().split('T')[0], // + 5 days
      status: 'Pending',
      items: [
        { name: itemName, quantity: itemQty, unit: itemUnit, price: itemPrice }
      ],
      totalAmount: total
    });

    setItemName('');
    setItemQty(100);
    setItemPrice(15000);
    setShowAddForm(false);
  };

  return (
    <div id="purchase_orders_container" className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 font-display">
            <FileText className="w-5 h-5 text-amber-500" />
            Purchase Order (PO) Management
          </h2>
          <p className="text-xs text-slate-500">Rencanakan pembelian logistik, ajukan PO bahan penolong, dan verifikasi status pemesanan.</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 self-start cursor-pointer transition-colors shadow-sm shadow-amber-600/10"
        >
          <PlusCircle className="w-4 h-4" />
          Rancang PO Baru
        </button>
      </div>

      {/* PO Drawer form */}
      {showAddForm && (
        <form onSubmit={handleCreatePO} className="bg-white border border-slate-300 rounded-xl p-6 space-y-4 shadow-md">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest border-b border-slate-100 pb-2">Rancang Nota Dokumen PO</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Pilih Supplier Vendor</label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Nama Barang Pemesanan</label>
              <input
                type="text"
                required
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Contoh: Benang Polyester DTY..."
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Jumlah Pemesanan (Quantity)</label>
              <input
                type="number"
                required
                value={itemQty}
                onChange={(e) => setItemQty(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-mono font-medium"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Satuan Ukur</label>
              <input
                type="text"
                required
                value={itemUnit}
                onChange={(e) => setItemUnit(e.target.value)}
                placeholder="Kg, Roll, Bales, Cone..."
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-mono font-medium"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Harga Beli Per Satuan (IDR)</label>
              <input
                type="number"
                required
                value={itemPrice}
                onChange={(e) => setItemPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-mono font-medium"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Total Biaya PO (Estimasi)</label>
              <div className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-amber-700 font-mono font-extrabold rounded">
                {formatRupiah(itemQty * itemPrice)}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-202 text-slate-650 text-xs font-bold cursor-pointer transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-705 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm shadow-amber-500/10"
            >
              Terbitkan PO
            </button>
          </div>
        </form>
      )}

      {/* Grid records */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-1">Daftar Dokumen PO Terbit</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {purchaseOrders.map((po) => (
            <div key={po.id} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-amber-400 hover:shadow-md transition-all shadow-sm">
              <div className="space-y-3.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono text-[9px] text-slate-700 bg-slate-100 border border-slate-250 px-2.5 py-0.5 rounded font-bold">{po.poNumber}</span>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold pb-0.5 uppercase tracking-wide border ${
                    po.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-205' :
                    po.status === 'Selesai' ? 'bg-emerald-50 text-emerald-700 border-emerald-205' :
                    'bg-rose-50 text-rose-700 border-rose-205'
                  }`}>
                    {po.status}
                  </span>
                </div>

                <div className="pt-1.5">
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Mitra Supplier</span>
                  <h4 className="text-slate-800 font-bold text-sm tracking-wide font-display mt-0.5">{po.supplierName}</h4>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-205 text-[11px] space-y-1.5">
                  {po.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between font-medium">
                      <span className="text-slate-700">{it.name}</span>
                      <span className="font-mono text-slate-500 font-bold">{it.quantity} {it.unit}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-405 font-medium border-t border-slate-100 pt-3">
                  <span>Tanggal Terbit: <strong className="font-mono text-slate-600">{po.orderDate}</strong></span>
                  <span>Est. Tiba: <strong className="font-mono text-slate-600">{po.estimatedDelivery}</strong></span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3.5 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest leading-none block">Total Nilai Tagihan</span>
                  <div className="font-mono text-base text-indigo-600 font-extrabold mt-1">{formatRupiah(po.totalAmount)}</div>
                </div>

                {po.status === 'Pending' && (
                  <div className="flex items-center space-x-1.5">
                    <button 
                      onClick={() => onUpdatePOStatus(po.id, 'Dibatalkan')}
                      className="p-1 px-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-205 text-rose-650 rounded-lg text-xs cursor-pointer font-bold flex items-center gap-1 transition-all"
                    >
                      <Ban className="w-3 h-3" />
                      Batal
                    </button>
                    <button 
                      onClick={() => onUpdatePOStatus(po.id, 'Selesai')}
                      className="p-1 px-2.5 bg-emerald-50 hover:bg-emerald-105 border border-emerald-205 text-emerald-650 rounded-lg text-xs cursor-pointer font-bold flex items-center gap-1 transition-all"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Verify Tiba
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
