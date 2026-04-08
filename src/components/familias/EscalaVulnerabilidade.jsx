import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilterX, Eye, Calendar, ShieldAlert } from "lucide-react";
import AgendamentoLote from "@/components/visitas/AgendamentoLote";

// Calcula pontuação de vulnerabilidade baseada nos dados da família
function calcularPontuacao(familia) {
  let score = 0;
  const membros = familia.membros_familiares || [];

  const idades = membros.map(m => {
    if (!m.data_nascimento) return null;
    const nasc = new Date(m.data_nascimento);
    const hoje = new Date();
    return Math.floor((hoje - nasc) / (1000 * 60 * 60 * 24 * 365.25));
  }).filter(v => v !== null);

  // Crianças 0-3
  if (idades.some(i => i <= 3)) score += 30;
  // Crianças 4-6
  if (idades.some(i => i >= 4 && i <= 6)) score += 30;
  // Crianças 7-15
  if (idades.some(i => i >= 7 && i <= 15)) score += 20;
  // PCD
  if (familia.possui_deficiencia || membros.some(m => m.possui_deficiencia)) score += 40;
  // PCD que requer cuidados
  if (membros.some(m => m.possui_autismo)) score += 50;
  // Idoso 60-70
  if (idades.some(i => i >= 60 && i <= 70)) score += 20;
  // Idoso > 70
  if (idades.some(i => i > 70)) score += 30;
  // Doença
  if (familia.possui_doenca || membros.some(m => m.possui_doenca)) score += 20;
  // Renda baixíssima
  const rpc = parseFloat(familia.renda_per_capita) || 0;
  if (rpc === 0) score += 60;
  else if (rpc <= 105) score += 50;
  else if (rpc <= 218) score += 30;
  // Sem benefício
  if (!familia.possui_beneficio) score += 20;
  // Habitação precária / alugada / cedida
  if (familia.situacao_moradia === "Irregular") score += 30;
  else if (familia.situacao_moradia === "Alugada" || familia.situacao_moradia === "Cedida") score += 10;
  // Membros (mais membros = mais vulnerável)
  const nm = parseInt(familia.num_membros) || 1;
  score += Math.min(nm * 5, 40);

  return score;
}

const FAIXAS = ["Extrema Pobreza", "Pobreza", "Baixa Renda"];

const VULNERABILIDADES = [
  { key: "crianca_0_3",       label: "Criança de 0 a 3 anos" },
  { key: "crianca_4_6",       label: "Criança de 4 a 6 anos" },
  { key: "crianca_7_15",      label: "Criança de 7 a 15 anos" },
  { key: "pcd",               label: "PCD" },
  { key: "pcd_cuidados",      label: "PCD que requer cuidados" },
  { key: "idoso_60_70",       label: "Idoso de 60 a 70 Anos" },
  { key: "idoso_70",          label: "Idoso > 70 Anos" },
  { key: "habitacao_precaria",label: "Habitação Precária" },
  { key: "inseg_alimentar",   label: "Insegurança Alimentar" },
  { key: "violencia",         label: "Violência contra Mulher/Criança" },
];

function matchVulnerabilidade(familia, chaves) {
  if (chaves.length === 0) return true;
  const membros = familia.membros_familiares || [];
  const idades = membros.map(m => {
    if (!m.data_nascimento) return null;
    const nasc = new Date(m.data_nascimento);
    return Math.floor((new Date() - nasc) / (1000 * 60 * 60 * 24 * 365.25));
  }).filter(v => v !== null);

  return chaves.every(k => {
    if (k === "crianca_0_3") return idades.some(i => i <= 3);
    if (k === "crianca_4_6") return idades.some(i => i >= 4 && i <= 6);
    if (k === "crianca_7_15") return idades.some(i => i >= 7 && i <= 15);
    if (k === "pcd") return familia.possui_deficiencia || membros.some(m => m.possui_deficiencia);
    if (k === "pcd_cuidados") return membros.some(m => m.possui_autismo);
    if (k === "idoso_60_70") return idades.some(i => i >= 60 && i <= 70);
    if (k === "idoso_70") return idades.some(i => i > 70);
    if (k === "habitacao_precaria") return familia.situacao_moradia === "Irregular";
    if (k === "inseg_alimentar") return (parseFloat(familia.renda_per_capita) || 0) <= 105;
    if (k === "violencia") return false; // campo não disponível no schema atual
    return false;
  });
}

