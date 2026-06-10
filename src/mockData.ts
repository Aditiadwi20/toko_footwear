import { Admin, Customer, Kategori, Produk, ReviewJoined, Pesanan, DetailPesanan, Pembayaran, Pengiriman } from "./types";

export const INITIAL_CATEGORIES: Kategori[] = [
  { id_kategori: 1, nama_kategori: "Sneakers Pria", deskripsi: "Sepatu kasual bertali untuk pria untuk harian maupun gaya hidup" },
  { id_kategori: 2, nama_kategori: "Sneakers Wanita", deskripsi: "Sepatu kasual bertali stylish dengan bobot ringan untuk wanita" },
  { id_kategori: 3, nama_kategori: "Sepatu Formal Pria", deskripsi: "Sepatu kulit Oxfords, Derby, dan Loafers premium untuk acara resmi" },
  { id_kategori: 4, nama_kategori: "Sepatu Formal Wanita", deskripsi: "Alas kaki kerja wanita profesional seperti heels dan flat shoes" },
  { id_kategori: 5, nama_kategori: "Sepatu Olahraga Pria", deskripsi: "Running shoes, basket, futsal dan training khusus pria" },
  { id_kategori: 7, nama_kategori: "Boots Pria", deskripsi: "Sepatu boots tangguh berbahan kulit asli dan suede berkualitas" },
  { id_kategori: 9, nama_kategori: "Sandal Kasual Pria", deskripsi: "Sandal slide, jepit, dan outdoor berkualitas untuk pria" },
  { id_kategori: 10, nama_kategori: "Sandal Kasual Wanita", deskripsi: "Sandal flat, wedges, dan slide santai wanita" },
  { id_kategori: 13, nama_kategori: "Slip-on Pria", deskripsi: "Sepatu santai kain kanvas tanpa tali praktis" },
  { id_kategori: 15, nama_kategori: "Flat Shoes", deskripsi: "Sepatu sol datar wanita nyaman untuk mobilitas harian" },
  { id_kategori: 16, nama_kategori: "High Heels", deskripsi: "Sepatu hak tinggi elegan untuk pesta dan acara formal" },
  { id_kategori: 19, nama_kategori: "Sepatu Hiking", deskripsi: "Alas kaki protektif outdoor khusus pendakian gunung" },
  { id_kategori: 22, nama_kategori: "Sandal Gunung Pria", deskripsi: "Sandal outdoor bertali pengikat kuat untuk medan kasar" },
  { id_kategori: 25, nama_kategori: "Chelsea Boots Pria", deskripsi: "Boots kulit elegan bersisi karet elastis tanpa tali" },
  { id_kategori: 31, nama_kategori: "Sepatu Futsal Indoor", deskripsi: "Sepatu bersol karet mentah/tanpa meninggalkan bekas lapangan" },
  { id_kategori: 32, nama_kategori: "Sepatu Basket High", deskripsi: "Sepatu basket berkerah tinggi pelindung engkel kaki" },
  { id_kategori: 38, nama_kategori: "Safety Shoes Baja", deskripsi: "Sepatu keselamatan kerja industri berpelindung besi baja" },
  { id_kategori: 46, nama_kategori: "Sepatu Skateboarding", deskripsi: "Sepatu olahraga skateboard bersol datar awet abis" }
];

export const INITIAL_ADMINS: Admin[] = [
  { id_admin: 1, nama_admin: "Budi Santoso", email: "budi.admin@footwear.com", password: "admin123" },
  { id_admin: 2, nama_admin: "Siti Aminah", email: "siti.admin@footwear.com", password: "admin123" },
  { id_admin: 3, nama_admin: "Andi Wijaya", email: "andi.admin@footwear.com", password: "admin123" }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  { id_customer: 1, nama_customer: "Demo User", email: "user@gmail.com", password: "pass123", no_hp: "081234567890", alamat: "Jl. Merdeka No. 10, Jakarta Pusat" },
  { id_customer: 2, nama_customer: "Amalia Putri", email: "amalia@gmail.com", password: "pass123", no_hp: "082134567891", alamat: "Jl. Dago No. 45, Bandung" },
  { id_customer: 3, nama_customer: "Aditya Pratama", email: "aditya@gmail.com", password: "pass123", no_hp: "083134567892", alamat: "Jl. Malioboro No. 12, Yogyakarta" },
  { id_customer: 4, nama_customer: "Nabila Syahpir", email: "nabila@gmail.com", password: "pass123", no_hp: "085234567893", alamat: "Jl. Tunjungan No. 88, Surabaya" },
  { id_customer: 5, nama_customer: "Dimas Setiawan", email: "dimas@gmail.com", password: "pass123", no_hp: "087734567894", alamat: "Jl. Pandanaran No. 5, Semarang" }
];

