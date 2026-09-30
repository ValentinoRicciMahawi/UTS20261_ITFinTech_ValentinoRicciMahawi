import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import seedProducts from "@/lib/seedData";

// GET /api/seed -> reset & isi ulang data produk
export default async function handler(req, res) {
  try {
    await dbConnect();
    await Product.deleteMany({});
    const inserted = await Product.insertMany(seedProducts);
    return res.status(200).json({ message: "Seed produk berhasil", total: inserted.length });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
