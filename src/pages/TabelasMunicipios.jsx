import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Search, MapPin } from "lucide-react";
import { toast } from "sonner";

const EMPTY_FORM = { nome: "", uf: "MS", codigo_ibge: "", regiao: "", status: "Ativo" };

const REGIOES = ["Norte", "Sul", "Leste", "Oeste", "Centro", "Nordeste", "Sudeste", "Centro-Oeste"];

export default function TabelasMunicipios() {
  const [municipios, setMunicipios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editandoId, setEditandoId] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const carregar = async () => {
    setLoading(true);
    const data = await base44.entities.Municipio.list("-nome", 500);
    setMunicipios(data);
    setLoading(false);
  };

  useEffect(() => { carregar(); }, []);

  const filtrados = municipios.filter(m =>
    m.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    m.codigo_ibge?.includes(busca) ||
    m.regiao?.toLowerCase().includes(busca.toLowerCase())
  );

  const abrirNovo = () => {
    setForm(EMPTY_FORM);
    setEditandoId(null);
    setModalAberto(true);
  };

  const abrirEditar = (m) => {
    setForm({ nome: m.nome || "", uf: m.uf || "MS", codigo_ibge: m.codigo_ibge || "", regiao: m.regiao || "", status: m.status || "Ativo" });
    setEditandoId(m.id);
    setModalAberto(true);
  };

  const salvar = async () => {
    if (!form.nome.trim() || !form.uf.trim()) {
      toast.error("Nome e UF são obrigatórios.");
      return;
    }
    setSalvando(true);
    if (editandoId) {
      await base44.entities.Municipio.update(editandoId, form);
      toast.success("Município atualizado.");
    } else {
      await base44.entities.Municipio.create(form);
      toast.success("Município cadastrado.");
    }
    setSalvando(false);
    setModalAberto(false);
    carregar();
  };

  const excluir = async (id) => {
    await base44.entities.Municipio.delete(id);
    toast.success("Município excluído.");
    setConfirmDelete(null);
    carregar();
  };

  return (
    <div className="space-y-5">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MapPin size={20} className="text-sky-600" />
          <div>
            <h1 className="text-lg font-semibold text-slate-800">Municípios</h1>
            <p className="text-xs text-slate-400">{municipios.length} município(s) cadastrado(s)</p>
          </div>
        </div>
        <Button className="bg-sky-600 hover:bg-sky-700 gap-1.5" onClick={abrirNovo}>
          <Plus size={15} /> Novo Município
        </Button>
      </div>

      {/* Busca */}
      <div className="relative w-full sm:max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Buscar por nome, código IBGE ou região..."
          className="pl-9"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16 text-slate-400 text-sm">Carregando...</div>
        ) : filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <MapPin size={32} className="opacity-30 mb-2" />
            <p className="text-sm">Nenhum município encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Nome</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500">UF</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500">Cód. IBGE</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500">Região</th>
                  <th className="text-center px-3 py-3 text-xs font-semibold text-slate-500">Status</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((m) => (
                  <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-800">{m.nome}</td>
                    <td className="px-3 py-3 text-slate-500">{m.uf}</td>
                    <td className="px-3 py-3 text-slate-500">{m.codigo_ibge || "—"}</td>
                    <td className="px-3 py-3 text-slate-500">{m.regiao || "—"}</td>
                    <td className="px-3 py-3 text-center">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium ${
                        m.status === "Ativo" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}>
                        {m.status || "Ativo"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-sky-600" onClick={() => abrirEditar(m)}>
                          <Pencil size={13} />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-red-500" onClick={() => setConfirmDelete(m)}>
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Criar/Editar */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editandoId ? "Editar Município" : "Novo Município"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label>Nome *</Label>
                <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Campo Grande" />
              </div>
              <div className="space-y-1.5">
                <Label>UF *</Label>
                <Input value={form.uf} onChange={(e) => setForm({ ...form, uf: e.target.value.toUpperCase().slice(0, 2) })} placeholder="MS" maxLength={2} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Código IBGE</Label>
                <Input value={form.codigo_ibge} onChange={(e) => setForm({ ...form, codigo_ibge: e.target.value })} placeholder="Ex: 5002704" />
              </div>
              <div className="space-y-1.5">
                <Label>Região</Label>
                <Select value={form.regiao} onValueChange={(v) => setForm({ ...form, regiao: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {REGIOES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAberto(false)}>Cancelar</Button>
            <Button className="bg-sky-600 hover:bg-sky-700" onClick={salvar} disabled={salvando}>
              {salvando ? "Salvando..." : editandoId ? "Salvar Alterações" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Confirmação de Exclusão */}
      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600 py-2">
            Deseja excluir o município <strong>{confirmDelete?.nome}</strong>? Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => excluir(confirmDelete.id)}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}