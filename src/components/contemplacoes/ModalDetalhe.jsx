import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import StatusBadge from "./StatusBadge";
import { FileText, ShieldCheck } from "lucide-react";

function Item({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400 font-medium">{label}</p>
      <p className="text-sm text-slate-800 mt-0.5">{value || "—"}</p>
    </div>
  );
}

export default function ModalDetalhe({ open, contemplacao, onClose, onParecer, onDecisao }) {
  if (!contemplacao) return null;
  const fmt = (dt) => dt ? new Date(dt).toLocaleString("pt-BR") : "—";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-2">
            <DialogTitle className="text-sm font-semibold text-slate-800">{contemplacao.familia_nome}</DialogTitle>
            <StatusBadge status={contemplacao.status} />
          </div>
          <p className="text-xs text-slate-400">{contemplacao.programa_nome}</p>
        </DialogHeader>

        <div className="space-y-5 py-1">
          <div className="grid grid-cols-2 gap-3">
            <Item label="Valor" value={contemplacao.valor ? `R$ ${Number(contemplacao.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : null} />
            <Item label="Mês de Referência" value={contemplacao.mes_referencia} />
            <Item label="Data de Contemplação" value={contemplacao.data_contemplacao} />
            <Item label="Técnico Responsável" value={contemplacao.tecnico_responsavel} />
          </div>

          {contemplacao.parecer_tecnico && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <FileText size={11} /> Parecer do Técnico
              </p>
              <div className="bg-sky-50 border border-sky-100 rounded-lg p-3">
                <p className="text-xs text-slate-700 leading-relaxed">{contemplacao.parecer_tecnico}</p>
                {contemplacao.data_parecer && (
                  <p className="text-xs text-slate-400 mt-1.5">{fmt(contemplacao.data_parecer)}</p>
                )}
              </div>
            </div>
          )}

          {(contemplacao.decisao_gestor || contemplacao.motivo_reprovacao) && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <ShieldCheck size={11} /> Decisão do Gestor
              </p>
              <div className={`border rounded-lg p-3 ${contemplacao.status === "Aprovado" ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"}`}>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {contemplacao.motivo_reprovacao || contemplacao.decisao_gestor}
                </p>
                {contemplacao.gestor_responsavel && (
                  <p className="text-xs text-slate-400 mt-1">— {contemplacao.gestor_responsavel}</p>
                )}
                {contemplacao.data_decisao && (
                  <p className="text-xs text-slate-400 mt-0.5">{fmt(contemplacao.data_decisao)}</p>
                )}
              </div>
            </div>
          )}

          {contemplacao.observacoes && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Observações</p>
              <p className="text-xs text-slate-600">{contemplacao.observacoes}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 flex-wrap">
          <Button variant="outline" size="sm" onClick={onClose}>Fechar</Button>
          {(contemplacao.status === "Rascunho" || contemplacao.status === "Reprovado") && (
            <Button size="sm" className="bg-sky-600 hover:bg-sky-700 gap-1.5" onClick={() => { onClose(); onParecer(contemplacao); }}>
              <FileText size={12} /> Registrar Parecer
            </Button>
          )}
          {contemplacao.status === "Pendente Aprovação" && (
            <Button size="sm" className="bg-violet-600 hover:bg-violet-700 gap-1.5" onClick={() => { onClose(); onDecisao(contemplacao); }}>
              <ShieldCheck size={12} /> Decidir
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}