// Konstanta harga yang dipakai di halaman Checkout & Payment
export const TAX_RATE = 0.1; // Pajak restoran (PB1) 10%
export const SHIPPING_FEE = 10000; // Ongkos kirim flat
export const CATEGORIES = ["Semua", "Makanan", "Minuman", "Snack", "Paket"];

export function formatRupiah(num) {
  return "Rp" + Number(num || 0).toLocaleString("id-ID");
}

export function hitungTotal(subtotal) {
  const tax = Math.round(subtotal * TAX_RATE);
  return { subtotal, tax, total: subtotal + tax };
}
