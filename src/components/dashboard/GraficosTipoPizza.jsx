import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const tipoFamilia = [
  { name: "Família Solo", value: 2840 },
  { name: "Com Crianças", value: 2210 },
  { name: "Com Idosos", value: 1650 },
  { name: "Com Deficientes", value: 980 },
  { name: "Com Gestantes", value: 430 }
];

const situacaoCadastral = [
  { name: "Ativo", value: 6120 },
  { name: "Pendente", value: 1430 },
  { name: "Suspenso", value: 820 },
  { name: "Inativo", value: 410 },
  { name: "Cancelado", value: 154 }
];

const statusBeneficio = [
  { name: "Ativo", value: 7218 },
  { name: "Em Análise", value: 892 },
  { name: "Aguardando", value: 445 },
  { name: "Suspenso", value: 310 },
  { name: "Cancelado", value: 69 }
];

const COLORS1 = ["#0ea5e9", "#8b5cf6", "#f59e0b", "#10b981", "#f43f5e"];
const COLORS2 = ["#10b981", "#f59e0b", "#f97316", "#6366f1", "#ef4444"];
const COLORS3 = ["#0ea5e9", "#6366f1", "#f59e0b", "#f97316", "#ef4444"];

function PizzaCard({ title, data, colors }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="45%" outerRadius={70} dataKey="value" label={false}>
            {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
          </Pie>
          <Tooltip formatter={(v, n) => [v.toLocaleString("pt-BR"), n]} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function GraficosTipoPizza() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <PizzaCard title="Tipo de Família" data={tipoFamilia} colors={COLORS1} />
      <PizzaCard title="Situação Cadastral" data={situacaoCadastral} colors={COLORS2} />
      <PizzaCard title="Status do Benefício" data={statusBeneficio} colors={COLORS3} />
    </div>
  );
}