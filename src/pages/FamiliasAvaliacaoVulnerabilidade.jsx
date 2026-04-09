import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, ShieldAlert, CheckCircle2, AlertTriangle,
  AlertCircle, Info, ChevronDown, ChevronUp, Save, RotateCcw
} from "lucide-react";

// ── Critérios da Escala ─────────────────────────────────────────────────────
const CRITERIOS = [
  { id: "crianca_0_3",    label: "Criança de 0 a 3 anos",                      pts: 3,  grupo: "Composição Familiar" },
  { id: "crianca_4_6",    label: "Criança de 4 a 6 anos",                      pts: 3,  grupo: "Composição Familiar" },
  { id: "crianca_7_15",   label: "Criança de 7 a 15 anos",                     pts: 2,  grupo: "Composição Familiar" },
  { id: "pcd",            label: "Pessoa com Deficiência (PCD)",               pts: 1,  grupo: "Condição de Saúde" },
  { id: "pcd_cuidados",   label: "PCD que requer cuidados",                    pts: 3,  grupo: "Condição de Saúde" },
  { id: "idoso_60_70",    label: "Idoso de 60 a 70 anos",                      pts: 2,  grupo: "Composição Familiar" },
  { id: "idoso_70plus",   label: "Idoso acima de 70 anos",                     pts: 3,  grupo: "Composição Familiar" },
  { id: "habitacao",      label: "Habitação Precária",                         pts: 1,  grupo: "Condições de Moradia" },
  { id: "inseg_alimentar",label: "Insegurança Alimentar",                      pts: 3,  grupo: "Condições Socioeconômicas" },
  { id: "violencia",      label: "Violência contra Criança / Mulher",          pts: 3,  grupo: "Situação de Risco" },
];

const FAIXAS_RENDA = [
  { id: "extrema_pobreza", label: "Extrema Pobreza",  pts: 20 },
  { id: "pobreza",         label: "Pobreza",           pts: 10 },
  { id: "baixa_renda",     label: "Baixa Renda",       pts: 0  },
  { id: "sem_renda_info",  label: "Sem informação",    pts: 0  },
];

function calcularPontuacao(marcados, faixaRenda, unipessoal) {
  let pts = CRITERIOS.filter(c => marcados.includes(c.id)).reduce((s, c) => s + c.pts, 0);
  const faixa = FAIXAS_RENDA.find(f => f.id === faixaRenda);
  let ptsRenda = faixa ? faixa.pts : 0;
  if (unipessoal) ptsRenda = Math.ceil(ptsRenda * 0.5);
  return pts + ptsRenda;
}

function classificar(total) {
  if (total >= 30) return { label: "Vulnerabilidade Extrema", cor: "red",    prioridade: "Urgente" };
  if (total >= 20) return { label: "Alta Vulnerabilidade",    cor: "orange", prioridade: "Alta"    };
  if (total >= 10) return { label: "Média Vulnerabilidade",   cor: "yellow", prioridade: "Normal"  };
  return              { label: "Baixa Vulnerabilidade",       cor: "green",  prioridade: "Baixa"   };
}

