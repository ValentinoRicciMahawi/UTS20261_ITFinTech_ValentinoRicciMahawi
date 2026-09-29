import { useState } from "react";
import Link from "next/link";
import Layout from "@/components/Layout";
import TopBar from "@/components/TopBar";
import { useCart } from "@/context/CartContext";
import { formatRupiah, hitungTotal, SHIPPING_FEE } from "@/lib/config";

const METHODS = [
  { value: "CARD", label: "Credit/Debit Card", sub: "Visa, Mastercard, JCB" },
  { value: "QRIS", label: "QRIS", sub: "Scan pakai GoPay, OVO, DANA, m-banking" },
  { value: "OTHER", label: "Other (E-Wallet, Bank Transfer)", sub: "OVO, DANA, ShopeePay, VA BCA/BNI/BRI/Mandiri" },
];

// ===== Halaman 3: PAYMENT (Secure Checkout) =====
export default function PaymentPage() {
  const { cart, loaded, subtotal, clearCart } = useCart();
  const [order, setOrder] = useState(null); // pesanan yang sudah dikonfirmasi
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    note: "",
    paymentMethod: "CARD",
  });

  const { total } = hitungTotal(subtotal);
  const grandTotal = total + SHIPPING_FEE;
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simpan ringkasan pesanan untuk ditampilkan, lalu kosongkan keranjang
    setOrder({
      ...form,
      items: cart,
      amount: grandTotal,
      method: METHODS.find((m) => m.value === form.paymentMethod).label,
    });
    clearCart();
  };

  // ===== Tampilan setelah Confirm & Pay =====
  if (order) {
    return (
      <Layout title="Pesanan Dikonfirmasi">
        <TopBar title="Pesanan Dikonfirmasi" backTo="/" />
        <div className="confirm-hero">
          <div className="hero-icon">🧾</div>
          <p>Total Tagihan</p>
          <h2>{formatRupiah(order.amount)}</h2>
          <small>Metode: {order.method}</small>
        </div>

        <section className="card-section" style={{ margin: "0 16px 14px" }}>
          <h2>Detail Pesanan</h2>
          {order.items.map((item) => (
            <div className="row" key={item.productId}>
              <span>
                {item.quantity}x {item.name}
              </span>
              <span>{formatRupiah(item.price * item.quantity)}</span>
            </div>
          ))}
        </section>

        <section className="card-section" style={{ margin: "0 16px 14px" }}>
          <h2>Dikirim ke</h2>
          <p className="address">
            <strong>{order.name}</strong> ({order.phone})
            <br />
            {order.address}
          </p>
        </section>

        <div className="confirm-actions">
          <Link href="/" className="btn-outline btn-block">
            Kembali ke Menu
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Secure Checkout">
      <TopBar title="Secure Checkout" icon="🔒" backTo="/checkout" />

      {loaded && cart.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🛒</div>
          <p>Belum ada pesanan untuk dibayar.</p>
          <Link href="/" className="btn-primary">
            Lihat Menu
          </Link>
        </div>
      ) : (
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
              <span>{formatRupiah(total)}</span>
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

          <button type="submit" className="btn-primary btn-block">
            Confirm &amp; Pay
          </button>
        </form>
      )}
    </Layout>
  );
}
