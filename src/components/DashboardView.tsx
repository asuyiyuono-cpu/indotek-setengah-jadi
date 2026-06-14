import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Calendar as CalendarIcon, 
  Layers, 
  Clock, 
  FileText, 
  Package, 
  Coins, 
  ChevronLeft, 
  ChevronRight, 
  PlusCircle, 
  HelpCircle,
  TrendingDown,
  RefreshCw,
  Info,
  ShieldAlert
} from 'lucide-react';
import { Supplier, ComponentWIP, PurchaseOrder, SupplyArrival, CalendarEvent } from '../types';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend
} from 'recharts';

interface DashboardViewProps {
  suppliers: Supplier[];
  wipComponents: ComponentWIP[];
  purchaseOrders: PurchaseOrder[];
  supplyArrivals: SupplyArrival[];
  calendarEvents: CalendarEvent[];
  onAddCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  avgUsage: number;
  setAvgUsage: (val: number) => void;
  materials?: any[];
  onAddPurchaseOrder?: (po: any) => void;
  darkMode?: boolean;
}

export default function DashboardView({
  suppliers,
  wipComponents,
  purchaseOrders,
  supplyArrivals,
  calendarEvents,
  onAddCalendarEvent,
  avgUsage,
  setAvgUsage,
  materials = [],
  onAddPurchaseOrder,
  darkMode = false
}: DashboardViewProps) {
  // Theme styling helpers for Recharts
  const gridColor = darkMode ? '#334155' : '#f1f5f9';
  const labelColor = darkMode ? '#cbd5e1' : '#64748b';
  const tooltipBg = darkMode ? '#1e293b' : '#ffffff';
  const tooltipBorder = darkMode ? '#475569' : '#e2e8f0';
  const tooltipText = darkMode ? '#f1f5f9' : '#0f172a';

  // Filters & Interactivity State
  const [selectedMonth, setSelectedMonth] = useState('Juni');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedProcessFilter, setSelectedProcessFilter] = useState<'potong' | 'jahit' | 'finishing' | 'packing' | 'semua'>('potong');
  const [showRegression, setShowRegression] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);
  const [selectedHeatCell, setSelectedHeatCell] = useState<any | null>(null);

  // Interactive real-time production efficiency states
  const [todayTarget, setTodayTarget] = useState<number>(140);
  const [todayOutput, setTodayOutput] = useState<number>(145);

  const efficiencyData = useMemo(() => {
    return [
      { date: '10 Jun', Target: 100, Output: 95, Efficiency: 95.0 },
      { date: '11 Jun', Target: 120, Output: 118, Efficiency: 98.3 },
      { date: '12 Jun', Target: 110, Output: 115, Efficiency: 104.5 },
      { date: '13 Jun', Target: 130, Output: 125, Efficiency: 96.1 },
      { date: '14 Jun', Target: todayTarget, Output: todayOutput, Efficiency: todayTarget > 0 ? parseFloat(((todayOutput / todayTarget) * 100).toFixed(1)) : 0 }
    ];
  }, [todayTarget, todayOutput]);

  const activeEfficiencyPct = useMemo(() => {
    return todayTarget > 0 ? Math.round((todayOutput / todayTarget) * 100) : 0;
  }, [todayTarget, todayOutput]);

  // States for automatic PO purchase recommendation outcomes
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [orderedMaterialIds, setOrderedMaterialIds] = useState<Record<string, boolean>>({});

  // Memoized critical materials list with calculated days left and refilling recommendations
  const criticalStockList = useMemo(() => {
    return materials.filter((m: any) => m.stock < m.minStockLevel).map((m: any) => {
      const daysLeft = m.avgUsagePerDay > 0 ? parseFloat((m.stock / m.avgUsagePerDay).toFixed(1)) : 0;
      // Suggested Refill is: top up to 2x safety plus 15 days usage Buffer, rounded up
      const suggestedQty = Math.max(
        Math.ceil((m.minStockLevel * 2) - m.stock),
        Math.ceil(m.avgUsagePerDay * 15)
      );
      const estimatedCost = suggestedQty * m.pricePerUnit;
      return {
        ...m,
        daysLeft,
        suggestedQty,
        estimatedCost
      };
    });
  }, [materials]);

  // Handler to generate PO automatically with dynamic values upon recommendation clicks
  const handleCreateAutoPO = (mat: any) => {
    // Pick first matching medical / general supplier to supply this implant material
    const preferredSupplier = suppliers.find((s: Supplier) => {
      const sName = s.name.toLowerCase();
      const sAddr = s.address.toLowerCase();
      const matName = mat.name.toLowerCase();
      return sName.includes(matName.split(' ')[0]) || 
             sAddr.includes(matName.split(' ')[0]) || 
             sName.includes('medika') || 
             s.category === mat.type;
    }) || suppliers[0] || { id: 'sup-1', name: 'PT Titanium Medika Utama' };

    const newPO = {
      code: `PO-AUTO-${Math.floor(1000 + Math.random() * 9000)}`,
      supplierId: preferredSupplier.id,
      supplierName: preferredSupplier.name,
      materialId: mat.id,
      materialName: mat.name,
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days delivery
      itemQty: mat.suggestedQty,
      itemUnit: mat.unit,
      unitPrice: mat.pricePerUnit,
      totalPrice: mat.estimatedCost,
      status: 'Pending' as const,
      notes: `REFULFILLMENT OTOMATIS: Persediaan implan (${mat.stock} ${mat.unit}) berada di bawah batas kritis (${mat.minStockLevel} ${mat.unit}). Diajukan otomatis.`
    };

    if (onAddPurchaseOrder) {
      onAddPurchaseOrder(newPO);
    }
    setOrderedMaterialIds(prev => ({ ...prev, [mat.id]: true }));
    setSuccessToast(`Dokumen PO ${newPO.code} untuk implan ${mat.name} berhasil diajukan otomatis ke ${preferredSupplier.name}.`);
    setTimeout(() => setSuccessToast(null), 6000);
  };
  
  // Calendar State
  const [calendarMonth, setCalendarMonth] = useState(5); // June (0-based)
  const [calendarYear, setCalendarYear] = useState(2026);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('2026-06-14');
  const [newEventType, setNewEventType] = useState<'produksi' | 'pengiriman'>('produksi');
  const [newEventCategory, setNewEventCategory] = useState<'WIP' | 'Penerimaan'>('WIP');
  const [newEventNotes, setNewEventNotes] = useState('');

  // 1. Calculate Dashboard Statistics from live props
  const totalStokPembelian = useMemo(() => {
    // Calculated as total items received in the latest period
    return supplyArrivals.length;
  }, [supplyArrivals]);

  const totalStokProduksi = useMemo(() => {
    // Total components running under production processes
    return wipComponents.reduce((sum, item) => sum + (item.status === 'WIP' ? 1 : 0), 0);
  }, [wipComponents]);

  const pendingPO = useMemo(() => {
    // Count of POs with 'Pending' status
    return purchaseOrders.filter(po => po.status === 'Pending').length;
  }, [purchaseOrders]);

  const wipInventoryCount = useMemo(() => {
    // Distinct types/items in WIP
    return wipComponents.length;
  }, [wipComponents]);

  const nilaiPenerimaan = useMemo(() => {
    // Sum of all supply arrivals total prices
    return supplyArrivals.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [supplyArrivals]);

  // Format currency helper
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  // 2. High-fidelity Line Chart Data (Monthly Trend Stock Additions)
  // Let's model the additions for the last 6 months
  const monthlyChartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'];
    // We can compute Baku & Pembantu aggregates from arrivals or simulate realistic historical trends
    // with June reflecting current live total arrivals sum
    const rawJuneSum = supplyArrivals.filter(a => a.type === 'Bahan Baku').reduce((sum, i) => sum + i.totalPrice, 0) / 1000000; // in Millions IDR
    const helperJuneSum = supplyArrivals.filter(a => a.type === 'Bahan Pembantu').reduce((sum, i) => sum + i.totalPrice, 0) / 1000000;

    return [
      { month: 'Jan', bahanBaku: 12.5, bahanPembantu: 4.2 },
      { month: 'Feb', bahanBaku: 14.8, bahanPembantu: 5.1 },
      { month: 'Mar', bahanBaku: 18.2, bahanPembantu: 6.0 },
      { month: 'Apr', bahanBaku: 15.0, bahanPembantu: 5.5 },
      { month: 'Mei', bahanBaku: 19.5, bahanPembantu: 7.2 },
      { month: 'Jun', bahanBaku: rawJuneSum > 0 ? parseFloat(rawJuneSum.toFixed(2)) : 22.2, bahanPembantu: helperJuneSum > 0 ? parseFloat(helperJuneSum.toFixed(2)) : 1.8 }
    ];
  }, [supplyArrivals]);

  // Linear Regression Forecast Calculation: y = mx + c
  // We compute trend over x = [0..5] for Jan..Jun
  const forecastData = useMemo(() => {
    const xValues = [0, 1, 2, 3, 4, 5];
    const yValues = monthlyChartData.map(d => d.bahanBaku + d.bahanPembantu); // Total stock addition monthly
    
    const n = xValues.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;
    
    for (let i = 0; i < n; i++) {
      sumX += xValues[i];
      sumY += yValues[i];
      sumXY += xValues[i] * yValues[i];
      sumXX += xValues[i] * xValues[i];
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Project for next month (Jul, x = 6) and (Agustus, x = 7)
    const julForecast = slope * 6 + intercept;
    const agsForecast = slope * 7 + intercept;

    return {
      slope,
      intercept,
      forecastPoints: [
        { month: 'Jun (Aktual)', value: yValues[5] },
        { month: 'Jul (Ramalan)', value: parseFloat(julForecast.toFixed(2)) },
        { month: 'Ags (Ramalan)', value: parseFloat(agsForecast.toFixed(2)) }
      ]
    };
  }, [monthlyChartData]);

  // 3. Flow Chart WIP Details filter
  const filteredWIPList = useMemo(() => {
    if (selectedProcessFilter === 'semua') return wipComponents;
    return wipComponents.filter(wip => wip.currentProcess === selectedProcessFilter);
  }, [wipComponents, selectedProcessFilter]);

  // 4. Calendar Generation Helpers (June 2026/Any Month)
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const calendarDays = useMemo(() => {
    // Generate grid for calendarMonth and calendarYear
    const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay();
    const totalDays = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    
    const days: Array<{ dateStr: string; dayNum: number; isMainMonth: boolean }> = [];
    
    // Previous month filler days
    const prevMonthTotalDays = new Date(calendarYear, calendarMonth, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dNum = prevMonthTotalDays - i;
      const mStr = String(calendarMonth === 0 ? 12 : calendarMonth).padStart(2, '0');
      const yVal = calendarMonth === 0 ? calendarYear - 1 : calendarYear;
      days.push({
        dateStr: `${yVal}-${mStr}-${String(dNum).padStart(2, '0')}`,
        dayNum: dNum,
        isMainMonth: false
      });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const mStr = String(calendarMonth + 1).padStart(2, '0');
      days.push({
        dateStr: `${calendarYear}-${mStr}-${String(d).padStart(2, '0')}`,
        dayNum: d,
        isMainMonth: true
      });
    }

    // Next month filler days to complete grid (multiples of 7, e.g., 35 or 42)
    const currentGridSize = days.length;
    const remaining = (7 - (currentGridSize % 7)) % 7;
    const padding = currentGridSize + remaining < 35 ? (currentGridSize + remaining + 7) : (currentGridSize + remaining);
    
    let nextDM = 1;
    for (let i = currentGridSize; i < padding; i++) {
      const mStr = String(calendarMonth === 11 ? 1 : calendarMonth + 2).padStart(2, '0');
      const yVal = calendarMonth === 11 ? calendarYear + 1 : calendarYear;
      days.push({
        dateStr: `${yVal}-${mStr}-${String(nextDM).padStart(2, '0')}`,
        dayNum: nextDM,
        isMainMonth: false
      });
      nextDM++;
    }

    return days;
  }, [calendarMonth, calendarYear]);

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(y => y - 1);
    } else {
      setCalendarMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(y => y + 1);
    } else {
      setCalendarMonth(m => m + 1);
    }
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    onAddCalendarEvent({
      date: newEventDate,
      title: newEventTitle,
      type: newEventType,
      category: newEventCategory,
      status: 'Pending',
      notes: newEventNotes
    });

    setNewEventTitle('');
    setNewEventNotes('');
    setShowAddEventModal(false);
  };

  // Find events for specific calendar dates
  const getEventsForDate = (dateStr: string) => {
    return calendarEvents.filter(event => event.date === dateStr);
  };

  // Real calculation of new requested KPIs
  const activeProductionOrders = useMemo(() => {
    return wipComponents.filter(c => c.status === 'WIP');
  }, [wipComponents]);

  const activeProductionQtySum = useMemo(() => {
    return wipComponents.filter(c => c.status === 'WIP').reduce((sum, item) => sum + item.quantity, 0);
  }, [wipComponents]);

  const inventoryTurnoverRate = useMemo(() => {
    // Estimasi Harga Pokok Penjualan (COGS) dan Rata-rata Nilai Persediaan
    const finishedQty = wipComponents.filter(c => c.status === 'Selesai').reduce((sum, item) => sum + item.quantity, 0);
    const estimatedCOGS = (finishedQty * 120000) + (supplyArrivals.reduce((sum, a) => sum + a.totalPrice, 0) * 0.7);
    
    const currentInvValue = materials.reduce((sum, m) => sum + ((m.stock || 250) * (m.pricePerUnit || 12000)), 0);
    const avgInventory = currentInvValue > 0 ? currentInvValue : 150000000; // Baseline fallback
    const rate = estimatedCOGS / avgInventory;
    return rate > 0 ? parseFloat(rate.toFixed(1)) : 3.8; // realistic fallback
  }, [wipComponents, supplyArrivals, materials]);

  const predictedConsumption = useMemo(() => {
    // Prediksi pemakaian logistik dalam 7 hari kedepan berdasarkan beban WIP aktif
    const activeWIPCount = wipComponents.filter(c => c.status === 'WIP').length;
    const loadFactor = 1 + (activeWIPCount * 0.12);
    
    return materials.map(m => {
      const sevenDaysUsage = Math.round((m.avgUsagePerDay || 100) * 7 * loadFactor);
      const isShortage = (m.stock !== undefined ? m.stock : 400) < sevenDaysUsage;
      return {
        id: m.id,
        code: m.code,
        name: m.name,
        type: m.type,
        sevenDaysUsage,
        currentStock: m.stock !== undefined ? m.stock : 400,
        unit: m.unit,
        isShortage
      };
    });
  }, [materials, wipComponents]);

  // Heatmap configuration
  const heatmapLines = useMemo(() => [
    { id: 'line-a', name: 'Jalur Rajut & Potong A (Line A)' },
    { id: 'line-b', name: 'Jalur Penjahitan Utama B (Line B)' },
    { id: 'line-c', name: 'Jalur Penjahitan Khusus C (Line C)' },
    { id: 'line-d', name: 'Jalur Kelayakan Finishing D (Line D)' },
    { id: 'line-e', name: 'Jalur Logistik Packing E (Line E)' },
  ], []);

  const heatmapStages = useMemo(() => [
    { id: 'potong', label: 'Cutting / Potong' },
    { id: 'jahit', label: 'Sewing / Jahit' },
    { id: 'finishing', label: 'Finishing / Sortir' },
    { id: 'packing', label: 'Packing / Kemas' },
  ], []);

  // Compute cell data mapping live WIP components
  const heatmapData = useMemo(() => {
    return heatmapLines.map((line, lineIdx) => {
      const stageWorkloads = heatmapStages.map((stage) => {
        // Filter WIP components in this stage of production that hash to this line
        const cellOrders = wipComponents.filter(w => {
          if (w.status !== 'WIP') return false;
          if (w.currentProcess !== stage.id) return false;
          
          // Deterministic line distribute based on ID hash
          let hashValue = 0;
          for (let i = 0; i < w.id.length; i++) {
            hashValue += w.id.charCodeAt(i);
          }
          return (hashValue % heatmapLines.length) === lineIdx;
        });

        const totalQty = cellOrders.reduce((sum, w) => sum + w.quantity, 0);
        return {
          stageId: stage.id,
          stageLabel: stage.label,
          qty: totalQty,
          count: cellOrders.length,
          orders: cellOrders
        };
      });

      return {
        lineId: line.id,
        lineName: line.name,
        stages: stageWorkloads
      };
    });
  }, [wipComponents, heatmapLines, heatmapStages]);

  return (
    <div id="dashboard_container" className="space-y-6 pb-12">
      {/* Real-time Critical Low Stock Warning Banner */}
      {criticalStockList.length > 0 && (
        <div id="realtime_low_stock_banner" className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/45 rounded-xl p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm animate-fade-in transition-colors">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-lg shrink-0 border border-rose-200/50 dark:border-rose-900/30">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200 uppercase tracking-wider font-display">Peringatan Batas Stok Minimum Terlampaui</h4>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-1.5 font-sans leading-relaxed">
                Terdapat <span className="font-bold font-mono">{criticalStockList.length} item</span> implan medis kritis yang berada di bawah tingkat pengaman minimum (<span className="italic font-semibold">minStockLevel</span>). Segera ajukan pengunduhan dokumen pemesanan (PO) ulang:
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {criticalStockList.map((m: any) => (
                  <span key={m.id} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300 border border-rose-200/30 dark:border-rose-800/20">
                    {m.code}: {m.stock} {m.unit} (Min: {m.minStockLevel})
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button 
            onClick={() => {
              const el = document.getElementById('critical_recommendations_section');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="px-4 py-2 bg-rose-700 hover:bg-rose-800 dark:bg-rose-600 dark:hover:bg-rose-500 text-white rounded-lg text-xs font-bold self-start md:self-auto transition-all shadow-xs cursor-pointer tracking-wide"
          >
            Tinjau &amp; Auto PO
          </button>
        </div>
      )}

      {/* 1. TOP CARDS / STATS MATRIX */}
      <div id="stats_grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Stok Pembelian */}
        <div id="stat_card_pembelian" className="bg-white border border-slate-200 p-5 rounded-xl flex flex-col justify-between shadow-sm hover:border-indigo-500/50 transition-colors">
          <div>
            <div className="flex justify-between items-start text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <span>Total Stok Pembelian</span>
              <span className="p-1.5 bg-blue-500/10 rounded-lg text-blue-600">
                <Package className="w-4 h-4" />
              </span>
            </div>
            <p className="text-2xl font-bold font-display mt-2.5 text-slate-800">
              {totalStokPembelian} <span className="text-xs font-normal text-slate-500">Unit</span>
            </p>
          </div>
          <div className="mt-3.5 flex items-center space-x-1 text-[10px] text-blue-600 font-semibold">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
            </span>
            <span>Always up to date</span>
          </div>
        </div>

        {/* Card 2: Total Stok Produksi */}
        <div id="stat_card_produksi" className="bg-white border border-slate-200 p-5 rounded-xl flex flex-col justify-between shadow-sm hover:border-emerald-500/50 transition-colors">
          <div>
            <div className="flex justify-between items-start text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <span>Total Stok Produksi (PO)</span>
              <span className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-600">
                <Layers className="w-4 h-4" />
              </span>
            </div>
            <p className="text-2xl font-bold font-display mt-2.5 text-slate-800">
              {totalStokProduksi} <span className="text-xs font-normal text-slate-500">Unit</span>
            </p>
          </div>
          <div className="mt-3.5 flex items-center space-x-1 text-[10px] text-emerald-600 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Running automatically</span>
          </div>
        </div>

        {/* Card 3: Pending PO */}
        <div id="stat_card_pending_po" className="bg-white border border-slate-200 p-5 rounded-xl flex flex-col justify-between shadow-sm hover:border-amber-500/50 transition-colors">
          <div>
            <div className="flex justify-between items-start text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <span>Pending PO</span>
              <span className="p-1.5 bg-amber-500/10 rounded-lg text-amber-600">
                <FileText className="w-4 h-4" />
              </span>
            </div>
            <p className="text-2xl font-bold font-display mt-2.5 text-slate-800">
              {pendingPO} <span className="text-xs font-normal text-slate-500">Dokumen</span>
            </p>
          </div>
          <div className="mt-3.5 flex items-center space-x-1 text-[10px] text-amber-600 font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>0% on due period</span>
          </div>
        </div>

        {/* Card 4: WIP Inventory */}
        <div id="stat_card_wip" className="bg-white border border-slate-200 p-5 rounded-xl flex flex-col justify-between shadow-sm hover:border-indigo-500/50 transition-colors">
          <div>
            <div className="flex justify-between items-start text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <span>WIP Inventory</span>
              <span className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-600">
                <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin-slow" />
              </span>
            </div>
            <p className="text-2xl font-bold font-display mt-2.5 text-slate-800">
              {wipInventoryCount} <span className="text-xs font-normal text-slate-500">Item</span>
            </p>
          </div>
          <div className="mt-3.5 flex items-center space-x-1 text-[10px] text-indigo-600 font-semibold">
            <Info className="w-3.5 h-3.5" />
            <span>Physical tracking active</span>
          </div>
        </div>

        {/* Card 5: Nilai Penerimaan */}
        <div id="stat_card_nilai" className="bg-white border border-slate-200 p-5 rounded-xl flex flex-col justify-between shadow-sm hover:border-sky-500/50 transition-colors">
          <div>
            <div className="flex justify-between items-start text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <span>Nilai Penerimaan</span>
              <span className="p-1.5 bg-sky-500/10 rounded-lg text-sky-600">
                <Coins className="w-4 h-4" />
              </span>
            </div>
            <p className="text-lg font-bold font-mono mt-2.5 text-sky-600">
              {formatRupiah(nilaiPenerimaan)}
            </p>
          </div>
          <div className="mt-3.5 flex items-center space-x-1 text-[10px] text-sky-600 font-semibold font-sans">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+4.88% vs last period</span>
          </div>
        </div>
      </div>

      {/* 1.5. DETAILED KEY PERFORMANCE INDICATORS (KPIs) */}
      <div id="kpi_insights_grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-slate-100 p-5 rounded-2xl border border-slate-200 shadow-sm">
        
        {/* KPI Card 1: Total Active Production Orders */}
        <div className="bg-white border border-indigo-100 p-5 rounded-xl shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-indigo-50">
              <span className="text-[10px] font-bold text-indigo-700 tracking-wider uppercase font-mono">KPI 1 • Sirkulasi Batch</span>
              <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">Produksi Aktif</span>
            </div>
            
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl font-extrabold font-display text-slate-800">{activeProductionOrders.length}</span>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Perintah Aktif</span>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              Sebanyak <strong className="text-indigo-600">{activeProductionQtySum} Pcs</strong> sedang dalam pengerjaan aktif lintas proses rajut, potong, jahit &amp; finishing saat ini.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px]">
            <span className="text-slate-400 font-semibold uppercase tracking-wider">Kapasitas Utilitas Mesin</span>
            <span className="font-mono text-indigo-700 font-bold">84% Optimal / Aman</span>
          </div>
        </div>

        {/* KPI Card 2: Inventory Turnover Rate */}
        <div className="bg-white border border-emerald-100 p-5 rounded-xl shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-emerald-50">
              <span className="text-[10px] font-bold text-emerald-700 tracking-wider uppercase font-mono">KPI 2 • Perputaran</span>
              <span className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Turnover Rate</span>
            </div>
            
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-extrabold font-mono text-emerald-600">{inventoryTurnoverRate}x</span>
              <span className="text-xs text-slate-400 font-semibold uppercase">Kali / Periode</span>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              Rasio efisiensi logistik gudang Indotex. Angka yang lebih tinggi menunjukkan waktu tinggal bahan baku mentah yang singkat &amp; kelancaran modal kerja.
            </p>
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-[9px] text-slate-400 mb-1">
              <span>Target Tahunan: 6.0x</span>
              <span className="font-bold text-emerald-600">{Math.round((inventoryTurnoverRate / 6) * 105)}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-350" 
                style={{ width: `${Math.min(100, (inventoryTurnoverRate / 6) * 105)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* KPI Card 3: Predicted Material Consumption */}
        <div className="bg-white border border-amber-100 p-5 rounded-xl shadow-xs flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex justify-between items-center pb-1 border-b border-amber-50">
              <span className="text-[10px] font-bold text-amber-700 tracking-wider uppercase font-mono">KPI 3 • Permintaan</span>
              <span className="text-[9px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold">Estimasi 7 Hari</span>
            </div>
            
            <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono font-bold block mb-1">Ramalan Konsumsi Bahan:</span>
            
            <div className="space-y-1.5 max-h-[90px] overflow-y-auto pr-1">
              {predictedConsumption.map(p => (
                <div key={p.id} className="flex justify-between items-center text-[11px] py-1 border-b border-slate-50">
                  <span className="font-semibold text-slate-700 truncate max-w-[150px]">{p.name}</span>
                  <div className="text-right font-mono">
                    <span className="font-extrabold text-slate-800">{p.sevenDaysUsage}</span>
                    <span className="text-slate-400 text-[10px] ml-0.5">{p.unit}</span>
                    {p.isShortage && (
                      <span className="ml-1 text-[8px] bg-rose-50 text-rose-600 border border-rose-200 font-bold px-1 rounded animate-pulse">Kritis!</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[9px] text-slate-400 leading-tight italic pt-2 border-t border-slate-50 mt-1.5">
            *Dikonversi dari rata-rata harian dengan beban unit WIP aktif ({activeProductionOrders.length} batch).
          </p>
        </div>
      </div>

      {/* SUCCESS TOAST FOR AUTO PURCHASE ORDERS */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-slate-900 border border-slate-850/50 text-white px-4 py-3 rounded-xl shadow-xl flex items-start gap-3 animate-fade-in">
          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 font-bold text-white text-xs">✓</div>
          <div>
            <h5 className="text-xs font-bold">Auto-PO Diproses</h5>
            <p className="text-[10px] text-slate-300 mt-0.5">{successToast}</p>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-slate-400 hover:text-white font-mono text-xs ml-auto">×</button>
        </div>
      )}

      {/* FEATURE: ANALISIS KRITIS STOK (AUTOMATIC PURCHASE RECOMMENDATIONS) */}
      <div id="critical_stock_analysis_block" className="bg-white border-2 border-rose-100 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-rose-50 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-display">
              <span className="p-1 px-1.5 bg-rose-50 text-rose-600 rounded-md text-xs font-mono font-bold animate-pulse">KRITIS</span>
              Analisis Kritis Stok Implan &amp; Rekomendasi Pembelian Otomatis
            </h3>
            <p className="text-xs text-slate-500">
              Sistem memonitor laju penyerapan fisis implan harian secara real-time dan memberikan kalkulasi kuantitas pembelian optimal jika di bawah batas aman.
            </p>
          </div>
          
          <div className="bg-rose-50/50 border border-rose-100 rounded-full px-3.5 py-1 text-rose-700 text-[10px] font-bold font-mono">
            {criticalStockList.length} Bahan Membutuhkan Refill Segera
          </div>
        </div>

        {criticalStockList.length === 0 ? (
          <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-5 text-center flex flex-col items-center justify-center space-y-1.5">
            <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">✓</span>
            <h4 className="text-xs font-bold text-slate-800">Semua Persediaan Dalam Batas Aman fisis</h4>
            <p className="text-[11px] text-slate-400 max-w-sm">
              Seluruh bahan implan kesehatan dan aksesori steril di gudang logistik saat ini berada di atas batas safety stock minimum.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* KPI Left Panel: Refill Budget Needed */}
            <div className="xl:col-span-3 bg-red-50/20 border border-rose-100/60 rounded-xl p-4 flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-rose-500 font-bold">Dana Refill yang Direkomendasikan</span>
                <p className="text-lg font-black text-slate-800 font-mono">
                  {formatRupiah(criticalStockList.reduce((sum, item) => sum + item.estimatedCost, 0))}
                </p>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Kalkulasi estimasi anggaran pengadaan logistik implan kritis agar dapat mendukung 20 hari manufaktur ke depan.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-rose-100/50">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-450 font-medium">Implan kritis:</span>
                  <span className="font-extrabold text-rose-650 font-mono">{criticalStockList.length} SKU</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-450 font-medium">Batas Kirim PO:</span>
                  <span className="font-bold text-slate-700 font-mono">5 Hari Kerja</span>
                </div>
              </div>
            </div>

            {/* List Right Panel: Recommendations Grid */}
            <div className="xl:col-span-9 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[9px] uppercase font-bold tracking-wider">
                    <th className="py-2 px-3">SKU Implan</th>
                    <th className="py-2 px-3">Persediaan Fisis (Saat Ini / Min)</th>
                    <th className="py-2 px-3 text-center">Keamanan Hari</th>
                    <th className="py-2 px-3 text-right">Kuantitas Refill Disarankan</th>
                    <th className="py-2 px-3 text-right">Estimasi Biaya</th>
                    <th className="py-2 px-3 text-center">Aksi Refill PO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {criticalStockList.map((mat) => {
                    const isOrdered = orderedMaterialIds[mat.id] === true;
                    // Compute progress bar color for runout safety
                    let barColor = "bg-rose-500";
                    let textColor = "text-rose-600";
                    if (mat.daysLeft > 5) {
                      barColor = "bg-emerald-500";
                      textColor = "text-emerald-700";
                    } else if (mat.daysLeft > 2) {
                      barColor = "bg-amber-500";
                      textColor = "text-amber-700";
                    }

                    return (
                      <tr key={mat.id} className="hover:bg-slate-50/50 text-slate-700 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-indigo-600">
                          <div>
                            <span className="block text-slate-750 font-sans font-bold text-xs">{mat.name}</span>
                            <span className="text-[9px] text-slate-400 font-medium">{mat.code} · {mat.category || "Implan Bedah"}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-mono">
                            <span className="font-extrabold text-rose-650">{mat.stock}</span> / <span className="font-semibold text-slate-500">{mat.minStockLevel}</span>
                            <span className="text-slate-400 text-[10px] ml-1">{mat.unit}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-col items-center space-y-1">
                            <span className={`font-mono font-extrabold text-[11px] ${textColor}`}>{mat.daysLeft} Hari</span>
                            <div className="w-16 bg-slate-100 rounded-full h-1 overflow-hidden">
                              <div 
                                className={`${barColor} h-1 rounded-full`} 
                                style={{ width: `${Math.min(100, (mat.daysLeft / 10) * 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-extrabold text-slate-800">
                          {mat.suggestedQty} <span className="text-slate-400 font-normal text-[10px]">{mat.unit}</span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-indigo-650">
                          {formatRupiah(mat.estimatedCost)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {isOrdered ? (
                            <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-250 font-bold px-2 py-1 rounded text-[9px] uppercase tracking-wider">
                              ✓ PO Terkirim
                            </span>
                          ) : (
                            <button
                              onClick={() => handleCreateAutoPO(mat)}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold px-3 py-1 cursor-pointer text-[10px] transition-colors shadow-xs active:scale-95 inline-block"
                            >
                              Auto-Refill PO
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 1.6. LIVE WORKLOAD INTENSITY HEATMAP (Tahapan Produksi: Potong, Jahit, Finishing, Packing) */}
      <div id="live_workload_heatmap" className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 font-display">
              <span className="p-1 px-1.5 bg-rose-50 text-rose-600 rounded-md text-xs font-mono font-bold animate-pulse">LIVE</span>
              Heatmap Intensitas Beban Kerja Produksi
            </h3>
            <p className="text-xs text-slate-500">Visualisasi matriks beban volume (Pcs) aktif pada 4 tahapan konveksi lintas jalur sirkulasi mesin.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Metode Agregasi:</span>
            <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-mono font-bold">Volume Pcs Aktif</span>
          </div>
        </div>

        {/* Heatmap Grid & Inspection Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Heatmap Visual Matrix */}
          <div className="xl:col-span-8 overflow-x-auto space-y-3">
            <div className="min-w-[600px] space-y-2">
              {/* Columns Header (X-Axis) */}
              <div className="grid grid-cols-12 gap-2 pb-1 border-b border-slate-100 font-sans">
                <div className="col-span-4 text-left text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">
                  Jalur Kerja (Y-Axis)
                </div>
                {heatmapStages.map(stage => (
                  <div key={stage.id} className="col-span-2 text-center text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider">
                    {stage.label.split(' / ')[1]}
                  </div>
                ))}
              </div>

              {/* Rows (Y-Axis) + Heat Cells */}
              <div className="space-y-2 pt-1 font-sans">
                {heatmapData.map((row, rowIdx) => (
                  <div key={row.lineId} className="grid grid-cols-12 gap-2 items-center">
                    {/* Row Label */}
                    <div className="col-span-4 text-xs font-semibold text-slate-700 leading-tight">
                      {row.lineName}
                    </div>

                    {/* Stage Cells */}
                    {row.stages.map((cell) => {
                      // Determine Heatmap color shade
                      let cellColor = "bg-slate-100 hover:bg-slate-200 text-slate-400 border-slate-200/40";
                      
                      if (cell.qty > 0) {
                        if (cell.qty <= 100) {
                          cellColor = "bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-emerald-300";
                        } else if (cell.qty <= 300) {
                          cellColor = "bg-indigo-100 hover:bg-indigo-200 text-indigo-800 border-indigo-300";
                        } else if (cell.qty <= 700) {
                          cellColor = "bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300";
                        } else {
                          cellColor = "bg-rose-500 hover:bg-rose-600 text-white border-rose-600 animate-pulse font-extrabold";
                        }
                      }

                      const isSelected = selectedHeatCell && 
                                         selectedHeatCell.lineId === row.lineId && 
                                         selectedHeatCell.stageId === cell.stageId;

                      return (
                        <button
                          type="button"
                          key={cell.stageId}
                          onClick={() => setSelectedHeatCell({
                            lineId: row.lineId,
                            lineName: row.lineName,
                            stageId: cell.stageId,
                            stageLabel: cell.stageLabel,
                            qty: cell.qty,
                            count: cell.count,
                            orders: cell.orders
                          })}
                          className={`col-span-2 h-14 rounded-xl border flex flex-col justify-center items-center cursor-pointer transition-all select-none ${cellColor} ${
                            isSelected ? 'ring-3 ring-indigo-650 scale-102 border-slate-900 shadow-md' : ''
                          }`}
                          title={`${row.lineName} - ${cell.stageLabel}: ${cell.qty} Pcs (${cell.count} Batch)`}
                        >
                          <span className="text-[14px] font-extrabold font-mono leading-none">
                            {cell.qty}
                          </span>
                          <span className="text-[8px] uppercase tracking-wider font-semibold opacity-80 mt-0.5 leading-none">
                            {cell.count} Lot
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Heatmap Custom Legend Indicator */}
            <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-500 pt-2 border-t border-slate-50">
              <span className="font-bold uppercase tracking-wider">Tingkat Beban:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-200 inline-block"></span>
                <span>Kosong (0)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-emerald-100 border border-emerald-300 inline-block"></span>
                <span>Ringan (&le;100 Pcs)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-indigo-100 border border-indigo-300 inline-block"></span>
                <span>Normal (101-300 Pcs)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-amber-100 border border-amber-300 inline-block"></span>
                <span>Padat (301-700 Pcs)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-rose-500 border border-rose-600 inline-block animate-pulse"></span>
                <span>Overload (&gt;700 Pcs)</span>
              </div>
            </div>
          </div>

          {/* Active Workload Inspection Panel (XL span 4) */}
          <div className="xl:col-span-4 bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between min-h-[290px]">
            {selectedHeatCell ? (
              <div className="space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start border-b border-slate-200 pb-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide font-display">
                        Inspeksi Jalur &amp; Tahapan
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium font-sans">Click sel lain untuk detail unit produksi.</p>
                    </div>
                    <button
                      onClick={() => setSelectedHeatCell(null)}
                      className="text-slate-400 hover:text-slate-600 text-xs font-bold font-mono transition-colors"
                    >
                      Batal [x]
                    </button>
                  </div>

                  <div className="space-y-1 bg-white p-2.5 rounded-lg border border-slate-100 text-xs font-sans">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Lokasi Kerja:</span>
                      <span className="font-extrabold text-slate-700 text-right">{selectedHeatCell.lineName.split('(')[1]?.replace(')', '') || selectedHeatCell.lineName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Proses / Tahap:</span>
                      <span className="font-extrabold text-indigo-650">{selectedHeatCell.stageLabel}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-100/70 pt-1 mt-1 font-mono text-[11px]">
                      <span className="font-sans font-semibold text-slate-400">Total Kebutuhan:</span>
                      <span className="font-black text-slate-800">{selectedHeatCell.qty} Pcs</span>
                    </div>
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="font-sans font-semibold text-slate-400">Jumlah Batch:</span>
                      <span className="font-bold text-slate-700">{selectedHeatCell.count} Lot Aktif</span>
                    </div>
                  </div>

                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block pt-1">Daftar WIP di Sektor ini:</span>
                  
                  <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                    {selectedHeatCell.orders.length > 0 ? (
                      selectedHeatCell.orders.map((order: any) => (
                        <div key={order.id} className="bg-white p-2 rounded border border-slate-150 flex justify-between items-center text-[10px]">
                          <div>
                            <span className="font-semibold text-slate-800 block">{order.name}</span>
                            <span className="font-mono text-[8px] text-slate-400 font-medium">{order.code} • {order.date}</span>
                          </div>
                          <span className="font-mono bg-indigo-50 text-indigo-700 font-extrabold px-1.5 py-0.5 rounded text-[10px]">
                            {order.quantity} Pcs
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-[10px] text-slate-455 italic font-medium">
                        Tidak ada lot/batch berjalan.
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-450 italic font-medium">
                  <span>*Beban aktual dihitung live</span>
                  <span className="font-bold text-indigo-650">Indotex ERP Real-Time</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-12 px-4 my-auto space-y-2">
                <div className="p-3 bg-indigo-50/70 text-indigo-500 rounded-full">
                  <Info className="w-5 h-5 text-indigo-500 animate-bounce" />
                </div>
                <h4 className="text-xs font-bold text-slate-755 uppercase tracking-wide font-display">Hub Inspeksi Sel Panas</h4>
                <p className="text-[10px] text-slate-400 max-w-[220px] leading-relaxed font-sans">
                  Pilih salah satu grid panas di sebelah kiri untuk menelusuri detail order manufaktur (WIP) serta target sirkulasi volume.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. ANALISIS TREN STOK & EFISIENSI PRODUKSI SEBELAH-MENYEBELAH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Trend Stock Additions */}
        <div id="monthly_trend_card" className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 font-display">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  Monthly Trend Stock Additions (Miliar / Juta)
                </h3>
                <p className="text-xs text-slate-500">Grafik penambahan stok bulanan & perkiraan algoritme Regresi Linear</p>
              </div>
              
              <div className="flex items-center space-x-3.5 bg-slate-50 p-1.5 rounded-lg border border-slate-200 self-start text-xs">
                <button
                  id="forecast_toggle_btn"
                  onClick={() => setShowRegression(!showRegression)}
                  className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                    showRegression 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                  }`}
                >
                  {showRegression ? 'Sembunyikan Ramalan' : 'Regresi Linier Peramalan'}
                </button>
                <div className="h-5 w-[1px] bg-slate-200"></div>
                <div className="flex items-center space-x-1">
                  <span className="text-slate-500 font-semibold">Rata-rata/Hari:</span>
                  <input 
                    id="avg_usage_input"
                    type="number" 
                    value={avgUsage || ''} 
                    onChange={(e) => setAvgUsage(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-12 bg-white border border-slate-300 rounded text-center py-0.5 text-xs text-indigo-600 font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Warning Notification matching exactly screenshot */}
            {!avgUsage && (
              <div id="warning_box" className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex items-center justify-center space-x-3 text-center">
                <HelpCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p className="text-xs text-amber-800 max-w-2xl leading-relaxed">
                  <strong>Menunggu Data Rata-Rata:</strong> Tambahkan nilai <strong className="text-indigo-600">"Rata-rata Penggunaan/Hari"</strong> di kolom atas untuk mengaktifkan peramalan algoritme <strong>Linear Regression</strong>.
                </p>
              </div>
            )}

            {/* High fidelity SVG line chart */}
            <div id="svg_chart_wrapper" className="relative h-60 w-full bg-slate-50/75 rounded-lg border border-slate-200 p-4">
              <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                {/* Gridlines */}
                <line x1="50" y1="20" x2="750" y2="20" stroke="#e2e8f0" strokeWidth="1" />
                <line x1="50" y1="60" x2="750" y2="60" stroke="#e2e8f0" strokeWidth="1" />
                <line x1="50" y1="100" x2="750" y2="100" stroke="#e2e8f0" strokeWidth="1" />
                <line x1="50" y1="140" x2="750" y2="140" stroke="#e2e8f0" strokeWidth="1" />
                <line x1="50" y1="180" x2="750" y2="180" stroke="#cbd5e1" strokeWidth="1.5" />
                
                {/* Legend reference markers */}
                {monthlyChartData.map((d, idx) => {
                  const x = 50 + (idx * 140);
                  return (
                    <line key={idx} x1={x} y1="20" x2={x} y2="180" stroke="#e2e8f0" strokeDasharray="3 3" />
                  );
                })}

                {/* Path 1: Bahan Baku (Yellow/Gold) */}
                <path
                  d={monthlyChartData.map((d, idx) => {
                    const x = 50 + (idx * 140);
                    const y = 180 - (d.bahanBaku * 7); // scaled
                    return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2.5"
                  className="drop-shadow-[0_2px_4px_rgba(251,191,36,0.2)]"
                />
                
                {/* Path 2: Bahan Pembantu (Teal) */}
                <path
                  d={monthlyChartData.map((d, idx) => {
                    const x = 50 + (idx * 140);
                    const y = 180 - (d.bahanPembantu * 7); // scaled
                    return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2.5"
                  className="drop-shadow-[0_2px_4px_rgba(6,182,212,0.2)]"
                />

                {/* Regression Dotted Line projection if enabled & average exists */}
                {showRegression && (
                  <path
                    d={`M 750 ${180 - (monthlyChartData[5].bahanBaku + monthlyChartData[5].bahanPembantu) * 3} 
                       L 775 ${180 - (forecastData.forecastPoints[1].value) * 3} 
                       L 800 ${180 - (forecastData.forecastPoints[2].value) * 3}`}
                    fill="none"
                    stroke="#ec4899"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    className="drop-shadow-[0_2px_4px_rgba(236,72,153,0.3)]"
                  />
                )}

                {/* Markers on each points */}
                {monthlyChartData.map((d, idx) => {
                  const x = 50 + (idx * 140);
                  const yBB = 180 - (d.bahanBaku * 7);
                  const yBP = 180 - (d.bahanPembantu * 7);
                  return (
                    <g key={idx} className="cursor-pointer">
                      {/* Bahan Baku point */}
                      <circle 
                        cx={x} 
                        cy={yBB} 
                        r="4" 
                        fill="#fbbf24" 
                        onMouseEnter={() => setHoveredPoint({ x, y: yBB, text: `Bahan Baku - ${d.month}: Rp ${d.bahanBaku} JT` })}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                      {/* Bahan Pembantu point */}
                      <circle 
                        cx={x} 
                        cy={yBP} 
                        r="4" 
                        fill="#06b6d4" 
                        onMouseEnter={() => setHoveredPoint({ x, y: yBP, text: `Bahan Pembantu - ${d.month}: Rp ${d.bahanPembantu} JT` })}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                      {/* Month Label */}
                      <text x={x} y="195" fill="#64748b" fontSize="10" textAnchor="middle" className="font-mono font-medium">
                        {d.month}
                      </text>
                    </g>
                  );
                })}

                {/* Dotted forecast overlay indicators */}
                {showRegression && (
                  <g>
                    <circle cx="750" cy={180 - (forecastData.forecastPoints[0].value * 3)} r="4.5" fill="#ec4899" />
                    <text x="750" y="195" fill="#ec4899" fontSize="9" textAnchor="middle" className="font-mono font-bold">
                      Jun(Est)
                    </text>
                  </g>
                )}
              </svg>

              {/* Interactive Tooltip popup */}
              {hoveredPoint && (
                <div 
                  className="absolute bg-slate-900 border border-slate-950 text-slate-100 text-[10px] px-2 py-1.5 rounded shadow-lg pointer-events-none font-mono z-10"
                  style={{ left: hoveredPoint.x - 40, top: hoveredPoint.y - 35 }}
                >
                  {hoveredPoint.text}
                </div>
              )}

              {/* Floating forecasting results summary */}
              {showRegression && (
                <div id="forecast_floating_box" className="absolute top-4 right-4 bg-white/95 border border-pink-200 rounded-xl p-3 shadow-lg space-y-1.5 text-[10px] w-52 text-slate-600 z-10">
                  <span className="text-pink-600 font-bold block uppercase tracking-wider text-[9px]">Hasil Peramalan Regresi</span>
                  <div className="flex justify-between border-b border-rose-100/50 pb-1">
                    <span>Persamaan:</span>
                    <span className="font-mono text-slate-800 font-semibold text-[9px]">y = {forecastData.slope.toFixed(2)}x + {forecastData.intercept.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rencana Juli:</span>
                    <span className="font-mono text-emerald-600 font-bold">Rp {forecastData.forecastPoints[1].value} Mpt</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rencana Agst:</span>
                    <span className="font-mono text-emerald-600 font-bold">Rp {forecastData.forecastPoints[2].value} Mpt</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Legend buttons and key explanation indicators */}
          <div id="chart_legend" className="flex items-center justify-center space-x-6 text-xs pt-2 border-t border-slate-50">
            <div className="flex items-center space-x-2">
              <span className="inline-block w-3 h-3 rounded-full bg-amber-400"></span>
              <span className="text-slate-600 font-medium font-sans">Bahan Baku (BB)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-block w-3 h-3 rounded-full bg-cyan-400"></span>
              <span className="text-slate-600 font-medium font-sans">Bahan Penunjang (BP)</span>
            </div>
            {showRegression && (
              <div className="flex items-center space-x-2 animate-pulse">
                <span className="inline-block w-5 h-0.5 border-t-2 border-dashed border-pink-500 font-sans"></span>
                <span className="text-pink-600 font-bold font-sans">Regresi Linier Prediksi</span>
              </div>
            )}
          </div>
        </div>

        {/* Real-time Production Efficiency Card using Recharts */}
        <div id="production_efficiency_card" className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 font-display">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  Efisiensi Produksi Real-Time
                </h3>
                <p className="text-xs text-slate-500">Rasio output aktual vs target harian manufaktur implan</p>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                activeEfficiencyPct >= 100 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : activeEfficiencyPct >= 85 
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                    : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {activeEfficiencyPct}% {activeEfficiencyPct >= 100 ? 'Optimal' : activeEfficiencyPct >= 85 ? 'Memadai' : 'Kurang'}
              </span>
            </div>

            {/* Quick interactive sliders to change real-time simulated inputs */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-250/30 grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[9px] uppercase font-bold text-slate-500 tracking-wider">Target Hari Ini (Pcs)</label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="range" 
                    min="50" 
                    max="220" 
                    value={todayTarget} 
                    onChange={(e) => setTodayTarget(parseInt(e.target.value) || 0)}
                    className="w-full accent-indigo-600 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer" 
                    id="target_input_range"
                  />
                  <span className="text-xs font-extrabold font-mono text-slate-700 dark:text-slate-300 w-7 text-right">{todayTarget}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Output Hari Ini (Pcs)</label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="range" 
                    min="50" 
                    max="220" 
                    value={todayOutput} 
                    onChange={(e) => setTodayOutput(parseInt(e.target.value) || 0)}
                    className="w-full accent-emerald-600 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer" 
                    id="output_input_range"
                  />
                  <span className="text-xs font-extrabold font-mono text-slate-700 dark:text-slate-300 w-7 text-right">{todayOutput}</span>
                </div>
              </div>
            </div>

            {/* Rich Recharts Composed Chart visualizer */}
            <div className="h-44 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={efficiencyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: labelColor, fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: labelColor }} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
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
                  <Bar dataKey="Output" name="Aktual Output" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={25} />
                  <Line type="monotone" dataKey="Target" name="Target Produksi" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, stroke: '#4f46e4', fill: '#ffffff' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px]">
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span>
                <span className="text-slate-500 dark:text-slate-400 font-medium font-sans">Aktual Output</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3.5 h-0.5 bg-indigo-600 inline-block"></span>
                <span className="text-slate-500 dark:text-slate-400 font-medium font-sans">Target Produksi</span>
              </div>
            </div>
            <span className="text-[9px] font-mono font-bold text-slate-400">Status: Real-Time</span>
          </div>
        </div>
      </div>

      {/* 3. FLOW CHART PROSES PRODUKSI (WIP FLOW GRAPH & DETAILS) */}
      <div id="production_process_card" className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 font-display">
              <Layers className="w-4 h-4 text-emerald-500" />
              Flow Chart Proses Produksi
            </h3>
            <p className="text-xs text-slate-500">Pemantauan hasil proses berdasarkan Gudang Setengah Jadi (Mesin 105)</p>
          </div>
          
          <div className="flex items-center space-x-2 text-xs">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-slate-700 focus:outline-none focus:border-indigo-500 font-medium"
            >
              <option value="Maret">Bulan (Maret)</option>
              <option value="April">Bulan (April)</option>
              <option value="Mei">Bulan (Mei)</option>
              <option value="Juni">Bulan (Juni)</option>
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-slate-700 focus:outline-none focus:border-indigo-500 font-medium"
            >
              <option value="2026">Year 2026</option>
              <option value="2027">Year 2027</option>
            </select>
          </div>
        </div>

        {/* The interactive process flowchart nodes exactly like the screenshot */}
        <div id="flow_nodes_row" className="bg-slate-50/50 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl border border-slate-200/60">
          {[
            { id: 'potong', title: 'POTONG', desc: 'Pemotongan Lapisan', count: 100, color: 'hover:border-amber-400 border-amber-200 bg-white' },
            { id: 'jahit', title: 'JAHIT', desc: 'Penjahitan Serat', count: 45, color: 'hover:border-sky-400 border-sky-200 bg-white' },
            { id: 'finishing', title: 'FINISHING', desc: 'Sortir Kualitas', count: 0, color: 'hover:border-emerald-400 border-emerald-200 bg-white' },
            { id: 'packing', title: 'PACKING', desc: 'Pengepakan Pengiriman', count: 0, color: 'hover:border-purple-400 border-purple-200 bg-white' }
          ].map((node) => {
            const isActive = selectedProcessFilter === node.id;
            return (
              <div
                key={node.id}
                onClick={() => setSelectedProcessFilter(node.id as any)}
                className={`relative border p-4 rounded-xl cursor-pointer transition-all flex flex-col justify-between items-center text-center select-none shadow-sm ${node.color} ${
                  isActive ? 'ring-2 ring-indigo-600 scale-102 shadow-md shadow-indigo-600/5' : 'opacity-85 hover:opacity-100'
                }`}
              >
                <div className="space-y-0.5">
                  <span className="text-[10px] tracking-wider font-bold text-slate-700 block">{node.title}</span>
                  <span className="text-[9px] text-slate-400 block">{node.desc}</span>
                </div>
                
                {/* Visual badge inside layout */}
                <div className="mt-3.5 bg-slate-50 border border-slate-200/80 rounded-lg px-4 py-2 flex flex-col items-center justify-center min-w-[70px]">
                  <span className="text-lg font-extrabold font-mono text-indigo-600">{node.count}</span>
                  <span className="text-[9px] text-slate-400 uppercase tracking-widest leading-none mt-0.5 font-semibold font-mono">pcs</span>
                </div>

                {isActive && (
                  <span className="absolute bottom-1 right-2 text-[8px] bg-indigo-600 px-1 rounded text-white font-bold uppercase tracking-wider">Active</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Detail WIP pada Periode Terpilih */}
        <div id="wip_period_details" className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Detail WIP pada Periode Terpilih ({selectedProcessFilter.toUpperCase()})
            </h4>
            <button 
              onClick={() => setSelectedProcessFilter('semua')}
              className="text-[10px] text-indigo-600 hover:underline hover:text-indigo-800 font-bold cursor-pointer"
            >
              Lihat Semua WIP Component
            </button>
          </div>
          
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-2.5 px-4">Tanggal</th>
                  <th className="py-2.5 px-4 col-span-2">Master Komponen (Code / Name)</th>
                  <th className="py-2.5 px-4 text-center">Proses</th>
                  <th className="py-2.5 px-4 text-right">Kuantitas</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredWIPList.length > 0 ? (
                  filteredWIPList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/75 text-slate-700 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500">{item.date}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800 font-display">{item.code}</span>
                        <span className="text-[11px] block text-slate-400 mt-0.5">{item.name}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          item.currentProcess === 'potong' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          item.currentProcess === 'jahit' ? 'bg-sky-50 text-sky-700 border border-sky-200' :
                          item.currentProcess === 'finishing' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}>
                          {item.currentProcess}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-indigo-600">{item.quantity} <span className="text-[10px] text-slate-400 font-normal">Pcs</span></td>
                      <td className="py-3 px-4 text-center">
                        <span className="bg-indigo-50 text-indigo-700 border border-indigo-200/50 font-bold px-2.5 py-0.5 rounded text-[10px] uppercase tracking-wider">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                      Tidak ada komponen WIP yang sedang berada di proses "{selectedProcessFilter}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. CALENDAR SCHEDULER VIEW */}
      <div id="calendar_card" className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 font-display">
              <CalendarIcon className="w-4 h-4 text-indigo-500" />
              Jadwal Produksi &amp; Pengiriman (Calendar View)
            </h3>
            <p className="text-xs text-slate-500">Jadwal batch WIP dan perkiraan penerimaan bahan baku</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              id="add_event_btn"
              onClick={() => setShowAddEventModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm shadow-indigo-600/10 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Tambah Jadwal
            </button>
            <div className="flex items-center space-x-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200 text-xs">
              <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-200 rounded cursor-pointer transition-colors"><ChevronLeft className="w-4 h-4 text-slate-500" /></button>
              <span className="font-bold text-slate-700 px-2 font-display">{monthNames[calendarMonth]} {calendarYear}</span>
              <button onClick={handleNextMonth} className="p-1 hover:bg-slate-200 rounded cursor-pointer transition-colors"><ChevronRight className="w-4 h-4 text-slate-500" /></button>
            </div>
          </div>
        </div>

        {/* Calendar Grid Layout */}
        <div id="calendar_grid_wrapper" className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 bg-slate-50 text-center text-slate-500 text-[10px] py-2.5 font-bold font-display uppercase tracking-wider border-b border-slate-200/85">
            {dayNames.map((d, index) => (
              <div key={d} className={index === 0 || index === 6 ? 'text-rose-550' : ''}>
                {d}
              </div>
            ))}
          </div>

          {/* Day boxes */}
          <div id="calendar_days_grid" className="grid grid-cols-7 divide-x divide-y divide-slate-100 bg-white">
            {calendarDays.map((day, idx) => {
              const dayEvents = getEventsForDate(day.dateStr);
              return (
                <div 
                  key={idx} 
                  className={`min-h-[85px] p-2 flex flex-col justify-between transition-colors hover:bg-slate-50/40 ${
                    day.isMainMonth ? 'bg-white' : 'bg-slate-50/50 opacity-55'
                  }`}
                >
                  <span className={`text-[10px] font-bold font-mono ${
                    day.isMainMonth ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    {day.dayNum}
                  </span>
                  
                  {/* Event cards list */}
                  <div className="mt-1 space-y-1.5 overflow-y-auto max-h-[55px]">
                    {dayEvents.map((evt) => (
                      <div 
                        key={evt.id}
                        title={evt.notes || evt.title}
                        className={`text-[9px] px-1.5 py-0.5 rounded leading-tight select-none border font-semibold cursor-default ${
                          evt.category === 'WIP' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/50' 
                            : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100/50'
                        }`}
                      >
                        <div className="flex items-center space-x-1 justify-between">
                          <span className="truncate">{evt.title}</span>
                          <span className="text-[7px] shrink-0 uppercase opacity-75 font-mono">{evt.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend color guides */}
        <div id="calendar_legend" className="flex items-center space-x-4 text-[10px] justify-start py-1">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
            <span className="text-slate-500 font-semibold">Batch Produksi (WIP)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded bg-blue-500"></span>
            <span className="text-slate-500 font-semibold">Penerimaan &amp; Pengiriman Bahan Baku/Pembantu</span>
          </div>
        </div>
      </div>

      {/* 5. RECENT SUPPLY ARRIVALS LIST MATCHING SCREENSHOT EXACTLY */}
      <div id="recent_arrivals_card" className="bg-white border border-slate-200 rounded-xl p-6 space-y-3.5 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 font-display">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Recent Supply Arrivals
            </h3>
            <p className="text-xs text-slate-500">Daftar transaksi penerimaan material gudang terkini</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-2.5 px-4 font-mono text-[9px]">Tanggal</th>
                <th className="py-2.5 px-4">Tipe</th>
                <th className="py-2.5 px-4">Supplier</th>
                <th className="py-2.5 px-4">Barang</th>
                <th className="py-2.5 px-4 text-right">Nilai Rupiah (Total)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {supplyArrivals.length > 0 ? (
                supplyArrivals.map((arr) => (
                  <tr key={arr.id} className="hover:bg-slate-50/75 text-slate-700 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500">{arr.date}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                        arr.type === 'Bahan Baku'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {arr.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800 font-display">{arr.supplierName}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] text-slate-700 font-semibold">{arr.itemName}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Qty: {arr.quantity} {arr.unit}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-indigo-600 font-mono">
                      {formatRupiah(arr.totalPrice)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                    Belum ada riwayat penerimaan barang dari supplier.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SCHEDULE ADD FORM MODAL */}
      {showAddEventModal && (
        <div id="add_schedule_modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl p-6 shadow-2xl relative space-y-4">
            <h3 className="text-sm font-bold text-slate-850 font-display flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-indigo-500" />
              Tambah Rencana Jadwal Baru
            </h3>
            <p className="text-xs text-slate-500">Atur jadwal produksi WIP atau kedatangan PO di lembar perencanaan calendar.</p>
            
            <form onSubmit={handleAddEvent} className="space-y-3.5">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-wider">Judul Kegiatan / Batch</label>
                <input
                  type="text"
                  required
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="Contoh: IDU-M2102 potong, Estimasi PO-01"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-wider">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-wider">Status Awal</label>
                  <input
                    type="text"
                    disabled
                    value="Pending / WIP"
                    className="w-full bg-slate-100 border border-slate-150 rounded-lg px-2 py-1.5 text-xs text-slate-400 focus:outline-none font-mono font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-wider">Tipe</label>
                  <select
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                  >
                    <option value="produksi">Produksi</option>
                    <option value="pengiriman">Pengiriman / Logistik</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-wider">Kategori</label>
                  <select
                    value={newEventCategory}
                    onChange={(e) => setNewEventCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                  >
                    <option value="WIP">WIP (Gudang Setengah Jadi)</option>
                    <option value="Penerimaan">Penerimaan (Bahan Baku/BP)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-wider">Catatan Tambahan</label>
                <textarea
                  value={newEventNotes}
                  onChange={(e) => setNewEventNotes(e.target.value)}
                  placeholder="Keterangan jalur produksi atau nomor PO..."
                  lines={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium font-sans"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddEventModal(false)}
                  className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-650 text-xs font-bold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-sm shadow-indigo-600/10"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
