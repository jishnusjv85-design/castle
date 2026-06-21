import React from "react";
import { 
  Wifi, 
  WifiOff, 
  RotateCw, 
  ShoppingBag, 
  Boxes, 
  CalendarDays, 
  Users, 
  LineChart, 
  Settings, 
  UtensilsCrossed 
} from "lucide-react";
import { Branch } from "../types";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  branches: Branch[];
  selectedBranchId: string;
  setSelectedBranchId: (id: string) => void;
  isOnline: boolean;
  syncPending: boolean;
  activeCashierName: string;
}

export default function Header({
  activeTab,
  setActiveTab,
  branches,
  selectedBranchId,
  setSelectedBranchId,
  isOnline,
  syncPending,
  activeCashierName
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        
        {/* Logo and Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-white shadow-md shadow-orange-600/10">
            <UtensilsCrossed className="h-5.5 w-5.5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-stone-900 sm:text-lg">
              GourmetPOS
            </h1>
            <p className="hidden text-xs font-medium text-stone-500 sm:block">
              Intelligent Restaurant System
            </p>
          </div>
        </div>

        {/* Global Branch Selector & Offline Handler */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50/50 p-1">
            <span className="pl-2.5 text-xs font-semibold text-stone-500">Branch:</span>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="rounded-md border-0 bg-transparent px-2 py-1 text-xs font-bold text-stone-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sync Engine / Online Indicator */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-300 ${
                isOnline
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-150"
                  : "bg-amber-50 text-amber-700 border border-amber-150"
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Online Sync</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3.5 w-3.5 animate-pulse" />
                  <span>Offline Mode</span>
                </>
              )}
            </div>

            {syncPending && (
              <div className="flex items-center gap-1 text-xs text-orange-600 animate-spin">
                <RotateCw className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Navigation Subbar (Beautiful scannable tabs) */}
      <div className="border-t border-stone-150 bg-stone-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <nav className="flex space-x-1 py-2 overflow-x-auto scrollbar-none" aria-label="Tabs">
            {[
              { id: "pos", name: "Billing (POS)", icon: ShoppingBag },
              { id: "inventory", name: "Inventory", icon: Boxes },
              { id: "shifts", name: "Shift Roster", icon: CalendarDays },
              { id: "loyalty", name: "Loyalty Members", icon: Users },
              { id: "reports", name: "Sales Reports", icon: LineChart },
              { id: "settings", name: "System Settings", icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? "bg-white text-stone-900 shadow-sm border border-stone-200/60"
                      : "text-stone-500 hover:bg-stone-100 hover:text-stone-800"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-orange-600" : "text-stone-400"}`} />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
