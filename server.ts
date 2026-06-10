import express from "express";
import path from "path";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

// Load initial seeding data for mock fallback
import {
  INITIAL_CATEGORIES,
  INITIAL_ADMINS,
  INITIAL_CUSTOMERS,
  INITIAL_PRODUCTS,
  INITIAL_REVIEWS,
  INITIAL_PESANAN,
  INITIAL_DETAIL_PESANAN,
  INITIAL_PEMBAYARAN,
  INITIAL_PENGIRIMAN
} from "./src/mockData";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// In-Memory state fallback datasets in case MySQL is offline or disabled
let mockCategories = [...INITIAL_CATEGORIES];
let mockAdmins = [...INITIAL_ADMINS];
let mockCustomers = [...INITIAL_CUSTOMERS];
let mockProducts = [...INITIAL_PRODUCTS];
let mockReviews = [...INITIAL_REVIEWS];
let mockOrders = [...INITIAL_PESANAN];
let mockOrderDetails = [...INITIAL_DETAIL_PESANAN];
let mockPayments = [...INITIAL_PEMBAYARAN];
let mockShipments = [...INITIAL_PENGIRIMAN];

// Database configuration state
let pool: mysql.Pool | null = null;
let dbConfig = {
  connected: false,
  type: "mock",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "db_tokofootwear",
  error: ""
};

// Lazy initialize MySQL Connection Pool
async function getDbConnection() {
  const useExternal = process.env.DB_USE_EXTERNAL === "true";
  
  if (!useExternal) {
    dbConfig.connected = false;
    dbConfig.type = "mock";
    dbConfig.error = "External DB is disabled in config (DB_USE_EXTERNAL is not 'true')";
    return null;
  }

  if (pool) return pool;

  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "db_tokofootwear",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test connection
    const conn = await pool.getConnection();

    // Auto-adjust column to support Base64 file uploads if column is cramped
    try {
      await conn.execute("ALTER TABLE produk MODIFY COLUMN gambar_produk LONGTEXT");
      console.log("Database Adjustment: Modified produk.gambar_produk to LONGTEXT to support Base64 photo uploads.");
    } catch (alterErr: any) {
      // Silently ignore if table doesn't exist yet or if there are no permissions
      console.warn("Proceeding without altering schema:", alterErr.message);
    }

    conn.release();

    dbConfig.connected = true;
    dbConfig.type = "mysql";
    dbConfig.error = "";
    console.log(`Successfully connected to external MySQL: ${dbConfig.host}`);
    return pool;
  } catch (err: any) {
    dbConfig.connected = false;
    dbConfig.type = "mock";
    dbConfig.error = err.message || "Failed to establish MySQL connection pool";
    console.warn(`MySQL connection failed. Falling back to built-in datasets. Reason: ${dbConfig.error}`);
    pool = null;
    return null;
  }
}

// Ensure first test on load
getDbConnection().catch(() => {});

// ── API ROUTES ──

// 1. Get Database Status
app.get("/api/db-status", async (req, res) => {
  await getDbConnection(); // Refresh check
  res.json(dbConfig);
});

