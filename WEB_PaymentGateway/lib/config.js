// Konstanta harga yang dipakai di frontend & backend
export const TAX_RATE = 0.1; // Pajak restoran (PB1) 10%
export const SHIPPING_FEE = 0; // Pesan & makan di tempat, jadi tidak ada ongkir
export const CATEGORIES = ["Semua", "Makanan", "Minuman", "Snack", "Paket"];

export function formatRupiah(num) {
  return "Rp" + Number(num || 0).toLocaleString("id-ID");
}

export function hitungTotal(subtotal) {
  const tax = Math.round(subtotal * TAX_RATE);
  return { subtotal, tax, total: subtotal + tax };
}

export function formatTanggal(date) {
  if (!date) return "-";
  return new Date(date).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
