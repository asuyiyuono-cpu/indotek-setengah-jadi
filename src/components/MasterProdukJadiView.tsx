import React, { useState } from 'react';
import { PackageOpen, Search, PlusCircle, ShoppingBag, Layers, Coins } from 'lucide-react';
import { StockProduct } from '../types';

interface MasterProdukJadiViewProps {
  products: StockProduct[];
  onAddProduct: (prod: StockProduct) => void;
  onUpdateProductStock: (id: string, newStock: number) => void;
}

export default function MasterProdukJadiView({
  products,
  onAddProduct,
  onUpdateProductStock
}: MasterProdukJadiViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Cotton');
  const [newStock, setNewStock] = useState(100);
  const [newUnit, setNewUnit] = useState('Roll');
  const [newPrice, setNewPrice] = useState(300000);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName) return;

    onAddProduct({
      id: `fg-${Date.now()}`,
      code: newCode,
      name: newName,
      stock: newStock,
      unit: newUnit,
      unitPrice: newPrice,
      category: newCategory
    });

    setNewCode('');
    setNewName('');
    setNewStock(100);
    setNewPrice(300000);
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
    <div id="finished_goods_container" className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 font-display">
            <PackageOpen className="w-5 h-5 text-indigo-500" />
            Master Produk Setengah Jadi (Semi-Finished Goods)
          </h2>
          <p className="text-xs text-slate-500">Katalog utama prostetik/implan kesehatan setengah jadi hasil produksi lanjutan yang siap dipasarkan atau dipaketkan ke proses sterilisasi fisis lanjutan.</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 self-start cursor-pointer transition-colors shadow-sm shadow-indigo-600/10"
        >
          <PlusCircle className="w-4 h-4" />
          Katalog Produk Baru
        </button>
      </div>

      {/* Add form collapse */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-300 rounded-xl p-6 space-y-4 shadow-md">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest border-b border-slate-100 pb-2">Daftarkan Produk Produksi Implan</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Kode SKU</label>
              <input
                type="text"
                required
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                placeholder="CONTOH: FG-TEX-8"
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-mono font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Nama Produk</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nama komersial produk implan..."
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-850 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Kategori Implan</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-850 focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="Titanium Implants">Titanium Implants</option>
                <option value="Bone Plates & Screws">Bone Plates & Screws</option>
                <option value="Bio-Scaffolds">Bio-Scaffolds</option>
                <option value="Dental Implants">Dental Implants</option>
                <option value="Surgical Suture Systems">Surgical Suture Systems</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Satuan</label>
              <input
                type="text"
                required
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                placeholder="Pcs, Set, Box, Pack..."
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-850 focus:outline-none focus:border-indigo-500 font-mono font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Harga Jual per Satuan (IDR)</label>
              <input
                type="number"
                required
                value={newPrice}
                onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-850 focus:outline-none focus:border-indigo-500 font-mono font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Stok Awal Gudang</label>
              <input
                type="number"
                required
                value={newStock}
                onChange={(e) => setNewStock(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-850 focus:outline-none focus:border-indigo-500 font-mono font-medium"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-655 text-xs font-bold cursor-pointer transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-705 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm shadow-indigo-600/10"
            >
              Daftarkan Produk
            </button>
          </div>
        </form>
      )}

      {/* Grid listing */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg max-w-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari SKU atau nama produk implan..."
            className="bg-transparent border-none text-xs text-slate-705 placeholder-slate-405 focus:outline-none w-full font-medium"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredProducts.map((p) => (
            <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:border-indigo-400 hover:shadow-md transition-all shadow-sm">
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono text-[9px] text-indigo-750 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md font-bold">{p.code}</span>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">{p.category}</span>
                </div>
                <h4 className="text-slate-800 font-bold text-sm font-display leading-tight">{p.name}</h4>
                <p className="text-xl font-mono text-indigo-600 font-extrabold block pt-1">
                  {formatRupiah(p.unitPrice)} <span className="text-[10px] text-slate-400 font-normal">/{p.unit}</span>
                </p>
              </div>

              <div className="border-t border-slate-100 mt-4 pt-4 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Stok Tersedia</span>
                  <div className="font-mono text-sm text-slate-800 font-bold">
                    {p.stock} <span className="text-xs text-slate-400 font-normal">{p.unit}s</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button 
                    onClick={() => onUpdateProductStock(p.id, Math.max(0, p.stock - 5))}
                    className="p-1 px-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-650 rounded-lg text-xs cursor-pointer font-extrabold transition-all"
                  >
                    -
                  </button>
                  <button 
                    onClick={() => onUpdateProductStock(p.id, p.stock + 5)}
                    className="p-1 px-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-250 text-indigo-700 rounded-lg text-xs cursor-pointer font-extrabold transition-all"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
