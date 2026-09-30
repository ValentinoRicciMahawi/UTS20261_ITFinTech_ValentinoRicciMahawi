import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "cafe-pintar-cart-v2";

// ID produk dari MongoDB selalu 24 karakter hexa (contoh: 66f9a1c2e4b0...)
const isValidId = (id) => /^[a-f0-9]{24}$/i.test(String(id));

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Ambil keranjang dari localStorage saat pertama kali dibuka
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      // Buang keranjang versi lama (ID produk bukan dari MongoDB)
      localStorage.removeItem("cafe-pintar-cart");
      if (saved) setCart(JSON.parse(saved).filter((i) => isValidId(i.productId)));
    } catch (e) {
      console.log("Gagal membaca keranjang", e);
    }
    setLoaded(true);
  }, []);

  // Simpan keranjang setiap kali berubah
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {}
  }, [cart, loaded]);

  const addToCart = (product) => {
    setCart((prev) => {
      const found = prev.find((i) => i.productId === product._id);
      if (found) {
        return prev.map((i) =>
          i.productId === product._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
          quantity: 1,
        },
      ];
    });
  };

  const updateQty = (productId, qty) => {
    setCart((prev) =>
      prev
        .map((i) => (i.productId === productId ? { ...i, quantity: qty } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const removeItem = (productId) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, loaded, addToCart, updateQty, removeItem, clearCart, totalItems, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
