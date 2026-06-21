import React, { useState, useEffect } from "react";
import { 
  Wifi, 
  WifiOff, 
  RotateCw, 
  Loader2,
  AlertCircle
} from "lucide-react";
import Header from "./components/Header";
import POSView from "./components/POSView";
import InventoryView from "./components/InventoryView";
import ShiftsView from "./components/ShiftsView";
import LoyaltyView from "./components/LoyaltyView";
import ReportsView from "./components/ReportsView";
import SettingsView from "./components/SettingsView";
import { 
  seedInitialDatabase,
  subscribeToSettings,
  saveSettings,
  subscribeToBranches,
  addBranch,
  subscribeToMenuItems,
  addMenuItem,
  subscribeToInventory,
  updateInventoryStock,
  addInventoryItem,
  subscribeToEmployees,
  addEmployee,
  subscribeToShifts,
  addShift,
  updateShiftStatus,
  subscribeToLoyaltyCustomers,
  addLoyaltyCustomer,
  subscribeToTransactions,
  completeTransaction
} from "./dbService";
import { 
  Branch, 
  MenuItem, 
  InventoryItem, 
  Transaction, 
  Employee, 
  Shift, 
  LoyaltyCustomer, 
  AppSettings,
  TaxConfig,
  ReceiptSettings
} from "./types";
import { 
  DEFAULT_BRANCHES, 
  DEFAULT_TAX_CONFIGS, 
  DEFAULT_RECEIPT_SETTINGS 
} from "./dataMock";

