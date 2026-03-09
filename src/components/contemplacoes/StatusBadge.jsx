const cores = {
  "Rascunho":           "bg-slate-100 text-slate-600",
  "Pendente Aprovação": "bg-amber-100 text-amber-700",
  "Aprovado":           "bg-emerald-100 text-emerald-700",
  "Reprovado":          "bg-red-100 text-red-700",
  "Suspenso":           "bg-orange-100 text-orange-700",
  "Cancelado":          "bg-slate-200 text-slate-500",
  "Encerrado":          "bg-slate-100 text-slate-500",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${cores[status] || "bg-slate-100 text-slate-600"}`}>
      {status || "—"}
    </span>
  );
}