import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "@/components/Layout";
import TopBar from "@/components/TopBar";
import StatusBadge from "@/components/StatusBadge";
import { formatRupiah, formatTanggal } from "@/lib/config";

// Halaman tambahan: riwayat semua pesanan & status pembayarannya
export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/payment")
      .then((res) => res.json().then((json) => ({ ok: res.ok, json })))
      .then(({ ok, json }) => {
        if (!ok) throw new Error(json.message);
        setOrders(json.data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout title="Riwayat Pesanan">
      <TopBar title="Riwayat Pesanan" backTo="/" />

      {loading && <p className="info">Memuat...</p>}
      {error && <p className="error-box" style={{ margin: 16 }}>⚠️ {error}</p>}
      {!loading && !error && orders.length === 0 && (
        <div className="empty">
          <div className="empty-icon">🧾</div>
          <p>Belum ada pesanan.</p>
          <Link href="/" className="btn-primary">Pesan Sekarang</Link>
        </div>
      )}

      <section>
        {orders.map((o) => (
          <Link href={`/invoice/${o._id}`} key={o._id} className="order-item">
            <div>
              <strong className="mono">{o.externalId}</strong>
              <p className="muted">
                {formatTanggal(o.createdAt)} &middot;{" "}
                {(o.checkout?.items || []).reduce((s, i) => s + i.quantity, 0)} item
              </p>
              <p className="muted">{o.customer?.name}</p>
            </div>
            <div className="order-right">
              <strong>{formatRupiah(o.amount)}</strong>
              <StatusBadge status={o.status} />
            </div>
          </Link>
        ))}
      </section>
    </Layout>
  );
}
