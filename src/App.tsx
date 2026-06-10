import React, { useState, useEffect } from "react";
import { 
  Heart, ShoppingCart, ShoppingBag, User, Database, RefreshCw, 
  Trash2, Plus, Minus, ArrowRight, ShieldCheck, Star, Award, 
  Flame, Footprints, MessageSquare, MapPin, Truck, Landmark, Key, Phone, CheckCircle, Mail, Map, ArrowLeft, Send,
  Home, Monitor, Smartphone, Menu, CreditCard, QrCode, Lock
} from "lucide-react";

import { DbConfig, ProdukDetail, Kategori, Customer } from "./types";
import { 
  getDbStatus, getProducts, getCategories, getProductDetail, 
  addReview, createOrder, getOrders, loginUser, registerUser, checkProductPurchase 
} from "./services/api";

import Header from "./components/Header";
import Footer from "./components/Footer";
import KatalogView from "./components/KatalogView";
import AdminSidebar from "./components/AdminSidebar";
import AdminDashboardView from "./components/AdminDashboardView";

export default function App() {
  // State management
  const [currentPage, setCurrentPage] = useState("beranda");
  const [currentParam, setCurrentParam] = useState<any>(null);

  // Screen Width Listener for Responsive Breakpoints
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Is active layout treated as mobile?
  const isMobile = windowWidth < 1024;
  
  // Database status
  const [dbConfig, setDbConfig] = useState<DbConfig>({ connected: false, type: "mock" });
  
  // Core datasets
  const [products, setProducts] = useState<ProdukDetail[]>([]);
  const [categories, setCategories] = useState<Kategori[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProdukDetail | null>(null);
  
  // Shopping Cart & Wishlist (Persist in local state)
  const [cart, setCart] = useState<any[]>(() => {
    const saved = localStorage.getItem("ll_cart_persisted");
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlist, setWishlist] = useState<number[]>(() => {
    const saved = localStorage.getItem("ll_wishlist_persisted");
    return saved ? JSON.parse(saved) : [];
  });

  // User auth state
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem("ll_user_session");
    return saved ? JSON.parse(saved) : null;
  });
  const [currentRole, setCurrentRole] = useState<"customer" | "admin" | null>(() => {
    const saved = localStorage.getItem("ll_user_role");
    return saved ? (JSON.parse(saved) as any) : null;
  });

  // Filters for Catalog
  const [activeCategory, setActiveCategory] = useState("");
  const [activeSize, setActiveSize] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSort, setActiveSort] = useState("");

  // Loading indicator & Toast message
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "warning" | "info" } | null>(null);

  // Authentication Fields (Forms)
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [authRole, setAuthRole] = useState<"customer" | "admin">("customer");
  const [emailField, setEmailField] = useState("");
  const [passwordField, setPasswordField] = useState("");
  const [nameField, setNameField] = useState("");
  const [phoneField, setPhoneField] = useState("");
  const [addressField, setAddressField] = useState("");

  // Product Detail sizes & reviews forms
  const [detailSize, setDetailSize] = useState("");
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [productReviewsList, setProductReviewsList] = useState<any[]>([]);
  const [hasPurchasedSelected, setHasPurchasedSelected] = useState<boolean>(false);

  // Checkout gate fields
  const [checkoutCourier, setCheckoutCourier] = useState("SiCepat REG");
  const [checkoutPayment, setCheckoutPayment] = useState("transfer");
  const [checkoutAddressName, setCheckoutAddressName] = useState("");
  const [checkoutAddressNo, setCheckoutAddressNo] = useState("");
  const [checkoutAddressKota, setCheckoutAddressKota] = useState("");

  // Gateway Simulation Modal States
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);
  const [gatewaySubMethod, setGatewaySubMethod] = useState<"va">("va");
  const [gatewaySelectedBank, setGatewaySelectedBank] = useState("BCA");
  const [gatewayProcessing, setGatewayProcessing] = useState(false);
  const [gatewaySuccess, setGatewaySuccess] = useState(false);

  // Customer Orders list
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [activeOrderReceipt, setActiveOrderReceipt] = useState<any>(null);

  // Admin Side Tab Control
  const [adminTab, setAdminTab] = useState("dashboard");
  const [isAdminSidebarOpen, setIsAdminSidebarOpen] = useState(false);

  // Save state on change
  useEffect(() => {
    localStorage.setItem("ll_cart_persisted", JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    localStorage.setItem("ll_wishlist_persisted", JSON.stringify(wishlist));
  }, [wishlist]);
  useEffect(() => {
    localStorage.setItem("ll_user_session", JSON.stringify(currentUser));
    localStorage.setItem("ll_user_role", JSON.stringify(currentRole));
  }, [currentUser, currentRole]);

  // Toast notifier
  const triggerToast = (msg: string, type: "success" | "error" | "warning" | "info" = "success") => {
    setToast({ msg, type });
    setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  // Initial loads & Db config check
  const refreshDbStatus = async () => {
    try {
      const liveStatus = await getDbStatus();
      setDbConfig(liveStatus);
    } catch {
      setDbConfig({ connected: false, type: "mock" });
    }
  };

  const loadCatalogData = async () => {
    setLoading(true);
    try {
      const [allProds, allCats] = await Promise.all([
        getProducts({ 
          category: activeCategory, 
          size: activeSize, 
          query: searchQuery, 
          sort: activeSort 
        }),
        getCategories()
      ]);
      setProducts(allProds);
      setCategories(allCats);
    } catch (err: any) {
      triggerToast("Gagal membaca galeri: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshDbStatus();
  }, []);

  useEffect(() => {
    loadCatalogData();
  }, [activeCategory, activeSize, searchQuery, activeSort]);

  // Load reviews on selecting details
  const loadProductReviewsAndDetail = async (id: number) => {
    setLoading(true);
    try {
      const detail = await getProductDetail(id);
      setSelectedProduct(detail);
      
      const allReviewsResponse = await fetch("/api/reviews");
      if (allReviewsResponse.ok) {
        const list = await allReviewsResponse.json();
        const filtered = list.filter((r: any) => r.id_produk === id);
        setProductReviewsList(filtered);
      }

      if (currentUser && currentUser.id) {
        const canReview = await checkProductPurchase(currentUser.id, id);
        setHasPurchasedSelected(canReview);
      } else {
        setHasPurchasedSelected(false);
      }
    } catch (err: any) {
      triggerToast("Gagal mengambil rincian ulasan: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProduct && selectedProduct.id_produk) {
      if (currentUser && currentUser.id) {
        checkProductPurchase(currentUser.id, selectedProduct.id_produk)
          .then(setHasPurchasedSelected)
          .catch(() => setHasPurchasedSelected(false));
      } else {
        setHasPurchasedSelected(false);
      }
    } else {
      setHasPurchasedSelected(false);
    }
  }, [currentUser, selectedProduct]);

  // Checkout order submission
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      triggerToast("Silakan masuk akun terlebih dahulu sebelum bertransaksi", "warning");
      onNavigate("auth");
      return;
    }
    if (!checkoutAddressName || !checkoutAddressNo || !checkoutAddressKota) {
      triggerToast("Mohon lengkapi parameter alamat pengiriman Anda", "warning");
      return;
    }

    if (checkoutPayment === "transfer") {
      setIsGatewayModalOpen(true);
      setGatewayProcessing(false);
      setGatewaySuccess(false);
      return;
    }

    try {
      const payload = {
        id_customer: currentUser.id,
        items: cart.map(i => ({
          id_produk: i.product.id_produk,
          price: i.product.harga,
          qty: i.qty
        })),
        courier_name: checkoutCourier,
        payment_method: checkoutPayment === "transfer" ? "VA Bank Transfer" : "COD (Bayar Di Tempat)",
        alamat_pengiriman: {
          nama: checkoutAddressName,
          no: checkoutAddressNo,
          kota: checkoutAddressKota
        }
      };

      const result = await createOrder(payload);
      if (result.success) {
        triggerToast("🎉 Pesanan Anda berhasil dibuat!", "success");
        setCart([]); // Clear cart
        
        // Feed mock or database receipt details
        setActiveOrderReceipt({
          id: result.id_pesanan || "#ORD-NEW",
          total: cart.reduce((sum, item) => sum + item.product.harga * item.qty, 0) + 15000,
          courier: checkoutCourier,
          payment: payload.payment_method,
          address: `Jl. ${checkoutAddressName}, No. ${checkoutAddressNo}, ${checkoutAddressKota}`,
          date: new Date().toLocaleDateString("id-ID")
        });

        onNavigate("status");
      }
    } catch (err: any) {
      triggerToast("Transaksi gagal terkirim: " + err.message, "error");
    }
  };

  const handleGatewayPaymentConfirm = async () => {
    setGatewayProcessing(true);
    setTimeout(async () => {
      try {
        const payload = {
          id_customer: currentUser.id,
          items: cart.map(i => ({
            id_produk: i.product.id_produk,
            price: i.product.harga,
            qty: i.qty
          })),
          courier_name: checkoutCourier,
          payment_method: `Virtual Account ${gatewaySelectedBank}`,
          alamat_pengiriman: {
            nama: checkoutAddressName,
            no: checkoutAddressNo,
            kota: checkoutAddressKota
          }
        };

        const result = await createOrder(payload);
        if (result.success) {
          setGatewayProcessing(false);
          setGatewaySuccess(true);
          
          setTimeout(() => {
            setIsGatewayModalOpen(false);
            setCart([]); // Clear cart
            
            setActiveOrderReceipt({
              id: result.id_pesanan || "#ORD-NEW",
              total: cart.reduce((sum, item) => sum + item.product.harga * item.qty, 0) + 15000,
              courier: checkoutCourier,
              payment: payload.payment_method,
              address: `Jl. ${checkoutAddressName}, No. ${checkoutAddressNo}, ${checkoutAddressKota}`,
              date: new Date().toLocaleDateString("id-ID")
            });

            triggerToast("🎉 Pembayaran via Gateway berhasil dikonfirmasi!", "success");
            onNavigate("status");
          }, 1200);
        }
      } catch (err: any) {
        setGatewayProcessing(false);
        triggerToast("Gagal memproses pembayaran gateway: " + err.message, "error");
      }
    }, 1500);
  };

  // Navigations routing
  const onNavigate = (page: string, params?: any) => {
    setCurrentPage(page);
    setCurrentParam(params);
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Handles details routing loading
    if (page === "detail" && params?.id) {
      setDetailSize("");
      loadProductReviewsAndDetail(params.id);
    }

    // Handles receipt or orders histories trigger
    if (page === "profil" && currentUser) {
      getOrders(currentUser.id).then(list => setCustomerOrders(list)).catch(() => {});
    }
  };

  // Login handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailField || !passwordField) {
      triggerToast("Email dan password wajib diisi", "warning");
      return;
    }
    setLoading(true);
    try {
      const response = await loginUser({ email: emailField, password: passwordField });
      if (response && response.success) {
        setCurrentUser(response.user);
        setCurrentRole(response.role);
        triggerToast(`👋 Selamat datang kembali, ${response.user.name}!`, "success");
        setEmailField("");
        setPasswordField("");

        if (response.role === "admin") {
          onNavigate("admin-dashboard");
        } else {
          onNavigate("beranda");
        }
      } else {
        triggerToast(response?.error || response?.message || "Email atau kata sandi Anda kurang tepat", "error");
      }
    } catch (err: any) {
      console.warn("Login component error detail:", err);
      triggerToast(err.message || "Gagal masuk. Silakan periksa koneksi internet Anda atau coba lagi.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Quick sandbox accounts authenticator
  const handleSandboxLogin = async (role: "customer" | "admin") => {
    setLoading(true);
    try {
      const email = role === "admin" ? "budi.admin@footwear.com" : "user@gmail.com";
      const password = role === "admin" ? "admin123" : "pass123";
      const response = await loginUser({ email, password });
      if (response && response.success) {
        setCurrentUser(response.user);
        setCurrentRole(response.role);
        triggerToast(`🔓 Sandbox: Masuk sebagai ${response.user.name} (${response.role === "admin" ? "Admin" : "Pelanggan"})!`, "success");
        onNavigate(response.role === "admin" ? "admin-dashboard" : "beranda");
      } else {
        triggerToast(response?.error || response?.message || "Gagal masuk Sandbox", "error");
      }
    } catch (err: any) {
      console.warn("Sandbox login error detail:", err);
      triggerToast(err.message || "Gagal memproses login Sandbox", "error");
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameField || !emailField || !passwordField) {
      triggerToast("Nama, email, dan password wajib diisi", "warning");
      return;
    }
    setLoading(true);
    try {
      const response = await registerUser({
        name: nameField,
        email: emailField,
        password: passwordField,
        no_hp: phoneField,
        alamat: addressField
      });
      if (response && response.success) {
        setCurrentUser(response.user);
        setCurrentRole("customer");
        triggerToast("🎉 Pendaftaran berhasil! Silakan belanja produk kami.", "success");
        setNameField("");
        setEmailField("");
        setPasswordField("");
        setPhoneField("");
        setAddressField("");
        onNavigate("beranda");
      } else {
        triggerToast(response?.error || response?.message || "Pendaftaran gagal. Silakan coba data lain.", "error");
      }
    } catch (err: any) {
      console.warn("Register error detail:", err);
      triggerToast(err.message || "Pendaftaran gagal. Mohon coba beberapa saat lagi.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentRole(null);
    triggerToast("🔓 Anda telah keluar dari sesi akun", "info");
    onNavigate("beranda");
  };

  // Add review submission
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      triggerToast("Mohon masuk akun dulu untuk menulis ulasan", "warning");
      onNavigate("auth");
      return;
    }
    if (!hasPurchasedSelected) {
      triggerToast("Maaf, Anda hanya bisa menulis ulasan untuk produk yang sudah pernah dibeli!", "warning");
      return;
    }
    if (!reviewText) {
      triggerToast("Tulis komentar ulasan Anda terlebih dahulu", "warning");
      return;
    }

    try {
      await addReview({
        id_customer: currentUser.id,
        id_produk: selectedProduct?.id_produk,
        rating: reviewStars,
        komentar: reviewText
      });

      triggerToast("✍️ Terima kasih! Ulasan Anda berhasil disimpan.", "success");
      setReviewText("");
      if (selectedProduct?.id_produk) {
        loadProductReviewsAndDetail(selectedProduct.id_produk);
      }
    } catch (err: any) {
      triggerToast("Gagal menyimpan ulasan: " + err.message, "error");
    }
  };

  // Add to cart action
  const handleAddToCart = (product: any, size: string) => {
    const existing = cart.find(i => i.product.id_produk === product.id_produk && i.size === size);
    if (existing) {
      setCart(cart.map(i => i.product.id_produk === product.id_produk && i.size === size ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, { product, size, qty: 1 }]);
    }
    triggerToast(`Berhasil menambahkan ${product.nama_produk} (Ukuran ${size}) ke keranjang! 🛒`, "success");
  };

  // Toggle wishlist function
  const handleToggleWishlist = (id: number) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter(w => w !== id));
      triggerToast("Dihapus dari Wishlist", "info");
    } else {
      setWishlist([...wishlist, id]);
      triggerToast("Dimasukkan ke Wishlist! ❤️", "success");
    }
  };

  const isSimulatedFrame = false;

  return (
    <>
      <div className="font-sans text-brand-primary flex flex-col justify-between transition-all duration-300 shadow-sm min-h-screen bg-[#fafafa]">

        {/* Toast Alert overlay */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 animate-bounce">
            <div className={`shadow-ambient-lg rounded-2xl px-5 py-4 text-xs font-semibold text-white flex items-center gap-3 ${
              toast.type === "success" ? "bg-[#1b1c1a] border border-[#30312d]" :
              toast.type === "error" ? "bg-red-600" :
              toast.type === "warning" ? "bg-amber-600" : "bg-neutral-800"
            }`}>
              <Database className="w-4 h-4 text-brand-secondary shrink-0 animate-spin" />
              <span>{toast.msg}</span>
            </div>
          </div>
        )}

        {/* Main Core Router View */}
        {currentPage === "admin-dashboard" ? (
          // ADMIN PANEL FULLSCREEN WRAPPER
          <div className="flex min-h-screen relative overflow-x-hidden bg-neutral-50 font-sans">
            {/* Mobile Sidebar Overlay mask */}
            {isMobile && isAdminSidebarOpen && (
              <div 
                className="fixed inset-0 bg-neutral-900/60 z-40 transition-opacity duration-300"
                onClick={() => setIsAdminSidebarOpen(false)}
              />
            )}
            
            {/* Sidebar wrapper container - Fixed/Floating drawer on mobile, normal layouts on desktop */}
            <div className={`
              ${isMobile ? "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl" : "relative"}
              ${isMobile && !isAdminSidebarOpen ? "-translate-x-full" : "translate-x-0"}
              shrink-0 h-full
            `}>
              <AdminSidebar 
                activeTab={adminTab} 
                onTabChange={(tab) => {
                  setAdminTab(tab);
                  if (isMobile) setIsAdminSidebarOpen(false); // Close drawer on navigation selection
                }} 
                onExit={() => {
                  onNavigate("beranda");
                  if (isMobile) setIsAdminSidebarOpen(false);
                }} 
                dbConfig={dbConfig}
              />
            </div>

            {/* Main content viewport with top mobile navigation header bar */}
            <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden">
              {/* Top Mobile Bar with Hamburger menu button */}
              {isMobile && (
                <div className="bg-brand-primary text-white border-b border-[#2d2e2c] px-5 py-4 flex items-center justify-between z-30 shrink-0 select-none">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsAdminSidebarOpen(!isAdminSidebarOpen)}
                      className="p-1.5 -ml-1 rounded-lg hover:bg-neutral-800 text-[#b5b5b5] hover:text-white transition-colors cursor-pointer"
                      aria-label="Toggle Sidebar Menu"
                      id="admin-burger-button"
                    >
                      <Menu className="w-5 h-5" />
                    </button>
                    <span className="font-display font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                      <span className="bg-brand-secondary text-white text-[10px] w-5 h-5 flex items-center justify-center rounded font-black font-sans shrink-0">F</span>
                      Store Admin
                    </span>
                  </div>
                  <span className="font-mono text-[9px] bg-neutral-900 border border-brand-border/60 text-brand-secondary px-2 py-0.5 rounded tracking-wider uppercase font-bold">
                    {adminTab.replace("-", " ")}
                  </span>
                </div>
              )}
              
              <div className="flex-1 overflow-y-auto">
                <AdminDashboardView 
                  activeTab={adminTab} 
                  dbConfig={dbConfig} 
                  onShowToast={(msg, type: any) => triggerToast(msg, type)}
                />
              </div>
            </div>
          </div>
        ) : (
        // PUBLIC CUSTOMER FRONT STOREFRONT
        <>
          <Header 
            cartCount={cart.reduce((sum, i) => sum + i.qty, 0)}
            wishlistCount={wishlist.length}
            currentUser={currentUser}
            currentRole={currentRole}
            onNavigate={onNavigate}
            onLogout={handleLogout}
            onSearch={setSearchQuery}
            isMobile={isMobile}
          />

          <main className="flex-grow">
            
            {/* VIEW: HOME LANDING */}
            {currentPage === "beranda" && (
              <div className="page-enter">
                {/* Hero Frame */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <div className="relative rounded-3xl overflow-hidden bg-brand-primary text-white p-8 md:p-16 flex flex-col md:flex-row items-center justify-between shadow-ambient-lg min-h-[500px]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-neutral-800 via-transparent to-transparent opacity-40 pointer-events-none"></div>
                    <div className="relative z-10 max-w-xl">
                      <span className="inline-block bg-brand-secondary text-white font-mono text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full mb-4">
                        Koleksi Baru Toko Footwear
                      </span>
                      <h2 className="font-display font-extrabold text-3xl md:text-5xl leading-tight tracking-tight mb-4">
                        Premium Footwear, Built for Steps.
                      </h2>
                      <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-8">
                        Dipercaya oleh ratusan konsumen setia. Berbagai pilihan model sepatu berkualitas tinggi untuk menemani aktivitas harian Anda dengan kenyamanan optimal.
                      </p>
                      <button
                        onClick={() => onNavigate("katalog")}
                        className="bg-white text-brand-primary font-bold text-xs px-8 py-3.5 rounded-xl hover:bg-neutral-100 transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
                      >
                        Belanja Sekarang <ArrowRight className="w-4.5 h-4.5 text-brand-secondary" />
                      </button>
                    </div>

                    <div className="relative mt-8 md:mt-0 w-full md:w-5/12 flex justify-center">
                      <img 
                        src="https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600"
                        alt="Hero Sneakers Wood Frame"
                        className="relative z-10 w-full max-w-[340px] aspect-square object-cover rounded-2xl rotate-[-4deg] shadow-ambient-lg hover:rotate-0 transition-transform duration-500"
                      />
                    </div>
                  </div>
                </section>

                {/* SME Value grids */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-white border border-brand-border p-6 rounded-2xl shadow-ambient text-center sm:text-left flex flex-col justify-between items-center sm:items-start">
                      <Footprints className="w-8 h-8 text-brand-secondary mb-3" />
                      <h4 className="font-display font-bold text-sm text-brand-primary mb-1">Comfort Footwear</h4>
                      <p className="text-xs text-brand-muted leading-relaxed">Material premium dengan sirkulasi udara baik demi kenyamanan kaki Anda.</p>
                    </div>
                    <div className="bg-white border border-brand-border p-6 rounded-2xl shadow-ambient text-center sm:text-left flex flex-col justify-between items-center sm:items-start bg-neutral-50">
                      <Award className="w-8 h-8 text-brand-accent mb-3" />
                      <h4 className="font-display font-bold text-sm text-brand-primary mb-1">Verified Leather Standard</h4>
                      <p className="text-xs text-brand-muted leading-relaxed">Garansi penukaran ukuran gratis apabila ukuran kurang pas.</p>
                    </div>
                    <div className="bg-white border border-brand-border p-6 rounded-2xl shadow-ambient text-center sm:text-left flex flex-col justify-between items-center sm:items-start">
                      <Truck className="w-8 h-8 text-brand-secondary mb-3" />
                      <h4 className="font-display font-bold text-sm text-brand-primary mb-1">Pengiriman Terjamin</h4>
                      <p className="text-xs text-brand-muted leading-relaxed">Sistem logistik cepat se-Indonesia, dikemas rapi &amp; berasuransi penuh.</p>
                    </div>
                  </div>
                </section>

                {/* Popular Highlights */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                  <div className="mb-8 flex items-center justify-between">
                    <div>
                      <h3 className="font-display font-extrabold text-xl text-brand-primary tracking-tight">Kondisi Stok Populer</h3>
                      <p className="text-xs text-brand-muted">Varian terlaris minggu ini yang direkomendasikan pembeli.</p>
                    </div>
                    <button
                      onClick={() => onNavigate("katalog")}
                      className="text-xs font-semibold text-brand-secondary hover:underline cursor-pointer"
                    >
                      Buka Semua Galeri
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.slice(0, 4).map((p) => (
                      <div
                        key={p.id_produk}
                        onClick={() => onNavigate("detail", { id: p.id_produk })}
                        className="bg-white border border-brand-border rounded-2xl overflow-hidden shadow-ambient hover:scale-[1.01] cursor-pointer transition-all duration-300"
                      >
                        <div className="relative aspect-square bg-neutral-100">
                          <img
                            src={p.gambar_produk || "https://images.unsplash.com/photo-1542291026-7eec264c27ff"}
                            alt={p.nama_produk}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <span className="text-[10px] font-mono text-brand-muted tracking-wider block uppercase">{p.warna}</span>
                          <h4 className="font-display font-bold text-xs text-brand-primary truncate max-w-full mt-0.5">{p.nama_produk}</h4>
                          <p className="font-mono font-extrabold text-xs text-brand-primary mt-2">Rp {Number(p.harga).toLocaleString("id-ID")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Corporate Banner promo */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                  <div className="bg-[#1b1c1a] border border-[#2d2e2c] rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between text-white gap-6">
                    <div>
                      <span className="bg-brand-accent text-white font-mono text-[9px] uppercase px-2 py-0.5 rounded tracking-widest font-bold">PROMO KEMERDEKAAN</span>
                      <h4 className="font-display font-bold text-xl mt-3">Diskon Ongkos Kirim Se-Jabodetabek &amp; Jabar</h4>
                      <p className="text-xs text-[#b5b7b5] mt-1">Dapatkan sepatu impian pilihan Anda tanpa beban biaya pengiriman kurir reguler besar.</p>
                    </div>
                    <button
                      onClick={() => onNavigate("katalog")}
                      className="bg-brand-secondary text-white font-bold text-xs px-6 py-3 rounded-xl hover:bg-opacity-95"
                    >
                      Klaim Potongan Belanja
                    </button>
                  </div>
                </section>
              </div>
            )}

            {/* VIEW: CATALOGUE */}
            {currentPage === "katalog" && (
              <KatalogView 
                products={products}
                categories={categories}
                activeCategory={activeCategory}
                activeSize={activeSize}
                searchQuery={searchQuery}
                activeSort={activeSort}
                onFilterChange={(type, val) => {
                  if (type === "category") setActiveCategory(val);
                  if (type === "size") setActiveSize(val);
                  if (type === "query") setSearchQuery(val);
                  if (type === "sort") setActiveSort(val);
                }}
                onNavigate={onNavigate}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                wishlistIds={wishlist}
                dbType={dbConfig.connected ? "mysql" : "mock"}
                loading={loading}
                isMobile={isMobile}
              />
            )}

            {/* VIEW: WISHILIST */}
            {currentPage === "wishlist" && (
              <div className="page-enter py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                  <h2 className="font-display font-extrabold text-2xl text-brand-primary">Daftar Preferensi Saya</h2>
                  <p className="text-xs text-brand-muted mt-1">Koleksi sepatu kulit &amp; sneakers idaman Anda.</p>
                </div>

                {wishlist.length === 0 ? (
                  <div className="bg-white border border-brand-border p-12 text-center rounded-2xl shadow-ambient">
                    <Heart className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-brand-primary">Wishlist Anda Masih Kosong</p>
                    <p className="text-xs text-brand-muted max-w-xs mx-auto mt-1 mb-6">Mulai masukkan sepatu menarik dari etalase untuk memantau harganya.</p>
                    <button onClick={() => onNavigate("katalog")} className="bg-brand-primary text-white text-xs font-semibold px-5 py-2.5 rounded-xl">Buka Galeri Utama</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products
                      .filter(p => wishlist.includes(p.id_produk || 0))
                      .map(p => (
                        <div key={p.id_produk} className="bg-white border border-brand-border rounded-xl overflow-hidden shadow-ambient flex flex-col justify-between">
                          <img src={p.gambar_produk} className="aspect-square object-cover bg-neutral-100" />
                          <div className="p-4 flex-grow flex flex-col justify-between">
                            <div>
                              <h4 className="font-bold text-xs text-brand-primary truncate">{p.nama_produk}</h4>
                              <p className="font-mono text-xs text-brand-primary font-bold mt-1">Rp {Number(p.harga).toLocaleString("id-ID")}</p>
                            </div>
                            <div className="mt-4 flex items-center justify-between border-t border-brand-border/60 pt-3 gap-2">
                              <button onClick={() => onNavigate("detail", { id: p.id_produk })} className="text-xs font-semibold text-brand-secondary hover:underline cursor-pointer">Detail</button>
                              <button 
                                onClick={() => handleAddToCart(p, "42")}
                                className="text-[10px] font-bold bg-brand-primary text-white px-2 py-1 rounded hover:bg-brand-secondary transition-colors cursor-pointer"
                              >
                                + Keranjang
                              </button>
                              <button onClick={() => handleToggleWishlist(p.id_produk || 0)} className="text-xs font-semibold text-rose-500 hover:underline cursor-pointer">Hapus</button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* VIEW: PRODUCT DETAIL (Includes writing reviews in SQL) */}
            {currentPage === "detail" && selectedProduct && (
              <div className="page-enter py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Link */}
                <button 
                  onClick={() => onNavigate("katalog")} 
                  className="mb-6 flex items-center gap-1.5 text-xs font-semibold text-brand-muted hover:text-brand-primary cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-brand-secondary" /> Kembali ke Geleri Produk
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  
                  {/* Photo frame */}
                  <div className="space-y-4">
                    <div className="border border-brand-border rounded-3xl overflow-hidden bg-white aspect-square shadow-ambient">
                      <img 
                        src={selectedProduct.gambar_produk || "https://images.unsplash.com/photo-1542291026-7eec264c27ff"} 
                        alt={selectedProduct.nama_produk}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  </div>

                  {/* Info details */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <span className="font-mono text-xs text-brand-secondary font-bold uppercase tracking-wider bg-brand-secondary/5 px-2.5 py-1 rounded">
                        Kategori: {selectedProduct.nama_kategori || "Boutwear Special"}
                      </span>
                      <h2 className="font-display font-extrabold text-3xl text-brand-primary mt-3 leading-tight">
                        {selectedProduct.nama_produk}
                      </h2>
                      
                      <div className="flex items-center gap-1.5 mt-2 mb-6">
                        <span className="text-neutral-500 text-xs">Ulasan ({productReviewsList.length} pembeli verified)</span>
                        <div className="flex text-brand-accent text-xs">
                          {"★".repeat(Math.round(selectedProduct.rating_rata || 5))}
                        </div>
                      </div>

                      <div className="mb-6 p-4 bg-white border border-brand-border rounded-2xl font-mono">
                        <span className="text-[10px] uppercase font-bold text-[#b5b7b5] block">Harga Retail</span>
                        <h3 className="font-sans font-extrabold text-3xl text-brand-primary mt-1">
                          Rp {Number(selectedProduct.harga || 0).toLocaleString("id-ID")}
                        </h3>
                      </div>

                      {/* Spesifikasi table from database matching colors & size fields */}
                      <div className="space-y-2 mb-6 text-xs text-brand-muted border-t border-brand-border/60 pt-4">
                        <p><strong>Warna:</strong> {selectedProduct.warna || "Seri Klasik"}</p>
                        <p><strong>Stok Gudang:</strong> {selectedProduct.stok > 0 ? `${selectedProduct.stok} Pasang Tersedia` : "Habis Terjual"}</p>
                        <p><strong>Spesifikasi:</strong> {selectedProduct.deskripsi_produk || "Koleksi footwear premium dengan standar kenyamanan dan mutu tinggi."}</p>
                      </div>

                      {/* Pilih Ukuran */}
                      <div className="mb-8">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-brand-primary block mb-3">Pilih Ukuran Tersedia</label>
                        <div className="flex gap-2">
                          {(selectedProduct.ukuran ? selectedProduct.ukuran.split(",").map(s => s.trim()) : ["39", "40", "41", "42", "43"]).map(sz => (
                            <button
                              key={sz}
                              onClick={() => setDetailSize(sz)}
                              className={`w-12 h-10 font-mono text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                                detailSize === sz 
                                  ? "bg-brand-primary text-white border-brand-primary scale-105" 
                                  : "bg-white border-brand-border hover:border-brand-primary text-brand-primary"
                              }`}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions panel */}
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => {
                          if (!detailSize) {
                            triggerToast("Mohon pilih ukuran sepatu Anda", "warning");
                            return;
                          }
                          handleAddToCart(selectedProduct, detailSize);
                        }}
                        disabled={selectedProduct.stok === 0}
                        className={`flex-1 py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          selectedProduct.stok === 0
                            ? "bg-neutral-100 text-neutral-400 cursor-not-allowed border"
                            : "bg-white border border-brand-primary text-brand-primary hover:bg-neutral-50"
                        }`}
                      >
                        <ShoppingCart className="w-4.5 h-4.5" /> Masukkan Keranjang
                      </button>

                      <button
                        onClick={() => {
                          if (!detailSize) {
                            triggerToast("Mohon pilih ukuran sepatu Anda", "warning");
                            return;
                          }
                          handleAddToCart(selectedProduct, detailSize);
                          onNavigate("keranjang");
                        }}
                        disabled={selectedProduct.stok === 0}
                        className={`flex-1 py-3.5 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          selectedProduct.stok === 0
                            ? "bg-neutral-300 cursor-not-allowed"
                            : "bg-brand-primary hover:bg-brand-secondary"
                        }`}
                      >
                        Beli Langsung
                      </button>
                    </div>
                  </div>
                </div>

                {/* REVIEWS SEGMENT (Joined Review table from MySQL) */}
                <div className="mt-16 border-t border-brand-border/65 pt-12">
                  <h3 className="font-display font-extrabold text-lg text-brand-primary flex items-center gap-2 mb-6">
                    <MessageSquare className="w-5 h-5 text-brand-secondary" />
                    Ulasan Pembeli ({productReviewsList.length})
                  </h3>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Left: Input ulasan (SQL insert test loop) */}
                    <div className="lg:col-span-1 bg-white border border-brand-border p-6 rounded-2xl shadow-ambient">
                      <h4 className="font-display font-bold text-xs text-brand-primary uppercase tracking-wider mb-4 border-b pb-2">
                        Tulis Ulasan Baru
                      </h4>

                      {currentUser ? (
                        hasPurchasedSelected ? (
                          <div className="bg-green-50 border border-green-100 text-green-800 rounded-xl p-3 mb-4 text-xs">
                            ✓ <strong>Verified Buyer:</strong> Anda telah memesan sepatu ini. Silakan bagikan pengalaman Anda!
                          </div>
                        ) : (
                          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 mb-4 text-xs leading-relaxed">
                            ⚠️ <strong>Khusus Pembeli:</strong> Ulasan ditutup karena akun Anda belum terdeteksi memesan produk ini di riwayat transaksi.
                          </div>
                        )
                      ) : (
                        <div className="bg-gray-50 border border-gray-200 text-gray-700 rounded-xl p-4 mb-4 text-xs leading-relaxed">
                          🔑 <strong>Masuk Akun:</strong> Silakan masuk ke akun pembeli Anda terlebih dahulu untuk memberikan ulasan produk.
                        </div>
                      )}

                      <form onSubmit={handleReviewSubmit} className="space-y-4">
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block mb-1">Peringkat Bintang</label>
                          <select
                            value={reviewStars}
                            onChange={(e) => setReviewStars(Number(e.target.value))}
                            disabled={!currentUser || !hasPurchasedSelected}
                            className="bg-white border p-2 rounded-xl text-xs w-full focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            <option value={5}>★★★★★ (Sempurna)</option>
                            <option value={4}>★★★★☆ (Bagus)</option>
                            <option value={3}>★★★☆☆ (Standar)</option>
                            <option value={2}>★★☆☆☆ (Kurang)</option>
                            <option value={1}>★☆☆☆☆ (Kecewa)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block mb-1">Komentar Pembeli</label>
                          <textarea
                            placeholder={currentUser && !hasPurchasedSelected ? "Fitur ulasan dinonaktifkan..." : "Tulis ulasan jujur Anda terhadap bahan, ukuran, sol luar..."}
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            disabled={!currentUser || !hasPurchasedSelected}
                            className="bg-white border rounded-xl p-3 text-xs w-full h-24 focus:outline-none focus:border-brand-secondary disabled:bg-neutral-50 disabled:opacity-60 disabled:cursor-not-allowed"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={!currentUser || !hasPurchasedSelected}
                          className={`w-full text-white text-xs font-bold py-2.5 rounded-xl transition-all ${
                            currentUser && hasPurchasedSelected 
                              ? "bg-brand-primary hover:bg-brand-secondary cursor-pointer" 
                              : "bg-neutral-300 cursor-not-allowed opacity-60"
                          }`}
                        >
                          Simpan Review ke Database
                        </button>
                      </form>
                    </div>

                    {/* Right: Reviews List grid */}
                    <div className="lg:col-span-2 space-y-4">
                      {productReviewsList.length === 0 ? (
                        <div className="bg-neutral-50 border p-6 text-center text-brand-muted text-xs rounded-xl">
                          Belum ada ulasan untuk sepatu ini. Jadilah pembeli pertama!
                        </div>
                      ) : (
                        productReviewsList.map(item => (
                          <div key={item.id_review} className="bg-white border border-brand-border p-4 rounded-xl shadow-ambient flex flex-col justify-between">
                            <div className="flex items-center justify-between border-b pb-2 mb-2 text-xs">
                              <span className="font-bold text-brand-primary">{item.nama_customer || "Customer"}</span>
                              <span className="text-brand-accent">{"★".repeat(item.rating)}</span>
                            </div>
                            <p className="text-xs text-brand-muted italic mt-1">&quot;{item.komentar}&quot;</p>
                            <span className="text-[9px] text-[#b5b7b5] block text-right mt-2">{item.tanggal_review}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW: BASKET SINK (Cart items) */}
            {currentPage === "keranjang" && (
              <div className="page-enter py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                  <h2 className="font-display font-extrabold text-2xl text-brand-primary">Keranjang Belanja</h2>
                  <p className="text-xs text-brand-muted mt-1">Kelola item pilihan Anda sebelum melakukan konfirmasi pembayaran.</p>
                </div>

                {cart.length === 0 ? (
                  <div className="bg-white border border-brand-border p-16 text-center rounded-2xl shadow-ambient">
                    <ShoppingCart className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                    <p className="font-display font-bold text-sm text-brand-primary">Keranjang Anda Kosong</p>
                    <p className="text-xs text-brand-muted max-w-xs mx-auto mt-1 mb-6">Temukan berbagai model sepatu terbaik yang nyaman dipakai. Jelajahi katalog kami.</p>
                    <button onClick={() => onNavigate("katalog")} className="bg-brand-primary text-white text-xs font-semibold px-6 py-2.5 rounded-xl">Lihat Katalog</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Item list */}
                    <div className="lg:col-span-2 space-y-4">
                      {cart.map((item, index) => (
                        <div key={`${item.product.id_produk}-${item.size}-${index}`} className="bg-white border border-brand-border p-5 rounded-2xl shadow-ambient flex gap-4 items-center justify-between">
                          <div className="flex gap-4 items-center">
                            <img src={item.product.gambar_produk} className="w-16 h-16 rounded-xl object-cover bg-neutral-100" />
                            <div>
                              <h4 className="font-bold text-xs text-brand-primary leading-tight">{item.product.nama_produk}</h4>
                              <span className="text-[10px] text-brand-muted block mt-0.5">Ukuran {item.size}</span>
                              <span className="font-mono text-xs font-bold text-brand-primary block mt-1">Rp {Number(item.product.harga).toLocaleString("id-ID")}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            {/* Quantity controls */}
                            <div className="flex items-center gap-2 bg-neutral-100 p-1 rounded-lg">
                              <button 
                                onClick={() => {
                                  if (item.qty > 1) {
                                    setCart(cart.map((i, idx) => idx === index ? { ...i, qty: i.qty - 1 } : i));
                                  }
                                }}
                                className="w-6 h-6 bg-white rounded flex items-center justify-center font-bold text-xs"
                              >
                                -
                              </button>
                              <span className="font-mono text-xs font-bold px-2">{item.qty}</span>
                              <button 
                                onClick={() => {
                                  setCart(cart.map((i, idx) => idx === index ? { ...i, qty: i.qty + 1 } : i));
                                }}
                                className="w-6 h-6 bg-white rounded flex items-center justify-center font-bold text-xs"
                              >
                                +
                              </button>
                            </div>

                            {/* Delete controller */}
                            <button
                              onClick={() => setCart(cart.filter((_, idx) => idx !== index))}
                              className="text-neutral-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Check total block */}
                    <div className="lg:col-span-1 bg-white border border-brand-border p-6 rounded-2xl shadow-ambient h-fit">
                      <h3 className="font-display font-extrabold text-sm text-brand-primary mb-6">Ringkasan Total Belanja</h3>
                      <div className="space-y-3.5 text-xs text-brand-muted border-b pb-4 mb-4">
                        <div className="flex justify-between">
                          <span>Subtotal ({cart.reduce((sum, i) => sum + i.qty, 0)} pasang)</span>
                          <span className="font-mono font-bold text-brand-primary">
                            Rp {cart.reduce((sum, item) => sum + item.product.harga * item.qty, 0).toLocaleString("id-ID")}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ongkos Kirim Kurir REG</span>
                          <span className="font-mono font-bold text-[#f3f4f6] bg-[#111] px-1.5 py-0.5 rounded text-[10px]">
                            Rp 15.000 (standard)
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-sm font-bold text-brand-primary mb-6">
                        <span>Total Tagihan</span>
                        <span className="font-mono text-brand-secondary text-base">
                          Rp {(cart.reduce((sum, item) => sum + item.product.harga * item.qty, 0) + 15000).toLocaleString("id-ID")}
                        </span>
                      </div>

                      <button
                        onClick={() => onNavigate("checkout")}
                        className="w-full py-3 bg-brand-primary text-white text-xs font-bold rounded-xl hover:bg-brand-secondary transition-colors"
                      >
                        Lanjut ke Checkout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VIEW: CHECKOUT INTERNET ORDER FORM */}
            {currentPage === "checkout" && (
              <div className="page-enter py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8 border-b pb-4">
                  <h2 className="font-display font-extrabold text-2xl text-brand-primary">Formulir Checkout SQL</h2>
                  <p className="text-xs text-brand-muted mt-1">Data alamat pengiriman &amp; metode pembayaran akan otomatis tercatat ke Database.</p>
                </div>

                <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Left columns: Address name, phone, etc */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Alamat card */}
                    <div className="bg-white border border-brand-border p-6 rounded-2xl shadow-ambient space-y-4">
                      <h4 className="font-display font-bold text-xs text-brand-primary uppercase tracking-wider flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-brand-secondary" /> Alamat Pengiriman
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block mb-1">Nama Penerima *</label>
                          <input 
                            type="text"
                            required
                            placeholder={currentUser?.name || "Budi Santoso"}
                            value={checkoutAddressName}
                            onChange={(e) => setCheckoutAddressName(e.target.value)}
                            className="bg-white border w-full rounded-xl p-2.5 text-xs text-brand-primary focus:outline-none focus:border-brand-secondary"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block mb-1">Nomor Kontak (HP) *</label>
                          <input 
                            type="text"
                            required
                            placeholder="0812xxxxxxxx"
                            value={checkoutAddressNo}
                            onChange={(e) => setCheckoutAddressNo(e.target.value)}
                            className="bg-white border w-full rounded-xl p-2.5 text-xs text-brand-primary focus:outline-none focus:border-brand-secondary"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block mb-1">Kota / Kabupaten &amp; Alamat Lengkap *</label>
                        <input 
                          type="text"
                          required
                          placeholder="Bandung, Jawa Barat, Jl. Jend Sudirman No. 12"
                          value={checkoutAddressKota}
                          onChange={(e) => setCheckoutAddressKota(e.target.value)}
                          className="bg-white border w-full rounded-xl p-2.5 text-xs text-brand-primary focus:outline-none focus:border-brand-secondary"
                        />
                      </div>
                    </div>

                    {/* Jasa Courier chooser */}
                    <div className="bg-white border border-brand-border p-6 rounded-2xl shadow-ambient space-y-4">
                      <h4 className="font-display font-bold text-xs text-brand-primary uppercase tracking-wider flex items-center gap-2">
                        <Truck className="w-4 h-4 text-brand-secondary" /> Jasa Kirim (Standard Rp 15.000)
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        {["SiCepat REG", "JNE Regular", "J&T Express"].map(c => (
                          <div 
                            key={c}
                            onClick={() => setCheckoutCourier(c)}
                            className={`border rounded-xl p-3 text-center cursor-pointer transition-all ${
                              checkoutCourier === c 
                                ? "bg-brand-secondary/5 border-brand-secondary text-brand-primary font-bold scale-102"
                                : "hover:bg-neutral-50 text-brand-muted border-brand-border"
                            }`}
                          >
                            <p className="text-xs">{c}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Payments provider selection */}
                    <div className="bg-white border border-brand-border p-6 rounded-2xl shadow-ambient space-y-4">
                      <h4 className="font-display font-bold text-xs text-brand-primary uppercase tracking-wider flex items-center gap-2">
                        <Landmark className="w-4 h-4 text-brand-secondary" /> Saluran Pembayaran
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: "transfer", name: "Virtual Account" },
                          { id: "cod", name: "Bayar Di Tempat (COD)" }
                        ].map(p => (
                          <div 
                            key={p.id}
                            onClick={() => setCheckoutPayment(p.id)}
                            className={`border rounded-xl p-3 text-center cursor-pointer transition-all ${
                              checkoutPayment === p.id 
                                ? "bg-brand-secondary/5 border-brand-secondary text-brand-primary font-bold scale-102"
                                : "hover:bg-neutral-50 text-brand-muted border-brand-border"
                            }`}
                          >
                            <p className="text-xs font-semibold">{p.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right summary and submit order button */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border border-brand-border p-6 rounded-2xl shadow-ambient">
                      <h4 className="font-display font-bold text-xs text-brand-primary uppercase tracking-wider mb-4 border-b pb-2">Keranjang Ringkasan</h4>
                      <div className="divide-y divide-brand-border/60">
                        {cart.map((item, index) => (
                          <div key={index} className="py-2.5 flex justify-between text-xs text-brand-primary">
                            <span>{item.product.nama_produk} (Ukuran {item.size}) x{item.qty}</span>
                            <span className="font-mono">Rp {(item.product.harga * item.qty).toLocaleString("id-ID")}</span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-brand-border/60 mt-4 pt-4 flex justify-between items-center text-sm font-bold text-brand-primary">
                        <span>Total Bayar</span>
                        <span className="font-mono text-brand-secondary">
                          Rp {(cart.reduce((sum, item) => sum + item.product.harga * item.qty, 0) + 15000).toLocaleString("id-ID")}
                        </span>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-4 mt-6 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-secondary cursor-pointer shadow-md transition-colors"
                      >
                        Konfirmasi Pembayaran
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* VIEW: ORDER STATUS/timeline */}
            {currentPage === "status" && activeOrderReceipt && (
              <div className="page-enter py-12 max-w-xl mx-auto px-4 text-center">
                <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-green-200">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="font-display font-extrabold text-2xl text-brand-primary mb-1">
                  Transaksi Berhasil
                </h3>
                <p className="text-xs text-brand-muted mb-6">Record pesanan diserahkan ke bagian gudang untuk ditempel resi.</p>

                <div className="bg-white border border-brand-border rounded-2xl p-6 text-left shadow-ambient space-y-4 font-sans text-xs">
                  <h4 className="font-display font-bold text-brand-primary uppercase border-b pb-2.5">Struk Konfirmasi Transaksi</h4>
                  <p><strong>ID Transaksi:</strong> {activeOrderReceipt.id}</p>
                  <p><strong>Tanggal Keluar:</strong> {activeOrderReceipt.date}</p>
                  <p><strong>Alamat Pengiriman:</strong> {activeOrderReceipt.address}</p>
                  <p><strong>Metode Pembayaran:</strong> {activeOrderReceipt.payment}</p>
                  <p><strong>Kurir Expedisi:</strong> {activeOrderReceipt.courier}</p>
                  <p className="border-t pt-3.5 flex justify-between font-bold text-brand-primary text-sm">
                    <span>Total Kuitansi</span>
                    <span className="font-mono text-brand-secondary text-sm">Rp {activeOrderReceipt.total.toLocaleString("id-ID")}</span>
                  </p>
                </div>

                <div className="mt-8 flex gap-3">
                  <button 
                    onClick={() => onNavigate("katalog")} 
                    className="flex-1 py-2.5 border rounded-xl text-xs font-semibold hover:bg-neutral-50"
                  >
                    Katalog Utama
                  </button>
                  <button 
                    onClick={() => onNavigate("profil")} 
                    className="flex-1 py-2.5 bg-brand-primary text-white rounded-xl text-xs font-bold hover:bg-brand-secondary"
                  >
                    Kotak Masuk Pesanan
                  </button>
                </div>
              </div>
            )}

            {/* VIEW: PROFIL / Customer Transactions */}
            {currentPage === "profil" && currentUser && (
              <div className="page-enter py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8 border-b pb-4">
                  <h2 className="font-display font-extrabold text-2xl text-brand-primary">Laci Pembelian Saya</h2>
                  <p className="text-xs text-brand-muted mt-1">Riwayat data pesanan Anda yang terintegrasi di sistem kami.</p>
                </div>

                {customerOrders.length === 0 ? (
                  <div className="bg-white border p-12 text-center rounded-2xl shadow-ambient">
                    <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-brand-primary">Tidak Ada Transaksi Lama</p>
                    <p className="text-xs text-brand-muted font-sans mt-1">Anda belum melakukan check-out pesanan apapun.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {customerOrders.map(o => (
                      <div key={o.id_pesanan} className="bg-white border border-brand-border p-6 rounded-2xl shadow-ambient">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 mb-4 text-xs font-mono">
                          <div>
                            <span className="font-bold text-brand-secondary text-sm">{o.id || `#ORD-${o.id_pesanan}`}</span>
                            <span className="text-[#b5b7b5] ml-2">({o.date || o.tanggal_pesanan?.split("T")[0]})</span>
                          </div>
                          <span className={`text-[10px] font-bold uppercase py-0.5 px-2.5 rounded-full ${
                            o.status_pesanan === "Selesai" ? "bg-green-50 text-green-700 border border-green-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}>
                            {o.status_pesanan}
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs text-brand-muted">
                          <p><strong>Gudang Penerima:</strong> {o.alamat_pengiriman}</p>
                          <p><strong>Layanan Expedisi:</strong> {o.jasa_kirim || "SiCepat REG"} (No. Resi: <span className="font-mono text-brand-primary font-bold">{o.nomor_resi || "Menunggu verifikasi admin"}</span>)</p>
                          <p><strong>Metode Pembayaran:</strong> {o.metode_pembayaran || "QRIS Pay"}</p>
                          <p className="text-brand-primary font-bold pt-2.5">Total Pengeluaran: Rp {Number(o.total_harga).toLocaleString("id-ID")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VIEW: AUTHENTICATION ENTRANCE (Admin & Customer unified logins) */}
            {currentPage === "auth" && (
              <div className="page-enter py-12 max-w-md mx-auto px-4">
                <div className="bg-white border border-brand-border p-8 rounded-3xl shadow-ambient-lg">
                  {/* Tab switches login vs register */}
                  <div className="flex border-b border-brand-border mb-6">
                    <button 
                      onClick={() => setAuthTab("login")} 
                      className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition-all cursor-pointer ${
                        authTab === "login" ? "border-brand-primary text-brand-primary" : "border-transparent text-[#b5b7b5]"
                      }`}
                    >
                      Masuk Akun
                    </button>
                    <button 
                      onClick={() => setAuthTab("register")} 
                      className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition-all cursor-pointer ${
                        authTab === "register" ? "border-brand-primary text-brand-primary" : "border-transparent text-[#b5b7b5]"
                      }`}
                    >
                      Daftar Baru
                    </button>
                  </div>

                  {/* Form entries */}
                  {authTab === "login" ? (
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block mb-1">Email Terdaftar</label>
                        <input 
                          type="email"
                          required
                          placeholder="nama@email.com"
                          value={emailField}
                          onChange={(e) => setEmailField(e.target.value)}
                          className="bg-white border w-full rounded-xl p-2.5 text-xs text-brand-primary focus:outline-none focus:border-brand-secondary"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block mb-2">Kata Sandi</label>
                        <input 
                          type="password"
                          required
                          placeholder="Password"
                          value={passwordField}
                          onChange={(e) => setPasswordField(e.target.value)}
                          className="bg-white border w-full rounded-xl p-2.5 text-xs text-brand-primary focus:outline-none focus:border-brand-secondary"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-brand-primary text-white text-xs font-bold py-3 rounded-xl hover:bg-brand-secondary shadow transition-colors"
                      >
                        Login
                      </button>
                    </form>
                  ) : (
                    // Customer registration view
                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block mb-1">Nama Lengkap *</label>
                        <input 
                          type="text"
                          required
                          placeholder="Contoh: Budi Gunawan"
                          value={nameField}
                          onChange={(e) => setNameField(e.target.value)}
                          className="bg-white border w-full rounded-xl p-2.5 text-xs text-brand-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block mb-1">Alamat Email *</label>
                        <input 
                          type="email"
                          required
                          placeholder="budi@gmail.com"
                          value={emailField}
                          onChange={(e) => setEmailField(e.target.value)}
                          className="bg-white border w-full rounded-xl p-2.5 text-xs text-brand-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block mb-1">Kata Sandi Baru *</label>
                        <input 
                          type="password"
                          required
                          placeholder="Kombinasi sandi pengaman..."
                          value={passwordField}
                          onChange={(e) => setPasswordField(e.target.value)}
                          className="bg-white border w-full rounded-xl p-2.5 text-xs text-brand-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block mb-1">Nomor Handphone (HP)</label>
                        <input 
                          type="text"
                          placeholder="0812xxxxxxxx"
                          value={phoneField}
                          onChange={(e) => setPhoneField(e.target.value)}
                          className="bg-white border w-full rounded-xl p-2.5 text-xs text-brand-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block mb-1">Alamat Domisili Tetap</label>
                        <input 
                          type="text"
                          placeholder="Kota, Kecamatan, Nama jalan..."
                          value={addressField}
                          onChange={(e) => setAddressField(e.target.value)}
                          className="bg-white border w-full rounded-xl p-2.5 text-xs text-brand-primary focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-brand-primary text-white text-xs font-bold py-3 rounded-xl hover:bg-brand-secondary shadow transition-colors"
                      >
                        Daftar Akun Baru
                      </button>
                    </form>
                  )}
                </div>

                {/* Active Demo Accounts Info panel (di luar frame form / di bawahnya) */}
                {authTab === "login" && (
                  <div className="mt-5 bg-neutral-50 border border-brand-border rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#a16207]">Gunakan Akun Demo (Klik untuk Isi Cepat)</span>
                      <span className="text-[9px] text-[#858585] font-medium animate-pulse">Tap untuk otomatis terisi</span>
                    </div>
                    <div className="grid grid-cols-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEmailField("user@gmail.com");
                          setPasswordField("pass123");
                          triggerToast("Akun Demo Customer otomatis terisi 🛒", "info");
                        }}
                        className="bg-white hover:bg-neutral-50/75 border border-brand-border hover:border-brand-secondary rounded-xl p-3 text-left transition-all group cursor-pointer"
                      >
                        <span className="text-[9px] font-bold text-brand-muted block group-hover:text-brand-secondary">CUSTOMER / USER</span>
                        <span className="text-[11px] font-mono text-brand-primary block truncate font-semibold">user@gmail.com</span>
                        <span className="text-[9px] text-neutral-450 block font-mono mt-0.5">Sandi: pass123</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>

          <Footer />

          {/* Touch-optimized Sticky Mobile Bottom Navigation Bar */}
          {isMobile && (
            <div className="sticky bottom-0 left-0 right-0 h-[60px] bg-white/95 backdrop-blur-md border-t border-brand-border flex items-center justify-around px-2 z-40 shrink-0 shadow-[0_-5px_15px_-3px_rgba(0,0,0,0.05)]">
              {[
                { id: "beranda", label: "Toko", icon: Footprints },
                { id: "katalog", label: "Katalog", icon: ShoppingBag },
                { id: "wishlist", label: "Favorit", icon: Heart, badge: wishlist.length },
                { id: "keranjang", label: "Keranjang", icon: ShoppingCart, badge: cart.reduce((sum, i) => sum + i.qty, 0) },
                { id: "profil", label: "Profil", icon: User }
              ].map((tab) => {
                const IconComponent = tab.icon;
                const isTabActive = currentPage === tab.id || (tab.id === "profil" && currentPage === "auth");
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (tab.id === "profil" && !currentUser) {
                        onNavigate("auth");
                      } else {
                        onNavigate(tab.id);
                      }
                    }}
                    className={`flex flex-col items-center justify-center flex-1 h-full relative focus:outline-none cursor-pointer transition-all ${
                      isTabActive ? "text-brand-secondary font-extrabold scale-102" : "text-neutral-455 hover:text-brand-primary"
                    }`}
                  >
                    <div className="relative">
                      <IconComponent className={`w-4.5 h-4.5 ${isTabActive ? "text-brand-secondary" : "text-neutral-400"} transition-transform`} />
                      {tab.badge && tab.badge > 0 ? (
                        <span className="absolute -top-1.5 -right-2 bg-brand-accent text-white font-sans text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center badge-pulse">
                          {tab.badge}
                        </span>
                      ) : null}
                    </div>
                    <span className="text-[9px] tracking-tight mt-0.5 font-display text-center block">
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Interactive Virtual Account Sandbox Simulator Modal */}
          {isGatewayModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-sans">
              <div className="bg-white border border-[#eae9e6] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="bg-brand-primary text-white p-5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-secondary flex items-center justify-center text-white">
                      <Landmark className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="font-display font-black text-sm tracking-tight">Virtual Account</h3>
                      <p className="text-[10px] text-brand-secondary/85 font-mono">Payment Gateway - Bayar Instan #{(cart.length > 0 ? cart[0].product.id_produk : 1) * 31 + 452}</p>
                    </div>
                  </div>
                  
                  {!gatewayProcessing && (
                    <button 
                      onClick={() => setIsGatewayModalOpen(false)}
                      className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-all cursor-pointer text-sm font-bold"
                    >
                      Batal
                    </button>
                  )}
                </div>

                {/* Merchant info / Total billing */}
                <div className="bg-neutral-50 px-5 py-4 border-b border-neutral-100 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block">Penerima</span>
                    <span className="text-xs font-bold text-brand-primary animate-pulse">Toko Footwear Store</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block">Total Tagihan</span>
                    <span className="text-sm font-mono font-bold text-brand-secondary">
                      Rp {(cart.reduce((sum, item) => sum + item.product.harga * item.qty, 0) + 15000).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {/* Main content body */}
                <div className="p-5 overflow-y-auto space-y-5 flex-1 text-left">
                  
                  <div className="space-y-4 animate-page-enter">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block">Pilih Bank Tujuan</label>
                      <div className="grid grid-cols-4 gap-2">
                        {["BCA", "Mandiri", "BNI", "BRI"].map((bank) => (
                          <button
                            key={bank}
                            type="button"
                            onClick={() => setGatewaySelectedBank(bank)}
                            className={`py-2 px-1 text-center font-bold text-[11px] rounded-lg border cursor-pointer transition-all ${
                              gatewaySelectedBank === bank 
                                ? "bg-brand-secondary/5 border-brand-secondary text-brand-secondary font-bold" 
                                : "border-neutral-200 hover:bg-neutral-50 text-neutral-600"
                            }`}
                          >
                            {bank}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-neutral-50 border border-brand-border/60 p-4 rounded-xl space-y-3.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-brand-muted">Virtual Account Number:</span>
                        <span className="bg-neutral-100 px-2 py-0.5 rounded font-mono text-[10px] text-brand-primary font-bold">{gatewaySelectedBank} Direct</span>
                      </div>
                      <div className="flex items-center justify-between bg-white border border-brand-border px-3 py-2.5 rounded-lg">
                        <span className="font-mono text-base font-extrabold tracking-wide text-brand-primary">
                          {gatewaySelectedBank === "BCA" ? "88019081274" : 
                           gatewaySelectedBank === "Mandiri" ? "90014081274" : 
                           gatewaySelectedBank === "BNI" ? "82790081274" : "10789081274"}7899
                        </span>
                        <button 
                          type="button"
                          onClick={() => triggerToast("Nomor VA berhasil disalin!", "success")}
                          className="text-[10px] font-bold text-brand-secondary hover:underline cursor-pointer"
                        >
                          Salin
                        </button>
                      </div>
                      
                      <div className="text-[10px] text-brand-muted leading-relaxed space-y-1 bg-white border p-3 rounded-lg border-brand-border/40">
                        <span className="font-bold block text-brand-primary">💡 Panduan Pembayaran:</span>
                        <p>1. Salin nomor Virtual Account di atas.</p>
                        <p>2. Transaksi ini terhubung dengan Secure Gateway.</p>
                        <p>3. Klik tombol <strong className="text-brand-secondary">Konfirmasi Bayar</strong> di bawah agar sistem mendeteksi pembayaran lunas secara real-time.</p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Actions Footer */}
                <div className="p-5 border-t bg-neutral-50/50 flex flex-col space-y-3">
                  {gatewayProcessing ? (
                    <div className="flex flex-col items-center justify-center py-4 space-y-3">
                      <RefreshCw className="w-7 h-7 text-brand-secondary animate-spin" />
                      <p className="text-xs font-semibold text-brand-primary">Memverifikasi transaksi di bank...</p>
                      <p className="text-[10px] text-brand-muted font-mono">Status: Awaiting Transfer</p>
                    </div>
                  ) : gatewaySuccess ? (
                    <div className="flex flex-col items-center justify-center py-4 space-y-2 text-center">
                      <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-inner">
                        <CheckCircle className="w-6 h-6 animate-bounce" />
                      </div>
                      <p className="text-xs font-bold text-green-700">🎉 Pembayaran Berhasil Terdeteksi!</p>
                      <p className="text-[10px] text-brand-muted">Mengalihkan kembali ke halaman pesanan Anda...</p>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleGatewayPaymentConfirm}
                        className="w-full bg-brand-secondary text-white font-bold py-3.5 rounded-xl hover:bg-brand-primary active:scale-98 transition-all cursor-pointer shadow flex items-center justify-center gap-2 text-xs uppercase tracking-wide"
                      >
                        <Lock className="w-3.5 h-3.5 shrink-0" />
                        KONFIRMASI BAYAR
                      </button>
                      <p className="text-[9px] text-center text-neutral-400 font-medium">🛡️ Secure with SSL 256-bit Encryption</p>
                    </>
                  )}
                </div>

              </div>
            </div>
          )}
        </>
      )}

      </div>
    </>
  );
}