const COR_CONFIG = {
  red:    { bg: "bg-red-50",    border: "border-red-300",    text: "text-red-700",    badge: "bg-red-100 text-red-700",       icon: AlertCircle  },
  orange: { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-700", badge: "bg-orange-100 text-orange-700", icon: ShieldAlert  },
  yellow: { bg: "bg-yellow-50", border: "border-yellow-300", text: "text-yellow-700", badge: "bg-yellow-100 text-yellow-700", icon: AlertTriangle },
  green:  { bg: "bg-emerald-50",border: "border-emerald-300",text: "text-emerald-700",badge: "bg-emerald-100 text-emerald-700",icon: CheckCircle2 },
};

const grupos = [...new Set(CRITERIOS.map(c => c.grupo))];

// ── Componente principal ────────────────────────────────────────────────────
export default function FamiliasAvaliacaoVulnerabilidade() {
  const [familias, setFamilias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [familiaSel, setFamiliaSel] = useState(null);

  // Form
  const [marcados, setMarcados] = useState([]);
  const [faixaRenda, setFaixaRenda] = useState("");
  const [unipessoal, setUnipessoal] = useState(false);
  const [observacoes, setObservacoes] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [salvoOk, setSalvoOk] = useState(false);
  const [gruposAbertos, setGruposAbertos] = useState({});

  useEffect(() => {
    base44.entities.Familia.list("-created_date", 500)
      .then(data => { setFamilias(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Inicializa grupos abertos
  useEffect(() => {
    const init = {};
    grupos.forEach(g => { init[g] = true; });
    setGruposAbertos(init);
  }, []);

  const pontuacao = useMemo(() => calcularPontuacao(marcados, faixaRenda, unipessoal), [marcados, faixaRenda, unipessoal]);
  const classificacao = useMemo(() => classificar(pontuacao), [pontuacao]);
  const cfg = COR_CONFIG[classificacao.cor];
  const IconeClass = cfg.icon;

  const toggleCriterio = (id) => {
    setMarcados(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    setSalvoOk(false);
  };

  const toggleGrupo = (grupo) => {
    setGruposAbertos(prev => ({ ...prev, [grupo]: !prev[grupo] }));
  };

  const resetForm = () => {
    setMarcados([]); setFaixaRenda(""); setUnipessoal(false); setObservacoes(""); setSalvoOk(false);
  };

  const selecionarFamilia = (f) => {
    setFamiliaSel(f);
    resetForm();
    // Pré-preenche faixa de renda se disponível
    if (f.faixa_pobreza === "Extrema Pobreza") setFaixaRenda("extrema_pobreza");
    else if (f.faixa_pobreza === "Pobreza") setFaixaRenda("pobreza");
    else if (f.faixa_pobreza === "Baixa Renda") setFaixaRenda("baixa_renda");
    setBusca("");
  };

  const handleSalvar = async () => {
    if (!familiaSel) return;
    setSalvando(true);
    const payload = {
      criterios_marcados: marcados,
      faixa_renda_avaliacao: faixaRenda,
      familia_unipessoal: unipessoal,
      pontuacao_vulnerabilidade: pontuacao,
      classificacao_vulnerabilidade: classificacao.label,
      prioridade_visita_sugerida: classificacao.prioridade,
      observacoes_avaliacao: observacoes,
      data_avaliacao: new Date().toISOString(),
    };
    await base44.entities.Familia.update(familiaSel.id, payload);
    setSalvando(false);
    setSalvoOk(true);
    setFamilias(prev => prev.map(f => f.id === familiaSel.id ? { ...f, ...payload } : f));
  };

  const familiasFiltradas = familias.filter(f =>
    !busca ||
    f.nome_responsavel?.toLowerCase().includes(busca.toLowerCase()) ||
    f.cpf_responsavel?.includes(busca) ||
    f.municipio?.toLowerCase().includes(busca.toLowerCase())
  );

  // ── Painel de pontuação ────────────────────────────────────────
  const painelPontuacao = (
    <div className={`rounded-2xl border-2 ${cfg.border} ${cfg.bg} p-5 flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconeClass size={22} className={cfg.text} />
          <span className={`text-lg font-bold ${cfg.text}`}>{classificacao.label}</span>
        </div>
        <span className={`text-4xl font-black ${cfg.text}`}>{pontuacao}</span>
      </div>

      {/* Barra de progresso */}
      <div className="w-full h-3 bg-white/60 rounded-full overflow-hidden border border-white/80">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            classificacao.cor === "red" ? "bg-red-500" :
            classificacao.cor === "orange" ? "bg-orange-500" :
            classificacao.cor === "yellow" ? "bg-yellow-400" : "bg-emerald-500"
          }`}
          style={{ width: `${Math.min((pontuacao / 40) * 100, 100)}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className={cfg.text}>Pontos obtidos: <strong>{pontuacao}</strong></span>
        <span className={`px-2.5 py-1 rounded-full font-semibold ${cfg.badge}`}>
          Prioridade Sugerida: {classificacao.prioridade}
        </span>
      </div>

      {/* Tabela de referência */}
      <div className="grid grid-cols-2 gap-1 mt-1">
        {[
          { range: "0 – 9",  label: "Baixa",   cor: "text-emerald-600", active: pontuacao < 10 },
          { range: "10 – 19",label: "Média",   cor: "text-yellow-600",  active: pontuacao >= 10 && pontuacao < 20 },
          { range: "20 – 29",label: "Alta",    cor: "text-orange-600",  active: pontuacao >= 20 && pontuacao < 30 },
          { range: "≥ 30",   label: "Extrema", cor: "text-red-600",     active: pontuacao >= 30 },
        ].map(item => (
          <div key={item.range} className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs ${item.active ? "bg-white/80 font-semibold ring-1 ring-current/20" : "bg-white/30"}`}>
            <span className="text-slate-500">{item.range}</span>
            <span className={item.cor}>{item.label}</span>
          </div>
        ))}
      </div>

      {salvoOk && (
        <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 rounded-lg px-3 py-2 text-sm font-medium mt-1">
          <CheckCircle2 size={14} /> Avaliação salva com sucesso!
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <ShieldAlert size={22} className="text-sky-600" />
          Avaliação de Vulnerabilidade Social
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Instrumento de apoio à decisão administrativa — a pontuação subsidia priorização de visitas de campo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── COLUNA ESQUERDA: busca de família ── */}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Selecionar Família</p>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar por nome, CPF..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="pl-8 text-sm"
              />
            </div>

            {loading ? (
              <div className="flex justify-center py-6">
                <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-1 max-h-[420px] overflow-y-auto pr-1">
                {(busca ? familiasFiltradas : familias.slice(0, 50)).map(f => (
                  <button
                    key={f.id}
                    onClick={() => selecionarFamilia(f)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all border ${
                      familiaSel?.id === f.id
                        ? "bg-sky-600 text-white border-sky-600"
                        : "bg-white text-slate-700 border-slate-100 hover:bg-sky-50 hover:border-sky-200"
                    }`}
                  >
                    <p className="font-medium leading-tight truncate">{f.nome_responsavel}</p>
                    <p className={`text-xs mt-0.5 truncate ${familiaSel?.id === f.id ? "text-sky-100" : "text-slate-400"}`}>
                      {f.municipio || "Sem município"} · {f.faixa_pobreza || "Faixa não definida"}
                    </p>
                    {f.pontuacao_vulnerabilidade != null && (
                      <p className={`text-xs mt-0.5 font-semibold ${familiaSel?.id === f.id ? "text-sky-200" : "text-sky-600"}`}>
                        Última avaliação: {f.pontuacao_vulnerabilidade} pts
                      </p>
                    )}
                  </button>
                ))}
                {!busca && familias.length > 50 && (
                  <p className="text-xs text-slate-400 text-center py-2">Busque pelo nome para ver mais famílias</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── COLUNA DIREITA: formulário ── */}
        <div className="lg:col-span-2 space-y-4">
          {!familiaSel ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
              <ShieldAlert size={40} className="mx-auto text-slate-200 mb-3" />
              <p className="text-slate-400 font-medium">Selecione uma família ao lado</p>
              <p className="text-xs text-slate-300 mt-1">para iniciar a avaliação de vulnerabilidade</p>
            </div>
          ) : (
            <>
              {/* Info família */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-800">{familiaSel.nome_responsavel}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {familiaSel.municipio && <>{familiaSel.municipio} · </>}
                    {familiaSel.faixa_pobreza && <>{familiaSel.faixa_pobreza} · </>}
                    {familiaSel.num_membros && <>{familiaSel.num_membros} membros</>}
                  </p>
                </div>
                <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100">
                  <RotateCcw size={14} />
                </button>
              </div>

              {/* Painel pontuação */}
              {painelPontuacao}

              {/* Faixa de Renda */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Faixa de Renda Familiar</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {FAIXAS_RENDA.map(f => (
                    <button
                      key={f.id}
                      onClick={() => { setFaixaRenda(f.id); setSalvoOk(false); }}
                      className={`rounded-lg px-3 py-2.5 text-xs font-medium border-2 transition-all ${
                        faixaRenda === f.id
                          ? "border-sky-500 bg-sky-50 text-sky-700"
                          : "border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:bg-sky-50/50"
                      }`}
                    >
                      <p>{f.label}</p>
                      {f.pts > 0 && <p className="text-sky-500 font-bold mt-0.5">+{f.pts} pts</p>}
                    </button>
                  ))}
                </div>

                {/* Família unipessoal */}
                <div
                  onClick={() => { setUnipessoal(u => !u); setSalvoOk(false); }}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 border-2 cursor-pointer transition-all ${
                    unipessoal ? "border-amber-400 bg-amber-50" : "border-slate-200 hover:border-amber-300 hover:bg-amber-50/40"
                  }`}
                >
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${unipessoal ? "bg-amber-400 border-amber-400" : "border-slate-300"}`}>
                    {unipessoal && <CheckCircle2 size={10} className="text-white" />}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-700">Família Unipessoal (18–59 anos, sem deficiência)</p>
                    <p className="text-xs text-slate-400 mt-0.5">Aplica 50% da pontuação da faixa de renda</p>
                  </div>
                </div>
              </div>

              {/* Critérios de Vulnerabilidade por grupo */}
              {grupos.map(grupo => (
                <div key={grupo} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <button
                    onClick={() => toggleGrupo(grupo)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{grupo}</p>
                    <div className="flex items-center gap-2">
                      {CRITERIOS.filter(c => c.grupo === grupo && marcados.includes(c.id)).length > 0 && (
                        <span className="text-xs bg-sky-100 text-sky-700 font-bold px-2 py-0.5 rounded-full">
                          {CRITERIOS.filter(c => c.grupo === grupo && marcados.includes(c.id)).length} marcado(s)
                        </span>
                      )}
                      {gruposAbertos[grupo] ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                    </div>
                  </button>
                  {gruposAbertos[grupo] && (
                    <div className="px-4 pb-4 space-y-2">
                      {CRITERIOS.filter(c => c.grupo === grupo).map(c => {
                        const ativo = marcados.includes(c.id);
                        return (
                          <button
                            key={c.id}
                            onClick={() => toggleCriterio(c.id)}
                            className={`w-full flex items-center justify-between rounded-lg px-3 py-2.5 border-2 transition-all text-left ${
                              ativo
                                ? "border-sky-500 bg-sky-50"
                                : "border-slate-100 bg-slate-50/50 hover:border-sky-200 hover:bg-sky-50/40"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${ativo ? "bg-sky-500 border-sky-500" : "border-slate-300"}`}>
                                {ativo && <span className="text-white text-[9px] font-bold">✓</span>}
                              </div>
                              <span className={`text-sm ${ativo ? "text-sky-700 font-medium" : "text-slate-600"}`}>{c.label}</span>
                            </div>
                            <span className={`text-xs font-bold flex-shrink-0 ml-2 ${ativo ? "text-sky-600" : "text-slate-400"}`}>
                              +{c.pts} pts
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              {/* Observações */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Observações do Técnico</p>
                <textarea
                  value={observacoes}
                  onChange={e => { setObservacoes(e.target.value); setSalvoOk(false); }}
                  placeholder="Registre contexto adicional relevante para a avaliação..."
                  rows={3}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none text-slate-700"
                />
              </div>

              {/* Aviso legal */}
              <div className="flex gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-500">
                <Info size={14} className="flex-shrink-0 mt-0.5 text-slate-400" />
                <p>A escala de vulnerabilidade <strong>não gera direito subjetivo automático</strong>, mas subsidia a decisão administrativa sobre priorização de visitas e concessão de benefícios.</p>
              </div>

              {/* Botão salvar */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetForm}>
                  <RotateCcw size={14} /> Limpar
                </Button>
                <Button
                  onClick={handleSalvar}
                  disabled={salvando}
                  className="bg-sky-600 hover:bg-sky-700 gap-1.5"
                >
                  {salvando
                    ? <><div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Salvando...</>
                    : <><Save size={14} /> Salvar Avaliação</>
                  }
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}