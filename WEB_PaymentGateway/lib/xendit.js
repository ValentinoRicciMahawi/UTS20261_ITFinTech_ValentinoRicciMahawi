// Helper untuk memanggil REST API Xendit (Invoice API)
// Dokumentasi: https://developers.xendit.co/api-reference/#create-invoice

const XENDIT_API = "https://api.xendit.co";

function authHeader() {
  const key = process.env.XENDIT_SECRET_KEY;
  if (!key) throw new Error("XENDIT_SECRET_KEY belum diisi di file .env.local");
  // Basic Auth: secret key sebagai username, password kosong
  return "Basic " + Buffer.from(key + ":").toString("base64");
}

// Mapping pilihan metode pembayaran di halaman Payment -> payment_methods Xendit
export const PAYMENT_METHODS = {
  CARD: {
    label: "Credit/Debit Card",
    xendit: ["CREDIT_CARD"],
  },
  QRIS: {
    label: "QRIS",
    xendit: ["QRIS"],
  },
  OTHER: {
    label: "Lainnya (E-Wallet, Bank Transfer)",
    xendit: ["BCA", "BNI", "BRI", "MANDIRI", "PERMATA", "OVO", "DANA", "SHOPEEPAY", "LINKAJA"],
  },
};

async function postInvoice(body) {
  const res = await fetch(`${XENDIT_API}/v2/invoices`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

export async function createInvoice(body) {
  let { ok, data } = await postInvoice(body);

  // Kalau channel pembayaran yang dipilih belum aktif di akun Xendit,
  // coba lagi tanpa membatasi payment_methods (tampilkan semua channel yang aktif)
  if (!ok && body.payment_methods) {
    console.warn("Xendit menolak payment_methods, coba ulang tanpa filter:", data?.message);
    const { payment_methods, ...rest } = body;
    ({ ok, data } = await postInvoice(rest));
  }

  if (!ok) {
    throw new Error(data?.message || "Gagal membuat invoice Xendit");
  }
  return data;
}
