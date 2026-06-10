import { DbConfig, Kategori, ProdukDetail, ReviewJoined, Customer, Pesanan } from "../types";

const API_BASE = ""; // Same origin proxy

export async function getDbStatus(): Promise<DbConfig> {
  try {
    const res = await fetch(`${API_BASE}/api/db-status`);
    if (!res.ok) throw new Error("Gagal mengambil status database");
    return await res.json();
  } catch (err: any) {
    return { connected: false, type: "mock", error: err.message };
  }
}

export async function loginUser(payload: any): Promise<any> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Login gagal");
  }
  return await res.json();
}

export async function registerUser(payload: any): Promise<any> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Registrasi gagal");
  }
  return await res.json();
}

export async function getCategories(): Promise<Kategori[]> {
  const res = await fetch(`${API_BASE}/api/categories`);
  if (!res.ok) throw new Error("Gagal mengambil daftar kategori");
  return await res.json();
}

export async function getProducts(filters: { category?: string; size?: string; query?: string; sort?: string } = {}): Promise<ProdukDetail[]> {
  const params = new URLSearchParams();
  if (filters.category) params.append("category", filters.category);
  if (filters.size) params.append("size", filters.size);
  if (filters.query) params.append("query", filters.query);
  if (filters.sort) params.append("sort", filters.sort);

  const res = await fetch(`${API_BASE}/api/products?${params.toString()}`);
  if (!res.ok) throw new Error("Gagal mengambil daftar produk");
  return await res.json();
}

export async function getProductDetail(id: number): Promise<ProdukDetail> {
  const res = await fetch(`${API_BASE}/api/products/${id}`);
  if (!res.ok) throw new Error("Gagal mengambil detail produk");
  return await res.json();
}

export async function addProduct(payload: any): Promise<any> {
  const res = await fetch(`${API_BASE}/api/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Gagal menambah produk");
  }
  return await res.json();
}

export async function updateProduct(id: number, payload: any): Promise<any> {
  const res = await fetch(`${API_BASE}/api/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Gagal memperbarui produk");
  }
  return await res.json();
}

export async function deleteProduct(id: number): Promise<any> {
  const res = await fetch(`${API_BASE}/api/products/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Gagal menghapus produk");
  return await res.json();
}

export async function getCustomers(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/api/customers`);
  if (!res.ok) throw new Error("Gagal mengambil data pelanggan");
  return await res.json();
}

export async function getReviews(): Promise<ReviewJoined[]> {
  const res = await fetch(`${API_BASE}/api/reviews`);
  if (!res.ok) throw new Error("Gagal mengambil daftar ulasan");
  return await res.json();
}

export async function addReview(payload: any): Promise<any> {
  const res = await fetch(`${API_BASE}/api/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Gagal mengirim ulasan");
  }
  return await res.json();
}

export async function createOrder(payload: any): Promise<any> {
  const res = await fetch(`${API_BASE}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Gagal membuat pesanan");
  }
  return await res.json();
}

export async function getOrders(customerId?: number): Promise<any[]> {
  const url = customerId ? `${API_BASE}/api/orders?customerId=${customerId}` : `${API_BASE}/api/orders`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Gagal mengambil data pesanan");
  return await res.json();
}

export async function updateOrderStatus(orderId: number, payload: { status: string; resi?: string; jasa_kirim?: string }): Promise<any> {
  const res = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Gagal memperbarui status pengiriman");
  return await res.json();
}

export async function getAnalytics(): Promise<any> {
  const res = await fetch(`${API_BASE}/api/analytics`);
  if (!res.ok) throw new Error("Gagal mengambil laporan analitik");
  return await res.json();
}

export async function checkProductPurchase(customerId: number, productId: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/orders/check-purchase?customerId=${customerId}&productId=${productId}`);
    if (!res.ok) return false;
    const data = await res.json();
    return !!data.purchased;
  } catch {
    return false;
  }
}
