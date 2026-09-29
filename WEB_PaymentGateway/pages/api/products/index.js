import products from "@/lib/seedData";

// GET /api/products?category=Makanan&q=nasi
// Tahap 1: data menu masih statis dari lib/seedData.js (belum pakai database)
export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { category, q } = req.query;
  let data = products.map((p, i) => ({ _id: String(i + 1), ...p }));

  if (category && category !== "Semua") {
    data = data.filter((p) => p.category === category);
  }
  if (q) {
    data = data.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  }

  return res.status(200).json({ data });
}
