import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  writeBatch,
  increment,
  onSnapshotsInSync,
  getDoc
} from "firebase/firestore";
import { db } from "./firebase";
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
  DEFAULT_MENU_ITEMS, 
  DEFAULT_EMPLOYEES, 
  DEFAULT_LOYALTY_CUSTOMERS, 
  DEFAULT_TAX_CONFIGS, 
  DEFAULT_RECEIPT_SETTINGS, 
  getInitialInventoryList 
} from "./dataMock";

// Safe helper to write multiple documents
export async function seedInitialDatabase() {
  try {
    // 1. Seed Branches
    const branchesSnapshot = await getDocs(collection(db, "branches"));
    if (branchesSnapshot.empty) {
      for (const branch of DEFAULT_BRANCHES) {
        await setDoc(doc(db, "branches", branch.id), branch);
        
        // Also seed initial inventory for each branch
        const inventoryList = getInitialInventoryList(branch.id);
        for (const item of inventoryList) {
          await setDoc(doc(db, "inventory", item.id), item);
        }
      }
    }

    // 2. Seed Menu Items
    const menuSnapshot = await getDocs(collection(db, "menu_items"));
    if (menuSnapshot.empty) {
      for (const menuItem of DEFAULT_MENU_ITEMS) {
        await setDoc(doc(db, "menu_items", menuItem.id), menuItem);
      }
    }

    // 3. Seed Employees
    const employeeSnapshot = await getDocs(collection(db, "employees"));
    if (employeeSnapshot.empty) {
      for (const employee of DEFAULT_EMPLOYEES) {
        await setDoc(doc(db, "employees", employee.id), employee);
      }
    }

    // 4. Seed Loyalty Customers
    const loyaltySnapshot = await getDocs(collection(db, "loyalty_customers"));
    if (loyaltySnapshot.empty) {
      for (const customer of DEFAULT_LOYALTY_CUSTOMERS) {
        await setDoc(doc(db, "loyalty_customers", customer.id), customer);
      }
    }

    // 5. Seed Settings
    const settingsDoc = await getDoc(doc(db, "settings", "global"));
    if (!settingsDoc.exists()) {
      await setDoc(doc(db, "settings", "global"), {
        id: "global",
        receipt: DEFAULT_RECEIPT_SETTINGS,
        taxes: DEFAULT_TAX_CONFIGS
      });
    }

    console.log("Database seeded successfully!");
    return true;
  } catch (error) {
    console.error("Error seeding initial database: ", error);
    return false;
  }
}

// ---------------- SUBSCRIPTIONS & CRUDS ----------------

// 1. AppSettings
export function subscribeToSettings(onUpdate: (settings: AppSettings) => void) {
  return onSnapshot(doc(db, "settings", "global"), (snap) => {
    if (snap.exists()) {
      onUpdate(snap.data() as AppSettings);
    } else {
      // Return default
      onUpdate({
        id: "global",
        receipt: DEFAULT_RECEIPT_SETTINGS,
        taxes: DEFAULT_TAX_CONFIGS
      });
    }
  });
}

export async function saveSettings(receipt: ReceiptSettings, taxes: TaxConfig[]) {
  await setDoc(doc(db, "settings", "global"), {
    id: "global",
    receipt,
    taxes
  }, { merge: true });
}

// 2. Branches
export function subscribeToBranches(onUpdate: (branches: Branch[]) => void) {
  return onSnapshot(collection(db, "branches"), (querySnapshot) => {
    const list: Branch[] = [];
    querySnapshot.forEach((doc) => {
      list.push(doc.data() as Branch);
    });
    onUpdate(list);
  }, (err) => {
    console.error("Branches snapshot error, falling back", err);
    onUpdate(DEFAULT_BRANCHES);
  });
}

export async function addBranch(branch: Branch) {
  await setDoc(doc(db, "branches", branch.id), branch);
  // Prepare inventory for this branch as well
  const inventoryList = getInitialInventoryList(branch.id);
  const batch = writeBatch(db);
  for (const item of inventoryList) {
    const invRef = doc(db, "inventory", item.id);
    batch.set(invRef, item);
  }
  await batch.commit();
}

// 3. Menu Items
export function subscribeToMenuItems(onUpdate: (items: MenuItem[]) => void) {
  return onSnapshot(collection(db, "menu_items"), (querySnapshot) => {
    const list: MenuItem[] = [];
    querySnapshot.forEach((doc) => {
      list.push(doc.data() as MenuItem);
    });
    onUpdate(list);
  }, (err) => {
    console.error("Menu snapshot error, falling back", err);
    onUpdate(DEFAULT_MENU_ITEMS);
  });
}

export async function addMenuItem(item: MenuItem) {
  await setDoc(doc(db, "menu_items", item.id), item);
}

export async function updateMenuItem(item: MenuItem) {
  await setDoc(doc(db, "menu_items", item.id), item, { merge: true });
}

