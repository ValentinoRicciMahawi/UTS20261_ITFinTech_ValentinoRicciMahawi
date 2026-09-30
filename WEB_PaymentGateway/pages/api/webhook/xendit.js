import dbConnect from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Checkout from "@/models/Checkout";

/**
 * POST /api/webhook/xendit
 *
 * Endpoint ini didaftarkan di Dashboard Xendit:
 *   Settings > Webhooks > Invoices > "Invoice paid"
 *   URL: https://<domain-vercel-atau-ngrok>/api/webhook/xendit
 *
 * Xendit akan mengirim callback ketika status invoice berubah (PAID / EXPIRED).
 * Contoh body:
 * {
 *   "id": "579c8d61f23fa4ca35e52da4",
 *   "external_id": "CAFEPINTAR-1727600000000",
 *   "status": "PAID",
 *   "amount": 71000,
 *   "paid_amount": 71000,
 *   "paid_at": "2026-09-29T10:00:00.000Z",
 *   "payment_method": "BANK_TRANSFER",
 *   "payment_channel": "BCA"
 * }
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // 1. Verifikasi token supaya request benar-benar dari Xendit
  const token = req.headers["x-callback-token"];
  if (process.env.XENDIT_CALLBACK_TOKEN && token !== process.env.XENDIT_CALLBACK_TOKEN) {
    console.warn("[Webhook Xendit] callback token tidak valid");
    return res.status(401).json({ message: "Invalid callback token" });
  }

  try {
    await dbConnect();
    const body = req.body || {};
    console.log("[Webhook Xendit] diterima:", body.external_id, body.status);

    // 2. Cari data pembayaran berdasarkan external_id / invoice id
    const payment = await Payment.findOne({
      $or: [{ externalId: body.external_id }, { xenditInvoiceId: body.id }],
    });

    if (!payment) {
      // Tetap balas 200 (misalnya saat "Test webhook" dari dashboard) agar Xendit tidak retry terus
      return res.status(200).json({ message: "Payment tidak ditemukan, diabaikan" });
    }

    // 3. Update status sesuai callback
    const status = String(body.status || "").toUpperCase();
    if (status === "PAID" || status === "SETTLED") {
      payment.status = "LUNAS";
      payment.paidAt = body.paid_at ? new Date(body.paid_at) : new Date();
      payment.paymentChannel = body.payment_channel || body.payment_method || "-";
      await Checkout.findByIdAndUpdate(payment.checkout, { status: "LUNAS" });
    } else if (status === "EXPIRED") {
      payment.status = "KEDALUWARSA";
      await Checkout.findByIdAndUpdate(payment.checkout, { status: "KEDALUWARSA" });
    }

    payment.webhookPayload = body;
    await payment.save();

    return res.status(200).json({ message: "OK", status: payment.status });
  } catch (err) {
    console.error("[Webhook Xendit] error:", err);
    return res.status(500).json({ message: err.message });
  }
}
