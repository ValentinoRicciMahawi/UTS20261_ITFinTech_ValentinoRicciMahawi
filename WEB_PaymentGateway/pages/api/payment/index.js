import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Checkout from "@/models/Checkout";
import Payment from "@/models/Payment";
import { createInvoice, PAYMENT_METHODS } from "@/lib/xendit";
import { SHIPPING_FEE } from "@/lib/config";

function getBaseUrl(req) {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, "");
  const proto = req.headers["x-forwarded-proto"] || "http";
  return `${proto}://${req.headers.host}`;
}

// GET  /api/payment        -> daftar semua pembayaran (riwayat pesanan)
// POST /api/payment        -> buat Payment + Invoice Xendit dari sebuah checkout
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
    const method = PAYMENT_METHODS[paymentMethod] ? paymentMethod : "CARD";

    const checkout = await Checkout.findById(checkoutId);
    if (!checkout) return res.status(404).json({ message: "Checkout tidak ditemukan" });
    if (checkout.status === "LUNAS") {
      return res.status(400).json({ message: "Checkout ini sudah lunas" });
    }

    // Kalau checkout ini sudah punya tagihan yang masih aktif, pakai yang lama saja
    const existing = await Payment.findOne({ checkout: checkout._id, status: "PENDING" });
    if (existing && existing.expiryDate && existing.expiryDate > new Date()) {
      return res.status(200).json({ data: existing });
    }

    const amount = checkout.total + SHIPPING_FEE;
    const externalId = `CAFEPINTAR-${Date.now()}`;
    const baseUrl = getBaseUrl(req);

    const payment = new Payment({
      checkout: checkout._id,
      externalId,
      customer: { name, email, phone },
      shippingAddress: address,
      note,
      itemsTotal: checkout.total,
      shippingFee: SHIPPING_FEE,
      amount,
      paymentMethod: method,
      status: "PENDING",
    });

    // ===== Buat invoice di Xendit =====
    const invoice = await createInvoice({
      external_id: externalId,
      amount,
      currency: "IDR",
      payer_email: email,
      description: `Pembayaran pesanan Cafe Pintar (${externalId})`,
      invoice_duration: 86400, // 24 jam
      customer: {
        given_names: name,
        email,
        mobile_number: phone,
      },
      items: [
        ...checkout.items.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          category: "Food & Beverage",
        })),
      ],
      fees: [
        { type: "Pajak Resto (PB1) 10%", value: checkout.tax },
        { type: "Ongkos Kirim", value: SHIPPING_FEE },
      ],
      payment_methods: PAYMENT_METHODS[method].xendit,
      success_redirect_url: `${baseUrl}/invoice/${payment._id}`,
      failure_redirect_url: `${baseUrl}/invoice/${payment._id}`,
    });

    payment.xenditInvoiceId = invoice.id;
    payment.invoiceUrl = invoice.invoice_url;
    payment.expiryDate = invoice.expiry_date;
    await payment.save();

    checkout.status = "MENUNGGU_PEMBAYARAN";
    await checkout.save();

    return res.status(201).json({ data: payment });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
}
