import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "@/components/Layout";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { CATEGORIES, formatRupiah } from "@/lib/config";

// ===== Halaman 1: SELECT ITEM =====
export default function SelectItemPage() {
  const { cart, addToCart, totalItems, subtotal } = useCart();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("Semua");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  // Ambil produk dari API setiap kategori berubah
  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`/api/products?category=${encodeURIComponent(category)}`)
      .then((res) => res.json().then((json) => ({ ok: res.ok, json })))
      .then(({ ok, json }) => {
        if (!ok) throw new Error(json.message);
        setProducts(json.data);
      })
      .catch((err) => setError(err.message || "Gagal memuat produk"))
      .finally(() => setLoading(false));
  }, [category]);

  const handleAdd = (product) => {
    addToCart(product);
    setToast(`${product.name} ditambahkan ke keranjang`);
    setTimeout(() => setToast(""), 1500);
  };

  // Filter pencarian di sisi client
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const qtyOf = (id) => cart.find((i) => i.productId === id)?.quantity || 0;

  return (
    <Layout title="Menu">
      <Header />

      <div className="search-box">
        <input
          type="text"
          placeholder="Cari nasi goreng, kopi, ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>

      <div className="promo">
        <div>
          <p className="promo-small">Promo Mahasiswa</p>
          <p className="promo-big">Paket Hemat cuma Rp28rb!</p>
        </div>
        <img src="/images/paket-hemat.svg" alt="" />
      </div>

      <div className="tabs">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`tab ${category === c ? "active" : ""}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <section className="product-list">
        {loading && <p className="info">Memuat menu...</p>}
        {error && <p className="error-box">⚠️ {error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <p className="info">Menu tidak ditemukan 😢</p>
        )}
        {!loading &&
          filtered.map((p) => (
            <ProductCard key={p._id} product={p} qtyInCart={qtyOf(p._id)} onAdd={handleAdd} />
          ))}
      </section>

      {totalItems > 0 && (
        <Link href="/checkout" className="floating-cart">
          <span>
            🛒 {totalItems} item &middot; {formatRupiah(subtotal)}
          </span>
          <strong>Checkout &rarr;</strong>
        </Link>
      )}

      {toast && <div className="toast">{toast}</div>}
    </Layout>
  );
}
