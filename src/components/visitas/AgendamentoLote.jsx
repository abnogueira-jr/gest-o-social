import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import {
  ShieldAlert, FilterX, Calendar, Users, CheckSquare,
  Square, Zap, AlertTriangle, ChevronRight
} from "lucide-react";

// ── Mesma lógica de pontuação da EscalaVulnerabilidade ──────────────────────
function calcularPontuacao(f) {
  let s = 0;
  const mb = f.membros_familiares || [];
  const idades = mb.map(m => {
    if (!m.data_nascimento) return null;
    return Math.floor((new Date() - new Date(m.data_nascimento)) / (1000 * 60 * 60 * 24 * 365.25));
  }).filter(v => v !== null);
  if (idades.some(i => i <= 3)) s += 30;
  if (idades.some(i => i >= 4 && i <= 6)) s += 30;
  if (idades.some(i => i >= 7 && i <= 15)) s += 20;
  if (f.possui_deficiencia || mb.some(m => m.possui_deficiencia)) s += 40;
  if (mb.some(m => m.possui_autismo)) s += 50;
  if (idades.some(i => i >= 60 && i <= 70)) s += 20;
  if (idades.some(i => i > 70)) s += 30;
  if (f.possui_doenca || mb.some(m => m.possui_doenca)) s += 20;
  const rpc = parseFloat(f.renda_per_capita) || 0;
  if (rpc === 0) s += 60; else if (rpc <= 105) s += 50; else if (rpc <= 218) s += 30;
  if (!f.possui_beneficio) s += 20;
  if (f.situacao_moradia === "Irregular") s += 30;
  s += Math.min((parseInt(f.num_membros) || 1) * 5, 40);
  return s;
}

function prioridadePorPontuacao(p) {
  if (p >= 150) return "Urgente";
  if (p >= 100) return "Alta";
  if (p >= 60)  return "Normal";
  return "Baixa";
}

const PRIORIDADE_COR = {
  "Urgente": "bg-red-100 text-red-700",
  "Alta":    "bg-orange-100 text-orange-700",
  "Normal":  "bg-sky-100 text-sky-700",
  "Baixa":   "bg-slate-100 text-slate-600",
};

const STEPS = ["Selecionar Famílias", "Configurar Agendamento", "Confirmar"];

