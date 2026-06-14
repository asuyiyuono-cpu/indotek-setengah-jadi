import React, { useState } from 'react';
import { Package, Search, Plus, Trash2, Edit3, HelpCircle } from 'lucide-react';

interface Material {
  id: string;
  code: string;
  name: string;
  type: 'Bahan Baku' | 'Bahan Pembantu';
  pricePerUnit: number;
  unit: string;
  avgUsagePerDay: number;
}

interface MasterPembelianViewProps {
  materials: Material[];
  onAddMaterial: (mat: Material) => void;
  onDeleteMaterial: (id: string) => void;
  onUpdateAvgUsage: (id: string, usage: number) => void;
}

export default function MasterPembelianView({
  materials,
  onAddMaterial,
  onDeleteMaterial,
  onUpdateAvgUsage
}: MasterPembelianViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // New Material form state
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'Bahan Baku' | 'Bahan Pembantu'>('Bahan Baku');
  const [newPrice, setNewPrice] = useState(5000);
  const [newUnit, setNewUnit] = useState('Kg');
  const [newUsage, setNewUsage] = useState(150);

  const filteredMaterials = materials.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName) return;

    onAddMaterial({
      id: `mat-${Date.now()}`,
      code: newCode,
      name: newName,
      type: newType,
      pricePerUnit: newPrice,
      unit: newUnit,
      avgUsagePerDay: newUsage
    });

    setNewCode('');
    setNewName('');
    setNewPrice(5000);
    setNewUnit('Kg');
    setNewUsage(150);
    setShowAddForm(false);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  return (
    <div id="master_pembelian_container" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 font-display">
            <Package className="w-5 h-5 text-indigo-500" />
            Master Pembelian &amp; Bahan Baku
          </h2>
          <p className="text-xs text-slate-500">Kelola katalog spesifikasi titanium fisis, bioceramics, polymer PEEK steril, serta rata-rata penggunaan fisis industri implan.</p>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 self-start cursor-pointer transition-colors shadow-sm shadow-indigo-600/10"
        >
          <Plus className="w-4 h-4" />
          Katalog Baru
        </button>
      </div>

      {/* Add New Material Form Modal/Collapse */}
      {showAddForm && (
        <div className="bg-white border border-slate-300 rounded-xl p-6 space-y-4 shadow-md">
          <h3 className="text-xs font-bold text-slate-705 uppercase tracking-widest border-b border-slate-100 pb-2">Tambah Katalog Bahan</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Kode Bahan</label>
              <input
                type="text"
                required
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                placeholder="CONTOH: BB-MKL-5"
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-mono font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Nama Bahan</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nama Bahan Baku / Bahan Pembantu..."
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Kategori Tipe</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="Bahan Baku">Bahan Baku (BB)</option>
                <option value="Bahan Pembantu">Bahan Pembantu (BP)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Satuan Ukur</label>
              <input
                type="text"
                required
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                placeholder="Kg, Roll, Pcs, Mtr..."
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-mono font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Perkiraan Harga beli / Satuan (Rp)</label>
              <input
                type="number"
                required
                value={newPrice}
                onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-mono font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Rata-rata Penggunaan/Hari (Satuan)</label>
              <input
                type="number"
                required
                value={newUsage}
                onChange={(e) => setNewUsage(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-mono font-medium"
              />
            </div>
            <div className="md:col-span-3 flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-650 text-xs font-bold cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm shadow-indigo-600/10"
              >
                Simpan Bahan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Table with Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg max-w-md focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari kode atau nama bahan..."
            className="bg-transparent border-none text-xs text-slate-700 placeholder-slate-400 focus:outline-none w-full font-medium"
          />
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-2.5 px-4 font-mono">Kode</th>
                <th className="py-2.5 px-4">Nama Barang</th>
                <th className="py-2.5 px-4">Tipe</th>
                <th className="py-2.5 px-4 text-right">Harga Beli Rata-Rata</th>
                <th className="py-2.5 px-4 text-center">Rata-Rata Penggunaan / Hari</th>
                <th className="py-2.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMaterials.length > 0 ? (
                filteredMaterials.map((mat) => (
                  <tr key={mat.id} className="hover:bg-slate-50/75 text-slate-700 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{mat.code}</td>
                    <td className="py-3 px-4 text-slate-800 font-bold font-display">{mat.name}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-bold border ${
                        mat.type === 'Bahan Baku' 
                          ? 'bg-blue-50 text-blue-700 border-blue-200' 
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {mat.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-700">{formatRupiah(mat.pricePerUnit)} <span className="text-[10px] text-slate-400">/{mat.unit}</span></td>
                    <td className="py-3 px-4 text-center font-bold">
                      <div className="flex items-center justify-center space-x-2">
                        <input
                          type="number"
                          value={mat.avgUsagePerDay}
                          onChange={(e) => onUpdateAvgUsage(mat.id, parseFloat(e.target.value) || 0)}
                          className="w-20 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-center text-xs text-indigo-600 font-extrabold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                        />
                        <span className="text-slate-400 font-normal text-[10px]">{mat.unit}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onDeleteMaterial(mat.id)}
                        className="px-2.5 py-1 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md text-[10px] font-bold flex items-center gap-1 mx-auto cursor-pointer transition-colors"
                        title="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline inline-block" /> Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    Tidak ada bahan katalog yang sesuai kata kunci pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
