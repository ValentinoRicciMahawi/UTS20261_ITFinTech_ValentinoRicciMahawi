import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Checkout from "@/models/Checkout";
import Payment from "@/models/Payment";
import { SHIPPING_FEE } from "@/lib/config";

const METODE_VALID = ["CARD", "QRIS", "OTHER"];

// GET  /api/payment -> daftar semua pembayaran (riwayat pesanan)
// POST /api/payment -> buat data Payment (tagihan) dari sebuah checkout
export default async function handler(req, res) {
  try {
    await dbConnect();

    if (req.method === "GET") {
      const payments = await Payment.find({})
        .sort({ createdAt: -1 })
        .limit(50)
        .populate("checkout");
      return res.status(200).json({ data: payments });
    }

    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const { checkoutId, name, email, phone, address, note, paymentMethod } = req.body || {};

    // ===== Validasi input =====
    if (!mongoose.isValidObjectId(checkoutId)) {
      return res.status(400).json({ message: "Checkout tidak valid" });
    }
    if (!name || !email || !phone || !address) {
      return res.status(400).json({ message: "Nama, email, no HP, dan alamat wajib diisi" });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: "Format email tidak valid" });
    }
    const method = METODE_VALID.includes(paymentMethod) ? paymentMethod : "CARD";

    const checkout = await Checkout.findById(checkoutId);
    if (!checkout) return res.status(404).json({ message: "Checkout tidak ditemukan" });
    if (checkout.status === "LUNAS") {
      return res.status(400).json({ message: "Checkout ini sudah lunas" });
    }

    // Kalau checkout ini sudah punya tagihan yang belum dibayar, pakai yang lama saja
    const existing = await Payment.findOne({ checkout: checkout._id, status: "PENDING" });
    if (existing) {
      return res.status(200).json({ data: existing });
    }

    // ===== Simpan tagihan ke collection payments =====
    const payment = await Payment.create({
      checkout: checkout._id,
      externalId: `CAFEPINTAR-${Date.now()}`,
      customer: { name, email, phone },
      shippingAddress: address,
      note,
      itemsTotal: checkout.total,
      shippingFee: SHIPPING_FEE,
      amount: checkout.total + SHIPPING_FEE,
      paymentMethod: method,
      status: "PENDING",
    });

    checkout.status = "MENUNGGU_PEMBAYARAN";
    await checkout.save();

    return res.status(201).json({ data: payment });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
}
