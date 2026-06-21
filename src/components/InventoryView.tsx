import React, { useState, useMemo } from "react";
import { 
  Package, 
  Plus, 
  TrendingUp, 
  AlertTriangle, 
  PackageCheck, 
  Boxes, 
  ArrowUpRight, 
  Filter, 
  Search,
  Truck
} from "lucide-react";
import { InventoryItem, MenuItem } from "../types";

interface InventoryViewProps {
  branchId: string;
  inventoryItems: InventoryItem[];
  menuItems: MenuItem[];
  onUpdateStock: (itemId: string, newQty: number) => Promise<void>;
  onAddInventoryItem: (item: InventoryItem) => Promise<void>;
}

export default function InventoryView({
  branchId,
  inventoryItems,
  menuItems,
  onUpdateStock,
  onAddInventoryItem
}: InventoryViewProps) {
  // Inventory view states
  const [searchQuery, setSearchQuery] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All"); // All, Low, Normal

  // New stock creation
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState(100);
  const [newItemUnit, setNewItemUnit] = useState("pcs"); // pcs, kg, liters, etc.
  const [newItemReorder, setNewItemReorder] = useState(15);
  const [newItemUnitPrice, setNewItemUnitPrice] = useState(1.50);
  const [newItemSupplier, setNewItemSupplier] = useState("");

  // Edit stock qty modal
  const [selectedEditItem, setSelectedEditItem] = useState<InventoryItem | null>(null);
  const [adjustmentValue, setAdjustmentValue] = useState<number>(0);

  // Computed metrics
  const totalItemCount = inventoryItems.length;
  
  const lowStockItems = useMemo(() => {
    return inventoryItems.filter(item => item.quantity <= item.reorderPoint);
  }, [inventoryItems]);

  const totalValueInStock = useMemo(() => {
    return inventoryItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  }, [inventoryItems]);

  const uniqueSuppliers = useMemo(() => {
    const list = ["All"];
    inventoryItems.forEach(item => {
      if (item.supplier && !list.includes(item.supplier)) {
        list.push(item.supplier);
      }
    });
    return list;
  }, [inventoryItems]);

  // Filtered Inventory items list
  const filteredInventory = useMemo(() => {
    return inventoryItems.filter(item => {
      // Filter by Search Query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!item.name.toLowerCase().includes(query) && !item.supplier.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Filter by Supplier
      if (supplierFilter !== "All" && item.supplier !== supplierFilter) {
        return false;
      }

      // Filter by Status
      if (statusFilter === "Low" && item.quantity > item.reorderPoint) {
        return false;
      }
      if (statusFilter === "Normal" && item.quantity <= item.reorderPoint) {
        return false;
      }

      return true;
    });
  }, [inventoryItems, searchQuery, supplierFilter, statusFilter]);

  // Map inventory items to active menu items to show "Where it is used"
  const getIngredientUsageList = (itemId: string) => {
    // Deduce item basic key from item.id (e.g., 'inv-beef-patty-branch-1' corresponds to 'inv-beef-patty')
    const matchKey = itemId.split("-").slice(0, 2).join("-"); // E.g., 'inv-beef-patty'
    return menuItems.filter(menu => {
      return menu.ingredients?.some(ing => ing.inventoryId === matchKey);
    });
  };

  const handleCreateInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemSupplier) return;

    // Build complete branch specific inventory representation
    const itemKey = "inv-" + newItemName.toLowerCase().replace(/\s+/g, "-");
    const item: InventoryItem = {
      id: `${itemKey}-${branchId}`,
      name: newItemName,
      quantity: Number(newItemQty),
      unit: newItemUnit,
      reorderPoint: Number(newItemReorder),
      unitPrice: Number(newItemUnitPrice),
      supplier: newItemSupplier,
      branchId
    };

    try {
      await onAddInventoryItem(item);
      setNewItemName("");
      setNewItemQty(100);
      setNewItemUnit("pcs");
      setNewItemReorder(15);
      setNewItemUnitPrice(1.50);
      setNewItemSupplier("");
      setShowAddItem(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdjustStockSubmit = async () => {
    if (!selectedEditItem) return;
    const newQty = Math.max(0, selectedEditItem.quantity + adjustmentValue);
    try {
      await onUpdateStock(selectedEditItem.id, newQty);
      setSelectedEditItem(null);
      setAdjustmentValue(0);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* 3 Overview Bento Widgets */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-stone-200 bg-white p-4.5 flex items-center justify-between shadow-sm">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-stone-555">Total Items Registered</span>
            <span className="text-2xl font-black text-stone-900 mt-1 leading-none">{totalItemCount}</span>
            <span className="text-[10px] text-stone-400 mt-1.5 flex items-center gap-1">
              Active tags monitoring branch level
            </span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-stone-50 text-stone-650">
            <Boxes className="h-5.5 w-5.5" />
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4.5 flex items-center justify-between shadow-sm">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-stone-555">Reorder & Low Stock Alerts</span>
            <span className="text-2xl font-black text-red-605 mt-1 leading-none">{lowStockItems.length}</span>
            <span className="text-[10px] text-red-600 mt-1.5 font-bold flex items-center gap-1 animate-pulse">
              <AlertTriangle className="h-3 w-3" /> Action needed immediately
            </span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <AlertTriangle className="h-5.5 w-5.5" />
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4.5 flex items-center justify-between shadow-sm">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-stone-555">Total Stock Capital Value</span>
            <span className="text-2xl font-black text-stone-900 mt-1 leading-none">₹{totalValueInStock.toLocaleString()}</span>
            <span className="text-[10px] text-stone-400 mt-1.5 flex items-center gap-0.5">
              Valued using registered unit prices
            </span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <TrendingUp className="h-5.5 w-5.5" />
          </div>
        </div>
      </div>

      {/* FILTER & ACTIONS BAR */}
      <div className="flex flex-col gap-3 rounded-2xl bg-white p-4.5 border border-stone-200 shadow-sm md:flex-row md:items-center md:justify-between">
        
        {/* Search Panel */}
        <div className="flex-1 max-w-md relative">
          <Search className="absolute top-3 left-3 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search stock name, suppliers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-2.5 pr-4 pl-9.5 text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:border-stone-350 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
          />
        </div>

        {/* Dropdowns Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase text-stone-500">Supplier:</span>
            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-stone-700 focus:outline-none"
            >
              {uniqueSuppliers.map(sup => (
                <option key={sup} value={sup}>{sup}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase text-stone-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-stone-700 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Low">Low / Out of Stock</option>
              <option value="Normal">Normal levels</option>
            </select>
          </div>

          <button
            onClick={() => setShowAddItem(!showAddItem)}
            className="flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-bold text-white hover:bg-black transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Item
          </button>
        </div>
      </div>

      {/* NEW ITEM INVENTORIES FORM POPUP */}
      {showAddItem && (
        <form onSubmit={handleCreateInventory} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm flex flex-col gap-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-stone-700">Add New Inventory Item</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-stone-500">Item Name</label>
              <input
                type="text"
                required
                placeholder="E.g., Sweet Potato Buns"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="rounded-lg border border-stone-200 bg-stone-50/50 p-2.5 text-xs font-medium text-stone-900 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-stone-500">Initial StockQty</label>
                <input
                  type="number"
                  required
                  value={newItemQty}
                  onChange={(e) => setNewItemQty(Number(e.target.value))}
                  className="rounded-lg border border-stone-200 bg-stone-50/50 p-2.5 text-xs font-medium text-stone-900 focus:bg-white focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-stone-500">Unit Type</label>
                <select
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value)}
                  className="rounded-lg border border-stone-200 bg-stone-50/50 p-2.5 text-xs font-medium text-stone-900 focus:bg-white focus:outline-none"
                >
                  <option value="pcs">pieces (pcs)</option>
                  <option value="kg">kilograms (kg)</option>
                  <option value="liters">liters (l)</option>
                  <option value="packs">packs (pk)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-stone-500">Reorder Bound</label>
                <input
                  type="number"
                  required
                  value={newItemReorder}
                  onChange={(e) => setNewItemReorder(Number(e.target.value))}
                  className="rounded-lg border border-stone-200 bg-stone-50/50 p-2.5 text-xs font-medium text-stone-900 focus:bg-white focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-stone-505">Unit Cost Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newItemUnitPrice}
                  onChange={(e) => setNewItemUnitPrice(Number(e.target.value))}
                  className="rounded-lg border border-stone-200 bg-stone-50/50 p-2.5 text-xs font-medium text-stone-900 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 md:w-1/3">
            <label className="text-[10px] font-bold text-stone-505">Supplier Name</label>
            <input
              type="text"
              required
              placeholder="E.g., Global Agro Corp"
              value={newItemSupplier}
              onChange={(e) => setNewItemSupplier(e.target.value)}
              className="rounded-lg border border-stone-200 bg-stone-50/50 p-2.5 text-xs font-medium text-stone-900 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2.5 mt-2">
            <button
              type="button"
              onClick={() => setShowAddItem(false)}
              className="rounded-lg px-4 py-2 text-xs font-semibold text-stone-550 hover:bg-stone-100"
            >
              Dismiss
            </button>
            <button
              type="submit"
              className="rounded-lg bg-orange-600 px-5 py-2 text-xs font-bold text-white hover:bg-orange-700"
            >
              Add Inventory Stock
            </button>
          </div>
        </form>
      )}

      {/* DIRECT STOCK TABLE SHEET */}
      <div className="overflow-x-auto rounded-2xl bg-white border border-stone-200 shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-stone-50/75 border-b border-stone-200 text-[10px] uppercase font-bold text-stone-500 tracking-wider">
              <th className="px-5 py-3">Item Name</th>
              <th className="px-5 py-3">Stock level</th>
              <th className="px-5 py-3">Supplier</th>
              <th className="px-5 py-3">Unit Cost</th>
              <th className="px-5 py-3">Valuation</th>
              <th className="px-5 py-3">Dish Recipe Connections</th>
              <th className="px-5 py-3 text-right">Stock Control</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-150 text-stone-700">
            {filteredInventory.map((item) => {
              const isLow = item.quantity <= item.reorderPoint;
              const relationDishes = getIngredientUsageList(item.id);

              return (
                <tr key={item.id} className="hover:bg-stone-50/40">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg border ${
                        isLow ? "bg-red-50 text-red-600 border-red-100" : "bg-stone-50 text-stone-500 border-stone-200"
                      }`}>
                        <Package className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-stone-900">{item.name}</span>
                        <span className="text-[10px] text-stone-400 mt-0.5">ID: {item.id}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex flex-col">
                      <div className="flex items-end gap-1 font-mono">
                        <span className={`text-[13px] font-black ${isLow ? "text-red-700" : "text-stone-800"}`}>
                          {item.quantity.toFixed(1).replace(/\.0$/, "")}
                        </span>
                        <span className="text-stone-400 text-[10px] font-bold lowercase">{item.unit}</span>
                      </div>
                      <span className="text-[9px] text-stone-450 mt-1 flex items-center gap-1">
                        Reorder bound: {item.reorderPoint} {item.unit}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 rounded bg-stone-100 px-2 py-1 text-[10px] font-semibold text-stone-600">
                      <Truck className="h-3 w-3" />
                      {item.supplier}
                    </span>
                  </td>

                  <td className="px-5 py-4 font-mono font-semibold">
                    ₹{item.unitPrice.toFixed(2)}
                  </td>

                  <td className="px-5 py-4 font-mono font-bold text-stone-900">
                    ₹{(item.quantity * item.unitPrice).toFixed(2)}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {relationDishes.length > 0 ? (
                        relationDishes.map(f => (
                          <span key={f.id} className="rounded bg-orange-50 border border-orange-100 px-1.5 py-0.5 text-[9px] font-bold text-orange-700">
                            {f.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-[9px] text-stone-400 italic">None bound</span>
                      )}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => setSelectedEditItem(item)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-stone-250 bg-white px-2.5 py-1.5 text-xs font-bold text-stone-700 shadow-xs hover:bg-stone-50"
                    >
                      Restock / Adjust
                    </button>
                  </td>
                </tr>
              );
            })}

            {filteredInventory.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-stone-405 leading-relaxed bg-stone-50/20">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-100 mx-auto mb-2 text-stone-400">
                    <PackageCheck className="h-5 w-5" />
                  </div>
                  <p className="font-bold text-stone-500 text-xs">No matching stock matches</p>
                  <p className="text-[10px] text-stone-400">Add custom items or refine filters</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* QUICK QUANTITY EDIT POPUP CONTROL */}
      {selectedEditItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-stone-100">
            <h3 className="text-xs font-black uppercase text-stone-500 tracking-wider">Adjust Stock Levels</h3>
            <p className="text-sm font-bold text-stone-900 mt-2">Item: {selectedEditItem.name}</p>
            <p className="text-xs text-stone-500 mt-1">Current Quantity: {selectedEditItem.quantity} {selectedEditItem.unit}</p>

            <div className="my-5 flex items-center justify-center gap-3">
              <button
                onClick={() => setAdjustmentValue(prev => prev - 10)}
                className="h-10 w-10 flex items-center justify-center rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 active:scale-95"
              >
                -10
              </button>
              <button
                onClick={() => setAdjustmentValue(prev => prev - 1)}
                className="h-10 w-10 flex items-center justify-center rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 active:scale-95"
              >
                -1
              </button>
              <div className="w-20 text-center text-base font-black font-mono">
                {adjustmentValue >= 0 ? `+${adjustmentValue}` : adjustmentValue}
              </div>
              <button
                onClick={() => setAdjustmentValue(prev => prev + 1)}
                className="h-10 w-10 flex items-center justify-center rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 active:scale-95"
              >
                +1
              </button>
              <button
                onClick={() => setAdjustmentValue(prev => prev + 10)}
                className="h-10 w-10 flex items-center justify-center rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 active:scale-95"
              >
                +10
              </button>
            </div>

            <div className="text-center text-xs font-bold text-stone-600 mb-5">
              Result quantity will become: <span className="text-stone-900 uppercase">{selectedEditItem.quantity + adjustmentValue} {selectedEditItem.unit}</span>
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => {
                  setSelectedEditItem(null);
                  setAdjustmentValue(0);
                }}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-stone-500 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustStockSubmit}
                className="rounded-lg bg-stone-900 px-4 py-2 text-xs font-black uppercase tracking-wide text-white hover:bg-black"
              >
                Save Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
