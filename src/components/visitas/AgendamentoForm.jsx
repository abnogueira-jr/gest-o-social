import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import UploadFotos from "./UploadFotos";
import { Camera } from "lucide-react";

const TIPOS = ["Busca Ativa", "Acompanhamento", "Validação", "Monitoramento"];
const TECNICOS = ["Ana Lima", "Carlos Souza", "Fernanda Rocha", "João Mendes", "Maria Santos", "Paulo Alves"];

const INICIAL = {
  familia_nome: "",
  familia_id: "",
  tecnico_responsavel: "",
  data_agendamento: "",
  tipo_visita: "Acompanhamento",
  observacoes: "",
  status: "Agendada",
  data_visita: "",
  resultado: "",
  fotos: [],
};

function Campo({ label, required, children }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-slate-600">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
    </div>
  );
}

export default function AgendamentoForm({ open, visita, onClose, onSalvar }) {
  const [form, setForm] = useState(INICIAL);
  const [familias, setFamilias] = useState([]);
  const [saving, setSaving] = useState(false);
  const [buscaFamilia, setBuscaFamilia] = useState("");

  useEffect(() => {
    if (open) {
      setForm(visita ? { ...INICIAL, ...visita } : { ...INICIAL });
      setBuscaFamilia(visita?.familia_nome || "");
      base44.entities.Familia.list("-created_date", 200).then(setFamilias).catch(() => {});
    }
  }, [open, visita]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const familiasFiltradas = familias.filter((f) =>
    f.nome_responsavel?.toLowerCase().includes(buscaFamilia.toLowerCase()) ||
    f.cpf_responsavel?.includes(buscaFamilia) ||
    f.numero_nis?.includes(buscaFamilia)
  ).slice(0, 6);

  const selecionarFamilia = (f) => {
    set("familia_id", f.id);
    set("familia_nome", f.nome_responsavel);
    setBuscaFamilia(f.nome_responsavel);
    setFamilias([]); // fecha dropdown
  };

  const handleSubmit = async () => {
    if (!form.familia_nome || !form.data_agendamento || !form.tecnico_responsavel) return;
    setSaving(true);
    await onSalvar(form);
    // Atualiza status da família automaticamente ao concluir visita
    if (form.status === "Realizada" && form.familia_id) {
      await base44.entities.Familia.update(form.familia_id, { situacao_cadastral: "Ativo" });
    }
    setSaving(false);
    onClose();
  };

  const isEdit = !!visita?.id;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">
            {isEdit ? "Editar Agendamento" : "Novo Agendamento de Visita"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Família */}
          <Campo label="Família" required>
            <div className="relative">
              <Input
                placeholder="Buscar por nome, CPF ou NIS..."
                value={buscaFamilia}
                onChange={(e) => {
                  setBuscaFamilia(e.target.value);
                  set("familia_nome", e.target.value);
                  set("familia_id", "");
                  // recarrega lista ao digitar
                  base44.entities.Familia.list("-created_date", 200).then(setFamilias).catch(() => {});
                }}
              />
              {buscaFamilia && familiasFiltradas.length > 0 && !form.familia_id && (
                <div className="absolute z-10 top-full left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                  {familiasFiltradas.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => selecionarFamilia(f)}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                    >
                      <p className="text-sm text-slate-800 font-medium">{f.nome_responsavel}</p>
                      <p className="text-xs text-slate-400">NIS: {f.numero_nis || "—"} · {f.municipio || "—"}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {form.familia_id && (
              <p className="text-xs text-emerald-600 mt-1">✓ Família vinculada ao cadastro</p>
            )}
          </Campo>

          <div className="grid grid-cols-2 gap-3">
            {/* Data de agendamento */}
            <Campo label="Data do Agendamento" required>
              <Input
                type="date"
                value={form.data_agendamento}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => set("data_agendamento", e.target.value)}
              />
            </Campo>

            {/* Tipo */}
            <Campo label="Tipo de Visita" required>
              <Select value={form.tipo_visita} onValueChange={(v) => set("tipo_visita", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIPOS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </Campo>
          </div>

          {/* Técnico */}
          <Campo label="Técnico Responsável" required>
            <Select value={form.tecnico_responsavel} onValueChange={(v) => set("tecnico_responsavel", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione o técnico..." /></SelectTrigger>
              <SelectContent>
                {TECNICOS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </Campo>

          {/* Status (só exibe na edição) */}
          {isEdit && (
            <Campo label="Status">
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Agendada", "Realizada", "Cancelada", "Reagendada", "Não Localizada"].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Campo>
          )}

          {/* Observações */}
          <Campo label="Observações">
            <Textarea
              rows={2}
              placeholder="Orientações para o técnico, rota, horário preferencial..."
              value={form.observacoes}
              onChange={(e) => set("observacoes", e.target.value)}
            />
          </Campo>

          {/* Registro da visita — exibido ao concluir */}
          {(form.status === "Realizada" || form.status === "Não Localizada") && (
            <div className="border-t border-slate-200 pt-3 space-y-3">
              <p className="text-xs font-semibold text-sky-700 uppercase tracking-wider">Registro da Visita</p>
              <Campo label="Data da Visita">
                <Input type="date" value={form.data_visita} onChange={(e) => set("data_visita", e.target.value)} />
              </Campo>
              <Campo label="Resultado / Parecer Técnico">
                <Textarea
                  rows={2}
                  placeholder="Descreva o resultado da visita..."
                  value={form.resultado}
                  onChange={(e) => set("resultado", e.target.value)}
                />
              </Campo>
              <Campo label={<span className="flex items-center gap-1.5"><Camera size={12} /> Fotos da Visita</span>}>
                <UploadFotos fotos={form.fotos || []} onChange={(f) => set("fotos", f)} />
              </Campo>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button
            size="sm"
            disabled={saving || !form.familia_nome || !form.data_agendamento || !form.tecnico_responsavel}
            onClick={handleSubmit}
            className="bg-sky-600 hover:bg-sky-700"
          >
            {saving ? "Salvando..." : isEdit ? "Salvar Alterações" : "Agendar Visita"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}