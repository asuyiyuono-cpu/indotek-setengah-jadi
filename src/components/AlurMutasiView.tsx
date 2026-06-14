import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Search, 
  PlusCircle, 
  RefreshCw, 
  CheckCircle2, 
  TrendingUp, 
  Warehouse, 
  Users, 
  FileText, 
  Sliders, 
  HelpCircle,
  TrendingDown,
  Info
} from 'lucide-react';
import { ComponentWIP } from '../types';

interface AlurMutasiViewProps {
  materials: any[];
  wipComponents: ComponentWIP[];
  purchaseOrders: any[];
  products: any[];
  onUpdateMaterialStock: (id: string, newStock: number) => void;
  onLogActivity: (type: 'stock' | 'transaction' | 'wip' | 'pembelian' | 'supplier' | 'system', action: string, details: string) => void;
}

export interface MaterialMutation {
  id: string;
  timestamp: string; // YYYY-MM-DD HH:mm:ss
  skuCode: string;
  itemName: string;
  type: 'Inbound' | 'Pelepasan WIP' | 'Peralihan WIP' | 'Penyesuaian' | 'Transfer Gudang';
  quantity: number;
  unit: string;
  source: string;
  destination: string;
  operator: string;
}

export default function AlurMutasiView({
  materials,
  wipComponents,
  purchaseOrders,
  products,
  onUpdateMaterialStock,
  onLogActivity
}: AlurMutasiViewProps) {
  // Persistence for mutations
  const [mutations, setMutations] = useState<MaterialMutation[]>(() => {
    const saved = localStorage.getItem('indotex_mutations');
    return saved ? JSON.parse(saved) : [
      {
        id: 'MUT-001',
        timestamp: '2026-06-14 10:45:12',
        skuCode: 'BB-MKL-01',
        itemName: 'Benang Katun Mercerized 32S',
        type: 'Pelepasan WIP',
        quantity: 200,
        unit: 'Kg',
        source: 'Aisle A, Rak 2 (Bahan Baku)',
        destination: 'WIP Denim IDU-M2102 (Assembly)',
        operator: 'Ignatius (Warehouse Head)'
      },
      {
        id: 'MUT-002',
        timestamp: '2026-06-14 09:20:30',
        skuCode: 'BP-ZIP-05',
        itemName: 'YKK Durable Brass Zipper 20cm',
        type: 'Inbound',
        quantity: 500,
        unit: 'Pcs',
        source: 'PO-2026-002 (PT Mahkota)',
        destination: 'Aisle D, Rak 3 (Bahan Penunjang)',
        operator: 'Ignatius (Warehouse Head)'
      },
      {
        id: 'MUT-003',
        timestamp: '2026-06-14 08:12:05',
        skuCode: 'IDU-M2103',
        itemName: 'IDU-M2103 - Main Frame Plate Alignment',
        type: 'Peralihan WIP',
        quantity: 45,
        unit: 'Pcs',
        source: 'Proses Potong (Cutting)',
        destination: 'Proses Jahit (Sewing)',
        operator: 'Ignatius (Warehouse Head)'
      },
      {
        id: 'MUT-004',
        timestamp: '2026-06-13 15:30:00',
        skuCode: 'BB-MKL-01',
        itemName: 'Benang Katun Mercerized 32S',
        type: 'Inbound',
        quantity: 5000,
        unit: 'Kg',
        source: 'PO-2026-001 (PT Wasil)',
        destination: 'Aisle A, Rak 2 (Bahan Baku)',
        operator: 'Ignatius (Warehouse Head)'
      },
      {
        id: 'MUT-005',
        timestamp: '2026-06-12 11:24:00',
        skuCode: 'BB-LIN-06',
        itemName: 'Flax Linen Raw Organic Fibres',
        type: 'Penyesuaian',
        quantity: 5,
        unit: 'Kg',
        source: 'Aisle E, Rak 1',
        destination: 'Penyesuaian Opname (-)',
        operator: 'Ignatius (Warehouse Head)'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('indotex_mutations', JSON.stringify(mutations));
  }, [mutations]);

  // UI state
  const [activeStepFilter, setActiveStepFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddMutation, setShowAddMutation] = useState(false);

  // Form state
  const [selectedMatId, setSelectedMatId] = useState('');
  const [selectedWipId, setSelectedWipId] = useState('');
  const [qtyValue, setQtyValue] = useState(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Stats calculation
  const totalInboundVolume = mutations
    .filter(m => m.type === 'Inbound')
    .reduce((sum, m) => sum + m.quantity, 0);

  const totalWIPAllocated = mutations
    .filter(m => m.type === 'Pelepasan WIP')
    .reduce((sum, m) => sum + m.quantity, 0);

  const activeWIPItemsCount = wipComponents.filter(w => w.status === 'WIP').length;
  const readyFinishedProductsStock = products.reduce((sum, p) => sum + p.stock, 0);

  // Event handler for Manual Mutation (Material Allocation to production)
  const handleCreateMutation = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const material = materials.find(m => m.id === selectedMatId);
    if (!material) {
      setErrorMsg('Silakan pilih bahan baku/penunjang terlebih dahulu.');
      return;
    }

    if (qtyValue <= 0) {
      setErrorMsg('Volume pemindahan/alokasi harus lebih tinggi dari 0.');
      return;
    }

    if (material.stock < qtyValue) {
      setErrorMsg(`Volume stok tidak memadai! Jumlah yang tersedia saat ini: ${material.stock} ${material.unit}.`);
      return;
    }

    const targetWip = wipComponents.find(w => w.id === selectedWipId);
    const destinationDesc = targetWip 
      ? `WIP ${targetWip.name} (Proses: ${targetWip.currentProcess})` 
      : 'Area Produksi Manufaktur Umum';

    // 1. Process local stock subtraction
    const updatedStock = material.stock - qtyValue;
    onUpdateMaterialStock(material.id, updatedStock);

    // 2. Register Mutation Record
    const formatTime = () => {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    };

    const newMutation: MaterialMutation = {
      id: `MUT-${Date.now()}`,
      timestamp: formatTime(),
      skuCode: material.code,
      itemName: material.name,
      type: 'Pelepasan WIP',
      quantity: qtyValue,
      unit: material.unit,
      source: `${material.rackLocation || 'Aisle A, Rak 1'} (Gudang Bahan)`,
      destination: destinationDesc,
      operator: 'Ignatius (Warehouse Head)'
    };

    setMutations(prev => [newMutation, ...prev]);

    // 3. Log into master system logs
    onLogActivity(
      'stock',
      'Mutasi Alokasi WIP',
      `Memutasikan ${qtyValue} ${material.unit} dari ${material.name} menuju ${destinationDesc}.`
    );

    setSuccessMsg(`Berhasil memutasikan ${qtyValue} ${material.unit} ${material.name} ke lini produksi.`);
    setSelectedMatId('');
    setSelectedWipId('');
    setQtyValue(1);
    
    // Auto collapse form
    setTimeout(() => {
      setShowAddMutation(false);
      setSuccessMsg(null);
    }, 2500);
  };

  // Filter mutations
  const filteredMutations = mutations.filter(m => {
    const textSearch = searchTerm.toLowerCase();
    const matchesSearch = 
      m.skuCode.toLowerCase().includes(textSearch) ||
      m.itemName.toLowerCase().includes(textSearch) ||
      m.source.toLowerCase().includes(textSearch) ||
      m.destination.toLowerCase().includes(textSearch) ||
      m.type.toLowerCase().includes(textSearch);

    if (activeStepFilter === 'inbound') {
      return matchesSearch && m.type === 'Inbound';
    } else if (activeStepFilter === 'gudang') {
      return matchesSearch && (m.type === 'Inbound' || m.type === 'Penyesuaian' || m.type === 'Transfer Gudang');
    } else if (activeStepFilter === 'wip_alloc') {
      return matchesSearch && m.type === 'Pelepasan WIP';
    } else if (activeStepFilter === 'wip_trans') {
      return matchesSearch && m.type === 'Peralihan WIP';
    }
    return matchesSearch;
  });

  return (
    <div id="alur-mutasi-view-root" className="space-y-6">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-emerald-850 to-indigo-900 bg-slate-900 rounded-xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 translate-y-4 translate-x-4">
          <Warehouse className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="bg-emerald-550/30 text-emerald-350 text-[9px] uppercase tracking-widest font-black inline-block px-2.5 py-1 rounded-full ring-1 ring-emerald-550/25">
            ERP Alur Logistik &amp; Material
          </span>
          <h1 className="text-xl font-bold font-display tracking-tight sm:text-2xl">
            Alur Pergerakan &amp; Mutasi Barang
          </h1>
          <p className="text-slate-300 text-xs leading-relaxed font-sans">
            Lacak pergerakan inventaris dari kedatangan pembelian supplier, penyimpanan di rak gudang bahan baku, alokasi pengeluaran ke proses manufaktur (WIP), hingga transisi menjadi barang setengah jadi.
          </p>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Step 1 */}
        <button
          onClick={() => setActiveStepFilter(activeStepFilter === 'inbound' ? null : 'inbound')}
          className={`text-left p-4 rounded-xl border transition-all relative group cursor-pointer ${
            activeStepFilter === 'inbound'
              ? 'bg-amber-50/75 border-amber-300 ring-2 ring-amber-400/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="p-1 px-2 text-[9px] bg-amber-100 text-amber-800 font-extrabold uppercase rounded tracking-wider">
              Tahap 1: Inbound
            </span>
            <FileText className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mt-3">Barang Diterima</p>
          <p className="text-lg font-black text-slate-800 font-mono mt-0.5 mt-1">{totalInboundVolume.toLocaleString()} <span className="text-xs font-normal text-slate-400">unit</span></p>
          <div className="mt-2 text-[10px] text-slate-400 font-medium">Klik untuk saring log masuk</div>
        </button>

        {/* Step 2 */}
        <button
          onClick={() => setActiveStepFilter(activeStepFilter === 'gudang' ? null : 'gudang')}
          className={`text-left p-4 rounded-xl border transition-all relative group cursor-pointer ${
            activeStepFilter === 'gudang'
              ? 'bg-blue-50/75 border-blue-300 ring-2 ring-blue-400/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="p-1 px-2 text-[9px] bg-blue-100 text-blue-800 font-extrabold uppercase rounded tracking-wider">
              Tahap 2: Gudang
            </span>
            <Warehouse className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mt-3">Ketersediaan Rak</p>
          <p className="text-lg font-black text-slate-800 font-mono mt-1">{materials.length} <span className="text-xs font-normal text-slate-400">SKU Bahan</span></p>
          <div className="mt-2 text-[10px] text-slate-400 font-medium">Klik untuk saring log pergudangan</div>
        </button>

        {/* Step 3 */}
        <button
          onClick={() => setActiveStepFilter(activeStepFilter === 'wip_alloc' ? null : 'wip_alloc')}
          className={`text-left p-4 rounded-xl border transition-all relative group cursor-pointer ${
            activeStepFilter === 'wip_alloc'
              ? 'bg-purple-50/75 border-purple-300 ring-2 ring-purple-400/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="p-1 px-2 text-[9px] bg-purple-100 text-purple-800 font-extrabold uppercase rounded tracking-wider">
              Tahap 3: Alokasi
            </span>
            <Sliders className="w-4 h-4 text-purple-550" />
          </div>
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mt-3">Transisi ke WIP</p>
          <p className="text-lg font-black text-slate-800 font-mono mt-1">{totalWIPAllocated.toLocaleString()} <span className="text-xs font-normal text-slate-400">Unit Kelur</span></p>
          <div className="mt-2 text-[10px] text-slate-400 font-medium">Klik untuk saring log alokasi</div>
        </button>

        {/* Step 4 */}
        <button
          onClick={() => setActiveStepFilter(activeStepFilter === 'wip_trans' ? null : 'wip_trans')}
          className={`text-left p-4 rounded-xl border transition-all relative group cursor-pointer ${
            activeStepFilter === 'wip_trans'
              ? 'bg-emerald-50/75 border-emerald-300 ring-2 ring-emerald-400/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="p-1 px-2 text-[9px] bg-emerald-100 text-emerald-800 font-extrabold uppercase rounded tracking-wider">
              Tahap 4: Setengah Jadi
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mt-3">Sedang Berjalan</p>
          <p className="text-lg font-black text-slate-800 font-mono mt-1">{activeWIPItemsCount} <span className="text-xs font-normal text-slate-400">Batch WIP</span></p>
          <div className="mt-2 text-[10px] text-slate-400 font-medium">Klik untuk saring log tahapan</div>
        </button>
      </div>

      {/* VISUAL PIPELINE DRAWING CARD */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">
            Diagram Alir Mutasi &amp; Penyaluran Bahan (Indotex Pipeline)
          </h3>
          <span className="text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-700 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
            Sistem Serialisasi Mandiri
          </span>
        </div>

        {/* Visual blocks */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-center">
          {/* Block A: Supplier Inbound */}
          <div className="md:col-span-2 bg-slate-50 border border-slate-200 p-3.5 rounded-lg text-center space-y-2 hover:border-indigo-400 transition-colors">
            <span className="mx-auto block w-7 h-7 bg-amber-150 text-amber-700 font-black rounded-full flex items-center justify-center text-xs">A</span>
            <h4 className="text-xs font-black text-slate-800 font-display">1. Inbound Pos</h4>
            <p className="text-[10px] text-slate-500 leading-tight">Barang masuk dari PO Vendor (Bahan Baku / Penunjang) dicatat &amp; divalidasi quantity.</p>
            <div className="text-[10px] font-mono text-indigo-600 bg-white border border-slate-250 py-1 px-1.5 rounded inline-block font-extrabold">
              {purchaseOrders.filter(p => p.status === 'Selesai').length} PO Diterima
            </div>
          </div>

          <div className="hidden md:flex justify-center items-center text-slate-350">
            <ArrowRight className="w-5 h-5 animate-pulse text-indigo-450" />
          </div>

          {/* Block B: Warehouse penyimpanan */}
          <div className="md:col-span-2 bg-slate-50 border border-slate-200 p-3.5 rounded-lg text-center space-y-2 hover:border-indigo-400 transition-colors">
            <span className="mx-auto block w-7 h-7 bg-blue-150 text-blue-700 font-black rounded-full flex items-center justify-center text-xs">B</span>
            <h4 className="text-xs font-black text-slate-800 font-display">2. Gudang Utama</h4>
            <p className="text-[10px] text-slate-500 leading-tight">Penyimpanan sistem Aisle &amp; Rak. Kontrol limit kritis alert diaktifkan.</p>
            <div className="text-[10px] font-mono text-emerald-600 bg-white border border-slate-250 py-1 px-1.5 rounded inline-block font-extrabold">
              {materials.reduce((sum, m) => sum + m.stock, 0).toLocaleString()} Unit Stok
            </div>
          </div>

          <div className="hidden md:flex justify-center items-center text-slate-350">
            <ArrowRight className="w-5 h-5 animate-pulse text-indigo-450" />
          </div>

          {/* Block C: Manufacturing WIP */}
          <div className="md:col-span-2 bg-slate-50 border border-slate-200 p-3.5 rounded-lg text-center space-y-2 hover:border-indigo-400 transition-colors">
            <span className="mx-auto block w-7 h-7 bg-purple-150 text-purple-700 font-black rounded-full flex items-center justify-center text-xs">C</span>
            <h4 className="text-xs font-black text-slate-800 font-display">3. Alokasi Produksi</h4>
            <p className="text-[10px] text-slate-500 leading-tight">Bahan dipotong (cutting), dijahit, kemudian dialihkan ke gudang setengah jadi.</p>
            <div className="text-[10px] font-mono text-indigo-650 bg-white border border-slate-250 py-1 px-1.5 rounded inline-block font-extrabold">
              {wipComponents.length} Kode Manufaktur
            </div>
          </div>
        </div>
      </div>

      {/* QUICK TOASTS */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 text-rose-800 border border-rose-300 rounded-lg text-xs font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* TWO SECTION SPLIT: LEDGER AND FORM */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEDGER TABULATION: Column span 2 */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-display">
                Ledger Riwayat Mutasi Bahan
              </h3>
              <p className="text-[10px] text-slate-400 leading-none mt-1">
                {activeStepFilter ? `Disaring berdasarkan filter: "${activeStepFilter}"` : 'Menampilkan seluruh rekam jejak material'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
                <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Kode SKU / item..." 
                  className="bg-transparent border-none focus:outline-none w-32 text-xs text-slate-705 placeholder-slate-405"
                />
              </div>

              {activeStepFilter && (
                <button
                  onClick={() => setActiveStepFilter(null)}
                  className="px-2.5 py-1 text-[10px] text-slate-500 hover:text-slate-800 font-bold border border-slate-250 bg-slate-50 rounded"
                >
                  Clear Filter
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto text-[11px] font-sans">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[9px] uppercase tracking-wider font-extrabold">
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3">SKU / Nama Bahan</th>
                  <th className="py-2.5 px-3 text-center">Tipe Mutasi</th>
                  <th className="py-2.5 px-3 text-right">Volume</th>
                  <th className="py-2.5 px-3">Sumber &rarr; Tujuan</th>
                  <th className="py-2.5 px-3">Penanggung Jawab</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMutations.length > 0 ? (
                  filteredMutations.map((m) => {
                    let badgeColor = "bg-amber-50 text-amber-700 border-amber-200";
                    if (m.type === 'Pelepasan WIP') badgeColor = "bg-purple-50 text-purple-700 border-purple-200";
                    if (m.type === 'Peralihan WIP') badgeColor = "bg-indigo-50 text-indigo-700 border-indigo-200";
                    if (m.type === 'Inbound') badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-250";
                    if (m.type === 'Penyesuaian') badgeColor = "bg-rose-50 text-rose-700 border-rose-200";

                    return (
                      <tr key={m.id} className="hover:bg-slate-50/60 text-slate-705 transition-colors">
                        <td className="py-3 px-3 font-mono text-slate-400 font-medium whitespace-nowrap">
                          {m.timestamp.split(' ')[1]}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-indigo-650 font-mono block">{m.skuCode}</span>
                          <span className="text-slate-550 break-words">{m.itemName}</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black tracking-wide border uppercase ${badgeColor}`}>
                            {m.type}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-black font-mono text-slate-800">
                          {m.type === 'Pelepasan WIP' || m.type === 'Penyesuaian' ? '-' : '+'}
                          {m.quantity.toLocaleString()} <span className="text-[9px] text-slate-400 font-normal">{m.unit}</span>
                        </td>
                        <td className="py-3 px-3 font-medium leading-normal text-slate-600">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400">Dari: <span className="font-semibold text-slate-650">{m.source}</span></span>
                            <span>Menuju: <span className="font-semibold text-color text-emerald-750">{m.destination}</span></span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-500 font-medium">
                          {m.operator.replace(' (Warehouse Head)', '')}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 italic">
                      Tidak ada riwayat mutasi bahan yang sesuai filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* REGISTRATION FORM: Column span 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider font-display border-b border-slate-100 pb-3 flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4 text-emerald-555 animate-pulse" />
              Alokasikan Bahan untuk WIP
            </h3>

            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Formulir alokasi pemindahan bahan dari rak Gudang Bahan Baku menuju area perakitan Work-In-Progress (WIP) jahit, cutting, atau finishing.
            </p>

            <form onSubmit={handleCreateMutation} className="space-y-4 text-xs">
              {/* Dropdown Material */}
              <div className="space-y-1">
                <label className="text-slate-500 font-extrabold uppercase text-[9px] tracking-wider block">1. Pilih Bahan Baku / Penunjang</label>
                <select
                  value={selectedMatId}
                  onChange={(e) => setSelectedMatId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs leading-normal font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold"
                >
                  <option value="">-- Pilih Bahan --</option>
                  {materials.map((mat) => (
                    <option key={mat.id} value={mat.id}>
                      {mat.code} - {mat.name} (Stok: {mat.stock} {mat.unit})
                    </option>
                  ))}
                </select>
              </div>

              {/* Dropdown WIP Component */}
              <div className="space-y-1">
                <label className="text-slate-500 font-extrabold uppercase text-[9px] tracking-wider block">2. Alokasikan ke Batch WIP</label>
                <select
                  value={selectedWipId}
                  onChange={(e) => setSelectedWipId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs leading-normal font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-semibold"
                >
                  <option value="">-- Manufaktur Umum / Lepas --</option>
                  {wipComponents.filter(w => w.status === 'WIP').map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.code} - {w.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div className="space-y-1">
                <label className="text-slate-500 font-extrabold uppercase text-[9px] tracking-wider block">3. Jumlah Pemindahan / Volume</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={qtyValue}
                    onChange={(e) => setQtyValue(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <div className="bg-slate-100 border border-slate-200 text-slate-500 font-extrabold font-mono px-3.5 flex items-center justify-center rounded-lg select-none">
                    {selectedMatId ? (materials.find(m => m.id === selectedMatId)?.unit) : 'Unit'}
                  </div>
                </div>
              </div>

              {/* Warnings check */}
              {selectedMatId && (() => {
                const mat = materials.find(m => m.id === selectedMatId);
                if (mat && qtyValue > mat.stock) {
                  return (
                    <div className="bg-rose-50 border border-rose-250 p-2 rounded text-[10px] text-rose-700 font-semibold leading-relaxed flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping"></span>
                      <span>Peringatan: Jumlah melampaui sisa volume rak saat ini!</span>
                    </div>
                  );
                } else if (mat) {
                  return (
                    <div className="bg-slate-50 border border-slate-200 p-2.5 rounded text-[10px] text-slate-500 font-medium leading-relaxed">
                      Sisa stok bahan baku setelah mutasi dialokasikan: <strong className="text-slate-700 font-mono font-bold">{mat.stock - qtyValue} {mat.unit}</strong>.
                    </div>
                  );
                }
                return null;
              })()}

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-white" />
                Registrasi Mutasi Logistik
              </button>
            </form>
          </div>

          <div className="mt-6 p-3 bg-indigo-50 border border-indigo-150 rounded-lg text-[10px] text-indigo-750 leading-relaxed font-medium flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-indigo-650 shrink-0 mt-0.5" />
            <span>Pemberitahuan: Mutasi logistik akan disinkronasikan secara otomatis ke audit log pusat ERP Indotex untuk menjaga rekam jejak akuntansi manufaktur yang transparan.</span>
          </div>
        </div>

      </div>

    </div>
  );
}
