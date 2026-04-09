import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";

const STATUS_CORES = {
  "Ativo": "#10b981",
  "Suspenso": "#f59e0b",
  "Cancelado": "#ef4444",
  "Em Análise": "#3b82f6",
  "Aguardando": "#94a3b8",
};

const MOTIVO_COR = "#0ea5e9";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-sm">
        {label && <p className="font-semibold text-slate-700 mb-1">{label}</p>}
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || p.fill }}>{p.name}: <strong>{p.value}</strong></p>
        ))}
      </div>
    );
  }
  return null;
};

export default function GraficosAlteracaoBeneficio({ dados }) {
  // Pizza: distribuição por novo status
  const pizzaStatus = Object.entries(
    dados.reduce((acc, r) => {
      const s = r.status_novo || "Outros";
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Barras: top motivos
  const barMotivos = Object.entries(
    dados.reduce((acc, r) => {
      const m = r.motivo_alteracao || "Outros";
      acc[m] = (acc[m] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, value]) => ({ name: name.length > 20 ? name.substring(0, 18) + "…" : name, fullName: name, value }))
    .sort((a, b) => b.value - a.value);

  // Barras: alterações por mês
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
    .slice(-12);

  if (dados.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Pizza status */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-700 mb-3">Distribuição por Status</p>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={pizzaStatus}
              cx="50%" cy="50%"
              innerRadius={50} outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {pizzaStatus.map((entry, i) => (
                <Cell key={i} fill={STATUS_CORES[entry.name] || "#94a3b8"} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-2 mt-1 justify-center">
          {pizzaStatus.map((e, i) => (
            <div key={i} className="flex items-center gap-1 text-xs text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: STATUS_CORES[e.name] || "#94a3b8" }} />
              {e.name}: {e.value}
            </div>
          ))}
        </div>
      </div>

      {/* Barras motivos */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-700 mb-3">Alterações por Motivo</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barMotivos} layout="vertical" margin={{ left: 8, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10 }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={110} />
            <Tooltip content={({ active, payload }) => {
              if (active && payload?.length) {
                return (
                  <div className="bg-white border border-slate-200 rounded-lg shadow px-3 py-2 text-xs">
                    <p className="font-semibold text-slate-700">{payload[0].payload.fullName}</p>
                    <p className="text-sky-600">Total: <strong>{payload[0].value}</strong></p>
                  </div>
                );
              }
              return null;
            }} />
            <Bar dataKey="value" fill={MOTIVO_COR} radius={[0, 4, 4, 0]} name="Total" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Barras por mês */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-700 mb-3">Alterações por Mês</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barMes} margin={{ left: 0, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} name="Alterações" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}