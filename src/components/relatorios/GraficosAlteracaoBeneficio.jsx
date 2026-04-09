import { useState } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Sector
} from "recharts";
import { X } from "lucide-react";

const STATUS_CORES = {
  "Ativo": "#10b981",
  "Suspenso": "#f59e0b",
  "Cancelado": "#ef4444",
  "Em Análise": "#3b82f6",
  "Aguardando": "#94a3b8",
};

// Pizza ativa com highlight
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  return (
    <g>
      <text x={cx} y={cy - 10} textAnchor="middle" fill={fill} className="text-sm font-bold" fontSize={13}>
        {payload.name}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#475569" fontSize={12}>
        {value} ({(percent * 100).toFixed(1)}%)
      </text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8}
        startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} innerRadius={outerRadius + 12} outerRadius={outerRadius + 16}
        startAngle={startAngle} endAngle={endAngle} fill={fill} />
    </g>
  );
};

const TooltipBar = ({ active, payload, label, total }) => {
  if (active && payload?.length) {
    const pct = total > 0 ? ((payload[0].value / total) * 100).toFixed(1) : 0;
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs max-w-[200px]">
        <p className="font-semibold text-slate-700 mb-1 break-words">{label || payload[0].payload.fullName}</p>
        <p className="text-sky-600">Total: <strong>{payload[0].value}</strong></p>
        <p className="text-slate-400">{pct}% do total</p>
        <p className="text-slate-400 mt-1 italic">Clique para filtrar</p>
      </div>
    );
  }
  return null;
};

const TooltipMes = ({ active, payload, label, total }) => {
  if (active && payload?.length) {
    const pct = total > 0 ? ((payload[0].value / total) * 100).toFixed(1) : 0;
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs">
        <p className="font-semibold text-slate-700 mb-1">{label}</p>
        <p className="text-indigo-600">Alterações: <strong>{payload[0].value}</strong></p>
        <p className="text-slate-400">{pct}% do período</p>
        <p className="text-slate-400 mt-1 italic">Clique para filtrar</p>
      </div>
    );
  }
  return null;
};

