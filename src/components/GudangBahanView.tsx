import React, { useState, useMemo } from 'react';
import { 
  Warehouse, 
  Search, 
  PlusCircle, 
  MinusCircle, 
  PackageOpen, 
  AlertTriangle, 
  ClipboardList, 
  History, 
  TrendingDown, 
  ArrowRight,
  TrendingUp,
  MapPin,
  CheckCircle2,
  LayoutGrid
} from 'lucide-react';
import { ComponentWIP } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export interface RawMaterial {
  id: string;
  code: string;
  name: string;
  type: 'Bahan Baku' | 'Bahan Pembantu';
  pricePerUnit: number;
  unit: string;
  avgUsagePerDay: number;
  stock: number;
  rackLocation: string;
  minStockLevel: number;
  category?: string;
}

interface GudangBahanViewProps {
  materials: RawMaterial[];
  wipComponents: ComponentWIP[];
  onAddMaterial: (mat: any) => void;
  onUpdateMaterialStock: (id: string, newStock: number) => void;
  darkMode?: boolean;
}

interface TransactionRecord {
  id: string;
  date: string;
  materialName: string;
  type: 'IN' | 'OUT' | 'ALLOCATE';
  qty: number;
  unit: string;
  refCode: string; // e.g. PO or WIP reference
  notes: string;
}

