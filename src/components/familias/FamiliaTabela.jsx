import { Pencil, Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const situacaoCor = {
  "Ativo": "bg-emerald-100 text-emerald-700",
  "Inativo": "bg-slate-100 text-slate-600",
  "Pendente": "bg-amber-100 text-amber-700",
  "Suspenso": "bg-orange-100 text-orange-700",
  "Cancelado": "bg-red-100 text-red-700",
};

const beneficioCor = {
  "Ativo": "bg-sky-100 text-sky-700",
  "Suspenso": "bg-amber-100 text-amber-700",
  "Cancelado": "bg-red-100 text-red-700",
  "Em Análise": "bg-violet-100 text-violet-700",
  "Aguardando": "bg-slate-100 text-slate-600",
};

const faixaCor = {
  "Extrema Pobreza": "bg-red-100 text-red-700",
  "Pobreza": "bg-orange-100 text-orange-700",
  "Baixa Renda": "bg-yellow-100 text-yellow-700",
};

export default function FamiliaTabela({ familias, onEditar, onExcluir, onVer }) {
  if (familias.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <p className="text-slate-400 text-sm">Nenhuma família encontrada.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">NIS / Responsável</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">CPF</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Município / Região</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden xl:table-cell">Faixa</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Situação</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Benefício</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {familias.map((f) => (
              <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800 text-sm">{f.nome_responsavel}</p>
                  {f.numero_nis && <p className="text-xs text-slate-400 mt-0.5">NIS: {f.numero_nis}</p>}
                </td>
                <td className="px-4 py-3 text-slate-600 hidden md:table-cell text-xs font-mono">{f.cpf_responsavel}</td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <p className="text-slate-700 text-xs">{f.municipio || "—"}</p>
                  <p className="text-slate-400 text-xs">{f.regiao || "—"}</p>
                </td>
                <td className="px-4 py-3 hidden xl:table-cell">
                  {f.faixa_pobreza ? (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${faixaCor[f.faixa_pobreza] || "bg-slate-100 text-slate-600"}`}>
                      {f.faixa_pobreza}
                    </span>
                  ) : "—"}
                </td>
                <td className="px-4 py-3">
                  {f.situacao_cadastral ? (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${situacaoCor[f.situacao_cadastral] || "bg-slate-100 text-slate-600"}`}>
                      {f.situacao_cadastral}
                    </span>
                  ) : "—"}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  {f.status_beneficio ? (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${beneficioCor[f.status_beneficio] || "bg-slate-100 text-slate-600"}`}>
                      {f.status_beneficio}
                    </span>
                  ) : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onVer(f)} title="Visualizar">
                      <Eye size={13} className="text-slate-500" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEditar(f)} title="Editar">
                      <Pencil size={13} className="text-sky-600" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onExcluir(f)} title="Excluir">
                      <Trash2 size={13} className="text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}