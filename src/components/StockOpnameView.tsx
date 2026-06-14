import React, { useState } from 'react';
import { ShieldCheck, Search, AlertTriangle, PlusCircle, CheckCircle, CheckCircle2 } from 'lucide-react';
import { StockProduct } from '../types';

interface AuditLog {
  id: string;
  date: string;
  itemName: string;
  systemStock: number;
  physicalStock: number;
  discrepancy: number;
  auditor: string;
  notes: string;
}

interface StockOpnameViewProps {
  products: StockProduct[];
  onAdjustProductStock: (id: string, newStock: number) => void;
}

export default function StockOpnameView({ products, onAdjustProductStock }: StockOpnameViewProps) {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 'log-1',
      date: '2026-06-12',
      itemName: 'Kain Katun Premium Jet Black',
      systemStock: 250,
      physicalStock: 250,
      discrepancy: 0,
      auditor: 'Ignatius',
      notes: 'Stok fisik sesuai data sistem.'
    },
    {
      id: 'log-2',
      date: '2026-06-08',
      itemName: 'Polyester Satin Silk Soft',
      systemStock: 185,
      physicalStock: 180,
      discrepancy: -5,
      auditor: 'Ignatius',
      notes: 'Kehilangan 5 Roll karena sobek di rak C12.'
    }
  ]);

  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [physicalCount, setPhysicalCount] = useState(100);
  const [notes, setNotes] = useState('');
  const [auditorName, setAuditorName] = useState('Ignatius');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const systemQty = selectedProduct ? selectedProduct.stock : 0;
  const discrepancy = physicalCount - systemQty;

  const handleRunAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    // 1. Log the audit
    const newLog: AuditLog = {
      id: `audit-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      itemName: selectedProduct.name,
      systemStock: systemQty,
      physicalStock: physicalCount,
      discrepancy: discrepancy,
      auditor: auditorName,
      notes: notes || (discrepancy === 0 ? 'Sesuai audit mingguan.' : 'Diterapkan penyesuaian selisih.')
    };

    setAuditLogs([newLog, ...auditLogs]);

    // 2. Adjust central stock database
    onAdjustProductStock(selectedProduct.id, physicalCount);

    // Show inline custom toast alert banner
    setSuccessBanner(`Audit Sukses! Stok "${selectedProduct.name}" disesuaikan ke ${physicalCount} ${selectedProduct.unit}.`);
    
    // Reset fields
    setNotes('');
    
    // Auto clear banner
    setTimeout(() => {
      setSuccessBanner(null);
    }, 6000);
  };

  return (
    <div id="stock_opname_container" className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 font-display">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            Stock Opname (Rekonsiliasi Fisik)
          </h2>
          <p className="text-xs text-slate-500">Audit pencocokan fisik timbunan kain gudang harian untuk melacak selisih susut bahan baku.</p>
        </div>
      </div>

      {successBanner && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-2.5 text-emerald-800 text-xs font-semibold animate-fade-in shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Run Audit Form */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <PlusCircle className="w-4 h-4 text-emerald-500" />
            Inisiasi Audit Baru
          </h3>
          <p className="text-[11px] text-slate-500 leading-relaxed">Pilih item produk jadi dari rak penyimpanan lalu input berat/jumlah nyata hasil audit lapangan.</p>

          <form onSubmit={handleRunAudit} className="space-y-4 pt-2">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Pilih Produk Bertarget</label>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  const prod = products.find(p => p.id === e.target.value);
                  if (prod) setPhysicalCount(prod.stock);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3.5 bg-slate-50 p-3.5 rounded-lg border border-slate-200/70 text-center text-xs">
              <div>
                <span className="block text-[9px] text-slate-400 uppercase font-bold tracking-wider">Stok Komputer</span>
                <span className="font-mono text-sm text-slate-800 font-extrabold">{systemQty} {selectedProduct?.unit}</span>
              </div>
              <div>
                <span className="block text-[9px] text-slate-400 uppercase font-bold tracking-wider">Selisih Susut</span>
                <span className={`font-mono text-sm font-extrabold ${
                  discrepancy === 0 ? 'text-emerald-600' :
                  discrepancy < 0 ? 'text-rose-600' : 'text-blue-600'
                }`}>
                  {discrepancy > 0 ? `+${discrepancy}` : discrepancy} {selectedProduct?.unit}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Stok Nyata di Rak Fisik</label>
              <input
                type="number"
                required
                value={physicalCount}
                onChange={(e) => setPhysicalCount(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-mono font-medium"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Nama Petugas Auditor</label>
              <input
                type="text"
                required
                value={auditorName}
                onChange={(e) => setAuditorName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Catatan Audit</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Alasan selisih, kondisi kain, sobek, dll..."
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-705 text-white font-bold text-xs py-2 rounded-lg cursor-pointer transition-colors shadow-sm shadow-emerald-550/10"
            >
              Simpan &amp; Luruskan Database
            </button>
          </form>
        </div>

        {/* Audit Log list */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 space-y-4 h-[510px] overflow-y-auto shadow-sm">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Riwayat Penyesuaian Audit Terbaru</h3>

          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div key={log.id} className="bg-slate-50/50 border border-slate-200 p-4 rounded-xl space-y-3 shadow-xs">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800 font-display text-sm leading-tight">{log.itemName}</span>
                  <span className="font-mono text-[10px] text-slate-400 font-medium">{log.date}</span>
                </div>

                <p className="text-xs text-slate-500 italic">"{log.notes}"</p>

                <div className="flex items-center justify-between text-[11px] border-t border-slate-200/50 pt-2 text-slate-505 font-medium">
                  <span>Petugas: <strong className="text-slate-700 font-bold">{log.auditor}</strong></span>
                  <div className="space-x-4">
                    <span>Komputer: <strong className="text-slate-700 font-mono font-bold">{log.systemStock}</strong></span>
                    <span>Fisik: <strong className="text-slate-700 font-mono font-bold">{log.physicalStock}</strong></span>
                    <span className={`font-bold ${log.discrepancy < 0 ? 'text-rose-600' : log.discrepancy > 0 ? 'text-blue-600' : 'text-emerald-600'}`}>
                      Selisih: {log.discrepancy > 0 ? `+${log.discrepancy}` : log.discrepancy}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
