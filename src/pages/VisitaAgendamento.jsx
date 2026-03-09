import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, RefreshCw, CalendarDays, List, Clock, CheckCircle2, AlertTriangle, Map } from "lucide-react";
import AgendamentoForm from "../components/visitas/AgendamentoForm";
import AgendamentoCalendario from "../components/visitas/AgendamentoCalendario";
import AgendamentoLista from "../components/visitas/AgendamentoLista";
import MapaVisitas from "../components/visitas/MapaVisitas";

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

export default function VisitaAgendamento() {
  const [visitas, setVisitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [mesAtual, setMesAtual] = useState(new Date());
  const [diaSelecionado, setDiaSelecionado] = useState(null);
  const [visao, setVisao] = useState("calendario"); // "calendario" | "lista" | "mapa"

  const carregar = async () => {
    setLoading(true);
    const data = await base44.entities.VisitaCampo.list("-data_agendamento", 500);
    setVisitas(data);
    setLoading(false);
  };

  useEffect(() => { carregar(); }, []);

  const handleSalvar = async (form) => {
    if (form.id) {
      await base44.entities.VisitaCampo.update(form.id, form);
      toast.success("Agendamento atualizado!");
    } else {
      await base44.entities.VisitaCampo.create(form);
      toast.success("Visita agendada com sucesso!");
    }
    carregar();
  };

  const handleExcluir = async (id) => {
    if (!window.confirm("Deseja excluir este agendamento?")) return;
    await base44.entities.VisitaCampo.delete(id);
    toast.success("Agendamento removido.");
    carregar();
  };

  const handleEditar = (v) => { setEditando(v); setFormOpen(true); };

  const abrirNovo = () => {
    setEditando(null);
    setFormOpen(true);
  };

  // KPIs
  const hoje = new Date().toISOString().split("T")[0];
  const agendadas = visitas.filter((v) => v.status === "Agendada").length;
  const realizadas = visitas.filter((v) => v.status === "Realizada").length;
  const hojeVisitas = visitas.filter((v) => v.data_agendamento === hoje).length;
  const atrasadas = visitas.filter((v) => v.status === "Agendada" && v.data_agendamento < hoje).length;

  // Visitas filtradas por dia selecionado ou mês atual (na visão lista)
  const visitasFiltradas = useMemo(() => {
    if (diaSelecionado) {
      return visitas.filter((v) => v.data_agendamento === diaSelecionado);
    }
    // Mês atual
    const ano = mesAtual.getFullYear();
    const mes = String(mesAtual.getMonth() + 1).padStart(2, "0");
    return visitas.filter((v) => v.data_agendamento?.startsWith(`${ano}-${mes}`));
  }, [visitas, diaSelecionado, mesAtual]);

  const meses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  const tituloLista = diaSelecionado
    ? new Date(diaSelecionado + "T00:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })
    : `${meses[mesAtual.getMonth()]} ${mesAtual.getFullYear()}`;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarDays size={20} className="text-sky-600" /> Agendamento de Visitas Familiares
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Planeje e acompanhe as visitas de campo por família</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={carregar} disabled={loading} className="gap-1.5">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Atualizar
          </Button>
          <Button size="sm" onClick={abrirNovo} className="bg-sky-600 hover:bg-sky-700 gap-1.5">
            <Plus size={14} /> Nova Visita
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard icon={CalendarDays}   label="Agendadas"       valor={agendadas}   cor="bg-sky-100 text-sky-600" />
        <KpiCard icon={CheckCircle2}   label="Realizadas"      valor={realizadas}   cor="bg-emerald-100 text-emerald-600" />
        <KpiCard icon={Clock}          label="Hoje"            valor={hojeVisitas}  cor="bg-violet-100 text-violet-600" />
        <KpiCard icon={AlertTriangle}  label="Atrasadas"       valor={atrasadas}    cor="bg-red-100 text-red-600" />
      </div>

      {/* Alternância de visão */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
          {[
            { key: "calendario", icon: CalendarDays, label: "Calendário" },
            { key: "lista",      icon: List,         label: "Lista" },
            { key: "mapa",       icon: Map,          label: "Mapa" },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setVisao(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
                ${visao === key ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>
        {diaSelecionado && (
          <button
            onClick={() => setDiaSelecionado(null)}
            className="text-xs text-sky-600 hover:underline"
          >
            Mostrar todo o mês
          </button>
        )}
      </div>

      {/* Conteúdo principal */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <RefreshCw size={20} className="animate-spin text-slate-300 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">Carregando agendamentos...</p>
        </div>
      ) : visao === "calendario" ? (
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-4">
          <AgendamentoCalendario
            visitas={visitas}
            mesAtual={mesAtual}
            onMesAnterior={() => setMesAtual((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
            onProximoMes={() => setMesAtual((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
            onDiaSelecionado={setDiaSelecionado}
            diaSelecionado={diaSelecionado}
          />
          <div className="space-y-3">
            <AgendamentoLista
              visitas={visitasFiltradas}
              onEditar={handleEditar}
              onExcluir={handleExcluir}
              titulo={tituloLista}
            />
          </div>
        </div>
      ) : (
        <AgendamentoLista
          visitas={visitasFiltradas}
          onEditar={handleEditar}
          onExcluir={handleExcluir}
          titulo={tituloLista}
        />
      )}

      {/* Modal de agendamento */}
      <AgendamentoForm
        open={formOpen}
        visita={editando}
        onClose={() => { setFormOpen(false); setEditando(null); }}
        onSalvar={handleSalvar}
      />
    </div>
  );
}