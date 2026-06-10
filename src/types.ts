export interface Admin {
  id_admin?: number;
  nama_admin: string;
  email: string;
  password?: string;
}

export interface Customer {
  id_customer?: number;
  nama_customer: string;
  email: string;
  password?: string;
  no_hp?: string;
  alamat?: string;
}

export interface Kategori {
  id_kategori?: number;
  nama_kategori: string;
  deskripsi?: string;
}

export interface Produk {
  id_produk?: number;
  id_kategori: number;
  nama_produk: string;
  deskripsi_produk?: string;
  harga: number;
  stok: number;
  ukuran?: string;
  warna?: string;
  gambar_produk?: string;
}

export interface ProdukDetail extends Produk {
  nama_kategori?: string;
  rating_rata?: number;
  jumlah_ulasan?: number;
}

export interface Keranjang {
  id_keranjang?: number;
  id_customer: number;
  tanggal_dibuat?: string;
}

export interface DetailKeranjang {
  id_detail_keranjang?: number;
  id_produk: number;
  id_keranjang: number;
  jumlah: number;
  subtotal: number;
}

export interface Pesanan {
  id_pesanan?: number;
  id_customer: number;
  tanggal_pesanan?: string;
  total_harga: number;
  status_pesanan?: string;
  alamat_pengiriman?: string;
}

export interface DetailPesanan {
  id_detail_pesanan?: number;
  id_produk: number;
  id_pesanan: number;
  jumlah: number;
  harga_satuan: number;
  subtotal: number;
}

export interface Pembayaran {
  id_pembayaran?: number;
  id_pesanan: number;
  metode_pembayaran?: string;
  tanggal_pembayaran?: string;
  status_pembayaran?: string;
}

export interface Pengiriman {
  id_pengiriman?: number;
  id_admin: number;
  id_pesanan: number;
  jasa_kirim?: string;
  nomor_resi?: string;
  tanggal_kirim?: string;
  status_pengiriman?: string;
}

export interface Review {
  id_review?: number;
  id_customer: number;
  id_produk: number;
  rating: number;
  komentar?: string;
  tanggal_review?: string;
}

export interface ReviewJoined extends Review {
  nama_customer?: string;
  nama_produk?: string;
}

export interface AnalyticsSummary {
  revenueThisMonth: number;
  revenueStatus: string;
  ordersThisMonth: number;
  ordersStatus: string;
  customersThisMonth: number;
  customersStatus: string;
  revenueHistory: { label: string; value: number }[];
  topProducts: { name: string; category: string; sold: number; change: number; up: boolean }[];
}

export interface DbConfig {
  connected: boolean;
  type: "mysql" | "mock";
  host?: string;
  database?: string;
  error?: string;
}
