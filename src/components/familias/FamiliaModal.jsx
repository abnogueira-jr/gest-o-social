import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Navigation, Loader2, ChevronRight, ChevronLeft, User, Briefcase, Building2, FileText, Home, Users, Plus, Trash2, Check } from "lucide-react";

const regioes = ["Bolsão", "Central", "Cone Sul", "Grande Dourados", "Leste", "Norte", "Pantanal", "Sudoeste", "Sul Fronteira"];
const municipiosMS = ["Água Clara", "Aquidauana", "Bonito", "Campo Grande", "Corumbá", "Coxim", "Dourados", "Jardim", "Maracaju", "Naviraí", "Nova Andradina", "Paranaíba", "Ponta Porã", "Sidrolândia", "Três Lagoas"];

const EMPTY = {
  nome_responsavel: "", cpf_responsavel: "", rg_numero: "", cadastro_unico: "",
  data_nascimento: "", genero: "", estado_civil: "", nacionalidade: "Brasileira",
  escolaridade: "", ultima_serie: "", recadastro: false,
  telefone: "", email: "",
  situacao_ocupacao: "", participa_qualifica_ms: false,
  possui_doenca: false, possui_deficiencia: false,
  possui_beneficio: false, renda_mensal: "", renda_per_capita: "",
  beneficios_lista: [], patrimonios: [],
  documentos_obrigatorios: { termo_veracidade: false, doc_identidade_frente: false, doc_identidade_verso: false, comprovante_residencia: false, comprovante_renda: false },
  documentos_especificos: { registro_cadastro_federal: false, laudo_medico: false, laudo_deficiencia: false, carteira_vacinacao: false, laudo_autismo: false },
  endereco: "", cep: "", bairro: "", regiao: "", estado: "Mato Grosso do Sul", municipio: "",
  situacao_moradia: "", tipo_moradia: "", tempo_residencia_ms: "",
  latitude: "", longitude: "",
  membros_familiares: [],
  num_membros: "", renda_familiar: "", tipo_familia: "",
  situacao_cadastral: "Ativo", faixa_pobreza: "", status_beneficio: "Aguardando",
  data_cadastro: new Date().toISOString().split("T")[0], observacoes: "", numero_nis: ""
};

const STEPS = [
  { id: 1, label: "Perfil Pessoal", icon: User },
  { id: 2, label: "Ocupação e Renda", icon: Briefcase },
  { id: 3, label: "Benefícios e Patrimônio", icon: Building2 },
  { id: 4, label: "Documentos", icon: FileText },
  { id: 5, label: "Endereço", icon: Home },
  { id: 6, label: "Grupo Familiar", icon: Users },
];

