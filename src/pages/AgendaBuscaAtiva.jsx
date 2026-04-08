import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  CalendarDays, List, RefreshCw, Plus, CheckCircle2,
  Clock, AlertTriangle, ShieldAlert, User, Filter
} from "lucide-react";
import AgendamentoLote from "@/components/visitas/AgendamentoLote";

const PRIORIDADE_COR = {
  "Urgente":    "bg-red-100 text-red-700 border-red-200",
  "Alta":       "bg-orange-100 text-orange-700 border-orange-200",
  "Normal":     "bg-sky-100 text-sky-700 border-sky-200",
  "Baixa":      "bg-slate-100 text-slate-600 border-slate-200",
};

const STATUS_COR = {
  "Agendada":        "bg-sky-100 text-sky-700",
  "Realizada":       "bg-emerald-100 text-emerald-700",
  "Cancelada":       "bg-red-100 text-red-700",
  "Reagendada":      "bg-amber-100 text-amber-700",
  "Não Localizada":  "bg-slate-100 text-slate-600",
};

function KpiCard({ icon: Icon, label, valor, cor }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${cor}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{valor}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export default function AgendaBuscaAtiva() {
  const [visitas, setVisitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLote, setShowLote] = useState(false);
  const [filtroTecnico, setFiltroTecnico] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroPrioridade, setFiltroPrioridade] = useState("");
  const [mesAtual, setMesAtual] = useState(new Date());

  const carregar = async () => {
    setLoading(true);
    const data = await db.VisitaCampo.list("-data_agendamento", 500);
    // Filtra apenas visitas originadas da Busca Ativa (tipo Busca Ativa)
    setVisitas(data.filter(v => v.tipo_visita === "Busca Ativa"));
    setLoading(false);
  };

  useEffect(() => { carregar(); }, []);

  const tecnicos = useMemo(() => {
    return [...new Set(visitas.map(v => v.tecnico_responsavel).filter(Boolean))].sort();
  }, [visitas]);

  const hoje = new Date().toISOString().split("T")[0];
  const ano = mesAtual.getFullYear();
  const mes = String(mesAtual.getMonth() + 1).padStart(2, "0");

  const visitasMes = useMemo(() => {
    return visitas.filter(v => v.data_agendamento?.startsWith(`${ano}-${mes}`));
  }, [visitas, ano, mes]);

  const visitasFiltradas = useMemo(() => {
    return visitasMes.filter(v => {
      if (filtroTecnico && v.tecnico_responsavel !== filtroTecnico) return false;
      if (filtroStatus && v.status !== filtroStatus) return false;
      if (filtroPrioridade && v.prioridade_visita !== filtroPrioridade) return false;
      return true;
    });
  }, [visitasMes, filtroTecnico, filtroStatus, filtroPrioridade]);

  // Agrupa por data para exibição de agenda
  const porData = useMemo(() => {
    const grupos = {};
    visitasFiltradas.forEach(v => {
      const d = v.data_agendamento || "sem-data";
      if (!grupos[d]) grupos[d] = [];
      grupos[d].push(v);
    });
    // Ordena por data
    return Object.entries(grupos)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([data, visitas]) => ({ data, visitas }));
  }, [visitasFiltradas]);

  const agendadas   = visitasMes.filter(v => v.status === "Agendada").length;
  const realizadas  = visitasMes.filter(v => v.status === "Realizada").length;
  const atrasadas   = visitasMes.filter(v => v.status === "Agendada" && v.data_agendamento < hoje).length;
  const urgentes    = visitasMes.filter(v => v.prioridade_visita === "Urgente" && v.status === "Agendada").length;

  const meses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

  const handleStatusChange = async (visita, novoStatus) => {
    await db.VisitaCampo.update(visita.id, { status: novoStatus });
    toast.success("Status atualizado!");
    carregar();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarDays size={20} className="text-sky-500" />
            Agenda de Busca Ativa
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Visitas domiciliares geradas a partir da Escala de Vulnerabilidade
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={carregar} disabled={loading} className="gap-1.5">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Atualizar
          </Button>
          <Button onClick={() => setShowLote(true)} className="bg-sky-600 hover:bg-sky-700 gap-1.5">
            <Plus size={14} />
            Agendar em Lote
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard icon={CalendarDays}  label="Agendadas no mês"   valor={agendadas}  cor="bg-sky-100 text-sky-600" />
        <KpiCard icon={CheckCircle2}  label="Realizadas no mês"  valor={realizadas} cor="bg-emerald-100 text-emerald-600" />
        <KpiCard icon={AlertTriangle} label="Atrasadas"          valor={atrasadas}  cor="bg-red-100 text-red-600" />
        <KpiCard icon={ShieldAlert}   label="Urgentes pendentes" valor={urgentes}   cor="bg-orange-100 text-orange-600" />
      </div>

      {/* Navegação de mês + Filtros */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Navegação mês */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMesAtual(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
          >
            ‹
          </button>
          <span className="text-sm font-semibold text-slate-700 min-w-[140px] text-center">
            {meses[mesAtual.getMonth()]} {mesAtual.getFullYear()}
          </span>
          <button
            onClick={() => setMesAtual(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
          >
            ›
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2 items-center">
          <Filter size={13} className="text-slate-400" />
          <select
            value={filtroTecnico}
            onChange={e => setFiltroTecnico(e.target.value)}
            className="text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400"
          >
            <option value="">Todos os técnicos</option>
            {tecnicos.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={filtroStatus}
            onChange={e => setFiltroStatus(e.target.value)}
            className="text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400"
          >
            <option value="">Todos os status</option>
            {["Agendada","Realizada","Cancelada","Reagendada","Não Localizada"].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={filtroPrioridade}
            onChange={e => setFiltroPrioridade(e.target.value)}
            className="text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400"
          >
            <option value="">Todas as prioridades</option>
            {["Urgente","Alta","Normal","Baixa"].map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          {(filtroTecnico || filtroStatus || filtroPrioridade) && (
            <button
              onClick={() => { setFiltroTecnico(""); setFiltroStatus(""); setFiltroPrioridade(""); }}
              className="text-xs text-sky-600 hover:underline"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Agenda agrupada por dia */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <RefreshCw size={20} className="animate-spin text-slate-300 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">Carregando agenda...</p>
        </div>
      ) : porData.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <CalendarDays size={32} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 text-sm font-medium">Nenhuma visita de busca ativa neste período.</p>
          <p className="text-slate-400 text-xs mt-1">Use "Agendar em Lote" para criar visitas a partir da Escala de Vulnerabilidade.</p>
          <Button onClick={() => setShowLote(true)} className="mt-4 bg-sky-600 hover:bg-sky-700 gap-1.5" size="sm">
            <Plus size={13} /> Agendar em Lote
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {porData.map(({ data, visitas: vDia }) => {
            const dataObj = data !== "sem-data" ? new Date(data + "T00:00:00") : null;
            const isHoje = data === hoje;
            const isAtrasado = data < hoje;
            return (
              <div key={data} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Header do dia */}
                <div className={`px-4 py-2.5 flex items-center justify-between border-b ${
                  isHoje ? "bg-sky-600 text-white border-sky-500" :
                  isAtrasado ? "bg-red-50 border-red-100" :
                  "bg-slate-50 border-slate-100"
                }`}>
                  <div className="flex items-center gap-2">
                    <CalendarDays size={14} className={isHoje ? "text-white" : "text-slate-400"} />
                    <span className={`text-sm font-semibold capitalize ${isHoje ? "text-white" : isAtrasado ? "text-red-700" : "text-slate-700"}`}>
                      {dataObj
                        ? dataObj.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })
                        : "Sem data definida"}
                      {isHoje && <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">Hoje</span>}
                      {isAtrasado && !isHoje && <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Atrasado</span>}
                    </span>
                  </div>
                  <span className={`text-xs font-medium ${isHoje ? "text-white/80" : "text-slate-400"}`}>
                    {vDia.length} visita{vDia.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Visitas do dia */}
                <div className="divide-y divide-slate-50">
                  {vDia
                    .sort((a, b) => {
                      const ord = { Urgente: 0, Alta: 1, Normal: 2, Baixa: 3 };
                      return (ord[a.prioridade_visita] ?? 2) - (ord[b.prioridade_visita] ?? 2);
                    })
                    .map(v => (
                      <div key={v.id} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-slate-50/50 transition-colors">
                        {/* Prioridade */}
                        <div className="flex-shrink-0">
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${PRIORIDADE_COR[v.prioridade_visita] || PRIORIDADE_COR["Normal"]}`}>
                            {v.prioridade_visita || "Normal"}
                          </span>
                        </div>

                        {/* Família */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{v.familia_nome}</p>
                          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                            {v.endereco && (
                              <span className="text-xs text-slate-400 truncate max-w-[200px]">{v.endereco}</span>
                            )}
                            {v.municipio && (
                              <span className="text-xs text-slate-400">{v.municipio}</span>
                            )}
                            {v.tecnico_responsavel && (
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <User size={10} /> {v.tecnico_responsavel}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status + ações */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COR[v.status] || "bg-slate-100 text-slate-600"}`}>
                            {v.status}
                          </span>
                          {v.status === "Agendada" && (
                            <select
                              value=""
                              onChange={e => e.target.value && handleStatusChange(v, e.target.value)}
                              className="text-xs border border-slate-200 rounded px-1.5 py-1 bg-white focus:outline-none"
                            >
                              <option value="">Atualizar...</option>
                              <option value="Realizada">Marcar Realizada</option>
                              <option value="Cancelada">Cancelar</option>
                              <option value="Reagendada">Reagendar</option>
                              <option value="Não Localizada">Não Localizada</option>
                            </select>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Agendamento em Lote */}
      <AgendamentoLote
        open={showLote}
        onClose={() => setShowLote(false)}
        onSalvo={() => { setShowLote(false); carregar(); }}
      />
    </div>
  );
}