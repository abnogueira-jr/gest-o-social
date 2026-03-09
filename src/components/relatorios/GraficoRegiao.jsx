import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from "recharts";

const CORES = ["#0ea5e9","#10b981","#8b5cf6","#f59e0b","#f43f5e","#6366f1","#14b8a6","#f97316","#94a3b8"];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const taxa = d.total > 0 ? Math.round((d.Realizada / d.total) * 100) : 0;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-slate-700 mb-1">{d.regiao}</p>
      <p className="text-slate-600">Total: <strong>{d.total}</strong></p>
      <p className="text-emerald-600">Realizadas: <strong>{d.Realizada}</strong> ({taxa}%)</p>
      <p className="text-sky-600">Agendadas: <strong>{d.Agendada}</strong></p>
    </div>
  );
};

export default function GraficoRegiao({ dados }) {
  if (!dados.length) return (
    <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
      Sem dados para o período selecionado.
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={dados} barSize={32} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="regiao" tick={{ fontSize: 10, fill: "#94a3b8" }} />
        <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="total" radius={[4,4,0,0]}>
          {dados.map((entry, i) => <Cell key={i} fill={CORES[i % CORES.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}