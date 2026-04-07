import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Heart, DollarSign, TrendingUp, Power, PowerOff } from "lucide-react";
import ProgramaModal from "@/components/programas/ProgramaModal";

function StatusBadge({ status }) {
  const isAtivo = status === "Ativo";
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${isAtivo ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isAtivo ? "bg-emerald-500" : "bg-slate-400"}`} />
      {status}
    </span>
  );
}

function ProgramaCard({ programa, onEdit, onToggleStatus }) {
  const fmt = v => v ? `R$ ${parseFloat(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—";

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Heart size={18} className="text-sky-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm leading-tight">{programa.nome}</h3>
            <div className="mt-1">
              <StatusBadge status={programa.status || "Ativo"} />
            </div>
          </div>
        </div>
      </div>

      {programa.descricao && (
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{programa.descricao}</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <DollarSign size={12} />
            Valor do Benefício
          </div>
          <p className="text-sm font-semibold text-slate-800">{fmt(programa.valor_beneficio)}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <TrendingUp size={12} />
            Limite Orçamentário
          </div>
          <p className="text-sm font-semibold text-slate-800">{fmt(programa.limite_orcamentario)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
        <button
          onClick={() => onToggleStatus(programa)}
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${programa.status === "Ativo" ? "text-slate-400 hover:text-red-500" : "text-slate-400 hover:text-emerald-600"}`}
        >
          {programa.status === "Ativo" ? <PowerOff size={13} /> : <Power size={13} />}
          {programa.status === "Ativo" ? "Desativar" : "Ativar"}
        </button>
        <Button size="sm" variant="outline" onClick={() => onEdit(programa)} className="gap-1.5 h-7 text-xs">
          <Pencil size={12} /> Editar
        </Button>
      </div>
    </div>
  );
}

export default function ProgramasCadastro() {
  const [programas, setProgramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.ProgramaSocial.list("-created_date");
    setProgramas(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    if (editing) {
      await base44.entities.ProgramaSocial.update(editing.id, form);
    } else {
      await base44.entities.ProgramaSocial.create(form);
    }
    setModalOpen(false);
    setEditing(null);
    load();
  };

  const handleEdit = (p) => { setEditing(p); setModalOpen(true); };

  const handleToggleStatus = async (p) => {
    const novoStatus = p.status === "Ativo" ? "Inativo" : "Ativo";
    await base44.entities.ProgramaSocial.update(p.id, { ...p, status: novoStatus });
    load();
  };

  const ativos = programas.filter(p => p.status === "Ativo").length;
  const inativos = programas.filter(p => p.status !== "Ativo").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Programas Sociais</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {programas.length} programa{programas.length !== 1 ? "s" : ""} cadastrado{programas.length !== 1 ? "s" : ""} · {ativos} ativo{ativos !== 1 ? "s" : ""} · {inativos} inativo{inativos !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setModalOpen(true); }} className="bg-sky-600 hover:bg-sky-700 gap-2">
          <Plus size={16} /> Incluir Programa
        </Button>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 text-sm">Carregando...</div>
      ) : programas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Heart size={40} className="text-slate-200 mb-3" />
          <p className="text-slate-500 font-medium">Nenhum programa cadastrado</p>
          <p className="text-slate-400 text-sm mt-1">Clique em "Incluir Programa" para começar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {programas.map(p => (
            <ProgramaCard key={p.id} programa={p} onEdit={handleEdit} onToggleStatus={handleToggleStatus} />
          ))}
        </div>
      )}

      <ProgramaModal
        open={modalOpen}
        programa={editing}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={handleSave}
      />
    </div>
  );
}