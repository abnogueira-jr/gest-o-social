import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FilterX, Users, ShieldAlert, Calendar, FileDown } from "lucide-react";
import EscalaVulnerabilidade from "@/components/familias/EscalaVulnerabilidade";
import FamiliaDetalhe from "@/components/familias/FamiliaDetalhe";
import FamiliaModal from "@/components/familias/FamiliaModal";

export default function FamiliasBuscaAtiva() {
  const [familias, setFamilias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEscala, setShowEscala] = useState(false);
  const [detalhe, setDetalhe] = useState(null);
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    base44.entities.Familia.list("-created_date", 1000)
      .then(data => { setFamilias(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const totalVulneraveis = useMemo(() => {
    return familias.filter(f =>
      f.faixa_pobreza === "Extrema Pobreza" || f.faixa_pobreza === "Pobreza"
    ).length;
  }, [familias]);

  const handleSalvarEdicao = async (dados) => {
    if (editando?.id) {
      await base44.entities.Familia.update(editando.id, dados);
      setFamilias(prev => prev.map(f => f.id === editando.id ? { ...f, ...dados } : f));
    }
    setEditando(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldAlert size={20} className="text-sky-500" />
            Busca Ativa
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Identificação de famílias vulneráveis para atendimento prioritário
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowEscala(true)}
            className="bg-sky-600 hover:bg-sky-700 gap-2"
          >
            <ShieldAlert size={15} />
            Escala de Vulnerabilidade
          </Button>
        </div>
      </div>

      {/* KPIs resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard label="Total de Famílias" value={familias.length} color="sky" icon={Users} />
        <KpiCard
          label="Extrema Pobreza"
          value={familias.filter(f => f.faixa_pobreza === "Extrema Pobreza").length}
          color="red"
          icon={ShieldAlert}
        />
        <KpiCard
          label="Pobreza"
          value={familias.filter(f => f.faixa_pobreza === "Pobreza").length}
          color="orange"
          icon={ShieldAlert}
        />
        <KpiCard
          label="Baixa Renda"
          value={familias.filter(f => f.faixa_pobreza === "Baixa Renda").length}
          color="amber"
          icon={ShieldAlert}
        />
      </div>

      {/* Listagem simplificada de famílias vulneráveis */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-2 flex-wrap">
          <h3 className="text-sm font-semibold text-slate-700">
            Famílias em Situação de Vulnerabilidade
            <span className="ml-2 text-xs bg-sky-100 text-sky-600 px-2 py-0.5 rounded-full font-medium">
              {totalVulneraveis} famílias
            </span>
          </h3>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowEscala(true)}
            className="gap-1.5 text-sky-600 border-sky-200 hover:bg-sky-50"
          >
            <Search size={13} />
            Filtrar por Vulnerabilidade
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nome</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">CPF</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Município</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Faixa</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Renda</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Membros</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Ações</th>
                </tr>
              </thead>
              <tbody>
                {familias
                  .filter(f => f.faixa_pobreza === "Extrema Pobreza" || f.faixa_pobreza === "Pobreza")
                  .slice(0, 20)
                  .map(f => (
                    <tr key={f.id} className="border-b border-slate-50 hover:bg-sky-50/30 transition-colors">
                      <td className="px-4 py-2.5 font-medium text-slate-700">{f.nome_responsavel}</td>
                      <td className="px-4 py-2.5 text-slate-500">{f.cpf_responsavel}</td>
                      <td className="px-4 py-2.5 text-slate-500">{f.municipio || "—"}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          f.faixa_pobreza === "Extrema Pobreza"
                            ? "bg-red-100 text-red-700"
                            : f.faixa_pobreza === "Pobreza"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {f.faixa_pobreza || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-500">
                        {f.renda_per_capita != null
                          ? `R$ ${parseFloat(f.renda_per_capita).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                          : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 text-center">{f.num_membros || "—"}</td>
                      <td className="px-4 py-2.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-sky-600 hover:bg-sky-50 text-xs h-7 px-2"
                          onClick={() => setDetalhe(f)}
                        >
                          Ver detalhes
                        </Button>
                      </td>
                    </tr>
                  ))}
                {familias.filter(f => f.faixa_pobreza === "Extrema Pobreza" || f.faixa_pobreza === "Pobreza").length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400 text-sm">
                      Nenhuma família em situação de vulnerabilidade encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Escala de Vulnerabilidade Modal */}
      <EscalaVulnerabilidade
        open={showEscala}
        onClose={() => setShowEscala(false)}
        familias={familias}
        onVerDetalhe={(f) => { setShowEscala(false); setDetalhe(f); }}
      />

      {/* Detalhe */}
      <FamiliaDetalhe
        open={!!detalhe}
        familia={detalhe}
        onClose={() => setDetalhe(null)}
        onEditar={(f) => { setDetalhe(null); setEditando(f); }}
      />

      {/* Edição */}
      {editando && (
        <FamiliaModal
          open={!!editando}
          familia={editando}
          onClose={() => setEditando(null)}
          onSave={handleSalvarEdicao}
        />
      )}
    </div>
  );
}

function KpiCard({ label, value, color, icon: Icon }) {
  const colors = {
    sky: "bg-sky-50 text-sky-600 border-sky-100",
    red: "bg-red-50 text-red-600 border-red-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} />
        <span className="text-xs font-medium opacity-80">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value.toLocaleString("pt-BR")}</p>
    </div>
  );
}