export const formatStatus = (status) => {
  if (!status) return "Todos";
  const s = String(status).toLowerCase().trim();

  // canonicalize to underscore-separated key
  const key = s.replace(/\s+/g, "_");

  const translations = {
    pending: "Pendiente",
    paid: "Pagado",
    submitted: "Enviado",
    processing: "En proceso",
    approved: "Aprobado",
    rejected: "Rechazado",
    cancelled: "Cancelado",
    failed: "Fallido",
    in_review: "En Revisión",
    under_review: "En Revisión",
    in_process: "En proceso",
    all: "Todos",
  };

  if (translations[key]) return translations[key];

  // fallback: humanize (capitalize words)
  return key
    .split(/[_\-\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};