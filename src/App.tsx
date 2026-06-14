import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Maximize, 
  Bell, 
  HelpCircle, 
  ChevronDown, 
  Package, 
  Layers, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Grid, 
  FileText, 
  RefreshCw, 
  Activity, 
  Heart,
  Database,
  Warehouse,
  Coins,
  ShieldAlert,
  Sliders,
  FolderOpen,
  Sun,
  Moon
} from 'lucide-react';

import { motion, AnimatePresence } from 'motion/react';

// Import our cohesive views
import DashboardView from './components/DashboardView';
import MasterPembelianView from './components/MasterPembelianView';
import GudangSetengahJadiView from './components/GudangSetengahJadiView';
import MasterProdukJadiView from './components/MasterProdukJadiView';
import DataSupplierView from './components/DataSupplierView';
import PurchaseOrderView from './components/PurchaseOrderView';
import PenerimaanInputView from './components/PenerimaanInputView';
import StockOpnameView from './components/StockOpnameView';
import GudangBahanView from './components/GudangBahanView';
import AlurMutasiView from './components/AlurMutasiView';

// Import initial dataset loads
import { 
  INITIAL_SUPPLIERS, 
  INITIAL_WIP_COMPONENTS, 
  INITIAL_PURCHASE_ORDERS, 
  INITIAL_SUPPLY_ARRIVALS, 
  INITIAL_STOCK_PRODUCTS, 
  INITIAL_CALENDAR_EVENTS 
} from './mockData';

import { Supplier, ComponentWIP, PurchaseOrder, SupplyArrival, StockProduct, CalendarEvent, ActivityLog } from './types';