// Dynamically maps high-quality illustrative shoes for our database representation
export const IMAGE_MAP: Record<number, string> = {
  1: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=500&auto=format&fit=crop",
  2: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=500&auto=format&fit=crop",
  3: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=500&auto=format&fit=crop",
  4: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=500&auto=format&fit=crop",
  5: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=500&auto=format&fit=crop",
  6: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=500&auto=format&fit=crop",
  7: "https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=500&auto=format&fit=crop",
  8: "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?q=80&w=500&auto=format&fit=crop",
  9: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=500&auto=format&fit=crop",
  10: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=500&auto=format&fit=crop",
  11: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=500&auto=format&fit=crop",
  12: "https://images.unsplash.com/photo-1581101767113-1677fc2ebac8?q=80&w=500&auto=format&fit=crop",
  13: "https://images.unsplash.com/photo-1515647381225-407394718143?q=80&w=500&auto=format&fit=crop",
  14: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?q=80&w=500&auto=format&fit=crop",
  15: "https://images.unsplash.com/photo-1618677831708-0e7fda3148b4?q=80&w=500&auto=format&fit=crop",
  16: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?q=80&w=500&auto=format&fit=crop",
  17: "https://images.unsplash.com/photo-1510566337590-2fc1f21d0faa?q=80&w=500&auto=format&fit=crop",
  18: "https://images.unsplash.com/photo-1519766304817-4f37bda74a27?q=80&w=500&auto=format&fit=crop",
  19: "https://images.unsplash.com/photo-1605733513597-a8f8d410f286?q=80&w=500&auto=format&fit=crop",
  20: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=500&auto=format&fit=crop"
};

const DEFAULT_SHOE_IMAGE = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=500&auto=format&fit=crop";

