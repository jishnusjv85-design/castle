import React, { useState } from "react";
import { 
  Settings, 
  Receipt, 
  Percent, 
  MapPin, 
  RefreshCw, 
  Database, 
  Plus, 
  Trash2, 
  Check, 
  X,
  Smartphone
} from "lucide-react";
import { TaxConfig, ReceiptSettings, Branch } from "../types";

interface SettingsViewProps {
  branches: Branch[];
  receiptSettings: ReceiptSettings;
  taxConfigs: TaxConfig[];
  onSaveSettings: (receipt: ReceiptSettings, taxes: TaxConfig[]) => Promise<void>;
  onAddBranch: (branch: Branch) => Promise<void>;
  onSeedDatabase: () => Promise<boolean>;
}

export default function SettingsView({
  branches,
  receiptSettings,
  taxConfigs,
  onSaveSettings,
  onAddBranch,
  onSeedDatabase
}: SettingsViewProps) {
  // Receipt setup states
  const [shopName, setShopName] = useState(receiptSettings.shopName);
  const [address, setAddress] = useState(receiptSettings.address);
  const [phone, setPhone] = useState(receiptSettings.phone);
  const [headerMessage, setHeaderMessage] = useState(receiptSettings.headerMessage);
  const [footerMessage, setFooterMessage] = useState(receiptSettings.footerMessage);

  // Custom Taxes states
  const [taxes, setTaxes] = useState<TaxConfig[]>(taxConfigs);
  const [newTaxName, setNewTaxName] = useState("");
  const [newTaxRate, setNewTaxRate] = useState(5.0); // as percentage

  // Branches states
  const [showAddBranch, setShowAddBranch] = useState(false);
  const [branchName, setBranchName] = useState("");
  const [branchAddress, setBranchAddress] = useState("");
  const [branchPhone, setBranchPhone] = useState("");

  const [seedingLoading, setSeedingLoading] = useState(false);
  const [seedingSuccess, setSeedingSuccess] = useState<boolean | null>(null);

  const handleAddTax = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaxName) return;

    const newTax: TaxConfig = {
      id: "tax-" + Math.floor(1000 + Math.random() * 9000),
      name: newTaxName,
      rate: parseFloat((newTaxRate / 100).toFixed(4)),
      isEnabled: true
    };

    setTaxes([...taxes, newTax]);
    setNewTaxName("");
    setNewTaxRate(5.0);
  };

  const handleToggleTax = (id: string) => {
    setTaxes(taxes.map(t => t.id === id ? { ...t, isEnabled: !t.isEnabled } : t));
  };

  const handleRemoveTax = (id: string) => {
    setTaxes(taxes.filter(t => t.id !== id));
  };

  const handleSaveReceiptAndTax = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSaveSettings(
        { shopName, address, phone, headerMessage, footerMessage },
        taxes
      );
      alert("System tax and receipt layout saved successfully!");
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName) return;

    const newBranch: Branch = {
      id: "branch-" + Math.floor(1000 + Math.random() * 9000),
      name: branchName,
      address: branchAddress,
      phone: branchPhone,
      isActive: true
    };

    try {
      await onAddBranch(newBranch);
      setBranchName("");
      setBranchAddress("");
      setBranchPhone("");
      setShowAddBranch(false);
      alert(`New branch ${newBranch.name} built in the cloud database! Default stock list created as well!`);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePerformSeeding = async () => {
    setSeedingLoading(true);
    setSeedingSuccess(null);
    try {
      const res = await onSeedDatabase();
      setSeedingSuccess(res);
      if (res) {
        alert("Firestore cloud database successfully populated with starter branches, menu portions, shifts, corporate personnel, and taxes!");
      }
    } catch (e) {
      setSeedingSuccess(false);
    } finally {
      setSeedingLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 text-xs">
      
      {/* COLUMN 1: RECEIPT DESIGN & TAX CONFIGURATIONS */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* Receipt Setup and Taxes Configurations (Atomic Save Form) */}
        <form onSubmit={handleSaveReceiptAndTax} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm flex flex-col gap-5">
          <div className="flex items-center gap-2 border-b pb-3 mb-1">
            <Receipt className="h-4.5 w-4.5 text-stone-500" />
            <h3 className="font-extrabold uppercase text-[11px] text-stone-70 tracking-wider">Thermal Receipt Styling Configuration</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-stone-500">Restaurant / Shop Name</label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="rounded-lg border border-stone-200 bg-stone-50/50 p-2.5 font-bold outline-none focus:bg-white focus:border-stone-350"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-stone-500">Corporate Address Line</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="rounded-lg border border-stone-200 bg-stone-50/50 p-2.5 font-medium outline-none focus:bg-white focus:border-stone-350"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-stone-505">Contact Phone</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-lg border border-stone-200 bg-stone-50/50 p-2.5 font-medium outline-none focus:bg-white focus:border-stone-350"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-stone-550">Receipt Header Slogan (Centered)</label>
              <input
                type="text"
                value={headerMessage}
                onChange={(e) => setHeaderMessage(e.target.value)}
                className="rounded-lg border border-stone-200 bg-stone-50/50 p-2.5 font-semibold outline-none focus:bg-white focus:border-stone-350"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-stone-550">Receipt Footer Thanking Slogan (Centered)</label>
              <input
                type="text"
                value={footerMessage}
                onChange={(e) => setFooterMessage(e.target.value)}
                className="rounded-lg border border-stone-200 bg-stone-50/50 p-2.5 font-semibold outline-none focus:bg-white focus:border-stone-350"
              />
            </div>
          </div>

          {/* Core Custom Taxes Subpanel */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-1.5 mb-3.5">
              <Percent className="h-4.5 w-4.5 text-stone-450" />
              <label className="font-extrabold uppercase text-[10px] text-stone-605 tracking-wider">Custom System Tax Configuration Rules</label>
            </div>

            {/* List existing configured taxes */}
            <div className="flex flex-col gap-2 mb-4.5 max-h-[160px] overflow-y-auto">
              {taxes.map(tax => (
                <div key={tax.id} className="flex items-center justify-between p-2.5 rounded-xl border border-stone-200 bg-stone-50/50 font-medium">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleTax(tax.id)}
                      className={`h-5.5 w-5.5 flex items-center justify-center rounded-md border text-white transition-colors ${
                        tax.isEnabled ? "bg-emerald-600 border-emerald-600" : "bg-white border-stone-300"
                      }`}
                    >
                      {tax.isEnabled && <Check className="h-3.5 w-3.5" />}
                    </button>
                    <div>
                      <span className="font-bold text-stone-900">{tax.name}</span>
                      <span className="text-[10px] text-stone-400 block mt-0.5">Configured Rate: {(tax.rate * 100).toFixed(2)} %</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveTax(tax.id)}
                    className="text-stone-350 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* In-Line Tax Add Form */}
            <div className="rounded-xl border border-dashed border-stone-200 p-3 leading-none flex flex-col gap-2.5 md:flex-row md:items-end">
              <div className="flex-1 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-stone-500">Tax Item Name</span>
                <input
                  type="text"
                  placeholder="E.g., Municipal Waste Tax"
                  value={newTaxName}
                  onChange={(e) => setNewTaxName(e.target.value)}
                  className="rounded-lg border border-stone-200 bg-white p-2 font-semibold outline-none text-xs"
                />
              </div>
              <div className="w-32 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-stone-500">Tax Rate (%)</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="5.0"
                  value={newTaxRate}
                  onChange={(e) => setNewTaxRate(Number(e.target.value))}
                  className="rounded-lg border border-stone-200 bg-white p-2 font-semibold outline-none text-xs"
                />
              </div>
              <button
                type="button"
                onClick={handleAddTax}
                className="rounded-lg bg-stone-90 w-full md:w-auto px-4 py-2 text-xs font-bold text-stone-705 border border-stone-250 bg-stone-50 hover:bg-stone-100 flex items-center justify-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Append Rule
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full md:w-fit self-end rounded-xl bg-orange-600 px-6 py-2.5 text-center font-bold text-white hover:bg-orange-700 shadow-sm"
          >
            Save Entire Configuration
          </button>
        </form>

      </div>

      {/* COLUMN 2: MULTI-BRANCH BUILDER & DEV SEED BUTTON */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        
        {/* Branch locations registration tracker widget */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <h3 className="font-extrabold uppercase text-[11px] text-stone-70 tracking-wider flex items-center gap-1.5">
              <MapPin className="h-4.5 w-4.5 text-stone-500" /> Multi-Branch Directory
            </h3>
            <button
              onClick={() => setShowAddBranch(!showAddBranch)}
              className="rounded bg-stone-100 font-bold text-[10px] px-2 py-1 text-stone-600 hover:bg-stone-200"
            >
              {showAddBranch ? "Toggle" : "New Branch"}
            </button>
          </div>

          {showAddBranch ? (
            <form onSubmit={handleCreateBranch} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-stone-500">Brand Branch Name</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Northside Foodcourt"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="rounded-lg border border-stone-200 bg-stone-50/50 p-2 font-semibold"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-bold text-stone-500">Address Line</label>
                <input
                  type="text"
                  required
                  placeholder="404 Boulevard North"
                  value={branchAddress}
                  onChange={(e) => setBranchAddress(e.target.value)}
                  className="rounded-lg border border-stone-200 bg-stone-50/50 p-2 font-medium"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-bold text-stone-500">Contact Hotline</label>
                <input
                  type="text"
                  placeholder="+1 (555) 700-8002"
                  value={branchPhone}
                  onChange={(e) => setBranchPhone(e.target.value)}
                  className="rounded-lg border border-stone-200 bg-stone-50/50 p-2 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2.5 mt-1">
                <button
                  type="button"
                  onClick={() => setShowAddBranch(false)}
                  className="rounded px-2.5 py-1 font-bold text-stone-450 hover:bg-stone-50"
                >
                  Dismiss
                </button>
                <button
                  type="submit"
                  className="rounded bg-stone-900 text-white font-bold px-3 py-1 hover:bg-black"
                >
                  Create Branch
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto">
              {branches.map(b => (
                <div key={b.id} className="p-3 bg-stone-50/60 rounded-xl border border-stone-150 leading-relaxed font-semibold text-stone-850">
                  <div className="flex justify-between font-bold text-stone-900 text-[12px]">
                    <span>{b.name}</span>
                    <span className="rounded bg-emerald-50 px-1 text-[9px] text-emerald-700">Active</span>
                  </div>
                  <p className="text-[10px] text-stone-500 font-medium mt-1">Address: {b.address}</p>
                  <p className="text-[10px] text-stone-500 font-medium mt-0.5">Hotline: {b.phone}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Database Utility & Seed button widget */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm text-xs flex flex-col gap-3">
          <div className="flex items-center gap-1.5 border-b pb-3.5 mb-1.5">
            <Database className="h-4.5 w-4.5 text-stone-500" />
            <h4 className="font-extrabold uppercase text-[10px] text-stone-605 tracking-wider">Database Maintenance</h4>
          </div>

          <p className="text-stone-500 leading-relaxed text-[10.5px]">
            If your cloud project storage starts empty, configure base records such as premium dishes ingredients mapping, branches, tax presets, and staff shifts easily using the seeding engine.
          </p>

          <button
            type="button"
            disabled={seedingLoading}
            onClick={handlePerformSeeding}
            className="flex items-center justify-center gap-2 rounded-xl bg-stone-900 text-white hover:bg-black p-3.5 font-bold transition-colors shadow-xs"
          >
            {seedingLoading ? (
              <>
                <RefreshCw className="h-4.5 w-4.5 animate-spin" /> Seeding collections...
              </>
            ) : (
              <>
                <Database className="h-4.5 w-4.5 text-orange-450" /> Populate Database Seed Data
              </>
            )}
          </button>

          {seedingSuccess === true && (
            <div className="rounded-lg bg-emerald-50 p-2.5 text-[10.5px] font-bold text-emerald-800 text-center">
              Successfully wrote core food, drink menu items, and initial ingredients to Firestore database!
            </div>
          )}
          {seedingSuccess === false && (
            <div className="rounded-lg bg-red-50 p-2.5 text-[10.5px] font-bold text-red-850 text-center">
              Failed writing seed data. Please check connection status.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
