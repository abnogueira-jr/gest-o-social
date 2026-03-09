import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell
} from "recharts";

const CORES = ["#0ea5e9","#10b981","#8b5cf6","#f59e0b","#f43f5e","#6366f1","#14b8a6","#f97316"];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-slate-700 mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function GraficoTecnico({ dados }) {
  if (!dados.length) return (
    <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
      Sem dados para o período selecionado.
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={dados} barSize={28} margin={{ top: 5, right: 10, left: -15, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="tecnico"
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          angle={-25}
          textAnchor="end"
          interval={0}
        />
        <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 10, paddingTop: 8 }}
          iconType="circle"
          iconSize={8}
        />
        <Bar dataKey="Agendada"       fill="#0ea5e9" radius={[3,3,0,0]} />
        <Bar dataKey="Realizada"      fill="#10b981" radius={[3,3,0,0]} />
        <Bar dataKey="Não Localizada" fill="#f43f5e" radius={[3,3,0,0]} />
        <Bar dataKey="Cancelada"      fill="#94a3b8" radius={[3,3,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}