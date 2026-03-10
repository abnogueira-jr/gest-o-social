import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { BarChart2, Download, RefreshCw, Users, MapPin, CheckCircle2, Calendar, Heart, FileText } from "lucide-react";
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
  const [contemplacoes, setContemplacoes] = useState([]);
  const [historicos, setHistoricos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportando, setExportando] = useState(false);
  const [filtros, setFiltros] = useState(FILTROS_INICIAL);

  const carregar = async () => {
    setLoading(true);
    const [v, c, h] = await Promise.all([
      base44.entities.VisitaCampo.list("-data_agendamento", 1000),
      base44.entities.Contemplacao.list("-data_contemplacao", 1000),
      base44.entities.HistoricoFamilia.list("-data_evento", 1000),
    ]);
    setVisitas(v);
    setContemplacoes(c);
    setHistoricos(h);
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

  // Benefícios filtrados pelo mesmo período
  const contemplacoesFiltradas = useMemo(() => {
    const mes = parseInt(filtros.mes);
    const ano = parseInt(filtros.ano);
    return contemplacoes.filter((c) => {
      if (!c.data_contemplacao) return false;
      const d = new Date(c.data_contemplacao + "T00:00:00");
      return d.getFullYear() === ano && d.getMonth() === mes;
    });
  }, [contemplacoes, filtros]);

  // Histórico filtrado pelo período
  const historicosFiltrados = useMemo(() => {
    const mes = parseInt(filtros.mes);
    const ano = parseInt(filtros.ano);
    return historicos.filter((h) => {
      if (!h.data_evento) return false;
      const d = new Date(h.data_evento);
      return d.getFullYear() === ano && d.getMonth() === mes;
    });
  }, [historicos, filtros]);

  // KPIs
  const total = visitasFiltradas.length;
  const realizadas = visitasFiltradas.filter((v) => v.status === "Realizada").length;
  const agendadas = visitasFiltradas.filter((v) => v.status === "Agendada").length;
  const taxaEfetividade = total > 0 ? Math.round((realizadas / total) * 100) : 0;
  const tecnicos = new Set(visitasFiltradas.map((v) => v.tecnico_responsavel).filter(Boolean)).size;
  const totalBeneficios = contemplacoesFiltradas.length;
  const valorTotalBeneficios = contemplacoesFiltradas.reduce((acc, c) => acc + (parseFloat(c.valor) || 0), 0);
  const familiasAtendidas = new Set([
    ...visitasFiltradas.map((v) => v.familia_id).filter(Boolean),
    ...contemplacoesFiltradas.map((c) => c.familia_id).filter(Boolean),
  ]).size;

  // helpers PDF
  const pdfHeader = (doc, titulo, subtitulo) => {
    doc.setFillColor(14, 165, 233);
    doc.rect(0, 0, 210, 30, "F");
    doc.setFillColor(7, 130, 185);
    doc.rect(0, 24, 210, 6, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.text("Gestão Social Estadual", 14, 12);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(subtitulo, 14, 21);
    doc.setFontSize(8);
    doc.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`, 196, 21, { align: "right" });
    doc.setTextColor(30, 41, 59);
    return 38;
  };

  const pdfSectionTitle = (doc, text, y) => {
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y - 4, 182, 8, "F");
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(14, 165, 233);
    doc.text(text, 17, y + 1);
    doc.setTextColor(30, 41, 59);
    return y + 8;
  };

  const pdfTableHeader = (doc, cols, y) => {
    doc.setFillColor(30, 41, 59);
    doc.rect(14, y, 182, 7, "F");
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    cols.forEach(({ text, x, align }) => doc.text(text, x, y + 5, { align: align || "left" }));
    doc.setTextColor(30, 41, 59);
    return y + 8;
  };

  const pdfTableRow = (doc, cols, y, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y - 2, 182, 7, "F");
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    cols.forEach(({ text, x, align }) => doc.text(String(text ?? "—"), x, y + 3, { align: align || "left" }));
    return y + 7;
  };

  const checkPage = (doc, y, margin = 260) => {
    if (y > margin) { doc.addPage(); return 20; }
    return y;
  };

  const exportarPDF = async () => {
    setExportando(true);
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const mesLabel = MESES_LABEL[parseInt(filtros.mes)];
      const periodoLabel = `${mesLabel}/${filtros.ano}`;
      const subtitulo = `Relatório Mensal de Atividades — ${periodoLabel}${filtros.regiao !== "Todas" ? ` · ${filtros.regiao}` : ""}`;

      // ── PÁGINA 1: Capa e resumo executivo ──────────────────────────────
      let y = pdfHeader(doc, "Relatório Mensal", subtitulo);

      // Bloco de KPIs resumo
      y = pdfSectionTitle(doc, "RESUMO EXECUTIVO DO PERÍODO", y);
      y += 2;

      const kpiCols = 3;
      const kpiW = 58;
      const kpiH = 20;
      const kpiData = [
        { label: "Famílias Atendidas",   val: familiasAtendidas,   cor: [14,165,233] },
        { label: "Total de Visitas",      val: total,               cor: [99,102,241] },
        { label: "Visitas Realizadas",    val: realizadas,          cor: [16,185,129] },
        { label: "Taxa de Efetividade",   val: `${taxaEfetividade}%`, cor: [245,158,11] },
        { label: "Benefícios Concedidos", val: totalBeneficios,     cor: [239,68,68]  },
        { label: "Valor Total (R$)",      val: valorTotalBeneficios.toLocaleString("pt-BR", { minimumFractionDigits: 2 }), cor: [34,197,94] },
      ];

      kpiData.forEach((k, i) => {
        const col = i % kpiCols;
        const row = Math.floor(i / kpiCols);
        const x = 14 + col * (kpiW + 2);
        const ky = y + row * (kpiH + 2);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(x, ky, kpiW, kpiH, 2, 2, "F");
        doc.setDrawColor(...k.cor);
        doc.setLineWidth(0.8);
        doc.line(x, ky, x, ky + kpiH);
        doc.setLineWidth(0.2);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(...k.cor);
        doc.text(String(k.val), x + kpiW / 2, ky + 10, { align: "center" });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text(k.label, x + kpiW / 2, ky + 16, { align: "center" });
      });

      y += Math.ceil(kpiData.length / kpiCols) * (kpiH + 2) + 6;
      doc.setTextColor(30, 41, 59);

      // ── SEÇÃO: Desempenho por técnico ──────────────────────────────────
      y = checkPage(doc, y, 240);
      y = pdfSectionTitle(doc, "DESEMPENHO POR TÉCNICO", y);
      y = pdfTableHeader(doc, [
        { text: "Técnico Responsável", x: 17 },
        { text: "Total",    x: 102, align: "center" },
        { text: "Realiz.",  x: 120, align: "center" },
        { text: "Agend.",   x: 138, align: "center" },
        { text: "Canc.",    x: 156, align: "center" },
        { text: "N.Loc.",   x: 172, align: "center" },
        { text: "Efetiv.",  x: 192, align: "center" },
      ], y);

      dadosTecnico.forEach((d, i) => {
        y = checkPage(doc, y);
        const taxa = d.total > 0 ? Math.round(((d["Realizada"] || 0) / d.total) * 100) : 0;
        y = pdfTableRow(doc, [
          { text: d.tecnico.substring(0, 30), x: 17 },
          { text: d.total,                    x: 102, align: "center" },
          { text: d["Realizada"] || 0,         x: 120, align: "center" },
          { text: d["Agendada"] || 0,          x: 138, align: "center" },
          { text: d["Cancelada"] || 0,         x: 156, align: "center" },
          { text: d["Não Localizada"] || 0,    x: 172, align: "center" },
          { text: `${taxa}%`,                  x: 192, align: "center" },
        ], y, i);
      });

      y += 6;

      // ── SEÇÃO: Distribuição por região ─────────────────────────────────
      if (dadosRegiao.length > 0) {
        y = checkPage(doc, y, 230);
        y = pdfSectionTitle(doc, "DISTRIBUIÇÃO POR REGIÃO", y);
        y = pdfTableHeader(doc, [
          { text: "Região",      x: 17 },
          { text: "Total",       x: 102, align: "center" },
          { text: "Realizadas",  x: 130, align: "center" },
          { text: "Canceladas",  x: 158, align: "center" },
          { text: "Taxa (%)",    x: 188, align: "center" },
        ], y);
        dadosRegiao.forEach((d, i) => {
          y = checkPage(doc, y);
          const taxa = d.total > 0 ? Math.round(((d["Realizada"] || 0) / d.total) * 100) : 0;
          y = pdfTableRow(doc, [
            { text: d.regiao,               x: 17 },
            { text: d.total,                x: 102, align: "center" },
            { text: d["Realizada"] || 0,    x: 130, align: "center" },
            { text: d["Cancelada"] || 0,    x: 158, align: "center" },
            { text: `${taxa}%`,             x: 188, align: "center" },
          ], y, i);
        });
        y += 6;
      }

      // ── SEÇÃO: Benefícios concedidos ───────────────────────────────────
      if (contemplacoesFiltradas.length > 0) {
        y = checkPage(doc, y, 220);
        y = pdfSectionTitle(doc, "BENEFÍCIOS CONCEDIDOS NO PERÍODO", y);

        // Resumo por programa
        const porPrograma = {};
        contemplacoesFiltradas.forEach((c) => {
          const prog = c.programa_nome || "Não informado";
          if (!porPrograma[prog]) porPrograma[prog] = { total: 0, valor: 0, aprovados: 0 };
          porPrograma[prog].total++;
          porPrograma[prog].valor += parseFloat(c.valor) || 0;
          if (c.status === "Aprovado") porPrograma[prog].aprovados++;
        });

        y = pdfTableHeader(doc, [
          { text: "Programa Social",  x: 17 },
          { text: "Contemplações",    x: 110, align: "center" },
          { text: "Aprovados",        x: 148, align: "center" },
          { text: "Valor Total (R$)", x: 193, align: "right" },
        ], y);

        Object.entries(porPrograma).forEach(([prog, d], i) => {
          y = checkPage(doc, y);
          y = pdfTableRow(doc, [
            { text: prog.substring(0, 38),                                       x: 17 },
            { text: d.total,                                                     x: 110, align: "center" },
            { text: d.aprovados,                                                 x: 148, align: "center" },
            { text: d.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 }), x: 193, align: "right" },
          ], y, i);
        });

        // Linha total
        y += 1;
        doc.setFillColor(14, 165, 233);
        doc.rect(14, y, 182, 7, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(255, 255, 255);
        doc.text("TOTAL DO PERÍODO", 17, y + 5);
        doc.text(String(totalBeneficios), 110, y + 5, { align: "center" });
        doc.text(
          valorTotalBeneficios.toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
          193, y + 5, { align: "right" }
        );
        doc.setTextColor(30, 41, 59);
        y += 12;
      }

      // ── SEÇÃO: Principais observações técnicas ────────────────────────
      const obsVisitas = visitasFiltradas
        .filter((v) => v.observacoes && v.observacoes.trim().length > 5)
        .slice(0, 15);

      const obsHistorico = historicosFiltrados
        .filter((h) => h.descricao && h.descricao.trim().length > 5 && (h.tipo === "Atendimento" || h.tipo === "Nota"))
        .slice(0, 10);

      if (obsVisitas.length > 0 || obsHistorico.length > 0) {
        y = checkPage(doc, y, 200);
        y = pdfSectionTitle(doc, "PRINCIPAIS OBSERVAÇÕES TÉCNICAS DO PERÍODO", y);

        if (obsVisitas.length > 0) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(7.5);
          doc.setTextColor(99, 102, 241);
          doc.text("Observações de Visitas de Campo:", 17, y);
          doc.setTextColor(30, 41, 59);
          y += 5;

          obsVisitas.forEach((v) => {
            y = checkPage(doc, y);
            const data = v.data_agendamento ? new Date(v.data_agendamento + "T00:00:00").toLocaleDateString("pt-BR") : "—";
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7);
            doc.text(`• [${data}] ${(v.familia_nome || "Família").substring(0, 25)} — ${v.tecnico_responsavel || "Técnico não inf."}:`, 17, y);
            y += 4;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7);
            const linhas = doc.splitTextToSize(v.observacoes, 170);
            linhas.slice(0, 3).forEach((linha) => {
              y = checkPage(doc, y);
              doc.text(linha, 22, y);
              y += 4;
            });
            y += 1;
          });
        }

        if (obsHistorico.length > 0) {
          y = checkPage(doc, y, 220);
          y += 2;
          doc.setFont("helvetica", "bold");
          doc.setFontSize(7.5);
          doc.setTextColor(16, 185, 129);
          doc.text("Registros de Acompanhamento Familiar:", 17, y);
          doc.setTextColor(30, 41, 59);
          y += 5;

          obsHistorico.forEach((h) => {
            y = checkPage(doc, y);
            const data = h.data_evento ? new Date(h.data_evento).toLocaleDateString("pt-BR") : "—";
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7);
            doc.text(`• [${data}] ${(h.familia_nome || "Família").substring(0, 30)} (${h.tipo || "Nota"}):`, 17, y);
            y += 4;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7);
            const linhas = doc.splitTextToSize(h.descricao, 170);
            linhas.slice(0, 3).forEach((linha) => {
              y = checkPage(doc, y);
              doc.text(linha, 22, y);
              y += 4;
            });
            y += 1;
          });
        }
      }

      // ── Rodapé em todas as páginas ─────────────────────────────────────
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFillColor(241, 245, 249);
        doc.rect(0, 285, 210, 12, "F");
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(148, 163, 184);
        doc.text(`Sistema de Gestão Social Estadual — ${subtitulo}`, 14, 291);
        doc.text(`Página ${i} de ${pageCount}`, 196, 291, { align: "right" });
      }

      doc.save(`relatorio-mensal-${mesLabel.toLowerCase()}-${filtros.ano}.pdf`);
      toast.success("Relatório mensal exportado com sucesso!");
    } catch (e) {
      console.error(e);
      toast.error("Erro ao gerar PDF: " + e.message);
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
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            <KpiCard icon={Users}        label="Famílias Atendidas"   valor={familiasAtendidas} sub={`${mesLabel}/${filtros.ano}`} cor="bg-sky-100 text-sky-600" />
            <KpiCard icon={Calendar}     label="Total de Visitas"     valor={total}          sub={`${agendadas} pendentes`} cor="bg-slate-100 text-slate-600" />
            <KpiCard icon={CheckCircle2} label="Realizadas"           valor={realizadas}     sub={`${taxaEfetividade}% de efetividade`} cor="bg-emerald-100 text-emerald-600" />
            <KpiCard icon={Users}        label="Técnicos Ativos"      valor={tecnicos}       sub="no período" cor="bg-violet-100 text-violet-600" />
            <KpiCard icon={Heart}        label="Benefícios"           valor={totalBeneficios} sub="concedidos" cor="bg-rose-100 text-rose-600" />
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