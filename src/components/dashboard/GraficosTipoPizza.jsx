import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const dadosPeriodo = {
  "Mar/26": {
    tipoFamilia: [
      { name: "Família Solo", value: 2840 },
      { name: "Com Crianças", value: 2210 },
      { name: "Com Idosos", value: 1650 },
      { name: "Com Deficientes", value: 980 },
      { name: "Com Gestantes", value: 430 },
    ],
    situacaoCadastral: [
      { name: "Ativo", value: 6120 },
      { name: "Pendente", value: 1430 },
      { name: "Suspenso", value: 820 },
      { name: "Inativo", value: 410 },
      { name: "Cancelado", value: 154 },
    ],
    statusBeneficio: [
      { name: "Ativo", value: 7218 },
      { name: "Em Análise", value: 892 },
      { name: "Aguardando", value: 445 },
      { name: "Suspenso", value: 310 },
      { name: "Cancelado", value: 69 },
    ],
  },
  "Fev/26": {
    tipoFamilia: [
      { name: "Família Solo", value: 2710 },
      { name: "Com Crianças", value: 2180 },
      { name: "Com Idosos", value: 1590 },
      { name: "Com Deficientes", value: 940 },
      { name: "Com Gestantes", value: 410 },
    ],
    situacaoCadastral: [
      { name: "Ativo", value: 5890 },
      { name: "Pendente", value: 1520 },
      { name: "Suspenso", value: 780 },
      { name: "Inativo", value: 390 },
      { name: "Cancelado", value: 130 },
    ],
    statusBeneficio: [
      { name: "Ativo", value: 6940 },
      { name: "Em Análise", value: 920 },
      { name: "Aguardando", value: 480 },
      { name: "Suspenso", value: 290 },
      { name: "Cancelado", value: 80 },
    ],
  },
};

const COLORS1 = ["#0ea5e9", "#8b5cf6", "#f59e0b", "#10b981", "#f43f5e"];
const COLORS2 = ["#10b981", "#f59e0b", "#f97316", "#6366f1", "#ef4444"];
const COLORS3 = ["#0ea5e9", "#6366f1", "#f59e0b", "#f97316", "#ef4444"];

const periodos = ["Mar/26", "Fev/26"];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const total = payload[0].payload.value;
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
        <p className="font-semibold text-slate-700">{payload[0].name}</p>
        <p style={{ color: payload[0].payload.fill }}>
          {total.toLocaleString("pt-BR")} famílias
        </p>
      </div>
    );
  }
  return null;
};

function PizzaCard({ title, data, colors, periodo, onPeriodo }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        <div className="flex gap-1">
          {periodos.map((p) => (
            <button
              key={p}
              onClick={() => onPeriodo(p)}
              className={`text-xs px-2 py-1 rounded border transition-all ${
                periodo === p
                  ? "bg-sky-500 text-white border-sky-500"
                  : "bg-white text-slate-500 border-slate-200 hover:border-sky-300"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-slate-400 mb-2">Total: <span className="font-semibold text-slate-600">{total.toLocaleString("pt-BR")}</span></p>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            outerRadius={65}
            innerRadius={30}
            dataKey="value"
            paddingAngle={2}
          >
            {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 10 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function GraficosTipoPizza() {
  const [p1, setP1] = useState("Mar/26");
  const [p2, setP2] = useState("Mar/26");
  const [p3, setP3] = useState("Mar/26");

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <PizzaCard title="Tipo de Família" data={dadosPeriodo[p1].tipoFamilia} colors={COLORS1} periodo={p1} onPeriodo={setP1} />
      <PizzaCard title="Situação Cadastral" data={dadosPeriodo[p2].situacaoCadastral} colors={COLORS2} periodo={p2} onPeriodo={setP2} />
      <PizzaCard title="Status do Benefício" data={dadosPeriodo[p3].statusBeneficio} colors={COLORS3} periodo={p3} onPeriodo={setP3} />
    </div>
  );
}