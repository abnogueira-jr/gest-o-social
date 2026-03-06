import { Users, Search, TrendingUp, CreditCard } from "lucide-react";

const cards = [
  {
    label: "Potenciais na Busca Ativa",
    value: "1.247",
    icon: Search,
    color: "bg-amber-500",
    light: "bg-amber-50",
    text: "text-amber-600",
    change: "+12% este mês"
  },
  {
    label: "Total de Beneficiários",
    value: "8.934",
    icon: Users,
    color: "bg-sky-500",
    light: "bg-sky-50",
    text: "text-sky-600",
    change: "+3% este mês"
  },
  {
    label: "Total Pagos no Mês",
    value: "R$ 2.847.320",
    icon: TrendingUp,
    color: "bg-emerald-500",
    light: "bg-emerald-50",
    text: "text-emerald-600",
    change: "+8% vs. mês anterior"
  },
  {
    label: "Cartões Ativos",
    value: "7.218",
    icon: CreditCard,
    color: "bg-violet-500",
    light: "bg-violet-50",
    text: "text-violet-600",
    change: "81% do total"
  }
];

export default function KpiCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl ${c.light} flex items-center justify-center flex-shrink-0`}>
            <c.icon size={22} className={c.text} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 truncate">{c.label}</p>
            <p className="text-xl font-bold text-slate-800 leading-tight">{c.value}</p>
            <p className={`text-xs ${c.text} font-medium`}>{c.change}</p>
          </div>
        </div>
      ))}
    </div>
  );
}