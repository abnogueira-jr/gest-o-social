import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Heart, RefreshCw, FileText, ShieldCheck, Clock, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import AprovacaoFiltros from "../components/contemplacoes/AprovacaoFiltros";
import TabelaContemplacoes from "../components/contemplacoes/TabelaContemplacoes";
import ModalParecer from "../components/contemplacoes/ModalParecer";
import ModalDecisao from "../components/contemplacoes/ModalDecisao";
import ModalDetalhe from "../components/contemplacoes/ModalDetalhe";

const FILTROS_INICIAL = { busca: "", status: "todos" };

function KpiFluxo({ icon: Icon, label, valor, cor }) {
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

export default function ProgramasContemplacoes() {
  const [contemplacoes, setContemplacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState(FILTROS_INICIAL);
  const [parecerItem, setParecerItem] = useState(null);
  const [decisaoItem, setDecisaoItem] = useState(null);
  const [detalheItem, setDetalheItem] = useState(null);

  const carregar = async () => {
    setLoading(true);
    const data = await base44.entities.Contemplacao.list("-created_date", 500);
    setContemplacoes(data);
    setLoading(false);
  };

  useEffect(() => { carregar(); }, []);

  const alterarFiltro = (k, v) => setFiltros((f) => ({ ...f, [k]: v }));

  const filtradas = contemplacoes.filter((c) => {
    const q = filtros.busca.toLowerCase();
    const matchBusca = !filtros.busca ||
      c.familia_nome?.toLowerCase().includes(q) ||
      c.programa_nome?.toLowerCase().includes(q);
    const matchStatus = filtros.status === "todos" || c.status === filtros.status;
    return matchBusca && matchStatus;
  });

  const handleSalvarParecer = async (id, dados) => {
    await base44.entities.Contemplacao.update(id, dados);
    toast.success("Parecer registrado! Status atualizado para Pendente Aprovação.");
    carregar();
  };

  const handleSalvarDecisao = async (id, dados) => {
    await base44.entities.Contemplacao.update(id, dados);
    toast.success(dados.status === "Aprovado" ? "Contemplação aprovada!" : "Contemplação reprovada.");
    carregar();
  };

  const total = contemplacoes.length;
  const pendentes = contemplacoes.filter((c) => c.status === "Pendente Aprovação").length;
  const aprovados = contemplacoes.filter((c) => c.status === "Aprovado").length;
  const reprovados = contemplacoes.filter((c) => c.status === "Reprovado").length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Heart size={20} className="text-sky-600" /> Contemplações — Fluxo de Aprovação
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Técnicos registram pareceres · Gestores aprovam ou reprovam
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={carregar} disabled={loading} className="gap-1.5">
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Atualizar
        </Button>
      </div>

      {/* KPIs do fluxo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiFluxo icon={Heart}        label="Total"              valor={total}      cor="bg-slate-100 text-slate-600" />
        <KpiFluxo icon={Clock}        label="Pendente Aprovação" valor={pendentes}   cor="bg-amber-100 text-amber-600" />
        <KpiFluxo icon={CheckCircle2} label="Aprovadas"          valor={aprovados}   cor="bg-emerald-100 text-emerald-600" />
        <KpiFluxo icon={XCircle}      label="Reprovadas"         valor={reprovados}  cor="bg-red-100 text-red-600" />
      </div>

      {/* Legenda do fluxo */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Fluxo de Aprovação</p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span className="px-2.5 py-1 rounded-full bg-slate-100 font-medium">Rascunho</span>
          <span className="text-slate-300">→</span>
          <span className="flex items-center gap-1 text-sky-600 font-medium">
            <FileText size={11} /> Técnico registra parecer
          </span>
          <span className="text-slate-300">→</span>
          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">Pendente Aprovação</span>
          <span className="text-slate-300">→</span>
          <span className="flex items-center gap-1 text-violet-600 font-medium">
            <ShieldCheck size={11} /> Gestor decide
          </span>
          <span className="text-slate-300">→</span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">Aprovado</span>
          <span className="text-slate-400 mx-1">/</span>
          <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-medium">Reprovado</span>
        </div>
      </div>

      {/* Filtros */}
      <AprovacaoFiltros filtros={filtros} onChange={alterarFiltro} onLimpar={() => setFiltros(FILTROS_INICIAL)} />

      <div className="text-xs text-slate-500 px-1">
        {filtradas.length} registro(s) encontrado(s)
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <RefreshCw size={20} className="animate-spin text-slate-300 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">Carregando...</p>
        </div>
      ) : (
        <TabelaContemplacoes
          contemplacoes={filtradas}
          onParecer={setParecerItem}
          onDecisao={setDecisaoItem}
          onVer={setDetalheItem}
        />
      )}

      {/* Modais */}
      <ModalParecer
        open={!!parecerItem}
        contemplacao={parecerItem}
        onClose={() => setParecerItem(null)}
        onSalvar={handleSalvarParecer}
      />
      <ModalDecisao
        open={!!decisaoItem}
        contemplacao={decisaoItem}
        onClose={() => setDecisaoItem(null)}
        onSalvar={handleSalvarDecisao}
      />
      <ModalDetalhe
        open={!!detalheItem}
        contemplacao={detalheItem}
        onClose={() => setDetalheItem(null)}
        onParecer={setParecerItem}
        onDecisao={setDecisaoItem}
      />
    </div>
  );
}