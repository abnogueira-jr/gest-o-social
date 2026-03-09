import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import StatusBadge from "./StatusBadge";

export default function ModalDecisao({ open, contemplacao, onClose, onSalvar }) {
  const [motivo, setMotivo] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMotivo("");
  }, [contemplacao, open]);

  const handleDecisao = async (decisao) => {
    if (decisao === "Reprovado" && !motivo.trim()) return;
    setSaving(true);
    await onSalvar(contemplacao.id, {
      status: decisao,
      decisao_gestor: decisao === "Aprovado" ? "Aprovado pelo gestor" : motivo,
      motivo_reprovacao: decisao === "Reprovado" ? motivo : undefined,
      data_decisao: new Date().toISOString(),
    });
    setSaving(false);
    onClose();
  };

  if (!contemplacao) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold flex items-center gap-2">
            <ShieldCheck size={16} className="text-violet-600" /> Decisão do Gestor
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-1">
          {/* Info da contemplação */}
          <div className="bg-slate-50 rounded-lg p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-800">{contemplacao.familia_nome}</p>
              <StatusBadge status={contemplacao.status} />
            </div>
            <p className="text-xs text-slate-500">{contemplacao.programa_nome}</p>
            {contemplacao.valor && (
              <p className="text-xs text-slate-600 font-medium">
                R$ {Number(contemplacao.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            )}
          </div>

          {/* Parecer técnico */}
          {contemplacao.parecer_tecnico && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Parecer do Técnico</p>
              <div className="bg-sky-50 border border-sky-100 rounded-lg p-3">
                <p className="text-xs text-slate-700 leading-relaxed">{contemplacao.parecer_tecnico}</p>
                {contemplacao.tecnico_responsavel && (
                  <p className="text-xs text-slate-400 mt-1">— {contemplacao.tecnico_responsavel}</p>
                )}
              </div>
            </div>
          )}

          {/* Motivo (obrigatório para reprovar) */}
          <div className="space-y-1">
            <Label className="text-xs font-medium text-slate-600">
              Justificativa / Observações do Gestor
              <span className="text-slate-400 ml-1">(obrigatório para reprovar)</span>
            </Label>
            <Textarea
              rows={3}
              placeholder="Adicione observações ou o motivo da reprovação..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 flex-wrap sm:flex-nowrap">
          <Button variant="outline" size="sm" onClick={onClose} disabled={saving} className="sm:mr-auto">
            Cancelar
          </Button>
          <Button
            size="sm"
            disabled={saving || !motivo.trim()}
            onClick={() => handleDecisao("Reprovado")}
            className="bg-red-600 hover:bg-red-700 gap-1.5"
          >
            <XCircle size={13} /> Reprovar
          </Button>
          <Button
            size="sm"
            disabled={saving}
            onClick={() => handleDecisao("Aprovado")}
            className="bg-emerald-600 hover:bg-emerald-700 gap-1.5"
          >
            <CheckCircle2 size={13} /> Aprovar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}