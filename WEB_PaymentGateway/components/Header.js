import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="header">
        <button className="icon-btn" onClick={() => setMenuOpen(true)} aria-label="Menu">
          <span className="burger" />
        </button>

        <Link href="/" className="logo">
          <img src="/images/logo.svg" alt="Cafe Pintar" />
          <div>
            <strong>Cafe Pintar</strong>
            <small>Makan enak, bayar gampang</small>
          </div>
        </Link>

        <Link href="/checkout" className="cart-btn" aria-label="Keranjang">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {totalItems > 0 && <span className="badge">{totalItems}</span>}
        </Link>
      </header>

      {/* Side menu (hamburger) */}
      {menuOpen && (
        <div className="drawer-overlay" onClick={() => setMenuOpen(false)}>
          <div className="drawer-wrap">
          <nav className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-head">
              <img src="/images/logo.svg" alt="" />
              <strong>Cafe Pintar</strong>
            </div>
            <Link href="/" onClick={() => setMenuOpen(false)}>🍽️ Menu</Link>
            <Link href="/checkout" onClick={() => setMenuOpen(false)}>🛒 Keranjang ({totalItems})</Link>
            <p className="drawer-foot">Buka setiap hari 08.00 - 22.00</p>
          </nav>
          </div>
        </div>
      )}
    </>
  );
}
