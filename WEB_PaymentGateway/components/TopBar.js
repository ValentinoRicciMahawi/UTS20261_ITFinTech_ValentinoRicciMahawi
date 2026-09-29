import { useRouter } from "next/router";

// Header dengan tombol Back (dipakai di halaman Checkout, Payment, Invoice)
export default function TopBar({ title, backTo, icon }) {
  const router = useRouter();
  const goBack = () => (backTo ? router.push(backTo) : router.back());

  return (
    <div className="topbar">
      <button className="back-btn" onClick={goBack}>
        &#8249; Back
      </button>
      <h1 className="topbar-title">
        {icon && <span className="topbar-icon">{icon}</span>}
        {title}
      </h1>
      <span style={{ width: 60 }} />
    </div>
  );
}
