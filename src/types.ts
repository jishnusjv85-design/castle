export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl?: string;
  description?: string;
  branches: string[]; // branchIds where available
  ingredients?: {
    inventoryId: string;
    quantityNeeded: number; // e.g. 0.1 for 100g
  }[];
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string; // kg, liters, pcs, pack
  reorderPoint: number;
  unitPrice: number;
  supplier: string;
  branchId: string;
}

export interface TaxConfig {
  id: string;
  name: string;
  rate: number; // e.g., 0.05 for 5%
  isEnabled: boolean;
}

export interface ReceiptItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export interface CalculatedTax {
  taxId: string;
  name: string;
  rate: number;
  amount: number;
}

export interface Transaction {
  id: string;
  receiptNumber: string;
  branchId: string;
  items: ReceiptItem[];
  subtotal: number;
  taxes: CalculatedTax[];
  taxTotal: number;
  discount: number; // in dollars
  total: number;
  paymentMethod: 'Cash' | 'Card' | 'Digital';
  customerId?: string; // for loyalty
  customerName?: string;
  loyaltyPointsEarned: number;
  loyaltyPointsRedeemed: number;
  timestamp: string; // ISO String
  cashierId: string;
  cashierName: string;
}

export interface Employee {
  id: string;
  name: string;
  role: 'Cashier' | 'Chef' | 'Waiter' | 'Manager';
  phone: string;
  email: string;
  isActive: boolean;
}

export interface Shift {
  id: string;
  employeeId: string;
  employeeName: string;
  branchId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  role: string;
  status: 'Scheduled' | 'Completed' | 'Absent';
}

export interface LoyaltyCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  pointsBalance: number;
  createdAt: string; // ISO String
}

export interface ReceiptSettings {
  shopName: string;
  address: string;
  phone: string;
  headerMessage: string;
  footerMessage: string;
}

export interface AppSettings {
  id: string;
  receipt: ReceiptSettings;
  taxes: TaxConfig[];
}
