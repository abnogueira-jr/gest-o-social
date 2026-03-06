import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { mes: "Out", valor: 2100000 },
  { mes: "Nov", valor: 2350000 },
  { mes: "Dez", valor: 2280000 },
  { mes: "Jan", valor: 2520000 },
  { mes: "Fev", valor: 2690000 },
  { mes: "Mar", valor: 2847320 }
];

const fmt = (v) => `R$ ${(v / 1000000).toFixed(1)}M`;

export default function GraficoEvolucaoPagamentos() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Evolução de Pagamentos — Últimos 6 Meses</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="mes" tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <YAxis tickFormatter={fmt} tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <Tooltip formatter={(v) => [`R$ ${v.toLocaleString("pt-BR")}`, "Valor"]} />
          <Line type="monotone" dataKey="valor" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: "#10b981" }} name="Pagamentos" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}