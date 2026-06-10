import React, { useState } from "react";
import { ShoppingBag, Search, ShoppingCart, Heart, User } from "lucide-react";

interface HeaderProps {
  cartCount: number;
  wishlistCount: number;
  currentUser: any;
  currentRole: "customer" | "admin" | null;
  onNavigate: (page: string, params?: any) => void;
  onLogout: () => void;
  onSearch: (query: string) => void;
  isMobile?: boolean;
}

export default function Header({
  cartCount,
  wishlistCount,
  currentUser,
  currentRole,
  onNavigate,
  onLogout,
  onSearch,
  isMobile = false
}: HeaderProps) {
  const [searchVal, setSearchVal] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchVal);
    onNavigate("katalog", { query: searchVal });
  };

  if (isMobile) {
    return (
      <header className="sticky top-0 z-40 bg-white border-b border-brand-border shadow-xs shrink-0 select-none">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <div className="flex items-center gap-2 cursor-pointer shrink-0 animate-fade-in" onClick={() => onNavigate("beranda")}>
            <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white font-black text-xs">
              F
            </div>
            <div>
              <h1 className="font-display font-extrabold text-[#111111] text-sm tracking-tight leading-tight">
                Toko
              </h1>
              <span className="text-[8px] text-brand-secondary font-mono tracking-widest block uppercase -mt-0.5 font-bold">
                FOOTWEAR
              </span>
            </div>
          </div>

          {/* Compact Mini Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-[160px] relative">
            <input
              type="text"
              placeholder="Cari..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full bg-brand-bg border border-brand-border rounded-lg pl-8 pr-2 py-1 text-xs text-brand-primary placeholder:text-neutral-400 focus:outline-none focus:border-brand-secondary"
            />
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
          </form>

          {/* Small actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {currentRole === "admin" && (
              <button
                onClick={() => onNavigate("admin-dashboard")}
                className="px-2 py-1 bg-brand-primary text-white text-[9px] font-extrabold rounded-md hover:bg-neutral-800 transition-colors"
              >
                ADM
              </button>
            )}

            {currentUser ? (
              <div className="relative">
                <div 
                  onClick={() => setDropdownOpen(!dropdownOpen)} 
                  className="w-7 h-7 rounded-full bg-brand-secondary text-white font-extrabold text-xs flex items-center justify-center cursor-pointer shadow-xs border border-white hover:opacity-90 active:scale-95 transition-all select-none"
                  title={currentUser.name}
                >
                  {currentUser.name[0].toUpperCase()}
                </div>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-brand-border rounded-xl shadow-lg py-1 z-50 animate-fade-in text-[11px] font-sans">
                    <div className="px-3 py-1.5 border-b border-brand-border text-brand-primary truncate">
                      <strong>{currentUser.name}</strong>
                      <div className="text-[9px] text-[#888] truncate">{currentUser.email}</div>
                    </div>
                    <button
                      onClick={() => {
                        onNavigate("profil");
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-brand-primary hover:bg-neutral-50 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      Profil &amp; Pesanan Selesai
                    </button>
                    {currentRole === "admin" && (
                      <button
                        onClick={() => {
                          onNavigate("admin-dashboard");
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-brand-primary hover:bg-neutral-50 transition-colors cursor-pointer flex items-center gap-1.5 border-t border-brand-border/40"
                      >
                        Dashboard Admin
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onLogout();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border-t border-brand-border flex items-center gap-1.5 font-bold"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onNavigate("auth")}
                className="w-7 h-7 rounded-full bg-neutral-100 text-brand-muted flex items-center justify-center hover:bg-neutral-200 transition-colors"
                title="Masuk"
              >
                <User className="w-3.5 h-3.5 text-brand-primary" />
              </button>
            )}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-brand-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate("beranda")}>
            <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center text-white font-extrabold tracking-tight">
              F
            </div>
            <div>
              <h1 className="font-display font-bold text-xl tracking-tight text-brand-primary flex items-center gap-1.5">
                Toko Footwear
              </h1>
              <span className="font-sans text-[10px] text-brand-primary/50 tracking-widest uppercase block mt-[-3px]">
                Premium Collection
              </span>
            </div>
          </div>
        </div>

        {/* Quick category links */}
        <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-brand-muted">
          <button onClick={() => { onSearch("Sneakers"); onNavigate("katalog", { category: "Sneakers" }); }} className="hover:text-brand-primary transition-colors cursor-pointer">Sneakers</button>
          <button onClick={() => { onSearch("Formal"); onNavigate("katalog", { category: "Formal" }); }} className="hover:text-brand-primary transition-colors cursor-pointer">Formal</button>
          <button onClick={() => { onSearch("Boots"); onNavigate("katalog", { category: "Boots" }); }} className="hover:text-brand-primary transition-colors cursor-pointer">Boots</button>
          <button onClick={() => { onSearch("Sandal"); onNavigate("katalog", { category: "Sandal" }); }} className="hover:text-brand-primary transition-colors cursor-pointer">Sandal</button>
          <button onClick={() => { onSearch(""); onNavigate("katalog"); }} className="hover:text-brand-primary transition-colors font-semibold text-brand-secondary cursor-pointer">Semua</button>
        </div>

        {/* Search Field */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-sm relative">
          <input
            type="text"
            placeholder="Cari sepatu impianmu..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full bg-brand-bg border border-brand-border rounded-xl pl-10 pr-4 py-2 text-sm font-sans text-brand-primary focus:outline-none focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary transition-shadow"
          />
          <Search className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-brand-primary/40 pointer-events-none" />
        </form>

        {/* Action controls */}
        <div className="flex items-center justify-between md:justify-end gap-4 min-w-[200px]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate("wishlist")}
              className="p-2 text-brand-muted hover:text-brand-primary transition-colors relative cursor-pointer"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-brand-accent text-white font-sans text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center badge-pulse">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onNavigate("keranjang")}
              className="p-2 text-brand-muted hover:text-brand-primary transition-colors relative cursor-pointer"
              title="Keranjang Belanja"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-brand-secondary text-white font-sans text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center badge-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Admin trigger dashboard if admin is logged in */}
            {currentRole === "admin" && (
              <button
                onClick={() => onNavigate("admin-dashboard")}
                className="px-3 py-1.5 bg-brand-primary text-white text-xs font-semibold rounded-lg hover:bg-brand-primary/95 transition-all cursor-pointer"
              >
                Dashboard
              </button>
            )}

            {currentUser ? (
              <div className="relative">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)} 
                  className="w-8 h-8 rounded-full bg-brand-secondary text-white font-bold text-sm flex items-center justify-center cursor-pointer hover:opacity-90 active:scale-95 transition-all outline-none"
                  title={`${currentUser.name} (Pilihan Akun)`}
                >
                  {currentUser.name[0].toUpperCase()}
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-brand-border rounded-xl shadow-lg py-1.5 z-50 animate-fade-in text-xs font-sans">
                    <div className="px-3 py-2 border-b border-brand-border text-brand-primary truncate">
                      <span className="font-bold block">{currentUser.name}</span>
                      <span className="text-[10px] text-neutral-400 block truncate">{currentUser.email}</span>
                    </div>
                    <button
                      onClick={() => {
                        onNavigate("profil");
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-neutral-50 text-brand-primary font-medium transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <span>Profil &amp; Pesanan Saya</span>
                    </button>
                    {currentRole === "admin" && (
                      <button
                        onClick={() => {
                          onNavigate("admin-dashboard");
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-neutral-50 text-brand-primary font-medium transition-colors cursor-pointer flex items-center gap-2 border-t border-brand-border/40"
                      >
                        <span>Dashboard Admin</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onLogout();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border-t border-brand-border flex items-center gap-2 font-bold"
                    >
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onNavigate("auth")}
                className="p-2 text-brand-muted hover:text-brand-primary transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Masuk Akun"
              >
                <User className="w-5 h-5" />
                <span className="text-xs font-medium hidden sm:inline">Masuk</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