export default function App() {
  // Global Theme Mode
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('indotex_dark_mode');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('indotex_dark_mode', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Mobile navigation drawer toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Sidebar Collapsible Section headers
  const [openMaster, setOpenMaster] = useState(true);
  const [openGudang, setOpenGudang] = useState(true);
  const [openTransaksi, setOpenTransaksi] = useState(true);
  const [openSistem, setOpenSistem] = useState(true);

  // Synchronized state pools
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('indotex_suppliers');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [wipComponents, setWipComponents] = useState<ComponentWIP[]>(() => {
    const saved = localStorage.getItem('indotex_wip');
    return saved ? JSON.parse(saved) : INITIAL_WIP_COMPONENTS;
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem('indotex_po');
    return saved ? JSON.parse(saved) : INITIAL_PURCHASE_ORDERS;
  });

  const [supplyArrivals, setSupplyArrivals] = useState<SupplyArrival[]>(() => {
    const saved = localStorage.getItem('indotex_arrivals');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLY_ARRIVALS;
  });

  const [products, setProducts] = useState<StockProduct[]>(() => {
    const saved = localStorage.getItem('indotex_products');
    return saved ? JSON.parse(saved) : INITIAL_STOCK_PRODUCTS;
  });

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('indotex_events');
    return saved ? JSON.parse(saved) : INITIAL_CALENDAR_EVENTS;
  });

  const [materials, setMaterials] = useState<any[]>(() => {
    const saved = localStorage.getItem('indotex_materials');
    return saved ? JSON.parse(saved) : [
      { id: 'mat-1', code: 'BB-TIT-01', name: 'Titanium Alloy Rod Ti-6Al-4V Grade 5', type: 'Bahan Baku', pricePerUnit: 450000, unit: 'Batang', avgUsagePerDay: 8, stock: 90, rackLocation: 'Aisle A, Rak 2', minStockLevel: 25 },
      { id: 'mat-2', code: 'BP-CER-02', name: 'Bioceramic Hydroxyapatite Powder Coating', type: 'Bahan Pembantu', pricePerUnit: 185000, unit: 'Gram', avgUsagePerDay: 150, stock: 1200, rackLocation: 'Aisle C, Rak 4', minStockLevel: 500 },
      { id: 'mat-3', code: 'BB-PEK-03', name: 'PEEK Medical Polymer Cylinder Rod 30mm', type: 'Bahan Baku', pricePerUnit: 1250000, unit: 'Pcs', avgUsagePerDay: 3, stock: 18, rackLocation: 'Aisle B, Rak 1', minStockLevel: 10 },
      { id: 'mat-4', code: 'BP-SUT-04', name: 'Ethicon Surgical Polypropylene Suture Thread', type: 'Bahan Pembantu', pricePerUnit: 65000, unit: 'Box', avgUsagePerDay: 6, stock: 80, rackLocation: 'Aisle D, Rak 1', minStockLevel: 20 },
      { id: 'mat-5', code: 'BP-COP-05', name: 'Sterile Packaging Tyvek Pouches 15x25cm', type: 'Bahan Pembantu', pricePerUnit: 3500, unit: 'Pcs', avgUsagePerDay: 40, stock: 950, rackLocation: 'Aisle D, Rak 3', minStockLevel: 300 },
      { id: 'mat-6', code: 'BB-COB-06', name: 'Cobalt-Chromium-Molybdenum Alloy Ingot', type: 'Bahan Baku', pricePerUnit: 2400000, unit: 'Kg', avgUsagePerDay: 2, stock: 1, rackLocation: 'Aisle E, Rak 1', minStockLevel: 6 }
    ];
  });

  const [avgUsage, setAvgUsage] = useState<number>(() => {
    const saved = localStorage.getItem('indotex_avg_usage');
    return saved ? parseFloat(saved) : 25;
  });

  // Activity Feed Audit Logs State
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('indotex_activities');
    return saved ? JSON.parse(saved) : [
      {
        id: 'act-1',
        timestamp: '2026-06-14 10:45:12',
        type: 'stock',
        action: 'Alokasi Pengeluaran Bahan',
        details: 'Merilis 2 Batang Titanium Alloy Rod Ti-6Al-4V Grade 5 untuk pengerjaan bubut Bone Plate.',
        actor: 'Ignatius (Warehouse Head)'
      },
      {
        id: 'act-2',
        timestamp: '2026-06-14 09:20:30',
        type: 'transaction',
        action: 'Inbound Penerimaan Barang',
        details: 'Menerima 100 Box Ethicon Surgical Polypropylene Suture Thread dari PO-2026-002.',
        actor: 'Ignatius (Warehouse Head)'
      },
      {
        id: 'act-3',
        timestamp: '2026-06-14 08:12:05',
        type: 'wip',
        action: 'Peralihan Proses WIP',
        details: 'Memperbarui tahapan IDU-PLT-01 ke LOT polishing/finishing steril.',
        actor: 'Ignatius (Warehouse Head)'
      },
      {
        id: 'act-4',
        timestamp: '2026-06-13 16:30:00',
        type: 'pembelian',
        action: 'Pembuatan PO Baru',
        details: 'Mendaftarkan Purchase Order baru PO-2026-003 senilai Rp 10.500.000 ke PT Global Sterile Implants.',
        actor: 'Ignatius (Warehouse Head)'
      },
      {
        id: 'act-old-1',
        timestamp: '2026-04-10 09:15:00',
        type: 'system',
        action: 'Inisialisasi Sistem ERP',
        details: 'Integrasi awal database pergudangan implan medis fisis selesai diuji.',
        actor: 'Sistem Admin'
      },
      {
        id: 'act-old-2',
        timestamp: '2026-05-02 14:00:00',
        type: 'pembelian',
        action: 'Arsip Data Pembelian Q1',
        details: 'Penyamaan data transaksi supplier triwulan pertama PT Titanium Medika Utama.',
        actor: 'Ignatius (Warehouse Head)'
      }
    ];
  });

  const [archivedLogs, setArchivedLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('indotex_archived_activities');
    return saved ? JSON.parse(saved) : [];
  });

  const [activityPanelOpen, setActivityPanelOpen] = useState(false);
  const [activeArchiveTab, setActiveArchiveTab] = useState<'active' | 'archived'>('active');

  useEffect(() => {
    localStorage.setItem('indotex_activities', JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem('indotex_archived_activities', JSON.stringify(archivedLogs));
  }, [archivedLogs]);

  // Smart Archiving Core Logic (Auto arches > 30 Days from current simulated date June 14, 2026)
  useEffect(() => {
    const simulatedNow = new Date("2026-06-14T04:29:13");
    const active: ActivityLog[] = [];
    const toBeArchived: ActivityLog[] = [];

    activityLogs.forEach(log => {
      try {
        const logTimeStr = log.timestamp.replace(' ', 'T');
        const logDate = new Date(logTimeStr);
        const diffMs = simulatedNow.getTime() - logDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        if (diffDays > 30) {
          toBeArchived.push(log);
        } else {
          active.push(log);
        }
      } catch (err) {
        active.push(log);
      }
    });

    if (toBeArchived.length > 0) {
      setArchivedLogs(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const filteredToArchive = toBeArchived.filter(t => !existingIds.has(t.id));
        if (filteredToArchive.length === 0) return prev;
        return [...prev, ...filteredToArchive];
      });
      setActivityLogs(active);
    }
  }, [activityLogs]);

  const logActivity = (type: 'stock' | 'transaction' | 'wip' | 'pembelian' | 'supplier' | 'system', action: string, details: string) => {
    const formatTime = () => {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    };

    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      timestamp: formatTime(),
      type,
      action,
      details,
      actor: 'Ignatius (Warehouse Head)'
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  // Keep state pools persisted across reloads automatically
  useEffect(() => {
    localStorage.setItem('indotex_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('indotex_wip', JSON.stringify(wipComponents));
  }, [wipComponents]);

  useEffect(() => {
    localStorage.setItem('indotex_po', JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem('indotex_arrivals', JSON.stringify(supplyArrivals));
  }, [supplyArrivals]);

  useEffect(() => {
    localStorage.setItem('indotex_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('indotex_events', JSON.stringify(calendarEvents));
  }, [calendarEvents]);

  useEffect(() => {
    localStorage.setItem('indotex_materials', JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem('indotex_avg_usage', avgUsage.toString());
  }, [avgUsage]);

  // Common mutation handlers
  const handleAddSupplier = (sup: Supplier) => {
    setSuppliers([...suppliers, sup]);
  };

  const handleAddMaterial = (mat: any) => {
    const enrichedMat = {
      ...mat,
      stock: mat.stock !== undefined ? mat.stock : 250, // default starting stock
      rackLocation: mat.rackLocation || `Aisle ${['A', 'B', 'C', 'D', 'E'][Math.floor(Math.random() * 5)]}, Rak ${Math.floor(Math.random() * 5) + 1}`,
      minStockLevel: mat.minStockLevel || Math.round((mat.avgUsagePerDay || 100) * 2.5) // default min safety floor
    };
    setMaterials([...materials, enrichedMat]);
  };

  const handleUpdateMaterialStock = (id: string, newStock: number) => {
    setMaterials(materials.map(m => m.id === id ? { ...m, stock: newStock } : m));
  };

  const handleDeleteMaterial = (id: string) => {
    setMaterials(materials.filter(m => m.id !== id));
  };

  const handleUpdateAvgUsage = (id: string, usage: number) => {
    setMaterials(materials.map(m => m.id === id ? { ...m, avgUsagePerDay: usage } : m));
  };

  const handleAddWIPComponent = (comp: ComponentWIP) => {
    setWipComponents([comp, ...wipComponents]);
    // Create production calendar event as well
    const newEvent: CalendarEvent = {
      id: `cal-wip-${Date.now()}`,
      date: comp.date,
      title: `${comp.code} ${comp.currentProcess}`,
      type: 'produksi',
      category: 'WIP',
      status: 'WIP',
      notes: `${comp.name} baru dimulai sejumlah ${comp.quantity} Pcs.`
    };
    setCalendarEvents([newEvent, ...calendarEvents]);
  };

  const handleUpdateComponentProcess = (id: string, nextProcess: 'potong' | 'jahit' | 'finishing' | 'packing') => {
    setWipComponents(wipComponents.map(item => {
      if (item.id === id) {
        // Also log event on calendar
        const updatedEvent: CalendarEvent = {
          id: `cal-up-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          title: `${item.code} ke ${nextProcess}`,
          type: 'produksi',
          category: 'WIP',
          status: 'WIP',
          notes: `Proses beralih ke ${nextProcess.toUpperCase()}.`
        };
        setCalendarEvents(evts => [updatedEvent, ...evts]);
        return { ...item, currentProcess: nextProcess };
      }
      return item;
    }));
  };

  const handleUpdateComponentStatus = (id: string, status: 'WIP' | 'Selesai') => {
    setWipComponents(wipComponents.map(item => {
      if (item.id === id) {
        // Log finished calendar task
        const updatedEvent: CalendarEvent = {
          id: `cal-fin-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          title: `${item.code} SELESAI`,
          type: 'produksi',
          category: 'WIP',
          status: 'Selesai',
          notes: `Produksi ${item.code} selesai sepenuhnya.`
        };
        setCalendarEvents(evts => [updatedEvent, ...evts]);
        return { ...item, status };
      }
      return item;
    }));
  };

  const handleAddPurchaseOrder = (po: PurchaseOrder) => {
    setPurchaseOrders([po, ...purchaseOrders]);
    // Register upcoming shipment on calendar
    const newEvt: CalendarEvent = {
      id: `cal-po-${Date.now()}`,
      date: po.estimatedDelivery,
      title: `Est. Tiba ${po.poNumber}`,
      type: 'pengiriman',
      category: 'Penerimaan',
      status: 'Pending',
      notes: `${po.supplierName} mengirim ${po.items[0]?.name}`
    };
    setCalendarEvents([newEvt, ...calendarEvents]);
  };

  const handleUpdatePOStatus = (id: string, status: 'Pending' | 'Selesai' | 'Dibatalkan') => {
    setPurchaseOrders(purchaseOrders.map(po => {
      if (po.id === id) {
        // If received successfully, trigger inbounding supply lists
        if (status === 'Selesai') {
          const item = po.items[0];
          const newArrival: SupplyArrival = {
            id: `arr-po-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            type: po.supplierName === 'mahkota' ? 'Bahan Pembantu' : 'Bahan Baku',
            supplierName: po.supplierName,
            itemName: `${item.name} (${item.quantity})`,
            quantity: item.quantity,
            unit: item.unit,
            totalPrice: po.totalAmount
          };
          setSupplyArrivals(arrs => [newArrival, ...arrs]);
        }
        return { ...po, status };
      }
      return po;
    }));
  };

  const handleAddSupplyArrival = (arrInput: Omit<SupplyArrival, 'id'>) => {
    const newArrival: SupplyArrival = {
      ...arrInput,
      id: `arr-${Date.now()}`
    };
    setSupplyArrivals([newArrival, ...supplyArrivals]);

    // Create a calendar log
    const newEvt: CalendarEvent = {
      id: `cal-log-${Date.now()}`,
      date: arrInput.date,
      title: `Bongkar ${arrInput.itemName}`,
      type: 'pengiriman',
      category: 'Penerimaan',
      status: 'Selesai',
      notes: `Penerimaan supplier ${arrInput.supplierName} bernilai ${arrInput.totalPrice}`
    };
    setCalendarEvents([newEvt, ...calendarEvents]);
  };

  const handleAddProduct = (prod: StockProduct) => {
    setProducts([...products, prod]);
  };

  const handleUpdateProductStock = (id: string, newStock: number) => {
    setProducts(products.map(p => p.id === id ? { ...p, stock: newStock } : p));
  };

  const handleResetSimulatedStorage = () => {
    if (confirm('Apakah Anda ingin mereset basis data INDOTEX ERP kembali ke setelan pabrik?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col md:flex-row antialiased font-sans transition-colors duration-200`}>
      
      {/* MOBILE HEADER BAR */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-950 z-50">
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-indigo-400 animate-pulse" />
          <span className="font-bold text-sm tracking-widest font-display text-white">INDOTEX<span className="text-indigo-400">ERP</span></span>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="text-slate-300 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-colors cursor-pointer mr-1"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun className="w-4.5 h-4.5 text-amber-400 animate-spin-slow" /> : <Moon className="w-4.5 h-4.5 text-slate-400" />}
          </button>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-300 hover:text-white p-1 cursor-pointer"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* MOBILE SIDEBAR BACKDROP OVERLAY */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-35 md:hidden cursor-pointer"
          />
        )}
      </AnimatePresence>

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside 
        id="sidebar_pannel"
        className={`fixed inset-y-0 left-0 transform ${
          sidebarOpen ? 'translate-x-0 shadow-2xl opacity-100' : '-translate-x-full opacity-90'
        } md:translate-x-0 md:opacity-100 md:static transition-all duration-300 ease-out z-40 bg-slate-900 border-r border-slate-950 w-64 p-5 flex flex-col justify-between shrink-0 h-screen overflow-y-auto`}
      >
        <div id="sidebar_top_section" className="space-y-6">
          {/* Brand Logo header */}
          <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-800/80">
            <div className="p-1.5 bg-indigo-500/15 rounded-lg">
              <Database className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-widest font-display text-white">
                INDOTEX<span className="text-indigo-400">ERP</span>
              </h1>
              <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono font-bold">Industry Portal</span>
            </div>
          </div>

          {/* Navigation link stacks */}
          <nav className="space-y-5">
            {/* Active Dashboard click */}
            <div>
              <button
                onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/35 font-bold shadow-sm shadow-indigo-600/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <Grid className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
            </div>

            {/* Collapsible: DATA MASTER */}
            <div className="space-y-1.5">
              <button 
                onClick={() => setOpenMaster(!openMaster)}
                className="w-full flex items-center justify-between px-3 text-[10px] uppercase font-semibold tracking-widest text-slate-400/90"
              >
                <span>DATA MASTER</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openMaster ? '' : '-rotate-90'}`} />
              </button>
              
              {openMaster && (
                <div className="pl-2 space-y-1">
                  <button
                    onClick={() => { setActiveTab('pembelian'); setSidebarOpen(false); }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-md text-xs transition-colors ${
                      activeTab === 'pembelian' ? 'text-indigo-400 font-bold bg-slate-800/60' : 'text-slate-400 hover:text-white hover:bg-slate-800/15'
                    }`}
                  >
                    <Package className="w-3.5 h-3.5 shrink-0" />
                    <span>Master Pembelian</span>
                  </button>
                  <button
                    onClick={() => { setActiveTab('gudang-setengah-jadi'); setSidebarOpen(false); }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-md text-xs transition-colors ${
                      activeTab === 'gudang-setengah-jadi' ? 'text-indigo-400 font-bold bg-slate-800/60' : 'text-slate-400 hover:text-white hover:bg-slate-800/15'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 shrink-0" />
                    <span>Master Setengah Jadi</span>
                  </button>
                  <button
                    onClick={() => { setActiveTab('produk-jadi'); setSidebarOpen(false); }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-md text-xs transition-colors ${
                      activeTab === 'produk-jadi' ? 'text-indigo-400 font-bold bg-slate-800/60' : 'text-slate-400 hover:text-white hover:bg-slate-800/15'
                    }`}
                  >
                    <Warehouse className="w-3.5 h-3.5 shrink-0" />
                    <span>Master Produk Setengah Jadi</span>
                  </button>
                  <button
                    onClick={() => { setActiveTab('supplier'); setSidebarOpen(false); }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-md text-xs transition-colors ${
                      activeTab === 'supplier' ? 'text-indigo-400 font-bold bg-slate-800/60' : 'text-slate-400 hover:text-white hover:bg-slate-800/15'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 shrink-0" />
                    <span>Data Supplier</span>
                  </button>
                </div>
              )}
            </div>

            {/* Collapsible: INVENTORY GUDANG */}
            <div className="space-y-1.5">
              <button 
                onClick={() => setOpenGudang(!openGudang)}
                className="w-full flex items-center justify-between px-3 text-[10px] uppercase font-semibold tracking-widest text-slate-400/90"
              >
                <span>INVENTORY GUDANG</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openGudang ? '' : '-rotate-90'}`} />
              </button>

               {openGudang && (
                <div className="pl-2 space-y-1">
                  <button
                    onClick={() => { setActiveTab('gudang-bahan'); setSidebarOpen(false); }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-md text-xs transition-colors ${
                      activeTab === 'gudang-bahan' ? 'text-indigo-400 font-bold bg-slate-800/60' : 'text-slate-400 hover:text-white hover:bg-slate-800/15'
                    }`}
                  >
                    <Warehouse className="w-3.5 h-3.5 shrink-0" />
                    <span>Gudang Bahan Baku &amp; Penunjang</span>
                  </button>
                  <button
                    onClick={() => { setActiveTab('gudang-setengah-jadi'); setSidebarOpen(false); }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-md text-xs transition-colors ${
                      activeTab === 'gudang-setengah-jadi' ? 'text-indigo-400 font-bold bg-slate-800/60' : 'text-slate-400 hover:text-white hover:bg-slate-800/15'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5 shrink-0" />
                    <span>Gudang Setengah Jadi</span>
                  </button>
                  <button
                    onClick={() => { setActiveTab('mutasi-barang'); setSidebarOpen(false); }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-md text-xs transition-colors ${
                      activeTab === 'mutasi-barang' ? 'text-indigo-400 font-bold bg-slate-800/60' : 'text-slate-400 hover:text-white hover:bg-slate-800/15'
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                    <span>Alur Mutasi Barang</span>
                  </button>
                  <button
                    onClick={() => { setActiveTab('stock-opname'); setSidebarOpen(false); }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-md text-xs transition-colors ${
                      activeTab === 'stock-opname' ? 'text-indigo-400 font-bold bg-slate-800/60' : 'text-slate-400 hover:text-white hover:bg-slate-800/15'
                    }`}
                  >
                    <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                    <span>Stock Opname</span>
                  </button>
                </div>
              )}
            </div>

            {/* Collapsible: TRANSAKSI & PO */}
            <div className="space-y-1.5">
              <button 
                onClick={() => setOpenTransaksi(!openTransaksi)}
                className="w-full flex items-center justify-between px-3 text-[10px] uppercase font-semibold tracking-widest text-slate-400/90"
              >
                <span>TRANSAKSI &amp; PO</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openTransaksi ? '' : '-rotate-90'}`} />
              </button>

              {openTransaksi && (
                <div className="pl-2 space-y-1">
                  <button
                    onClick={() => { setActiveTab('purchase-order'); setSidebarOpen(false); }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-md text-xs transition-colors ${
                      activeTab === 'purchase-order' ? 'text-indigo-400 font-bold bg-slate-800/60' : 'text-slate-400 hover:text-white hover:bg-slate-800/15'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    <span>Purchase Order (PO)</span>
                  </button>
                  <button
                    onClick={() => { setActiveTab('penerimaan'); setSidebarOpen(false); }}
                    className={`w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-md text-xs transition-colors ${
                      activeTab === 'penerimaan' ? 'text-indigo-400 font-bold bg-slate-800/60' : 'text-slate-400 hover:text-white hover:bg-slate-800/15'
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                    <span>Penerimaan BB &amp; BP</span>
                  </button>
                </div>
              )}
            </div>

            {/* Collapsible: SISTEM */}
            <div className="space-y-1.5">
              <button 
                onClick={() => setOpenSistem(!openSistem)}
                className="w-full flex items-center justify-between px-3 text-[10px] uppercase font-semibold tracking-widest text-[#41537a]"
              >
                <span>SISTEM</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSistem ? '' : '-rotate-90'}`} />
              </button>

              {openSistem && (
                <div className="pl-2 space-y-1 text-slate-500 text-xs text-sans">
                  <button
                    onClick={() => { setActivityPanelOpen(true); setSidebarOpen(false); }}
                    className="w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/15 text-left text-xs transition-colors cursor-pointer"
                  >
                    <Activity className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                    <span>Audit Log Feed</span>
                  </button>
                  
                  <div className="px-3 py-1 bg-slate-800/30 rounded text-[10px] font-mono select-none flex justify-between items-center text-slate-400 border border-slate-800/50">
                    <span>IP Client: Logged</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Footer actions of sidebar */}
        <div id="sidebar_footer" className="pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center space-x-3 p-1 rounded">
            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold font-display text-indigo-400 border border-slate-700">
              I
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-200">Ignatius</h4>
              <span className="text-[9px] text-slate-400">Warehouse Head</span>
            </div>
          </div>
          
          <button 
            onClick={handleResetSimulatedStorage}
            className="w-full bg-red-950/20 hover:bg-red-900/30 text-red-400 border border-red-950/40 hover:border-red-900/40 rounded py-2 text-[10px] font-bold cursor-pointer transition-colors"
          >
            Reset Database ERP
          </button>
        </div>
      </aside>

      {/* RIGHT SIDE CONTENT CONTAINER */}
      <main id="main_content_pane" className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* TOP STATUS AND SEARCH BAR */}
        <header id="top_navbar" className={`hidden md:flex items-center justify-between px-8 py-4 ${darkMode ? 'bg-slate-900 border-b border-slate-800' : 'bg-white border-b border-slate-200'} shrink-0 shadow-sm transition-colors duration-200`}>
          {/* Breadcrumbs / View Title info */}
          <div className="space-y-0.5">
            <div className="flex items-center gap-3.5">
              <h2 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-slate-800'} tracking-tight font-display`}>
                {activeTab === 'dashboard' ? 'Overview Dashboard' : 
                 activeTab === 'pembelian' ? 'Master Bahan Baku' :
                 activeTab === 'gudang-bahan' ? 'Gudang Bahan Baku & Penunjang' :
                 activeTab === 'gudang-setengah-jadi' ? 'Gudang Setengah Jadi (WIP)' :
                 activeTab === 'produk-jadi' ? 'Master Produk Setengah Jadi' :
                 activeTab === 'supplier' ? 'Daftar Supplier' :
                 activeTab === 'purchase-order' ? 'Daftar Purchase Order' :
                 activeTab === 'penerimaan' ? 'Inbound / Penerimaan Pos' :
                 activeTab === 'stock-opname' ? 'Stock Opname' : 
                 activeTab === 'mutasi-barang' ? 'Alur Mutasi Barang & Logistik' : 'Detail View'}
              </h2>
              <span className={`px-2 py-0.5 ${darkMode ? 'bg-green-950 text-green-400 border border-green-800/30' : 'bg-green-100 text-green-700'} text-[10px] font-bold rounded-full uppercase tracking-wider`}>
                On Track
              </span>
            </div>
            <div className="text-[10px] text-slate-500 flex items-center space-x-1 font-sans">
              <span className="dark:text-slate-400">Home</span>
              <span className="dark:text-slate-600">/</span>
              <span className="dark:text-slate-400">Indotex ERP Portal</span>
              <span className="dark:text-slate-600">/</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">{activeTab}</span>
            </div>
          </div>

          {/* Search bar inside navigation */}
          <div className={`relative flex items-center ${darkMode ? 'bg-slate-800/80' : 'bg-slate-100/85'} border-none rounded-full px-4 py-1.5 w-72 text-xs transition-shadow focus-within:ring-2 focus-within:ring-indigo-500/20`}>
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search anything..." 
              className={`bg-transparent border-none focus:outline-none w-full ${darkMode ? 'text-slate-100 placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'} text-xs`}
            />
          </div>

          {/* Quick status controls panel bar */}
          <div className="flex items-center space-x-5">
            <div className={`flex items-center space-x-2 text-[10px] ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'} px-3 py-1.5 rounded-full font-bold font-mono`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>UTC-7 ACTIVE</span>
            </div>

            {/* Global Dark Mode Switcher */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-1.5 rounded-full ${darkMode ? 'hover:bg-slate-850 text-amber-400 hover:text-amber-300' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'} transition-colors cursor-pointer`}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun className="w-4 h-4 animate-spin-slow" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Quick Audit Log Feed Notification Trigger */}
            <button 
              onClick={() => setActivityPanelOpen(true)}
              className={`p-1.5 rounded-full ${darkMode ? 'hover:bg-slate-850' : 'hover:bg-slate-100'} text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer relative`}
              title="Audit Log Feed"
            >
              <Activity className="w-4 h-4 text-indigo-500 animate-pulse" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
            </button>
            
            <button className={`p-1.5 rounded-full ${darkMode ? 'hover:bg-slate-850' : 'hover:bg-slate-100'} text-slate-400 hover:text-slate-700 transition-colors cursor-pointer`}>
              <Bell className="w-4 h-4 dark:text-slate-400" />
            </button>
            <button className={`p-1.5 rounded-full ${darkMode ? 'hover:bg-slate-850' : 'hover:bg-slate-100'} text-slate-400 hover:text-slate-700 transition-colors cursor-pointer`}>
              <Maximize className="w-4 h-4 dark:text-slate-400" />
            </button>

            {/* Profile Avatar item */}
            <div className={`flex items-center gap-2.5 pl-2 border-l ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="text-right">
                <p className={`text-xs font-semibold leading-none ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Ignatius</p>
                <p className="text-[9px] text-slate-400 mt-0.5">Warehouse Head</p>
              </div>
              <div className={`w-8 h-8 rounded-full ${darkMode ? 'bg-indigo-950/80 text-indigo-400 border border-indigo-900/50' : 'bg-indigo-100 border-2 border-white text-indigo-700'} shadow-sm flex items-center justify-center font-bold text-xs select-none`}>
                IG
              </div>
            </div>
          </div>
        </header>

        {/* CONTAINER FOR ACTIVE SCENE ACTION */}
        <section className={`flex-1 p-4 md:p-8 ${darkMode ? 'bg-slate-950' : 'bg-slate-50'} overflow-y-auto transition-colors duration-200`}>
          {activeTab === 'dashboard' && (
            <DashboardView 
              suppliers={suppliers}
              wipComponents={wipComponents}
              purchaseOrders={purchaseOrders}
              supplyArrivals={supplyArrivals}
              calendarEvents={calendarEvents}
              onAddCalendarEvent={(evt) => setCalendarEvents([ { ...evt, id: `cal-${Date.now()}` }, ...calendarEvents ])}
              avgUsage={avgUsage}
              setAvgUsage={setAvgUsage}
              materials={materials}
              onAddPurchaseOrder={handleAddPurchaseOrder}
              darkMode={darkMode}
            />
          )}

          {activeTab === 'pembelian' && (
            <MasterPembelianView 
              materials={materials}
              onAddMaterial={handleAddMaterial}
              onDeleteMaterial={handleDeleteMaterial}
              onUpdateAvgUsage={handleUpdateAvgUsage}
            />
          )}

          {activeTab === 'gudang-bahan' && (
            <GudangBahanView 
              materials={materials}
              wipComponents={wipComponents}
              onAddMaterial={handleAddMaterial}
              onUpdateMaterialStock={handleUpdateMaterialStock}
              darkMode={darkMode}
            />
          )}

          {activeTab === 'gudang-setengah-jadi' && (
            <GudangSetengahJadiView 
              wipComponents={wipComponents}
              onAddWIPComponent={handleAddWIPComponent}
              onUpdateComponentProcess={handleUpdateComponentProcess}
              onUpdateComponentStatus={handleUpdateComponentStatus}
            />
          )}

          {activeTab === 'produk-jadi' && (
            <MasterProdukJadiView 
              products={products}
              onAddProduct={handleAddProduct}
              onUpdateProductStock={handleUpdateProductStock}
            />
          )}

          {activeTab === 'supplier' && (
            <DataSupplierView 
              suppliers={suppliers}
              onAddSupplier={handleAddSupplier}
            />
          )}

          {activeTab === 'purchase-order' && (
            <PurchaseOrderView 
              purchaseOrders={purchaseOrders}
              suppliers={suppliers}
              onAddPurchaseOrder={handleAddPurchaseOrder}
              onUpdatePOStatus={handleUpdatePOStatus}
            />
          )}

          {activeTab === 'penerimaan' && (
            <PenerimaanInputView 
              suppliers={suppliers}
              supplyArrivals={supplyArrivals}
              onAddSupplyArrival={handleAddSupplyArrival}
            />
          )}

          {activeTab === 'stock-opname' && (
            <StockOpnameView 
              products={products}
              onAdjustProductStock={handleUpdateProductStock}
            />
          )}

          {activeTab === 'mutasi-barang' && (
            <AlurMutasiView 
              materials={materials}
              wipComponents={wipComponents}
              purchaseOrders={purchaseOrders}
              products={products}
              onUpdateMaterialStock={handleUpdateMaterialStock}
              onLogActivity={logActivity}
            />
          )}
        </section>

        {/* SYSTEM STATS DOCK FOOTER BAR */}
        <footer className="h-8 bg-slate-100 border-t border-slate-200 px-8 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest shrink-0">
          <div className="flex gap-6 items-center">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              Servers Operational
            </span>
            <span>Last sync: 1 min ago</span>
          </div>
          <div>Nexus v4.2.1-stable</div>
        </footer>
      </main>

      {/* 5. SLIDING RIGHT SIDE DRAWER: AUDIT LOGS ACTIVITY FEED */}
      <AnimatePresence>
        {activityPanelOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
            <div className="absolute inset-0 overflow-hidden">
              {/* Background backdrop blur */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={() => setActivityPanelOpen(false)}
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs cursor-pointer"
              />

              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 md:pl-16">
                <motion.div 
                  initial={{ x: "100%", opacity: 0.95 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: "100%", opacity: 0.95 }}
                  transition={{ type: "spring", damping: 26, stiffness: 210 }}
                  className="pointer-events-auto w-screen max-w-md"
                >
                  <div className={`flex h-full flex-col ${darkMode ? 'bg-slate-900 border-l border-slate-800 text-slate-100' : 'bg-white border-l border-slate-200 text-slate-900'} shadow-2xl transition-colors duration-200`}>
                    {/* Header */}
                    <div className="bg-slate-950 px-6 py-5 sm:px-6 border-b border-slate-800/80">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className="p-1.5 bg-indigo-500/15 rounded-md border border-indigo-500/20">
                            <Activity className="w-5 h-5 text-indigo-400 animate-pulse" />
                          </div>
                          <div>
                            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-display" id="slide-over-title">
                              Log Aktivitas ERP Indotex
                            </h2>
                            <p className="text-[10px] text-slate-400 leading-none mt-1">Audit log perubahan stok &amp; status manufaktur</p>
                          </div>
                        </div>
                        <div className="ml-3 flex h-7 items-center">
                          <button 
                            type="button" 
                            onClick={() => setActivityPanelOpen(false)}
                            className="rounded-md bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 p-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer font-bold font-mono border border-slate-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Body Content */}
                    <div className={`relative flex-1 px-6 py-4 overflow-y-auto ${darkMode ? 'bg-slate-950' : 'bg-slate-50'} space-y-4`}>
                      {/* Tab Navigation */}
                      <div className={`grid grid-cols-2 gap-1.5 p-1 ${darkMode ? 'bg-slate-900' : 'bg-slate-200/60'} rounded-lg text-xs font-bold leading-normal`}>
                        <button
                          onClick={() => setActiveArchiveTab('active')}
                          className={`py-1.5 px-3 rounded-md text-center transition-all cursor-pointer ${
                            activeArchiveTab === 'active' 
                              ? (darkMode ? 'bg-slate-850 text-indigo-400 shadow-xs' : 'bg-white text-indigo-700 shadow-xs') 
                              : (darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-800')
                          }`}
                        >
                          Aktif Feed ({activityLogs.length})
                        </button>
                        <button
                          onClick={() => setActiveArchiveTab('archived')}
                          className={`py-1.5 px-3 rounded-md text-center transition-all cursor-pointer ${
                            activeArchiveTab === 'archived' 
                              ? (darkMode ? 'bg-slate-850 text-indigo-400 shadow-xs' : 'bg-white text-indigo-700 shadow-xs')
                              : (darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-800')
                          }`}
                        >
                          Smart Archive ({archivedLogs.length})
                        </button>
                      </div>

                      {/* Smart Archive explanatory callout */}
                      <div className={`border rounded-xl p-3 text-[10.5px] leading-relaxed font-sans font-medium flex items-start gap-2 select-none ${
                        darkMode 
                          ? 'bg-indigo-950/20 border-indigo-900/40 text-indigo-350' 
                          : 'bg-indigo-50/70 border-indigo-150 text-indigo-750'
                      }`}>
                        <div className={`p-0.5 rounded-lg mt-0.5 ${darkMode ? 'bg-indigo-950 text-indigo-400' : 'bg-indigo-100'}`}>
                          <Activity className="w-3.5 h-3.5" />
                        </div>
                        <div className="space-y-0.5 flex-1">
                          <span className={`block font-black text-xs ${darkMode ? 'text-indigo-300' : 'text-indigo-900'}`}>🚀 Smart Archive Aktif</span>
                          <span>Log yang berusia lebih lama dari 30 hari otomatis dipindahkan ke tab Arsip untuk performa maksimal.</span>
                        </div>
                      </div>

                      {/* Actions and Search */}
                      <div className={`flex justify-between items-center text-[10px] font-bold ${darkMode ? 'text-slate-400 border-slate-800' : 'text-slate-500 border-slate-200/60'} uppercase tracking-widest border-b pb-3`}>
                        <span>
                          Sajian: {activeArchiveTab === 'active' ? activityLogs.length : archivedLogs.length} Baris
                        </span>
                        <button 
                          onClick={() => {
                            if (activeArchiveTab === 'active') {
                              if (confirm('Bersihkan seluruh riwayat audit log aktif?')) {
                                setActivityLogs([]);
                              }
                            } else {
                              if (confirm('Kosongkan folder arsip historis permanen?')) {
                                setArchivedLogs([]);
                              }
                            }
                          }}
                          className={`transition-colors px-2 py-1 rounded text-xs ${
                            darkMode 
                              ? 'text-red-450 hover:text-red-400 bg-red-950/40 hover:bg-red-900/30' 
                              : 'text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100'
                          }`}
                        >
                          Bersihkan {activeArchiveTab === 'active' ? 'Feed' : 'Arsip'}
                        </button>
                      </div>

                      {/* Feed logs */}
                      <div className="space-y-3 font-sans">
                        {(activeArchiveTab === 'active' ? activityLogs : archivedLogs).length > 0 ? (
                          (activeArchiveTab === 'active' ? activityLogs : archivedLogs).map((log) => {
                            // Type-specific styles
                            let iconBg = darkMode 
                              ? "bg-blue-950/40 text-blue-400 border border-blue-900/30" 
                              : "bg-blue-50 text-blue-600 border border-blue-200";
                            
                            if (log.type === 'stock') {
                              iconBg = darkMode 
                                ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/30" 
                                : "bg-emerald-50 text-emerald-600 border border-emerald-250";
                            }
                            if (log.type === 'wip') {
                              iconBg = darkMode 
                                ? "bg-purple-950/40 text-purple-400 border border-purple-900/30" 
                                : "bg-purple-50 text-purple-600 border border-purple-200";
                            }
                            if (log.type === 'pembelian') {
                              iconBg = darkMode 
                                ? "bg-indigo-950/40 text-indigo-400 border border-indigo-900/30" 
                                : "bg-indigo-50 text-indigo-650 border border-indigo-200";
                            }
                            if (log.type === 'supplier') {
                              iconBg = darkMode 
                                ? "bg-amber-950/40 text-amber-400 border border-amber-900/30" 
                                : "bg-amber-50 text-amber-600 border border-amber-200";
                            }

                            return (
                              <div 
                                key={log.id} 
                                className={`rounded-xl p-4 border shadow-xs flex items-start space-x-3 transition-all hover:shadow-sm ${
                                  darkMode 
                                    ? 'bg-slate-900 border-slate-800 hover:border-slate-700' 
                                    : 'bg-white border-slate-150 hover:border-slate-300'
                                }`}
                              >
                                {/* Left icon wrapper */}
                                <span className={`p-2 rounded-lg text-xs font-bold shrink-0 mt-0.5 ${iconBg}`}>
                                  {log.type === 'stock' ? <Warehouse className="w-4 h-4" /> :
                                   log.type === 'wip' ? <Sliders className="w-4 h-4" /> :
                                   log.type === 'pembelian' ? <FileText className="w-4 h-4" /> :
                                   log.type === 'supplier' ? <Users className="w-4 h-4" /> :
                                   <Activity className="w-4 h-4" />}
                                </span>

                                {/* Right context text */}
                                <div className="space-y-1 flex-1 min-w-0">
                                  <div className="flex justify-between items-start gap-2">
                                    <span className={`text-[11px] font-black tracking-tight font-display ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                                      {log.action}
                                    </span>
                                    <span className="text-[9px] font-mono text-slate-450 shrink-0 select-none font-bold">
                                      {log.timestamp.includes(' ') ? log.timestamp.split(' ')[1] : log.timestamp}
                                    </span>
                                  </div>
                                  <p className={`text-[11px] font-normal leading-relaxed break-words ${darkMode ? 'text-slate-350' : 'text-slate-600'}`}>
                                    {log.details}
                                  </p>
                                  
                                  <div className={`flex items-center gap-1.5 pt-1.5 border-t mt-1.5 text-[9px] ${darkMode ? 'border-slate-800 text-slate-500' : 'border-slate-100/60 text-slate-400'}`}>
                                    <span className={`font-mono px-1 rounded font-bold uppercase tracking-wider ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                                      {log.type}
                                    </span>
                                    <span>•</span>
                                    {activeArchiveTab === 'archived' && (
                                      <>
                                        <span className={`text-[9.5px] font-bold ${darkMode ? 'text-indigo-400' : 'text-indigo-650'}`}>
                                          Arsip ({log.timestamp.split(' ')[0]})
                                        </span>
                                        <span>•</span>
                                      </>
                                    )}
                                    <span>Oleh: <span className="font-bold">{log.actor}</span></span>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-24 text-slate-400 dark:text-slate-600 italic text-xs">
                            <Activity className="w-8 h-8 text-slate-350 dark:text-slate-700 mx-auto mb-2" />
                            Tidak ada aktivitas tercatat di tab ini.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Drawer Footer */}
                    <div className={`px-6 py-4 border-t flex justify-between items-center text-[10px] font-bold font-mono ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}>
                      <span>INDOTEX ERP ENGINE SYSTEM</span>
                      <button 
                        onClick={() => setActivityPanelOpen(false)}
                        className={`uppercase font-black cursor-pointer ${
                          darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'
                        }`}
                      >
                        Tutup Log
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
