import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell
} from "recharts";

const dadosPeriodo = {
  "6m": [
    { mes: "Out/25", valor: 2100000, beneficiarios: 7820 },
    { mes: "Nov/25", valor: 2350000, beneficiarios: 8100 },
    { mes: "Dez/25", valor: 2280000, beneficiarios: 8050 },
    { mes: "Jan/26", valor: 2520000, beneficiarios: 8340 },
    { mes: "Fev/26", valor: 2690000, beneficiarios: 8710 },
    { mes: "Mar/26", valor: 2847320, beneficiarios: 8934 },
  ],
  "12m": [
    { mes: "Abr/25", valor: 1820000, beneficiarios: 6900 },
    { mes: "Mai/25", valor: 1950000, beneficiarios: 7100 },
    { mes: "Jun/25", valor: 1880000, beneficiarios: 7050 },
    { mes: "Jul/25", valor: 2020000, beneficiarios: 7280 },
    { mes: "Ago/25", valor: 2150000, beneficiarios: 7450 },
    { mes: "Set/25", valor: 2080000, beneficiarios: 7600 },
    { mes: "Out/25", valor: 2100000, beneficiarios: 7820 },
    { mes: "Nov/25", valor: 2350000, beneficiarios: 8100 },
    { mes: "Dez/25", valor: 2280000, beneficiarios: 8050 },
    { mes: "Jan/26", valor: 2520000, beneficiarios: 8340 },
    { mes: "Fev/26", valor: 2690000, beneficiarios: 8710 },
    { mes: "Mar/26", valor: 2847320, beneficiarios: 8934 },
  ],
  "3m": [
    { mes: "Jan/26", valor: 2520000, beneficiarios: 8340 },
    { mes: "Fev/26", valor: 2690000, beneficiarios: 8710 },
    { mes: "Mar/26", valor: 2847320, beneficiarios: 8934 },
  ],
};

const fmtValor = (v) => `R$ ${(v / 1000000).toFixed(1)}M`;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs space-y-1">
        <p className="font-semibold text-slate-700">{label}</p>
        {payload.map((p) => (
          <p key={p.dataKey} style={{ color: p.color }}>
            {p.name}: <span className="font-bold">
              {p.dataKey === "valor"
                ? `R$ ${p.value.toLocaleString("pt-BR")}`
                : p.value.toLocaleString("pt-BR")}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const periodos = [
  { key: "3m", label: "3 meses" },
  { key: "6m", label: "6 meses" },
  { key: "12m", label: "12 meses" },
];

const visoes = [
  { key: "linha", label: "Linha" },
  { key: "barra", label: "Barra" },
];

export default function GraficoEvolucaoPagamentos() {
  const [periodo, setPeriodo] = useState("6m");
  const [visao, setVisao] = useState("linha");
  const data = dadosPeriodo[periodo];

  const variacaoPct = data.length >= 2
    ? (((data[data.length - 1].valor - data[0].valor) / data[0].valor) * 100).toFixed(1)
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Evolução de Pagamentos</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Variação: <span className={`font-semibold ${variacaoPct >= 0 ? "text-emerald-600" : "text-red-500"}`}>
              {variacaoPct >= 0 ? "+" : ""}{variacaoPct}%
            </span> no período
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="flex gap-1">
            {visoes.map((v) => (
              <button
                key={v.key}
                onClick={() => setVisao(v.key)}
                className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                  visao === v.key
                    ? "bg-emerald-500 text-white border-emerald-500 font-medium"
                    : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {periodos.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriodo(p.key)}
                className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                  periodo === p.key
                    ? "bg-slate-800 text-white border-slate-800 font-medium"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        {visao === "linha" ? (
          <LineChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="mes" tick={{ fontSize: 10 }} stroke="#94a3b8" />
            <YAxis yAxisId="left" tickFormatter={fmtValor} tick={{ fontSize: 10 }} stroke="#94a3b8" />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} stroke="#94a3b8" />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            <Line yAxisId="left" type="monotone" dataKey="valor" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: "#10b981" }} name="Valor (R$)" />
            <Line yAxisId="right" type="monotone" dataKey="beneficiarios" stroke="#6366f1" strokeWidth={2} dot={{ r: 3, fill: "#6366f1" }} name="Beneficiários" strokeDasharray="5 3" />
          </LineChart>
        ) : (
          <BarChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }} barSize={24}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="mes" tick={{ fontSize: 10 }} stroke="#94a3b8" />
            <YAxis tickFormatter={fmtValor} tick={{ fontSize: 10 }} stroke="#94a3b8" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="valor" name="Valor (R$)" radius={[4, 4, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={i === data.length - 1 ? "#10b981" : "#6ee7b7"} />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}