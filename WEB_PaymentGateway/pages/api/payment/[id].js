import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Payment from "@/models/Payment";
import "@/models/Checkout";

// GET /api/payment/:id -> detail tagihan + status (dipakai halaman invoice untuk polling)
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  const { id } = req.query;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "ID pembayaran tidak valid" });
  }

  try {
    await dbConnect();
    const payment = await Payment.findById(id).populate("checkout").select("-webhookPayload");
    if (!payment) return res.status(404).json({ message: "Tagihan tidak ditemukan" });
    return res.status(200).json({ data: payment });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
