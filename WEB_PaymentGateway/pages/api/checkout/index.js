import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Checkout from "@/models/Checkout";
import { hitungTotal } from "@/lib/config";

// POST /api/checkout
// body: { items: [{ productId, quantity }] }
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();
    const { items } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Keranjang masih kosong" });
    }

    // Ambil harga dari database (jangan percaya harga dari frontend)
    const ids = items.map((i) => i.productId).filter((id) => mongoose.isValidObjectId(id));
    const products = await Product.find({ _id: { $in: ids } });

    const checkoutItems = [];
    for (const item of items) {
      const product = products.find((p) => p._id.toString() === item.productId);
      const qty = parseInt(item.quantity, 10);
      if (!product || !qty || qty < 1) continue;
      checkoutItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: qty,
        subtotal: product.price * qty,
      });
    }

    // Ada produk di keranjang yang tidak ditemukan di database
    if (checkoutItems.length !== items.length) {
      return res.status(400).json({
        message:
          "Ada menu di keranjang yang sudah tidak tersedia. Hapus menu tersebut lalu tambahkan lagi dari halaman menu.",
      });
    }

    const subtotal = checkoutItems.reduce((sum, i) => sum + i.subtotal, 0);
    const { tax, total } = hitungTotal(subtotal);

    const checkout = await Checkout.create({
      items: checkoutItems,
      subtotal,
      tax,
      total,
      status: "PENDING",
    });

    return res.status(201).json({ data: checkout });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
}
