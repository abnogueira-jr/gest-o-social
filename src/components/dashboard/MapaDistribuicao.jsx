import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from "recharts";

const dadosPeriodo = {
  "Mar/26": [
    { nome: "Norte", familias: 2840, pct: 32, hex: "#0ea5e9" },
    { nome: "Sul", familias: 1970, pct: 22, hex: "#10b981" },
    { nome: "Leste", familias: 1590, pct: 18, hex: "#8b5cf6" },
    { nome: "Oeste", familias: 1340, pct: 15, hex: "#f59e0b" },
    { nome: "Centro", familias: 890, pct: 10, hex: "#f43f5e" },
    { nome: "Rural", familias: 304, pct: 3, hex: "#94a3b8" },
  ],
  "Fev/26": [
    { nome: "Norte", familias: 2710, pct: 31, hex: "#0ea5e9" },
    { nome: "Sul", familias: 1920, pct: 22, hex: "#10b981" },
    { nome: "Leste", familias: 1550, pct: 18, hex: "#8b5cf6" },
    { nome: "Oeste", familias: 1280, pct: 15, hex: "#f59e0b" },
    { nome: "Centro", familias: 980, pct: 11, hex: "#f43f5e" },
    { nome: "Rural", familias: 270, pct: 3, hex: "#94a3b8" },
  ],
  "Jan/26": [
    { nome: "Norte", familias: 2580, pct: 31, hex: "#0ea5e9" },
    { nome: "Sul", familias: 1860, pct: 22, hex: "#10b981" },
    { nome: "Leste", familias: 1490, pct: 18, hex: "#8b5cf6" },
    { nome: "Oeste", familias: 1210, pct: 14, hex: "#f59e0b" },
    { nome: "Centro", familias: 1080, pct: 13, hex: "#f43f5e" },
    { nome: "Rural", familias: 120, pct: 2, hex: "#94a3b8" },
  ],
};

const periodos = ["Mar/26", "Fev/26", "Jan/26"];
const visoes = [{ key: "barra", label: "Barras" }, { key: "lista", label: "Lista" }];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
        <p className="font-semibold text-slate-700">{payload[0].payload.nome}</p>
        <p style={{ color: payload[0].fill }}>
          {payload[0].value.toLocaleString("pt-BR")} famílias ({payload[0].payload.pct}%)
        </p>
      </div>
    );
  }
  return null;
};

export default function MapaDistribuicao() {
  const [periodo, setPeriodo] = useState("Mar/26");
  const [visao, setVisao] = useState("lista");
  const data = dadosPeriodo[periodo];
  const total = data.reduce((s, d) => s + d.familias, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Distribuição Geográfica</h3>
          <p className="text-xs text-slate-400 mt-0.5">Total: <span className="font-semibold text-slate-600">{total.toLocaleString("pt-BR")}</span></p>
        </div>
        <div className="flex gap-1 flex-wrap">
          {visoes.map((v) => (
            <button
              key={v.key}
              onClick={() => setVisao(v.key)}
              className={`text-xs px-2 py-1 rounded border transition-all ${
                visao === v.key
                  ? "bg-violet-500 text-white border-violet-500"
                  : "bg-white text-slate-500 border-slate-200 hover:border-violet-300"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-1 mb-3">
        {periodos.map((p) => (
          <button
            key={p}
            onClick={() => setPeriodo(p)}
            className={`text-xs px-2 py-1 rounded border transition-all ${
              periodo === p
                ? "bg-slate-800 text-white border-slate-800"
                : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {visao === "barra" ? (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} barSize={28} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="nome" tick={{ fontSize: 10 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="familias" radius={[4, 4, 0, 0]}>
              {data.map((r, i) => <Cell key={i} fill={r.hex} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="space-y-2">
          {data.map((r) => (
            <div key={r.nome} className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: r.hex }} />
              <span className="text-xs text-slate-600 w-12">{r.nome}</span>
              <div className="flex-1 bg-slate-100 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ width: `${r.pct}%`, background: r.hex }}
                />
              </div>
              <span className="text-xs text-slate-500 w-16 text-right font-medium">{r.familias.toLocaleString("pt-BR")}</span>
              <span className="text-xs font-semibold w-7 text-right" style={{ color: r.hex }}>{r.pct}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}