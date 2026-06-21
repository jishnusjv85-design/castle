import React, { useState, useMemo } from "react";
import { 
  Users, 
  Search, 
  Plus, 
  Gift, 
  SearchCode, 
  Award, 
  Coins, 
  Percent, 
  Receipt,
  UserPlus2
} from "lucide-react";
import { LoyaltyCustomer, Transaction } from "../types";

interface LoyaltyViewProps {
  customers: LoyaltyCustomer[];
  transactions: Transaction[];
  onAddCustomer: (name: string, phone: string, email: string) => Promise<void>;
}

export default function LoyaltyView({
  customers,
  transactions,
  onAddCustomer
}: LoyaltyViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Create customer states
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Compute total points distributed
  const totalPointsGiven = useMemo(() => {
    return customers.reduce((sum, c) => sum + c.pointsBalance, 0);
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          c.name.toLowerCase().includes(query) ||
          c.phone.toLowerCase().includes(query) ||
          (c.email && c.email.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [customers, searchQuery]);

  // Selected customer dynamic sales records
  const customerTransactions = useMemo(() => {
    if (!selectedCustomerId) return [];
    return transactions.filter(tx => tx.customerId === selectedCustomerId);
  }, [transactions, selectedCustomerId]);

  const selectedCustomerObj = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  const handleAddNewCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    try {
      await onAddCustomer(name, phone, email);
      setName("");
      setPhone("");
      setEmail("");
      setShowAddForm(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      
      {/* LEFT ASPECT: LOYALTY DATABASE OVERVIEW & REGISTRY */}
      <div className="lg:col-span-8 flex flex-col gap-5">
        
        {/* Statistics Bench */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-stone-200 bg-white p-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Active Members</span>
              <span className="text-xl font-black text-stone-900 mt-1">{customers.length}</span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-50 text-stone-605">
              <Users className="h-4.5 w-4.5" />
            </div>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-stone-505 uppercase tracking-wider">Total Points Granted</span>
              <span className="text-xl font-black text-orange-605 mt-1">{totalPointsGiven} pts</span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
              <Award className="h-4.5 w-4.5" />
            </div>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-stone-505 uppercase tracking-wider">Equivalent Rebates</span>
              <span className="text-xl font-black text-emerald-605 mt-1">₹{(totalPointsGiven / 10).toFixed(2)}</span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Coins className="h-4.5 w-4.5" />
            </div>
          </div>
        </div>

        {/* Search & Actions Ribbon */}
        <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 border border-stone-200 sm:flex-row sm:items-center sm:justify-between shadow-xs">
          
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search member name, phone code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-stone-200 bg-stone-50/50 py-2 pr-4 pl-9 text-xs font-semibold focus:outline-none"
            />
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 rounded-lg bg-stone-900 px-4 py-2 text-xs font-bold text-white hover:bg-black w-fit"
          >
            <UserPlus2 className="h-4 w-4" /> Add New Member
          </button>
        </div>

        {/* Expandable Register Member Form */}
        {showAddForm && (
          <form onSubmit={handleAddNewCustomerSubmit} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs flex flex-col gap-4">
            <h3 className="text-xs font-black uppercase text-stone-700 tracking-wider">Register Loyalty Customer</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-stone-500">Customer Name</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Bruce Wayne"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-lg border border-stone-200 bg-stone-50/55 p-2.5 font-medium outline-none focus:bg-white focus:border-stone-350"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-stone-500">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., 555-0199"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="rounded-lg border border-stone-200 bg-stone-50/55 p-2.5 font-medium outline-none focus:bg-white focus:border-stone-350"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-stone-505">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="bruce@waynecorp.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-lg border border-stone-200 bg-stone-50/55 p-2.5 font-medium outline-none focus:bg-white focus:border-stone-350"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 mt-1.5">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="rounded-lg p-2 text-xs font-semibold text-stone-500 hover:bg-stone-100"
              >
                Dismiss Form
              </button>
              <button
                type="submit"
                className="rounded-lg bg-orange-650 px-5 p-2 text-xs font-bold text-white hover:bg-orange-700"
              >
                Confirm Account Setup
              </button>
            </div>
          </form>
        )}

        {/* Database List Sheet */}
        <div className="overflow-hidden rounded-2xl bg-white border border-stone-200 shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50/75 border-b border-stone-200 text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                <th className="px-5 py-3">Member Details</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Points Balance</th>
                <th className="px-5 py-3">Est. Discount Value</th>
                <th className="px-5 py-3">Register Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-150 text-stone-750">
              {filteredCustomers.map(cust => {
                const isSelected = selectedCustomerId === cust.id;
                
                return (
                  <tr 
                    key={cust.id} 
                    onClick={() => setSelectedCustomerId(isSelected ? null : cust.id)}
                    className={`cursor-pointer transition-all ${
                      isSelected ? "bg-orange-50/20 text-orange-950 font-medium" : "hover:bg-stone-50/50"
                    }`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`h-8 w-8 flex items-center justify-center rounded-lg font-bold border text-sm ${
                          isSelected ? "bg-orange-100 border-orange-200 text-orange-700" : "bg-stone-50 border-stone-200 text-stone-500"
                        }`}>
                          {cust.name[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-stone-900">{cust.name}</span>
                          <span className="text-[10px] text-stone-400">ID: {cust.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex flex-col text-stone-605">
                        <span>{cust.phone}</span>
                        {cust.email && <span className="text-[10px] text-stone-400">{cust.email}</span>}
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="rounded bg-orange-100 border border-orange-200 px-2 py-0.5 text-xs text-orange-850 font-black font-mono">
                        {cust.pointsBalance} pts
                      </span>
                    </td>

                    <td className="px-5 py-3.5 font-mono text-emerald-700 font-bold">
                      ₹{(cust.pointsBalance / 10).toFixed(2)}
                    </td>

                    <td className="px-5 py-3.5 text-stone-450 text-[10px]">
                      {new Date(cust.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-stone-400">
                    <SearchCode className="h-9 w-9 text-stone-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-stone-500">No member results matched</p>
                    <p className="text-[10px] text-stone-400 mt-0.5">Try searching another query or add a member</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* RIGHT ASPECT: SALES HISTORY / POINTS REDEMPTION STATEMENT FOR SELECTED MEMBER */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm text-xs h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b pb-3 mb-4.5">
              <Gift className="h-5 w-5 text-orange-600" />
              <h3 className="font-extrabold uppercase text-stone-700 tracking-wider">Rewards Statement</h3>
            </div>

            {selectedCustomerObj ? (
              <div className="flex flex-col gap-4">
                <div className="rounded-xl border border-stone-200 p-3 bg-stone-50 text-[11px] leading-relaxed">
                  <span className="text-[10px] font-black uppercase text-stone-405 block tracking-wider">Focused Account</span>
                  <p className="font-extrabold text-[13px] text-stone-900 mt-1">{selectedCustomerObj.name}</p>
                  <p className="font-medium text-stone-500 mt-0.5">Contact Line: {selectedCustomerObj.phone}</p>
                  
                  {/* Point summary stats */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-4.5 border-t">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-stone-450 uppercase uppercase">Awarded Balance</span>
                      <span className="text-lg font-black font-mono text-stone-850 mt-0.5">{selectedCustomerObj.pointsBalance} pts</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-stone-450 uppercase">Active Discount</span>
                      <span className="text-lg font-black font-mono text-emerald-600 mt-0.5">₹{(selectedCustomerObj.pointsBalance / 10).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Sales transactions count lists */}
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-stone-550 border-b pb-1.5 mb-2 block tracking-wider">Purchase Log</span>
                  <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto">
                    {customerTransactions.map(tx => (
                      <div key={tx.id} className="flex items-center justify-between p-2 rounded bg-stone-50 border text-[10px] font-medium">
                        <div className="flex flex-col">
                          <span className="font-bold text-stone-900"># {tx.receiptNumber}</span>
                          <span className="text-[9px] text-stone-400 mt-0.5">{new Date(tx.timestamp).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-end flex-col">
                          <span className="font-bold text-stone-850">₹{tx.total.toFixed(2)}</span>
                          <span className="text-[8px] text-emerald-650 font-extrabold">+{tx.loyaltyPointsEarned} pts Earned</span>
                        </div>
                      </div>
                    ))}

                    {customerTransactions.length === 0 && (
                      <p className="text-[10px] text-stone-400 italic text-center py-4">
                        No purchase records registered under this member's account.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-10 text-center text-stone-500">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-stone-50 text-stone-400 mb-2.5">
                  <Award className="h-5 w-5" />
                </div>
                <p className="font-bold text-stone-500 text-xs">No member selected</p>
                <p className="text-[10px] text-stone-400 mt-1 max-w-[180px] leading-normal mx-auto">
                  Click on any row inside the left database sheet to access points redemption stat and audit purchase records.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-orange-100 bg-orange-50/20 p-3 leading-relaxed mt-4">
            <span className="text-[9px] font-black uppercase text-orange-900 block tracking-wider flex items-center gap-1">
              <Percent className="h-3.5 w-3.5" /> Scheme Conversion Guide
            </span>
            <p className="text-[10px] text-orange-950 mt-1.5">
              - Member receives **1 Loyalty Point** for every ₹1.00 spent on checkout bills.
              - Points redeem instantly at checkout for active rebated prices (**10 Points = ₹1.00 discount**).
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
