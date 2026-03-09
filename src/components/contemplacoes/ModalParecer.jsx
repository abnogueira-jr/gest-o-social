import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";
import StatusBadge from "./StatusBadge";

export default function ModalParecer({ open, contemplacao, onClose, onSalvar }) {
  const [parecer, setParecer] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setParecer(contemplacao?.parecer_tecnico || "");
  }, [contemplacao, open]);

  const handleSalvar = async () => {
    if (!parecer.trim()) return;
    setSaving(true);
    await onSalvar(contemplacao.id, {
      parecer_tecnico: parecer,
      status: "Pendente Aprovação",
      data_parecer: new Date().toISOString(),
    });
    setSaving(false);
    onClose();
  };

  if (!contemplacao) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText size={16} className="text-sky-600" /> Registrar Parecer Técnico
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-1">
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

          <div className="space-y-1">
            <Label className="text-xs font-medium text-slate-600">
              Parecer do Técnico <span className="text-red-500">*</span>
            </Label>
            <Textarea
              rows={5}
              placeholder="Descreva a situação da família, critérios atendidos, justificativas e recomendação técnica..."
              value={parecer}
              onChange={(e) => setParecer(e.target.value)}
            />
            <p className="text-xs text-slate-400">
              Após salvar, o status mudará para <strong>Pendente Aprovação</strong> automaticamente.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button
            size="sm"
            disabled={saving || !parecer.trim()}
            onClick={handleSalvar}
            className="bg-sky-600 hover:bg-sky-700"
          >
            {saving ? "Enviando..." : "Enviar para Aprovação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}