export default function AgendamentoLote({ open, onClose, onSalvo, familiasPre = [] }) {
  const [step, setStep] = useState(0);
  const [familias, setFamilias] = useState([]);
  const [loadingFamilias, setLoadingFamilias] = useState(true);
  const [selecionadas, setSelecionadas] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtroFaixa, setFiltroFaixa] = useState("");

  // Configuração do agendamento
  const [tecnico, setTecnico] = useState("");
  const [dataInicio, setDataInicio] = useState(() => new Date().toISOString().split("T")[0]);
  const [intervalo, setIntervalo] = useState(1); // dias entre visitas
  const [visitas_por_dia, setVisitasPorDia] = useState(4);
  const [observacoes, setObservacoes] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!open) return;
    setBusca(""); setFiltroFaixa("");
    setLoadingFamilias(true);
    base44.entities.Familia.list("-created_date", 1000)
      .then(data => {
        const comPontuacao = data
          .map(f => ({ ...f, _pontuacao: calcularPontuacao(f), _prioridade: prioridadePorPontuacao(calcularPontuacao(f)) }))
          .sort((a, b) => b._pontuacao - a._pontuacao);
        setFamilias(comPontuacao);
        // Se veio pré-seleção da Escala, pula direto pro step 1
        if (familiasPre.length > 0) {
          setSelecionadas(familiasPre.map(f => f.id));
          setStep(1);
        } else {
          setSelecionadas([]);
          setStep(0);
        }
        setLoadingFamilias(false);
      })
      .catch(() => setLoadingFamilias(false));
  }, [open]);

  const listaFiltrada = useMemo(() => {
    return familias.filter(f => {
      if (filtroFaixa && f.faixa_pobreza !== filtroFaixa) return false;
      if (busca && !f.nome_responsavel?.toLowerCase().includes(busca.toLowerCase()) &&
          !f.municipio?.toLowerCase().includes(busca.toLowerCase())) return false;
      return true;
    });
  }, [familias, filtroFaixa, busca]);

  const toggleSelecao = (id) => {
    setSelecionadas(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleTodos = () => {
    const ids = listaFiltrada.map(f => f.id);
    const todosSelecionados = ids.every(id => selecionadas.includes(id));
    setSelecionadas(todosSelecionados
      ? selecionadas.filter(id => !ids.includes(id))
      : [...new Set([...selecionadas, ...ids])]
    );
  };

  // Gera preview das datas distribuídas
  const previewAgendamento = useMemo(() => {
    if (!selecionadas.length || !dataInicio) return [];
    const familiasSel = selecionadas
      .map(id => familias.find(f => f.id === id))
      .filter(Boolean)
      .sort((a, b) => b._pontuacao - a._pontuacao);

    const resultado = [];
    let diaIdx = 0;
    let contDia = 0;
    const vpd = Math.max(1, parseInt(visitas_por_dia) || 4);
    const intv = Math.max(1, parseInt(intervalo) || 1);

    familiasSel.forEach(f => {
      if (contDia >= vpd) { diaIdx++; contDia = 0; }
      const dt = new Date(dataInicio + "T12:00:00");
      dt.setDate(dt.getDate() + diaIdx * intv);
      resultado.push({ familia: f, data: dt.toISOString().split("T")[0] });
      contDia++;
    });
    return resultado;
  }, [selecionadas, familias, dataInicio, intervalo, visitas_por_dia]);

  const handleSalvar = async () => {
    if (!tecnico.trim()) { toast.error("Informe o técnico responsável."); return; }
    setSalvando(true);
    try {
      const registros = previewAgendamento.map(({ familia, data }) => ({
        familia_id: familia.id,
        familia_nome: familia.nome_responsavel,
        tecnico_responsavel: tecnico,
        data_agendamento: data,
        status: "Agendada",
        tipo_visita: "Busca Ativa",
        prioridade_visita: familia._prioridade,
        endereco: familia.endereco || "",
        bairro: familia.bairro || "",
        municipio: familia.municipio || "",
        observacoes: observacoes || `Gerado automaticamente pela Busca Ativa. Pontuação: ${familia._pontuacao}`,
      }));
      await base44.entities.VisitaCampo.bulkCreate(registros);
      toast.success(`${registros.length} visitas agendadas com sucesso!`);
      onSalvo();
    } catch (e) {
      toast.error("Erro ao agendar visitas.");
    } finally {
      setSalvando(false);
    }
  };

  const famSelecionadasObj = selecionadas.map(id => familias.find(f => f.id === id)).filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sky-700">
            <Calendar size={18} />
            Agendamento em Lote — Busca Ativa
          </DialogTitle>
        </DialogHeader>

        {/* Steps */}
        <div className="flex items-center gap-1 mb-4">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-1 flex-1">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium flex-1 justify-center transition-all ${
                i === step ? "bg-sky-600 text-white" :
                i < step ? "bg-sky-100 text-sky-700" :
                "bg-slate-100 text-slate-400"
              }`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  i === step ? "bg-white/30" : i < step ? "bg-sky-200" : "bg-slate-200"
                }`}>{i + 1}</span>
                {s}
              </div>
              {i < STEPS.length - 1 && <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />}
            </div>
          ))}
        </div>

        {/* ── STEP 0: SELECIONAR FAMÍLIAS ─────────────────────────── */}
        {step === 0 && (
          <div className="space-y-3">
            {/* Filtros */}
            <div className="flex gap-2 flex-wrap">
              <Input
                placeholder="Buscar por nome ou município..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="text-sm flex-1 min-w-[200px]"
              />
              <select
                value={filtroFaixa}
                onChange={e => setFiltroFaixa(e.target.value)}
                className="text-sm border border-slate-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-sky-400"
              >
                <option value="">Todas as faixas</option>
                {["Extrema Pobreza", "Pobreza", "Baixa Renda"].map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              {(busca || filtroFaixa) && (
                <Button variant="outline" size="sm" onClick={() => { setBusca(""); setFiltroFaixa(""); }} className="gap-1">
                  <FilterX size={12} /> Limpar
                </Button>
              )}
            </div>

            {/* Info seleção */}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{listaFiltrada.length} famílias exibidas · <strong className="text-sky-600">{selecionadas.length} selecionadas</strong></span>
              <button onClick={toggleTodos} className="flex items-center gap-1 text-sky-600 hover:underline font-medium">
                {listaFiltrada.every(f => selecionadas.includes(f.id)) ? <CheckSquare size={13} /> : <Square size={13} />}
                {listaFiltrada.every(f => selecionadas.includes(f.id)) ? "Desmarcar todos" : "Selecionar todos"}
              </button>
            </div>

            {/* Tabela */}
            {loadingFamilias ? (
              <div className="flex justify-center py-8">
                <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-y-auto max-h-[320px]">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-slate-700 text-white">
                      <tr>
                        <th className="px-3 py-2 w-8"></th>
                        <th className="px-3 py-2 text-left">Família</th>
                        <th className="px-3 py-2 text-left">Município</th>
                        <th className="px-3 py-2 text-center">Pontuação</th>
                        <th className="px-3 py-2 text-center">Prioridade</th>
                        <th className="px-3 py-2 text-left">Faixa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listaFiltrada.map((f, i) => {
                        const sel = selecionadas.includes(f.id);
                        return (
                          <tr
                            key={f.id}
                            onClick={() => toggleSelecao(f.id)}
                            className={`border-b border-slate-100 cursor-pointer transition-colors ${
                              sel ? "bg-sky-50" : i % 2 === 0 ? "bg-white hover:bg-slate-50" : "bg-slate-50/50 hover:bg-slate-50"
                            }`}
                          >
                            <td className="px-3 py-2 text-center">
                              {sel
                                ? <CheckSquare size={14} className="text-sky-600 mx-auto" />
                                : <Square size={14} className="text-slate-300 mx-auto" />
                              }
                            </td>
                            <td className="px-3 py-2 font-medium text-slate-700">{f.nome_responsavel}</td>
                            <td className="px-3 py-2 text-slate-500">{f.municipio || "—"}</td>
                            <td className="px-3 py-2 text-center font-bold text-sky-700">{f._pontuacao}</td>
                            <td className="px-3 py-2 text-center">
                              <span className={`px-1.5 py-0.5 rounded-full font-medium text-[10px] ${PRIORIDADE_COR[f._prioridade]}`}>
                                {f._prioridade}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-slate-500">{f.faixa_pobreza || "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                onClick={() => setStep(1)}
                disabled={selecionadas.length === 0}
                className="bg-sky-600 hover:bg-sky-700 gap-1.5"
              >
                Próximo <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 1: CONFIGURAR ──────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 flex items-center gap-3 text-sm">
              <Users size={16} className="text-sky-500 flex-shrink-0" />
              <span className="text-sky-700">
                <strong>{selecionadas.length}</strong> famílias selecionadas para agendamento
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                  Técnico / Assistente Social Responsável *
                </label>
                <Input
                  value={tecnico}
                  onChange={e => setTecnico(e.target.value)}
                  placeholder="Nome do técnico"
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                  Data de Início
                </label>
                <Input
                  type="date"
                  value={dataInicio}
                  onChange={e => setDataInicio(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                  Visitas por dia
                </label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={visitas_por_dia}
                  onChange={e => setVisitasPorDia(e.target.value)}
                  className="text-sm"
                />
                <p className="text-xs text-slate-400 mt-1">Quantas visitas serão distribuídas por dia</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                  Intervalo entre dias (dias)
                </label>
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={intervalo}
                  onChange={e => setIntervalo(e.target.value)}
                  className="text-sm"
                />
                <p className="text-xs text-slate-400 mt-1">Ex: 1 = dias consecutivos, 2 = a cada 2 dias</p>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                  Observações gerais (opcional)
                </label>
                <textarea
                  value={observacoes}
                  onChange={e => setObservacoes(e.target.value)}
                  placeholder="Observações que serão incluídas em todas as visitas..."
                  rows={2}
                  className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
                />
              </div>
            </div>

            {/* Preview distribuição */}
            {previewAgendamento.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                  <Zap size={12} className="text-sky-500" />
                  Preview da distribuição automática
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[160px] overflow-y-auto">
                  {previewAgendamento.map(({ familia, data }, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs bg-white rounded-lg px-2 py-1.5 border border-slate-100">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        familia._prioridade === "Urgente" ? "bg-red-500" :
                        familia._prioridade === "Alta" ? "bg-orange-400" :
                        familia._prioridade === "Normal" ? "bg-sky-400" : "bg-slate-300"
                      }`} />
                      <span className="truncate text-slate-700 flex-1">{familia.nome_responsavel}</span>
                      <span className="text-slate-400 flex-shrink-0">
                        {new Date(data + "T00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Período estimado: {previewAgendamento[0]?.data} → {previewAgendamento[previewAgendamento.length - 1]?.data}
                </p>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(0)}>Voltar</Button>
              <Button
                onClick={() => setStep(2)}
                disabled={!tecnico.trim()}
                className="bg-sky-600 hover:bg-sky-700 gap-1.5"
              >
                Revisar <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 2: CONFIRMAR ───────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Famílias", value: selecionadas.length, cor: "text-sky-600" },
                { label: "Técnico", value: tecnico, cor: "text-slate-700" },
                { label: "Início", value: new Date(dataInicio + "T00:00").toLocaleDateString("pt-BR"), cor: "text-slate-700" },
                { label: "Fim estimado", value: previewAgendamento.length
                    ? new Date(previewAgendamento[previewAgendamento.length-1].data + "T00:00").toLocaleDateString("pt-BR")
                    : "—", cor: "text-slate-700" },
              ].map(({ label, value, cor }) => (
                <div key={label} className="bg-slate-50 rounded-xl border border-slate-200 p-3 text-center">
                  <p className="text-xs text-slate-400 mb-1">{label}</p>
                  <p className={`text-sm font-bold ${cor}`}>{value}</p>
                </div>
              ))}
            </div>

            {/* Resumo por prioridade */}
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-600 mb-3">Distribuição por prioridade</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {["Urgente","Alta","Normal","Baixa"].map(p => {
                  const count = famSelecionadasObj.filter(f => f._prioridade === p).length;
                  return (
                    <div key={p} className={`rounded-lg p-2 text-center ${PRIORIDADE_COR[p]} border`}>
                      <p className="text-xl font-bold">{count}</p>
                      <p className="text-xs">{p}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Lista completa resumida */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                <p className="text-xs font-semibold text-slate-600">Visitas a criar ({previewAgendamento.length})</p>
              </div>
              <div className="max-h-[200px] overflow-y-auto divide-y divide-slate-50">
                {previewAgendamento.map(({ familia, data }, i) => (
                  <div key={i} className="px-4 py-2.5 flex items-center gap-3 text-xs">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      familia._prioridade === "Urgente" ? "bg-red-500" :
                      familia._prioridade === "Alta" ? "bg-orange-400" :
                      familia._prioridade === "Normal" ? "bg-sky-400" : "bg-slate-300"
                    }`} />
                    <span className="font-medium text-slate-700 flex-1 truncate">{familia.nome_responsavel}</span>
                    <span className="text-slate-400">{familia.municipio}</span>
                    <span className={`px-1.5 py-0.5 rounded-full font-medium text-[10px] ${PRIORIDADE_COR[familia._prioridade]}`}>
                      {familia._prioridade}
                    </span>
                    <span className="text-slate-500 font-medium flex-shrink-0">
                      {new Date(data + "T00:00").toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {selecionadas.length > 20 && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
                <AlertTriangle size={13} /> Você está agendando muitas visitas. Confirme se as datas estão corretas no preview.
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>Voltar</Button>
              <Button
                onClick={handleSalvar}
                disabled={salvando}
                className="bg-emerald-600 hover:bg-emerald-700 gap-1.5"
              >
                {salvando
                  ? <><div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Salvando...</>
                  : <><Calendar size={14} /> Confirmar {previewAgendamento.length} Agendamentos</>
                }
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}