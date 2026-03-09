import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus, Users, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import FamiliaFiltros from "../components/familias/FamiliaFiltros";
import FamiliaTabela from "../components/familias/FamiliaTabela";
import FamiliaModal from "../components/familias/FamiliaModal";
import FamiliaDetalhe from "../components/familias/FamiliaDetalhe";

const FILTROS_INICIAL = { busca: "", situacao: "todos", regiao: "todos", faixaPobreza: "todos", statusBeneficio: "todos", municipio: "todos" };

export default function FamiliasCadastro() {
  const [familias, setFamilias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState(FILTROS_INICIAL);
  const [modalAberto, setModalAberto] = useState(false);
  const [familiaEditando, setFamiliaEditando] = useState(null);
  const [familiaVisualizando, setFamiliaVisualizando] = useState(null);
  const [confirmExcluir, setConfirmExcluir] = useState(null);

  const carregar = async () => {
    setLoading(true);
    const data = await base44.entities.Familia.list("-created_date", 500);
    setFamilias(data);
    setLoading(false);
  };

  useEffect(() => { carregar(); }, []);

  const alterarFiltro = (k, v) => setFiltros((f) => ({ ...f, [k]: v }));
  const limparFiltros = () => setFiltros(FILTROS_INICIAL);

  const familiasFiltradas = familias.filter((f) => {
    const q = filtros.busca.toLowerCase();
    const matchBusca = !filtros.busca ||
      f.nome_responsavel?.toLowerCase().includes(q) ||
      f.cpf_responsavel?.includes(filtros.busca) ||
      f.numero_nis?.includes(filtros.busca);
    const matchSituacao = filtros.situacao === "todos" || f.situacao_cadastral === filtros.situacao;
    const matchRegiao = filtros.regiao === "todos" || f.regiao === filtros.regiao;
    const matchFaixa = filtros.faixaPobreza === "todos" || f.faixa_pobreza === filtros.faixaPobreza;
    const matchBeneficio = filtros.statusBeneficio === "todos" || f.status_beneficio === filtros.statusBeneficio;
    const matchMunicipio = filtros.municipio === "todos" || f.municipio === filtros.municipio;
    return matchBusca && matchSituacao && matchRegiao && matchFaixa && matchBeneficio && matchMunicipio;
  });

  const handleSalvar = async (form) => {
    const dados = { ...form };
    if (dados.num_membros) dados.num_membros = Number(dados.num_membros);
    if (dados.renda_familiar) dados.renda_familiar = Number(dados.renda_familiar);

    if (familiaEditando) {
      await base44.entities.Familia.update(familiaEditando.id, dados);
      toast.success("Família atualizada com sucesso!");
    } else {
      await base44.entities.Familia.create(dados);
      toast.success("Família cadastrada com sucesso!");
    }
    setModalAberto(false);
    setFamiliaEditando(null);
    carregar();
  };

  const handleEditar = (f) => {
    setFamiliaEditando(f);
    setModalAberto(true);
  };

  const handleExcluir = async (f) => {
    if (confirmExcluir?.id === f.id) {
      await base44.entities.Familia.delete(f.id);
      toast.success("Família excluída.");
      setConfirmExcluir(null);
      carregar();
    } else {
      setConfirmExcluir(f);
      setTimeout(() => setConfirmExcluir(null), 4000);
    }
  };

  const handleNova = () => {
    setFamiliaEditando(null);
    setModalAberto(true);
  };

  const totalAtivos = familias.filter((f) => f.situacao_cadastral === "Ativo").length;
  const totalPendentes = familias.filter((f) => f.situacao_cadastral === "Pendente").length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Users size={20} className="text-sky-600" /> Cadastro de Famílias
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {familias.length} famílias cadastradas · {totalAtivos} ativas · {totalPendentes} pendentes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={carregar} disabled={loading} className="gap-1.5">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Atualizar
          </Button>
          <Button size="sm" onClick={handleNova} className="bg-sky-600 hover:bg-sky-700 gap-1.5">
            <Plus size={14} /> Nova Família
          </Button>
        </div>
      </div>

      {/* Aviso de exclusão */}
      {confirmExcluir && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center justify-between text-sm">
          <span className="text-red-700">Clique em <strong>Excluir</strong> novamente para confirmar a exclusão de <strong>{confirmExcluir.nome_responsavel}</strong>.</span>
          <button onClick={() => setConfirmExcluir(null)} className="text-red-400 hover:text-red-600 text-xs ml-3">Cancelar</button>
        </div>
      )}

      {/* Filtros */}
      <FamiliaFiltros filtros={filtros} onChange={alterarFiltro} onLimpar={limparFiltros} />

      {/* Resultado */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>{familiasFiltradas.length} registro(s) encontrado(s)</span>
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <RefreshCw size={20} className="animate-spin text-slate-300 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">Carregando famílias...</p>
        </div>
      ) : (
        <FamiliaTabela
          familias={familiasFiltradas}
          onEditar={handleEditar}
          onExcluir={handleExcluir}
          onVer={(f) => setFamiliaVisualizando(f)}
        />
      )}

      {/* Modal Cadastro/Edição */}
      <FamiliaModal
        open={modalAberto}
        familia={familiaEditando}
        onClose={() => { setModalAberto(false); setFamiliaEditando(null); }}
        onSave={handleSalvar}
      />

      {/* Modal Visualização */}
      <FamiliaDetalhe
        open={!!familiaVisualizando}
        familia={familiaVisualizando}
        onClose={() => setFamiliaVisualizando(null)}
        onEditar={handleEditar}
      />
    </div>
  );
}