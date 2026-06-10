import React from "react";
import { LayoutDashboard, Package, ShoppingBag, Truck, Users, MessageSquare, BarChart3, ArrowLeft, Database } from "lucide-react";
import { DbConfig } from "../types";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onExit: () => void;
  dbConfig: DbConfig;
}

export default function AdminSidebar({ activeTab, onTabChange, onExit, dbConfig }: AdminSidebarProps) {
  const MENU_ITEMS = [
    { id: "dashboard", label: "Ringkasan Panel", icon: LayoutDashboard },
    { id: "kelola-produk", label: "Kelola Produk", icon: Package },
    { id: "kelola-pesanan", label: "Kelola Pesanan", icon: ShoppingBag },
    { id: "kelola-pengiriman", label: "Pengiriman & Resi", icon: Truck },
    { id: "data-pelanggan", label: "Data Pelanggan", icon: Users },
    { id: "review", label: "Ulasan & Moderasi", icon: MessageSquare },
    { id: "laporan", label: "Laporan Penjualan", icon: BarChart3 }
  ];

  return (
    <div className="w-64 bg-brand-primary text-gray-400 min-h-screen p-5 flex flex-col justify-between shrink-0 border-r border-[#2d2e2c]">
      
      {/* Upper Panel Branding */}
      <div>
        <div className="flex items-center gap-3 mb-8 px-2 py-4">
          <div className="w-10 h-10 rounded-xl bg-brand-secondary flex items-center justify-center text-white">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-[#f3f4f6] text-base leading-tight">
              Store Admin
            </h1>
            <span className="font-sans text-[10px] text-brand-secondary tracking-widest uppercase block font-bold leading-none mt-1">
              Admin Panel
            </span>
          </div>
        </div>



        {/* Navigation list */}
        <nav className="space-y-1">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  isActive
                    ? "bg-brand-secondary text-white shadow-md transform translate-x-1"
                    : "hover:bg-[#2d2e2c] hover:text-white"
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Back to store controller */}
      <div className="border-t border-neutral-700/60 pt-4 mt-6">
        <button
          onClick={onExit}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-white bg-[#2d2e2c] hover:bg-[#343633] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-brand-accent" />
          <span>Kembali ke Toko</span>
        </button>
      </div>
    </div>
  );
}
