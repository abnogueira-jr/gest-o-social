import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Download, Search, Loader2, Filter, X, FileSpreadsheet, BarChart2 } from "lucide-react";
import GraficosAlteracaoBeneficio from "@/components/relatorios/GraficosAlteracaoBeneficio";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import jsPDF from "jspdf";

const STATUS_OPTIONS = ["Ativo", "Suspenso", "Cancelado", "Em Análise", "Aguardando"];
const MOTIVOS = [
  "Revisão Cadastral", "Descumprimento de Condicionalidades", "Renda Acima do Limite",
  "Solicitação do Beneficiário", "Erro de Cadastro", "Óbito",
  "Mudança de Município", "Regularização de Pendência", "Outros"
];

const STATUS_COR = {
  "Ativo": "bg-emerald-100 text-emerald-700",
  "Suspenso": "bg-yellow-100 text-yellow-700",
  "Cancelado": "bg-red-100 text-red-700",
  "Em Análise": "bg-blue-100 text-blue-700",
  "Aguardando": "bg-slate-100 text-slate-600",
};

function KpiCard({ label, value, color }) {
  return (
    <div className={`bg-white border rounded-xl p-4 shadow-sm border-l-4 ${color}`}>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  );
}

export default function RelatorioAlteracaoBeneficio() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroGrafico, setFiltroGrafico] = useState(null);

  const [filtros, setFiltros] = useState({
    dataInicio: "", dataFim: "", status: "", motivo: "", usuario: "", busca: ""
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await base44.entities.AlteracaoBeneficio.list("-data_hora_alteracao", 500);
      setTodos(data);
      setLoading(false);
    })();
  }, []);

  const setFiltro = (key, val) => setFiltros(p => ({ ...p, [key]: val }));
  const limparFiltros = () => setFiltros({ dataInicio: "", dataFim: "", status: "", motivo: "", usuario: "", busca: "" });

  const filtrados = useMemo(() => {
    return todos.filter(r => {
      if (filtros.status && r.status_novo !== filtros.status) return false;
      if (filtros.motivo && r.motivo_alteracao !== filtros.motivo) return false;
      if (filtros.usuario && !(r.usuario_responsavel || "").toLowerCase().includes(filtros.usuario.toLowerCase())) return false;
      if (filtros.busca) {
        const b = filtros.busca.toLowerCase();
        if (!(r.nome_beneficiario || "").toLowerCase().includes(b) && !(r.cpf_beneficiario || "").includes(b)) return false;
      }
      if (filtros.dataInicio && r.data_hora_alteracao) {
        if (new Date(r.data_hora_alteracao) < new Date(filtros.dataInicio)) return false;
      }
      if (filtros.dataFim && r.data_hora_alteracao) {
        const fim = new Date(filtros.dataFim);
        fim.setHours(23, 59, 59);
        if (new Date(r.data_hora_alteracao) > fim) return false;
      }
      return true;
    });
  }, [todos, filtros]);

  // Dados filtrados pelo gráfico (aplicado sobre filtrados)
  const dadosGrafico = useMemo(() => {
    if (!filtroGrafico) return filtrados;
    return filtrados.filter(r => {
      if (filtroGrafico.tipo === "status") return r.status_novo === filtroGrafico.valor;
      if (filtroGrafico.tipo === "motivo") return r.motivo_alteracao === filtroGrafico.valor;
      if (filtroGrafico.tipo === "mes") {
        if (!r.data_hora_alteracao) return false;
        const d = new Date(r.data_hora_alteracao);
        const key = `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
        return key === filtroGrafico.valor;
      }
      return true;
    });
  }, [filtrados, filtroGrafico]);

  // KPIs
  const kpis = useMemo(() => {
    const por_status = STATUS_OPTIONS.reduce((acc, s) => {
      acc[s] = filtrados.filter(r => r.status_novo === s).length;
      return acc;
    }, {});
    return por_status;
  }, [filtrados]);

  // Export CSV
  const exportCSV = () => {
    const header = ["Nome", "CPF", "Nº Cartão", "Status Anterior", "Novo Status", "Motivo", "Justificativa", "Usuário", "Data/Hora"];
    const rows = filtrados.map(r => [
      r.nome_beneficiario || "",
      r.cpf_beneficiario || "",
      r.numero_cartao || "",
      r.status_anterior || "",
      r.status_novo || "",
      r.motivo_alteracao || "",
      (r.justificativa || "").replace(/\n/g, " "),
      r.usuario_responsavel || "",
      r.data_hora_alteracao ? format(new Date(r.data_hora_alteracao), "dd/MM/yyyy HH:mm") : ""
    ]);
    const csvContent = [header, ...rows].map(row => row.map(v => `"${v}"`).join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio_alteracoes_${format(new Date(), "yyyyMMdd_HHmm")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    const pageW = doc.internal.pageSize.getWidth();

    doc.setFontSize(16);
    doc.setTextColor(15, 118, 189);
    doc.text("Relatório de Alterações de Benefício", 14, 18);

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}   Total: ${filtrados.length} registro(s)`, 14, 26);

    // Filtros ativos
    const filtrosAtivos = [];
    if (filtros.dataInicio) filtrosAtivos.push(`De: ${filtros.dataInicio}`);
    if (filtros.dataFim) filtrosAtivos.push(`Até: ${filtros.dataFim}`);
    if (filtros.status) filtrosAtivos.push(`Status: ${filtros.status}`);
    if (filtros.motivo) filtrosAtivos.push(`Motivo: ${filtros.motivo}`);
    if (filtros.usuario) filtrosAtivos.push(`Usuário: ${filtros.usuario}`);
    if (filtros.busca) filtrosAtivos.push(`Busca: ${filtros.busca}`);
    if (filtrosAtivos.length > 0) {
      doc.text(`Filtros: ${filtrosAtivos.join(" | ")}`, 14, 32);
    }

    // Cabeçalho da tabela
    const colX = [14, 60, 95, 125, 155, 185, 235];
    const colLabels = ["Nome", "CPF", "St. Anterior", "Novo Status", "Motivo", "Usuário", "Data/Hora"];
    let y = 42;

    doc.setFillColor(14, 165, 233);
    doc.rect(14, y - 6, pageW - 28, 8, "F");
    doc.setTextColor(255);
    doc.setFontSize(8);
    colLabels.forEach((label, i) => doc.text(label, colX[i], y));

    doc.setTextColor(50);
    filtrados.forEach((r, idx) => {
      y += 9;
      if (y > 190) { doc.addPage(); y = 20; }
      if (idx % 2 === 0) {
        doc.setFillColor(241, 245, 249);
        doc.rect(14, y - 6, pageW - 28, 8, "F");
      }
      const cols = [
        (r.nome_beneficiario || "").substring(0, 20),
        r.cpf_beneficiario || "",
        r.status_anterior || "—",
        r.status_novo || "",
        (r.motivo_alteracao || "").substring(0, 24),
        (r.usuario_responsavel || "").substring(0, 18),
        r.data_hora_alteracao ? format(new Date(r.data_hora_alteracao), "dd/MM/yy HH:mm") : "—"
      ];
      cols.forEach((val, i) => doc.text(val, colX[i], y));
    });

    doc.save(`relatorio_alteracoes_${format(new Date(), "yyyyMMdd_HHmm")}.pdf`);
  };

  const temFiltro = Object.values(filtros).some(v => v !== "");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText size={22} className="text-sky-600" />
            Relatório de Alterações de Benefício
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {dadosGrafico.length} registro(s) encontrado(s){filtroGrafico ? " (filtro por gráfico ativo)" : ""}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={exportCSV} disabled={filtrados.length === 0} className="gap-1.5">
            <FileSpreadsheet size={15} className="text-emerald-600" /> Exportar CSV
          </Button>
          <Button onClick={exportPDF} disabled={filtrados.length === 0} className="bg-sky-600 hover:bg-sky-700 gap-1.5">
            <Download size={15} /> Exportar PDF
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <KpiCard label="Ativos" value={kpis["Ativo"] || 0} color="border-emerald-400" />
        <KpiCard label="Suspensos" value={kpis["Suspenso"] || 0} color="border-yellow-400" />
        <KpiCard label="Cancelados" value={kpis["Cancelado"] || 0} color="border-red-400" />
        <KpiCard label="Em Análise" value={kpis["Em Análise"] || 0} color="border-blue-400" />
        <KpiCard label="Aguardando" value={kpis["Aguardando"] || 0} color="border-slate-400" />
      </div>

      {/* Gráficos */}
      {!loading && filtrados.length > 0 && (
        <GraficosAlteracaoBeneficio
          dados={filtrados}
          filtroAtivo={filtroGrafico}
          onFiltroChange={(f) => setFiltroGrafico(f)}
        />
      )}

      {/* Filtros */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5"><Filter size={14} /> Filtros</p>
          {temFiltro && (
            <Button variant="ghost" size="sm" onClick={limparFiltros} className="text-slate-400 gap-1 h-7">
              <X size={12} /> Limpar
            </Button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Data Início</label>
            <Input type="date" value={filtros.dataInicio} onChange={e => setFiltro("dataInicio", e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Data Fim</label>
            <Input type="date" value={filtros.dataFim} onChange={e => setFiltro("dataFim", e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Novo Status</label>
            <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background h-9"
              value={filtros.status} onChange={e => setFiltro("status", e.target.value)}>
              <option value="">Todos</option>
              {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Motivo</label>
            <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background h-9"
              value={filtros.motivo} onChange={e => setFiltro("motivo", e.target.value)}>
              <option value="">Todos</option>
              {MOTIVOS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Usuário</label>
            <Input placeholder="Nome do usuário" value={filtros.usuario} onChange={e => setFiltro("usuario", e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Nome / CPF</label>
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input className="pl-8" placeholder="Buscar..." value={filtros.busca} onChange={e => setFiltro("busca", e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Beneficiário</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">CPF</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Nº Cartão</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">St. Anterior</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Novo Status</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Motivo</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Usuário</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Data/Hora</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={8} className="text-center py-10 text-slate-400"><Loader2 size={20} className="animate-spin inline" /></td></tr>
            ) : dadosGrafico.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-10 text-slate-400">Nenhum registro encontrado</td></tr>
            ) : dadosGrafico.map(r => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{r.nome_beneficiario}</td>
                <td className="px-4 py-3 text-slate-500">{r.cpf_beneficiario}</td>
                <td className="px-4 py-3 text-slate-500">{r.numero_cartao || "—"}</td>
                <td className="px-4 py-3">
                  {r.status_anterior
                    ? <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COR[r.status_anterior] || "bg-slate-100 text-slate-600"}`}>{r.status_anterior}</span>
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COR[r.status_novo] || "bg-slate-100 text-slate-600"}`}>{r.status_novo}</span>
                </td>
                <td className="px-4 py-3 text-slate-600 max-w-[180px] truncate">{r.motivo_alteracao}</td>
                <td className="px-4 py-3 text-slate-500">{r.usuario_responsavel}</td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                  {r.data_hora_alteracao ? format(new Date(r.data_hora_alteracao), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}