export default function GudangBahanView({
  materials,
  wipComponents,
  onAddMaterial,
  onUpdateMaterialStock,
  darkMode = false
}: GudangBahanViewProps) {
  // Theme styling helpers for Recharts
  const gridColor = darkMode ? '#334155' : '#e2e8f0';
  const labelColor = darkMode ? '#cbd5e1' : '#64748b';
  const tooltipBg = darkMode ? '#1e293b' : '#ffffff';
  const tooltipBorder = darkMode ? '#475569' : '#e2e8f0';
  const tooltipText = darkMode ? '#f1f5f9' : '#1e293b';

  const [activeTab, setActiveTab] = useState<'semua' | 'bahan-baku' | 'bahan-pembantu'>('semua');
  const [searchTerm, setSearchTerm] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'adjust' | 'allocate' | 'add'>('adjust');

  // Interactive Recharts Row Selection State
  const [selectedMatIdForChart, setSelectedMatIdForChart] = useState<string | null>(null);

  // New filters for physical position search
  const [selectedRackFilter, setSelectedRackFilter] = useState('semua');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('semua');

  // Adjust Form State
  const [selectedMatId, setSelectedMatId] = useState(materials[0]?.id || '');
  const [adjustQty, setAdjustQty] = useState(100);
  const [adjustType, setAdjustType] = useState<'IN' | 'OUT'>('IN');
  const [adjustNotes, setAdjustNotes] = useState('');

  // Allocate Form State
  const [allocateMatId, setAllocateMatId] = useState(materials[0]?.id || '');
  const [allocateWIPId, setAllocateWIPId] = useState(wipComponents[0]?.id || '');
  const [allocateQty, setAllocateQty] = useState(50);
  const [allocateNotes, setAllocateNotes] = useState('');

  // Add Material Form State
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'Bahan Baku' | 'Bahan Pembantu'>('Bahan Baku');
  const [newCategory, setNewCategory] = useState('Bone Plates & Screws');
  const [newPrice, setNewPrice] = useState(150000);
  const [newUnit, setNewUnit] = useState('Pcs');
  const [newAvgUsage, setNewAvgUsage] = useState(5);
  const [newStartStock, setNewStartStock] = useState(100);
  const [newRackLoc, setNewRackLoc] = useState('Aisle A, Rak 1');
  const [newMinStock, setNewMinStock] = useState(20);

  // Success notifications
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Compact layout state
  const [compactMode, setCompactMode] = useState(false);

  // Local state for stock transaction ledger - medically themed
  const [transactions, setTransactions] = useState<TransactionRecord[]>([
    {
      id: 'tx-1',
      date: '2026-06-13',
      materialName: 'Titanium Rod Alloy Ti-6Al-4V',
      type: 'OUT',
      qty: 15,
      unit: 'Batang',
      refCode: 'DEPT-MACHINING',
      notes: 'Penjatahan rilis pembubutan sekrup & sambungan panggul.'
    },
    {
      id: 'tx-2',
      date: '2026-06-11',
      materialName: 'Suture Thread High-Strength PLLA',
      type: 'IN',
      qty: 100,
      unit: 'Box',
      refCode: 'PO-2026-002',
      notes: 'Penerimaan bahan polimer resorbable steril dari supplier.'
    }
  ]);

  // Dynamic Rack Density calculation for Grid representation
  const getRackDensityInfo = (aisle: string, rakNum: number) => {
    const locString = `Aisle ${aisle}, Rak ${rakNum}`;
    const itemsInRack = materials.filter(m => {
      const rLoc = (m.rackLocation || '').toLowerCase();
      return rLoc.includes(`aisle ${aisle.toLowerCase()}`) && rLoc.includes(`rak ${rakNum}`);
    });
    
    const totalStock = itemsInRack.reduce((sum, m) => sum + (m.stock || 0), 0);
    const uniqueItemsCount = itemsInRack.length;
    
    // Compute max capacity based on 550 units per rack slot
    const maxCapacity = 550;
    const densityPct = Math.min(100, Math.round((totalStock / maxCapacity) * 100));
    
    return {
      location: locString,
      items: itemsInRack,
      totalStock,
      uniqueItemsCount,
      densityPct,
    };
  };

  // Real-time Rack Statistics calculations
  const rackStats = useMemo(() => {
    let occupiedCount = 0;
    let totalDensitySum = 0;
    let maxDensityLoc = 'N/A';
    let maxDensityVal = -1;
    const aisles = ['A', 'B', 'C', 'D', 'E'];
    const rackNumbers = [1, 2, 3, 4, 5];
    
    aisles.forEach(aisle => {
      rackNumbers.forEach(num => {
        const items = materials.filter(m => {
          const rLoc = (m.rackLocation || '').toLowerCase();
          return rLoc.includes(`aisle ${aisle.toLowerCase()}`) && rLoc.includes(`rak ${num}`);
        });
        const totalStock = items.reduce((sum, m) => sum + (m.stock || 0), 0);
        const densityPct = Math.min(100, Math.round((totalStock / 550) * 100));
        
        if (items.length > 0) {
          occupiedCount++;
        }
        totalDensitySum += densityPct;
        if (densityPct > maxDensityVal) {
          maxDensityVal = densityPct;
          maxDensityLoc = `Aisle ${aisle}, Rak ${num}`;
        }
      });
    });
    
    const averageDensity = Math.round(totalDensitySum / 25);
    return {
      occupiedCount,
      averageDensity,
      maxDensityLoc,
      maxDensityVal
    };
  }, [materials]);

  const handleAddMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newCode) return;

    const newMaterial = {
      id: `mat-${Date.now()}`,
      code: newCode.toUpperCase(),
      name: newName,
      type: newType,
      pricePerUnit: newPrice,
      unit: newUnit,
      avgUsagePerDay: newAvgUsage,
      stock: newStartStock,
      rackLocation: newRackLoc,
      minStockLevel: newMinStock,
      category: newCategory
    };

    onAddMaterial(newMaterial);

    const newTx: TransactionRecord = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      materialName: newMaterial.name,
      type: 'IN',
      qty: newStartStock,
      unit: newUnit,
      refCode: 'INBOUND-INVENT',
      notes: `Registrasi material baru & penambahan stok awal.`
    };

    setTransactions([newTx, ...transactions]);
    setSuccessMsg(`Material baru "${newMaterial.name}" berhasil terdaftar secara sistematis.`);
    
    // Reset form
    setNewCode('');
    setNewName('');
    setNewPrice(150000);
    setNewAvgUsage(5);
    setNewStartStock(100);
    setNewMinStock(20);
    setShowForm(false);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  // Calculations for KPIs
  const totalBakuItems = useMemo(() => materials.filter(m => m.type === 'Bahan Baku').length, [materials]);
  const totalPembantuItems = useMemo(() => materials.filter(m => m.type === 'Bahan Pembantu').length, [materials]);
  const totalStockValue = useMemo(() => {
    return materials.reduce((sum, m) => sum + (m.stock * m.pricePerUnit), 0);
  }, [materials]);

  const lowStockItems = useMemo(() => {
    return materials.filter(m => m.stock < m.minStockLevel);
  }, [materials]);

  // Extract unique Rack segments (e.g. "Aisle A", "Aisle B") to assist warehouse assistants
  const rackLocationsOptions = useMemo(() => {
    const locations = new Set<string>();
    materials.forEach(m => {
      if (m.rackLocation) {
        const match = m.rackLocation.match(/Aisle [A-Z]/i);
        if (match) {
          locations.add(match[0]);
        } else {
          locations.add(m.rackLocation.split(',')[0].trim());
        }
      }
    });
    return Array.from(locations).sort();
  }, [materials]);

  // Extract unique Category classifications for medical health implants
  const categoriesOptions = useMemo(() => {
    const list = new Set<string>();
    materials.forEach(m => {
      if (m.category) {
        list.add(m.category);
      }
    });
    return Array.from(list).sort();
  }, [materials]);

  // Combined Advanced Filtering logic
  const filteredMaterials = useMemo(() => {
    return materials.filter(m => {
      const rackLoc = m.rackLocation || '';
      // search
      const matchesSearch = (m.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (m.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            rackLoc.toLowerCase().includes(searchTerm.toLowerCase());
      
      // tab class
      const matchesTab = activeTab === 'semua' || 
                         (activeTab === 'bahan-baku' && m.type === 'Bahan Baku') ||
                         (activeTab === 'bahan-pembantu' && m.type === 'Bahan Pembantu');
      
      // safety warning filter
      const matchesLowStock = !showLowStockOnly || m.stock < (m.minStockLevel || 0);

      // physical rack filter
      const matchesRack = selectedRackFilter === 'semua' || rackLoc.includes(selectedRackFilter);

      // medical category filter
      const matchesCategory = selectedCategoryFilter === 'semua' || m.category === selectedCategoryFilter;

      return matchesSearch && matchesTab && matchesLowStock && matchesRack && matchesCategory;
    });
  }, [materials, searchTerm, activeTab, showLowStockOnly, selectedRackFilter, selectedCategoryFilter]);

  // Helper to generate realistic deterministic historical 7-day trend values around the daily mean
  const get7DaysTrendData = (mat: RawMaterial) => {
    const data = [];
    const baseUsage = mat.avgUsagePerDay || 15;
    for (let i = 6; i >= 0; i--) {
      const d = new Date("2026-06-14T04:29:13");
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getDate()} ${d.toLocaleDateString('id-ID', { month: 'short' })}`;
      const hash = mat.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const noise = Math.sin(i + hash) * 0.35 + Math.cos(i - hash) * 0.15; // smooth waves
      const usageVal = Math.max(0, Math.round(baseUsage * (1 + noise)));
      data.push({
        date: dateStr,
        usage: usageVal
      });
    }
    return data;
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  const handleAdjustStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const material = materials.find(m => m.id === selectedMatId);
    if (!material) return;

    const multiplier = adjustType === 'IN' ? 1 : -1;
    const finalQty = adjustQty * multiplier;
    const nextStock = Math.max(0, material.stock + finalQty);

    onUpdateMaterialStock(material.id, nextStock);

    const newTx: TransactionRecord = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      materialName: material.name,
      type: adjustType,
      qty: adjustQty,
      unit: material.unit,
      refCode: 'ADJUSTMENT',
      notes: adjustNotes || `Penyesuaian manual stok ${adjustType === 'IN' ? 'Barang Masuk' : 'Barang Keluar'}`
    };

    setTransactions([newTx, ...transactions]);
    setSuccessMsg(`Stok ${material.name} berhasil disesuaikan ke ${nextStock} ${material.unit}.`);
    setAdjustNotes('');
    setShowForm(false);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const handleAllocateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const material = materials.find(m => m.id === allocateMatId);
    if (!material) return;

    const wip = wipComponents.find(w => w.id === allocateWIPId);
    const refCode = wip ? wip.code : 'WIP-RELEASE';

    const nextStock = Math.max(0, material.stock - allocateQty);
    onUpdateMaterialStock(material.id, nextStock);

    const newTx: TransactionRecord = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      materialName: material.name,
      type: 'ALLOCATE',
      qty: allocateQty,
      unit: material.unit,
      refCode: refCode,
      notes: allocateNotes || `Dialokasikan untuk pengerjaan batch produksi ${wip ? wip.name : 'Component'}`
    };

    setTransactions([newTx, ...transactions]);
    setSuccessMsg(`Berhasil merilis ${allocateQty} ${material.unit} "${material.name}" untuk produksi ${refCode}.`);
    setAllocateNotes('');
    setShowForm(false);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  return (
    <div id="gudang_bahan_real_root" className="space-y-6">
      {/* 1. Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 font-display">
            <Warehouse className="w-5 h-5 text-indigo-500" />
            Gudang Bahan Baku &amp; Bahan Penunjang (Supporting Materials)
          </h2>
          <p className="text-xs text-slate-500">
            Arsip terpadu kuantitas stok batang titanium, implant bioceramics powder, dan resin PEEK fisis untuk manufaktur implan kesehatan fisis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start">
          <button
            onClick={() => { 
              if (showForm && formType === 'add') {
                setShowForm(false);
              } else {
                setShowForm(true);
                setFormType('add');
              }
            }}
            className="bg-sky-600 hover:bg-sky-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Tambah Material Baru
          </button>

          <button
            onClick={() => { 
              if (showForm && formType === 'adjust') {
                setShowForm(false);
              } else {
                setShowForm(true);
                setFormType('adjust');
              }
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Sesuaikan Stok
          </button>
          
          <button
            onClick={() => { 
              if (showForm && formType === 'allocate') {
                setShowForm(false);
              } else {
                setShowForm(true);
                setFormType('allocate');
              }
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
          >
            <ArrowRight className="w-4 h-4" />
            Alokasikan Produksi
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 px-4 py-3 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 2. Form Section */}
      {showForm && (
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-md space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest">
              {formType === 'add' ? 'Formulir Registrasi / Tambah Material Baru' : formType === 'adjust' ? 'Formulir Penyesuaian / Transaksi Stok Manual' : 'Penjatahan / Alokasi Bahan ke Mesin Produksi (WIP)'}
            </h3>
            <button 
              onClick={() => setShowForm(false)} 
              className="text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              Tutup [x]
            </button>
          </div>

          {formType === 'add' ? (
            <form onSubmit={handleAddMaterialSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Kode SKU (Contoh: BB-TIT-02)</label>
                <input
                  type="text"
                  required
                  placeholder="BB-TIT-02"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-850 focus:outline-none focus:border-sky-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Nama Material</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Titanium Sheet Ti-6Al-4V Eli"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-850 focus:outline-none focus:border-sky-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Klasifikasi Tipe</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-850 focus:outline-none focus:border-sky-500 font-bold"
                >
                  <option value="Bahan Baku">Bahan Baku (BB)</option>
                  <option value="Bahan Pembantu">Bahan Penunjang / Pembantu (BP)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Kategori Implan</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Bone Plates & Screws"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-850 focus:outline-none focus:border-sky-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Harga per Unit (Rp)</label>
                <input
                  type="number"
                  required
                  value={newPrice}
                  onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-850 focus:outline-none focus:border-sky-500 font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Satuan Ukuran</label>
                <input
                  type="text"
                  required
                  placeholder="Batang, Gram, Pcs, Box, dst."
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-850 focus:outline-none focus:border-sky-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Rata-rata Guna / Hari</label>
                <input
                  type="number"
                  required
                  value={newAvgUsage}
                  onChange={(e) => setNewAvgUsage(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-850 focus:outline-none focus:border-sky-500 font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Stok Awal Fisis</label>
                <input
                  type="number"
                  required
                  value={newStartStock}
                  onChange={(e) => setNewStartStock(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-850 focus:outline-none focus:border-sky-500 font-mono font-bold text-indigo-650"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Lokasi Rak Penempatan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Aisle A, Rak 1"
                  value={newRackLoc}
                  onChange={(e) => setNewRackLoc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-850 focus:outline-none focus:border-sky-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Ambang Batas Minimum (Safety)</label>
                <input
                  type="number"
                  required
                  value={newMinStock}
                  onChange={(e) => setNewMinStock(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-850 focus:outline-none focus:border-sky-500 font-mono font-semibold"
                />
              </div>

              <div className="md:col-span-4 flex justify-end space-x-2 pt-1 border-t border-slate-100 mt-2">
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold cursor-pointer"
                >
                  Daftarkan Material Baru
                </button>
              </div>
            </form>
          ) : formType === 'adjust' ? (
            <form onSubmit={handleAdjustStockSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Pilih Material</label>
                <select
                  value={selectedMatId}
                  onChange={(e) => setSelectedMatId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-850 focus:outline-none focus:border-indigo-500 font-medium"
                >
                  {materials.map(m => (
                    <option key={m.id} value={m.id}>[{m.code}] {m.name} - Stok: {m.stock} {m.unit}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Aksi Mutasi</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-850 focus:outline-none focus:border-indigo-500 font-bold"
                >
                  <option value="IN">BARANG MASUK (Stok Tambah)</option>
                  <option value="OUT">BARANG KELUAR (Stok Kurang)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Jumlah Volume</label>
                <input
                  type="number"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-mono font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Catatan</label>
                <input
                  type="text"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="Keterangan opname/kerusakan..."
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="md:col-span-4 flex justify-end space-x-2 pt-1 border-t border-slate-100 mt-2">
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
                >
                  Simpan Perubahan Stok
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleAllocateSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Bahan yang Dirilis</label>
                <select
                  value={allocateMatId}
                  onChange={(e) => setAllocateMatId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-850 focus:outline-none focus:border-emerald-500 font-medium"
                >
                  {materials.map(m => (
                    <option key={m.id} value={m.id}>[{m.code}] {m.name} - Stok: {m.stock} {m.unit}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Untuk WIP Batch</label>
                <select
                  value={allocateWIPId}
                  onChange={(e) => setAllocateWIPId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-850 focus:outline-none focus:border-emerald-500 font-medium"
                >
                  {wipComponents.map(w => (
                    <option key={w.id} value={w.id}>[{w.code}] {w.name} - ({w.currentProcess} - {w.quantity} Pcs)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Batas Rilis Kuantitas</label>
                <input
                  type="number"
                  required
                  value={allocateQty}
                  onChange={(e) => setAllocateQty(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Alasan Penjatahan</label>
                <input
                  type="text"
                  value={allocateNotes}
                  onChange={(e) => setAllocateNotes(e.target.value)}
                  placeholder="Produksi Bone Plate, Coating Screw, etc..."
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="md:col-span-4 flex justify-end space-x-2 pt-1 border-t border-slate-100 mt-2">
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                >
                  Rilis Logistik ke Produksi
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* 3. KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl flex items-center justify-between shadow-xs border transition-colors duration-200 ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Bahan Baku (Raw)</span>
            <p className={`text-xl font-bold font-display ${darkMode ? 'text-white' : 'text-slate-800'}`}>{totalBakuItems} <span className="text-xs text-slate-400 font-normal">Kategori</span></p>
          </div>
          <span className={`p-2 rounded-lg ${darkMode ? 'bg-blue-950/40 text-blue-405 border border-blue-900/30' : 'bg-blue-50 text-blue-600'}`}><ClipboardList className="w-4 h-4" /></span>
        </div>

        <div className={`p-4 rounded-xl flex items-center justify-between shadow-xs border transition-colors duration-200 ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Bahan Penunjang</span>
            <p className={`text-xl font-bold font-display ${darkMode ? 'text-white' : 'text-slate-800'}`}>{totalPembantuItems} <span className="text-xs text-slate-400 font-normal">Kategori</span></p>
          </div>
          <span className={`p-2 rounded-lg ${darkMode ? 'bg-amber-950/40 text-amber-400 border border-amber-900/30' : 'bg-amber-50 text-amber-600'}`}><PackageOpen className="w-4 h-4" /></span>
        </div>

        <div className={`p-4 rounded-xl flex items-center justify-between shadow-xs border transition-colors duration-200 ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Nilai Aset Gudang</span>
            <p className={`text-sm font-extrabold font-mono ${darkMode ? 'text-indigo-400' : 'text-indigo-650'}`}>{formatRupiah(totalStockValue)}</p>
          </div>
          <span className={`p-2 rounded-lg ${darkMode ? 'bg-indigo-950/40 text-indigo-400 border border-indigo-900/30' : 'bg-indigo-50 text-indigo-650'}`}><TrendingUp className="w-4 h-4" /></span>
        </div>

        <div className={`p-4 rounded-xl flex items-center justify-between shadow-xs border transition-colors duration-200 ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Kritis (At Log-out Threshold)</span>
            <p className="text-xl font-bold text-rose-600 font-display">{lowStockItems.length} <span className="text-xs text-slate-400 font-normal">Bahan</span></p>
          </div>
          <span className={`p-2 rounded-lg ${lowStockItems.length > 0 ? 'bg-rose-50 text-rose-600 animate-pulse' : (darkMode ? 'bg-slate-850 text-slate-500 border border-slate-800' : 'bg-slate-100 text-slate-400')}`}>
            <AlertTriangle className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* 3.1. VISUAL WAREHOUSE SPATIAL RACK GRID MAP */}
      <div className={`border rounded-xl p-5 shadow-sm space-y-4 transition-colors duration-200 ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-3.5 border-slate-100 dark:border-slate-800/60">
          <div className="space-y-1">
            <h3 className={`text-xs font-black uppercase tracking-wider font-display flex items-center gap-2 ${
              darkMode ? 'text-indigo-400' : 'text-indigo-750'
            }`}>
              <Warehouse className="w-4.5 h-4.5" />
              Peta Lokasi Rak &amp; Densitas Penyimpanan (Visual Grid)
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Representasi tata letak fisik gudang. Klik pada sel rak mana pun untuk mengisolasi material di area tersebut secara instan.
            </p>
          </div>
          
          {/* Active selection helper */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {selectedRackFilter !== 'semua' ? (
              <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/40 text-indigo-750 dark:text-indigo-300 px-3 py-1.5 rounded-lg font-bold">
                <span className="text-[11px]">📍 Terpilih: {selectedRackFilter}</span>
                <button 
                  onClick={() => setSelectedRackFilter('semua')}
                  className="font-black text-[9px] hover:text-indigo-900 dark:hover:text-white transition-colors cursor-pointer bg-indigo-200/50 dark:bg-indigo-900/50 px-1.5 py-0.5 rounded ml-1"
                >
                  Reset
                </button>
              </div>
            ) : (
              <span className="text-slate-400 dark:text-slate-500 italic text-[11px] font-medium">
                💡 Klik sel rak untuk memfilter database.
              </span>
            )}
          </div>
        </div>

        {/* Spatial Warehouse Board & Dashboard Metrics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Spatial Grid Layout Card (3/4 of row) */}
          <div className="lg:col-span-3 space-y-4 select-none">
            {/* Column labels indicators */}
            <div className="grid grid-cols-6 items-center text-center">
              <span className="text-[10px] font-mono font-extrabold uppercase text-slate-400 dark:text-slate-600 text-left pl-2">Aisle / Lorong</span>
              {[1, 2, 3, 4, 5].map((col) => (
                <span key={col} className="text-[10px] font-bold uppercase tracking-wider text-slate-505 dark:text-slate-400 font-sans">
                  Rak {col}
                </span>
              ))}
            </div>

            {/* Grid rows */}
            <div className="space-y-2.5">
              {['A', 'B', 'C', 'D', 'E'].map((aisle) => {
                return (
                  <div key={aisle} className="grid grid-cols-6 items-center">
                    {/* Row Header Label */}
                    <div className="flex items-center space-x-2 text-left pl-2 shrink-0">
                      <span className="w-2.5 h-2.5 rounded bg-indigo-550 block"></span>
                      <span className="text-xs font-black font-mono tracking-tight text-slate-700 dark:text-slate-300">
                        Aisle {aisle}
                      </span>
                    </div>

                    {/* Columns representing racks */}
                    {[1, 2, 3, 4, 5].map((rackNum) => {
                      const shelf = getRackDensityInfo(aisle, rackNum);
                      const isSelected = selectedRackFilter === `${aisle}, Rak ${rackNum}` || 
                                          selectedRackFilter === `Aisle ${aisle}, Rak ${rackNum}` ||
                                          selectedRackFilter.toLowerCase() === `aisle ${aisle.toLowerCase()}, rak ${rackNum}`;

                      // Color based on density
                      let cellClass = '';
                      let labelClass = '';
                      let badgeClass = '';
                      
                      if (shelf.densityPct === 0) {
                        cellClass = darkMode 
                          ? 'bg-slate-800/40 border-slate-800/60 hover:border-slate-700 text-slate-600' 
                          : 'bg-slate-50 border-slate-100 hover:border-slate-200 text-slate-400';
                        labelClass = 'text-slate-400 dark:text-slate-600';
                        badgeClass = 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500';
                      } else if (shelf.densityPct <= 25) {
                        cellClass = darkMode
                          ? 'bg-emerald-955/10 border-emerald-900/30 hover:border-emerald-800 text-emerald-400 hover:bg-emerald-950/20'
                          : 'bg-emerald-50/50 border-emerald-150 hover:border-emerald-300 text-emerald-800 hover:bg-emerald-50';
                        labelClass = 'text-emerald-800 dark:text-emerald-400';
                        badgeClass = 'bg-emerald-100/60 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300';
                      } else if (shelf.densityPct <= 75) {
                        cellClass = darkMode
                          ? 'bg-indigo-950/15 border-indigo-900/30 hover:border-indigo-800 text-indigo-400 hover:bg-indigo-950/30'
                          : 'bg-indigo-50/50 border-indigo-150 hover:border-indigo-250 text-indigo-800 hover:bg-indigo-50';
                        labelClass = 'text-indigo-805 dark:text-indigo-405';
                        badgeClass = 'bg-indigo-100/60 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300';
                      } else {
                        cellClass = darkMode
                          ? 'bg-amber-955/15 border-amber-900/30 hover:border-amber-800 text-amber-400 hover:bg-amber-950/30'
                          : 'bg-amber-50/50 border-amber-150 hover:border-amber-250 text-amber-800 hover:bg-amber-50';
                        labelClass = 'text-amber-800 dark:text-amber-400';
                        badgeClass = 'bg-amber-100/60 dark:bg-amber-900/30 text-amber-750 dark:text-amber-300';
                      }

                      // Selected override styling
                      const borderStyling = isSelected 
                        ? 'ring-2 ring-indigo-500 scale-[1.03] shadow-md border-indigo-500/85 dark:border-indigo-400' 
                        : 'border';

                      return (
                        <div
                          key={rackNum}
                          onClick={() => {
                            const matchStr = `Aisle ${aisle}, Rak ${rackNum}`;
                            if (selectedRackFilter === matchStr) {
                              setSelectedRackFilter('semua');
                            } else {
                              setSelectedRackFilter(matchStr);
                            }
                            setSelectedMatIdForChart(null);
                          }}
                          title={`Lorong ${aisle}, Rak ${rackNum}\nDensitas: ${shelf.densityPct}%\nItems: ${shelf.uniqueItemsCount}\nTotal Stock: ${shelf.totalStock} unit\n\nMaterialStored: ${shelf.items.length > 0 ? shelf.items.map(i => `${i.code} (${i.stock} ${i.unit})`).join(', ') : 'Tidak ada'}`}
                          className={`mx-1 p-2 md:p-3 rounded-lg text-center cursor-pointer transition-all ${cellClass} ${borderStyling}`}
                        >
                          <div className="flex flex-col justify-between h-full space-y-1.5">
                            <span className={`text-[10px] font-extrabold font-mono tracking-wider ${labelClass}`}>
                              {aisle}-{rackNum}
                            </span>
                            
                            {/* Fill indicator visual */}
                            <div className="w-full bg-slate-200/60 dark:bg-slate-800 h-1 rounded-full overflow-hidden shrink-0">
                              <div 
                                className={`h-full rounded-full transition-all duration-305 ${
                                  shelf.densityPct === 0 ? 'bg-transparent' :
                                  shelf.densityPct <= 25 ? 'bg-emerald-500' :
                                  shelf.densityPct <= 75 ? 'bg-indigo-500' : 'bg-amber-500'
                                }`}
                                style={{ width: `${shelf.densityPct}%` }}
                              />
                            </div>

                            {/* Stock quantities info */}
                            <div className="flex items-center justify-between text-[9px] shrink-0 pt-0.5">
                              <span className={`px-1 rounded scale-90 ${badgeClass} font-bold text-[8px]`}>
                                {shelf.uniqueItemsCount} item
                              </span>
                              <span className="font-mono text-[9.5px] text-slate-600 dark:text-slate-400 font-extrabold max-h-3">
                                {shelf.totalStock > 0 ? `${shelf.totalStock}` : '-'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Spatial Map Legend and Stats Card (1/4 of row) */}
          <div className="space-y-4">
            <div className={`p-4 rounded-xl space-y-3 border transition-colors duration-200 ${
              darkMode ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              <span className="block text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase">
                Metrik Ruang Gudang
              </span>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-550 dark:text-slate-400 font-normal">Slot Terisi:</span>
                  <span className="font-mono font-black">{rackStats.occupiedCount} / 25 Slot</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-550 dark:text-slate-400 font-normal">Rata-rata Densitas:</span>
                  <span className="font-mono font-black">{rackStats.averageDensity}%</span>
                </div>
                <div className="space-y-0.5 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 dark:text-slate-550 block">Densitas Tertinggi:</span>
                  <div className="flex justify-between items-center">
                    <span className="font-bold underline text-indigo-600 dark:text-indigo-400">{rackStats.maxDensityLoc}</span>
                    <span className="font-mono font-black text-amber-500">{rackStats.maxDensityVal}%</span>
                  </div>
                </div>
              </div>

              {/* Color legends helper */}
              <div className="pt-2.5 border-t border-slate-200/65 dark:border-slate-800 space-y-1.5">
                <span className="block text-[9px] font-mono uppercase font-black text-slate-450 dark:text-slate-500">
                  Panduan Kode Warna
                </span>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-slate-200 dark:bg-slate-800 block shrink-0" />
                    <span className="text-slate-505 dark:text-slate-400">Kosong (0%)</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500 block shrink-0" />
                    <span className="text-slate-505 dark:text-slate-400">Rendah (&lt;25%)</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-indigo-500 block shrink-0" />
                    <span className="text-slate-550 dark:text-slate-400">Sedang (25-75%)</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-amber-500 block shrink-0" />
                    <span className="text-slate-550 dark:text-slate-400">Tinggi (&gt;75%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Helper Banner */}
            <div className="bg-blue-50/60 dark:bg-blue-950/10 border border-blue-150 dark:border-blue-900/20 rounded-xl p-3 text-[10px] leading-relaxed text-blue-850 dark:text-blue-300">
              💡 <span className="font-bold">Interaksi Spasial:</span> Sel-sel di atas sinkron dengan dropdown filter di bawah. Memilih sel akan memperbarui daftar tabel material secara otomatis!
            </div>
          </div>
        </div>
      </div>

      {/* 4. Controls, Filter & Search Tabs */}
      <div className={`border rounded-xl p-5 shadow-sm space-y-4 transition-colors duration-200 ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div className="flex items-center space-x-2.5 overflow-x-auto pb-1 xl:pb-0">
            {[
              { id: 'semua', label: 'Semua Stok' },
              { id: 'bahan-baku', label: 'Bahan Baku (BB)' },
              { id: 'bahan-pembantu', label: 'Bahan Penunjang / Pembantu (BP)' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSelectedMatIdForChart(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  activeTab === tab.id 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Rak Lokasi Selector */}
            <div className="flex items-center space-x-1 border border-slate-200 px-2.5 py-1.5 rounded-lg bg-slate-50 text-xs text-slate-700">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] mr-1">LOKASI RAK:</span>
              <select
                value={selectedRackFilter}
                onChange={(e) => {
                  setSelectedRackFilter(e.target.value);
                  setSelectedMatIdForChart(null);
                }}
                className="bg-transparent border-none text-slate-805 font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value="semua">Semua Lokasi</option>
                {rackLocationsOptions.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Filter Kategori Bahan Selector */}
            <div className="flex items-center space-x-1 border border-slate-200 px-2.5 py-1.5 rounded-lg bg-slate-50 text-xs text-slate-700">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] mr-1">KATEGORI IMPLAN:</span>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => {
                  setSelectedCategoryFilter(e.target.value);
                  setSelectedMatIdForChart(null);
                }}
                className="bg-transparent border-none text-slate-805 font-bold focus:outline-none cursor-pointer text-xs max-w-[130px] truncate"
              >
                <option value="semua">Semua Kategori</option>
                {categoriesOptions.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Mode Kompak Switch */}
            <button
              onClick={() => setCompactMode(!compactMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                compactMode 
                  ? 'bg-slate-800 text-white shadow-sm' 
                  : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Mode Kompak: {compactMode ? 'Aktif' : 'Non-aktif'}</span>
            </button>

            {/* Warning Alarm Toggle button */}
            <button
              onClick={() => {
                setShowLowStockOnly(!showLowStockOnly);
                setSelectedMatIdForChart(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                showLowStockOnly 
                  ? 'bg-rose-600 text-white shadow-xs' 
                  : 'bg-slate-50 text-rose-600 border border-rose-200 hover:bg-rose-50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Stok Kritis ({lowStockItems.length})</span>
            </button>

            {/* Search Input */}
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg w-full sm:max-w-xs text-xs">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSelectedMatIdForChart(null);
                }}
                placeholder="Cari kode, nama, lokasi..."
                className="bg-transparent border-none text-slate-700 placeholder-slate-400 focus:outline-none w-full font-medium"
              />
            </div>
          </div>
        </div>

        {/* 5. Inventory Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <th className={`${compactMode ? "py-1.5 px-3" : "py-2.5 px-4"}`}>Kode SKU</th>
                <th className={`${compactMode ? "py-1.5 px-3" : "py-2.5 px-4"}`}>Nama Implan &amp; Spesifikasi</th>
                <th className={`${compactMode ? "py-1.5 px-3" : "py-2.5 px-4"}`}>Klasifikasi</th>
                <th className={`${compactMode ? "py-1.5 px-3" : "py-2.5 px-4"}`}><span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Lokasi Rak</span></th>
                <th className={`${compactMode ? "py-1.5 px-3" : "py-2.5 px-4"} text-right`}>Volume Stok</th>
                <th className={`${compactMode ? "py-1.5 px-3" : "py-2.5 px-4"} text-center`}>Batas Kritis Minimum</th>
                <th className={`${compactMode ? "py-1.5 px-3" : "py-2.5 px-4"} text-right`}>Nilai Satuan</th>
                <th className={`${compactMode ? "py-1.5 px-3" : "py-2.5 px-4"} text-center`}>Status Keamanan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMaterials.length > 0 ? (
                filteredMaterials.map((mat) => {
                  const isLow = mat.stock < mat.minStockLevel;
                  const isChartSelected = selectedMatIdForChart === mat.id;
                  return (
                    <React.Fragment key={mat.id}>
                      <tr 
                        onClick={() => setSelectedMatIdForChart(isChartSelected ? null : mat.id)}
                        className={`hover:bg-indigo-50/25 text-slate-700 transition-colors cursor-pointer ${isLow ? 'bg-rose-50/15' : ''} ${isChartSelected ? 'bg-indigo-50/40 border-l-2 border-indigo-600' : ''}`}
                        title="Klik untuk tampilkan tren historis konsumsi 7 hari terakhir"
                      >
                        <td className={`${compactMode ? "py-1 px-3 text-[11px] font-mono font-bold" : "py-3 px-4 font-mono font-bold"} text-indigo-600`}>
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] text-slate-300">▶</span>
                            <span>{mat.code}</span>
                          </div>
                        </td>
                        <td className={`${compactMode ? "py-1 px-3 text-[11px]" : "py-3 px-4"}`}>
                          <div className="flex items-center gap-1.5">
                            <span className={`font-bold text-slate-800 font-display block ${compactMode ? 'text-[11px] leading-tight' : ''}`}>{mat.name}</span>
                            {mat.category && (
                              <span className="text-[8px] bg-slate-100 text-slate-600 px-1 py-0.5 rounded font-mono font-bold uppercase tracking-wider">{mat.category}</span>
                            )}
                          </div>
                          {!compactMode && <span className="text-[10px] text-slate-400 font-medium font-sans">Kebutuhan rata-rata: {mat.avgUsagePerDay} {mat.unit}/hari · <span className="text-indigo-600 hover:underline">Klik untuk grafik tren</span></span>}
                        </td>
                        <td className={`${compactMode ? "py-1 px-3 text-[10px]" : "py-3 px-4"}`}>
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                            mat.type === 'Bahan Baku' 
                              ? 'bg-blue-50 text-blue-700 border-blue-200' 
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {mat.type}
                          </span>
                        </td>
                        <td className={`${compactMode ? "py-1 px-3 text-[10px]" : "py-3 px-4"} font-semibold text-slate-600 font-mono text-[11px]`}>{mat.rackLocation}</td>
                        <td className={`${compactMode ? "py-1 px-3 text-[11px]" : "py-3 px-4"} text-right font-extrabold text-slate-800`}>
                          <span className={isLow ? "text-rose-650 font-black font-mono animate-pulse" : "text-slate-800 font-mono"}>
                            {mat.stock}
                          </span>
                          <span className="text-slate-400 font-normal ml-1 text-[10px]">{mat.unit}</span>
                        </td>
                        <td className={`${compactMode ? "py-1 px-3 text-[11px]" : "py-3 px-4"} text-center font-mono text-slate-500 font-bold`}>{mat.minStockLevel} {mat.unit}</td>
                        <td className={`${compactMode ? "py-1 px-3 text-[11px]" : "py-3 px-4"} text-right font-mono font-semibold text-slate-600`}>{formatRupiah(mat.pricePerUnit)}</td>
                        <td className={`${compactMode ? "py-1 px-3 text-center" : "py-3 px-4 text-center"}`}>
                          {isLow ? (
                            <span className="inline-block bg-rose-100 text-rose-700 border border-rose-300 font-bold px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider animate-pulse">
                              ⚠️ Stok Kritis
                            </span>
                          ) : (
                            <span className="inline-block bg-green-50 text-green-700 border border-green-200 font-bold px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider">
                              ✓ Memadai
                            </span>
                          )}
                        </td>
                      </tr>

                      {/* Expanding Recharts Row holding 7 days trend consumption graph */}
                      {isChartSelected && (
                        <tr className="bg-slate-50/75 border-l-2 border-indigo-600">
                          <td colSpan={8} className="p-4">
                            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4 shadow-sm animate-fade-in">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-2">
                                <div className="flex items-center gap-2">
                                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <History className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                      Analisis Tren Konsumsi 7 Hari Terakhir: <span className="text-indigo-650">{mat.name}</span>
                                    </h4>
                                    <p className="text-[10px] text-slate-400">Arsip fluktuasi mutasi pemakaian bahan baku untuk perakitan sistem pen implan</p>
                                  </div>
                                </div>

                                <div className="text-right mt-1.5 sm:mt-0 font-mono text-[10px] text-slate-550">
                                  Rata-rata/hari: <span className="font-bold text-indigo-600">{mat.avgUsagePerDay} {mat.unit}</span> · 
                                  Total Nilai Stok: <span className="font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{formatRupiah(mat.stock * mat.pricePerUnit)}</span>
                                </div>
                              </div>

                              <div className="h-48 w-full pt-2">
                                <ResponsiveContainer width="100%" height="100%">
                                  <AreaChart 
                                    data={get7DaysTrendData(mat)} 
                                    margin={{ top: 10, right: 15, left: -15, bottom: 5 }}
                                  >
                                    <defs>
                                      <linearGradient id={`usageGrad-${mat.id}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.01}/>
                                      </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                                    <XAxis 
                                      dataKey="date" 
                                      tick={{ fontSize: 9, fill: labelColor, fontWeight: 'bold' }} 
                                      axisLine={false} 
                                      tickLine={false} 
                                    />
                                    <YAxis 
                                      tick={{ fontSize: 9, fill: labelColor }} 
                                      axisLine={false} 
                                      tickLine={false} 
                                    />
                                    <Tooltip 
                                      contentStyle={{ 
                                        borderRadius: '8px', 
                                        border: `1px solid ${tooltipBorder}`, 
                                        backgroundColor: tooltipBg,
                                        color: tooltipText,
                                        fontSize: '11px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
                                      }} 
                                      labelStyle={{ fontWeight: 'bold', color: tooltipText }} 
                                    />
                                    <Area 
                                      type="monotone" 
                                      dataKey="usage" 
                                      name="Volume Penggunaan" 
                                      stroke="#4f46e5" 
                                      strokeWidth={2.5} 
                                      fill={`url(#usageGrad-${mat.id})`} 
                                      dot={{ r: 3, stroke: '#4f46e5', strokeWidth: 1.5, fill: '#ffffff' }}
                                      activeDot={{ r: 5, stroke: '#4f46e5', strokeWidth: 2, fill: '#ffffff' }}
                                    />
                                  </AreaChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-semibold text-xs">
                    Tidak ada material yang terdaftar atau sesuai filter pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Transaction Activity ledger history log */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-slate-100">
          <History className="w-4.5 h-4.5 text-indigo-500" />
          Log Transaksi Logistik Gudang Bahan Terkini
        </h3>
        
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-2.5 px-4 font-mono">ID Log</th>
                <th className="py-2.5 px-4">Tanggal</th>
                <th className="py-2.5 px-4">Bahan Pengenal</th>
                <th className="py-2.5 px-4 text-center">Tipe Transaksi</th>
                <th className="py-2.5 px-4 text-right">Volume</th>
                <th className="py-2.5 px-4">Referensi Dokumen</th>
                <th className="py-2.5 px-4">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/50 text-slate-700">
                  <td className="py-2.5 px-4 font-mono text-[10px] text-slate-400 font-medium">{tx.id}</td>
                  <td className="py-2.5 px-4 font-mono text-slate-500">{tx.date}</td>
                  <td className="py-2.5 px-4 font-bold text-slate-800 font-display">{tx.materialName}</td>
                  <td className="py-2.5 px-4 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-bold uppercase border ${
                      tx.type === 'IN' ? 'bg-green-50 text-green-700 border-green-200' :
                      tx.type === 'OUT' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-indigo-50 text-indigo-750 border-indigo-200'
                    }`}>
                      {tx.type === 'IN' ? 'Barang Masuk' : tx.type === 'OUT' ? 'Barang Keluar' : 'Alokasi WIP'}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-indigo-650">{tx.qty} {tx.unit}</td>
                  <td className="py-2.5 px-4 font-mono font-semibold text-slate-600 text-[10px]">{tx.refCode}</td>
                  <td className="py-2.5 px-4 text-slate-500 italic max-w-xs truncate" title={tx.notes}>{tx.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