// 2. Auth: Customer & Admin Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: "Email dan kata sandi wajib diisi" });
  }

  const db = await getDbConnection();

  if (db) {
    try {
      // First try to authenticate as Admin
      const [adminEmailRows]: any = await db.execute("SELECT * FROM admin WHERE email = ?", [email]);
      if (adminEmailRows.length > 0) {
        const admin = adminEmailRows[0];
        if (admin.password === password) {
          return res.json({ success: true, role: "admin", user: { id: admin.id_admin, name: admin.nama_admin, email: admin.email } });
        } else {
          return res.status(401).json({ error: "Password Anda salah" });
        }
      }

      // Next try to authenticate as Customer
      const [customerEmailRows]: any = await db.execute("SELECT * FROM customer WHERE email = ?", [email]);
      if (customerEmailRows.length > 0) {
        const cust = customerEmailRows[0];
        if (cust.password === password) {
          return res.json({ success: true, role: "customer", user: { id: cust.id_customer, name: cust.nama_customer, email: cust.email, no_hp: cust.no_hp, alamat: cust.alamat } });
        } else {
          return res.status(401).json({ error: "Password Anda salah" });
        }
      }

      return res.status(401).json({ error: "Email tidak terdaftar dalam database kami" });
    } catch (err: any) {
      return res.status(500).json({ error: "Terjadi kesalahan database: " + err.message });
    }
  } else {
    // Mock Mode
    // Check Admin Email
    const adminByEmail = mockAdmins.find(a => a.email === email);
    if (adminByEmail) {
      if (adminByEmail.password === password) {
        return res.json({ success: true, role: "admin", user: { id: adminByEmail.id_admin, name: adminByEmail.nama_admin, email: adminByEmail.email } });
      } else {
        return res.status(401).json({ error: "Password Anda salah" });
      }
    }

    // Check Customer Email
    const custByEmail = mockCustomers.find(c => c.email === email);
    if (custByEmail) {
      if (custByEmail.password === password) {
        return res.json({ success: true, role: "customer", user: { id: custByEmail.id_customer, name: custByEmail.nama_customer, email: custByEmail.email, no_hp: custByEmail.no_hp, alamat: custByEmail.alamat } });
      } else {
        return res.status(401).json({ error: "Password Anda salah" });
      }
    }

    return res.status(401).json({ error: "Email tidak terdaftar dalam database kami" });
  }
});

// 3. Auth: Customer Registration
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, no_hp, alamat } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Nama, email, dan password wajib diisi" });
  }

  const db = await getDbConnection();

  if (db) {
    try {
      // Check duplicate
      const [existing]: any = await db.execute("SELECT id_customer FROM customer WHERE email = ?", [email]);
      if (existing.length > 0) {
        return res.status(400).json({ error: "Email sudah terdaftar" });
      }

      const [resIns]: any = await db.execute(
        "INSERT INTO customer (nama_customer, email, password, no_hp, alamat) VALUES (?, ?, ?, ?, ?)",
        [name, email, password, no_hp || "", alamat || ""]
      );

      return res.json({
        success: true,
        user: { id: resIns.insertId, name, email, no_hp: no_hp || "", alamat: alamat || "" }
      });
    } catch (err: any) {
      return res.status(500).json({ error: "Kesalahan database: " + err.message });
    }
  } else {
    // Mock Register
    const duplicate = mockCustomers.find(c => c.email === email);
    if (duplicate) {
      return res.status(400).json({ error: "Email sudah terdaftar di Database Latihan" });
    }
    const newId = mockCustomers.length > 0 ? Math.max(...mockCustomers.map(c => c.id_customer || 0)) + 1 : 1;
    const newCust = { id_customer: newId, nama_customer: name, email, password, no_hp, alamat };
    mockCustomers.push(newCust);
    return res.json({ success: true, user: { id: newId, name, email, no_hp, alamat } });
  }
});

