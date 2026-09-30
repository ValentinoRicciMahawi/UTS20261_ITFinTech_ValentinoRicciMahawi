# WEB_PaymentGateway — Cafe Pintar ☕

Aplikasi pemesanan makanan & minuman **Cafe Pintar** menggunakan **Next.js (Pages Router)** + **MongoDB**.

## Progress
- ✅ **Tahap 1:** Project Next.js + tampilan 3 halaman (Select Item, Checkout, Payment)
- ✅ **Tahap 2:** Database MongoDB (collection Product, Checkout, Payment)
- ⏳ Tahap 3: Integrasi Xendit + webhook untuk status **LUNAS** otomatis

---

## Tahap 2 — Database MongoDB

Koneksi ke MongoDB memakai library **Mongoose** (`lib/mongodb.js`).

### Struktur "tabel" (collection)

| Model (file) | Collection | Field penting |
|---|---|---|
| `models/Product.js` | `products` | name, category (Makanan/Minuman/Snack/Paket), price, description, image, isAvailable |
| `models/Checkout.js` | `checkouts` | items[] (product, name, price, quantity, subtotal), subtotal, tax, total, status |
| `models/Payment.js` | `payments` | checkout (relasi ke checkouts), externalId (no. invoice), customer, shippingAddress, shippingFee, amount, paymentMethod, status, paidAt |

Relasi: **Product** → dipilih ke dalam **Checkout** (items) → dibuatkan tagihan **Payment** (`payment.checkout` = `_id` checkout).

Status:
- Checkout: `PENDING` → `MENUNGGU_PEMBAYARAN` → `LUNAS` / `KEDALUWARSA`
- Payment: `PENDING` → `LUNAS` / `KEDALUWARSA`

### API

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/products?category=Makanan` | Ambil produk dari DB (otomatis isi data awal jika DB kosong) |
| GET | `/api/seed` | Reset & isi ulang data produk |
| POST | `/api/checkout` | Simpan checkout (harga dihitung ulang dari DB, bukan dari browser) |
| GET | `/api/checkout/[id]` | Detail checkout |
| POST | `/api/payment` | Simpan tagihan (Payment) dari checkout |
| GET | `/api/payment` | Daftar semua tagihan |
| GET | `/api/payment/[id]` | Detail tagihan |

### Alur
1. **Select Item** → produk diambil dari collection `products`.
2. **Checkout** → klik *Continue to Payment* → data disimpan ke `checkouts`.
3. **Payment** → isi alamat & metode → *Confirm & Pay* → data disimpan ke `payments`.
4. Halaman **Tagihan** (`/invoice/[id]`) menampilkan tagihan dari database. Semua tagihan bisa dilihat di **Riwayat Pesanan** (`/orders`).

---

## Cara Menjalankan

1. Buat database gratis di **MongoDB Atlas** dan salin connection string-nya.
2. Salin `.env.example` menjadi `.env.local`, lalu isi `MONGODB_URI`.
3. Jalankan:
   ```bash
   npm install
   npm run dev
   ```
4. Buka http://localhost:3000

> `.env.local` berisi password database, jadi **tidak ikut di-push** ke GitHub (sudah ada di `.gitignore`).

## Struktur Folder

```
WEB_PaymentGateway/
├── components/        # Layout, Header, TopBar, ProductCard, StatusBadge
├── context/           # CartContext (state keranjang)
├── lib/
│   ├── mongodb.js     # koneksi MongoDB
│   ├── config.js      # pajak, ongkir, format rupiah
│   └── seedData.js    # data menu awal
├── models/            # Product, Checkout, Payment (skema Mongoose)
├── pages/
│   ├── index.js       # Select Item
│   ├── checkout.js    # Checkout
│   ├── payment.js     # Payment
│   ├── invoice/[id].js# Tagihan
│   ├── orders.js      # Riwayat pesanan
│   └── api/           # products, seed, checkout, payment
├── public/images/
└── styles/globals.css
```