export default function GraficosAlteracaoBeneficio({ dados, filtroAtivo, onFiltroChange }) {
  const [activeIndex, setActiveIndex] = useState(null);

  const total = dados.length;

  const pizzaStatus = Object.entries(
    dados.reduce((acc, r) => {
      const s = r.status_novo || "Outros";
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const barMotivos = Object.entries(
    dados.reduce((acc, r) => {
      const m = r.motivo_alteracao || "Outros";
      acc[m] = (acc[m] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, value]) => ({
      name: name.length > 22 ? name.substring(0, 20) + "…" : name,
      fullName: name,
      value
    }))
    .sort((a, b) => b.value - a.value);

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

  const handlePizzaClick = (_, index) => {
    const status = pizzaStatus[index]?.name;
    if (!status) return;
    if (filtroAtivo?.tipo === "status" && filtroAtivo?.valor === status) {
      onFiltroChange(null);
      setActiveIndex(null);
    } else {
      onFiltroChange({ tipo: "status", valor: status, label: `Status: ${status}` });
      setActiveIndex(index);
    }
  };

  const handleMotivoClick = (data) => {
    if (!data?.activePayload?.[0]) return;
    const motivo = data.activePayload[0].payload.fullName;
    if (filtroAtivo?.tipo === "motivo" && filtroAtivo?.valor === motivo) {
      onFiltroChange(null);
    } else {
      onFiltroChange({ tipo: "motivo", valor: motivo, label: `Motivo: ${motivo}` });
    }
  };

  const handleMesClick = (data) => {
    if (!data?.activePayload?.[0]) return;
    const mes = data.activePayload[0].payload.name;
    if (filtroAtivo?.tipo === "mes" && filtroAtivo?.valor === mes) {
      onFiltroChange(null);
    } else {
      onFiltroChange({ tipo: "mes", valor: mes, label: `Mês: ${mes}` });
    }
  };

  if (dados.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Chip de filtro ativo pelo gráfico */}
      {filtroAtivo && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Filtro pelo gráfico:</span>
          <span className="inline-flex items-center gap-1.5 bg-sky-100 text-sky-700 text-xs font-medium px-3 py-1 rounded-full">
            {filtroAtivo.label}
            <button onClick={() => { onFiltroChange(null); setActiveIndex(null); }}
              className="hover:text-sky-900 ml-0.5">
              <X size={11} />
            </button>
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pizza status */}
        <div className={`bg-white border rounded-xl p-4 shadow-sm transition-all ${filtroAtivo?.tipo === "status" ? "border-sky-400 ring-1 ring-sky-300" : "border-slate-200"}`}>
          <p className="text-sm font-semibold text-slate-700 mb-1">Distribuição por Status</p>
          <p className="text-xs text-slate-400 mb-2">Clique em uma fatia para filtrar</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pizzaStatus}
                cx="50%" cy="50%"
                innerRadius={52} outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                activeIndex={filtroAtivo?.tipo === "status" ? pizzaStatus.findIndex(p => p.name === filtroAtivo.valor) : activeIndex}
                activeShape={renderActiveShape}
                onClick={handlePizzaClick}
                style={{ cursor: "pointer" }}
              >
                {pizzaStatus.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={STATUS_CORES[entry.name] || "#94a3b8"}
                    opacity={filtroAtivo?.tipo === "status" && filtroAtivo?.valor !== entry.name ? 0.35 : 1}
                  />
                ))}
              </Pie>
              <Tooltip content={({ active, payload }) => {
                if (active && payload?.length) {
                  const pct = total > 0 ? ((payload[0].value / total) * 100).toFixed(1) : 0;
                  return (
                    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs">
                      <p className="font-semibold" style={{ color: STATUS_CORES[payload[0].name] || "#94a3b8" }}>{payload[0].name}</p>
                      <p className="text-slate-700">Total: <strong>{payload[0].value}</strong></p>
                      <p className="text-slate-400">{pct}% do total filtrado</p>
                      <p className="text-slate-400 mt-1 italic">Clique para filtrar tabela</p>
                    </div>
                  );
                }
                return null;
              }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center">
            {pizzaStatus.map((e, i) => (
              <button key={i}
                onClick={() => handlePizzaClick(null, i)}
                className={`flex items-center gap-1 text-xs transition-opacity ${filtroAtivo?.tipo === "status" && filtroAtivo?.valor !== e.name ? "opacity-40" : "opacity-100"}`}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_CORES[e.name] || "#94a3b8" }} />
                <span className="text-slate-600">{e.name}: {e.value}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Barras motivos */}
        <div className={`bg-white border rounded-xl p-4 shadow-sm transition-all ${filtroAtivo?.tipo === "motivo" ? "border-sky-400 ring-1 ring-sky-300" : "border-slate-200"}`}>
          <p className="text-sm font-semibold text-slate-700 mb-1">Alterações por Motivo</p>
          <p className="text-xs text-slate-400 mb-2">Clique em uma barra para filtrar</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barMotivos} layout="vertical" margin={{ left: 8, right: 20 }} onClick={handleMotivoClick} style={{ cursor: "pointer" }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={115} />
              <Tooltip content={<TooltipBar total={total} />} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Total">
                {barMotivos.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={filtroAtivo?.tipo === "motivo" && filtroAtivo?.valor !== entry.fullName ? "#cbd5e1" : "#0ea5e9"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Barras por mês */}
        <div className={`bg-white border rounded-xl p-4 shadow-sm transition-all ${filtroAtivo?.tipo === "mes" ? "border-sky-400 ring-1 ring-sky-300" : "border-slate-200"}`}>
          <p className="text-sm font-semibold text-slate-700 mb-1">Alterações por Mês</p>
          <p className="text-xs text-slate-400 mb-2">Clique em uma barra para filtrar</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barMes} margin={{ left: 0, right: 8 }} onClick={handleMesClick} style={{ cursor: "pointer" }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip content={<TooltipMes total={total} />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Alterações">
                {barMes.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={filtroAtivo?.tipo === "mes" && filtroAtivo?.valor !== entry.name ? "#c7d2fe" : "#6366f1"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}