import React, { useState, useEffect } from "react";
import { 
  Plus, Edit, Trash2, Search, Check, Download, AlertCircle, Eye, 
  ArrowUpRight, TrendingUp, TrendingDown, DollarSign, ShoppingBag, 
  Users, Layers, Send, Lock, PackageCheck, Image as ImageIcon
} from "lucide-react";
import { jsPDF } from "jspdf";
import { DbConfig, ProdukDetail, Kategori } from "../types";
import { 
  addProduct, updateProduct, deleteProduct, getCustomers, getReviews, 
  getOrders, updateOrderStatus, getAnalytics, getCategories, getProducts
} from "../services/api";

interface AdminDashboardViewProps {
  activeTab: string;
  dbConfig: DbConfig;
  onShowToast: (msg: string, type?: string) => void;
}

export default function AdminDashboardView({ activeTab, dbConfig, onShowToast }: AdminDashboardViewProps) {
  // Global Admin State
  const [analytics, setAnalytics] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartMonths, setChartMonths] = useState<number>(6);

  // Search parameters for filters
  const [productSearch, setProductSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [catFilter, setCatFilter] = useState("semua");

  // Pagination page states
  const [productPage, setProductPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [shipmentPage, setShipmentPage] = useState(1);
  const [customerPage, setCustomerPage] = useState(1);
  const [reviewPage, setReviewPage] = useState(1);

  // Reset pagination to page 1 on search or tab change
  useEffect(() => {
    setProductPage(1);
  }, [productSearch]);

  useEffect(() => {
    setCustomerPage(1);
  }, [customerSearch]);

  useEffect(() => {
    setProductPage(1);
    setOrderPage(1);
    setShipmentPage(1);
    setCustomerPage(1);
    setReviewPage(1);
  }, [activeTab]);

  const ADMIN_ITEMS_PER_PAGE = 20;

  const renderAdminPagination = (
    currentPage: number,
    totalPages: number,
    onPageChange: (pg: number) => void
  ) => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between border-t border-brand-border px-6 py-4 bg-[#fdfdfc]">
        <div className="text-xs text-brand-muted">
          Halaman {currentPage} dari {totalPages}
        </div>
        <div className="flex items-center gap-1">
          <button
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="px-3 py-1 text-[11px] font-bold border border-brand-border rounded-lg bg-white text-brand-primary hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed select-none transition-colors cursor-pointer"
          >
            Sblmnya
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => {
            if (pg === 1 || pg === totalPages || Math.abs(pg - currentPage) <= 1) {
              return (
                <button
                  key={pg}
                  onClick={() => onPageChange(pg)}
                  className={`w-7 h-7 rounded-lg border text-xs font-bold transition-all select-none cursor-pointer ${
                    currentPage === pg
                      ? "bg-brand-secondary text-white border-brand-secondary shadow-xs"
                      : "bg-white border-brand-border text-brand-muted hover:border-brand-primary"
                  }`}
                >
                  {pg}
                </button>
              );
            }
            if (pg === 2 || pg === totalPages - 1) {
              return <span key={pg} className="px-1 text-xs text-brand-muted cursor-default">...</span>;
            }
            return null;
          })}
          <button
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="px-3 py-1 text-[11px] font-bold border border-brand-border rounded-lg bg-white text-brand-primary hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed select-none transition-colors cursor-pointer"
          >
            Brktnya
          </button>
        </div>
      </div>
    );
  };

  // Add Product Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdStock, setNewProdStock] = useState("");
  const [newProdColor, setNewProdColor] = useState("");
  const [newProdSizes, setNewProdSizes] = useState("39,40,41,42,43");
  const [newProdImage, setNewProdImage] = useState("");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      onShowToast("Ukuran file terlalu besar! Maksimal 5MB.", "warning");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setNewProdImage(event.target.result as string);
        onShowToast("📸 Foto produk berhasil diunggah!", "success");
      }
    };
    reader.readAsDataURL(file);
  };

  // Edit Resi/Shipper state
  const [editingShipment, setEditingShipment] = useState<number | null>(null);
  const [shippingResi, setShippingResi] = useState("");
  const [shippingCourier, setShippingCourier] = useState("SiCepat REG");

  // Fetch all databases logs on load
  const fetchData = async () => {
    setLoading(true);
    try {
      const [analData, custs, revs, ords, prods, cats] = await Promise.all([
        getAnalytics(),
        getCustomers(),
        getReviews(),
        getOrders(),
        getProducts(),
        getCategories()
      ]);
      setAnalytics(analData);
      setCustomers(custs);
      setReviews(revs);
      setOrders(ords);
      setProducts(prods);
      setCategories(cats);
    } catch (err: any) {
      console.warn(err);
      onShowToast("Kesalahan pengambilan database: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const parseOrderDate = (dateVal: any): Date | null => {
    if (!dateVal) return null;
    if (dateVal instanceof Date) return dateVal;
    if (typeof dateVal === "object" && typeof dateVal.getMonth === "function") return dateVal as Date;

    try {
      const d = new Date(dateVal);
      if (!isNaN(d.getTime())) {
        return d;
      }
      
      const dateStr = String(dateVal);
      const normalized = dateStr.replace(" ", "T");
      const dNorm = new Date(normalized);
      if (!isNaN(dNorm.getTime())) {
        return dNorm;
      }
      
      const parts = dateStr.split(" ");
      if (parts.length >= 1) {
        const ymd = parts[0].split("-");
        if (ymd.length === 3) {
          const year = parseInt(ymd[0], 10);
          const month = parseInt(ymd[1], 10) - 1;
          const day = parseInt(ymd[2], 10);
          
          let hour = 0, min = 0, sec = 0;
          if (parts[1]) {
            const hms = parts[1].split(":");
            if (hms.length >= 3) {
              hour = parseInt(hms[0], 10);
              min = parseInt(hms[1], 10);
              sec = parseInt(hms[2], 10);
            }
          }
          return new Date(year, month, day, hour, min, sec);
        }
      }
    } catch (e) {
      console.warn("Date parse error for:", dateVal, e);
    }
    return null;
  };

  // Dynamic monthly orders and revenue aggregator
  const getDynamicRevenueHistory = () => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
    const now = new Date();
    const history = [];

    // Construct last chartMonths months (including current month) dynamically
    for (let i = chartMonths - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = monthNames[d.getMonth()];
      const year = d.getFullYear();
      const monthIdx = d.getMonth();

      // Filter orders for this month & year
      const monthlyOrders = orders.filter((o: any) => {
        const dateVal = o.tanggal_pesanan || o.date;
        if (!dateVal) return false;
        
        const oDate = parseOrderDate(dateVal);
        if (!oDate) return false;
        return oDate.getFullYear() === year && oDate.getMonth() === monthIdx;
      });

      const totalRevenue = monthlyOrders.reduce((sum: number, o: any) => sum + (Number(o.total_harga) || 0), 0);
      const valInMillions = Number((totalRevenue / 1_000_000).toFixed(2));

      history.push({
        label: `${label} '${String(year).slice(-2)}`,
        value: valInMillions,
        raw: totalRevenue,
        orderCount: monthlyOrders.length
      });
    }

    return history;
  };

  // Helper to format currency
  const formatRupiah = (val: number) => {
    return "Rp " + Math.round(val).toLocaleString("id-ID");
  };

  // Real PDF Generator and Download Handler
  const handleDownloadPDF = () => {
    onShowToast("Mengekspor berkas PDF...", "info");

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4" // 210mm x 297mm
      });

      const primaryColor = { r: 27, g: 28, b: 26 }; // #1b1c1a
      const accentColor = { r: 75, g: 65, b: 225 }; // #4b41e1
      const grayMuted = { r: 100, g: 100, b: 100 };

      // Header Top Border Accent
      doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.rect(15, 12, 180, 2, "F");

      // App Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.text("TOKO FOOTWEAR STORE", 15, 23);

      // Subtitle
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(grayMuted.r, grayMuted.g, grayMuted.b);
      doc.text("Laporan Resmi Performa Bisnis & Kinerja Penjualan", 15, 29);

      // Date and Metadata
      const today = new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
      doc.setFontSize(8);
      doc.text(`Tanggal Cetak: ${today}  |  Database: ${dbConfig.type === "mysql" ? "MySQL Live" : "Fallback Latihan"}  |  Status: Aktif`, 15, 34);

      // Line Separator
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.line(15, 38, 195, 38);

      // --- KPI BOXES SECTION ---
      const totalRev = orders.reduce((sum: number, o: any) => sum + (Number(o.total_harga) || 0), 0);
      const totalOrds = orders.length;
      const totalCusts = customers.length;

      // Card Box 1: Revenue
      doc.setFillColor(251, 249, 245); // Soft cream bg
      doc.setDrawColor(234, 232, 228);
      doc.rect(15, 43, 56, 22, "FD");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(grayMuted.r, grayMuted.g, grayMuted.b);
      doc.text("TOTAL PENDAPATAN", 18, 48);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.text(formatRupiah(totalRev), 18, 56);

      // Card Box 2: Total Orders
      doc.setFillColor(251, 249, 245);
      doc.rect(77, 43, 56, 22, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(grayMuted.r, grayMuted.g, grayMuted.b);
      doc.text("TOTAL TRANSAKSI", 80, 48);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
      doc.text(`${totalOrds} Pesanan`, 80, 56);

      // Card Box 3: Total Customers
      doc.setFillColor(251, 249, 245);
      doc.rect(139, 43, 56, 22, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(grayMuted.r, grayMuted.g, grayMuted.b);
      doc.text("PELANGGAN TERDAFTAR", 142, 48);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.text(`${totalCusts} Pelanggan`, 142, 56);

      // --- SECTION I: Tren Penjualan Bulanan ---
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.text(`I. TREN PENDAPATAN BULANAN (${chartMonths} BULAN TERAKHIR)`, 15, 73);

      doc.setDrawColor(230, 230, 230);
      doc.line(15, 75, 195, 75);

      // Table Header for Monthly Trend
      doc.setFillColor(242, 242, 242);
      doc.rect(15, 78, 180, 7, "F");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);
      doc.text("Bulan/Tahun", 18, 83);
      doc.text("Nilai Pendapatan", 77, 83);
      doc.text("Jumlah Transaksi", 139, 83);

      // Monthly Loop rows
      const barData = getDynamicRevenueHistory();
      let yOffset = 85;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);

      barData.forEach((row: any) => {
        doc.line(15, yOffset, 195, yOffset);
        doc.text(row.label, 18, yOffset + 5);
        
        doc.setFont("helvetica", "bold");
        doc.text(formatRupiah(row.raw), 77, yOffset + 5);
        doc.setFont("helvetica", "normal");
        
        doc.text(`${row.orderCount} Transaksi`, 139, yOffset + 5);
        yOffset += 7;
      });

      // --- SECTION II: Performa Produk Unggulan ---
      yOffset += 3;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.text("II. PERFORMA PRODUK UNGGULAN", 15, yOffset + 5);

      doc.line(15, yOffset + 7, 195, yOffset + 7);
      
      doc.setFillColor(242, 242, 242);
      doc.rect(15, yOffset + 10, 180, 7, "F");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);
      doc.text("Nama Produk", 18, yOffset + 15);
      doc.text("Kategori", 95, yOffset + 15);
      doc.text("Jumlah Terjual (Estimasi/Pesanan)", 140, yOffset + 15);

      yOffset = yOffset + 17;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);

      const topProductsLocal = analytics?.topProducts || [
        { name: "Nusantara Minimalist Low", category: "Sneakers Pria", sold: 124 },
        { name: "Heritage Classic Oxford", category: "Formal Pria", sold: 98 },
        { name: "Amora Daily Flat Shoes", category: "Flat Shoes", sold: 76 }
      ];

      topProductsLocal.forEach((prod: any) => {
        doc.line(15, yOffset, 195, yOffset);
        
        doc.setFont("helvetica", "bold");
        doc.text(prod.name.length > 40 ? prod.name.substring(0, 38) + "..." : prod.name, 18, yOffset + 5);
        doc.setFont("helvetica", "normal");
        
        doc.text(prod.category || "Footwear", 95, yOffset + 5);
        doc.text(`${prod.sold} pasang`, 140, yOffset + 5);
        yOffset += 7;
      });

      // --- SECTION III: Riwayat Transaksi Terbaru ---
      yOffset += 3;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.text("III. DAFTAR RIWAYAT TRANSAKSI TERAKHIR", 15, yOffset + 5);

      doc.line(15, yOffset + 7, 195, yOffset + 7);
      
      doc.setFillColor(242, 242, 242);
      doc.rect(15, yOffset + 10, 180, 7, "F");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);
      doc.text("ID", 18, yOffset + 15);
      doc.text("Pelanggan", 40, yOffset + 15);
      doc.text("Tanggal", 85, yOffset + 15);
      doc.text("Metode", 115, yOffset + 15);
      doc.text("Status", 145, yOffset + 15);
      doc.text("Total", 170, yOffset + 15);

      yOffset = yOffset + 17;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);

      // Render top 12 transactions for cleaner single page alignment
      orders.slice(0, 12).forEach((o: any) => {
        if (yOffset > 275) return; // Prevent printing out of bounds
        doc.line(15, yOffset, 195, yOffset);
        
        doc.setFont("helvetica", "bold");
        doc.text(o.id || `#ORD-${String(o.id_pesanan).padStart(4, "0")}`, 18, yOffset + 5);
        doc.setFont("helvetica", "normal");
        
        doc.text(o.nama_customer?.substring(0, 20) || "Pelanggan", 40, yOffset + 5);
        doc.text(o.date || o.tanggal_pesanan?.split(" ")[0] || "Hari ini", 85, yOffset + 5);
        doc.text(o.metode_pembayaran || "Transfer", 115, yOffset + 5);
        doc.text(o.status_pesanan || "Diproses", 145, yOffset + 5);
        doc.text(formatRupiah(o.total_harga), 170, yOffset + 5);
        yOffset += 7;
      });

      doc.line(15, yOffset, 195, yOffset);

      // Drawer signature footer
      doc.setFontSize(7);
      doc.setTextColor(140, 140, 140);
      doc.text("Laporan ini diunduh secara digital dari server Toko Footwear. Segala transaksi tervalidasi sah.", 15, 287);
      doc.text("Halaman 1 dari 1", 178, 287);

      doc.save(`Laporan_Penjualan_TokoFootwear_${new Date().toISOString().substring(0, 10)}.pdf`);
      onShowToast("🎉 Berhasil mengunduh Laporan PDF!", "success");
    } catch (pdfErr: any) {
      console.warn("PDF export error:", pdfErr);
      onShowToast("Gagal mengunduh PDF: " + pdfErr.message, "error");
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Insert or update product
  const handleProductFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdCategory || !newProdPrice || !newProdStock) {
      onShowToast("Mohon lengkapi kolom wajib", "warning");
      return;
    }

    try {
      const payload = {
        id_kategori: Number(newProdCategory),
        nama_produk: newProdName,
        deskripsi_produk: newProdDesc,
        harga: Number(newProdPrice),
        stok: Number(newProdStock),
        ukuran: newProdSizes,
        warna: newProdColor || "Bebas",
        gambar_produk: newProdImage || "https://images.unsplash.com/photo-1542291026-7eec264c27ff"
      };

      if (editingProductId !== null) {
        await updateProduct(editingProductId, payload);
        onShowToast("🏆 Produk berhasil diperbarui!", "success");
      } else {
        await addProduct(payload);
        onShowToast("🏆 Produk berhasil disimpan!", "success");
      }
      
      // Reset
      handleCancelEditOrAdd();
      fetchData(); // Reload
    } catch (err: any) {
      onShowToast("Gagal menyimpan: " + err.message, "error");
    }
  };

  const handleEditProductClick = (p: any) => {
    setEditingProductId(p.id_produk);
    setNewProdName(p.nama_produk);
    setNewProdCategory(String(p.id_kategori));
    setNewProdPrice(String(p.harga));
    setNewProdStock(String(p.stok));
    setNewProdColor(p.warna || "");
    setNewProdSizes(p.ukuran || "39,40,41,42,43");
    setNewProdImage(p.gambar_produk || "");
    setNewProdDesc(p.deskripsi_produk || "");
    setShowAddForm(true);
    // Smooth scroll to top
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const handleCancelEditOrAdd = () => {
    setNewProdName("");
    setNewProdCategory("");
    setNewProdPrice("");
    setNewProdStock("");
    setNewProdColor("");
    setNewProdSizes("39,40,41,42,43");
    setNewProdDesc("");
    setNewProdImage("");
    setEditingProductId(null);
    setShowAddForm(false);
  };

  // Delete product
  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus produk ini dari database?")) return;
    try {
      await deleteProduct(id);
      onShowToast("🗑️ Produk telah dihapus dari database", "success");
      fetchData();
    } catch (err: any) {
      onShowToast("Gagal menghapus: " + err.message, "error");
    }
  };

  // Update order status & shipping tracking information
  const handleUpdateStatus = async (orderId: number, status: string) => {
    try {
      await updateOrderStatus(orderId, { status });
      onShowToast("Update Status Pesanan berhasil", "success");
      fetchData();
    } catch (err: any) {
      onShowToast("Gagal memperbarui status: " + err.message, "error");
    }
  };

  // Attach resi code
  const handleSaveResi = async (orderId: number) => {
    if (!shippingResi) {
      onShowToast("Masukkan nomor resi terlebih dahulu", "warning");
      return;
    }
    try {
      await updateOrderStatus(orderId, { 
        status: "Dikirim", 
        resi: shippingResi, 
        jasa_kirim: shippingCourier 
      });
      onShowToast("Kopi Resi tersambung database! Kurir bertugas.", "success");
      setEditingShipment(null);
      setShippingResi("");
      fetchData();
    } catch (err: any) {
      onShowToast("Gagal menginput resi: " + err.message, "error");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-brand-secondary/20 border-t-brand-secondary animate-spin rounded-full mx-auto mb-4"></div>
          <p className="text-sm font-semibold text-brand-muted">Membaca Record...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 min-w-0 w-full bg-[#fafafa]">
      
      {/* Tab TITLE header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-brand-border">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-brand-primary capitalize">
            {activeTab.replace("-", " ")}
          </h2>
          <p className="text-xs text-brand-muted">
            Panel manajemen toko komprehensif, pesanan, ulasan, dan pelanggan.
          </p>
        </div>
        <button 
          onClick={fetchData} 
          className="text-xs font-semibold px-4 py-2 hover:bg-neutral-100 rounded-xl flex items-center gap-1 border border-brand-border text-brand-primary"
        >
          Muat Ulang Data
        </button>
      </div>

      {/* RENDER DYNAMIC CONTROL TABS */}

      {/* TABS: DASHBOARD METRICS */}
      {activeTab === "dashboard" && (
        <div className="space-y-8 page-enter">
          {/* Summary widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-ambient">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-green-50 text-green-700 rounded-xl">
                  <DollarSign className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-green-600 flex items-center gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" /> {analytics?.revenueStatus || "+12.5%"}
                </span>
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">Total Pendapatan</p>
              <h3 className="font-mono text-2xl font-extrabold text-brand-primary">
                Rp {Number(analytics?.revenueThisMonth || 48500000).toLocaleString("id-ID")}
              </h3>
            </div>

            <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-ambient">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-brand-secondary/5 text-brand-secondary rounded-xl">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-brand-secondary flex items-center gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" /> {analytics?.ordersStatus || "+5.2%"}
                </span>
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">Jumlah Pesanan</p>
              <h3 className="font-display text-2xl font-extrabold text-brand-primary">
                {analytics?.ordersThisMonth || orders.length} Pesanan
              </h3>
            </div>

            <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-ambient">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-amber-600 flex items-center gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" /> {analytics?.customersStatus || "+15%"}
                </span>
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">Data Pelanggan</p>
              <h3 className="font-display text-2xl font-extrabold text-brand-primary">
                {analytics?.customersThisMonth || customers.length} Terdaftar
              </h3>
            </div>
          </div>

          {/* Quick Stats table with latest orders */}
          <div className="bg-white border border-brand-border rounded-2xl shadow-ambient overflow-hidden">
            <div className="p-5 border-b border-brand-border flex justify-between items-center bg-[#fdfdfc]">
              <h3 className="font-display font-extrabold text-sm text-brand-primary">Recent Orders</h3>
              <span className="text-xs font-semibold text-brand-secondary bg-brand-secondary/5 px-2 py-0.5 rounded">
                Menampilkan hingga 50 Transaksi Terbaru
              </span>
            </div>
            <div className="w-full max-w-full overflow-x-auto">
              <table className="w-full text-sm text-left min-w-[700px]">
                <thead className="text-xs uppercase tracking-wider bg-neutral-50 border-b border-brand-border text-brand-muted">
                  <tr>
                    <th className="px-6 py-4">Kode ID</th>
                    <th className="px-6 py-4">Nama Pelanggan</th>
                    <th className="px-6 py-4">Tanggal Pesanan</th>
                    <th className="px-6 py-4">Metode Bayar</th>
                    <th className="px-6 py-4">Status Kirim</th>
                    <th className="px-6 py-4 text-right">Nilai Belanja</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {orders.slice(0, 50).map((o: any) => (
                    <tr key={o.id_pesanan} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-brand-secondary">
                        {o.id || `#ORD-${String(o.id_pesanan).padStart(4, "0")}`}
                      </td>
                      <td className="px-6 py-4 font-semibold text-brand-primary">{o.nama_customer || "Customer"}</td>
                      <td className="px-6 py-4 text-brand-muted">{o.date || o.tanggal_pesanan?.split("T")[0] || "Hari ini"}</td>
                      <td className="px-6 py-4 font-medium text-xs text-brand-primary">
                        {o.metode_pembayaran || "Transfer Bank"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          o.status_pesanan === "Selesai" 
                            ? "bg-green-50 text-green-700 border border-green-200" 
                            : o.status_pesanan === "Dikirim" 
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          {o.status_pesanan || "Diproses"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold">
                        Rp {Number(o.total_harga).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TABS: KELOLA PRODUK */}
      {activeTab === "kelola-produk" && (
        <div className="space-y-6 page-enter">
          
          {/* Header search bar & Add Product Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:max-w-xs relative">
              <input
                type="text"
                placeholder="Cari SKU / nama produk..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full bg-white border border-brand-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-brand-primary focus:outline-none"
              />
              <Search className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-brand-primary text-white text-xs font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-secondary transition-colors flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              Tambah Produk Baru
            </button>
          </div>

          {/* Form Modal popup if showAddForm */}
          {showAddForm && (
            <form onSubmit={handleProductFormSubmit} className="bg-brand-bg border border-brand-border p-6 rounded-2xl shadow-ambient gap-4 flex flex-col page-enter">
              <h3 className="font-display font-black text-sm text-brand-primary border-b border-brand-border pb-2.5 flex items-center gap-2">
                {editingProductId !== null ? (
                  <>
                    <Edit className="w-4.5 h-4.5 text-brand-secondary animate-pulse" />
                    <span>Formulir Edit Sepatu: <strong className="text-brand-primary">{newProdName || `#ID-${editingProductId}`}</strong></span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4.5 h-4.5 text-brand-secondary" />
                    <span>Formulir Tambah Sepatu Baru</span>
                  </>
                )}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block mb-1">Nama Sepatu *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Aero Glide Sneakers"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    className="w-full bg-white border border-brand-border rounded-xl px-4 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block mb-1">Kategori *</label>
                  <select
                    required
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full bg-white border border-brand-border rounded-xl px-4 py-2 text-xs focus:outline-none"
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((c) => (
                      <option key={c.id_kategori} value={c.id_kategori}>{c.nama_kategori}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block mb-1">Harga Retail (Rp) *</label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 450000"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full bg-white border border-brand-border rounded-xl px-4 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block mb-1">Ketersediaan Stok *</label>
                  <input
                    type="number"
                    required
                    placeholder="25"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    className="w-full bg-white border border-brand-border rounded-xl px-4 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block mb-1">Warna Model</label>
                  <input
                    type="text"
                    placeholder="Contoh: Hitam Sand"
                    value={newProdColor}
                    onChange={(e) => setNewProdColor(e.target.value)}
                    className="w-full bg-white border border-brand-border rounded-xl px-4 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block mb-1">Varian Ukuran (Pisahkan Koma)</label>
                  <input
                    type="text"
                    placeholder="39,40,41,42,43"
                    value={newProdSizes}
                    onChange={(e) => setNewProdSizes(e.target.value)}
                    className="w-full bg-white border border-brand-border rounded-xl px-4 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block mb-1">Foto Sepatu Baru (Upload File)</label>
                  
                  <div className="border-2 border-dashed border-brand-border rounded-xl p-4 flex flex-col items-center justify-center bg-neutral-50/50 hover:bg-neutral-50 transition-colors relative">
                    {newProdImage ? (
                      <div className="text-center w-full">
                        <img 
                          src={newProdImage} 
                          alt="Pratinjau baru" 
                          referrerPolicy="no-referrer"
                          className="w-20 h-20 object-cover mx-auto rounded-xl shadow-sm border border-brand-border mb-2"
                        />
                        <p className="text-[10px] text-green-600 font-bold mb-1">✓ Berhasil diunggah</p>
                        <button
                          type="button"
                          onClick={() => setNewProdImage("")}
                          className="text-[10px] text-rose-500 hover:underline font-semibold cursor-pointer"
                        >
                          Hapus Foto
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer text-center py-2 block w-full">
                        <ImageIcon className="w-6 h-6 text-brand-muted/70 mx-auto mb-1.5" />
                        <span className="text-[11px] font-semibold text-brand-secondary hover:underline block mb-0.5">Pilih File Foto</span>
                        <span className="text-[9px] text-brand-muted block">Format PNG, JPG, JPEG (Maks. 5MB)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  
                  <div className="mt-2">
                    <label className="text-[9px] font-semibold text-brand-muted/70 block mb-0.5">Atau masukkan Path Gambar / Link URL (gambar_produk):</label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={newProdImage.startsWith("data:") ? "" : newProdImage}
                      onChange={(e) => setNewProdImage(e.target.value)}
                      className="w-full bg-white border border-brand-border rounded-lg px-3 py-1.5 text-[11px] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block mb-1">Deskripsi &amp; Spesifikasi</label>
                  <textarea
                    placeholder="Material, Sol luar, kenyamanan kaki..."
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                    className="w-full h-32 bg-white border border-brand-border rounded-xl p-3 text-xs focus:outline-none focus:border-brand-secondary resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleCancelEditOrAdd}
                  className="px-4 py-2 border border-brand-border text-brand-muted font-semibold text-xs rounded-xl hover:bg-neutral-100 cursor-pointer"
                >
                  Batal / Tutup
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-primary text-white font-semibold text-xs rounded-xl hover:bg-brand-secondary cursor-pointer"
                >
                  {editingProductId !== null ? "Perbarui & Simpan" : "Simpan Produk"}
                </button>
              </div>
            </form>
          )}

          {/* Table display */}
          {(() => {
            const tempFilteredProducts = products.filter(p => p.nama_produk.toLowerCase().includes(productSearch.toLowerCase()));
            const totalProdPages = Math.ceil(tempFilteredProducts.length / ADMIN_ITEMS_PER_PAGE);
            const paginatedProdList = tempFilteredProducts.slice((productPage - 1) * ADMIN_ITEMS_PER_PAGE, productPage * ADMIN_ITEMS_PER_PAGE);
            const startIdx = (productPage - 1) * ADMIN_ITEMS_PER_PAGE;

            return (
              <div className="bg-white border border-brand-border rounded-2xl shadow-ambient overflow-hidden w-full max-w-full">
                <div className="p-5 border-b border-brand-border flex justify-between items-center bg-[#fdfdfc]">
                  <h3 className="font-display font-extrabold text-sm text-brand-primary">Daftar Produk</h3>
                  <span className="text-xs bg-brand-secondary/5 text-brand-secondary px-2 py-0.5 rounded font-mono">
                    Menampilkan {startIdx + 1}-{Math.min(startIdx + ADMIN_ITEMS_PER_PAGE, tempFilteredProducts.length)} dari {tempFilteredProducts.length} total baris
                  </span>
                </div>
                <div className="w-full max-w-full overflow-x-auto">
                  <table className="w-full text-sm text-left min-w-[700px]">
                    <thead className="text-xs uppercase tracking-wider bg-neutral-50 border-b border-brand-border text-brand-muted">
                      <tr>
                        <th className="px-6 py-4">Foto</th>
                        <th className="px-6 py-4">Spesifikasi Sepatu</th>
                        <th className="px-6 py-4">Kategori</th>
                        <th className="px-6 py-4">Harga Retail</th>
                        <th className="px-6 py-4">Stok</th>
                        <th className="px-6 py-4 text-center">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                      {paginatedProdList.map((p) => (
                        <tr key={p.id_produk} className="hover:bg-neutral-50 transition-colors">
                          <td className="px-6 py-4">
                            <img
                              src={p.gambar_produk || "https://images.unsplash.com/photo-1542291026-7eec264c27ff"}
                              className="w-12 h-12 rounded-lg object-cover bg-neutral-100"
                              alt={p.nama_produk}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-brand-primary">{p.nama_produk}</p>
                            <span className="text-[10px] text-brand-muted block mt-0.5">Warna: {p.warna} | Ukuran: {p.ukuran}</span>
                          </td>
                          <td className="px-6 py-4 text-xs font-semibold text-brand-muted">
                            {p.nama_kategori || "Sepatu Lokal"}
                          </td>
                          <td className="px-6 py-4 font-mono font-extrabold text-brand-primary">
                            Rp {Number(p.harga).toLocaleString("id-ID")}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${p.stok > 10 ? "bg-green-500" : p.stok > 0 ? "bg-amber-400" : "bg-red-500"}`}></span>
                              <span className="font-mono text-xs font-bold">{p.stok} Pasang</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEditProductClick(p)}
                                className="p-1.5 bg-blue-50 rounded-lg text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white transition-all cursor-pointer inline-flex items-center justify-center"
                                title="Ubah info produk"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id_produk || 0)}
                                className="p-1.5 bg-rose-50 rounded-lg text-rose-600 border border-rose-200 hover:bg-rose-600 hover:text-white transition-all cursor-pointer inline-flex items-center justify-center"
                                title="Hapus dari database"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {renderAdminPagination(productPage, totalProdPages, setProductPage)}
              </div>
            );
          })()}
        </div>
      )}

      {/* TABS: KELOLA PESANAN */}
      {activeTab === "kelola-pesanan" && (
        <div className="space-y-6 page-enter">
          {(() => {
            const totalOrderPages = Math.ceil(orders.length / ADMIN_ITEMS_PER_PAGE);
            const paginatedOrders = orders.slice((orderPage - 1) * ADMIN_ITEMS_PER_PAGE, orderPage * ADMIN_ITEMS_PER_PAGE);
            const startIdx = (orderPage - 1) * ADMIN_ITEMS_PER_PAGE;

            return (
              <div className="bg-white border border-brand-border rounded-2xl shadow-ambient overflow-hidden w-full max-w-full">
                <div className="p-5 border-b border-brand-border flex justify-between items-center bg-[#fdfdfc]">
                  <h3 className="font-display font-extrabold text-sm text-brand-primary">Riwayat Penjualan</h3>
                  <span className="text-xs bg-brand-secondary/5 text-brand-secondary px-2 py-0.5 rounded font-mono">
                    Menampilkan {startIdx + 1}-{Math.min(startIdx + ADMIN_ITEMS_PER_PAGE, orders.length)} dari {orders.length} total baris
                  </span>
                </div>
                <div className="w-full max-w-full overflow-x-auto">
                  <table className="w-full text-sm text-left animate-fade-in min-w-[700px]">
                    <thead className="text-xs uppercase tracking-wider bg-neutral-50 border-b border-brand-border text-brand-muted">
                      <tr>
                        <th className="px-6 py-4">Kode ID</th>
                        <th className="px-6 py-4">Nama Pelanggan</th>
                        <th className="px-6 py-4">Alamat Kirim</th>
                        <th className="px-6 py-4">Total bayar</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-center">Modifikasi Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                      {paginatedOrders.map((o: any) => (
                        <tr key={o.id_pesanan} className="hover:bg-neutral-50 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-brand-secondary">
                            {o.id || `#ORD-${String(o.id_pesanan).padStart(4, "0")}`}
                          </td>
                          <td className="px-10 py-4">
                            <p className="font-semibold text-brand-primary">{o.nama_customer}</p>
                            <span className="text-[10px] text-brand-muted block">{o.email}</span>
                          </td>
                          <td className="px-6 py-4 text-xs text-brand-muted truncate max-w-xs" title={o.alamat_pengiriman}>
                            {o.alamat_pengiriman}
                          </td>
                          <td className="px-6 py-3 font-mono font-bold text-brand-primary">
                            Rp {Number(o.total_harga).toLocaleString("id-ID")}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                              o.status_pesanan === "Selesai" 
                                ? "bg-green-50 text-green-700 border border-green-200" 
                                : o.status_pesanan === "Dikirim" 
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}>
                              {o.status_pesanan}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center gap-1.5">
                              <button
                                onClick={() => handleUpdateStatus(o.id_pesanan, "Diproses")}
                                className="px-2 py-1 text-[10px] uppercase font-bold border border-amber-200 bg-amber-50 text-amber-700 rounded hover:bg-amber-500 hover:text-white transition-all cursor-pointer"
                              >
                                Proses
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(o.id_pesanan, "Dikirim")}
                                className="px-2 py-1 text-[10px] uppercase font-bold border border-blue-200 bg-blue-50 text-blue-700 rounded hover:bg-blue-500 hover:text-white transition-all cursor-pointer"
                              >
                                Selesai Kirim
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(o.id_pesanan, "Selesai")}
                                className="px-2 py-1 text-[10px] uppercase font-bold border border-green-200 bg-green-50 text-green-700 rounded hover:bg-green-500 hover:text-white transition-all cursor-pointer"
                              >
                                Selesai
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {renderAdminPagination(orderPage, totalOrderPages, setOrderPage)}
              </div>
            );
          })()}
        </div>
      )}

      {/* TABS: KELOLA PENGIRIMAN */}
      {activeTab === "kelola-pengiriman" && (
        <div className="space-y-6 page-enter">
          {(() => {
            const totalShipmentPages = Math.ceil(orders.length / ADMIN_ITEMS_PER_PAGE);
            const paginatedShipmentOrders = orders.slice((shipmentPage - 1) * ADMIN_ITEMS_PER_PAGE, shipmentPage * ADMIN_ITEMS_PER_PAGE);
            const startIdx = (shipmentPage - 1) * ADMIN_ITEMS_PER_PAGE;

            return (
              <div className="bg-white border border-brand-border rounded-2xl shadow-ambient overflow-hidden w-full max-w-full">
                <div className="p-5 border-b border-brand-border flex justify-between items-center bg-[#fdfdfc]">
                  <h3 className="font-display font-extrabold text-sm text-brand-primary">Pelacakan Resi</h3>
                  <span className="text-xs bg-brand-secondary/5 text-brand-secondary px-2 py-0.5 rounded font-mono">
                    Menampilkan {startIdx + 1}-{Math.min(startIdx + ADMIN_ITEMS_PER_PAGE, orders.length)} dari {orders.length} total baris
                  </span>
                </div>
                <div className="w-full max-w-full overflow-x-auto">
                  <table className="w-full text-sm text-left min-w-[700px]">
                    <thead className="text-xs uppercase tracking-wider bg-neutral-50 border-b border-brand-border text-brand-muted">
                      <tr>
                        <th className="px-6 py-4">Kode ID</th>
                        <th className="px-6 py-4">Jasa Kurir</th>
                        <th className="px-6 py-4">Nomor Resi Pelacakan</th>
                        <th className="px-6 py-4">Tanggal Kirim</th>
                        <th className="px-6 py-4">Status Pengiriman</th>
                        <th className="px-6 py-4 text-center">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                      {paginatedShipmentOrders.map((o: any) => {
                        const isEditing = editingShipment === o.id_pesanan;
                        return (
                          <tr key={o.id_pesanan} className="hover:bg-neutral-50 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-brand-secondary">
                              {o.id || `#ORD-${String(o.id_pesanan).padStart(4, "0")}`}
                            </td>
                            <td className="px-6 py-4 font-semibold text-brand-primary">
                              {isEditing ? (
                                <select
                                  value={shippingCourier}
                                  onChange={(e) => setShippingCourier(e.target.value)}
                                  className="bg-white border rounded p-1 text-xs focus:outline-none"
                                >
                                  <option value="SiCepat REG">SiCepat REG</option>
                                  <option value="JNE Regular">JNE Regular</option>
                                  <option value="J&T Express">J&T Express</option>
                                  <option value="Anteraja">Anteraja</option>
                                  <option value="GoSend Instant">GoSend Instant</option>
                                </select>
                              ) : (
                                o.jasa_kirim || "SiCepat REG"
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={shippingResi}
                                  onChange={(e) => setShippingResi(e.target.value)}
                                  placeholder="Ketik/Paste Resi..."
                                  className="bg-white border rounded p-1 text-xs focus:outline-none text-brand-primary focus:border-brand-secondary"
                                />
                              ) : (
                                <span className="font-mono text-xs bg-neutral-100 text-brand-primary px-2.5 py-1 rounded">
                                  {o.nomor_resi || "Belum Ditempel Resi"}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-xs text-brand-muted">
                              {o.date || "Hari ini"}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                o.status_pesanan === "Selesai" 
                                  ? "bg-green-50 text-green-700 border border-green-200" 
                                  : o.status_pesanan === "Dikirim" 
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}>
                                {o.status_pesanan}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {isEditing ? (
                                <div className="flex justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleSaveResi(o.id_pesanan)}
                                    className="px-3 py-1.5 bg-brand-primary text-white rounded text-xs leading-none font-bold"
                                  >
                                    Simpan
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingShipment(null)}
                                    className="px-3 py-1.5 border border-brand-border text-brand-muted rounded text-xs leading-none"
                                  >
                                    Batal
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setEditingShipment(o.id_pesanan);
                                    setShippingResi(o.nomor_resi || "");
                                    setShippingCourier(o.jasa_kirim || "SiCepat REG");
                                  }}
                                  className="px-3 py-1.5 text-xs font-semibold hover:border-brand-primary border border-brand-border rounded-xl transition-all cursor-pointer inline-flex items-center gap-1"
                                >
                                  Ganti Resi
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {renderAdminPagination(shipmentPage, totalShipmentPages, setShipmentPage)}
              </div>
            );
          })()}
        </div>
      )}

      {/* TABS: DATA PELANGGAN */}
      {activeTab === "data-pelanggan" && (
        <div className="space-y-6 page-enter">
          <div className="flex items-center justify-between">
            <div className="w-full max-w-xs relative">
              <input
                type="text"
                placeholder="Cari pelanggan..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full bg-white border border-brand-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-brand-primary focus:outline-none"
              />
              <Search className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
            </div>
          </div>

          {(() => {
            const tempFilteredCustomers = customers.filter(c => c.nama_customer?.toLowerCase().includes(customerSearch.toLowerCase()));
            const totalCustPages = Math.ceil(tempFilteredCustomers.length / ADMIN_ITEMS_PER_PAGE);
            const paginatedCustomers = tempFilteredCustomers.slice((customerPage - 1) * ADMIN_ITEMS_PER_PAGE, customerPage * ADMIN_ITEMS_PER_PAGE);
            const startIdx = (customerPage - 1) * ADMIN_ITEMS_PER_PAGE;

            return (
              <div className="bg-white border border-brand-border rounded-2xl shadow-ambient overflow-hidden w-full max-w-full">
                <div className="p-5 border-b border-brand-border flex justify-between items-center bg-[#fdfdfc]">
                  <h3 className="font-display font-extrabold text-sm text-brand-primary">Data Profil Pelanggan</h3>
                  <span className="text-xs bg-brand-secondary/5 text-brand-secondary px-2 py-0.5 rounded font-mono">
                    Menampilkan {startIdx + 1}-{Math.min(startIdx + ADMIN_ITEMS_PER_PAGE, tempFilteredCustomers.length)} dari {tempFilteredCustomers.length} total pelanggan
                  </span>
                </div>
                <div className="w-full max-w-full overflow-x-auto">
                  <table className="w-full text-sm text-left min-w-[700px]">
                    <thead className="text-xs uppercase tracking-wider bg-neutral-50 border-b border-brand-border text-brand-muted">
                      <tr>
                        <th className="px-6 py-4">Inisial</th>
                        <th className="px-6 py-4">Nama Pelanggan</th>
                        <th className="px-6 py-4">Email Terdaftar</th>
                        <th className="px-6 py-4">Nomor Kontak (HP)</th>
                        <th className="px-6 py-4">Alamat Profil</th>
                        <th className="px-6 py-4 text-right font-mono text-xs">Total Transaksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                      {paginatedCustomers.map((c: any) => (
                        <tr key={c.id_customer} className="hover:bg-neutral-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="w-9 h-9 rounded-full bg-brand-secondary/10 text-brand-secondary font-bold text-xs flex items-center justify-center border border-brand-secondary/20">
                              {c.nama_customer ? c.nama_customer[0].toUpperCase() : "U"}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-semibold text-brand-primary">{c.nama_customer}</td>
                          <td className="px-6 py-4 text-brand-muted">{c.email}</td>
                          <td className="px-6 py-4 text-xs font-mono">{c.no_hp || "08xxxx"}</td>
                          <td className="px-6 py-4 text-xs text-brand-muted truncate max-w-xs" title={c.alamat}>
                            {c.alamat || "Alamat belum diinput pelanggan"}
                          </td>
                          <td className="px-6 py-4 text-right font-mono font-bold text-brand-primary">
                            Rp {Number(c.total_transaksi || 0).toLocaleString("id-ID")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {renderAdminPagination(customerPage, totalCustPages, setCustomerPage)}
              </div>
            );
          })()}
        </div>
      )}

      {/* TABS: ULASAN MODERASI */}
      {activeTab === "review" && (
        <div className="space-y-6 page-enter">
          {(() => {
            const totalReviewPages = Math.ceil(reviews.length / ADMIN_ITEMS_PER_PAGE);
            const paginatedReviews = reviews.slice((reviewPage - 1) * ADMIN_ITEMS_PER_PAGE, reviewPage * ADMIN_ITEMS_PER_PAGE);
            const startIdx = (reviewPage - 1) * ADMIN_ITEMS_PER_PAGE;

            return (
              <>
                <div className="flex justify-between items-center bg-white border border-brand-border px-5 py-3 rounded-xl shadow-xs">
                  <h3 className="font-display font-extrabold text-sm text-brand-primary">Moderasi Ulasan Pembeli</h3>
                  <span className="text-xs bg-brand-secondary/5 text-brand-secondary px-2 py-0.5 rounded font-mono">
                    Menampilkan {startIdx + 1}-{Math.min(startIdx + ADMIN_ITEMS_PER_PAGE, reviews.length)} dari {reviews.length} total ulasan
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {paginatedReviews.map((r: any) => (
                    <div 
                      key={r.id_review} 
                      className="bg-white border border-brand-border rounded-xl p-5 shadow-ambient flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3 pb-3 border-b border-brand-border/60">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-brand-secondary/10 text-brand-secondary text-xs font-bold rounded-full flex items-center justify-center">
                              {r.nama_customer ? r.nama_customer[0].toUpperCase() : "P"}
                            </div>
                            <div>
                              <p className="font-semibold text-xs text-brand-primary">{r.nama_customer || "Customer"}</p>
                              <span className="text-[9px] text-[#b5b7b5] font-mono leading-none block">{r.tanggal_review?.split(" ")[0]}</span>
                            </div>
                          </div>
                          {/* Stars */}
                          <span className="text-xs text-brand-accent font-bold">
                            {"★".repeat(r.rating)}
                            {"☆".repeat(5 - r.rating)}
                          </span>
                        </div>

                        <p className="text-xs font-bold text-brand-muted mb-2 bg-brand-bg px-2.5 py-1 rounded inline-block">
                          Produk: {r.nama_produk || "Sepatu Lokal"}
                        </p>

                        <p className="text-xs font-medium text-brand-primary leading-relaxed bg-[#fdfdfc] italic border-l-2 border-brand-secondary/30 p-2.5 rounded-r">
                          &quot;{r.komentar || "Ulasan tanpa ulasan komentar teks."}&quot;
                        </p>
                      </div>

                      <div className="mt-4 pt-3 flex justify-end">
                        <span className="text-[10px] text-green-700 bg-green-50 px-2.5 py-1 rounded uppercase tracking-wider font-bold">
                          ✓ Verified Buyer
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {renderAdminPagination(reviewPage, totalReviewPages, setReviewPage)}
              </>
            );
          })()}
        </div>
      )}

      {/* TABS: LAPORAN PENJUALAN */}
      {activeTab === "laporan" && (
        <div className="space-y-8 page-enter">
          
          {/* Revenue Tren Chart using purely stylized HTML bars */}
          <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-ambient">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
              <div>
                <h3 className="font-display font-extrabold text-sm text-brand-primary">Grafik Penjualan Bulanan ({chartMonths} Bulan Terakhir)</h3>
                <p className="text-[11px] text-brand-muted mt-0.5">Pendapatan kotor bulanan real-time berdasarkan pesanan tervalidasi</p>
              </div>
              <div className="flex items-center gap-4 flex-wrap w-full sm:w-auto">
                <div className="flex bg-brand-bg p-1 rounded-xl border border-brand-border text-[11px] font-bold">
                  {[3, 6, 12].map((m) => (
                    <button
                      key={m}
                      onClick={() => setChartMonths(m)}
                      className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                        chartMonths === m
                          ? "bg-brand-primary text-white shadow-xs"
                          : "text-brand-muted hover:text-brand-primary font-medium"
                      }`}
                    >
                      {m} Bulan
                    </button>
                  ))}
                </div>
                <button 
                  onClick={handleDownloadPDF}
                  className="text-xs bg-brand-primary text-white font-bold px-4 py-2 rounded-xl hover:bg-brand-secondary cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Unduh Laporan PDF
                </button>
              </div>
            </div>

            {/* D3-like flex graphic bar with custom axes and gridlines */}
            {(() => {
              const barData = getDynamicRevenueHistory();
              const maxVal = Math.max(...barData.map((b: any) => b.raw), 1000000);

              return (
                <div className="flex gap-4 h-72 pt-4">
                  {/* Y-Axis Labels - Hidden on tiny mobile screens, shown on sm+ for clean desktop space */}
                  <div className="hidden sm:flex flex-col justify-between text-[10px] font-mono text-brand-muted pb-8 font-bold w-24 text-right pr-2">
                    <div>{formatRupiah(maxVal)}</div>
                    <div>{formatRupiah(maxVal * 0.66)}</div>
                    <div>{formatRupiah(maxVal * 0.33)}</div>
                    <div>Rp 0</div>
                  </div>

                  {/* Chart Core with Gridlines and Bars */}
                  <div className="flex-1 relative h-full flex flex-col justify-between">
                    {/* Gridlines in background */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
                      <div className="border-b border-dashed border-neutral-200 w-full h-0"></div>
                      <div className="border-b border-dashed border-neutral-200 w-full h-0"></div>
                      <div className="border-b border-dashed border-neutral-200 w-full h-0"></div>
                      <div className="border-b border-neutral-300 w-full h-0"></div>
                    </div>

                    {/* Bars overlay */}
                    <div className="absolute inset-x-0 top-2 bottom-8 flex items-end gap-2 md:gap-4 z-10">
                      {barData.map((bar: any, idx: number) => {
                        const heightPct = Math.max(4, Math.round((bar.raw / maxVal) * 100)); // Min 4% height to be visible even if 0
                        const isHighlight = idx === barData.length - 1; // Highlight latest month dynamically
                        
                        return (
                          <div key={bar.label} className="flex-1 h-full flex flex-col justify-end items-center group cursor-pointer relative">
                            {/* Value tooltip above on group hover */}
                            <div className="absolute -top-8 scale-90 sm:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-neutral-900 text-white text-[10px] sm:text-xs font-mono font-bold px-2 py-1 rounded shadow-md whitespace-nowrap z-30 pointer-events-none">
                              {formatRupiah(bar.raw)}
                            </div>
                            
                            {/* Interactive Bar */}
                            <div className="w-full h-full flex items-end">
                              <div 
                                style={{ height: `${Math.min(100, heightPct)}%` }}
                                className={`w-full rounded-t-md transition-all duration-700 ease-out hover:opacity-95 ${
                                  isHighlight 
                                    ? "bg-brand-secondary shadow-[0_0_12px_rgba(75,65,225,0.4)]" 
                                    : "bg-neutral-300"
                                }`}
                              ></div>
                            </div>

                            {/* Hover bar indicator overlay */}
                            <div className="absolute -bottom-7 text-[10px] sm:text-[11px] font-mono text-brand-muted font-bold whitespace-nowrap">
                              {bar.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Product Performance summaries */}
          <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-ambient">
            <h3 className="font-display font-bold text-sm text-brand-primary mb-4">Performa Produk Unggulan</h3>
            <div className="divide-y divide-brand-border">
              {(analytics?.topProducts || []).map((prod: any) => (
                <div key={prod.name} className="py-4 flex justify-between items-center first:pt-0 last:pb-0">
                  <div>
                    <h4 className="font-semibold text-xs text-brand-primary">{prod.name}</h4>
                    <span className="text-[10px] text-brand-muted block mt-0.5">{prod.category}</span>
                  </div>
                  <div className="text-right font-mono">
                    <p className="font-extrabold text-sm">{prod.sold} pasang terjual</p>
                    <span className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${prod.up ? "text-green-600" : "text-rose-500"}`}>
                      {prod.up ? "▲" : "▼"} +{prod.change}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
