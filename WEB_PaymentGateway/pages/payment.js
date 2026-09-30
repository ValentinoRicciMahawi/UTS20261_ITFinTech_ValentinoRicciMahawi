import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import TopBar from "@/components/TopBar";
import { useCart } from "@/context/CartContext";
import { formatRupiah, SHIPPING_FEE } from "@/lib/config";

const METHODS = [
  { value: "CARD", label: "Credit/Debit Card", sub: "Visa, Mastercard, JCB" },
  { value: "QRIS", label: "QRIS", sub: "Scan pakai GoPay, OVO, DANA, m-banking" },
  { value: "OTHER", label: "Other (E-Wallet, Bank Transfer)", sub: "OVO, DANA, ShopeePay, VA BCA/BNI/BRI/Mandiri" },
];

// ===== Halaman 3: PAYMENT (Secure Checkout) =====
export default function PaymentPage() {
  const router = useRouter();
  const { checkoutId } = router.query;
  const { clearCart } = useCart();

  const [checkout, setCheckout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    note: "",
    paymentMethod: "CARD",
  });

  useEffect(() => {
    if (!router.isReady) return;
    if (!checkoutId) {
      setError("Checkout tidak ditemukan. Silakan ulangi dari keranjang.");
      setLoading(false);
      return;
    }
    fetch(`/api/checkout/${checkoutId}`)
      .then((res) => res.json().then((json) => ({ ok: res.ok, json })))
      .then(({ ok, json }) => {
        if (!ok) throw new Error(json.message);
        setCheckout(json.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router.isReady, checkoutId]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, checkoutId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      clearCart();
      // Tampilkan tagihan (invoice) yang sudah dibuat
      router.push(`/invoice/${json.data._id}`);
    } catch (err) {
      setError(err.message || "Gagal membuat tagihan");
      setSubmitting(false);
    }
  };

  const grandTotal = checkout ? checkout.total + SHIPPING_FEE : 0;
  const itemCount = checkout ? checkout.items.reduce((s, i) => s + i.quantity, 0) : 0;

  return (
    <Layout title="Secure Checkout">
      <TopBar title="Secure Checkout" icon="🔒" backTo="/checkout" />

      {loading && <p className="info">Memuat data checkout...</p>}
      {!loading && !checkout && <p className="error-box" style={{ margin: 16 }}>⚠️ {error}</p>}

      {checkout && (
        <form onSubmit={handleSubmit} className="payment-form">
          <section className="card-section">
            <h2>Shipping Address</h2>
            <label>
              Nama Penerima
              <input name="name" value={form.name} onChange={handleChange} placeholder="cth. Budi Santoso" required />
            </label>
            <div className="two-col">
              <label>
                No. HP
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="08123456789" required />
              </label>
              <label>
                Email
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="budi@mail.com" required />
              </label>
            </div>
            <label>
              Alamat Lengkap
              <textarea name="address" rows={3} value={form.address} onChange={handleChange} placeholder="Jl. BSD Raya Barat No. 1, Tangerang" required />
            </label>
            <label>
              Catatan (opsional)
              <input name="note" value={form.note} onChange={handleChange} placeholder="cth. sambal dipisah ya" />
            </label>
          </section>

          <section className="card-section">
            <h2>Payment Method</h2>
            {METHODS.map((m) => (
              <label key={m.value} className={`radio ${form.paymentMethod === m.value ? "checked" : ""}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value={m.value}
                  checked={form.paymentMethod === m.value}
                  onChange={handleChange}
                />
                <div>
                  <span>{m.label}</span>
                  <small>{m.sub}</small>
                </div>
              </label>
            ))}
          </section>

          <section className="card-section">
            <h2>Order Summary</h2>
            <div className="row">
              <span>Item(s) ({itemCount}) + pajak</span>
              <span>{formatRupiah(checkout.total)}</span>
            </div>
            <div className="row">
              <span>Shipping</span>
              <span>{formatRupiah(SHIPPING_FEE)}</span>
            </div>
            <div className="row total">
              <span>Total</span>
              <span>{formatRupiah(grandTotal)}</span>
            </div>
          </section>

          {error && <p className="error-box">⚠️ {error}</p>}

          <button type="submit" className="btn-primary btn-block" disabled={submitting}>
            {submitting ? "Membuat tagihan..." : "Confirm & Pay"}
          </button>
          <p className="secure-note">🔒 Pembayaran diproses aman oleh Xendit</p>
        </form>
      )}
    </Layout>
  );
}
