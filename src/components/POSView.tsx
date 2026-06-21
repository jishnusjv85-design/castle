import React, { useState, useMemo } from "react";
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  UserPlus, 
  Percent, 
  CheckCircle2, 
  Printer, 
  FileText,
  User,
  Coffee,
  Flame,
  Check,
  AlertTriangle
} from "lucide-react";
import { MenuItem, InventoryItem, LoyaltyCustomer, CalculatedTax, ReceiptItem, Transaction, TaxConfig, ReceiptSettings } from "../types";

interface POSViewProps {
  branchId: string;
  menuItems: MenuItem[];
  inventoryItems: InventoryItem[];
  loyaltyCustomers: LoyaltyCustomer[];
  taxConfigs: TaxConfig[];
  receiptSettings: ReceiptSettings;
  onSubmitTransaction: (tx: Transaction) => Promise<void>;
  onAddLoyaltyCustomer: (name: string, phone: string, email: string) => Promise<void>;
}

export default function POSView({
  branchId,
  menuItems,
  inventoryItems,
  loyaltyCustomers,
  taxConfigs,
  receiptSettings,
  onSubmitTransaction,
  onAddLoyaltyCustomer
}: POSViewProps) {
  // POS States
  const [cart, setCart] = useState<{ item: MenuItem; quantity: number; notes: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [redeemPoints, setRedeemPoints] = useState(false);
  const [manualDiscount, setManualDiscount] = useState<number>(0); // manual dollars off

  // Checkout states
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Digital'>('Cash');
  const [recentTransaction, setRecentTransaction] = useState<Transaction | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  
  // Custom Customer creation in POS
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newCustEmail, setNewCustEmail] = useState("");

  const categories = useMemo(() => {
    const list = ["All"];
    menuItems.forEach(item => {
      if (!list.includes(item.category)) {
        list.push(item.category);
      }
    });
    return list;
  }, [menuItems]);

  // Inventory Stock lookup map for current branch ingredients
  const inventoryMap = useMemo(() => {
    const map = new Map<string, number>();
    inventoryItems.forEach(item => {
      map.set(item.id, item.quantity);
    });
    return map;
  }, [inventoryItems]);

  // Portions calculation for each menu item in this branch based on inventory levels
  const getPortionsAvailable = (item: MenuItem): number => {
    if (!item.ingredients || item.ingredients.length === 0) return 999; // unlimited if no ingredients
    let minPortions = Infinity;
    for (const ing of item.ingredients) {
      const specificId = `${ing.inventoryId}-${branchId}`;
      const stock = inventoryMap.get(specificId) || 0;
      const portions = Math.floor(stock / ing.quantityNeeded);
      if (portions < minPortions) {
        minPortions = portions;
      }
    }
    return minPortions === Infinity ? 0 : minPortions;
  };

  // Filtered menu items
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      // Must be served in this branch
      if (!item.branches.includes(branchId)) return false;
      // Filter by category
      if (selectedCategory !== "All" && item.category !== selectedCategory) return false;
      // Filter by search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          (item.description && item.description.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [menuItems, branchId, selectedCategory, searchQuery]);

  // Loyalty user details
  const selectedCustomer = useMemo(() => {
    return loyaltyCustomers.find(c => c.id === selectedCustomerId) || null;
  }, [loyaltyCustomers, selectedCustomerId]);

  // Cart operations
  const addToCart = (item: MenuItem) => {
    const maxPortions = getPortionsAvailable(item);
    if (maxPortions <= 0) return; // Out of stock items can't be added

    const existingIndex = cart.findIndex(c => c.item.id === item.id);
    if (existingIndex > -1) {
      if (cart[existingIndex].quantity >= maxPortions) return; // Limit to stock
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      setCart(newCart);
    } else {
      setCart([...cart, { item, quantity: 1, notes: "" }]);
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(c => c.item.id !== itemId));
  };

  const updateQty = (itemId: string, val: number, item: MenuItem) => {
    const maxPortions = getPortionsAvailable(item);
    const existingIndex = cart.findIndex(c => c.item.id === itemId);
    if (existingIndex > -1) {
      const newQty = cart[existingIndex].quantity + val;
      if (newQty <= 0) {
        removeFromCart(itemId);
      } else if (newQty <= maxPortions) {
        const newCart = [...cart];
        newCart[existingIndex].quantity = newQty;
        setCart(newCart);
      }
    }
  };

  const updateNotes = (itemId: string, notes: string) => {
    const existingIndex = cart.findIndex(c => c.item.id === itemId);
    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].notes = notes;
      setCart(newCart);
    }
  };

  // Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((acc, c) => acc + c.item.price * c.quantity, 0);
  }, [cart]);

  // Point redemption logic: 10 points = ₹1.00 discount. Maximum up to total or available balance
  const loyaltyPointsRedeemValue = useMemo(() => {
    if (!selectedCustomer || !redeemPoints) return 0;
    // Compute max points we can redeem for the current subtotal
    const maxDiscountAllowed = subtotal;
    const maxPointsRedeemable = Math.min(selectedCustomer.pointsBalance, maxDiscountAllowed * 10);
    return Math.floor(maxPointsRedeemable); // points to deduct
  }, [selectedCustomer, redeemPoints, subtotal]);

  const pointsDiscountAmount = useMemo(() => {
    return loyaltyPointsRedeemValue / 10;
  }, [loyaltyPointsRedeemValue]);

  const discountTotal = useMemo(() => {
    return Math.min(subtotal, manualDiscount + pointsDiscountAmount);
  }, [subtotal, manualDiscount, pointsDiscountAmount]);

  const taxableAmount = useMemo(() => {
    return Math.max(0, subtotal - discountTotal);
  }, [subtotal, discountTotal]);

  const calculatedTaxes = useMemo(() => {
    const taxes: CalculatedTax[] = [];
    taxConfigs.forEach(tax => {
      if (tax.isEnabled) {
        taxes.push({
          taxId: tax.id,
          name: tax.name,
          rate: tax.rate,
          amount: parseFloat((taxableAmount * tax.rate).toFixed(2))
        });
      }
    });
    return taxes;
  }, [taxConfigs, taxableAmount]);

  const taxTotal = useMemo(() => {
    return calculatedTaxes.reduce((sum, tax) => sum + tax.amount, 0);
  }, [calculatedTaxes]);

  const grandTotal = useMemo(() => {
    return parseFloat((taxableAmount + taxTotal).toFixed(2));
  }, [taxableAmount, taxTotal]);

  // Point generation: ₹1 spent = 1 loyalty point (after discount)
  const loyaltyPointsEarned = useMemo(() => {
    if (!selectedCustomer) return 0;
    return Math.floor(grandTotal);
  }, [selectedCustomer, grandTotal]);

  // Submit flow
  const handleCheckoutSubmit = async () => {
    if (cart.length === 0) return;

    const receiptItems: ReceiptItem[] = cart.map(c => ({
      itemId: c.item.id,
      name: c.item.name,
      price: c.item.price,
      quantity: c.quantity,
      notes: c.notes ? c.notes : undefined
    }));

    const transaction: Transaction = {
      id: "tx-" + Date.now(),
      receiptNumber: "INV-" + Math.floor(100000 + Math.random() * 900000),
      branchId,
      items: receiptItems,
      subtotal,
      taxes: calculatedTaxes,
      taxTotal,
      discount: discountTotal,
      total: grandTotal,
      paymentMethod,
      customerId: selectedCustomerId || undefined,
      customerName: selectedCustomer ? selectedCustomer.name : undefined,
      loyaltyPointsEarned,
      loyaltyPointsRedeemed: loyaltyPointsRedeemValue,
      timestamp: new Date().toISOString(),
      cashierId: "emp-2", // default Sarah or David from mock data
      cashierName: "David Miller"
    };

    try {
      await onSubmitTransaction(transaction);
      setRecentTransaction(transaction);
      setCart([]);
      setSelectedCustomerId("");
      setRedeemPoints(false);
      setManualDiscount(0);
      setShowCheckoutModal(false);
      setShowReceiptModal(true);
    } catch (e) {
      alert("Error submitting transaction. It will complete and sync once Firestore is online.");
    }
  };

  const handleAddNewLoyalty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) return;
    try {
      await onAddLoyaltyCustomer(newCustName, newCustPhone, newCustEmail);
      setNewCustName("");
      setNewCustPhone("");
      setNewCustEmail("");
      setShowAddCustomer(false);
    } catch (e) {
      console.error(e);
    }
  };

  const printThermalOffline = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      
      {/* LEFT ASPECT: MENU SELECTION & SEARCH */}
      <div className="flex flex-col gap-5 lg:col-span-7 xl:col-span-8">
        
        {/* Search and Categories Bar */}
        <div className="flex flex-col gap-3 rounded-2xl bg-white p-4.5 border border-stone-200">
          <div className="relative">
            <Search className="absolute top-3.5 left-3.5 h-4.5 w-4.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search dishes, burgers, side combos, or drinks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-3 pr-4 pl-11 text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-all duration-155 ${
                  selectedCategory === cat
                    ? "bg-stone-900 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid Items */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {filteredMenuItems.map((item) => {
            const portions = getPortionsAvailable(item);
            const isOutOfStock = portions <= 0;
            const isLowStock = portions > 0 && portions <= 5;
            
            return (
              <div
                key={item.id}
                onClick={() => !isOutOfStock && addToCart(item)}
                className={`group relative flex flex-col justify-between rounded-2xl border bg-white p-3.5 transition-all duration-200 ${
                  isOutOfStock 
                    ? "border-stone-200 opacity-60 cursor-not-allowed" 
                    : "border-stone-200/90 cursor-pointer hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/5 active:scale-98"
                }`}
              >
                <div>
                  {/* Category Pill + Stock Limit Indicator */}
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[9px] font-bold text-stone-500 uppercase tracking-wider">
                      {item.category}
                    </span>
                    {isOutOfStock ? (
                      <span className="flex items-center gap-0.5 rounded-md bg-red-50 px-2 py-0.5 text-[9px] font-bold text-red-650">
                        <AlertTriangle className="h-2.5 w-2.5" /> Out
                      </span>
                    ) : isLowStock ? (
                      <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-650">
                        Only {portions} left
                      </span>
                    ) : (
                      <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-650">
                        {portions < 900 ? `${portions} available` : "Unlimited"}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-2.5 text-xs font-bold text-stone-900 leading-tight">
                    {item.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-[10px] text-stone-500 leading-normal">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs font-black text-stone-900">
                    ₹{item.price.toFixed(2)}
                  </span>
                  
                  {!isOutOfStock && (
                    <div className="flex h-6.5 w-6.5 items-center justify-center rounded-lg bg-stone-100 text-stone-600 transition-colors group-hover:bg-orange-600 group-hover:text-white">
                      <Plus className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredMenuItems.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center rounded-2xl bg-white py-12 px-4 shadow-sm border border-stone-250">
              <p className="text-sm font-bold text-stone-500">No dishes match your query</p>
              <p className="text-xs text-stone-400 mt-1">Try changing category filter or search keywords</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT ASPECT: BILL CART SECTION */}
      <div className="flex flex-col rounded-2xl bg-white border border-stone-200 lg:col-span-5 xl:col-span-4">
        
        {/* Cart Header */}
        <div className="border-b border-stone-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">
              {cart.reduce((s, c) => s + c.quantity, 0)}
            </span>
            <span className="text-xs font-black uppercase text-stone-700 tracking-wider">Active Cart</span>
          </div>
          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="text-stone-400 hover:text-red-500"
              title="Clear entire cart"
            >
              <Trash2 className="h-4.5 w-4.5" />
            </button>
          )}
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto px-4 py-2 min-h-[220px] max-h-[340px]">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-50 text-stone-400 mb-2">
                <Coffee className="h-6 w-6" />
              </div>
              <p className="text-xs font-bold text-stone-500">Your cart is currently empty</p>
              <p className="text-[10px] text-stone-400 max-w-[180px] mt-1">
                Select menu items from the left to start adding them to the bill structure.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {cart.map((c) => (
                <div key={c.item.id} className="py-3 flex flex-col gap-1.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-stone-800 leading-tight">
                        {c.item.name}
                      </h4>
                      <p className="text-[10px] font-medium text-stone-550 mt-0.5">
                        ₹{c.item.price.toFixed(2)} each
                      </p>
                    </div>
                    <span className="text-xs font-black text-stone-900 whitespace-nowrap">
                      ₹{(c.item.price * c.quantity).toFixed(2)}
                    </span>
                  </div>

                  {/* Quantity Actions & Custom Notes */}
                  <div className="flex items-center justify-between gap-3 mt-1">
                    <input
                      type="text"
                      placeholder="Add note (spicy, extra dressings...)"
                      value={c.notes}
                      onChange={(e) => updateNotes(c.item.id, e.target.value)}
                      className="flex-1 rounded-md border border-stone-200 bg-stone-50/50 px-2 py-1 text-[10px] text-stone-700 outline-none placeholder:text-stone-400 focus:border-stone-300 focus:bg-white"
                    />

                    <div className="flex items-center border border-stone-200 rounded-md bg-stone-50 overflow-hidden">
                      <button
                        onClick={() => updateQty(c.item.id, -1, c.item)}
                        className="p-1 text-stone-600 hover:bg-stone-200 transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-2 text-[11px] font-black text-stone-800">
                        {c.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(c.item.id, 1, c.item)}
                        className="p-1 text-stone-600 hover:bg-stone-200 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Loyalty Members Lookup Section */}
        <div className="border-t border-stone-150 bg-stone-50/50 p-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-stone-600 tracking-wider">Loyalty Customer</span>
            <button
              onClick={() => setShowAddCustomer(!showAddCustomer)}
              className="flex items-center gap-1 text-[10px] font-bold text-orange-600 hover:text-orange-700"
            >
              <UserPlus className="h-3 w-3" /> New Member
            </button>
          </div>

          {showAddCustomer ? (
            <form onSubmit={handleAddNewLoyalty} className="flex flex-col gap-2 rounded-lg border border-orange-100 bg-orange-50/20 p-2.5">
              <input
                type="text"
                placeholder="Name"
                required
                value={newCustName}
                onChange={(e) => setNewCustName(e.target.value)}
                className="rounded border border-stone-200 bg-white px-2 py-1 text-[10px] text-stone-800 outline-none focus:border-orange-400"
              />
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  placeholder="Phone"
                  required
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="rounded border border-stone-200 bg-white px-2 py-1 text-[10px] text-stone-800 outline-none focus:border-orange-400"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                  className="rounded border border-stone-200 bg-white px-2 py-1 text-[10px] text-stone-800 outline-none focus:border-orange-400"
                />
              </div>
              <div className="flex justify-end gap-1.5 mt-0.5">
                <button
                  type="button"
                  onClick={() => setShowAddCustomer(false)}
                  className="rounded px-2.5 py-1 text-[9px] font-bold text-stone-500 hover:bg-stone-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-orange-600 px-2.5 py-1 text-[9px] font-bold text-white hover:bg-orange-700 shadow-sm"
                >
                  Register
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center gap-1.5">
              <select
                value={selectedCustomerId}
                onChange={(e) => {
                  setSelectedCustomerId(e.target.value);
                  setRedeemPoints(false);
                }}
                className="flex-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-stone-700 focus:border-orange-500 focus:outline-none"
              >
                <option value="">-- Apply Customer Loyalty Account --</option>
                {loyaltyCustomers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone}) - {c.pointsBalance} pts
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Points Redemption Toggle */}
          {selectedCustomer && selectedCustomer.pointsBalance > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-orange-50 border border-orange-100 p-2 text-xs">
              <div className="flex flex-col">
                <span className="font-bold text-orange-950">Redeem Points Discount?</span>
                <span className="text-[10px] text-orange-700">
                  Earned balance: {selectedCustomer.pointsBalance} pts (Max disc: ₹{(selectedCustomer.pointsBalance / 10).toFixed(2)})
                </span>
              </div>
              <input
                type="checkbox"
                checked={redeemPoints}
                onChange={(e) => setRedeemPoints(e.target.checked)}
                className="h-4.5 w-4.5 text-orange-600 border-stone-300 rounded focus:ring-orange-500"
              />
            </div>
          )}
        </div>

        {/* Totals & Calculations Section */}
        <div className="border-t border-stone-150 p-4 flex flex-col gap-2 text-xs font-medium text-stone-600 bg-stone-50/20">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span className="text-stone-800 font-bold">₹{subtotal.toFixed(2)}</span>
          </div>

          {/* Quick Manual Discounts */}
          <div className="flex items-center justify-between gap-2 text-[10px]">
            <span className="flex items-center gap-1">
              <Percent className="h-3 w-3 text-stone-400" /> Apply Discount Off
            </span>
            <div className="flex items-center border border-stone-200 rounded overflow-hidden">
              {[0, 2, 5, 10].map(val => (
                <button
                  key={val}
                  onClick={() => setManualDiscount(val)}
                  className={`px-2 py-0.5 font-bold border-l first:border-l-0 ${
                    manualDiscount === val
                      ? "bg-stone-850 text-white"
                      : "bg-white text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  {val === 0 ? "None" : `₹${val}`}
                </button>
              ))}
            </div>
          </div>

          {discountTotal > 0 && (
            <div className="flex items-center justify-between text-red-650 font-medium">
              <span>Discounts Applied</span>
              <span>-₹{discountTotal.toFixed(2)}</span>
            </div>
          )}

          {/* Tax items representation */}
          {calculatedTaxes.map(tax => (
            <div key={tax.taxId} className="flex items-center justify-between text-stone-550 text-[11px]">
              <span>{tax.name} ({(tax.rate * 100).toFixed(1)}%)</span>
              <span>₹{tax.amount.toFixed(2)}</span>
            </div>
          ))}

          <div className="flex items-center justify-between border-t border-dashed border-stone-200 pt-2.5 text-stone-900">
            <span className="text-sm font-black uppercase text-stone-700 tracking-wider">Amount Due</span>
            <span className="text-lg font-black text-stone-950">₹{grandTotal.toFixed(2)}</span>
          </div>

          {/* Print/Hold states visual summary */}
          {selectedCustomer && (
            <div className="mt-1 flex items-center justify-between rounded bg-stone-100 p-1.5 text-[10px] text-stone-600">
              <span>Points to be Earned:</span>
              <span className="font-bold text-stone-850">+{loyaltyPointsEarned} pts</span>
            </div>
          )}

          <button
            disabled={cart.length === 0}
            onClick={() => setShowCheckoutModal(true)}
            className={`w-full rounded-xl py-3 text-center text-sm font-black tracking-wide uppercase transition-all duration-200 mt-2 shadow-sm ${
              cart.length === 0
                ? "bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200/50"
                : "bg-orange-600 text-white hover:bg-orange-700 active:translate-y-0.5 shadow-md shadow-orange-500/10"
            }`}
          >
            Process Secure Checkout
          </button>
        </div>

      </div>

      {/* CHECKOUT POPUP MODAL */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-stone-100">
            <h3 className="text-base font-black text-stone-900 uppercase tracking-wide">Finalize Payment</h3>
            <p className="text-xs text-stone-500 mt-1">Select the payment method to record in the database.</p>

            <div className="my-5 rounded-2xl bg-stone-50 p-4 border border-stone-100">
              <div className="flex justify-between items-center text-xs text-stone-600 font-medium">
                <span>Branch:</span>
                <span className="font-bold text-stone-900">Active Branch Node</span>
              </div>
              <div className="flex justify-between items-center text-xs text-stone-600 mt-1.5 font-medium">
                <span>Deductions:</span>
                <span className="font-bold text-red-650">-₹{discountTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center border-t border-stone-200 mt-3 pt-3">
                <span className="text-sm font-bold text-stone-800">Total Price:</span>
                <span className="text-lg font-black text-orange-600">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <label className="text-xs font-black uppercase text-stone-500 tracking-wider">Payment Mode</label>
            <div className="grid grid-cols-3 gap-2.5 mt-2 mb-6">
              {[
                { id: "Cash", name: "Physical Cash" },
                { id: "Card", name: "Credit/Debit Card" },
                { id: "Digital", name: "Mobile/Scanner" }
              ].map(mode => {
                const isSelected = paymentMethod === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setPaymentMethod(mode.id as any)}
                    className={`flex flex-col items-center justify-center rounded-xl p-3 border text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-stone-900 text-white border-stone-900 shadow-md"
                        : "bg-white text-stone-600 border-stone-250 hover:bg-stone-50"
                    }`}
                  >
                    <span>{mode.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-150 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={handleCheckoutSubmit}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-black tracking-wider uppercase text-white hover:bg-emerald-700 shadow-md shadow-emerald-505/10"
              >
                <Check className="h-4 w-4" /> Print & Finalize
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECENT TRANSACTION / DIGITAL & THERMAL RECEIPT MODAL */}
      {showReceiptModal && recentTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-stone-100 p-6 shadow-2xl border border-stone-200">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <h3 className="text-sm font-black uppercase text-stone-800 tracking-wide">Success Processed</h3>
              </div>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="rounded-lg bg-white border border-stone-200 px-3 py-1.5 text-xs font-bold text-stone-600 hover:bg-stone-50"
              >
                Close View
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left column: Quick Actions */}
              <div className="flex flex-col gap-3">
                <div className="rounded-xl bg-white p-4 border border-stone-200 text-xs">
                  <h4 className="font-bold text-stone-900 border-b pb-1.5">Digital Receipt Summary</h4>
                  <div className="mt-2.5 flex flex-col gap-1 text-stone-600">
                    <div className="flex justify-between">
                      <span>Receipt ID:</span>
                      <span className="font-mono text-[10px] text-stone-900 font-bold">{recentTransaction.receiptNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment:</span>
                      <span className="font-bold text-stone-903">{recentTransaction.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{recentTransaction.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-red-650">
                      <span>Discounts:</span>
                      <span>-₹{recentTransaction.discount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-stone-900 border-t pt-1.5">
                      <span>Grand Total:</span>
                      <span>₹{recentTransaction.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-white p-4 border border-stone-200 text-xs flex flex-col gap-2">
                  <h4 className="font-bold text-stone-900">Receipt Actions</h4>
                  <p className="text-[10px] text-stone-550 leading-relaxed">
                    This order has been securely cached in IndexedDB. It is now syncing to the Firestore cloud database in the background.
                  </p>
                  
                  {/* Print triggers standard receipt thermal styles */}
                  <button
                    onClick={printThermalOffline}
                    className="flex items-center justify-center gap-2 rounded-lg bg-stone-900 py-2 text-xs font-bold text-white hover:bg-black w-full"
                  >
                    <Printer className="h-4 w-4" /> Print Thermal Layout
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(recentTransaction, null, 2));
                      alert("Transaction JSON printed to clipboard!");
                    }}
                    className="flex items-center justify-center gap-2 rounded-lg bg-white border border-stone-200 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50 w-full"
                  >
                    <FileText className="h-4 w-4" /> Export Digital Data
                  </button>
                </div>
              </div>

              {/* Right column: Interactive Visual thermal preview */}
              <div 
                id="thermal-receipt-print-area" 
                className="rounded-xl bg-white p-4 border-2 border-dashed border-stone-300 font-mono text-[10px] text-black leading-relaxed shadow-sm flex flex-col items-center"
              >
                <div className="text-center font-bold text-[12px] uppercase tracking-wide border-b-2 border-stone-900 pb-1.5 w-full">
                  {receiptSettings.shopName}
                </div>
                <div className="text-center text-[9px] text-stone-700 mt-1 border-b pb-1 w-full flex flex-col">
                  <span>{receiptSettings.address}</span>
                  <span>{receiptSettings.phone}</span>
                </div>

                <div className="w-full mt-2 border-b pb-1.5 text-[9px]">
                  <div>Date: {new Date(recentTransaction.timestamp).toLocaleString()}</div>
                  <div className="font-bold">INV: #{recentTransaction.receiptNumber}</div>
                  <div>Cashier: {recentTransaction.cashierName}</div>
                  <div>Payment Mode: {recentTransaction.paymentMethod}</div>
                  {recentTransaction.customerName && (
                    <div>Loyalty User: {recentTransaction.customerName}</div>
                  )}
                </div>

                {/* Items loop */}
                <div className="w-full mt-2 border-b pb-1.5">
                  <div className="flex justify-between font-bold pb-1 text-[9px]">
                    <span>Item</span>
                    <span>Qty/Price</span>
                    <span>Total</span>
                  </div>
                  {recentTransaction.items.map((it, i) => (
                    <div key={i} className="flex flex-col py-0.5">
                      <div className="flex justify-between">
                        <span className="max-w-[120px] truncate leading-tight font-bold">{it.name}</span>
                        <span>{it.quantity}x ₹{it.price.toFixed(2)}</span>
                        <span>₹{(it.price * it.quantity).toFixed(2)}</span>
                      </div>
                      {it.notes && <div className="text-[8px] text-stone-505 pl-1.5 italic">** Notes: {it.notes}</div>}
                    </div>
                  ))}
                </div>

                {/* Totals panel */}
                <div className="w-full mt-2 flex flex-col gap-0.5 text-right font-bold text-[9px]">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{recentTransaction.subtotal.toFixed(2)}</span>
                  </div>
                  {recentTransaction.discount > 0 && (
                    <div className="flex justify-between text-stone-600">
                      <span>Discount:</span>
                      <span>-₹{recentTransaction.discount.toFixed(2)}</span>
                    </div>
                  )}
                  {recentTransaction.taxes.map((t, idx) => (
                    <div key={idx} className="flex justify-between text-stone-600">
                      <span>{t.name}:</span>
                      <span>₹{t.amount.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t-2 border-stone-800 pt-1.5 text-base font-black">
                    <span>TOTAL DUE:</span>
                    <span>₹{recentTransaction.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Loyalty earned feedback */}
                {recentTransaction.customerName && (
                  <div className="w-full text-center mt-2 border-t border-dashed pt-1.5 text-[8px] bg-stone-50 py-1">
                    <div>LOYALTY STATEMENT</div>
                    <div>Points Earned on this Visit: +{recentTransaction.loyaltyPointsEarned} pts</div>
                    <div>Loyalty Points Redeemed: -{recentTransaction.loyaltyPointsRedeemed} pts</div>
                  </div>
                )}

                <div className="w-full text-center mt-3 border-t-2 border-stone-850 pt-1.5 text-[9px] italic flex flex-col font-black">
                  <span>{receiptSettings.headerMessage}</span>
                  <span>{receiptSettings.footerMessage}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
