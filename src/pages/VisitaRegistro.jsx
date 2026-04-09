import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ClipboardList, Search, Filter, RefreshCw, Eye, Edit2,
  CheckCircle2, XCircle, CalendarDays, MapPin, User,
  Camera, FileText, ChevronDown, Save, Loader2
} from "lucide-react";

const STATUS_COR = {
  "Agendada":      "bg-sky-100 text-sky-700 border-sky-200",
  "Realizada":     "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Cancelada":     "bg-red-100 text-red-700 border-red-200",
  "Reagendada":    "bg-amber-100 text-amber-700 border-amber-200",
  "Não Localizada":"bg-slate-100 text-slate-600 border-slate-200",
};

const PRIORIDADE_COR = {
  "Urgente": "bg-red-100 text-red-700",
  "Alta":    "bg-orange-100 text-orange-700",
  "Normal":  "bg-sky-100 text-sky-700",
  "Baixa":   "bg-slate-100 text-slate-500",
};

const STATUS_LIST = ["Agendada", "Realizada", "Cancelada", "Reagendada", "Não Localizada"];

function ModalRegistro({ visita, onClose, onSalvo }) {
  const [form, setForm] = useState({
    status: visita.status || "Agendada",
    data_visita: visita.data_visita || new Date().toISOString().split("T")[0],
    resultado: visita.resultado || "",
    observacoes: visita.observacoes || "",
    validacao_familia: visita.validacao_familia || false,
  });
  const [salvando, setSalvando] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSalvar = async () => {
    setSalvando(true);
    await base44.entities.VisitaCampo.update(visita.id, form);
    toast.success("Registro atualizado com sucesso!");
    onSalvo();
    setSalvando(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sky-700">
            <Edit2 size={16} /> Registrar Visita
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-1 text-xs text-slate-500 bg-slate-50 rounded-lg p-3 border border-slate-100">
          <p className="font-semibold text-slate-700 text-sm">{visita.familia_nome}</p>
          {visita.endereco && <p className="flex items-center gap-1"><MapPin size={11}/>{visita.endereco}{visita.bairro ? `, ${visita.bairro}` : ""}</p>}
          {visita.tecnico_responsavel && <p className="flex items-center gap-1"><User size={11}/>{visita.tecnico_responsavel}</p>}
          {visita.data_agendamento && <p className="flex items-center gap-1"><CalendarDays size={11}/>Agendada para: {new Date(visita.data_agendamento + "T00:00").toLocaleDateString("pt-BR")}</p>}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Status *</label>
              <select
                value={form.status}
                onChange={e => set("status", e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Data da Visita</label>
              <Input
                type="date"
                value={form.data_visita}
                onChange={e => set("data_visita", e.target.value)}
                className="text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Resultado / Relato</label>
            <textarea
              value={form.resultado}
              onChange={e => set("resultado", e.target.value)}
              placeholder="Descreva o resultado da visita..."
              rows={3}
              className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Observações</label>
            <textarea
              value={form.observacoes}
              onChange={e => set("observacoes", e.target.value)}
              placeholder="Observações adicionais..."
              rows={2}
              className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.validacao_familia}
              onChange={e => set("validacao_familia", e.target.checked)}
              className="w-4 h-4 rounded accent-sky-600"
            />
            <span className="text-sm text-slate-700">Família validada durante a visita</span>
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSalvar} disabled={salvando} className="bg-sky-600 hover:bg-sky-700 gap-1.5">
            {salvando ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Salvar Registro
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ModalDetalhe({ visita, onClose, onEditar }) {
  const Item = ({ label, value }) => value ? (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm text-slate-700">{value}</p>
    </div>
  ) : null;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-700">
            <Eye size={16} /> Detalhes da Visita
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COR[visita.status] || STATUS_COR["Agendada"]}`}>
              {visita.status}
            </span>
            {visita.prioridade_visita && (
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${PRIORIDADE_COR[visita.prioridade_visita]}`}>
                {visita.prioridade_visita}
              </span>
            )}
            {visita.validacao_familia && (
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                <CheckCircle2 size={13}/> Família validada
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Item label="Família" value={visita.familia_nome} />
            <Item label="Técnico" value={visita.tecnico_responsavel} />
            <Item label="Data Agendamento" value={visita.data_agendamento ? new Date(visita.data_agendamento + "T00:00").toLocaleDateString("pt-BR") : null} />
            <Item label="Data Visita" value={visita.data_visita ? new Date(visita.data_visita + "T00:00").toLocaleDateString("pt-BR") : null} />
            <Item label="Tipo" value={visita.tipo_visita} />
            <Item label="Município" value={visita.municipio} />
            <Item label="Endereço" value={visita.endereco} />
            <Item label="Bairro" value={visita.bairro} />
          </div>

          {visita.resultado && (
            <div>
              <p className="text-xs text-slate-400 mb-1">Resultado</p>
              <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 border border-slate-100">{visita.resultado}</p>
            </div>
          )}

          {visita.observacoes && (
            <div>
              <p className="text-xs text-slate-400 mb-1">Observações</p>
              <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 border border-slate-100">{visita.observacoes}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Fechar</Button>
          <Button onClick={onEditar} className="bg-sky-600 hover:bg-sky-700 gap-1.5">
            <Edit2 size={14} /> Editar Registro
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function VisitaRegistro() {
  const [visitas, setVisitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroPrioridade, setFiltroPrioridade] = useState("");
  const [filtroTecnico, setFiltroTecnico] = useState("");
  const [mes, setMes] = useState(() => new Date().toISOString().slice(0, 7));
  const [selecionada, setSelecionada] = useState(null);
  const [editando, setEditando] = useState(null);

  const carregar = async () => {
    setLoading(true);
    const data = await base44.entities.VisitaCampo.list("-data_agendamento", 1000);
    setVisitas(data);
    setLoading(false);
  };

  useEffect(() => { carregar(); }, []);

  const tecnicos = useMemo(() => [...new Set(visitas.map(v => v.tecnico_responsavel).filter(Boolean))], [visitas]);

  const listaFiltrada = useMemo(() => {
    return visitas.filter(v => {
      if (filtroStatus && v.status !== filtroStatus) return false;
      if (filtroPrioridade && v.prioridade_visita !== filtroPrioridade) return false;
      if (filtroTecnico && v.tecnico_responsavel !== filtroTecnico) return false;
      if (mes && v.data_agendamento && !v.data_agendamento.startsWith(mes)) return false;
      if (busca) {
        const q = busca.toLowerCase();
        if (!v.familia_nome?.toLowerCase().includes(q) &&
            !v.municipio?.toLowerCase().includes(q) &&
            !v.bairro?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [visitas, filtroStatus, filtroPrioridade, filtroTecnico, mes, busca]);

  const kpis = useMemo(() => ({
    total: listaFiltrada.length,
    realizadas: listaFiltrada.filter(v => v.status === "Realizada").length,
    agendadas: listaFiltrada.filter(v => v.status === "Agendada").length,
    naoLocalizadas: listaFiltrada.filter(v => v.status === "Não Localizada").length,
  }), [listaFiltrada]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ClipboardList size={20} className="text-sky-600" />
            Registro de Visitas
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Acompanhe e registre os resultados das visitas de campo</p>
        </div>
        <Button variant="outline" onClick={carregar} disabled={loading} className="gap-1.5">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Atualizar
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: kpis.total, cor: "text-slate-700", bg: "bg-slate-50" },
          { label: "Realizadas", value: kpis.realizadas, cor: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Agendadas", value: kpis.agendadas, cor: "text-sky-600", bg: "bg-sky-50" },
          { label: "Não Localizadas", value: kpis.naoLocalizadas, cor: "text-slate-500", bg: "bg-slate-50" },
        ].map(k => (
          <div key={k.label} className={`${k.bg} rounded-xl border border-slate-200 p-4 text-center`}>
            <p className={`text-2xl font-bold ${k.cor}`}>{k.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <Filter size={14} /> Filtros
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Buscar família, bairro..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="pl-8 text-sm"
            />
          </div>
          <input
            type="month"
            value={mes}
            onChange={e => setMes(e.target.value)}
            className="text-sm border border-slate-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          <select
            value={filtroStatus}
            onChange={e => setFiltroStatus(e.target.value)}
            className="text-sm border border-slate-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="">Todos os status</option>
            {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={filtroPrioridade}
            onChange={e => setFiltroPrioridade(e.target.value)}
            className="text-sm border border-slate-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="">Todas as prioridades</option>
            {["Urgente","Alta","Normal","Baixa"].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select
            value={filtroTecnico}
            onChange={e => setFiltroTecnico(e.target.value)}
            className="text-sm border border-slate-200 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="">Todos os técnicos</option>
            {tecnicos.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        {(busca || filtroStatus || filtroPrioridade || filtroTecnico) && (
          <Button variant="ghost" size="sm" onClick={() => { setBusca(""); setFiltroStatus(""); setFiltroPrioridade(""); setFiltroTecnico(""); }} className="text-xs text-slate-500 h-6">
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-sky-500" />
          </div>
        ) : listaFiltrada.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <ClipboardList size={40} className="mb-3 opacity-30" />
            <p className="text-sm">Nenhuma visita encontrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-700 text-white text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Família</th>
                  <th className="px-4 py-3 text-left">Técnico</th>
                  <th className="px-4 py-3 text-center">Agendada</th>
                  <th className="px-4 py-3 text-center">Realizada</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Prioridade</th>
                  <th className="px-4 py-3 text-left">Município</th>
                  <th className="px-4 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {listaFiltrada.map((v, i) => (
                  <tr
                    key={v.id}
                    className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-700">{v.familia_nome}</p>
                      {v.bairro && <p className="text-xs text-slate-400">{v.bairro}</p>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{v.tecnico_responsavel || "—"}</td>
                    <td className="px-4 py-3 text-center text-slate-500 text-xs">
                      {v.data_agendamento ? new Date(v.data_agendamento + "T00:00").toLocaleDateString("pt-BR") : "—"}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-500 text-xs">
                      {v.data_visita ? new Date(v.data_visita + "T00:00").toLocaleDateString("pt-BR") : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COR[v.status] || STATUS_COR["Agendada"]}`}>
                        {v.status || "Agendada"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {v.prioridade_visita ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORIDADE_COR[v.prioridade_visita]}`}>
                          {v.prioridade_visita}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{v.municipio || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelecionada(v)}
                          className="p-1.5 rounded-lg hover:bg-sky-50 text-slate-400 hover:text-sky-600 transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => setEditando(v)}
                          className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors"
                          title="Registrar visita"
                        >
                          <Edit2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Rodapé */}
        {!loading && listaFiltrada.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-400">
            {listaFiltrada.length} visita(s) exibida(s)
          </div>
        )}
      </div>

      {/* Modais */}
      {selecionada && !editando && (
        <ModalDetalhe
          visita={selecionada}
          onClose={() => setSelecionada(null)}
          onEditar={() => { setEditando(selecionada); setSelecionada(null); }}
        />
      )}
      {editando && (
        <ModalRegistro
          visita={editando}
          onClose={() => setEditando(null)}
          onSalvo={() => { setEditando(null); carregar(); }}
        />
      )}
    </div>
  );
}