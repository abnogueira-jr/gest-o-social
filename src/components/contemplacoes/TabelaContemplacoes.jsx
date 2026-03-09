import { Eye, FileText, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusBadge from "./StatusBadge";

export default function TabelaContemplacoes({ contemplacoes, onParecer, onDecisao, onVer }) {
  if (contemplacoes.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <p className="text-slate-400 text-sm">Nenhuma contemplação encontrada.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Família / Programa</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Referência</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Valor</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden xl:table-cell">Técnico</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {contemplacoes.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800 text-sm">{c.familia_nome}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{c.programa_nome}</p>
                </td>
                <td className="px-4 py-3 text-xs text-slate-600 hidden md:table-cell">{c.mes_referencia || "—"}</td>
                <td className="px-4 py-3 text-xs font-medium text-slate-700 hidden lg:table-cell">
                  {c.valor ? `R$ ${Number(c.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}
                </td>
                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                <td className="px-4 py-3 text-xs text-slate-500 hidden xl:table-cell">
                  {c.tecnico_responsavel || "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onVer(c)} title="Visualizar">
                      <Eye size={13} className="text-slate-500" />
                    </Button>
                    {/* Técnico: pode registrar parecer em Rascunho ou re-parecer em Reprovado */}
                    {(c.status === "Rascunho" || c.status === "Reprovado") && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onParecer(c)}
                        title="Registrar Parecer"
                      >
                        <FileText size={13} className="text-sky-600" />
                      </Button>
                    )}
                    {/* Gestor: pode decidir quando está Pendente Aprovação */}
                    {c.status === "Pendente Aprovação" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onDecisao(c)}
                        title="Aprovar / Reprovar"
                      >
                        <ShieldCheck size={13} className="text-violet-600" />
                      </Button>
                    )}
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