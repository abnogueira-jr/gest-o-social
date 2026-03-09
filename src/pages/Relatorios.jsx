import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { BarChart2, Download, RefreshCw, Users, MapPin, CheckCircle2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import RelatorioFiltros from "../components/relatorios/RelatorioFiltros";
import GraficoTecnico from "../components/relatorios/GraficoTecnico";
import GraficoRegiao from "../components/relatorios/GraficoRegiao";
import TabelaDesempenho from "../components/relatorios/TabelaDesempenho";

const MESES_LABEL = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

const FILTROS_INICIAL = {
  mes: String(new Date().getMonth()),
  ano: String(new Date().getFullYear()),
  regiao: "Todas",
  tipo: "Todos",
};

function KpiCard({ icon: Icon, label, valor, sub, cor }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 font-medium">{label}</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{valor}</p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${cor}`}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

export default function Relatorios() {
  const [visitas, setVisitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportando, setExportando] = useState(false);
  const [filtros, setFiltros] = useState(FILTROS_INICIAL);

  const carregar = async () => {
    setLoading(true);
    const data = await base44.entities.VisitaCampo.list("-data_agendamento", 1000);
    setVisitas(data);
    setLoading(false);
  };

  useEffect(() => { carregar(); }, []);

  const alterarFiltro = (k, v) => setFiltros((f) => ({ ...f, [k]: v }));

  // Filtrar visitas pelo período e opcionais
  const visitasFiltradas = useMemo(() => {
    const mes = parseInt(filtros.mes);
    const ano = parseInt(filtros.ano);
    return visitas.filter((v) => {
      if (!v.data_agendamento) return false;
      const d = new Date(v.data_agendamento + "T00:00:00");
      if (d.getFullYear() !== ano || d.getMonth() !== mes) return false;
      if (filtros.regiao !== "Todas" && v.regiao !== filtros.regiao) return false;
      if (filtros.tipo !== "Todos" && v.tipo_visita !== filtros.tipo) return false;
      return true;
    });
  }, [visitas, filtros]);

  // Agrupa por técnico
  const dadosTecnico = useMemo(() => {
    const mapa = {};
    visitasFiltradas.forEach((v) => {
      const tec = v.tecnico_responsavel || "Não informado";
      if (!mapa[tec]) mapa[tec] = { tecnico: tec, total: 0 };
      mapa[tec].total++;
      mapa[tec][v.status] = (mapa[tec][v.status] || 0) + 1;
    });
    return Object.values(mapa).sort((a, b) => b.total - a.total);
  }, [visitasFiltradas]);

  // Agrupa por região
  const dadosRegiao = useMemo(() => {
    const mapa = {};
    visitasFiltradas.forEach((v) => {
      const reg = v.regiao || "Não informada";
      if (!mapa[reg]) mapa[reg] = { regiao: reg, total: 0 };
      mapa[reg].total++;
      mapa[reg][v.status] = (mapa[reg][v.status] || 0) + 1;
    });
    return Object.values(mapa).sort((a, b) => b.total - a.total);
  }, [visitasFiltradas]);

  // KPIs
  const total = visitasFiltradas.length;
  const realizadas = visitasFiltradas.filter((v) => v.status === "Realizada").length;
  const agendadas = visitasFiltradas.filter((v) => v.status === "Agendada").length;
  const taxaEfetividade = total > 0 ? Math.round((realizadas / total) * 100) : 0;
  const tecnicos = new Set(visitasFiltradas.map((v) => v.tecnico_responsavel).filter(Boolean)).size;

  // Exportar PDF
  const exportarPDF = async () => {
    setExportando(true);
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const mesLabel = MESES_LABEL[parseInt(filtros.mes)];
      const titulo = `Relatório de Visitas — ${mesLabel}/${filtros.ano}`;

      // Cabeçalho
      doc.setFillColor(14, 165, 233);
      doc.rect(0, 0, 210, 28, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Gestão Social Estadual", 14, 12);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(titulo, 14, 20);
      doc.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")}`, 148, 20);

      // KPIs
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      let y = 36;
      doc.text("RESUMO DO PERÍODO", 14, y);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      y += 6;
      const kpis = [
        ["Total de Visitas", total],
        ["Realizadas", realizadas],
        ["Agendadas", agendadas],
        ["Taxa de Efetividade", `${taxaEfetividade}%`],
        ["Técnicos Ativos", tecnicos],
      ];
      kpis.forEach(([label, val], i) => {
        const x = 14 + (i % 5) * 38;
        if (i % 5 === 0 && i > 0) y += 12;
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(x, y, 36, 16, 2, 2, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(String(val), x + 18, y + 8, { align: "center" });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.text(label, x + 18, y + 13, { align: "center" });
      });

      y += 24;

      // Tabela por técnico
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      doc.text("DESEMPENHO POR TÉCNICO", 14, y);
      y += 5;

      // Cabeçalho da tabela
      doc.setFillColor(241, 245, 249);
      doc.rect(14, y, 182, 7, "F");
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.text("Técnico", 17, y + 5);
      doc.text("Total", 100, y + 5, { align: "center" });
      doc.text("Realizadas", 120, y + 5, { align: "center" });
      doc.text("Agendadas", 140, y + 5, { align: "center" });
      doc.text("Não Loc.", 158, y + 5, { align: "center" });
      doc.text("Efetividade", 183, y + 5, { align: "center" });
      y += 8;

      doc.setFont("helvetica", "normal");
      dadosTecnico.forEach((d, i) => {
        if (y > 260) { doc.addPage(); y = 20; }
        const taxa = d.total > 0 ? Math.round((d.Realizada / d.total) * 100) : 0;
        if (i % 2 === 0) {
          doc.setFillColor(250, 252, 254);
          doc.rect(14, y - 2, 182, 7, "F");
        }
        doc.setFontSize(7.5);
        doc.text(d.tecnico.substring(0, 28), 17, y + 3);
        doc.text(String(d.total), 100, y + 3, { align: "center" });
        doc.text(String(d.Realizada || 0), 120, y + 3, { align: "center" });
        doc.text(String(d.Agendada || 0), 140, y + 3, { align: "center" });
        doc.text(String(d["Não Localizada"] || 0), 158, y + 3, { align: "center" });
        doc.text(`${taxa}%`, 183, y + 3, { align: "center" });
        y += 7;
      });

      y += 6;

      // Tabela por região
      if (dadosRegiao.length > 0) {
        if (y > 230) { doc.addPage(); y = 20; }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text("DISTRIBUIÇÃO POR REGIÃO", 14, y);
        y += 5;
        doc.setFillColor(241, 245, 249);
        doc.rect(14, y, 182, 7, "F");
        doc.setFontSize(7.5);
        doc.text("Região", 17, y + 5);
        doc.text("Total", 100, y + 5, { align: "center" });
        doc.text("Realizadas", 130, y + 5, { align: "center" });
        doc.text("Taxa", 175, y + 5, { align: "center" });
        y += 8;
        doc.setFont("helvetica", "normal");
        dadosRegiao.forEach((d, i) => {
          if (y > 270) { doc.addPage(); y = 20; }
          const taxa = d.total > 0 ? Math.round((d.Realizada / d.total) * 100) : 0;
          if (i % 2 === 0) {
            doc.setFillColor(250, 252, 254);
            doc.rect(14, y - 2, 182, 7, "F");
          }
          doc.setFontSize(7.5);
          doc.text(d.regiao, 17, y + 3);
          doc.text(String(d.total), 100, y + 3, { align: "center" });
          doc.text(String(d.Realizada || 0), 130, y + 3, { align: "center" });
          doc.text(`${taxa}%`, 175, y + 3, { align: "center" });
          y += 7;
        });
      }

      // Rodapé
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text(`Página ${i} de ${pageCount} — Sistema de Gestão Social Estadual`, 105, 290, { align: "center" });
      }

      doc.save(`relatorio-visitas-${mesLabel.toLowerCase()}-${filtros.ano}.pdf`);
      toast.success("Relatório exportado com sucesso!");
    } catch (e) {
      toast.error("Erro ao gerar PDF.");
    }
    setExportando(false);
  };

  const mesLabel = MESES_LABEL[parseInt(filtros.mes)];

  return (
    <div className="space-y-4" id="relatorio-area">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart2 size={20} className="text-sky-600" /> Relatórios de Desempenho
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Visitas por técnico e região — gestão mensal</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={carregar} disabled={loading} className="gap-1.5">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </Button>
          <Button
            size="sm"
            onClick={exportarPDF}
            disabled={exportando || loading || !visitasFiltradas.length}
            className="bg-sky-600 hover:bg-sky-700 gap-1.5"
          >
            <Download size={13} />
            {exportando ? "Gerando PDF..." : "Exportar PDF"}
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <RelatorioFiltros
        filtros={filtros}
        onChange={alterarFiltro}
        onLimpar={() => setFiltros(FILTROS_INICIAL)}
      />

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <RefreshCw size={20} className="animate-spin text-slate-300 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">Carregando dados...</p>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <KpiCard icon={Calendar}     label="Total de Visitas"     valor={total}          sub={`${mesLabel}/${filtros.ano}`} cor="bg-slate-100 text-slate-600" />
            <KpiCard icon={CheckCircle2} label="Realizadas"           valor={realizadas}     sub={`${taxaEfetividade}% de efetividade`} cor="bg-emerald-100 text-emerald-600" />
            <KpiCard icon={Calendar}     label="Agendadas"            valor={agendadas}      sub="pendentes" cor="bg-sky-100 text-sky-600" />
            <KpiCard icon={Users}        label="Técnicos Ativos"      valor={tecnicos}       sub="no período" cor="bg-violet-100 text-violet-600" />
            <KpiCard icon={MapPin}       label="Regiões Atendidas"    valor={dadosRegiao.length} sub="no período" cor="bg-amber-100 text-amber-600" />
          </div>

          {!visitasFiltradas.length ? (
            <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
              <BarChart2 size={32} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">Nenhuma visita encontrada para o período selecionado.</p>
              <p className="text-xs text-slate-400 mt-1">Ajuste os filtros ou verifique os agendamentos cadastrados.</p>
            </div>
          ) : (
            <>
              {/* Gráficos */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                    <Users size={14} className="text-sky-600" /> Desempenho por Técnico
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">Visitas realizadas, agendadas e não localizadas</p>
                  <GraficoTecnico dados={dadosTecnico} />
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                    <MapPin size={14} className="text-violet-600" /> Distribuição por Região
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">Total de visitas agendadas por região</p>
                  <GraficoRegiao dados={dadosRegiao} />
                </div>
              </div>

              {/* Tabela detalhada */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700">Ranking de Desempenho por Técnico</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{mesLabel}/{filtros.ano} · {dadosTecnico.length} técnico(s)</p>
                  </div>
                </div>
                <TabelaDesempenho dados={dadosTecnico} />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}