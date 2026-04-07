import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

const EMPTY = {
  nome: "",
  descricao: "",
  valor_beneficio: "",
  limite_orcamentario: "",
  status: "Ativo",
};

function Field({ label, required, children }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-slate-600">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}

export default function ProgramaModal({ open, programa, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(programa ? { ...EMPTY, ...programa } : EMPTY);
  }, [programa, open]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.nome) return;
    setSaving(true);
    const data = {
      ...form,
      valor_beneficio: form.valor_beneficio !== "" ? parseFloat(form.valor_beneficio) : null,
      limite_orcamentario: form.limite_orcamentario !== "" ? parseFloat(form.limite_orcamentario) : null,
    };
    await onSave(data);
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-slate-800">
            {programa ? "Editar Programa Social" : "Novo Programa Social"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <Field label="Nome do Programa" required>
            <Input value={form.nome} onChange={e => set("nome", e.target.value)} placeholder="Nome do programa social" />
          </Field>

          <Field label="Descrição">
            <Textarea value={form.descricao} onChange={e => set("descricao", e.target.value)} placeholder="Descreva o programa..." rows={3} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Valor do Benefício (R$)">
              <Input type="number" step="0.01" min="0" value={form.valor_beneficio} onChange={e => set("valor_beneficio", e.target.value)} placeholder="0,00" />
            </Field>
            <Field label="Limite Orçamentário (R$)">
              <Input type="number" step="0.01" min="0" value={form.limite_orcamentario} onChange={e => set("limite_orcamentario", e.target.value)} placeholder="0,00" />
            </Field>
          </div>

          <Field label="Status">
            <div className="flex gap-3 pt-1">
              {["Ativo", "Inativo"].map(s => (
                <label key={s} className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                  <input type="radio" checked={form.status === s} onChange={() => set("status", s)} className="accent-sky-600" />
                  {s}
                </label>
              ))}
            </div>
          </Field>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving || !form.nome} className="bg-sky-600 hover:bg-sky-700 gap-1">
            {saving && <Loader2 size={13} className="animate-spin" />}
            {programa ? "Salvar Alterações" : "Criar Programa"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}