function Field({ label, required, children, className = "" }) {
  return (
    <div className={`space-y-1 ${className}`}>
      <Label className="text-xs font-medium text-slate-600">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, color = "text-sky-600", children }) {
  return (
    <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-3 pb-1.5 border-b ${color} border-slate-100`}>
      {Icon && <Icon size={13} />}
      {children}
    </div>
  );
}

function RadioGroup({ value, onChange, options }) {
  return (
    <div className="flex gap-3">
      {options.map(o => (
        <label key={o.value} className="flex items-center gap-1.5 cursor-pointer text-sm text-slate-700">
          <input type="radio" checked={value === o.value} onChange={() => onChange(o.value)}
            className="accent-sky-600" />
          {o.label}
        </label>
      ))}
    </div>
  );
}

function CheckItem({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 py-1.5 border-b border-slate-50 last:border-0">
      <input type="checkbox" checked={!!checked} onChange={e => onChange(e.target.checked)}
        className="accent-sky-600 w-4 h-4" />
      {label}
    </label>
  );
}

// ─── ETAPA 1: Perfil Pessoal ────────────────────────────────────────────────
function Step1({ form, set }) {
  return (
    <div className="space-y-5">
      <div>
        <SectionTitle icon={User} color="text-sky-600">Informações Pessoais</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="CPF" required>
            <Input value={form.cpf_responsavel} onChange={e => set("cpf_responsavel", e.target.value)} placeholder="000.000.000-00" />
          </Field>
          <Field label="Código Familiar">
            <Input value={form.cadastro_unico} onChange={e => set("cadastro_unico", e.target.value)} placeholder="0000 000 0000" />
          </Field>
          <Field label="Nome Completo" required className="sm:col-span-2">
            <Input value={form.nome_responsavel} onChange={e => set("nome_responsavel", e.target.value)} placeholder="Nome completo" />
          </Field>
          <Field label="Data de Nascimento">
            <Input type="date" value={form.data_nascimento} onChange={e => set("data_nascimento", e.target.value)} />
          </Field>
          <Field label="Gênero">
            <Select value={form.genero} onValueChange={v => set("genero", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Masculino">Masculino</SelectItem>
                <SelectItem value="Feminino">Feminino</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Estado Civil">
            <Select value={form.estado_civil} onValueChange={v => set("estado_civil", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)", "União Estável"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Nacionalidade">
            <Input value={form.nacionalidade} onChange={e => set("nacionalidade", e.target.value)} />
          </Field>
        </div>
      </div>

      <div>
        <SectionTitle icon={null} color="text-emerald-600">Contato</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Telefone">
            <Input value={form.telefone} onChange={e => set("telefone", e.target.value)} placeholder="(67) 99999-9999" />
          </Field>
          <Field label="E-mail">
            <Input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="email@exemplo.com" />
          </Field>
        </div>
      </div>

      <div>
        <SectionTitle icon={null} color="text-violet-600">Educação</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Nível de Escolaridade">
            <Select value={form.escolaridade} onValueChange={v => set("escolaridade", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {["Não Alfabetizado", "Ensino Fundamental Incompleto", "Ensino Fundamental Completo", "Ensino Médio Incompleto", "Ensino Médio Completo", "Ensino Superior Incompleto", "Ensino Superior Completo", "Pós-graduação"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Última Série Completada">
            <Input value={form.ultima_serie} onChange={e => set("ultima_serie", e.target.value)} placeholder="Ex: 8ª série" />
          </Field>
        </div>
        <div className="mt-2">
          <CheckItem checked={form.recadastro} onChange={v => set("recadastro", v)} label="Recadastro - Concordo com o uso dos meus dados" />
        </div>
      </div>
    </div>
  );
}

// ─── ETAPA 2: Ocupação e Renda ───────────────────────────────────────────────
function Step2({ form, set }) {
  return (
    <div className="space-y-5">
      <div>
        <SectionTitle icon={null} color="text-emerald-600">Renda Familiar</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Renda Mensal (R$)">
            <Input type="number" step="0.01" value={form.renda_mensal} onChange={e => set("renda_mensal", e.target.value)} placeholder="0,00" />
          </Field>
          <Field label="Renda Per Capita (R$)">
            <Input type="number" step="0.01" value={form.renda_per_capita} onChange={e => set("renda_per_capita", e.target.value)} placeholder="0,00" />
          </Field>
        </div>
      </div>

      <div>
        <SectionTitle icon={null} color="text-violet-600">Ocupação</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Situação Atual">
            <Select value={form.situacao_ocupacao} onValueChange={v => set("situacao_ocupacao", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {["Empregado", "Desempregado", "Autônomo", "Aposentado", "Do Lar", "Estudante"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Participa do Qualifica MS">
            <RadioGroup value={form.participa_qualifica_ms ? "sim" : "nao"} onChange={v => set("participa_qualifica_ms", v === "sim")} options={[{ value: "sim", label: "Sim" }, { value: "nao", label: "Não" }]} />
          </Field>
        </div>
      </div>

      <div>
        <SectionTitle icon={null} color="text-red-500">Saúde</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Possui alguma doença?">
            <RadioGroup value={form.possui_doenca ? "sim" : "nao"} onChange={v => set("possui_doenca", v === "sim")} options={[{ value: "sim", label: "Sim" }, { value: "nao", label: "Não" }]} />
          </Field>
          <Field label="Possui alguma deficiência?">
            <RadioGroup value={form.possui_deficiencia ? "sim" : "nao"} onChange={v => set("possui_deficiencia", v === "sim")} options={[{ value: "sim", label: "Sim" }, { value: "nao", label: "Não" }]} />
          </Field>
        </div>
      </div>

      <div>
        <SectionTitle icon={null} color="text-amber-600">Benefícios</SectionTitle>
        <Field label="Possui algum benefício?">
          <RadioGroup value={form.possui_beneficio ? "sim" : "nao"} onChange={v => set("possui_beneficio", v === "sim")} options={[{ value: "sim", label: "Sim" }, { value: "nao", label: "Não" }]} />
        </Field>
        {form.possui_beneficio && (
          <BeneficiosEditor beneficios={form.beneficios_lista} onChange={v => set("beneficios_lista", v)} />
        )}
      </div>
    </div>
  );
}

function BeneficiosEditor({ beneficios = [], onChange }) {
  const add = () => onChange([...beneficios, { nome: "", valor: "", do_beneficiario: false }]);
  const remove = i => onChange(beneficios.filter((_, idx) => idx !== i));
  const update = (i, field, val) => onChange(beneficios.map((b, idx) => idx === i ? { ...b, [field]: val } : b));
  return (
    <div className="mt-3 space-y-2">
      {beneficios.map((b, i) => (
        <div key={i} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
          <Input value={b.nome} onChange={e => update(i, "nome", e.target.value)} placeholder="Nome do benefício" className="flex-1 text-sm" />
          <Input type="number" value={b.valor} onChange={e => update(i, "valor", e.target.value)} placeholder="Valor" className="w-28 text-sm" />
          <label className="flex items-center gap-1 text-xs text-slate-600 whitespace-nowrap">
            <input type="checkbox" checked={!!b.do_beneficiario} onChange={e => update(i, "do_beneficiario", e.target.checked)} className="accent-sky-600" />
            Titular
          </label>
          <button onClick={() => remove(i)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
        </div>
      ))}
      <Button type="button" size="sm" variant="outline" onClick={add} className="gap-1 text-xs h-7">
        <Plus size={12} /> Adicionar Benefício
      </Button>
    </div>
  );
}

// ─── ETAPA 3: Benefícios e Patrimônio ───────────────────────────────────────
function Step3({ form, set }) {
  return (
    <div className="space-y-5">
      <div>
        <SectionTitle icon={null} color="text-sky-600">Código Familiar</SectionTitle>
        <div className="bg-sky-50 border border-sky-200 rounded-lg px-4 py-3 text-sm font-mono text-sky-800">
          {form.cadastro_unico || "— não informado —"}
        </div>
      </div>

      <div>
        <SectionTitle icon={null} color="text-emerald-600">Listagem de Benefícios do Grupo Familiar</SectionTitle>
        {form.beneficios_lista && form.beneficios_lista.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500">
                <th className="text-left py-2 font-medium">Benefício</th>
                <th className="text-right py-2 font-medium">Valor</th>
                <th className="text-center py-2 font-medium">Do Beneficiário</th>
              </tr>
            </thead>
            <tbody>
              {form.beneficios_lista.map((b, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-2 text-slate-700">{b.nome || "—"}</td>
                  <td className="py-2 text-right text-slate-700">R$ {parseFloat(b.valor || 0).toFixed(2)}</td>
                  <td className="py-2 text-center text-slate-500">{b.do_beneficiario ? "Sim" : "Não"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-slate-400 py-3 text-center">Nenhum benefício registrado</p>
        )}
      </div>

      <div>
        <SectionTitle icon={null} color="text-violet-600">Listagem de Patrimônios Registrados</SectionTitle>
        <PatrimoniosEditor patrimonios={form.patrimonios || []} onChange={v => set("patrimonios", v)} />
      </div>
    </div>
  );
}

function PatrimoniosEditor({ patrimonios, onChange }) {
  const add = () => onChange([...patrimonios, { descricao: "", valor: "" }]);
  const remove = i => onChange(patrimonios.filter((_, idx) => idx !== i));
  const update = (i, field, val) => onChange(patrimonios.map((p, idx) => idx === i ? { ...p, [field]: val } : p));
  if (patrimonios.length === 0) return (
    <div className="text-center py-4 text-sm text-slate-400">
      <p>Nenhum patrimônio registrado</p>
      <Button type="button" size="sm" variant="outline" onClick={add} className="mt-2 gap-1 text-xs h-7">
        <Plus size={12} /> Adicionar Patrimônio
      </Button>
    </div>
  );
  return (
    <div className="space-y-2">
      {patrimonios.map((p, i) => (
        <div key={i} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
          <Input value={p.descricao} onChange={e => update(i, "descricao", e.target.value)} placeholder="Descrição do patrimônio" className="flex-1 text-sm" />
          <Input type="number" value={p.valor} onChange={e => update(i, "valor", e.target.value)} placeholder="Valor" className="w-28 text-sm" />
          <button onClick={() => remove(i)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
        </div>
      ))}
      <Button type="button" size="sm" variant="outline" onClick={add} className="gap-1 text-xs h-7">
        <Plus size={12} /> Adicionar Patrimônio
      </Button>
    </div>
  );
}

// ─── ETAPA 4: Documentos ─────────────────────────────────────────────────────
function Step4({ form, set }) {
  const setDocOb = (k, v) => set("documentos_obrigatorios", { ...form.documentos_obrigatorios, [k]: v });
  const setDocEsp = (k, v) => set("documentos_especificos", { ...form.documentos_especificos, [k]: v });
  const docOb = form.documentos_obrigatorios || {};
  const docEsp = form.documentos_especificos || {};

  return (
    <div className="space-y-5">
      <div>
        <SectionTitle icon={FileText} color="text-sky-600">Documentos Obrigatórios</SectionTitle>
        <div className="bg-white border border-slate-200 rounded-lg px-4 py-2">
          <CheckItem checked={docOb.termo_veracidade} onChange={v => setDocOb("termo_veracidade", v)} label="Termo de Veracidade" />
          <CheckItem checked={docOb.doc_identidade_frente} onChange={v => setDocOb("doc_identidade_frente", v)} label="Documento de Identificação com Foto - Frente" />
          <CheckItem checked={docOb.doc_identidade_verso} onChange={v => setDocOb("doc_identidade_verso", v)} label="Documento de Identificação com Foto - Verso" />
          <CheckItem checked={docOb.comprovante_residencia} onChange={v => setDocOb("comprovante_residencia", v)} label="Comprovante de Residência Atualizado (máximo de três meses)" />
          <CheckItem checked={docOb.comprovante_renda} onChange={v => setDocOb("comprovante_renda", v)} label="Comprovante de Renda Familiar (Holerite, Cópia da CTPS, Declaração de Trabalhador Autônomo)" />
        </div>
      </div>

      <div>
        <SectionTitle icon={null} color="text-violet-600">Documentos Específicos</SectionTitle>
        <div className="bg-white border border-slate-200 rounded-lg px-4 py-2">
          <CheckItem checked={docEsp.registro_cadastro_federal} onChange={v => setDocEsp("registro_cadastro_federal", v)} label="Prova de Registro no Cadastro Federal" />
          <CheckItem checked={docEsp.laudo_medico} onChange={v => setDocEsp("laudo_medico", v)} label="Laudo Médico (caso esteja doente)" />
          <CheckItem checked={docEsp.laudo_deficiencia} onChange={v => setDocEsp("laudo_deficiencia", v)} label="Laudo de Deficiência (caso possua deficiência)" />
          <CheckItem checked={docEsp.carteira_vacinacao} onChange={v => setDocEsp("carteira_vacinacao", v)} label="Carteira de Vacinação Atualizada (opcional)" />
          <CheckItem checked={docEsp.laudo_autismo} onChange={v => setDocEsp("laudo_autismo", v)} label="Laudo de Diagnóstico de Autismo (se aplicável)" />
        </div>
      </div>
    </div>
  );
}

// ─── ETAPA 5: Endereço ───────────────────────────────────────────────────────
function Step5({ form, set }) {
  const [geoLoading, setGeoLoading] = useState(false);

  const capturarGeo = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => { set("latitude", pos.coords.latitude); set("longitude", pos.coords.longitude); setGeoLoading(false); },
      () => setGeoLoading(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-5">
      <div>
        <SectionTitle icon={Home} color="text-sky-600">Informações de Residência</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Logradouro" className="sm:col-span-2">
            <Input value={form.endereco} onChange={e => set("endereco", e.target.value)} placeholder="Rua, número, complemento" />
          </Field>
          <Field label="CEP">
            <Input value={form.cep} onChange={e => set("cep", e.target.value)} placeholder="00000-000" />
          </Field>
          <Field label="Bairro">
            <Input value={form.bairro} onChange={e => set("bairro", e.target.value)} placeholder="Bairro" />
          </Field>
          <Field label="Região">
            <Select value={form.regiao} onValueChange={v => set("regiao", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{regioes.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Estado">
            <Input value={form.estado} onChange={e => set("estado", e.target.value)} />
          </Field>
          <Field label="Cidade">
            <Select value={form.municipio} onValueChange={v => set("municipio", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{municipiosMS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
        </div>
      </div>

      <div>
        <SectionTitle icon={null} color="text-emerald-600">Tipo de Moradia</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Situação da Moradia">
            <Select value={form.situacao_moradia} onValueChange={v => set("situacao_moradia", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {["Própria", "Alugada", "Cedida", "Irregular", "Financiada"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Tipo de Moradia">
            <Select value={form.tipo_moradia} onValueChange={v => set("tipo_moradia", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {["Casa", "Apartamento", "Cômodo", "Improvisada"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Tempo de Residência no MS">
            <Input value={form.tempo_residencia_ms} onChange={e => set("tempo_residencia_ms", e.target.value)} placeholder="Ex: 26 anos" />
          </Field>
        </div>
      </div>

      <div>
        <SectionTitle icon={MapPin} color="text-violet-600">Localização</SectionTitle>
        <div className="bg-sky-50 border border-sky-100 rounded-lg p-3">
          <div className="flex justify-end mb-2">
            <Button type="button" size="sm" variant="outline" onClick={capturarGeo} disabled={geoLoading} className="h-7 text-xs border-sky-300 text-sky-700 hover:bg-sky-100 gap-1">
              {geoLoading ? <Loader2 size={12} className="animate-spin" /> : <Navigation size={12} />}
              {geoLoading ? "Obtendo..." : "Usar localização atual"}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Latitude">
              <Input type="number" step="any" value={form.latitude} onChange={e => set("latitude", e.target.value)} placeholder="-20.4697" />
            </Field>
            <Field label="Longitude">
              <Input type="number" step="any" value={form.longitude} onChange={e => set("longitude", e.target.value)} placeholder="-54.6201" />
            </Field>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ETAPA 6: Grupo Familiar ─────────────────────────────────────────────────
function Step6({ form, set }) {
  const [editIdx, setEditIdx] = useState(null);
  const membros = form.membros_familiares || [];

  const addMembro = () => {
    const novo = { nome: "", data_nascimento: "", estado_civil: "Solteiro(a)", parentesco: "", escolaridade: "", ultima_serie: "", frequenta_escola: false, possui_doenca: false, possui_deficiencia: false, possui_autismo: false, possui_renda: false, observacoes: "" };
    const updated = [...membros, novo];
    set("membros_familiares", updated);
    setEditIdx(updated.length - 1);
  };

  const updateMembro = (i, field, val) => {
    set("membros_familiares", membros.map((m, idx) => idx === i ? { ...m, [field]: val } : m));
  };

  const removeMembro = (i) => {
    set("membros_familiares", membros.filter((_, idx) => idx !== i));
    if (editIdx === i) setEditIdx(null);
  };

  const calcIdade = (dob) => {
    if (!dob) return null;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  const parentescoColors = { "Titular": "bg-sky-100 text-sky-700", "Filho(a)": "bg-green-100 text-green-700", "Filha": "bg-pink-100 text-pink-700", "Cônjuge": "bg-violet-100 text-violet-700" };

  return (
    <div className="space-y-4">
      <div>
        <SectionTitle icon={Users} color="text-sky-600">Componentes Familiares</SectionTitle>

        {/* Titular */}
        <div className="bg-sky-50 border border-sky-200 rounded-lg px-4 py-3 mb-2 flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-800 text-sm">{form.nome_responsavel || "Responsável"}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {calcIdade(form.data_nascimento) ? `${calcIdade(form.data_nascimento)} anos` : ""} {form.genero ? `| ${form.genero}` : ""} {form.estado_civil ? `| ${form.estado_civil}` : ""} {form.nacionalidade ? `| ${form.nacionalidade}` : ""}
            </p>
          </div>
          <span className="text-xs bg-sky-200 text-sky-800 px-2 py-0.5 rounded-full font-medium">Titular</span>
        </div>

        {/* Membros */}
        {membros.map((m, i) => (
          <div key={i} className="border border-slate-200 rounded-lg mb-2 overflow-hidden">
            <div
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50"
              onClick={() => setEditIdx(editIdx === i ? null : i)}
            >
              <div>
                <p className="font-medium text-slate-800 text-sm">{m.nome || "Novo membro"}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {calcIdade(m.data_nascimento) ? `${calcIdade(m.data_nascimento)} anos` : ""} {m.data_nascimento ? `| ${m.data_nascimento}` : ""} {m.estado_civil ? `| ${m.estado_civil}` : ""} {m.escolaridade ? `| ${m.escolaridade}${m.ultima_serie ? ` (${m.ultima_serie})` : ""}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {m.parentesco && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${parentescoColors[m.parentesco] || "bg-slate-100 text-slate-600"}`}>{m.parentesco}</span>}
                <ChevronRight size={14} className={`text-slate-400 transition-transform ${editIdx === i ? "rotate-90" : ""}`} />
              </div>
            </div>

            {editIdx === i && (
              <div className="border-t border-slate-200 bg-white px-4 py-4 space-y-4">
                <SectionTitle icon={null} color="text-sky-600">Informações Pessoais</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field label="Nome Completo" className="sm:col-span-2">
                    <Input value={m.nome} onChange={e => updateMembro(i, "nome", e.target.value)} />
                  </Field>
                  <Field label="Data de Nascimento">
                    <Input type="date" value={m.data_nascimento} onChange={e => updateMembro(i, "data_nascimento", e.target.value)} />
                  </Field>
                  <Field label="Estado Civil">
                    <Select value={m.estado_civil} onValueChange={v => updateMembro(i, "estado_civil", v)}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)", "União Estável"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Grau de Parentesco">
                    <Select value={m.parentesco} onValueChange={v => updateMembro(i, "parentesco", v)}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {["Filho(a)", "Cônjuge", "Pai/Mãe", "Irmão(ã)", "Avô/Avó", "Outro"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <SectionTitle icon={null} color="text-violet-600">Educação</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Nível de Escolaridade">
                    <Select value={m.escolaridade} onValueChange={v => updateMembro(i, "escolaridade", v)}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {["Não Alfabetizado", "Ensino Fundamental Incompleto", "Ensino Fundamental Completo", "Ensino Médio Incompleto", "Ensino Médio Completo", "Ensino Superior Incompleto", "Ensino Superior Completo"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Última Série Completada">
                    <Input value={m.ultima_serie} onChange={e => updateMembro(i, "ultima_serie", e.target.value)} placeholder="Ex: 2ª série" />
                  </Field>
                  <Field label="Frequenta Escola Atualmente?">
                    <RadioGroup value={m.frequenta_escola ? "sim" : "nao"} onChange={v => updateMembro(i, "frequenta_escola", v === "sim")} options={[{ value: "sim", label: "Sim" }, { value: "nao", label: "Não" }]} />
                  </Field>
                </div>

                <SectionTitle icon={null} color="text-red-500">Saúde</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field label="Possui doença crônica?">
                    <RadioGroup value={m.possui_doenca ? "sim" : "nao"} onChange={v => updateMembro(i, "possui_doenca", v === "sim")} options={[{ value: "sim", label: "Sim" }, { value: "nao", label: "Não" }]} />
                  </Field>
                  <Field label="Possui deficiência?">
                    <RadioGroup value={m.possui_deficiencia ? "sim" : "nao"} onChange={v => updateMembro(i, "possui_deficiencia", v === "sim")} options={[{ value: "sim", label: "Sim" }, { value: "nao", label: "Não" }]} />
                  </Field>
                  <Field label="Diagnóstico de autismo?">
                    <RadioGroup value={m.possui_autismo ? "sim" : "nao"} onChange={v => updateMembro(i, "possui_autismo", v === "sim")} options={[{ value: "sim", label: "Sim" }, { value: "nao", label: "Não" }]} />
                  </Field>
                </div>

                <SectionTitle icon={null} color="text-emerald-600">Ocupação e Renda</SectionTitle>
                <Field label="Possui renda própria?">
                  <RadioGroup value={m.possui_renda ? "sim" : "nao"} onChange={v => updateMembro(i, "possui_renda", v === "sim")} options={[{ value: "sim", label: "Sim" }, { value: "nao", label: "Não" }]} />
                </Field>

                <Field label="Observações">
                  <Textarea value={m.observacoes} onChange={e => updateMembro(i, "observacoes", e.target.value)} placeholder="Adicione observações sobre este componente familiar..." rows={2} />
                </Field>

                <div className="flex justify-between pt-1">
                  <Button type="button" size="sm" variant="ghost" onClick={() => removeMembro(i)} className="text-red-500 hover:text-red-700 hover:bg-red-50 gap-1 text-xs">
                    <Trash2 size={13} /> Excluir
                  </Button>
                  <Button type="button" size="sm" onClick={() => setEditIdx(null)} className="bg-sky-600 hover:bg-sky-700 gap-1 text-xs">
                    <Check size={13} /> Salvar Alterações
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}

        <Button type="button" size="sm" variant="outline" onClick={addMembro} className="gap-1 text-xs mt-1">
          <Plus size={12} /> Adicionar Membro
        </Button>
      </div>
    </div>
  );
}

// ─── MODAL PRINCIPAL ─────────────────────────────────────────────────────────
export default function FamiliaModal({ open, familia, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(familia ? { ...EMPTY, ...familia } : EMPTY);
    setStep(1);
  }, [familia, open]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.nome_responsavel || !form.cpf_responsavel) { setStep(2); return; }
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const isLast = step === STEPS.length;
  const isFirst = step === 1;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[92vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-3 border-b border-slate-100 flex-shrink-0">
          <DialogTitle className="text-base font-semibold text-slate-800">
            {familia ? "Editar Família" : "Nova Família"}
          </DialogTitle>
          <p className="text-xs text-slate-400">Interface renovada mantendo todos os campos originais</p>
        </DialogHeader>

        {/* Step indicator */}
        <div className="px-6 py-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-0">
            {STEPS.map((s, idx) => {
              const Icon = s.icon;
              const active = s.id === step;
              const done = s.id < step;
              return (
                <div key={s.id} className="flex items-center flex-1 min-w-0">
                  <button
                    onClick={() => setStep(s.id)}
                    className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-all flex-shrink-0 ${active ? "text-sky-600" : done ? "text-emerald-600" : "text-slate-400"}`}
                    title={s.label}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${active ? "border-sky-500 bg-sky-50" : done ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white"}`}>
                      {done ? <Check size={12} /> : <Icon size={12} />}
                    </div>
                    <span className="text-[10px] font-medium hidden sm:block leading-tight text-center">{s.label}</span>
                  </button>
                  {idx < STEPS.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-1 rounded ${done ? "bg-emerald-300" : "bg-slate-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {step === 1 && <Step1 form={form} set={set} />}
          {step === 2 && <Step2 form={form} set={set} />}
          {step === 3 && <Step3 form={form} set={set} />}
          {step === 4 && <Step4 form={form} set={set} />}
          {step === 5 && <Step5 form={form} set={set} />}
          {step === 6 && <Step6 form={form} set={set} />}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 flex-shrink-0 bg-white">
          <Button variant="outline" onClick={isFirst ? onClose : () => setStep(s => s - 1)} disabled={saving} className="gap-1">
            {isFirst ? "Cancelar" : <><ChevronLeft size={14} /> Anterior</>}
          </Button>

          <span className="text-xs text-slate-400">{step} / {STEPS.length}</span>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSave} disabled={saving} className="gap-1">
              {saving ? <Loader2 size={13} className="animate-spin" /> : null}
              Salvar
            </Button>
            {!isLast ? (
              <Button onClick={() => setStep(s => s + 1)} className="bg-sky-600 hover:bg-sky-700 gap-1">
                Próximo <ChevronRight size={14} />
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 gap-1">
                <Check size={14} /> Finalizar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}