// 4. Categories: List
app.get("/api/categories", async (req, res) => {
  const db = await getDbConnection();
  if (db) {
    try {
      const [rows] = await db.execute("SELECT * FROM kategori ORDER BY nama_kategori ASC");
      return res.json(rows);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
  res.json(mockCategories);
});

// 5. Products: List (with filters & matching columns)
app.get("/api/products", async (req, res) => {
  const { category, size, query, sort } = req.query;
  const db = await getDbConnection();

  if (db) {
    try {
      let sql = `
        SELECT p.*, k.nama_kategori,
               COALESCE((SELECT AVG(rating) FROM review WHERE id_produk = p.id_produk), 4.8) as rating_rata,
               COALESCE((SELECT COUNT(*) FROM review WHERE id_produk = p.id_produk), 12) as jumlah_ulasan
        FROM produk p
        LEFT JOIN kategori k ON p.id_kategori = k.id_kategori
        WHERE 1=1
      `;
      const params: any[] = [];

      if (category && category !== "all") {
        sql += " AND k.nama_kategori LIKE ?";
        params.push(`%${category}%`);
      }

      if (size) {
        sql += " AND FIND_IN_SET(?, p.ukuran) OR p.ukuran LIKE ?";
        params.push(size, `%${size}%`);
      }

      if (query) {
        sql += " AND (p.nama_produk LIKE ? OR p.deskripsi_produk LIKE ?)";
        params.push(`%${query}%`, `%${query}%`);
      }

      if (sort === "price_asc") {
        sql += " ORDER BY p.harga ASC";
      } else if (sort === "price_desc") {
        sql += " ORDER BY p.harga DESC";
      } else {
        sql += " ORDER BY p.id_produk DESC";
      }

      const [rows] = await db.execute(sql, params);
      return res.json(rows);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    // Process Local In-Memory Filters
    let list = mockProducts.map(p => {
      const catObj = mockCategories.find(c => c.id_kategori === p.id_kategori);
      const prodReviews = mockReviews.filter(r => r.id_produk === p.id_produk);
      const rating = prodReviews.length > 0 
        ? prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length 
        : 4.8;
      return {
        ...p,
        nama_kategori: catObj ? catObj.nama_kategori : "Footwear",
        rating_rata: rating,
        jumlah_ulasan: prodReviews.length || 15
      };
    });

    if (category && category !== "all") {
      list = list.filter(p => p.nama_kategori.toLowerCase().includes(String(category).toLowerCase()));
    }

    if (size) {
      list = list.filter(p => p.ukuran?.split(",").map(s => s.trim()).includes(String(size)));
    }

    if (query) {
      const q = String(query).toLowerCase();
      list = list.filter(p => p.nama_produk.toLowerCase().includes(q) || p.deskripsi_produk?.toLowerCase().includes(q));
    }

    if (sort === "price_asc") {
      list.sort((a, b) => a.harga - b.harga);
    } else if (sort === "price_desc") {
      list.sort((a, b) => b.harga - a.harga);
    } else {
      list.sort((a, b) => (b.id_produk || 0) - (a.id_produk || 0));
    }

    res.json(list);
  }
});

// 6. Products: Single Item Detail
app.get("/api/products/:id", async (req, res) => {
  const prodId = Number(req.params.id);
  const db = await getDbConnection();

  if (db) {
    try {
      const sql = `
        SELECT p.*, k.nama_kategori,
               COALESCE((SELECT AVG(rating) FROM review WHERE id_produk = p.id_produk), 4.8) as rating_rata,
               COALESCE((SELECT COUNT(*) FROM review WHERE id_produk = p.id_produk), 12) as jumlah_ulasan
        FROM produk p
        LEFT JOIN kategori k ON p.id_kategori = k.id_kategori
        WHERE p.id_produk = ?
      `;
      const [rows]: any = await db.execute(sql, [prodId]);
      if (rows.length > 0) {
        return res.json(rows[0]);
      }
      return res.status(404).json({ error: "Produk tidak ditemukan" });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    const prod = mockProducts.find(p => p.id_produk === prodId);
    if (prod) {
      const catObj = mockCategories.find(c => c.id_kategori === prod.id_kategori);
      const prodReviews = mockReviews.filter(r => r.id_produk === prodId);
      const rating = prodReviews.length > 0 
        ? prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length 
        : 4.8;
      
      return res.json({
        ...prod,
        nama_kategori: catObj ? catObj.nama_kategori : "Footwear",
        rating_rata: rating,
        jumlah_ulasan: prodReviews.length || 15
      });
    }
    res.status(404).json({ error: "Produk tidak ditemukan di Database Latihan" });
  }
});

// 7. Products: Add (Admin feature)
app.post("/api/products", async (req, res) => {
  const { id_kategori, nama_produk, deskripsi_produk, harga, stok, ukuran, warna, gambar_produk } = req.body;

  if (!id_kategori || !nama_produk || !harga) {
    return res.status(400).json({ error: "Kategori, nama produk, dan harga wajib diisi" });
  }

  const db = await getDbConnection();

  if (db) {
    try {
      const [resIns]: any = await db.execute(
        "INSERT INTO produk (id_kategori, nama_produk, deskripsi_produk, harga, stok, ukuran, warna, gambar_produk) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          id_kategori,
          nama_produk,
          deskripsi_produk || "",
          harga,
          stok || 0,
          ukuran || "39,40,41,42,43",
          warna || "",
          gambar_produk || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=500&auto=format&fit=crop"
        ]
      );
      return res.json({ success: true, id_produk: resIns.insertId });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    const newId = mockProducts.length > 0 ? Math.max(...mockProducts.map(p => p.id_produk || 0)) + 1 : 1;
    const newProd = {
      id_produk: newId,
      id_kategori: Number(id_kategori),
      nama_produk,
      deskripsi_produk,
      harga: Number(harga),
      stok: Number(stok || 0),
      ukuran: ukuran || "39,40,41,42,43",
      warna,
      gambar_produk: gambar_produk || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=500&auto=format&fit=crop"
    };
    mockProducts.unshift(newProd);
    res.json({ success: true, id_produk: newId });
  }
});

// Products: Update / Edit (Admin feature)
app.put("/api/products/:id", async (req, res) => {
  const prodId = Number(req.params.id);
  const { id_kategori, nama_produk, deskripsi_produk, harga, stok, ukuran, warna, gambar_produk } = req.body;

  if (!id_kategori || !nama_produk || !harga) {
    return res.status(400).json({ error: "Kategori, nama produk, dan harga wajib diisi" });
  }

  const db = await getDbConnection();

  if (db) {
    try {
      await db.execute(
        "UPDATE produk SET id_kategori = ?, nama_produk = ?, deskripsi_produk = ?, harga = ?, stok = ?, ukuran = ?, warna = ?, gambar_produk = ? WHERE id_produk = ?",
        [
          Number(id_kategori),
          nama_produk,
          deskripsi_produk || "",
          Number(harga),
          Number(stok || 0),
          ukuran || "39,40,41,42,43",
          warna || "",
          gambar_produk || "",
          prodId
        ]
      );
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    const idx = mockProducts.findIndex(p => p.id_produk === prodId);
    if (idx !== -1) {
      mockProducts[idx] = {
        ...mockProducts[idx],
        id_kategori: Number(id_kategori),
        nama_produk,
        deskripsi_produk,
        harga: Number(harga),
        stok: Number(stok || 0),
        ukuran: ukuran || "39,40,41,42,43",
        warna,
        gambar_produk: gambar_produk || mockProducts[idx].gambar_produk
      };
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Produk tidak ditemukan" });
    }
  }
});

// 8. Products: Delete
app.delete("/api/products/:id", async (req, res) => {
  const prodId = Number(req.params.id);
  const db = await getDbConnection();

  if (db) {
    try {
      await db.execute("DELETE FROM produk WHERE id_produk = ?", [prodId]);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  } else {
    mockProducts = mockProducts.filter(p => p.id_produk !== prodId);
    res.json({ success: true });
  }
});

// 9. Customer: List (Admin dashboard overview)
app.get("/api/customers", async (req, res) => {
  const db = await getDbConnection();
  if (db) {
    try {
      const [rows]: any = await db.execute(`
        SELECT c.*, 
               COALESCE((SELECT SUM(total_harga) FROM pesanan WHERE id_customer = c.id_customer), 0) as total_transaksi
        FROM customer c
        ORDER BY c.id_customer DESC
      `);
      return res.json(rows);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
  // Fallback
  const list = mockCustomers.map(c => {
    const total = mockOrders
      .filter(o => o.id_customer === c.id_customer)
      .reduce((sum, o) => sum + o.total_harga, 0);
    return { ...c, total_transaksi: total };
  });
  res.json(list);
});

// 10. Reviews: List joined with customers and products
app.get("/api/reviews", async (req, res) => {
  const db = await getDbConnection();
  if (db) {
    try {
      const [rows] = await db.execute(`
        SELECT r.*, c.nama_customer, p.nama_produk
        FROM review r
        LEFT JOIN customer c ON r.id_customer = c.id_customer
        LEFT JOIN produk p ON r.id_produk = p.id_produk
        ORDER BY r.id_review DESC
      `);
      return res.json(rows);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
  res.json(mockReviews);
});

// 11. Reviews: Add
app.post("/api/reviews", async (req, res) => {
  const { id_customer, id_produk, rating, komentar } = req.body;

  if (!id_customer || !id_produk || !rating) {
    return res.status(400).json({ error: "Customer, produk, dan rating wajib ada" });
  }

  const db = await getDbConnection();
  const dateStr = new Date().toISOString().slice(0, 19).replace("T", " ");

  if (db) {
    try {
      // Check if user has bought this product
      const [orderCheckRows]: any = await db.execute(`
        SELECT 1 
        FROM pesanan o
        JOIN detail_pesanan d ON o.id_pesanan = d.id_pesanan
        WHERE o.id_customer = ? AND d.id_produk = ?
        LIMIT 1
      `, [id_customer, id_produk]);

      if (orderCheckRows.length === 0) {
        return res.status(403).json({ error: "Ulasan hanya diperbolehkan untuk produk yang pernah Anda beli" });
      }

      const [resIns]: any = await db.execute(
        "INSERT INTO review (id_customer, id_produk, rating, komentar, tanggal_review) VALUES (?, ?, ?, ?, ?)",
        [id_customer, id_produk, rating, komentar || "", dateStr]
      );
      return res.json({ success: true, id_review: resIns.insertId });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    // Local memory check
    const hasBought = mockOrders.some(o => {
      if (o.id_customer !== Number(id_customer)) return false;
      const details = mockOrderDetails.filter(d => d.id_pesanan === o.id_pesanan);
      return details.some(d => d.id_produk === Number(id_produk));
    });

    if (!hasBought) {
      return res.status(403).json({ error: "Ulasan hanya diperbolehkan untuk produk yang pernah Anda beli" });
    }

    const newId = mockReviews.length > 0 ? Math.max(...mockReviews.map(r => r.id_review || 0)) + 1 : 1;
    const cust = mockCustomers.find(c => c.id_customer === id_customer);
    const prod = mockProducts.find(p => p.id_produk === id_produk);

    mockReviews.unshift({
      id_review: newId,
      id_customer,
      id_produk,
      rating,
      komentar,
      tanggal_review: dateStr,
      nama_customer: cust ? cust.nama_customer : "Pelanggan Setia",
      nama_produk: prod ? prod.nama_produk : "Sneakers Premium"
    });
    res.json({ success: true, id_review: newId });
  }
});

// 12. Create Order (Checkout flow)
app.post("/api/orders", async (req, res) => {
  const { id_customer, items, courier_name, payment_method, alamat_pengiriman } = req.body;

  if (!id_customer || !items || !items.length || !alamat_pengiriman) {
    return res.status(400).json({ error: "Keranjang belanja atau alamat pengiriman tidak boleh kosong" });
  }

  const db = await getDbConnection();
  const dateStr = new Date().toISOString().slice(0, 19).replace("T", " ");

  // Validate prices & quantities to sum subtotal
  let total_harga = 0;
  const hydratedItems = items.map((item: any) => {
    const price = Number(item.price);
    const qty = Number(item.qty);
    const subtotal = price * qty;
    total_harga += subtotal;
    return { ...item, subtotal };
  });

  const total_tagihan = total_harga + 15000; // adding courier cost standard Rp 15.000

  if (db) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Insert into pesanan
      const [resOrder]: any = await connection.execute(
        "INSERT INTO pesanan (id_customer, tanggal_pesanan, total_harga, status_pesanan, alamat_pengiriman) VALUES (?, ?, ?, ?, ?)",
        [id_customer, dateStr, total_tagihan, "Diproses", AlamatClean(alamat_pengiriman)]
      );
      const id_pesanan = resOrder.insertId;

      // 2. Insert into detail_pesanan
      for (const item of hydratedItems) {
        await connection.execute(
          "INSERT INTO detail_pesanan (id_produk, id_pesanan, jumlah, harga_satuan, subtotal) VALUES (?, ?, ?, ?, ?)",
          [item.id_produk, id_pesanan, item.qty, item.price, item.subtotal]
        );
        // Deduct stock
        await connection.execute(
          "UPDATE produk SET stok = GREATEST(stok - ?, 0) WHERE id_produk = ?",
          [item.qty, item.id_produk]
        );
      }

      // 3. Insert into pembayaran
      await connection.execute(
        "INSERT INTO pembayaran (id_pesanan, metode_pembayaran, tanggal_pembayaran, status_pembayaran) VALUES (?, ?, ?, ?)",
        [id_pesanan, payment_method || "Virtual Account", dateStr, "Lunas"]
      );

      // 4. Insert into pengiriman (id_admin = 1 by default, or random from pool)
      await connection.execute(
        "INSERT INTO pengiriman (id_admin, id_pesanan, jasa_kirim, nomor_resi, tanggal_kirim, status_pengiriman) VALUES (?, ?, ?, ?, ?, ?)",
        [1, id_pesanan, courier_name || "SiCepat REG", generateResi(), dateStr, "Diproses"]
      );

      await connection.commit();
      return res.json({ success: true, id_pesanan });
    } catch (err: any) {
      await connection.rollback();
      return res.status(500).json({ error: "Gagal membuat pesanan di MySQL: " + err.message });
    } finally {
      connection.release();
    }
  } else {
    // InMemory Seeding transaction simulate
    const id_pesanan = mockOrders.length > 0 ? Math.max(...mockOrders.map(o => o.id_pesanan || 0)) + 1 : 1;
    
    // 1. Pesanan
    mockOrders.unshift({
      id_pesanan,
      id_customer,
      tanggal_pesanan: dateStr,
      total_harga: total_tagihan,
      status_pesanan: "Diproses",
      alamat_pengiriman: AlamatClean(alamat_pengiriman)
    });

    // 2. Detail
    hydratedItems.forEach((item: any, idx: number) => {
      mockOrderDetails.push({
        id_detail_pesanan: mockOrderDetails.length + idx + 1,
        id_produk: item.id_produk,
        id_pesanan,
        jumlah: item.qty,
        harga_satuan: item.price,
        subtotal: item.subtotal
      });
      // Deduct stock in-memory
      const p = mockProducts.find(prod => prod.id_produk === item.id_produk);
      if (p) {
        p.stok = Math.max(0, p.stok - item.qty);
      }
    });

    // 3. Pembayaran
    mockPayments.push({
      id_pembayaran: mockPayments.length + 1,
      id_pesanan,
      metode_pembayaran: payment_method || "QRIS Pay",
      tanggal_pembayaran: dateStr,
      status_pembayaran: "Lunas"
    });

    // 4. Pengiriman
    mockShipments.push({
      id_pengiriman: mockShipments.length + 1,
      id_admin: 1,
      id_pesanan,
      jasa_kirim: courier_name || "SiCepat REG",
      nomor_resi: generateResi(),
      tanggal_kirim: dateStr,
      status_pengiriman: "Diproses"
    });

    res.json({ success: true, id_pesanan, order: mockOrders[0] });
  }
});

// Helper utilities for clean input
function AlamatClean(addrObj: any): string {
  if (typeof addrObj === "string") return addrObj;
  return `Jl. ${addrObj.nama || "Jend. Sudirman"}, No. ${addrObj.no || "21"}, ${addrObj.kota || "Jakarta"}`;
}
function generateResi(): string {
  return "LL-" + Math.floor(1000000000 + Math.random() * 9000000000);
}

// 12.5 Check if product is purchased by customer
app.get("/api/orders/check-purchase", async (req, res) => {
  const { customerId, productId } = req.query;
  if (!customerId || !productId) {
    return res.json({ purchased: false });
  }

  const db = await getDbConnection();
  if (db) {
    try {
      const [rows]: any = await db.execute(`
        SELECT 1 
        FROM pesanan o
        JOIN detail_pesanan d ON o.id_pesanan = d.id_pesanan
        WHERE o.id_customer = ? AND d.id_produk = ?
        LIMIT 1
      `, [customerId, productId]);
      return res.json({ purchased: rows.length > 0 });
    } catch {
      return res.json({ purchased: false });
    }
  } else {
    const bought = mockOrders.some(o => {
      if (o.id_customer !== Number(customerId)) return false;
      const details = mockOrderDetails.filter(d => d.id_pesanan === o.id_pesanan);
      return details.some(d => d.id_produk === Number(productId));
    });
    return res.json({ purchased: bought });
  }
});

// 13. Orders: Get detailed dashboard or client order lists
app.get("/api/orders", async (req, res) => {
  const { customerId } = req.query;
  const db = await getDbConnection();

  if (db) {
    try {
      let sql = `
        SELECT o.*, c.nama_customer, c.email, p.metode_pembayaran, p.status_pembayaran, s.jasa_kirim, s.nomor_resi, s.status_pengiriman
        FROM pesanan o
        LEFT JOIN customer c ON o.id_customer = c.id_customer
        LEFT JOIN pembayaran p ON o.id_pesanan = p.id_pesanan
        LEFT JOIN pengiriman s ON o.id_pesanan = s.id_pesanan
      `;

      if (customerId) {
        sql += " WHERE o.id_customer = ?";
      }
      sql += " ORDER BY o.id_pesanan DESC";

      const [rows] = await db.execute(sql, customerId ? [customerId] : []);
      return res.json(rows);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    // Local filter joined response
    let list = mockOrders.map(o => {
      const custObj = mockCustomers.find(c => c.id_customer === o.id_customer);
      const payObj = mockPayments.find(p => p.id_pesanan === o.id_pesanan);
      const shipObj = mockShipments.find(s => s.id_pesanan === o.id_pesanan);

      // Map inner products to match client-side rendering
      const details = mockOrderDetails
        .filter(d => d.id_pesanan === o.id_pesanan)
        .map(d => {
          const p = mockProducts.find(prod => prod.id_produk === d.id_produk);
          return {
            product: {
              name: p ? p.nama_produk : "Sepatu Lokal",
              img: p ? p.gambar_produk : "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
              brand: "Toko Footwear"
            },
            size: 42,
            qty: d.jumlah,
            price: d.harga_satuan
          };
        });

      return {
        ...o,
        id: `#ORD-${String(o.id_pesanan).padStart(4, "0")}`,
        date: o.tanggal_pesanan?.split(" ")[0] || "Hari ini",
        nama_customer: custObj ? custObj.nama_customer : "Pelanggan",
        email: custObj ? custObj.email : "customer@email.com",
        metode_pembayaran: payObj ? payObj.metode_pembayaran : "QRIS",
        status_pembayaran: payObj ? payObj.status_pembayaran : "Lunas",
        jasa_kirim: shipObj ? shipObj.jasa_kirim : "SiCepat REG",
        nomor_resi: shipObj ? shipObj.nomor_resi : "LL-930491039",
        status_pengiriman: shipObj ? shipObj.status_pengiriman : "Diproses",
        items: details
      };
    });

    if (customerId) {
      list = list.filter(o => o.id_customer === Number(customerId));
    }
    res.json(list);
  }
});

// 14. Update Order Shipping Status (Admin tools)
app.put("/api/orders/:id/status", async (req, res) => {
  const orderId = Number(req.params.id);
  const { status, resi, jasa_kirim } = req.body; // status: "Diproses", "Dikirim", "Selesai"

  const db = await getDbConnection();

  if (db) {
    try {
      // Begin TX
      await db.execute("UPDATE pesanan SET status_pesanan = ? WHERE id_pesanan = ?", [status, orderId]);
      await db.execute(
        "UPDATE pengiriman SET status_pengiriman = ?, nomor_resi = COALESCE(?, nomor_resi), jasa_kirim = COALESCE(?, jasa_kirim) WHERE id_pesanan = ?",
        [status === "Selesai" ? "Selesai" : status === "Dikirim" ? "Selesai" : "Diproses", resi || null, jasa_kirim || null, orderId]
      );
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    // Local storage
    const o = mockOrders.find(ord => ord.id_pesanan === orderId);
    if (o) o.status_pesanan = status;
    
    const s = mockShipments.find(shp => shp.id_pesanan === orderId);
    if (s) {
      s.status_pengiriman = status;
      if (resi) s.nomor_resi = resi;
      if (jasa_kirim) s.jasa_kirim = jasa_kirim;
    }
    res.json({ success: true });
  }
});

// 15. Analytics / Laporan endpoint for Bar Chart
app.get("/api/analytics", async (req, res) => {
  const db = await getDbConnection();

  if (db) {
    try {
      const [sumRows]: any = await db.execute("SELECT SUM(total_harga) as rev, COUNT(id_pesanan) as ords FROM pesanan");
      const [custRows]: any = await db.execute("SELECT COUNT(id_customer) as custs FROM customer");
      
      const revenue = Math.round(Number(sumRows[0]?.rev || 48500000));
      const orders = Number(sumRows[0]?.ords || 120);
      const customers = Number(custRows[0]?.custs || 50);

      return res.json({
        revenueThisMonth: revenue,
        revenueStatus: "+12.5%",
        ordersThisMonth: orders,
        ordersStatus: "+5.2%",
        customersThisMonth: customers,
        customersStatus: "+15.0%",
        revenueHistory: [
          { label: "Jul", value: Math.round(revenue * 0.5 / 1000000) },
          { label: "Ags", value: Math.round(revenue * 0.7 / 1000000) },
          { label: "Sep", value: Math.round(revenue * 0.6 / 1000000) },
          { label: "Okt", value: Math.round(revenue * 0.8 / 1000000) },
          { label: "Nov", value: Math.round(revenue * 0.75 / 1000000) },
          { label: "Des", value: Math.round(revenue / 1000000) }
        ],
        topProducts: [
          { name: "Nusantara Minimalist Low", category: "Sneakers Pria", sold: 124, change: 12, up: true },
          { name: "Heritage Classic Oxford", category: "Formal Pria", sold: 98, change: 5, up: true },
          { name: "Amora Daily Flat Shoes", category: "Flat Shoes", sold: 76, change: 2, up: false }
        ]
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    // In memory totals
    const revenue = mockOrders.reduce((sum, o) => sum + o.total_harga, 0);
    res.json({
      revenueThisMonth: revenue,
      revenueStatus: "+14.5%",
      ordersThisMonth: mockOrders.length,
      ordersStatus: "+8.2%",
      customersThisMonth: mockCustomers.length,
      customersStatus: "+2.1%",
      revenueHistory: [
        { label: "Jul", value: 24 },
        { label: "Ags", value: 32 },
        { label: "Sep", value: 28 },
        { label: "Okt", value: 41 },
        { label: "Nov", value: 35 },
        { label: "Des", value: Math.round(revenue / 1000000) || 48 }
      ],
      topProducts: [
        { name: "Nusantara Minimalist Low", category: "Sneakers Pria", sold: 124, change: 12, up: true },
        { name: "Heritage Classic Oxford", category: "Formal Pria", sold: 98, change: 5, up: true },
        { name: "Amora Daily Flat Shoes", category: "Flat Shoes", sold: 76, change: 2, up: false }
      ]
    });
  }
});


// Vite middleware integration for asset rendering during dev & production fallback build asset hosting
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Toko Footwear fullstack server booted successfully on port ${PORT}`);
  });
}

startServer();