export const INITIAL_PRODUCTS: Produk[] = [
  { id_produk: 1, id_kategori: 1, nama_produk: "Nusantara Minimalist Low", deskripsi_produk: "Sneakers kasual pria dengan desain modern kualitas premium.", harga: 450000.00, stok: 25, ukuran: "42,40,41,43", warna: "Hitam", gambar_produk: IMAGE_MAP[1] },
  { id_produk: 2, id_kategori: 3, nama_produk: "Heritage Classic Oxford", deskripsi_produk: "Sepatu kulit formal oxford pria dari kulit sapi asli.", harga: 750000.00, stok: 15, ukuran: "41,40,42,43", warna: "Cokelat Tua", gambar_produk: IMAGE_MAP[2] },
  { id_produk: 3, id_kategori: 15, nama_produk: "Amora Daily Flat Shoes", deskripsi_produk: "Flat shoes wanita yang sangat empuk untuk aktivitas kerja harian.", harga: 199000.00, stok: 40, ukuran: "38,37,39", warna: "Krem", gambar_produk: IMAGE_MAP[3] },
  { id_produk: 4, id_kategori: 5, nama_produk: "HyperDrive Running Shoes", deskripsi_produk: "Sepatu lari pria dengan bantalan udara peredam hentakan.", harga: 599000.00, stok: 20, ukuran: "43,41,42,44", warna: "Biru Neon", gambar_produk: IMAGE_MAP[4] },
  { id_produk: 5, id_kategori: 7, nama_produk: "Urban Ranger Suede Boots", deskripsi_produk: "Sepatu boots pria berbahan suede elegan bergaya street style.", harga: 680000.00, stok: 12, ukuran: "42,41,43", warna: "Tan", gambar_produk: IMAGE_MAP[5] },
  { id_produk: 6, id_kategori: 2, nama_produk: "Zura Aesthetic Sneakers", deskripsi_produk: "Sneakers wanita sol tebal dengan desain modern dan feminim.", harga: 389000.00, stok: 30, ukuran: "37,38,39", warna: "Putih-Pink", gambar_produk: IMAGE_MAP[6] },
  { id_produk: 7, id_kategori: 9, nama_produk: "Ventura Slide Sandal", deskripsi_produk: "Sandal slide pria praktis bersol empuk anti licin.", harga: 125000.00, stok: 50, ukuran: "40,41,42", warna: "Abu-abu", gambar_produk: IMAGE_MAP[7] },
  { id_produk: 8, id_kategori: 16, nama_produk: "Empress Stiletto High Heels", deskripsi_produk: "Sepatu hak tinggi wanita setinggi 9cm untuk pesta formal.", harga: 450000.00, stok: 18, ukuran: "36,37,38", warna: "Merah Marun", gambar_produk: IMAGE_MAP[8] },
  { id_produk: 9, id_kategori: 19, nama_produk: "Apex Geo Hiking Boots", deskripsi_produk: "Sepatu gunung tahan air dengan cengkeraman sol luar biasa.", harga: 890000.00, stok: 10, ukuran: "42,41,43,44", warna: "Hijau Army", gambar_produk: IMAGE_MAP[9] },
  { id_produk: 10, id_kategori: 13, nama_produk: "EasyWalk Canvas Slip-on", deskripsi_produk: "Sepatu slip-on kanvas santai yang sangat praktis digunakan.", harga: 175000.00, stok: 35, ukuran: "41,40,42", warna: "Navy", gambar_produk: IMAGE_MAP[10] },
  { id_produk: 11, id_kategori: 4, nama_produk: "Priscilla Office Loafers", deskripsi_produk: "Sepatu kerja kantoran wanita berdesain smart-elegant.", harga: 289000.00, stok: 22, ukuran: "39,38,40", warna: "Hitam Glossy", gambar_produk: IMAGE_MAP[11] },
  { id_produk: 12, id_kategori: 10, nama_produk: "Savitri Wedges Sandal", deskripsi_produk: "Sandal wedges wanita berdesain rajutan tradisional modern.", harga: 245000.00, stok: 28, ukuran: "38,37,39", warna: "Cokelat Muda", gambar_produk: IMAGE_MAP[12] },
  { id_produk: 13, id_kategori: 20, nama_produk: "Kids Active Spider-Sneakers", deskripsi_produk: "Sepatu anak laki-laki bertema pahlawan super anti slip.", harga: 185000.00, stok: 45, ukuran: "31,30,32", warna: "Merah-Biru", gambar_produk: IMAGE_MAP[13] },
  { id_produk: 14, id_kategori: 21, nama_produk: "Barbie Glow Flat Shoes Kids", deskripsi_produk: "Sepatu flat anak perempuan dengan hiasan glitter berkilau.", harga: 165000.00, stok: 50, ukuran: "29,28,30", warna: "Merah Muda", gambar_produk: IMAGE_MAP[14] },
  { id_produk: 15, id_kategori: 22, nama_produk: "Creek Master Sandal Gunung", deskripsi_produk: "Sandal gunung tangguh untuk petualangan alam bebas.", harga: 150000.00, stok: 60, ukuran: "41,40,42", warna: "Hitam Hijau", gambar_produk: IMAGE_MAP[15] },
  { id_produk: 16, id_kategori: 25, nama_produk: "Windsor Chelsea Boots Leather", deskripsi_produk: "Chelsea boots berbahan kulit premium berkelas mewah.", harga: 950000.00, stok: 8, ukuran: "42,41,43", warna: "Hitam", gambar_produk: IMAGE_MAP[16] },
  { id_produk: 17, id_kategori: 31, nama_produk: "Striker Futsal Pro", deskripsi_produk: "Sepatu futsal indoor dengan kontrol bola maksimal.", harga: 350000.00, stok: 25, ukuran: "40,39,41,42", warna: "Putih Emas", gambar_produk: IMAGE_MAP[17] },
  { id_produk: 18, id_kategori: 32, nama_produk: "SkyHook High Basket Shoes", deskripsi_produk: "Sepatu basket berkerah tinggi peredam cidera engkel.", harga: 720000.00, stok: 14, ukuran: "44,42,43,45", warna: "Merah Hitam", gambar_produk: IMAGE_MAP[18] },
  { id_produk: 19, id_kategori: 38, nama_produk: "IronClad Safety Steel Shoes", deskripsi_produk: "Sepatu pelindung kerja proyek ujung besi standard SNI.", harga: 420000.00, stok: 30, ukuran: "42,41,43", warna: "Hitam", gambar_produk: IMAGE_MAP[19] },
  { id_produk: 20, id_kategori: 46, nama_produk: "SkateMaster Pro Series", deskripsi_produk: "Sepatu olahraga skateboard bersol datar awet abis.", harga: 399000.00, stok: 20, ukuran: "41,40,42", warna: "Hitam Putih", gambar_produk: IMAGE_MAP[20] }
];

