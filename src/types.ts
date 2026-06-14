export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  category: 'Bahan Baku' | 'Bahan Pembantu' | 'Keduanya';
}

export interface ComponentWIP {
  id: string;
  code: string;
  name: string;
  currentProcess: 'potong' | 'jahit' | 'finishing' | 'packing';
  quantity: number;
  status: 'WIP' | 'Selesai';
  date: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  estimatedDelivery: string;
  status: 'Pending' | 'Selesai' | 'Dibatalkan';
  items: Array<{
    name: string;
    quantity: number;
    unit: string;
    price: number;
  }>;
  totalAmount: number;
}

export interface SupplyArrival {
  id: string;
  date: string;
  type: 'Bahan Baku' | 'Bahan Pembantu';
  supplierName: string;
  itemName: string;
  quantity: number;
  unit: string;
  totalPrice: number;
}

export interface StockProduct {
  id: string;
  code: string;
  name: string;
  stock: number;
  unit: string;
  unitPrice: number;
  category: string;
}

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  type: 'produksi' | 'pengiriman';
  category: 'WIP' | 'Penerimaan';
  status: string;
  notes?: string;
}

export interface AverageUsage {
  materialName: string;
  avgUsagePerDay: number; // For Linear Regression
}

export interface ActivityLog {
  id: string;
  timestamp: string; // YYYY-MM-DD HH:mm:ss
  type: 'stock' | 'transaction' | 'wip' | 'pembelian' | 'supplier' | 'system';
  action: string;
  details: string;
  actor: string;
}