export default function App() {
  // Navigation states
  const [activeTab, setActiveTab] = useState("pos");
  
  // Real-time synchronization state
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncPending, setSyncPending] = useState(false);

  // Loaded database collections states
  const [branches, setBranches] = useState<Branch[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loyaltyCustomers, setLoyaltyCustomers] = useState<LoyaltyCustomer[]>([]);
  
  const [selectedBranchId, setSelectedBranchId] = useState("branch-1");
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // System settings (taxes, receipts)
  const [appSettings, setAppSettings] = useState<AppSettings>({
    id: "global",
    receipt: DEFAULT_RECEIPT_SETTINGS,
    taxes: DEFAULT_TAX_CONFIGS
  });

  // Database loading state
  const [loading, setLoading] = useState(true);

  // 1. Listen to connectivity changes
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  // 2. Load system-wide collections
  useEffect(() => {
    setLoading(true);

    const unsubSettings = subscribeToSettings((settings) => {
      setAppSettings(settings);
    });

    const unsubBranches = subscribeToBranches((branchList) => {
      setBranches(branchList);
      if (branchList.length > 0) {
        // Fallback or seed detection
        // If "branch-1" matches the seeded list, set that as selected
        const matchesDefault = branchList.some(b => b.id === "branch-1");
        if (matchesDefault) {
          setSelectedBranchId("branch-1");
        } else {
          setSelectedBranchId(branchList[0].id);
        }
      }
    });

    const unsubMenuItems = subscribeToMenuItems((items) => {
      setMenuItems(items);
    });

    const unsubEmployees = subscribeToEmployees((employeesList) => {
      setEmployees(employeesList);
    });

    const unsubLoyalty = subscribeToLoyaltyCustomers((customers) => {
      setLoyaltyCustomers(customers);
    });

    // Timeout loading state so the POS can render instantly from local cache structures
    const loadTimer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    return () => {
      unsubSettings();
      unsubBranches();
      unsubMenuItems();
      unsubEmployees();
      unsubLoyalty();
      clearTimeout(loadTimer);
    };
  }, []);

  // 3. Load branch-specific collections
  useEffect(() => {
    if (!selectedBranchId) return;

    const unsubInventory = subscribeToInventory(selectedBranchId, (items) => {
      setInventoryItems(items);
    });

    const unsubShifts = subscribeToShifts(selectedBranchId, (shiftsList) => {
      setShifts(shiftsList);
    });

    const unsubTransactions = subscribeToTransactions(selectedBranchId, (txList) => {
      // Sort transactions descending by date
      const sorted = [...txList].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setTransactions(sorted);
    });

    return () => {
      unsubInventory();
      unsubShifts();
      unsubTransactions();
    };
  }, [selectedBranchId]);

  // Automated first-mount base seeding detection
  useEffect(() => {
    const triggerDatabaseCheckAndSeed = async () => {
      // Wait shortly for snapshots to populate offline records
      await new Promise(resolve => setTimeout(resolve, 2000));
      if (branches.length === 0 && menuItems.length === 0) {
        console.log("Empty database detected. Auto seeding GourmetPOS starter collections...");
        await seedInitialDatabase();
      }
    };
    triggerDatabaseCheckAndSeed();
  }, [branches.length, menuItems.length]);

  // Handler functions matching database operations
  const handleCompleteTransaction = async (tx: Transaction) => {
    setSyncPending(true);
    try {
      await completeTransaction(tx, menuItems, inventoryItems);
    } catch (e) {
      console.error("Deducting inventory / checkout failure state", e);
    } finally {
      setSyncPending(false);
    }
  };

  const handleAddEmployee = async (emp: Employee) => {
    await addEmployee(emp);
  };

  const handleAddShift = async (sht: Shift) => {
    await addShift(sht);
  };

  const handleUpdateShiftStatus = async (shiftId: string, status: 'Scheduled' | 'Completed' | 'Absent') => {
    await updateShiftStatus(shiftId, status);
  };

  const handleAddLoyaltyCustomer = async (name: string, phone: string, email: string) => {
    const customer: LoyaltyCustomer = {
      id: "lc-" + Math.floor(1000 + Math.random() * 9000),
      name,
      phone,
      email,
      pointsBalance: 0,
      createdAt: new Date().toISOString()
    };
    await addLoyaltyCustomer(customer);
  };

  const handleSaveAppTaxesAndReceiptInfo = async (receipt: ReceiptSettings, taxes: TaxConfig[]) => {
    await saveSettings(receipt, taxes);
  };

  const handleAddBranch = async (b: Branch) => {
    await addBranch(b);
  };

  const handleProcessDatabaseSeeding = async () => {
    return await seedInitialDatabase();
  };

  const handleUpdateStockQuantity = async (itemId: string, newQty: number) => {
    await updateInventoryStock(itemId, newQty);
  };

  const handleAddInventoryStock = async (item: InventoryItem) => {
    await addInventoryItem(item);
  };

  // Safe branches fallback during Firestore bootstrapping
  const activeBranches = branches.length > 0 ? branches : DEFAULT_BRANCHES;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans selection:bg-orange-100 selection:text-orange-900 leading-normal antialiased">
      
      {/* HEADER BAR */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        branches={activeBranches}
        selectedBranchId={selectedBranchId}
        setSelectedBranchId={setSelectedBranchId}
        isOnline={isOnline}
        syncPending={syncPending}
        activeCashierName="David Miller"
      />

      {/* OFFLINE INDICATOR BAR (Slide down banner if offline) */}
      {!isOnline && (
        <div className="bg-amber-600 text-white py-2 px-4 shadow-inner text-xs font-semibold flex items-center justify-center gap-1.5 animate-pulse">
          <WifiOff className="h-4 w-4" />
          <span>You are currently operating offline. Transactions are safely queued, ingredient stocks deducted, and rewards points accumulated locally inside IndexedDB. Will sync automatically when connectivity returns.</span>
        </div>
      )}

      {/* CORE DISPLAY STAGE CONTAINER */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        
        {loading && branches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-stone-505">
            <Loader2 className="h-10 w-10 text-orange-600 animate-spin" />
            <p className="mt-4 text-sm font-bold tracking-tight">Accessing Secured IndexedDB Storage Cache...</p>
            <p className="text-xs text-stone-400 mt-1">Bootstrapping restaurant configurations and active rosters.</p>
          </div>
        ) : (
          <div className="animate-fadeIn">
            
            {/* POS VIEW PORTAL */}
            {activeTab === "pos" && (
              <POSView
                branchId={selectedBranchId}
                menuItems={menuItems}
                inventoryItems={inventoryItems}
                loyaltyCustomers={loyaltyCustomers}
                taxConfigs={appSettings.taxes}
                receiptSettings={appSettings.receipt}
                onSubmitTransaction={handleCompleteTransaction}
                onAddLoyaltyCustomer={handleAddLoyaltyCustomer}
              />
            )}

            {/* INVENTORY TRACKER PORTAL */}
            {activeTab === "inventory" && (
              <InventoryView
                branchId={selectedBranchId}
                inventoryItems={inventoryItems}
                menuItems={menuItems}
                onUpdateStock={handleUpdateStockQuantity}
                onAddInventoryItem={handleAddInventoryStock}
              />
            )}

            {/* ROSTERS & SCHEDULES WORKFLOW PORTAL */}
            {activeTab === "shifts" && (
              <ShiftsView
                branchId={selectedBranchId}
                employees={employees}
                shifts={shifts}
                onAddShift={handleAddShift}
                onUpdateShiftStatus={handleUpdateShiftStatus}
                onAddEmployee={handleAddEmployee}
              />
            )}

            {/* LOYALTY REWARDS PORTAL */}
            {activeTab === "loyalty" && (
              <LoyaltyView
                customers={loyaltyCustomers}
                transactions={transactions}
                onAddCustomer={handleAddLoyaltyCustomer}
              />
            )}

            {/* REPORTING ANALYTICS PORTAL */}
            {activeTab === "reports" && (
              <ReportsView
                branchId={selectedBranchId}
                transactions={transactions}
              />
            )}

            {/* SYSTEM PRESET PREFERENCES PORTAL */}
            {activeTab === "settings" && (
              <SettingsView
                branches={activeBranches}
                receiptSettings={appSettings.receipt}
                taxConfigs={appSettings.taxes}
                onSaveSettings={handleSaveAppTaxesAndReceiptInfo}
                onAddBranch={handleAddBranch}
                onSeedDatabase={handleProcessDatabaseSeeding}
              />
            )}

          </div>
        )}

      </main>

      {/* STATIC INLINE FOOTER (humble, clean, and literal) */}
      <footer className="mt-12 py-6 border-t border-stone-200/60 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center justify-between text-[11px] text-stone-500 font-medium">
          <div className="flex items-center gap-1 text-stone-850">
            <span className="font-bold">GourmetPOS Restaurant System</span>
            <span>• Offline-First Client Architecture</span>
          </div>
          <div>All cached database transactions are secured.</div>
        </div>
      </footer>

    </div>
  );
}
