import React, { useState, useMemo } from "react";
import { 
  LineChart, 
  TrendingUp, 
  ShoppingBag, 
  IndianRupee, 
  ChevronRight, 
  Printer, 
  Pizza, 
  Wallet, 
  Smartphone, 
  CreditCard 
} from "lucide-react";
import { Transaction } from "../types";

interface ReportsViewProps {
  branchId: string;
  transactions: Transaction[];
}

export default function ReportsView({
  branchId,
  transactions
}: ReportsViewProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Compute reports metrics
  const totalRevenue = useMemo(() => {
    return transactions.reduce((sum, tx) => sum + tx.total, 0);
  }, [transactions]);

  const txCount = transactions.length;

  const averageOrderValue = useMemo(() => {
    if (txCount === 0) return 0;
    return totalRevenue / txCount;
  }, [totalRevenue, txCount]);

  // Payment Method Distribution (e.g. Cash vs Card vs Digital)
  const paymentDistribution = useMemo(() => {
    const counts = { Cash: 0, Card: 0, Digital: 0 };
    const values = { Cash: 0, Card: 0, Digital: 0 };

    transactions.forEach(tx => {
      if (counts[tx.paymentMethod] !== undefined) {
        counts[tx.paymentMethod] += 1;
        values[tx.paymentMethod] += tx.total;
      }
    });

    return { counts, values };
  }, [transactions]);

  // Aggregate product counts to find top sold items
  const popularMenuItemsList = useMemo(() => {
    const countsMap = new Map<string, { name: string; quantity: number; sales: number }>();
    
    transactions.forEach(tx => {
      tx.items.forEach(it => {
        const itemStats = countsMap.get(it.itemId) || { name: it.name, quantity: 0, sales: 0 };
        itemStats.quantity += it.quantity;
        itemStats.sales += it.price * it.quantity;
        countsMap.set(it.itemId, itemStats);
      });
    });

    const list = Array.from(countsMap.entries()).map(([id, val]) => ({
      itemId: id,
      name: val.name,
      quantity: val.quantity,
      sales: val.sales
    }));

    return list.sort((a, b) => b.quantity - a.quantity);
  }, [transactions]);

  // Custom visual SVG Graph Heights tracking recent daily sales
  // Takes the last 7 transactions or group transactions by day
  const dailySalesTrend = useMemo(() => {
    // Group transactions by date string
    const map = new Map<string, number>();
    // Prepopulate last 5 days
    for (let i = 4; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      map.set(d.toLocaleDateString(undefined, { month: "short", day: "numeric" }), 0);
    }

    transactions.forEach(tx => {
      const dateStr = new Date(tx.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });
      if (map.has(dateStr)) {
        map.set(dateStr, (map.get(dateStr) || 0) + tx.total);
      } else {
        // Just track it anyway if transactions are outside of range
        map.set(dateStr, tx.total);
      }
    });

    return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
  }, [transactions]);

  const maxTrendValue = useMemo(() => {
    const values = dailySalesTrend.map(t => t.value);
    const max = Math.max(...values, 100); // minimum scale peak of ₹100
    return max * 1.15; // add 15% head padding
  }, [dailySalesTrend]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      
      {/* 3 Core Reports Bento KPIs */}
      <div className="col-span-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 flex items-center justify-between shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-stone-450 tracking-wider">Gross Income Receipts</span>
            <span className="text-2xl font-black text-stone-900 mt-1 leading-none">₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="text-[9px] text-stone-400 mt-2 font-medium">Real-time combined gross cash flow</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-emerald-600">
            <IndianRupee className="h-5.5 w-5.5" />
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 flex items-center justify-between shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-stone-450 tracking-wider">Volume of Transactions</span>
            <span className="text-2xl font-black text-stone-900 mt-1 leading-none">{txCount} bills</span>
            <span className="text-[9px] text-stone-400 mt-2 font-medium">Total checkout sales processing index</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <ShoppingBag className="h-5.5 w-5.5" />
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 flex items-center justify-between shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-stone-450 tracking-wider">Average Cart Size</span>
            <span className="text-2xl font-black text-stone-900 mt-1 leading-none">₹{averageOrderValue.toFixed(2)}</span>
            <span className="text-[9px] text-stone-440 mt-2 font-medium">Average sales ticket spent per guest</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-stone-50 text-stone-650">
            <TrendingUp className="h-5.5 w-5.5" />
          </div>
        </div>
      </div>

      {/* LEFT SIDE BLOCK: GRAPH TRENDS & PAYMENT PIE SUMMARY */}
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
        
        {/* Dynamic hand-crafted custom SVG Sales Graph */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5.5 shadow-sm">
          <div className="flex items-center justify-between border-b pb-3 mb-5">
            <div className="flex items-center gap-2">
              <LineChart className="h-4.5 w-4.5 text-stone-500" />
              <h3 className="text-xs font-black uppercase tracking-wider text-stone-700">Gross Sales Income Trend</h3>
            </div>
            <span className="rounded bg-stone-100 px-2.5 py-0.5 text-[9px] font-bold text-stone-500">Last 5 Days (INR)</span>
          </div>

          <div className="relative">
            {/* Visual SVG chart */}
            <svg viewBox="0 0 500 220" className="w-full h-[180px] overflow-visible">
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="#f3f4f6" strokeWidth="1" />
              <line x1="40" y1="70" x2="480" y2="70" stroke="#f3f4f6" strokeWidth="1" />
              <line x1="40" y1="120" x2="480" y2="120" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="40" y1="170" x2="480" y2="170" stroke="#e5e7eb" strokeWidth="1.5" />

              {/* Draw Bars */}
              {dailySalesTrend.map((data, idx) => {
                const xCoord = 75 + idx * 90;
                const barHeight = (data.value / maxTrendValue) * 140;
                const yCoord = 170 - barHeight;

                return (
                  <g key={idx} className="group cursor-pointer">
                    {/* Background hover bar to easily trigger tooltips */}
                    <rect
                      x={xCoord - 18}
                      y="15"
                      width="36"
                      height="155"
                      fill="transparent"
                      className="hover:fill-stone-50/40"
                    />

                    {/* True Bar */}
                    <rect
                      x={xCoord - 12}
                      y={yCoord}
                      width="24"
                      height={barHeight}
                      rx="4"
                      fill="#ef4444"
                      className="fill-orange-600/90 transition-all hover:fill-orange-700"
                    />

                    {/* Value Popups over bars */}
                    <text
                      x={xCoord}
                      y={yCoord - 8}
                      textAnchor="middle"
                      className="fill-stone-850 font-mono text-[9px] font-black"
                    >
                      ₹{Math.round(data.value)}
                    </text>

                    {/* Bottom Label on axis */}
                    <text
                      x={xCoord}
                      y="190"
                      textAnchor="middle"
                      className="fill-stone-450 font-sans text-[9px] font-bold"
                    >
                      {data.label}
                    </text>
                  </g>
                );
              })}

              {/* Left y-axis value gauges */}
              <text x="35" y="24" textAnchor="end" className="fill-stone-400 font-mono text-[8px] font-bold">₹ {Math.round(maxTrendValue)}</text>
              <text x="35" y="94" textAnchor="end" className="fill-stone-400 font-mono text-[8px] font-bold">₹ {Math.round(maxTrendValue / 2)}</text>
              <text x="35" y="174" textAnchor="end" className="fill-stone-400 font-mono text-[8px] font-bold">₹ 0</text>
            </svg>
          </div>
        </div>

        {/* Dynamic split widgets category sales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Top Selling Dishes listing */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm text-xs flex flex-col justify-between">
            <div>
              <h3 className="font-extrabold uppercase text-stone-605 tracking-wider pb-2 border-b mb-4 flex items-center gap-1.5">
                <Pizza className="h-4.5 w-4.5 text-stone-500" /> Tops Ordered Dishes
              </h3>
              <div className="flex flex-col gap-3">
                {popularMenuItemsList.slice(0, 4).map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-stone-50/50 p-2 rounded border">
                    <div className="flex flex-col">
                      <span className="font-black text-stone-900">{it.name}</span>
                      <span className="text-[10px] text-stone-400 mt-0.5">Sold index volume: {it.quantity} portions</span>
                    </div>
                    <span className="font-mono font-bold text-stone-850">₹{it.sales.toFixed(2)}</span>
                  </div>
                ))}

                {popularMenuItemsList.length === 0 && (
                  <p className="text-[10px] text-stone-400 italic text-center py-6">
                    No items sold today. Submit POS tickets first.
                  </p>
                )}
              </div>
            </div>
            <p className="text-[9px] text-stone-400 mt-4 leading-normal">
              Based on actual sales metrics tracked inside the active restaurant branch.
            </p>
          </div>

          {/* Payment Method Distribution */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm text-xs flex flex-col justify-between">
            <div>
              <h3 className="font-extrabold uppercase text-stone-605 tracking-wider pb-2 border-b mb-4 flex items-center gap-1.5">
                <Wallet className="h-4.5 w-4.5 text-stone-500" /> Payment Breakdown
              </h3>
              <div className="flex flex-col gap-3.5">
                {[
                  { id: "Cash", label: "Physical Bills Cash", icon: Wallet, color: "text-amber-600 bg-amber-50" },
                  { id: "Card", label: "Credit & Debit Cards", icon: CreditCard, color: "text-blue-600 bg-blue-50" },
                  { id: "Digital", label: "Mobile Wallet Scanners", icon: Smartphone, color: "text-purple-650 bg-purple-50" }
                ].map(mode => {
                  const val = paymentDistribution.values[mode.id as any] || 0;
                  const percent = totalRevenue > 0 ? (val / totalRevenue) * 100 : 0;
                  const Icon = mode.icon;

                  return (
                    <div key={mode.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded ${mode.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-stone-850">{mode.label}</span>
                          <span className="text-[10px] text-stone-400 mt-0.5 font-mono">{percent.toFixed(1)}% share</span>
                        </div>
                      </div>
                      <span className="font-mono font-black text-stone-900">₹{val.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <p className="text-[9px] text-stone-400 mt-4 leading-normal">
              Distribution reflects payment modes registered by cashiers during checkout finalization.
            </p>
          </div>

        </div>

      </div>

      {/* RIGHT SIDE BLOCK: SECURE INVOICES LIST FEED */}
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm flex-1 flex flex-col justify-between text-xs min-h-[400px]">
          <div>
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="font-extrabold uppercase text-stone-700 tracking-wider">Transaction Ledger</h3>
              <span className="rounded bg-stone-100 text-stone-600 px-2 py-0.5 text-[9px] font-bold">Latest {txCount}</span>
            </div>

            <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto">
              {transactions.map(tx => (
                <div 
                  key={tx.id}
                  onClick={() => setSelectedTransaction(selectedTransaction?.id === tx.id ? null : tx)}
                  className={`group relative overflow-hidden rounded-xl border p-3 cursor-pointer transition-all ${
                    selectedTransaction?.id === tx.id 
                      ? "border-stone-90 transition-all bg-stone-50" 
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="font-bold text-stone-900">{tx.receiptNumber}</span>
                      <span className="text-[9px] text-stone-400 mt-0.5 font-mono">
                        {new Date(tx.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} • {tx.paymentMethod}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-black text-stone-900">₹{tx.total.toFixed(2)}</span>
                      <span className="text-[8px] text-stone-400 capitalize mt-0.5">by {tx.cashierName}</span>
                    </div>
                  </div>

                  {/* Expand subtable list of item checkouts */}
                  {selectedTransaction?.id === tx.id && (
                    <div className="mt-3 pt-3 border-t text-[10px] text-stone-600 leading-normal flex flex-col gap-1.5 animate-fadeIn">
                      <div className="font-bold text-stone-755">Invoice Items:</div>
                      {tx.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between font-mono">
                          <span>{it.quantity}x {it.name}</span>
                          <span>₹{(it.price * it.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between border-t border-dashed pt-1.5">
                        <span>Subtotal:</span>
                        <span>₹{tx.subtotal.toFixed(2)}</span>
                      </div>
                      {tx.discount > 0 && (
                        <div className="flex justify-between text-red-650">
                          <span>Discounts Code:</span>
                          <span>-₹{tx.discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-stone-900 leading-none pt-1">
                        <span>Total Due:</span>
                        <span>₹{tx.total.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {transactions.length === 0 && (
                <div className="py-12 text-center text-stone-400 italic">
                  No payment invoices tracked on database files. Go to POS to complete standard bills first.
                </div>
              )}
            </div>
          </div>

          <p className="text-[9px] text-stone-400 border-t pt-3 mt-4 leading-normal">
            Database files encrypted using standard Firestore persistence storage, allowing records retrieval without server latency.
          </p>
        </div>
      </div>

    </div>
  );
}