// 4. Inventory List
export function subscribeToInventory(branchId: string, onUpdate: (items: InventoryItem[]) => void) {
  const q = query(collection(db, "inventory"), where("branchId", "==", branchId));
  return onSnapshot(q, (querySnapshot) => {
    const list: InventoryItem[] = [];
    querySnapshot.forEach((doc) => {
      list.push(doc.data() as InventoryItem);
    });
    onUpdate(list);
  }, (err) => {
    console.error("Inventory error", err);
    onUpdate(getInitialInventoryList(branchId));
  });
}

export async function updateInventoryStock(itemId: string, newQty: number) {
  const ref = doc(db, "inventory", itemId);
  await updateDoc(ref, { quantity: newQty });
}

export async function addInventoryItem(item: InventoryItem) {
  await setDoc(doc(db, "inventory", item.id), item);
}

// 5. Employees
export function subscribeToEmployees(onUpdate: (employees: Employee[]) => void) {
  return onSnapshot(collection(db, "employees"), (querySnapshot) => {
    const list: Employee[] = [];
    querySnapshot.forEach((doc) => {
      list.push(doc.data() as Employee);
    });
    onUpdate(list);
  }, (err) => {
    onUpdate(DEFAULT_EMPLOYEES);
  });
}

export async function addEmployee(employee: Employee) {
  await setDoc(doc(db, "employees", employee.id), employee);
}

// 6. Shifts
export function subscribeToShifts(branchId: string, onUpdate: (shifts: Shift[]) => void) {
  const q = query(collection(db, "shifts"), where("branchId", "==", branchId));
  return onSnapshot(q, (querySnapshot) => {
    const list: Shift[] = [];
    querySnapshot.forEach((doc) => {
      list.push(doc.data() as Shift);
    });
    onUpdate(list);
  }, (err) => {
    onUpdate([]);
  });
}

export async function addShift(shift: Shift) {
  await setDoc(doc(db, "shifts", shift.id), shift);
}

export async function updateShiftStatus(shiftId: string, status: 'Scheduled' | 'Completed' | 'Absent') {
  await updateDoc(doc(db, "shifts", shiftId), { status });
}

// 7. Loyalty Customers
export function subscribeToLoyaltyCustomers(onUpdate: (customers: LoyaltyCustomer[]) => void) {
  return onSnapshot(collection(db, "loyalty_customers"), (querySnapshot) => {
    const list: LoyaltyCustomer[] = [];
    querySnapshot.forEach((doc) => {
      list.push(doc.data() as LoyaltyCustomer);
    });
    onUpdate(list);
  }, (err) => {
    onUpdate(DEFAULT_LOYALTY_CUSTOMERS);
  });
}

export async function addLoyaltyCustomer(customer: LoyaltyCustomer) {
  await setDoc(doc(db, "loyalty_customers", customer.id), customer);
}

export async function updateCustomerPoints(customerId: string, pointsChange: number) {
  const ref = doc(db, "loyalty_customers", customerId);
  await updateDoc(ref, {
    pointsBalance: increment(pointsChange)
  });
}

// 8. Transactions & POS order completion
export function subscribeToTransactions(branchId: string, onUpdate: (transactions: Transaction[]) => void) {
  const q = query(collection(db, "transactions"), where("branchId", "==", branchId));
  return onSnapshot(q, (querySnapshot) => {
    const list: Transaction[] = [];
    querySnapshot.forEach((doc) => {
      list.push(doc.data() as Transaction);
    });
    onUpdate(list);
  }, (err) => {
    onUpdate([]);
  });
}

// Submit transaction and atomically deduct inventory quantities based on ingredient mapping
export async function completeTransaction(
  transaction: Transaction,
  menuItems: MenuItem[],
  inventoryItems: InventoryItem[]
) {
  const batch = writeBatch(db);

  // 1. Write the transaction
  const txRef = doc(db, "transactions", transaction.id);
  batch.set(txRef, transaction);

  // 2. Adjust loyalty point balances
  if (transaction.customerId) {
    const loyaltyRef = doc(db, "loyalty_customers", transaction.customerId);
    const balanceChange = transaction.loyaltyPointsEarned - transaction.loyaltyPointsRedeemed;
    batch.update(loyaltyRef, {
      pointsBalance: increment(balanceChange)
    });
  }

  // 3. Deduct inventory ingredients
  for (const orderItem of transaction.items) {
    const mItem = menuItems.find(i => i.id === orderItem.itemId);
    if (mItem && mItem.ingredients) {
      for (const ingredient of mItem.ingredients) {
        // Find matching inventory items for this branch
        // For menu-level ingredient mapping like 'inv-beef-patty', we map to the branch specific inventory ID: `inv-beef-patty-${branchId}`
        const specificInvId = `${ingredient.inventoryId}-${transaction.branchId}`;
        const invItemInDb = inventoryItems.find(x => x.id === specificInvId);
        if (invItemInDb) {
          const deduction = ingredient.quantityNeeded * orderItem.quantity;
          const invRef = doc(db, "inventory", specificInvId);
          batch.update(invRef, {
            quantity: increment(-deduction)
          });
        }
      }
    }
  }

  // Commit batch atomically (works offline too and queues up!)
  await batch.commit();
}
