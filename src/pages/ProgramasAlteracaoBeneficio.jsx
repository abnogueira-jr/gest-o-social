import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Edit, History, Loader2, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_COR = {
  "Ativo": "bg-emerald-100 text-emerald-700",
  "Suspenso": "bg-yellow-100 text-yellow-700",
  "Cancelado": "bg-red-100 text-red-700",
  "Em Análise": "bg-blue-100 text-blue-700",
  "Aguardando": "bg-slate-100 text-slate-600",
};

const STATUS_OPTIONS = ["Ativo", "Suspenso", "Cancelado", "Em Análise", "Aguardando"];
const MOTIVOS = [
  "Revisão Cadastral", "Descumprimento de Condicionalidades", "Renda Acima do Limite",
  "Solicitação do Beneficiário", "Erro de Cadastro", "Óbito",
  "Mudança de Município", "Regularização de Pendência", "Outros"
];

function ModalAlteracao({ open, onClose, onSaved, registro }) {
  const editing = !!registro;
  const [form, setForm] = useState({
    cpf_beneficiario: "", nome_beneficiario: "", numero_cartao: "",
    status_anterior: "", status_novo: "", motivo_alteracao: "", justificativa: ""
  });
  const [buscando, setBuscando] = useState(false);
  const [saving, setSaving] = useState(false);
  const [familias, setFamilias] = useState([]);

  useEffect(() => {
    if (open) {
      if (registro) {
        setForm({
          cpf_beneficiario: registro.cpf_beneficiario || "",
          nome_beneficiario: registro.nome_beneficiario || "",
          numero_cartao: registro.numero_cartao || "",
          status_anterior: registro.status_anterior || "",
          status_novo: registro.status_novo || "",
          motivo_alteracao: registro.motivo_alteracao || "",
          justificativa: registro.justificativa || ""
        });
      } else {
        setForm({ cpf_beneficiario: "", nome_beneficiario: "", numero_cartao: "", status_anterior: "", status_novo: "", motivo_alteracao: "", justificativa: "" });
      }
    }
  }, [open, registro]);

  const buscarPorCPF = async () => {
    if (!form.cpf_beneficiario) return;
    setBuscando(true);
    const cpfLimpo = form.cpf_beneficiario.replace(/\D/g, "");
    const results = await base44.entities.Familia.filter({ cpf_responsavel: cpfLimpo });
    if (results.length > 0) {
      const f = results[0];
      setForm(prev => ({
        ...prev,
        nome_beneficiario: f.nome_responsavel || "",
        numero_cartao: "",
        status_anterior: f.status_beneficio || ""
      }));
    }
    setBuscando(false);
  };

  const handleSave = async () => {
    if (!form.cpf_beneficiario || !form.nome_beneficiario || !form.status_novo || !form.motivo_alteracao) return;
    setSaving(true);
    const user = await base44.auth.me();
    const payload = {
      ...form,
      usuario_responsavel: user?.full_name || user?.email || "Sistema",
      data_hora_alteracao: new Date().toISOString()
    };
    if (editing) {
      await base44.entities.AlteracaoBeneficio.update(registro.id, payload);
    } else {
      await base44.entities.AlteracaoBeneficio.create(payload);
    }
    setSaving(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-800">
            Alterar Situação do Benefício e Gravar Histórico
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* CPF + Nome */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">CPF</label>
              <div className="flex gap-2">
                <Input
                  placeholder="000.000.000-00"
                  value={form.cpf_beneficiario}
                  onChange={e => setForm(p => ({ ...p, cpf_beneficiario: e.target.value }))}
                />
                <Button variant="outline" size="icon" onClick={buscarPorCPF} disabled={buscando}>
                  {buscando ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                </Button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Nome do Beneficiário</label>
              <Input value={form.nome_beneficiario} onChange={e => setForm(p => ({ ...p, nome_beneficiario: e.target.value }))} />
            </div>
          </div>

          {/* Status + Cartão */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Status Atual</label>
              <Input value={form.status_anterior} readOnly className="bg-slate-50" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Nº do Cartão</label>
              <Input value={form.numero_cartao} onChange={e => setForm(p => ({ ...p, numero_cartao: e.target.value }))} />
            </div>
          </div>

          {/* Alterar Status + Motivo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Alterar o Status para</label>
              <select
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
                value={form.status_novo}
                onChange={e => setForm(p => ({ ...p, status_novo: e.target.value }))}
              >
                <option value="">Selecione...</option>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Motivo da Alteração</label>
              <select
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
                value={form.motivo_alteracao}
                onChange={e => setForm(p => ({ ...p, motivo_alteracao: e.target.value }))}
              >
                <option value="">Selecione...</option>
                {MOTIVOS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {/* Justificativa */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Justificativa (Caso seja necessário)</label>
            <textarea
              rows={4}
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background resize-none"
              value={form.justificativa}
              onChange={e => setForm(p => ({ ...p, justificativa: e.target.value }))}
            />
          </div>

          {/* Rodapé informativo */}
          <div className="grid grid-cols-3 gap-3 bg-slate-50 rounded-lg p-3 text-xs text-slate-500">
            <div>
              <p className="font-medium text-slate-600">Usuário</p>
              <p>{form.usuario_responsavel || "—"}</p>
            </div>
            <div>
              <p className="font-medium text-slate-600">Data/Hora</p>
              <p>{format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.status_novo || !form.motivo_alteracao}
              className="bg-sky-600 hover:bg-sky-700"
            >
              {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
              Gravar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ProgramasAlteracaoBeneficio() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selecionado, setSelecionado] = useState(null);

  const carregar = async () => {
    setLoading(true);
    const data = await base44.entities.AlteracaoBeneficio.list("-data_hora_alteracao", 100);
    setRegistros(data);
    setLoading(false);
  };

  useEffect(() => { carregar(); }, []);

  const filtrados = registros.filter(r =>
    r.nome_beneficiario?.toLowerCase().includes(busca.toLowerCase()) ||
    r.cpf_beneficiario?.includes(busca)
  );

  const abrirNovo = () => { setSelecionado(null); setModalOpen(true); };
  const abrirEditar = (r) => { setSelecionado(r); setModalOpen(true); };
  const fecharModal = () => { setModalOpen(false); setSelecionado(null); };
  const aoSalvar = () => { fecharModal(); carregar(); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <History size={22} className="text-sky-600" />
            Alteração de Situação do Benefício
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Histórico de alterações de status de benefícios</p>
        </div>
        <Button onClick={abrirNovo} className="bg-sky-600 hover:bg-sky-700 gap-1.5">
          <Plus size={16} /> Nova Alteração
        </Button>
      </div>

      {/* Busca */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          className="pl-8"
          placeholder="Buscar por nome ou CPF..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Beneficiário</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">CPF</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Status Anterior</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Novo Status</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Motivo</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Data/Hora</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Usuário</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={8} className="text-center py-10 text-slate-400"><Loader2 size={20} className="animate-spin inline" /></td></tr>
            ) : filtrados.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-10 text-slate-400">Nenhum registro encontrado</td></tr>
            ) : filtrados.map(r => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{r.nome_beneficiario}</td>
                <td className="px-4 py-3 text-slate-500">{r.cpf_beneficiario}</td>
                <td className="px-4 py-3">
                  {r.status_anterior ? (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COR[r.status_anterior] || "bg-slate-100 text-slate-600"}`}>
                      {r.status_anterior}
                    </span>
                  ) : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COR[r.status_novo] || "bg-slate-100 text-slate-600"}`}>
                    {r.status_novo}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600 max-w-[180px] truncate">{r.motivo_alteracao}</td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                  {r.data_hora_alteracao ? format(new Date(r.data_hora_alteracao), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "—"}
                </td>
                <td className="px-4 py-3 text-slate-500">{r.usuario_responsavel}</td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="icon" onClick={() => abrirEditar(r)}>
                    <Edit size={14} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ModalAlteracao
        open={modalOpen}
        onClose={fecharModal}
        onSaved={aoSalvar}
        registro={selecionado}
      />
    </div>
  );
}