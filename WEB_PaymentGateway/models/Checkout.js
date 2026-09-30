import mongoose from "mongoose";

// Item yang disimpan di dalam checkout (snapshot harga saat checkout)
const CheckoutItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: String,
    image: String,
    price: Number,
    quantity: { type: Number, min: 1 },
    subtotal: Number,
  },
  { _id: false }
);

const CheckoutSchema = new mongoose.Schema(
  {
    items: [CheckoutItemSchema],
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
    // PENDING = baru dibuat, MENUNGGU_PEMBAYARAN = invoice sudah dibuat,
    // LUNAS = sudah dibayar, KEDALUWARSA = invoice expired
    status: {
      type: String,
      enum: ["PENDING", "MENUNGGU_PEMBAYARAN", "LUNAS", "KEDALUWARSA"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Checkout || mongoose.model("Checkout", CheckoutSchema);
