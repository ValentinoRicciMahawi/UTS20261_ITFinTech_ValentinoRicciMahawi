import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "@/components/Layout";
import TopBar from "@/components/TopBar";
import StatusBadge from "@/components/StatusBadge";
import { formatRupiah, formatTanggal } from "@/lib/config";

const METHOD_LABEL = {
  CARD: "Credit/Debit Card",
  QRIS: "QRIS",
  OTHER: "E-Wallet / Bank Transfer",
};

// ===== Halaman Tagihan (Invoice) =====
// Muncul setelah user klik "Confirm & Pay". Data diambil dari collection "payments"
// (MongoDB) beserta data checkout-nya.
export default function InvoicePage() {
  const router = useRouter();
  const { id } = router.query;
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    // Ambil data tagihan dari database
    fetch(`/api/payment/${id}`)
      .then((res) => res.json().then((json) => ({ ok: res.ok, json })))
      .then(({ ok, json }) => {
        if (!ok) throw new Error(json.message);
        setPayment(json.data);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) {
    return (
      <Layout title="Tagihan">
        <TopBar title="Tagihan" backTo="/" />
        <p className="error-box" style={{ margin: 16 }}>⚠️ {error}</p>
      </Layout>
    );
  }

  if (!payment) {
    return (
      <Layout title="Tagihan">
        <TopBar title="Tagihan" backTo="/" />
        <p className="info">Memuat tagihan...</p>
      </Layout>
    );
  }

  const checkout = payment.checkout || {};
  const lunas = payment.status === "LUNAS";

  return (
    <Layout title="Tagihan">
      <TopBar title="Tagihan" backTo="/" />

      <div className={`invoice-hero ${lunas ? "paid" : ""}`}>
        <div className="hero-icon">{lunas ? "✅" : payment.status === "KEDALUWARSA" ? "⌛" : "🧾"}</div>
        <p>{lunas ? "Pembayaran Berhasil!" : "Total Tagihan"}</p>
        <h2>{formatRupiah(payment.amount)}</h2>
        <StatusBadge status={payment.status} />
        {!lunas && payment.status === "PENDING" && (
          <small className="waiting">
            <span className="dot" /> Menunggu pembayaran...
          </small>
        )}
      </div>

      <section className="card-section">
        <div className="row">
          <span className="muted">No. Invoice</span>
          <strong className="mono">{payment.externalId}</strong>
        </div>
        <div className="row">
          <span className="muted">Tanggal</span>
          <span>{formatTanggal(payment.createdAt)}</span>
        </div>
        <div className="row">
          <span className="muted">Metode</span>
          <span>{METHOD_LABEL[payment.paymentMethod]}</span>
        </div>
        {lunas && (
          <>
            <div className="row">
              <span className="muted">Dibayar via</span>
              <span>{payment.paymentChannel}</span>
            </div>
            <div className="row">
              <span className="muted">Waktu Bayar</span>
              <span>{formatTanggal(payment.paidAt)}</span>
            </div>
          </>
        )}
        {!lunas && payment.expiryDate && (
          <div className="row">
            <span className="muted">Bayar sebelum</span>
            <span>{formatTanggal(payment.expiryDate)}</span>
          </div>
        )}
      </section>

      <section className="card-section">
        <h2>Detail Pesanan</h2>
        {(checkout.items || []).map((item, idx) => (
          <div className="row" key={idx}>
            <span>
              {item.quantity}x {item.name}
            </span>
            <span>{formatRupiah(item.subtotal)}</span>
          </div>
        ))}
        <hr />
        <div className="row">
          <span>Subtotal</span>
          <span>{formatRupiah(checkout.subtotal)}</span>
        </div>
        <div className="row">
          <span>Tax</span>
          <span>{formatRupiah(checkout.tax)}</span>
        </div>
        <div className="row">
          <span>Shipping</span>
          <span>{formatRupiah(payment.shippingFee)}</span>
        </div>
        <div className="row total">
          <span>Total</span>
          <span>{formatRupiah(payment.amount)}</span>
        </div>
      </section>

      <section className="card-section">
        <h2>Dikirim ke</h2>
        <p className="address">
          <strong>{payment.customer?.name}</strong> ({payment.customer?.phone})
          <br />
          {payment.shippingAddress}
          {payment.note && (
            <>
              <br />
              <em>Catatan: {payment.note}</em>
            </>
          )}
        </p>
      </section>

      <div className="invoice-actions">
        {lunas && <p className="thanks">Terima kasih! Pesananmu sedang disiapkan 👨‍🍳</p>}
        <Link href="/" className="btn-outline btn-block">
          Kembali ke Menu
        </Link>
        <Link href="/orders" className="link-center">
          Lihat Riwayat Pesanan
        </Link>
      </div>
    </Layout>
  );
}
