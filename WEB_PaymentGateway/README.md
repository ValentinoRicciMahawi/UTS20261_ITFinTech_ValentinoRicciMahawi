# WEB_PaymentGateway - Cafe Pintar

Project UTS IT FinTech. Website pemesanan makanan dan minuman untuk "Cafe Pintar" dengan pembayaran lewat payment gateway.

Dibuat pakai Next.js (Pages Router) dan MongoDB.

## Tahapan pengerjaan

1. **Tahap 1** - Setup project Next.js dan tampilan 3 halaman (Select Item, Checkout, Payment)
2. **Tahap 2** - Menyambungkan ke MongoDB (Product, Checkout, Payment)
3. **Tahap 3** - Integrasi Xendit dan webhook untuk update status LUNAS (belum)

Kode tiap tahap bisa dilihat dari tab **Commits** atau dari **Tags** (`tahap-1`, `tahap-2`, ...).

## Halaman

- `/` - pilih menu, bisa filter kategori dan search
- `/checkout` - isi keranjang, ubah jumlah, lihat total
- `/payment` - isi alamat pengiriman dan pilih metode bayar
- `/invoice/[id]` - tagihan setelah Confirm & Pay
- `/orders` - riwayat pesanan

## Database

Pakai MongoDB Atlas, ada 3 collection:

- `products` - data menu
- `checkouts` - pesanan dari keranjang
- `payments` - tagihan (data pembeli, alamat, metode bayar, total, status)

Model-nya ada di folder `models/`.

## Cara menjalankan

1. Install dulu

   ```
   npm install
   ```

2. Buat file `.env.local` di folder ini, isi dengan connection string dari MongoDB Atlas

   ```
   MONGODB_URI=mongodb+srv://...
   ```

3. Jalankan

   ```
   npm run dev
   ```

4. Buka http://localhost:3000

Data menu otomatis masuk ke database waktu pertama kali dibuka.
