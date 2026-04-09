import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";

const STATUS_CORES = {
  "Ativo": "#10b981",
  "Suspenso": "#f59e0b",
  "Cancelado": "#ef4444",
  "Em Análise": "#3b82f6",
  "Aguardando": "#94a3b8",
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow px-3 py-2 text-xs">
        {label && <p className="font-semibold text-slate-700 mb-0.5">{label}</p>}
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.fill || p.color }}>{p.name}: <strong>{p.value}</strong></p>
        ))}
      </div>
    );
  }
  return null;
};

export default function GraficosAlteracoes() {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.AlteracaoBeneficio.list("-data_hora_alteracao", 200)
      .then(d => { setDados(d); setLoading(false); });
  }, []);

  if (loading || dados.length === 0) return null;

  const pizzaStatus = Object.entries(
    dados.reduce((acc, r) => { acc[r.status_novo || "Outros"] = (acc[r.status_novo || "Outros"] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const barMes = Object.entries(
    dados.reduce((acc, r) => {
      if (!r.data_hora_alteracao) return acc;
      const d = new Date(r.data_hora_alteracao);
      const key = `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => {
      const [ma, ya] = a.name.split("/");
      const [mb, yb] = b.name.split("/");
      return new Date(`${ya}-${ma}`) - new Date(`${yb}-${mb}`);
    })
    .slice(-6);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {/* Barras por mês */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-700 mb-3">Alterações de Benefício por Mês</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barMes}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} name="Alterações" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pizza status */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-700 mb-3">Status dos Benefícios Alterados</p>
        <div className="flex items-center gap-4">
          <ResponsiveContainer width="55%" height={200}>
            <PieChart>
              <Pie data={pizzaStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {pizzaStatus.map((entry, i) => (
                  <Cell key={i} fill={STATUS_CORES[entry.name] || "#94a3b8"} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-2">
            {pizzaStatus.map((e, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_CORES[e.name] || "#94a3b8" }} />
                  <span className="text-slate-600">{e.name}</span>
                </div>
                <span className="font-semibold text-slate-800">{e.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}