import React, { useState, useEffect } from "react";
import { Heart, ShoppingCart, Filter, Sparkles, SlidersHorizontal, RefreshCw } from "lucide-react";
import { ProdukDetail } from "../types";

interface KatalogViewProps {
  products: ProdukDetail[];
  categories: any[];
  activeCategory: string;
  activeSize: string;
  searchQuery: string;
  activeSort: string;
  onFilterChange: (type: "category" | "size" | "query" | "sort", value: any) => void;
  onNavigate: (page: string, params?: any) => void;
  onAddToCart: (product: any, size: string) => void;
  onToggleWishlist: (productId: number) => void;
  wishlistIds: number[];
  dbType: "mysql" | "mock";
  loading: boolean;
  isMobile?: boolean;
}

export default function KatalogView({
  products,
  categories,
  activeCategory,
  activeSize,
  searchQuery,
  activeSort,
  onFilterChange,
  onNavigate,
  onAddToCart,
  onToggleWishlist,
  wishlistIds,
  dbType,
  loading,
  isMobile = false
}: KatalogViewProps) {
  const SIZES = ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"];
  const [showMobileFilterPanel, setShowMobileFilterPanel] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, activeSize, searchQuery, activeSort]);

  const ITEMS_PER_PAGE = 30;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = products.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

  const renderPagination = (align: "center" | "end") => {
    if (totalPages <= 1) return null;
    return (
      <div className={`mt-8 flex items-center justify-${align === "center" ? "center" : "end"} gap-1.5`}>
        <button
          disabled={currentPage === 1}
          onClick={() => {
            setCurrentPage(prev => Math.max(prev - 1, 1));
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="px-3 py-1.5 rounded-lg border border-brand-border text-xs font-bold bg-white text-brand-primary hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed select-none transition-colors cursor-pointer"
        >
          Sebelumnya
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
          <button
            key={pg}
            onClick={() => {
              setCurrentPage(pg);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all select-none cursor-pointer ${
              currentPage === pg
                ? "bg-brand-primary text-white border-brand-primary shadow-xs"
                : "bg-white border-brand-border text-brand-muted hover:border-brand-primary"
            }`}
          >
            {pg}
          </button>
        ))}
        <button
          disabled={currentPage === totalPages}
          onClick={() => {
            setCurrentPage(prev => Math.min(prev + 1, totalPages));
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="px-3 py-1.5 rounded-lg border border-brand-border text-xs font-bold bg-white text-brand-primary hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed select-none transition-colors cursor-pointer"
        >
          Berikutnya
        </button>
      </div>
    );
  };

  if (isMobile) {
    return (
      <div className="page-enter py-4 select-none px-3">
        {/* Banner Promo Mobile */}
        <div className="mb-4 bg-[#1b1c1a] text-white p-4 rounded-2xl relative overflow-hidden shadow-xs">
          <div className="absolute top-0 right-0 w-16 h-16 bg-brand-secondary/30 rounded-full blur-lg pointer-events-none"></div>
          <span className="text-[8px] bg-brand-accent font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wider">
            CAMPUS DEALS
          </span>
          <h4 className="font-display font-black text-xs mt-1 leading-snug">
            Garansi Tukar Ukuran 7 Hari Gelas!
          </h4>
          <p className="text-[10px] text-gray-300 leading-normal mt-0.5">
            Salah pilih ukuran? Retur gratis via ekspedisi.
          </p>
        </div>

        {/* Search status / Count */}
        <div className="mb-3 flex items-center justify-between text-[11px] text-brand-muted font-medium bg-white border border-brand-border px-3 py-2 rounded-xl">
          <span>Menampilkan <strong className="text-brand-primary">{startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, products.length)}</strong> dari <strong className="text-brand-primary">{products.length}</strong> produk</span>
          <button 
            onClick={() => setShowMobileFilterPanel(!showMobileFilterPanel)}
            className="text-brand-secondary font-bold flex items-center gap-1 cursor-pointer"
          >
            <SlidersHorizontal className="w-3 h-3" />
            {showMobileFilterPanel ? "Tutup Filter" : "Saring Ukuran"}
          </button>
        </div>

        {/* Dynamic Category Horizontal Scroll Bar */}
        <div className="mb-3">
          <div className="flex gap-1.5 overflow-x-auto hide-scrollbar py-1">
            <button
              onClick={() => onFilterChange("category", "")}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                !activeCategory 
                  ? "bg-brand-primary text-white shadow-xs" 
                  : "bg-white text-brand-muted border border-brand-border"
              }`}
            >
              Semua Sepatu
            </button>
            {categories.map((cat: any) => {
              const isActive = activeCategory && cat.nama_kategori.toLowerCase().includes(activeCategory.toLowerCase());
              return (
                <button
                  key={cat.id_kategori}
                  onClick={() => onFilterChange("category", cat.nama_kategori)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isActive 
                      ? "bg-brand-secondary text-white shadow-xs" 
                      : "bg-white text-brand-muted border border-brand-border"
                  }`}
                >
                  {cat.nama_kategori}
                </button>
              );
            })}
          </div>
        </div>

        {/* Expandable Mobile Sizes/Sort parameters Panel */}
        {showMobileFilterPanel && (
          <div className="mb-4 bg-white border border-brand-border rounded-2xl p-4 shadow-sm animate-page-enter">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-[10px] font-bold uppercase tracking-wider text-brand-primary">Pilih Ukuran</h5>
              {(activeSize || activeSort) && (
                <button 
                  onClick={() => { onFilterChange("size", ""); onFilterChange("sort", ""); }}
                  className="text-[10px] text-rose-500 font-bold hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Horizontal EU size scroll */}
            <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-3">
              {SIZES.map((sz) => (
                <button
                  key={sz}
                  onClick={() => onFilterChange("size", activeSize === sz ? "" : sz)}
                  className={`w-9 h-9 shrink-0 font-mono rounded-lg text-xs font-bold border flex items-center justify-center transition-all ${
                    activeSize === sz
                      ? "bg-brand-primary text-white border-brand-primary"
                      : "bg-brand-bg text-brand-muted border-brand-border hover:border-brand-primary"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="border-t border-brand-border pt-3">
              <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block mb-1.5">
                Urutan Harga Sepatu
              </label>
              <select
                value={activeSort}
                onChange={(e) => onFilterChange("sort", e.target.value)}
                className="w-full bg-brand-bg border border-brand-border rounded-xl px-3 py-2 text-xs text-brand-primary font-bold focus:outline-none"
              >
                <option value="">Rekomendasi (Terbaru)</option>
                <option value="price_asc">Harga Terendah → Tertinggi</option>
                <option value="price_desc">Harga Tertinggi → Terendah</option>
              </select>
            </div>
          </div>
        )}

        {/* 2-Column Responsive Beautiful Shoe Card Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-7 h-7 rounded-full border-3 border-brand-secondary/20 border-t-brand-secondary animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-bold text-brand-muted">Memuat koleksi...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white border border-brand-border rounded-2xl p-10 text-center my-4">
            <Sparkles className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
            <h4 className="font-display font-extrabold text-sm text-brand-primary">
              Sepatu Tidak Ditemukan
            </h4>
            <p className="text-[11px] text-brand-muted mt-1 mb-4">
              Coba gunakan filter lain.
            </p>
            <button
              onClick={() => {
                onFilterChange("category", "");
                onFilterChange("size", "");
                onFilterChange("query", "");
              }}
              className="bg-brand-primary text-white text-[11px] font-bold px-3 py-1.5 rounded-lg"
            >
              Lihat Semua
            </button>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 gap-3">
              {paginatedProducts.map((p) => {
                const isWish = wishlistIds.includes(p.id_produk || 0);
                const sizesArray = p.ukuran ? p.ukuran.split(",").map(s => s.trim()) : ["39", "40", "41", "42", "43"];
                const ratingAvg = Number(p.rating_rata) || 4.8;

                return (
                  <div
                    key={p.id_produk}
                    className="bg-white border border-brand-border rounded-xl overflow-hidden shadow-xs hover:border-brand-primary transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Image Holder */}
                    <div className="relative aspect-square bg-[#eceae6] overflow-hidden cursor-pointer" onClick={() => onNavigate("detail", { id: p.id_produk })}>
                      <img
                        src={p.gambar_produk || "https://images.unsplash.com/photo-1542291026-7eec264c27ff"}
                        alt={p.nama_produk}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Wishlist triggers */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWishlist(p.id_produk || 0);
                        }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center bg-white/90 backdrop-blur-xs border shadow-xs transition-all active:scale-95"
                      >
                        <Heart 
                          className={`w-3.5 h-3.5 ${isWish ? "text-rose-500" : "text-neutral-400"}`} 
                          fill={isWish ? "currentColor" : "none"} 
                        />
                      </button>

                      {/* Explicit block if stock is 0 */}
                      {p.stok === 0 && (
                        <div className="absolute inset-0 bg-brand-primary/50 backdrop-blur-xs flex items-center justify-center">
                          <span className="text-[9px] text-white font-extrabold uppercase bg-brand-accent px-2 py-0.5 rounded-full">
                            Habis
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info body */}
                    <div className="p-2.5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="text-[8px] font-mono font-bold text-brand-secondary bg-brand-secondary/5 px-1 py-0.5 rounded uppercase truncate max-w-[60px]">
                            {p.nama_kategori}
                          </span>
                          <span className="text-[8px] text-brand-muted truncate max-w-[55px]">
                            ⭐ {ratingAvg.toFixed(1)}
                          </span>
                        </div>

                        <h4 
                          onClick={() => onNavigate("detail", { id: p.id_produk })}
                          className="font-display font-extrabold text-[11px] text-[#111111] leading-tight hover:text-brand-secondary block mt-0.5 truncate cursor-pointer"
                        >
                          {p.nama_produk}
                        </h4>
                      </div>

                      {/* Buy area */}
                      <div className="mt-2 pt-1.5 border-t border-brand-border/60 flex items-center justify-between gap-1.5">
                        <span className="font-mono font-black text-[11px] text-brand-primary">
                          Rp {Math.round(p.harga / 1000)}k
                        </span>

                        <button
                          disabled={p.stok === 0}
                          onClick={() => onAddToCart(p, sizesArray[0])}
                          className={`w-6 h-6 rounded-md flex items-center justify-center cursor-pointer ${
                            p.stok === 0
                              ? "bg-neutral-100 text-neutral-300"
                              : "bg-brand-primary text-white hover:bg-brand-secondary active:scale-95 transition-transform"
                          }`}
                          title="Beli"
                        >
                          <ShoppingCart className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {renderPagination("center")}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page-enter py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page title area */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 ">
              <span className="font-mono text-xs text-brand-secondary font-bold uppercase tracking-widest bg-brand-secondary/5 px-2.5 py-1 rounded">
                Koleksi Pilihan
              </span>
            </div>
            <h2 className="font-display font-extrabold text-3xl tracking-tight text-brand-primary">
              Koleksi Sepatu Terbaik
            </h2>
            <p className="text-sm text-brand-muted mt-1">
              Desain modern berstandar premium dengan pilihan terlengkap dan kenyamanan maksimal.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-sans font-medium text-brand-muted hidden sm:inline">Urutkan Harga:</span>
            <select
              value={activeSort}
              onChange={(e) => onFilterChange("sort", e.target.value)}
              className="bg-white border border-brand-border rounded-xl px-4 py-2 text-sm text-brand-primary font-medium focus:outline-none focus:ring-1 focus:ring-brand-secondary cursor-pointer"
            >
              <option value="">Terbaru Baru Masuk</option>
              <option value="price_asc">Harga Terendah</option>
              <option value="price_desc">Harga Tertinggi</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          
          {/* LEFT: Sidebar Filters */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-ambient">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-brand-border mb-4">
                <h3 className="font-display font-bold text-sm text-brand-primary flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-brand-secondary" />
                  Filter Geleri
                </h3>
                {(activeCategory || activeSize || searchQuery) && (
                  <button
                    onClick={() => {
                      onFilterChange("category", "");
                      onFilterChange("size", "");
                      onFilterChange("query", "");
                    }}
                    className="text-xs font-semibold text-rose-500 hover:underline cursor-pointer"
                  >
                    Reset All
                  </button>
                )}
              </div>

              {/* Categories block */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-3">
                  Kategori
                </h4>
                <div className="space-y-1">
                  <button
                    onClick={() => onFilterChange("category", "")}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      !activeCategory 
                        ? "bg-brand-secondary text-white" 
                        : "text-brand-muted hover:bg-neutral-100"
                    }`}
                  >
                    Semua Kategori
                  </button>
                  {categories.map((cat: any) => (
                    <button
                      key={cat.id_kategori}
                      onClick={() => onFilterChange("category", cat.nama_kategori)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                        activeCategory && cat.nama_kategori.toLowerCase().includes(activeCategory.toLowerCase())
                          ? "bg-brand-secondary text-white"
                          : "text-brand-muted hover:bg-neutral-100"
                      }`}
                    >
                      {cat.nama_kategori}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size selector block */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-3">
                  Ukuran
                </h4>
                <div className="grid grid-cols-5 gap-1.5">
                  {SIZES.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => onFilterChange("size", activeSize === sz ? "" : sz)}
                      className={`h-9 font-mono rounded-lg text-xs font-semibold border flex items-center justify-center transition-all ${
                        activeSize === sz
                          ? "bg-brand-primary text-white border-brand-primary"
                          : "bg-brand-bg text-brand-muted border-brand-border hover:border-brand-primary/50"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Display banner/value promo */}
            <div className="bg-brand-primary text-white rounded-2xl p-6 relative overflow-hidden shadow-ambient">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-secondary/20 rounded-full blur-xl pointer-events-none"></div>
              <span className="inline-block bg-brand-secondary text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-3">
                KAMPANYE LOKAL
              </span>
              <h4 className="font-display font-bold text-base leading-tight mb-2">
                Standard Garansi 7 Hari
              </h4>
              <p className="text-[11px] text-[#b5b7b5] leading-relaxed mb-4">
                Sepatu tidak pas di kaki? Konsultasikan dengan admin atau ajukan penukaran ukuran gratis.
              </p>
              <div className="border-t border-neutral-700/60 pt-3 flex items-center justify-between text-xs font-mono">
                <span>Toko Footwear</span>
                <span className="text-brand-accent">★★★★★</span>
              </div>
            </div>
          </aside>

          {/* RIGHT: Grid display */}
          <div className="lg:col-span-3 xl:col-span-4 space-y-6">
            
            {/* Search results notice */}
            <div className="flex items-center justify-between text-xs text-brand-muted font-medium bg-white border border-brand-border px-5 py-3 rounded-xl shadow-ambient">
              <span>Menampilkan <strong className="text-brand-primary">{startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, products.length)}</strong> dari <strong className="text-brand-primary">{products.length}</strong> pasang sepatu di etalase</span>
              {searchQuery && (
                <span>Kata kunci: &quot;<strong className="text-brand-primary">{searchQuery}</strong>&quot;</span>
              )}
            </div>

            {loading ? (
              <div className="py-24 text-center">
                <div className="w-8 h-8 rounded-full border-4 border-brand-secondary/20 border-t-brand-secondary animate-spin mx-auto mb-4"></div>
                <p className="text-sm font-medium text-brand-muted font-sans">Mengambil data produk...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white border border-brand-border rounded-2xl p-16 text-center">
                <div className="w-16 h-16 bg-brand-bg rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-neutral-300" />
                </div>
                <h4 className="font-display font-extrabold text-lg text-brand-primary mb-1">
                  Sepatu Tidak Ditemukan
                </h4>
                <p className="text-sm text-brand-muted max-w-sm mx-auto mb-6">
                  Coba ganti filter ukuran, kategori, atau keyword search Anda untuk menemukan koleksi sepatu lainnya.
                </p>
                <button
                  onClick={() => {
                    onFilterChange("category", "");
                    onFilterChange("size", "");
                    onFilterChange("query", "");
                  }}
                  className="bg-brand-primary text-white text-xs font-semibold px-4 py-2 rounded-xl"
                >
                  Lihat Semua Koleksi
                </button>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {paginatedProducts.map((p) => {
                    const isWish = wishlistIds.includes(p.id_produk || 0);
                    const sizesArray = p.ukuran ? p.ukuran.split(",").map(s => s.trim()) : ["39", "40", "41", "42", "43"];
                    const ratingAvg = Number(p.rating_rata) || 4.8;
                    const reviewCount = p.jumlah_ulasan || 15;

                    return (
                      <div
                        key={p.id_produk}
                        className="bg-white border border-brand-border rounded-2xl overflow-hidden shadow-ambient hover:shadow-ambient-lg hover:-translate-y-1 transition-all duration-300 flex flex-col group"
                      >
                        {/* Image Frame */}
                        <div className="relative aspect-square bg-[#eceae6] overflow-hidden cursor-pointer" onClick={() => onNavigate("detail", { id: p.id_produk })}>
                          <img
                            src={p.gambar_produk || "https://images.unsplash.com/photo-1542291026-7eec264c27ff"}
                            alt={p.nama_produk}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          
                          {/* Wishlist triggers */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleWishlist(p.id_produk || 0);
                            }}
                            className={`absolute top-3.5 right-3.5 w-8.5 h-8.5 rounded-full flex items-center justify-center border transition-all shadow-sm ${
                              isWish 
                                ? "bg-rose-50 border-rose-200 text-rose-500 hover:bg-white" 
                                : "bg-white/80 backdrop-blur-sm border-brand-border/60 text-brand-muted hover:text-rose-500 hover:bg-white"
                            }`}
                          >
                            <Heart className="w-4.5 h-4.5" fill={isWish ? "currentColor" : "none"} />
                          </button>

                          {/* Explicit block if stock is 0 */}
                          {p.stok === 0 && (
                            <div className="absolute inset-0 bg-brand-primary/60 backdrop-blur-xs flex items-center justify-center">
                              <span className="text-white font-display font-medium text-xs tracking-wider uppercase bg-brand-accent px-3 py-1 rounded-full">
                                Stok Habis
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Info body */}
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-mono text-brand-muted uppercase tracking-wider">
                                {p.warna || "Natural Paint"}
                              </span>
                              <span className="text-[10px] font-mono font-semibold text-brand-secondary bg-brand-secondary/5 px-2 py-0.5 rounded">
                                {p.nama_kategori || "Boutique SKU"}
                              </span>
                            </div>

                            <h4 
                              onClick={() => onNavigate("detail", { id: p.id_produk })}
                              className="font-display font-bold text-sm text-brand-primary leading-snug hover:text-brand-secondary transition-colors cursor-pointer"
                            >
                              {p.nama_produk}
                            </h4>

                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-xs text-brand-accent font-semibold flex items-center">
                                ★ {ratingAvg.toFixed(1)}
                              </span>
                              <span className="text-[10px] text-brand-muted font-sans font-medium">
                                ({reviewCount} ulasan)
                              </span>
                            </div>
                          </div>

                          {/* Buy area */}
                          <div className="mt-4 pt-3 border-t border-brand-border/60 flex items-center justify-between">
                            <span className="font-mono font-extrabold text-sm text-brand-primary">
                              Rp {Number(p.harga).toLocaleString("id-ID")}
                            </span>

                            <button
                              disabled={p.stok === 0}
                              onClick={() => onAddToCart(p, sizesArray[0])}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                                p.stok === 0
                                  ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                                  : "bg-brand-primary text-white hover:bg-brand-secondary"
                              }`}
                              title="Masukkan ke keranjang menggunakan ukuran terkecil di stok"
                            >
                              <ShoppingCart className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {renderPagination("end")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
