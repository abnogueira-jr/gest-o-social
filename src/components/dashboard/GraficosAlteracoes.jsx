import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Sector
} from "recharts";
import { X, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const STATUS_CORES = {
  "Ativo": "#10b981",
  "Suspenso": "#f59e0b",
  "Cancelado": "#ef4444",
  "Em Análise": "#3b82f6",
  "Aguardando": "#94a3b8",
};

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  return (
    <g>
      <text x={cx} y={cy - 10} textAnchor="middle" fill={fill} fontSize={12} fontWeight="600">{payload.name}</text>
      <text x={cx} y={cy + 8} textAnchor="middle" fill="#64748b" fontSize={11}>{value} ({(percent * 100).toFixed(1)}%)</text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 7}
        startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} innerRadius={outerRadius + 10} outerRadius={outerRadius + 14}
        startAngle={startAngle} endAngle={endAngle} fill={fill} />
    </g>
  );
};

export default function GraficosAlteracoes() {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroAtivo, setFiltroAtivo] = useState(null); // {tipo, valor, label}
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    base44.entities.AlteracaoBeneficio.list("-data_hora_alteracao", 300)
      .then(d => { setDados(d); setLoading(false); });
  }, []);

  if (loading || dados.length === 0) return null;

  const total = dados.length;

  const pizzaStatus = Object.entries(
    dados.reduce((acc, r) => { const s = r.status_novo || "Outros"; acc[s] = (acc[s] || 0) + 1; return acc; }, {})
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

  // Dados filtrados pelo filtro ativo
  const dadosFiltrados = filtroAtivo ? dados.filter(r => {
    if (filtroAtivo.tipo === "status") return r.status_novo === filtroAtivo.valor;
    if (filtroAtivo.tipo === "mes") {
      if (!r.data_hora_alteracao) return false;
      const d = new Date(r.data_hora_alteracao);
      const key = `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
      return key === filtroAtivo.valor;
    }
    return true;
  }) : [];

  const handlePizzaClick = (_, index) => {
    const status = pizzaStatus[index]?.name;
    if (!status) return;
    if (filtroAtivo?.tipo === "status" && filtroAtivo?.valor === status) {
      setFiltroAtivo(null); setActiveIndex(null);
    } else {
      setFiltroAtivo({ tipo: "status", valor: status, label: status });
      setActiveIndex(index);
    }
  };

  const handleMesClick = (data) => {
    if (!data?.activePayload?.[0]) return;
    const mes = data.activePayload[0].payload.name;
    if (filtroAtivo?.tipo === "mes" && filtroAtivo?.valor === mes) {
      setFiltroAtivo(null);
    } else {
      setFiltroAtivo({ tipo: "mes", valor: mes, label: mes });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Monitoramento de Benefícios</h3>
        <Link to={createPageUrl("RelatorioAlteracaoBeneficio")}
          className="text-xs text-sky-600 hover:text-sky-700 flex items-center gap-1">
          Ver relatório completo <ExternalLink size={11} />
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Barras por mês */}
        <div className={`bg-white border rounded-xl p-4 shadow-sm transition-all ${filtroAtivo?.tipo === "mes" ? "border-indigo-400 ring-1 ring-indigo-200" : "border-slate-200"}`}>
          <p className="text-sm font-semibold text-slate-700 mb-0.5">Alterações por Mês</p>
          <p className="text-xs text-slate-400 mb-3">Clique em uma barra para ver detalhes</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barMes} onClick={handleMesClick} style={{ cursor: "pointer" }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip content={({ active, payload, label }) => {
                if (active && payload?.length) {
                  const pct = total > 0 ? ((payload[0].value / total) * 100).toFixed(1) : 0;
                  return (
                    <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs">
                      <p className="font-semibold text-slate-700 mb-1">{label}</p>
                      <p className="text-indigo-600">Alterações: <strong>{payload[0].value}</strong></p>
                      <p className="text-slate-400">{pct}% do histórico</p>
                      <p className="text-slate-400 mt-1 italic">Clique para ver detalhes</p>
                    </div>
                  );
                }
                return null;
              }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Alterações">
                {barMes.map((entry, i) => (
                  <Cell key={i}
                    fill={filtroAtivo?.tipo === "mes" && filtroAtivo?.valor !== entry.name ? "#c7d2fe" : "#6366f1"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pizza status */}
        <div className={`bg-white border rounded-xl p-4 shadow-sm transition-all ${filtroAtivo?.tipo === "status" ? "border-emerald-400 ring-1 ring-emerald-200" : "border-slate-200"}`}>
          <p className="text-sm font-semibold text-slate-700 mb-0.5">Status dos Benefícios Alterados</p>
          <p className="text-xs text-slate-400 mb-3">Clique em uma fatia para ver detalhes</p>
          <div className="flex items-center gap-2">
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie
                  data={pizzaStatus}
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={78}
                  paddingAngle={3}
                  dataKey="value"
                  activeIndex={filtroAtivo?.tipo === "status" ? pizzaStatus.findIndex(p => p.name === filtroAtivo.valor) : activeIndex}
                  activeShape={renderActiveShape}
                  onClick={handlePizzaClick}
                  style={{ cursor: "pointer" }}
                >
                  {pizzaStatus.map((entry, i) => (
                    <Cell key={i}
                      fill={STATUS_CORES[entry.name] || "#94a3b8"}
                      opacity={filtroAtivo?.tipo === "status" && filtroAtivo?.valor !== entry.name ? 0.3 : 1}
                    />
                  ))}
                </Pie>
                <Tooltip content={({ active, payload }) => {
                  if (active && payload?.length) {
                    const pct = total > 0 ? ((payload[0].value / total) * 100).toFixed(1) : 0;
                    return (
                      <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs">
                        <p className="font-semibold" style={{ color: STATUS_CORES[payload[0].name] }}>{payload[0].name}</p>
                        <p className="text-slate-700">Total: <strong>{payload[0].value}</strong></p>
                        <p className="text-slate-400">{pct}% do total</p>
                        <p className="text-slate-400 mt-1 italic">Clique para detalhes</p>
                      </div>
                    );
                  }
                  return null;
                }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5">
              {pizzaStatus.map((e, i) => (
                <button key={i} onClick={() => handlePizzaClick(null, i)}
                  className={`w-full flex items-center justify-between text-xs p-1.5 rounded-lg transition-all hover:bg-slate-50 ${filtroAtivo?.tipo === "status" && filtroAtivo?.valor !== e.name ? "opacity-35" : "opacity-100"}`}>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: STATUS_CORES[e.name] || "#94a3b8" }} />
                    <span className="text-slate-600">{e.name}</span>
                  </div>
                  <span className="font-semibold text-slate-800">{e.value}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Painel de detalhes quando há filtro ativo */}
      {filtroAtivo && dadosFiltrados.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
            <div>
              <p className="text-sm font-semibold text-slate-700">
                Registros: <span className="text-sky-600">{filtroAtivo.label}</span>
              </p>
              <p className="text-xs text-slate-400">{dadosFiltrados.length} registro(s)</p>
            </div>
            <button onClick={() => { setFiltroAtivo(null); setActiveIndex(null); }}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={14} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[600px]">
              <thead className="bg-slate-50">
                <tr>
                  {["Beneficiário", "CPF", "Status Anterior", "Novo Status", "Motivo", "Usuário"].map(h => (
                    <th key={h} className="text-left px-3 py-2 text-slate-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dadosFiltrados.slice(0, 8).map(r => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-medium text-slate-800">{r.nome_beneficiario}</td>
                    <td className="px-3 py-2 text-slate-500">{r.cpf_beneficiario}</td>
                    <td className="px-3 py-2 text-slate-400">{r.status_anterior || "—"}</td>
                    <td className="px-3 py-2">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: `${STATUS_CORES[r.status_novo]}20`, color: STATUS_CORES[r.status_novo] || "#64748b" }}>
                        {r.status_novo}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-500 max-w-[150px] truncate">{r.motivo_alteracao}</td>
                    <td className="px-3 py-2 text-slate-500">{r.usuario_responsavel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {dadosFiltrados.length > 8 && (
            <div className="px-4 py-2 text-xs text-slate-400 border-t border-slate-100 text-center">
              Mostrando 8 de {dadosFiltrados.length} registros.{" "}
              <Link to={createPageUrl("RelatorioAlteracaoBeneficio")} className="text-sky-600 hover:underline">
                Ver todos no relatório →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}