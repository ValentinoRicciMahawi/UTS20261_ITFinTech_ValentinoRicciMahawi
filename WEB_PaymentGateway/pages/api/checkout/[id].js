import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Checkout from "@/models/Checkout";

// GET /api/checkout/:id
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  const { id } = req.query;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "ID checkout tidak valid" });
  }

  try {
    await dbConnect();
    const checkout = await Checkout.findById(id);
    if (!checkout) return res.status(404).json({ message: "Checkout tidak ditemukan" });
    return res.status(200).json({ data: checkout });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
