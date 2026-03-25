import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, CalendarDays, ChevronLeft, ChevronRight, Loader2,
  User, Clock, CheckCircle2, XCircle, AlertCircle, ChevronUp, Pencil, Trash2, Camera
} from "lucide-react";
import UploadFotos from "../visitas/UploadFotos";
import { toast } from "sonner";

const TECNICOS = ["Ana Lima", "Carlos Souza", "Fernanda Rocha", "João Mendes", "Maria Santos", "Paulo Alves"];
const TIPOS = ["Busca Ativa", "Acompanhamento", "Validação", "Monitoramento"];
const STATUS_OPTIONS = ["Agendada", "Confirmada", "Realizada", "Cancelada", "Reagendada", "Não Localizada"];

const STATUS_STYLE = {
  "Agendada":       { cls: "bg-sky-100 text-sky-700",     icon: Clock },
  "Confirmada":     { cls: "bg-blue-100 text-blue-700",   icon: CheckCircle2 },
  "Realizada":      { cls: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  "Cancelada":      { cls: "bg-red-100 text-red-700",     icon: XCircle },
  "Reagendada":     { cls: "bg-amber-100 text-amber-700", icon: AlertCircle },
  "Não Localizada": { cls: "bg-slate-100 text-slate-600", icon: AlertCircle },
};

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DIAS_SEMANA = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

const FORM_INICIAL = {
  data_agendamento: "",
  tecnico_responsavel: "",
  tipo_visita: "Acompanhamento",
  status: "Agendada",
  observacoes: "",
  data_visita: "",
  resultado: "",
  fotos: [],
};

function MiniCalendario({ visitas, mes, onMes, onDia, diaSelecionado }) {
  const ano = mes.getFullYear();
  const mesIdx = mes.getMonth();
  const primeiroDia = new Date(ano, mesIdx, 1).getDay();
  const totalDias = new Date(ano, mesIdx + 1, 0).getDate();
  const hoje = new Date().toISOString().split("T")[0];

  const visitasPorDia = useMemo(() => {
    const m = {};
    visitas.forEach((v) => {
      if (v.data_agendamento) {
        if (!m[v.data_agendamento]) m[v.data_agendamento] = [];
        m[v.data_agendamento].push(v);
      }
    });
    return m;
  }, [visitas]);

  const cells = [];
  for (let i = 0; i < primeiroDia; i++) cells.push(null);
  for (let d = 1; d <= totalDias; d++) cells.push(d);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => onMes(-1)} className="p-1 rounded hover:bg-slate-100">
          <ChevronLeft size={15} />
        </button>
        <span className="text-sm font-semibold text-slate-700">{MESES[mesIdx]} {ano}</span>
        <button onClick={() => onMes(1)} className="p-1 rounded hover:bg-slate-100">
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 mb-1">
        {DIAS_SEMANA.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-slate-400 py-1">{d}</div>
        ))}
      </div>

      {/* Dias */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((dia, i) => {
          if (!dia) return <div key={`e-${i}`} />;
          const dateStr = `${ano}-${String(mesIdx + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
          const visitsOnDay = visitasPorDia[dateStr] || [];
          const isHoje = dateStr === hoje;
          const isSel = dateStr === diaSelecionado;
          const hasVisit = visitsOnDay.length > 0;

          return (
            <button
              key={dia}
              onClick={() => onDia(isSel ? null : dateStr)}
              className={`relative flex flex-col items-center justify-center rounded-lg py-1.5 text-xs font-medium transition-all
                ${isSel ? "bg-sky-600 text-white shadow" :
                  isHoje ? "bg-sky-50 text-sky-700 font-bold ring-1 ring-sky-300" :
                  hasVisit ? "hover:bg-slate-100 text-slate-700" :
                  "hover:bg-slate-50 text-slate-600"}`}
            >
              {dia}
              {hasVisit && (
                <div className="flex gap-0.5 mt-0.5">
                  {visitsOnDay.slice(0, 3).map((v, idx) => {
                    const st = STATUS_STYLE[v.status] || STATUS_STYLE["Agendada"];
                    return (
                      <span
                        key={idx}
                        className={`w-1.5 h-1.5 rounded-full ${isSel ? "bg-white/70" : st.cls.split(" ")[0].replace("bg-", "bg-")}`}
                      />
                    );
                  })}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="flex gap-3 mt-3 pt-3 border-t border-slate-100 flex-wrap">
        {[["Agendada", "bg-sky-100"], ["Confirmada", "bg-blue-100"], ["Realizada", "bg-emerald-100"], ["Cancelada", "bg-red-100"]].map(([label, bg]) => (
          <div key={label} className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${bg}`} />
            <span className="text-[10px] text-slate-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function VisitaCard({ visita, onEditar, onExcluir }) {
  const st = STATUS_STYLE[visita.status] || STATUS_STYLE["Agendada"];
  const Icon = st.icon;
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-start gap-3 hover:border-sky-200 transition-colors">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${st.cls}`}>
        <Icon size={12} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.cls}`}>{visita.status}</span>
          <span className="text-xs text-slate-400">
            {visita.data_agendamento ? new Date(visita.data_agendamento + "T00:00:00").toLocaleDateString("pt-BR") : "—"}
          </span>
        </div>
        <p className="text-sm font-medium text-slate-700 mt-1">{visita.tipo_visita || "Visita"}</p>
        {visita.tecnico_responsavel && (
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
            <User size={10} /> {visita.tecnico_responsavel}
          </p>
        )}
        {visita.resultado && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 italic">"{visita.resultado}"</p>
        )}
        {visita.fotos?.length > 0 && (
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {visita.fotos.slice(0, 4).map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                <img src={url} alt={`Foto ${i+1}`} className="w-10 h-10 rounded object-cover border border-slate-200 hover:opacity-80 transition-opacity" />
              </a>
            ))}
            {visita.fotos.length > 4 && (
              <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-xs text-slate-500 font-medium">
                +{visita.fotos.length - 4}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 flex-shrink-0">
        <button onClick={() => onEditar(visita)} className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600">
          <Pencil size={12} />
        </button>
        <button onClick={() => onExcluir(visita.id)} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500">
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

function FormAgendamento({ familia, visitaEditando, onSalvo, onCancelar }) {
  const [form, setForm] = useState(FORM_INICIAL);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(visitaEditando ? { ...FORM_INICIAL, ...visitaEditando } : { ...FORM_INICIAL });
  }, [visitaEditando]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.data_agendamento || !form.tecnico_responsavel) return;
    setSaving(true);
    const payload = {
      ...form,
      familia_id: familia.id,
      familia_nome: familia.nome_responsavel,
      endereco: familia.endereco,
      bairro: familia.bairro,
      municipio: familia.municipio,
      regiao: familia.regiao,
      latitude: familia.latitude,
      longitude: familia.longitude,
    };
    if (visitaEditando?.id) {
      await base44.entities.VisitaCampo.update(visitaEditando.id, payload);
      // Atualiza status da família automaticamente ao concluir visita
      if (form.status === "Realizada" && familia.id) {
        await base44.entities.Familia.update(familia.id, { situacao_cadastral: "Ativo" });
        toast.success("Visita registrada! Status da família atualizado para Ativo.");
      } else {
        toast.success("Agendamento atualizado!");
      }
    } else {
      await base44.entities.VisitaCampo.create(payload);
      toast.success("Visita agendada!");
    }
    setSaving(false);
    onSalvo();
  };

  return (
    <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 space-y-3">
      <h4 className="text-xs font-semibold text-sky-700 uppercase tracking-wider">
        {visitaEditando?.id ? "Editar Agendamento" : "Nova Visita de Campo"}
      </h4>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">Data *</label>
          <Input
            type="date"
            value={form.data_agendamento}
            onChange={(e) => set("data_agendamento", e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">Tipo de Visita</label>
          <Select value={form.tipo_visita} onValueChange={(v) => set("tipo_visita", v)}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {TIPOS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">Técnico Responsável *</label>
          <Select value={form.tecnico_responsavel} onValueChange={(v) => set("tecnico_responsavel", v)}>
            <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Selecionar..." /></SelectTrigger>
            <SelectContent>
              {TECNICOS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">Status</label>
          <Select value={form.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">Observações</label>
        <Textarea
          rows={2}
          value={form.observacoes}
          onChange={(e) => set("observacoes", e.target.value)}
          placeholder="Orientações para o técnico..."
        />
      </div>

      {/* Campos de registro — visível ao concluir */}
      {(form.status === "Realizada" || form.status === "Não Localizada") && (
        <div className="border-t border-sky-200 pt-3 space-y-3">
          <p className="text-xs font-semibold text-sky-700 uppercase tracking-wider">Registro da Visita</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Data da Visita</label>
              <Input
                type="date"
                value={form.data_visita}
                onChange={(e) => set("data_visita", e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1 col-span-2">
              <label className="text-xs font-medium text-slate-600">Resultado / Parecer Técnico</label>
              <Textarea
                rows={2}
                value={form.resultado}
                onChange={(e) => set("resultado", e.target.value)}
                placeholder="Descreva o resultado da visita..."
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
              <Camera size={12} /> Fotos da Visita
            </label>
            <UploadFotos fotos={form.fotos || []} onChange={(f) => set("fotos", f)} />
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button size="sm" variant="outline" onClick={onCancelar} disabled={saving}>
          <ChevronUp size={13} /> Cancelar
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={saving || !form.data_agendamento || !form.tecnico_responsavel}
          className="bg-sky-600 hover:bg-sky-700 gap-1.5"
        >
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
          {saving ? "Salvando..." : visitaEditando?.id ? "Salvar" : "Agendar Visita"}
        </Button>
      </div>
    </div>
  );
}

export default function FamiliaAgendamentos({ familia }) {
  const [visitas, setVisitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mes, setMes] = useState(new Date());
  const [diaSelecionado, setDiaSelecionado] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    if (familia?.id) carregar();
  }, [familia?.id]);

  const carregar = async () => {
    setLoading(true);
    const data = await base44.entities.VisitaCampo.filter({ familia_id: familia.id }, "-data_agendamento", 200);
    setVisitas(data);
    setLoading(false);
  };

  const handleEditar = (v) => {
    setEditando(v);
    setShowForm(true);
  };

  const handleExcluir = async (id) => {
    if (!window.confirm("Deseja excluir este agendamento?")) return;
    await base44.entities.VisitaCampo.delete(id);
    toast.success("Agendamento removido.");
    carregar();
  };

  const handleSalvo = () => {
    setShowForm(false);
    setEditando(null);
    carregar();
  };

  const visitasFiltradas = useMemo(() => {
    if (diaSelecionado) return visitas.filter((v) => v.data_agendamento === diaSelecionado);
    const ano = mes.getFullYear();
    const mesStr = String(mes.getMonth() + 1).padStart(2, "0");
    return visitas.filter((v) => v.data_agendamento?.startsWith(`${ano}-${mesStr}`));
  }, [visitas, diaSelecionado, mes]);

  // KPIs rápidos
  const totalAgendadas = visitas.filter((v) => v.status === "Agendada").length;
  const totalConfirmadas = visitas.filter((v) => v.status === "Confirmada").length;
  const totalRealizadas = visitas.filter((v) => v.status === "Realizada").length;

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Agendadas", val: totalAgendadas, cls: "bg-sky-50 text-sky-700 border-sky-200" },
          { label: "Confirmadas", val: totalConfirmadas, cls: "bg-blue-50 text-blue-700 border-blue-200" },
          { label: "Realizadas", val: totalRealizadas, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
        ].map(({ label, val, cls }) => (
          <div key={label} className={`rounded-lg border p-2.5 text-center ${cls}`}>
            <p className="text-xl font-bold">{val}</p>
            <p className="text-[10px] font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Botão novo agendamento */}
      <div className="flex justify-end">
        <Button
          size="sm"
          variant={showForm && !editando ? "outline" : "default"}
          className={showForm && !editando ? "" : "bg-sky-600 hover:bg-sky-700 gap-1.5"}
          onClick={() => { setShowForm(!showForm); setEditando(null); }}
        >
          {showForm && !editando ? <><ChevronUp size={13} /> Cancelar</> : <><Plus size={13} /> Agendar Visita</>}
        </Button>
      </div>

      {/* Formulário */}
      {showForm && (
        <FormAgendamento
          familia={familia}
          visitaEditando={editando}
          onSalvo={handleSalvo}
          onCancelar={() => { setShowForm(false); setEditando(null); }}
        />
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={18} className="animate-spin text-sky-500 mr-2" />
          <span className="text-sm text-slate-500">Carregando agendamentos...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-4 items-start">
          {/* Calendário */}
          <div className="sm:w-64">
            <MiniCalendario
              visitas={visitas}
              mes={mes}
              onMes={(d) => setMes((m) => new Date(m.getFullYear(), m.getMonth() + d, 1))}
              onDia={setDiaSelecionado}
              diaSelecionado={diaSelecionado}
            />
          </div>

          {/* Lista */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {diaSelecionado
                  ? new Date(diaSelecionado + "T00:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })
                  : `${MESES[mes.getMonth()]} ${mes.getFullYear()}`}
              </p>
              {diaSelecionado && (
                <button onClick={() => setDiaSelecionado(null)} className="text-xs text-sky-600 hover:underline">
                  Ver todo o mês
                </button>
              )}
            </div>

            {visitasFiltradas.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <CalendarDays size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhuma visita neste período.</p>
              </div>
            ) : (
              visitasFiltradas.map((v) => (
                <VisitaCard key={v.id} visita={v} onEditar={handleEditar} onExcluir={handleExcluir} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}