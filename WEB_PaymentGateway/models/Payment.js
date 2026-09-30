import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    checkout: { type: mongoose.Schema.Types.ObjectId, ref: "Checkout", required: true },
    externalId: { type: String, required: true, unique: true }, // dikirim ke Xendit
    // data pelanggan & alamat pengiriman
    customer: {
      name: String,
      email: String,
      phone: String,
    },
    shippingAddress: { type: String, required: true },
    note: String,
    // rincian biaya
    itemsTotal: Number, // subtotal + pajak dari checkout
    shippingFee: Number,
    amount: { type: Number, required: true }, // total yang ditagih
    paymentMethod: { type: String, enum: ["CARD", "QRIS", "OTHER"], default: "CARD" },
    // data dari payment gateway Xendit (diisi di tahap integrasi Xendit)
    xenditInvoiceId: String,
    invoiceUrl: String,
    expiryDate: Date,
    status: {
      type: String,
      enum: ["PENDING", "LUNAS", "KEDALUWARSA"],
      default: "PENDING",
    },
    paidAt: Date,
    paymentChannel: String, // contoh: BCA, OVO, QRIS, CREDIT_CARD
    webhookPayload: Object, // callback terakhir dari Xendit (untuk debugging)
  },
  { timestamps: true }
);

export default mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
