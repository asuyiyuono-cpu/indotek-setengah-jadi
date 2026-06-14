import React, { useState } from 'react';
import { Users, Search, PlusCircle, Mail, Phone, MapPin, Tag } from 'lucide-react';
import { Supplier } from '../types';

interface DataSupplierViewProps {
  suppliers: Supplier[];
  onAddSupplier: (sup: Supplier) => void;
}

export default function DataSupplierView({ suppliers, onAddSupplier }: DataSupplierViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [newName, setNewName] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newCategory, setNewCategory] = useState<'Bahan Baku' | 'Bahan Pembantu' | 'Keduanya'>('Bahan Baku');

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    onAddSupplier({
      id: `sup-${Date.now()}`,
      name: newName,
      contactName: newContact,
      phone: newPhone,
      email: newEmail,
      address: newAddress,
      category: newCategory
    });

    setNewName('');
    setNewContact('');
    setNewPhone('');
    setNewEmail('');
    setNewAddress('');
    setShowAddForm(false);
  };

  return (
    <div id="supplier_container" className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 font-display">
            <Users className="w-5 h-5 text-amber-500" />
            Verified Supplier Directory
          </h2>
          <p className="text-xs text-slate-500">Database lengkap importir &amp; supplier bahan mentah tekstil, pewarna kimia, aksesoris, dan benang rajut.</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 self-start cursor-pointer transition-colors shadow-sm shadow-amber-600/10"
        >
          <PlusCircle className="w-4 h-4" />
          Daftarkan Supplier
        </button>
      </div>

      {/* Form modal */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-300 rounded-xl p-6 space-y-4 shadow-md">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest border-b border-slate-100 pb-2">Tambah Supplier Resmi</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Nama Perusahaan / Supplier</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Contoh: PT. Sinar Abadi Wool..."
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Nama Sales / PIC Kontak</label>
              <input
                type="text"
                required
                value={newContact}
                onChange={(e) => setNewContact(e.target.value)}
                placeholder="Manager / Agen Hubungan..."
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Tipe Bahan Disediakan</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-850 focus:outline-none focus:border-amber-500 font-medium"
              >
                <option value="Bahan Baku">Bahan Baku (Saja)</option>
                <option value="Bahan Pembantu">Bahan Pembantu (Saja)</option>
                <option value="Keduanya">Keduanya (BB &amp; BP)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">No. Handphone / WA</label>
              <input
                type="text"
                required
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="081xxxxxxxx"
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-mono font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Alamat Email Perusahaan</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="sales@nama-perusahaan.com"
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-mono font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Alamat Kantor / Pergudangan</label>
              <input
                type="text"
                required
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="Alamat lengkap..."
                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-medium"
              />
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
              Simpan Supplier
            </button>
          </div>
        </form>
      )}

      {/* Grid view of cards */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg max-w-sm focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500 transition-all">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama supplier..."
            className="bg-transparent border-none text-xs text-slate-705 placeholder-slate-405 focus:outline-none w-full font-medium"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filtered.map((sup) => (
            <div key={sup.id} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition-all shadow-sm space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold border ${
                    sup.category === 'Bahan Baku' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    sup.category === 'Bahan Pembantu' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {sup.category}
                  </span>
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                </div>
                
                <h4 className="text-slate-800 font-bold text-sm tracking-wide font-display leading-tight">{sup.name}</h4>
                <div className="text-slate-600 text-xs flex items-center gap-1.5 bg-slate-50 p-2 rounded border border-slate-200/60">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">PIC:</span>
                  <span className="font-semibold text-slate-700">{sup.contactName}</span>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3.5 text-[11px] text-slate-500 font-sans">
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="font-mono text-slate-700 font-medium">{sup.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="font-mono text-slate-700 break-all font-medium">{sup.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate text-slate-600 font-medium" title={sup.address}>{sup.address}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
