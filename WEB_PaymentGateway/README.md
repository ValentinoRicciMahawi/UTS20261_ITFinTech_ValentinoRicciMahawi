# WEB_PaymentGateway - Cafe Pintar

Tugas UTS IT FinTech. Website buat pesan makanan dan minuman di Cafe Pintar, pembayarannya pakai payment gateway Xendit.

Dibuat pakai Next.js (page router), MongoDB, dan Xendit.

## Tahapan
1. Tahap 1: bikin project Next.js dan tampilan 3 halaman (Select Item, Checkout, Payment)
2. Tahap 2: sambungin ke MongoDB, ada tabel Product, Checkout, dan Payment
3. Tahap 3: integrasi Xendit + webhook biar status pembayaran jadi LUNAS otomatis

## Alur pembayaran
1. User pilih menu, checkout, isi alamat, lalu klik Confirm & Pay
2. Server bikin invoice di Xendit, terus muncul halaman tagihan
3. User klik "Bayar Sekarang" dan bayar di halaman Xendit
4. Setelah dibayar, Xendit kirim webhook ke `/api/webhook/xendit`
5. Status di database berubah jadi LUNAS, halaman tagihan ikut berubah sendiri

## Cara jalanin
1. `npm install`
2. Bikin file `.env.local` (contohnya ada di `.env.example`), isi:
   - `MONGODB_URI` - connection string MongoDB Atlas
   - `XENDIT_SECRET_KEY` - secret key Xendit (mode test)
   - `XENDIT_CALLBACK_TOKEN` - verification token webhook dari dashboard Xendit
   - `NEXT_PUBLIC_BASE_URL` - URL website (localhost / ngrok / vercel)
3. `npm run dev`
4. Buka http://localhost:3000

## Webhook
URL webhook yang didaftarin di dashboard Xendit (Settings > Webhooks > Invoices paid):

```
https://<url-website>/api/webhook/xendit
```

Karena Xendit harus bisa akses URL-nya dari internet, websitenya di-deploy dulu ke Vercel (atau pakai ngrok kalau di lokal).
