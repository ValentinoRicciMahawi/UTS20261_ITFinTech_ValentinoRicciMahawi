import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "@/components/Layout";
import TopBar from "@/components/TopBar";
import { useCart } from "@/context/CartContext";
import { formatRupiah, hitungTotal, TAX_RATE } from "@/lib/config";

// ===== Halaman 2: CHECKOUT =====
export default function CheckoutPage() {
  const router = useRouter();
  const { cart, loaded, updateQty, removeItem, subtotal } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { tax, total } = hitungTotal(subtotal);

  const handleContinue = async () => {
    setSubmitting(true);
    setError("");
    try {
      // Simpan checkout ke database
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      router.push(`/payment?checkoutId=${json.data._id}`);
    } catch (err) {
      setError(err.message || "Gagal membuat checkout");
      setSubmitting(false);
    }
  };

  return (
    <Layout title="Checkout">
      <TopBar title="Checkout" backTo="/" />

      {loaded && cart.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🛒</div>
          <p>Keranjang kamu masih kosong.</p>
          <Link href="/" className="btn-primary">
            Lihat Menu
          </Link>
        </div>
      ) : (
        <>
          <section>
            {cart.map((item) => (
              <div className="cart-item" key={item.productId}>
                <img src={item.image} alt={item.name} />
                <div className="cart-info">
                  <h3>{item.name}</h3>
                  <p className="muted">{formatRupiah(item.price)} / porsi</p>
                  <div className="qty-row">
                    <div className="qty">
                      <button onClick={() => updateQty(item.productId, item.quantity - 1)}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQty(item.productId, item.quantity + 1)}>+</button>
                    </div>
                    <button className="link-danger" onClick={() => removeItem(item.productId)}>
                      Hapus
                    </button>
                  </div>
                </div>
                <strong className="cart-price">{formatRupiah(item.price * item.quantity)}</strong>
              </div>
            ))}
          </section>

          <section className="summary">
            <div className="row">
              <span>Subtotal</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>
            <div className="row">
              <span>Tax (PB1 {TAX_RATE * 100}%)</span>
              <span>{formatRupiah(tax)}</span>
            </div>
            <div className="row total">
              <span>Total</span>
              <span>{formatRupiah(total)}</span>
            </div>

            {error && <p className="error-box">⚠️ {error}</p>}

            <button
              className="btn-secondary"
              onClick={handleContinue}
              disabled={submitting || cart.length === 0}
            >
              {submitting ? "Memproses..." : "Continue to Payment →"}
            </button>
            <Link href="/" className="link-center">
              + Tambah menu lain
            </Link>
          </section>
        </>
      )}
    </Layout>
  );
}
