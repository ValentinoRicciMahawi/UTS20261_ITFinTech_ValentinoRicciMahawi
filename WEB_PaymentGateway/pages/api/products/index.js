import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import seedProducts from "@/lib/seedData";

// GET /api/products?category=Makanan&q=nasi
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await dbConnect();

    // Kalau database masih kosong, isi otomatis dengan data menu awal
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(seedProducts);
    }

    const { category, q } = req.query;
    const filter = { isAvailable: true };
    if (category && category !== "Semua") filter.category = category;
    if (q) filter.name = { $regex: q, $options: "i" };

    const products = await Product.find(filter).sort({ category: 1, name: 1 });
    return res.status(200).json({ data: products });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
}
