import React, { useState } from 'react';
import { Layers, Search, PlusCircle, ArrowRight, CheckCircle2, RefreshCw, LayoutGrid } from 'lucide-react';
import { ComponentWIP } from '../types';

interface GudangSetengahJadiViewProps {
  wipComponents: ComponentWIP[];
  onAddWIPComponent: (comp: ComponentWIP) => void;
  onUpdateComponentProcess: (id: string, nextProcess: 'potong' | 'jahit' | 'finishing' | 'packing') => void;
  onUpdateComponentStatus: (id: string, status: 'WIP' | 'Selesai') => void;
}

export default function GudangSetengahJadiView({
  wipComponents,
  onAddWIPComponent,
  onUpdateComponentProcess,
  onUpdateComponentStatus
}: GudangSetengahJadiViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [compactMode, setCompactMode] = useState(false);

  // Form states
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newProcess, setNewProcess] = useState<'potong' | 'jahit' | 'finishing' | 'packing'>('potong');
  const [newQty, setNewQty] = useState(50);

  const filteredComponents = wipComponents.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName) return;

    onAddWIPComponent({
      id: `wip-${Date.now()}`,
      code: newCode,
      name: `${newCode} - ${newName}`,
      currentProcess: newProcess,
      quantity: newQty,
      status: 'WIP',
      date: new Date().toISOString().split('T')[0]
    });

    setNewCode('');
    setNewName('');
    setNewQty(50);
    setShowAddForm(false);
  };

  const incrementProcess = (id: string, current: 'potong' | 'jahit' | 'finishing' | 'packing') => {
    const sequence: Array<'potong' | 'jahit' | 'finishing' | 'packing'> = ['potong', 'jahit', 'finishing', 'packing'];
    const currentIdx = sequence.indexOf(current);
    if (currentIdx < sequence.length - 1) {
      onUpdateComponentProcess(id, sequence[currentIdx + 1]);
    } else {
      onUpdateComponentStatus(id, 'Selesai');
    }
  };

  return (
    <div id="wip_gudang_container" className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 font-display">
            <Layers className="w-5 h-5 text-emerald-500" />
            Gudang Setengah Jadi (WIP Inventory)
          </h2>
          <p className="text-xs text-slate-500">Penyelarasan batch mesin CNC bubut titanium, pemotongan presisi, finishing polishing fisis, sterilisasi medis &amp; packing implan.</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 self-start cursor-pointer transition-colors shadow-sm shadow-emerald-600/10"
        >
          <PlusCircle className="w-4 h-4" />
          Mulai Batch Produksi (PO)
        </button>
      </div>

      {/* Add New Assembly Form Modal */}
      {showAddForm && (
        <div className="bg-white border border-slate-300 rounded-xl p-6 space-y-4 shadow-md">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest border-b border-slate-100 pb-2">Inisiasi Komponen Assembly Baru</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Kode Komponen</label>
              <input
                type="text"
                required
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                placeholder="CONTOH: IDU-M2104"
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-mono font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Nama Deskripsi Komponen</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Contoh: Sub-Assembly Sleeve Border Lining..."
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Langkah Langkah Awal</label>
              <select
                value={newProcess}
                onChange={(e) => setNewProcess(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="potong">POTONG - Pemotongan Lapisan</option>
                <option value="jahit">JAHIT - Penjahitan Serat</option>
                <option value="finishing">FINISHING - Sortir Kualitas</option>
                <option value="packing">PACKING - Pengepakan Pengiriman</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Jumlah Target Baku (Pcs)</label>
              <input
                type="number"
                required
                value={newQty}
                onChange={(e) => setNewQty(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-8s0 focus:outline-none focus:border-emerald-500 font-mono font-medium"
              />
            </div>
            <div className="md:col-span-4 flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-655 text-xs font-bold cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-705 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm shadow-emerald-500/10"
              >
                Mulai Produksi
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main filter list */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg max-w-sm focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari WIP Code / komponen..."
              className="bg-transparent border-none text-xs text-slate-705 placeholder-slate-405 focus:outline-none w-full font-medium"
            />
          </div>

          {/* Mode Kompak Switch */}
          <button
            onClick={() => setCompactMode(!compactMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all self-start sm:self-auto ${
              compactMode 
                ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-800/20' 
                : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Mode Kompak: {compactMode ? 'Merapat' : 'Default'}</span>
          </button>
        </div>

        {/* WIP board simulation list or Compact table */}
        {compactMode ? (
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left border-collapse text-[11px] font-sans">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-550 text-[10px] uppercase font-black tracking-wider">
                  <th className="py-2 px-3">Kode Batch</th>
                  <th className="py-2 px-3">Deskripsi Komponen</th>
                  <th className="py-2 px-3 text-center">Tahapan Aktif</th>
                  <th className="py-2 px-3 text-right">Target Kuantitas</th>
                  <th className="py-2 px-3 text-center">Status</th>
                  <th className="py-2 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {filteredComponents.length > 0 ? (
                  filteredComponents.map((item) => (
                    <tr key={item.id} className={`hover:bg-slate-50 text-slate-750 transition-colors ${item.status === 'Selesai' ? 'bg-slate-50/50 opacity-60' : ''}`}>
                      <td className="py-2 px-3 font-mono font-black text-emerald-700">{item.code}</td>
                      <td className="py-2 px-3 font-semibold text-slate-800">{item.name}</td>
                      <td className="py-2 px-3 text-center font-bold uppercase text-[9px]">
                        <span className={`inline-block px-2 py-0.5 rounded border ${
                          item.currentProcess === 'potong' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          item.currentProcess === 'jahit' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          item.currentProcess === 'finishing' ? 'bg-indigo-50 text-indigo-750 border-indigo-200' :
                          'bg-purple-55 text-purple-700 border border-purple-200'
                        }`}>
                          {item.currentProcess}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-black text-slate-900">{item.quantity} pcs</td>
                      <td className="py-2 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-wide uppercase ${
                          item.status === 'WIP' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-green-100 text-green-800 border border-green-200'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        {item.status === 'WIP' ? (
                          <button
                            onClick={() => incrementProcess(item.id, item.currentProcess)}
                            className="bg-indigo-650 hover:bg-indigo-750 text-white font-bold text-[9px] px-2 py-1 rounded inline-flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <RefreshCw className="w-2.5 h-2.5 text-white" />
                            Next Step
                          </button>
                        ) : (
                          <span className="text-emerald-650 font-bold inline-flex items-center gap-1 text-[10px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">Tidak ada data WIP.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredComponents.length > 0 ? (
              filteredComponents.map((item) => (
              <div 
                key={item.id} 
                className={`border p-5 rounded-xl flex flex-col justify-between space-y-4 transition-all shadow-sm ${
                  item.status === 'Selesai' 
                    ? 'bg-slate-50/55 border-slate-200 opacity-65' 
                    : 'bg-white border-slate-200 hover:border-emerald-400/80 hover:shadow-md'
                }`}
              >
                {/* ID Header card info */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{item.code}</span>
                    <h4 className="mt-2 text-sm font-bold text-slate-800 font-display leading-tight">{item.name}</h4>
                  </div>
                  <div>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-extrabold tracking-wider ${
                      item.status === 'WIP' 
                        ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>

                {/* Progress Visual Tracker Step pipeline */}
                <div className="bg-slate-50 rounded-lg p-3 flex items-center justify-between text-[10px] border border-slate-200/60 font-sans">
                  {[
                    { key: 'potong', label: 'Potong' },
                    { key: 'jahit', label: 'Jahit' },
                    { key: 'finishing', label: 'Finishing' },
                    { key: 'packing', label: 'Packing' }
                  ].map((step, idx) => {
                    const isPassed = ['potong', 'jahit', 'finishing', 'packing'].indexOf(item.currentProcess) >= idx;
                    const isCurrent = item.currentProcess === step.key && item.status !== 'Selesai';
                    return (
                      <React.Fragment key={step.key}>
                        <div className="flex flex-col items-center flex-1">
                          <span className={`w-2 h-2 rounded-full mb-1 ${
                            isCurrent ? 'bg-indigo-600 ring-4 ring-indigo-100' :
                            isPassed ? 'bg-emerald-550' : 'bg-slate-250'
                          }`}></span>
                          <span className={`text-[10px] ${
                            isCurrent ? 'text-indigo-600 font-bold' :
                            isPassed ? 'text-slate-700 font-semibold' :
                            'text-slate-400'
                          }`}>{step.label}</span>
                        </div>
                        {idx < 3 && <ArrowRight className="w-3 h-3 text-slate-300 self-center mx-1 shrink-0" />}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Card footer details action tools */}
                <div className="flex justify-between items-center bg-slate-50/80 -mx-5 -mb-5 p-4 rounded-b-xl border-t border-slate-100">
                  <div className="text-slate-500 text-xs font-medium">
                    Kuantitas: <strong className="text-indigo-600 font-extrabold font-mono text-sm">{item.quantity}</strong> Pcs
                  </div>
                  
                  {item.status === 'WIP' ? (
                    <button
                      onClick={() => incrementProcess(item.id, item.currentProcess)}
                      className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all shadow-sm shadow-indigo-600/10"
                    >
                      <RefreshCw className="w-3 h-3 text-white" />
                      {item.currentProcess === 'packing' ? 'Selesaikan Batch' : 'Naikkan Proses'}
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Produksi Selesai
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 py-12 text-center text-slate-400 font-medium">
              Belum ada komponen WIP yang terdaftar. Mulai batch baru di atas.
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
