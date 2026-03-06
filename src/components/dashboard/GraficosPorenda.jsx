import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { PieChart, Pie, Legend } from "recharts";

const semPrograma = [
  { faixa: "Extrema Pobreza", familias: 1240 },
  { faixa: "Pobreza", familias: 890 },
  { faixa: "Baixa Renda", familias: 620 }
];

const comPrograma = [
  { name: "Extrema Pobreza", value: 3180 },
  { name: "Pobreza", value: 2760 },
  { name: "Baixa Renda", value: 2994 }
];

const BAR_COLORS = ["#ef4444", "#f97316", "#f59e0b"];
const PIE_COLORS = ["#ef4444", "#f97316", "#f59e0b"];

export default function GraficosPorRenda() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Famílias <span className="text-red-500">sem</span> Programas por Faixa</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={semPrograma} barSize={40}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="faixa" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <Tooltip />
            <Bar dataKey="familias" name="Famílias" radius={[4, 4, 0, 0]}>
              {semPrograma.map((_, i) => <Cell key={i} fill={BAR_COLORS[i]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Famílias <span className="text-emerald-500">com</span> Programas por Faixa</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={comPrograma} cx="50%" cy="45%" outerRadius={70} dataKey="value" label={false}>
              {comPrograma.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
            </Pie>
            <Tooltip formatter={(v, n) => [v.toLocaleString("pt-BR"), n]} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}