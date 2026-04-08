import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Search, UserCheck, UserX, Smartphone } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";

// Máscara e validação de CPF
function aplicarMascaraCPF(valor) {
  return valor
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function validarCPF(cpf) {
  const s = cpf.replace(/\D/g, "");
  if (s.length !== 11 || /^(\d)\1{10}$/.test(s)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(s[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(s[9])) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(s[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(s[10]);
}

const EMPTY = { nome: "", cpf: "", municipio_id: "", municipio_nome: "", regiao_cg_id: "", regiao_cg_nome: "", ativo: true };

function AgentModal({ open, onClose, agente, municipios, regioesCG, onSalvo }) {
  const [form, setForm] = useState(EMPTY);
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setForm(agente ? { ...agente } : EMPTY);
    setErros({});
  }, [agente, open]);

  const handleCPF = (e) => {
    const mascarado = aplicarMascaraCPF(e.target.value);
    setForm(f => ({ ...f, cpf: mascarado }));
    if (erros.cpf) setErros(e => ({ ...e, cpf: null }));
  };

  const handleMunicipio = (e) => {
    const id = e.target.value;
    const mun = municipios.find(m => m.id === id);
    const ehCampoGrande = mun?.nome?.toLowerCase().includes("campo grande");
    // limpa região se não for Campo Grande
    setForm(f => ({
      ...f,
      municipio_id: id,
      municipio_nome: mun?.nome || "",
      regiao_cg_id: ehCampoGrande ? f.regiao_cg_id : "",
      regiao_cg_nome: ehCampoGrande ? f.regiao_cg_nome : "",
    }));
  };

  const handleRegiao = (e) => {
    const id = e.target.value;
    const reg = regioesCG.find(r => r.id === id);
    setForm(f => ({ ...f, regiao_cg_id: id, regiao_cg_nome: reg?.nome || "" }));
  };

  const isCampoGrande = municipios.find(m => m.id === form.municipio_id)?.nome?.toLowerCase().includes("campo grande");

  const validar = () => {
    const novos = {};
    if (!form.nome.trim()) novos.nome = "Nome obrigatório";
    if (!form.cpf.trim()) novos.cpf = "CPF obrigatório";
    else if (!validarCPF(form.cpf)) novos.cpf = "CPF inválido";
    if (!form.municipio_id) novos.municipio_id = "Município obrigatório";
    setErros(novos);
    return Object.keys(novos).length === 0;
  };

  const handleSalvar = async () => {
    if (!validar()) return;
    setSalvando(true);
    if (agente?.id) {
      await base44.entities.AgenteCampo.update(agente.id, form);
    } else {
      await base44.entities.AgenteCampo.create(form);
    }
    setSalvando(false);
    onSalvo();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sky-700">
            <Smartphone size={18} />
            {agente?.id ? "Editar Agente de Campo" : "Novo Agente de Campo"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Nome */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Nome completo *</label>
            <Input
              value={form.nome}
              onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
              placeholder="Nome do agente"
              className={erros.nome ? "border-red-400 focus-visible:ring-red-400" : ""}
            />
            {erros.nome && <p className="text-xs text-red-500 mt-1">{erros.nome}</p>}
          </div>

          {/* CPF */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">CPF *</label>
            <Input
              value={form.cpf}
              onChange={handleCPF}
              placeholder="000.000.000-00"
              className={erros.cpf ? "border-red-400 focus-visible:ring-red-400" : ""}
            />
            {erros.cpf && <p className="text-xs text-red-500 mt-1">{erros.cpf}</p>}
          </div>

          {/* Município */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Município atendido *</label>
            <select
              value={form.municipio_id}
              onChange={handleMunicipio}
              className={`w-full border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 ${erros.municipio_id ? "border-red-400" : "border-slate-200"}`}
            >
              <option value="">Selecione o município</option>
              {municipios.map(m => (
                <option key={m.id} value={m.id}>{m.nome} — {m.uf}</option>
              ))}
            </select>
            {erros.municipio_id && <p className="text-xs text-red-500 mt-1">{erros.municipio_id}</p>}
          </div>

          {/* Região CG — só exibe se o município for Campo Grande */}
          {isCampoGrande && (
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Região de Campo Grande atendida</label>
              <select
                value={form.regiao_cg_id}
                onChange={handleRegiao}
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="">Selecione a região</option>
                {regioesCG.map(r => (
                  <option key={r.id} value={r.id}>{r.nome}</option>
                ))}
              </select>
            </div>
          )}

          {/* Ativo */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-slate-600">Status</label>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, ativo: !f.ativo }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.ativo ? "bg-sky-600" : "bg-slate-300"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.ativo ? "translate-x-6" : "translate-x-1"}`} />
            </button>
            <span className={`text-xs font-medium ${form.ativo ? "text-sky-600" : "text-slate-400"}`}>
              {form.ativo ? "Ativo" : "Inativo"}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={salvando}>Cancelar</Button>
          <Button onClick={handleSalvar} disabled={salvando} className="bg-sky-600 hover:bg-sky-700">
            {salvando ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ConfigAgentesCampo() {
  const [agentes, setAgentes] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [regioesCG, setRegioesCG] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);

  const carregar = async () => {
    setLoading(true);
    const [a, m, r] = await Promise.all([
      base44.entities.AgenteCampo.list("-created_date"),
      base44.entities.Municipio.filter({ status: "Ativo" }, "nome"),
      base44.entities.RegiaoCG.filter({ ativo: true }, "nome"),
    ]);
    setAgentes(a);
    setMunicipios(m);
    setRegioesCG(r);
    setLoading(false);
  };

  useEffect(() => { carregar(); }, []);

  const handleToggleAtivo = async (agente) => {
    await base44.entities.AgenteCampo.update(agente.id, { ativo: !agente.ativo });
    carregar();
  };

  const abrirNovo = () => { setEditando(null); setModalOpen(true); };
  const abrirEdicao = (a) => { setEditando(a); setModalOpen(true); };

  const filtrados = agentes.filter(a =>
    !busca ||
    a.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    a.cpf?.includes(busca) ||
    a.municipio_nome?.toLowerCase().includes(busca.toLowerCase())
  );

  const ativos = agentes.filter(a => a.ativo).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Smartphone size={22} className="text-sky-600" />
            Agentes de Campo
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Cadastro de agentes que trabalham com Tablets/Mobile externamente</p>
        </div>
        <Button onClick={abrirNovo} className="bg-sky-600 hover:bg-sky-700 gap-1.5">
          <Plus size={16} /> Novo Agente
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs text-slate-500">Total de Agentes</p>
          <p className="text-2xl font-bold text-slate-800">{agentes.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs text-slate-500">Ativos</p>
          <p className="text-2xl font-bold text-sky-600">{ativos}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs text-slate-500">Inativos</p>
          <p className="text-2xl font-bold text-slate-400">{agentes.length - ativos}</p>
        </div>
      </div>

      {/* Busca */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Buscar por nome, CPF ou município..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Nome</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">CPF</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Município</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Região CG</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">Carregando...</td></tr>
              ) : filtrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <Smartphone size={36} className="mx-auto mb-2 opacity-20" />
                    <p>{busca ? `Nenhum resultado para "${busca}"` : "Nenhum agente cadastrado"}</p>
                  </td>
                </tr>
              ) : filtrados.map((a, i) => (
                <tr key={a.id} className={`border-b border-slate-100 hover:bg-sky-50/40 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}>
                  <td className="px-4 py-3 font-medium text-slate-800">{a.nome}</td>
                  <td className="px-4 py-3 font-mono text-slate-600 text-xs">{a.cpf}</td>
                  <td className="px-4 py-3 text-slate-600">{a.municipio_nome || <span className="text-slate-300">—</span>}</td>
                  <td className="px-4 py-3 text-slate-600">{a.regiao_cg_nome || <span className="text-slate-300">—</span>}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggleAtivo(a)}
                      title={a.ativo ? "Clique para inativar" : "Clique para ativar"}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                        a.ativo
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {a.ativo ? <UserCheck size={12} /> : <UserX size={12} />}
                      {a.ativo ? "Ativo" : "Inativo"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => abrirEdicao(a)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AgentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        agente={editando}
        municipios={municipios}
        regioesCG={regioesCG}
        onSalvo={() => { setModalOpen(false); carregar(); }}
      />
    </div>
  );
}