export default function EscalaVulnerabilidade({ open, onClose, familias, onVerDetalhe }) {
  const [vulns, setVulns] = useState([]);
  const [faixa, setFaixa] = useState("");
  const [semBeneficio, setSemBeneficio] = useState(false);
  const [municipio, setMunicipio] = useState("");
  const [nome, setNome] = useState("");
  const [filtrado, setFiltrado] = useState(false);
  const [selecionadas, setSelecionadas] = useState([]);
  const [showAgendamentoLote, setShowAgendamentoLote] = useState(false);

  const municipios = useMemo(() => {
    return [...new Set(familias.map(f => f.municipio).filter(Boolean))].sort();
  }, [familias]);

  const resultado = useMemo(() => {
    if (!filtrado) return [];
    return familias
      .filter(f => {
        if (faixa && f.faixa_pobreza !== faixa) return false;
        if (semBeneficio && f.possui_beneficio) return false;
        if (municipio && f.municipio !== municipio) return false;
        if (nome && !f.nome_responsavel?.toLowerCase().includes(nome.toLowerCase())) return false;
        if (!matchVulnerabilidade(f, vulns)) return false;
        return true;
      })
      .map(f => ({ ...f, _pontuacao: calcularPontuacao(f) }))
      .sort((a, b) => b._pontuacao - a._pontuacao);
  }, [filtrado, familias, vulns, faixa, semBeneficio, municipio, nome]);

  const toggleVuln = (k) => setVulns(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]);

  const handleFiltrar = () => { setFiltrado(true); setSelecionadas([]); };
  const handleLimpar = () => {
    setVulns([]); setFaixa(""); setSemBeneficio(false);
    setMunicipio(""); setNome(""); setFiltrado(false); setSelecionadas([]);
  };

  const toggleSel = (id) => setSelecionadas(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleTodos = () => {
    const ids = resultado.map(f => f.id);
    const todos = ids.every(id => selecionadas.includes(id));
    setSelecionadas(todos ? [] : ids);
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sky-700">
            <ShieldAlert size={18} />
            Escala da Vulnerabilidade
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filtros superiores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            {/* Tipo de vulnerabilidade */}
            <div className="md:col-span-2">
              <p className="text-xs font-semibold text-slate-600 mb-2">Tipo de vulnerabilidade</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {VULNERABILIDADES.map(v => (
                  <label key={v.key} className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={vulns.includes(v.key)}
                      onChange={() => toggleVuln(v.key)}
                      className="w-3.5 h-3.5 accent-sky-600"
                    />
                    <span className="text-xs text-slate-700">{v.label}</span>
                  </label>
                ))}
                <label className="flex items-center gap-2 cursor-pointer select-none col-span-full sm:col-span-1">
                  <input
                    type="checkbox"
                    checked={semBeneficio}
                    onChange={e => setSemBeneficio(e.target.checked)}
                    className="w-3.5 h-3.5 accent-sky-600"
                  />
                  <span className="text-xs text-slate-700">Famílias sem Benefícios Sociais</span>
                </label>
              </div>
            </div>

            {/* Faixa de renda + resumo */}
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-sky-600 mb-2">Faixa de Renda</p>
                <div className="space-y-1">
                  {["", ...FAIXAS].map(f => (
                    <label key={f} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="faixa"
                        checked={faixa === f}
                        onChange={() => setFaixa(f)}
                        className="w-3.5 h-3.5 accent-sky-600"
                      />
                      <span className="text-xs text-slate-700">{f || "Todas"}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Contador */}
              <div className="bg-white rounded-lg border border-sky-100 p-3 text-center">
                <p className="text-xs text-slate-500 mb-1">Nº de Pré-Cadastros com Perfil</p>
                <p className="text-2xl font-bold text-sky-600">{familias.length.toLocaleString("pt-BR")}</p>
                <p className="text-xs text-slate-500 mt-2 mb-1">Nº de Vulneráveis selecionados</p>
                <p className="text-2xl font-bold text-sky-600">{filtrado ? resultado.length : 0}</p>
              </div>
            </div>
          </div>

          {/* Município + Nome */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-slate-600 mb-1 block">Município</label>
              <select
                value={municipio}
                onChange={e => setMunicipio(e.target.value)}
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="">Todos os municípios</option>
                {municipios.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-slate-600 mb-1 block">Nome</label>
              <Input
                placeholder="Buscar por nome..."
                value={nome}
                onChange={e => setNome(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleFiltrar} className="bg-sky-600 hover:bg-sky-700 gap-1.5">
                <ShieldAlert size={14} />
                Filtrar dados selecionados
              </Button>
              <Button variant="outline" onClick={handleLimpar} className="gap-1.5">
                <FilterX size={14} />
                Limpar os filtros
              </Button>
            </div>
          </div>

          {/* Tabela de resultados */}
          {filtrado && (
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-sky-700 text-white">
                      <th className="px-3 py-2.5 w-8">
                        <input
                          type="checkbox"
                          checked={resultado.length > 0 && resultado.every(f => selecionadas.includes(f.id))}
                          onChange={toggleTodos}
                          className="w-3.5 h-3.5 accent-white cursor-pointer"
                        />
                      </th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold">Ranking</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold">Pontuação</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold">Município</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold">Código Familiar</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold">CPF</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold">Nome</th>
                      <th className="px-3 py-2.5 text-right text-xs font-semibold">Renda Média Familiar</th>
                      <th className="px-3 py-2.5 text-center text-xs font-semibold">Dependentes</th>
                      <th className="px-3 py-2.5 text-center text-xs font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-8 text-slate-400">
                          Nenhuma família encontrada com os filtros selecionados.
                        </td>
                      </tr>
                    ) : resultado.map((f, idx) => (
                      <tr
                        key={f.id}
                        className={`border-b border-slate-100 hover:bg-sky-50 transition-colors ${selecionadas.includes(f.id) ? "bg-sky-50" : idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}
                      >
                        <td className="px-3 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={selecionadas.includes(f.id)}
                            onChange={() => toggleSel(f.id)}
                            className="w-3.5 h-3.5 accent-sky-600 cursor-pointer"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                            idx === 0 ? "bg-red-500 text-white" :
                            idx === 1 ? "bg-orange-400 text-white" :
                            idx === 2 ? "bg-amber-400 text-white" :
                            "bg-slate-200 text-slate-600"
                          }`}>{idx + 1}</span>
                        </td>
                        <td className="px-3 py-2 font-bold text-sky-700">{f._pontuacao}</td>
                        <td className="px-3 py-2 text-slate-700">{f.municipio || "—"}</td>
                        <td className="px-3 py-2 text-slate-500 font-mono text-xs">{f.cadastro_unico || f.numero_nis || "—"}</td>
                        <td className="px-3 py-2 text-slate-500 font-mono text-xs">{f.cpf_responsavel}</td>
                        <td className="px-3 py-2 font-medium text-slate-800">{f.nome_responsavel}</td>
                        <td className="px-3 py-2 text-right text-slate-600">
                          {f.renda_per_capita != null
                            ? parseFloat(f.renda_per_capita).toLocaleString("pt-BR", { minimumFractionDigits: 2 })
                            : "—"}
                        </td>
                        <td className="px-3 py-2 text-center text-slate-600">{f.num_membros || "—"}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => onVerDetalhe(f)}
                              className="flex items-center gap-1 text-xs text-sky-600 hover:text-sky-800 hover:underline whitespace-nowrap"
                            >
                              <Eye size={12} />
                              Visualizar membros
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {resultado.length > 0 && (
                <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs text-slate-500">
                    {resultado.length} encontrada(s) · <strong className="text-sky-600">{selecionadas.length} selecionada(s)</strong>
                  </span>
                  <Button
                    size="sm"
                    disabled={selecionadas.length === 0}
                    onClick={() => setShowAgendamentoLote(true)}
                    className="gap-1.5 text-xs h-7 bg-sky-600 hover:bg-sky-700"
                  >
                    <Calendar size={12} />
                    Agendar {selecionadas.length > 0 ? `(${selecionadas.length})` : ""} Visitas
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>

    {/* Agendamento em Lote a partir da seleção */}
    <AgendamentoLote
      open={showAgendamentoLote}
      familiasPre={selecionadas.map(id => familias.find(f => f.id === id)).filter(Boolean)}
      onClose={() => setShowAgendamentoLote(false)}
      onSalvo={() => { setShowAgendamentoLote(false); onClose(); }}
    />
  </>
  );
}