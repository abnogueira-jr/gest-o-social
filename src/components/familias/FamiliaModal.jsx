import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Navigation, Loader2 } from "lucide-react";

const regioes = ["Bolsão", "Central", "Cone Sul", "Grande Dourados", "Leste", "Norte", "Pantanal", "Sudoeste", "Sul Fronteira"];
const municipios = ["Campo Grande", "Dourados", "Três Lagoas", "Corumbá", "Ponta Porã", "Naviraí", "Nova Andradina", "Aquidauana", "Coxim", "Bonito", "Jardim", "Maracaju", "Sidrolândia", "Paranaíba"];

const EMPTY = {
  numero_nis: "", nome_responsavel: "", cpf_responsavel: "", data_nascimento: "",
  telefone: "", email: "", endereco: "", bairro: "", municipio: "", regiao: "",
  num_membros: "", renda_familiar: "", tipo_familia: "", situacao_cadastral: "Ativo",
  faixa_pobreza: "", status_beneficio: "Aguardando", data_cadastro: new Date().toISOString().split("T")[0],
  observacoes: ""
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

export default function FamiliaModal({ open, familia, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(familia ? { ...EMPTY, ...familia } : EMPTY);
  }, [familia, open]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.nome_responsavel || !form.cpf_responsavel) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-slate-800">
            {familia ? "Editar Família" : "Nova Família"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Identificação */}
          <section>
            <h3 className="text-xs font-semibold text-sky-600 uppercase tracking-wider mb-3 pb-1 border-b border-sky-100">
              Identificação
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="NIS">
                <Input value={form.numero_nis} onChange={(e) => set("numero_nis", e.target.value)} placeholder="000.00000.00-0" />
              </Field>
              <Field label="Nome do Responsável" required>
                <Input value={form.nome_responsavel} onChange={(e) => set("nome_responsavel", e.target.value)} placeholder="Nome completo" />
              </Field>
              <Field label="CPF do Responsável" required>
                <Input value={form.cpf_responsavel} onChange={(e) => set("cpf_responsavel", e.target.value)} placeholder="000.000.000-00" />
              </Field>
              <Field label="Data de Nascimento">
                <Input type="date" value={form.data_nascimento} onChange={(e) => set("data_nascimento", e.target.value)} />
              </Field>
              <Field label="Telefone">
                <Input value={form.telefone} onChange={(e) => set("telefone", e.target.value)} placeholder="(67) 99999-9999" />
              </Field>
              <Field label="E-mail">
                <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="email@exemplo.com" />
              </Field>
            </div>
          </section>

          {/* Endereço */}
          <section>
            <h3 className="text-xs font-semibold text-sky-600 uppercase tracking-wider mb-3 pb-1 border-b border-sky-100">
              Endereço
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Endereço">
                <Input value={form.endereco} onChange={(e) => set("endereco", e.target.value)} placeholder="Rua, número, complemento" />
              </Field>
              <Field label="Bairro">
                <Input value={form.bairro} onChange={(e) => set("bairro", e.target.value)} placeholder="Bairro" />
              </Field>
              <Field label="Município">
                <Select value={form.municipio} onValueChange={(v) => set("municipio", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {municipios.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Região">
                <Select value={form.regiao} onValueChange={(v) => set("regiao", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {regioes.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </section>

          {/* Composição Familiar */}
          <section>
            <h3 className="text-xs font-semibold text-sky-600 uppercase tracking-wider mb-3 pb-1 border-b border-sky-100">
              Composição Familiar
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Nº de Membros">
                <Input type="number" min="1" value={form.num_membros} onChange={(e) => set("num_membros", e.target.value)} placeholder="0" />
              </Field>
              <Field label="Renda Familiar (R$)">
                <Input type="number" step="0.01" value={form.renda_familiar} onChange={(e) => set("renda_familiar", e.target.value)} placeholder="0,00" />
              </Field>
              <Field label="Tipo de Família">
                <Select value={form.tipo_familia} onValueChange={(v) => set("tipo_familia", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Família Solo">Família Solo</SelectItem>
                    <SelectItem value="Família com Crianças">Família com Crianças</SelectItem>
                    <SelectItem value="Família com Idosos">Família com Idosos</SelectItem>
                    <SelectItem value="Família com Deficientes">Família com Deficientes</SelectItem>
                    <SelectItem value="Família com Gestantes">Família com Gestantes</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </section>

          {/* Status */}
          <section>
            <h3 className="text-xs font-semibold text-sky-600 uppercase tracking-wider mb-3 pb-1 border-b border-sky-100">
              Status e Benefício
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Situação Cadastral">
                <Select value={form.situacao_cadastral} onValueChange={(v) => set("situacao_cadastral", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Suspenso">Suspenso</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Faixa de Pobreza">
                <Select value={form.faixa_pobreza} onValueChange={(v) => set("faixa_pobreza", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Extrema Pobreza">Extrema Pobreza</SelectItem>
                    <SelectItem value="Pobreza">Pobreza</SelectItem>
                    <SelectItem value="Baixa Renda">Baixa Renda</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Status do Benefício">
                <Select value={form.status_beneficio} onValueChange={(v) => set("status_beneficio", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Suspenso">Suspenso</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                    <SelectItem value="Em Análise">Em Análise</SelectItem>
                    <SelectItem value="Aguardando">Aguardando</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Data de Cadastro">
                <Input type="date" value={form.data_cadastro} onChange={(e) => set("data_cadastro", e.target.value)} />
              </Field>
            </div>
          </section>

          {/* Observações */}
          <section>
            <h3 className="text-xs font-semibold text-sky-600 uppercase tracking-wider mb-3 pb-1 border-b border-sky-100">
              Observações
            </h3>
            <Textarea
              value={form.observacoes}
              onChange={(e) => set("observacoes", e.target.value)}
              placeholder="Informações adicionais sobre a família..."
              rows={3}
            />
          </section>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-sky-600 hover:bg-sky-700">
            {saving ? "Salvando..." : familia ? "Atualizar" : "Cadastrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}