# WEB_PaymentGateway — Cafe Pintar ☕

Aplikasi pemesanan makanan & minuman **Cafe Pintar** menggunakan **Next.js (Pages Router)**.

## Tahap 1 — Project Next.js + Tampilan 3 Halaman

| Halaman | URL | Isi |
|---|---|---|
| **Select Item** | `/` | Menu hamburger, logo, ikon keranjang + badge, search, tab kategori (Semua, Makanan, Minuman, Snack, Paket), kartu produk + tombol **Add +** |
| **Checkout** | `/checkout` | Daftar item yang dipilih, tombol **− / +**, hapus item, Subtotal, Tax (PB1 10%), Total, tombol **Continue to Payment →** |
| **Payment** | `/payment` | Form **Shipping Address**, **Payment Method**, **Order Summary**, tombol **Confirm & Pay** |

Keranjang disimpan di React Context + `localStorage`. Data menu untuk sementara masih statis
(`lib/seedData.js`) dan diambil lewat API route `GET /api/products?category=...`.

## Cara Menjalankan

```bash
npm install
npm run dev
```

Buka http://localhost:3000

## Struktur Folder

```
WEB_PaymentGateway/
├── components/      # Layout, Header, TopBar, ProductCard
├── context/         # CartContext (state keranjang)
├── lib/             # config (pajak, ongkir, format rupiah) & data menu
├── pages/
│   ├── index.js     # Select Item
│   ├── checkout.js  # Checkout
│   ├── payment.js   # Payment / Secure Checkout
│   └── api/products # API daftar produk
├── public/images/   # gambar menu
└── styles/globals.css
```

## Rencana Tahap Berikutnya
- **Tahap 2:** MongoDB (collection Product, Checkout, Payment)
- **Tahap 3:** Integrasi Xendit + webhook untuk update status **LUNAS** otomatis
