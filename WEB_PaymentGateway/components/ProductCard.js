import { formatRupiah } from "@/lib/config";

export default function ProductCard({ product, qtyInCart, onAdd }) {
  return (
    <div className="product-card">
      <img className="product-img" src={product.image} alt={product.name} />
      <div className="product-info">
        <span className={`chip chip-${product.category.toLowerCase()}`}>{product.category}</span>
        <h3>{product.name}</h3>
        <p className="price">{formatRupiah(product.price)}</p>
        <p className="desc">{product.description}</p>
        <div className="product-action">
          {qtyInCart > 0 && <span className="in-cart">{qtyInCart} di keranjang</span>}
          <button className="btn-add" onClick={() => onAdd(product)}>
            Add +
          </button>
        </div>
      </div>
    </div>
  );
}
