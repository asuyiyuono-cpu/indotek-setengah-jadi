import { Supplier, ComponentWIP, PurchaseOrder, SupplyArrival, StockProduct, CalendarEvent } from './types';

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'PT Titanium Medika Utama',
    contactName: 'Bapak Haryanto',
    phone: '021-8274920',
    email: 'sales@titaniummedika.co.id',
    address: 'Kwasan Industri Jababeka V, Blok C-12, Cikarang',
    category: 'Bahan Baku'
  },
  {
    id: 'sup-2',
    name: 'PT BioPolymer Orthopedic',
    contactName: 'Ibu Listiawati',
    phone: '022-7778844',
    email: 'info@biopolymerortho.com',
    address: 'Jl. Surya Sejahtera No. 45, Bandung',
    category: 'Bahan Pembantu'
  },
  {
    id: 'sup-3',
    name: 'PT Global Sterile Implants',
    contactName: 'Andi Wijaya',
    phone: '021-22334455',
    email: 'sterile@globalimplants.co.id',
    address: 'Pergudangan Cengkareng Indah F/12, Jakarta',
    category: 'Keduanya'
  }
];

export const INITIAL_WIP_COMPONENTS: ComponentWIP[] = [
  {
    id: 'wip-1',
    code: 'IDU-PLT-01',
    name: 'IDU-PLT-01 - Titanium Bone Plate LCP 3.5mm Sub-Assembly Machining',
    currentProcess: 'potong',
    quantity: 100,
    status: 'WIP',
    date: '2026-06-14'
  },
  {
    id: 'wip-2',
    code: 'IDU-SCW-02',
    name: 'IDU-SCW-02 - Cortical Bone Screw 2.7mm Threading & Polishing',
    currentProcess: 'jahit',
    quantity: 45,
    status: 'WIP',
    date: '2026-06-14'
  }
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-1',
    poNumber: 'PO-2026-001',
    supplierId: 'sup-1',
    supplierName: 'PT Titanium Medika Utama',
    orderDate: '2026-06-10',
    estimatedDelivery: '2026-06-14',
    status: 'Selesai',
    items: [
      { name: 'Titanium Rod Alloy Ti-6Al-4V', quantity: 90, unit: 'Batang', price: 450000 }
    ],
    totalAmount: 40500000
  },
  {
    id: 'po-2',
    poNumber: 'PO-2026-002',
    supplierId: 'sup-2',
    supplierName: 'PT BioPolymer Orthopedic',
    orderDate: '2026-06-12',
    estimatedDelivery: '2026-06-14',
    status: 'Selesai',
    items: [
      { name: 'Suture Thread High-Strength PLLA', quantity: 100, unit: 'Box', price: 65000 }
    ],
    totalAmount: 6500000
  },
  {
    id: 'po-3',
    poNumber: 'PO-2026-003',
    supplierId: 'sup-3',
    supplierName: 'PT Global Sterile Implants',
    orderDate: '2026-06-13',
    estimatedDelivery: '2026-06-18',
    status: 'Pending',
    items: [
      { name: 'Medical Grade PEEK Polymer Cylinder', quantity: 30, unit: 'Pcs', price: 350000 }
    ],
    totalAmount: 10500000
  }
];

export const INITIAL_SUPPLY_ARRIVALS: SupplyArrival[] = [
  {
    id: 'arr-1',
    date: '2026-06-14',
    type: 'Bahan Baku',
    supplierName: 'PT Titanium Medika Utama',
    itemName: 'Titanium Rod Alloy Ti-6Al-4V (90)',
    quantity: 90,
    unit: 'Batang',
    totalPrice: 40500000
  },
  {
    id: 'arr-2',
    date: '2026-06-14',
    type: 'Bahan Pembantu',
    supplierName: 'PT BioPolymer Orthopedic',
    itemName: 'Suture Thread High-Strength PLLA (100)',
    quantity: 100,
    unit: 'Box',
    totalPrice: 6500000
  }
];

export const INITIAL_STOCK_PRODUCTS: StockProduct[] = [
  {
    id: 'fg-1',
    code: 'FG-MPL-01',
    name: 'Titanium Pedicle Orthopedic Screw System',
    stock: 250,
    unit: 'Pcs',
    unitPrice: 3800000,
    category: 'Pedicle Screw'
  },
  {
    id: 'fg-2',
    code: 'FG-MPL-02',
    name: 'PEEK Medical Spinal Interbody Fusion Cage',
    stock: 180,
    unit: 'Pcs',
    unitPrice: 5400000,
    category: 'Spinal Cage'
  },
  {
    id: 'fg-3',
    code: 'FG-MPL-03',
    name: 'Cobalt-Chrome Total Hip Joint Prosthesis',
    stock: 95,
    unit: 'Set',
    unitPrice: 18500000,
    category: 'Hip Joint'
  }
];

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'cal-1',
    date: '2026-06-01',
    title: 'IDU-PLT-01 bubut titanium',
    type: 'produksi',
    category: 'WIP',
    status: 'Selesai',
    notes: 'Pemotongan awal komponen titanium bone plate LCP 3.5mm'
  },
  {
    id: 'cal-2',
    date: '2026-06-14',
    title: 'IDU-SCW-02 threading',
    type: 'produksi',
    category: 'WIP',
    status: 'WIP',
    notes: 'Pembuatan ulir sekrup tulang kortikal & polishing steril'
  },
  {
    id: 'cal-3',
    date: '2026-06-10',
    title: 'Penerimaan PO-2026-001 dari PT Titanium',
    type: 'pengiriman',
    category: 'Penerimaan',
    status: 'Selesai',
    notes: 'Titanium rod alloy Ti-6Al-4V telah tiba'
  },
  {
    id: 'cal-4',
    date: '2026-06-18',
    title: 'Estimasi Tiba PO-2026-003',
    type: 'pengiriman',
    category: 'Penerimaan',
    status: 'Pending',
    notes: 'Silinder PEEK dari PT Global Sterile'
  }
];
