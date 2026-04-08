import { useState, useEffect } from "react";
import { db } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText, MapPin, Heart, User, RefreshCw, Plus, Loader2,
  StickyNote, Calendar, ChevronDown, ChevronUp
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const tipoConfig = {
  "Nota":        { icon: StickyNote, color: "bg-slate-100 text-slate-600",  line: "border-slate-300" },
  "Atendimento": { icon: User,       color: "bg-purple-100 text-purple-600", line: "border-purple-300" },
  "Visita":      { icon: MapPin,     color: "bg-sky-100 text-sky-600",       line: "border-sky-300" },
  "Benefício":   { icon: Heart,      color: "bg-emerald-100 text-emerald-600", line: "border-emerald-300" },
  "Cadastro":    { icon: FileText,   color: "bg-amber-100 text-amber-600",   line: "border-amber-300" },
  "Atualização": { icon: RefreshCw,  color: "bg-orange-100 text-orange-600", line: "border-orange-300" },
};

function TimelineItem({ item }) {
  const cfg = tipoConfig[item.tipo] || tipoConfig["Nota"];
  const Icon = cfg.icon;
  const data = item.data_evento ? format(new Date(item.data_evento), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : "—";

  return (
    <div className="flex gap-4 group">
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
          <Icon size={14} />
        </div>
        <div className={`w-0.5 flex-1 mt-1 border-l-2 border-dashed ${cfg.line} min-h-[24px]`} />
      </div>
      <div className="pb-5 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>{item.tipo}</span>
            {item.titulo && <p className="text-sm font-semibold text-slate-800 mt-1">{item.titulo}</p>}
          </div>
          <span className="text-xs text-slate-400 flex-shrink-0 flex items-center gap-1">
            <Calendar size={11} /> {data}
          </span>
        </div>
        <p className="text-sm text-slate-600 mt-1 leading-relaxed">{item.descricao}</p>
        {item.usuario && (
          <p className="text-xs text-slate-400 mt-1">Por: {item.usuario}</p>
        )}
      </div>
    </div>
  );
}

export default function FamiliaHistorico({ familia }) {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nota, setNota] = useState({ tipo: "Nota", titulo: "", descricao: "" });

  useEffect(() => {
    if (!familia?.id) return;
    carregarHistorico();
  }, [familia?.id]);

  const carregarHistorico = async () => {
    setLoading(true);
    try {
      // Busca notas/atendimentos manuais
      const manuais = await db.HistoricoFamilia.filter(
        { familia_id: familia.id }, "-data_evento", 100
      );

      // Busca visitas de campo
      const visitas = await db.VisitaCampo.filter(
        { familia_id: familia.id }, "-data_agendamento", 100
      );

      // Busca contemplações (benefícios)
      const contemplacoes = await db.Contemplacao.filter(
        { familia_id: familia.id }, "-data_contemplacao", 100
      );

      const visitasTimeline = visitas.map((v) => ({
        id: `v-${v.id}`,
        tipo: "Visita",
        titulo: `Visita ${v.tipo_visita || "de Campo"} — ${v.status || ""}`,
        descricao: v.observacoes || v.resultado || `Agendada para ${v.data_agendamento || "—"}`,
        data_evento: v.data_visita || v.data_agendamento,
        usuario: v.tecnico_responsavel,
      }));

      const beneficiosTimeline = contemplacoes.map((c) => ({
        id: `c-${c.id}`,
        tipo: "Benefício",
        titulo: c.programa_nome || "Programa Social",
        descricao: `Status: ${c.status || "—"}${c.valor ? ` • Valor: R$ ${parseFloat(c.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : ""}${c.observacoes ? ` • ${c.observacoes}` : ""}`,
        data_evento: c.data_contemplacao,
        usuario: c.tecnico_responsavel,
      }));

      const todos = [...manuais, ...visitasTimeline, ...beneficiosTimeline].sort((a, b) => {
        return new Date(b.data_evento || 0) - new Date(a.data_evento || 0);
      });

      setItens(todos);
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async () => {
    if (!nota.descricao.trim()) return;
    setSaving(true);
    await db.HistoricoFamilia.create({
      familia_id: familia.id,
      familia_nome: familia.nome_responsavel,
      tipo: nota.tipo,
      titulo: nota.titulo,
      descricao: nota.descricao,
      data_evento: new Date().toISOString(),
    });
    setNota({ tipo: "Nota", titulo: "", descricao: "" });
    setShowForm(false);
    await carregarHistorico();
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      {/* Botão adicionar nota */}
      <div className="flex justify-end">
        <Button
          size="sm"
          variant={showForm ? "outline" : "default"}
          className={showForm ? "" : "bg-sky-600 hover:bg-sky-700 gap-1.5"}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? <><ChevronUp size={14} /> Cancelar</> : <><Plus size={14} /> Adicionar Nota</>}
        </Button>
      </div>

      {/* Formulário de nota */}
      {showForm && (
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 space-y-3">
          <h4 className="text-xs font-semibold text-sky-700 uppercase tracking-wider">Nova Nota de Acompanhamento</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Tipo</label>
              <Select value={nota.tipo} onValueChange={(v) => setNota((n) => ({ ...n, tipo: v }))}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(tipoConfig).map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Título (opcional)</label>
              <input
                className="w-full h-8 px-3 text-sm border border-slate-200 rounded-md bg-white outline-none focus:ring-2 focus:ring-sky-500"
                value={nota.titulo}
                onChange={(e) => setNota((n) => ({ ...n, titulo: e.target.value }))}
                placeholder="Ex: Acompanhamento mensal"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">Descrição *</label>
            <Textarea
              rows={3}
              value={nota.descricao}
              onChange={(e) => setNota((n) => ({ ...n, descricao: e.target.value }))}
              placeholder="Descreva o atendimento, observação ou nota de acompanhamento..."
            />
          </div>
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleSalvar}
              disabled={saving || !nota.descricao.trim()}
              className="bg-sky-600 hover:bg-sky-700 gap-1.5"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
              {saving ? "Salvando..." : "Salvar Nota"}
            </Button>
          </div>
        </div>
      )}

      {/* Timeline */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 size={20} className="animate-spin text-sky-500" />
          <span className="ml-2 text-sm text-slate-500">Carregando histórico...</span>
        </div>
      ) : itens.length === 0 ? (
        <div className="text-center py-10 text-slate-400">
          <FileText size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">Nenhum registro encontrado.</p>
          <p className="text-xs mt-1">Adicione uma nota para iniciar o histórico desta família.</p>
        </div>
      ) : (
        <div className="pt-2">
          {itens.map((item) => (
            <TimelineItem key={item.id || item.created_date} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}