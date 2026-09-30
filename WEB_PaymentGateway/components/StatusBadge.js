const LABEL = {
  PENDING: "Belum Dibayar",
  MENUNGGU_PEMBAYARAN: "Menunggu Pembayaran",
  LUNAS: "LUNAS",
  KEDALUWARSA: "Kedaluwarsa",
};

export default function StatusBadge({ status }) {
  return <span className={`status status-${(status || "").toLowerCase()}`}>{LABEL[status] || status}</span>;
}
