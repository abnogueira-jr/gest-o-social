import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend
} from "recharts";

const dadosPeriodo = {
  "Mar/26": {
    semPrograma: [
      { faixa: "Extrema Pobreza", familias: 1240 },
      { faixa: "Pobreza", familias: 890 },
      { faixa: "Baixa Renda", familias: 620 },
    ],
    comPrograma: [
      { name: "Extrema Pobreza", value: 3180 },
      { name: "Pobreza", value: 2760 },
      { name: "Baixa Renda", value: 2994 },
    ],
  },
  "Fev/26": {
    semPrograma: [
      { faixa: "Extrema Pobreza", familias: 1380 },
      { faixa: "Pobreza", familias: 970 },
      { faixa: "Baixa Renda", familias: 710 },
    ],
    comPrograma: [
      { name: "Extrema Pobreza", value: 3020 },
      { name: "Pobreza", value: 2610 },
      { name: "Baixa Renda", value: 2890 },
    ],
  },
  "Jan/26": {
    semPrograma: [
      { faixa: "Extrema Pobreza", familias: 1520 },
      { faixa: "Pobreza", familias: 1040 },
      { faixa: "Baixa Renda", familias: 790 },
    ],
    comPrograma: [
      { name: "Extrema Pobreza", value: 2870 },
      { name: "Pobreza", value: 2430 },
      { name: "Baixa Renda", value: 2680 },
    ],
  },
};

const BAR_COLORS = ["#ef4444", "#f97316", "#f59e0b"];
const PIE_COLORS = ["#ef4444", "#f97316", "#f59e0b"];
const periodos = ["Mar/26", "Fev/26", "Jan/26"];

function FiltroMes({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {periodos.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`text-xs px-2 py-1 rounded border transition-all ${
            value === p
              ? "bg-slate-800 text-white border-slate-800"
              : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

const BarTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
        <p className="font-semibold text-slate-700">{label}</p>
        <p className="text-red-500">Famílias: <span className="font-bold">{payload[0].value.toLocaleString("pt-BR")}</span></p>
      </div>
    );
  }
  return null;
};

export default function GraficosPorRenda() {
  const [p1, setP1] = useState("Mar/26");
  const [p2, setP2] = useState("Mar/26");

  const d1 = dadosPeriodo[p1];
  const d2 = dadosPeriodo[p2];
  const totalSem = d1.semPrograma.reduce((s, d) => s + d.familias, 0);
  const totalCom = d2.comPrograma.reduce((s, d) => s + d.value, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Sem Programas - Barras */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">
              Famílias <span className="text-red-500">sem</span> Programas Sociais
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Total: <span className="font-semibold text-red-500">{totalSem.toLocaleString("pt-BR")}</span></p>
          </div>
          <FiltroMes value={p1} onChange={setP1} />
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={d1.semPrograma} barSize={48} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="faixa" tick={{ fontSize: 10 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
            <Tooltip content={<BarTooltip />} />
            <Bar dataKey="familias" name="Famílias" radius={[6, 6, 0, 0]}>
              {d1.semPrograma.map((_, i) => <Cell key={i} fill={BAR_COLORS[i]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Com Programas - Pizza */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">
              Famílias <span className="text-emerald-500">com</span> Programas Sociais
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Total: <span className="font-semibold text-emerald-600">{totalCom.toLocaleString("pt-BR")}</span></p>
          </div>
          <FiltroMes value={p2} onChange={setP2} />
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={d2.comPrograma}
              cx="50%"
              cy="45%"
              outerRadius={70}
              innerRadius={30}
              dataKey="value"
              paddingAngle={3}
            >
              {d2.comPrograma.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
            </Pie>
            <Tooltip formatter={(v, n) => [v.toLocaleString("pt-BR"), n]} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}