// Seed to reach a full 50 products if required, dynamically
for (let i = 21; i <= 50; i++) {
  const categories = [1, 2, 3, 4, 5, 7, 9, 10, 13, 15, 16, 19, 22, 25, 31, 38, 46];
  const cat = categories[i % categories.length];
  const names = [
    "Alpha Tech Sport Sneakers", "Monk Strap Royal Edition", "Cozy Step Loafers Flat",
    "Marathoner Carbon Plate Shoes", "Texas Maverick Cowboy Boots", "Nova Futuristic Dad Shoes",
    "ArchSupport Orthotic Sandal", "Ginderella Crystal Heels", "TrailBlazer Low Hiking Shoes",
    "Denim Casual Slip-on", "Amara Ballet Flats", "Modern Casual Loafers",
    "Pro Skate Edition", "Premium Suede Classic", "Garuda Running Elite", "Srikandi Court Shoes"
  ];
  const name = names[i % names.length] + " v" + (Math.floor(i / 10) + 1);
  const price = 120000 + (i * 13500) % 800000;
  const colors = ["Hitam", "Putih", "Abu-Abu", "Cokelat", "Biru Navy", "Tan", "Burgundy"];
  const sizes = cat === 2 || cat === 4 || cat === 10 || cat === 15 || cat === 16 ? "36,37,38,39" : "39,40,41,42,43";

  INITIAL_PRODUCTS.push({
    id_produk: i,
    id_kategori: cat,
    nama_produk: name,
    deskripsi_produk: `Koleksi alas kaki premium model ${name} dengan jahitan kuat, presisi, serta material pilihan terbaik.`,
    harga: price,
    stok: 10 + (i * 3) % 40,
    ukuran: sizes,
    warna: colors[i % colors.length],
    gambar_produk: IMAGE_MAP[i % 20 + 1] || DEFAULT_SHOE_IMAGE
  });
}

export const INITIAL_REVIEWS: ReviewJoined[] = [
  { id_review: 1, id_customer: 1, id_produk: 1, rating: 5, komentar: "Sepatunya nyaman sekali dipakai jalan jauh, kualitas premium mantap!", nama_customer: "Demo User", nama_produk: "Nusantara Minimalist Low", tanggal_review: "2026-05-05 10:00:00" },
  { id_review: 2, id_customer: 2, id_produk: 3, rating: 4, komentar: "Bahan lembut dan empuk buat kerja kantoran harian, makasih.", nama_customer: "Amalia Putri", nama_produk: "Amora Daily Flat Shoes", tanggal_review: "2026-05-05 12:45:00" },
  { id_review: 3, id_customer: 3, id_produk: 2, rating: 5, komentar: "Kulit sapinya asli berkualitas tinggi, jahitan rapi pengerjaan rapi.", nama_customer: "Aditya Pratama", nama_produk: "Heritage Classic Oxford", tanggal_review: "2026-05-06 09:20:00" },
  { id_review: 4, id_customer: 4, id_produk: 4, rating: 4, komentar: "Sangat ringan buat jogging pagi, empuk bantalannya.", nama_customer: "Nabila Syahpir", nama_produk: "HyperDrive Running Shoes", tanggal_review: "2026-05-06 16:30:00" },
  { id_review: 5, id_customer: 5, id_produk: 5, rating: 5, komentar: "Bahan suedenya halus, model keren abis mirip brand luar negeri.", nama_customer: "Dimas Setiawan", nama_produk: "Urban Ranger Suede Boots", tanggal_review: "2026-05-07 11:12:00" }
];

export const INITIAL_PESANAN: Pesanan[] = [
  { id_pesanan: 1, id_customer: 1, tanggal_pesanan: "2026-05-02 10:00:00", total_harga: 450000.00, status_pesanan: "Selesai", alamat_pengiriman: "Jl. Merdeka No. 10, Jakarta Pusat" },
  { id_pesanan: 2, id_customer: 2, tanggal_pesanan: "2026-05-02 11:30:00", total_harga: 398000.00, status_pesanan: "Selesai", alamat_pengiriman: "Jl. Dago No. 45, Bandung" },
  { id_pesanan: 3, id_customer: 3, tanggal_pesanan: "2026-05-03 09:15:00", total_harga: 750000.00, status_pesanan: "Selesai", alamat_pengiriman: "Jl. Malioboro No. 12, Yogyakarta" },
  { id_pesanan: 4, id_customer: 4, tanggal_pesanan: "2026-05-03 14:20:00", total_harga: 599000.00, status_pesanan: "Selesai", alamat_pengiriman: "Jl. Tunjungan No. 88, Surabaya" },
  { id_pesanan: 5, id_customer: 5, tanggal_pesanan: "2026-05-04 16:45:00", total_harga: 680000.00, status_pesanan: "Selesai", alamat_pengiriman: "Jl. Pandanaran No. 5, Semarang" }
];

export const INITIAL_DETAIL_PESANAN: DetailPesanan[] = [
  { id_detail_pesanan: 1, id_produk: 1, id_pesanan: 1, jumlah: 1, harga_satuan: 450000.00, subtotal: 450000.00 },
  { id_detail_pesanan: 2, id_produk: 3, id_pesanan: 2, jumlah: 2, harga_satuan: 199000.00, subtotal: 398000.00 },
  { id_detail_pesanan: 3, id_produk: 2, id_pesanan: 3, jumlah: 1, harga_satuan: 750000.00, subtotal: 750000.00 },
  { id_detail_pesanan: 4, id_produk: 4, id_pesanan: 4, jumlah: 1, harga_satuan: 599000.00, subtotal: 599000.00 },
  { id_detail_pesanan: 5, id_produk: 5, id_pesanan: 5, jumlah: 1, harga_satuan: 680000.00, subtotal: 680000.00 }
];

export const INITIAL_PEMBAYARAN: Pembayaran[] = [
  { id_pembayaran: 1, id_pesanan: 1, metode_pembayaran: "Transfer Bank BCA", tanggal_pembayaran: "2026-05-02 10:05:00", status_pembayaran: "Lunas" },
  { id_pembayaran: 2, id_pesanan: 2, metode_pembayaran: "GoPay", tanggal_pembayaran: "2026-05-02 11:32:00", status_pembayaran: "Lunas" },
  { id_pembayaran: 3, id_pesanan: 3, metode_pembayaran: "Transfer Bank Mandiri", tanggal_pembayaran: "2026-05-03 09:20:00", status_pembayaran: "Lunas" },
  { id_pembayaran: 4, id_pesanan: 4, metode_pembayaran: "OVO", tanggal_pembayaran: "2026-05-03 14:22:00", status_pembayaran: "Lunas" },
  { id_pembayaran: 5, id_pesanan: 5, metode_pembayaran: "Transfer Bank BRI", tanggal_pembayaran: "2026-05-04 16:50:00", status_pembayaran: "Lunas" }
];

export const INITIAL_PENGIRIMAN: Pengiriman[] = [
  { id_pengiriman: 1, id_admin: 1, id_pesanan: 1, jasa_kirim: "JNE Regular", nomor_resi: "JNE001928374", tanggal_kirim: "2026-05-03 09:00:00", status_pengiriman: "Selesai" },
  { id_pengiriman: 2, id_admin: 2, id_pesanan: 2, jasa_kirim: "J&T Express", nomor_resi: "JNT882736452", tanggal_kirim: "2026-05-03 10:30:00", status_pengiriman: "Selesai" },
  { id_pengiriman: 3, id_admin: 3, id_pesanan: 3, jasa_kirim: "SiCepat Reg", nomor_resi: "SI992039485", tanggal_kirim: "2026-05-04 14:00:00", status_pengiriman: "Selesai" }
];
