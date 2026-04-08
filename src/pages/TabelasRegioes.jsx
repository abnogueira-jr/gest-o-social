import { useState, useEffect } from "react";
import { db } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Search, Globe } from "lucide-react";
import { toast } from "sonner";

const EMPTY_FORM = { nome: "", descricao: "", uf: "", ativo: true };

export default function TabelasRegioes() {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editandoId, setEditandoId] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const carregar = async () => {
    setLoading(true);
    const data = await db.Regiao.list("nome", 200);
    setItens(data);
    setLoading(false);
  };

  useEffect(() => { carregar(); }, []);

  const filtrados = itens.filter(i =>
    i.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    i.descricao?.toLowerCase().includes(busca.toLowerCase()) ||
    i.uf?.toLowerCase().includes(busca.toLowerCase())
  );

  const abrirNovo = () => { setForm(EMPTY_FORM); setEditandoId(null); setModalAberto(true); };
  const abrirEditar = (item) => {
    setForm({ nome: item.nome || "", descricao: item.descricao || "", uf: item.uf || "", ativo: item.ativo !== false });
    setEditandoId(item.id);
    setModalAberto(true);
  };

  const salvar = async () => {
    if (!form.nome.trim()) { toast.error("Nome é obrigatório."); return; }
    setSalvando(true);
    if (editandoId) {
      await db.Regiao.update(editandoId, form);
      toast.success("Região atualizada.");
    } else {
      await db.Regiao.create(form);
      toast.success("Região cadastrada.");
    }
    setSalvando(false);
    setModalAberto(false);
    carregar();
  };

  const excluir = async (id) => {
    await db.Regiao.delete(id);
    toast.success("Região excluída.");
    setConfirmDelete(null);
    carregar();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Globe size={20} className="text-sky-600" />
          <div>
            <h1 className="text-lg font-semibold text-slate-800">Regiões</h1>
            <p className="text-xs text-slate-400">{itens.length} região(ões) cadastrada(s)</p>
          </div>
        </div>
        <Button className="bg-sky-600 hover:bg-sky-700 gap-1.5" onClick={abrirNovo}>
          <Plus size={15} /> Nova Região
        </Button>
      </div>

      <div className="relative w-full sm:max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input placeholder="Buscar..." className="pl-9" value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16 text-slate-400 text-sm">Carregando...</div>
        ) : filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <p className="text-sm">Nenhuma região encontrada.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Nome</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500">UF</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500">Descrição</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-slate-500">Situação</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((item) => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-800">{item.nome}</td>
                  <td className="px-3 py-3">
                    {item.uf && <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded font-mono">{item.uf}</span>}
                  </td>
                  <td className="px-3 py-3 text-slate-500 text-xs max-w-xs truncate">{item.descricao || "—"}</td>
                  <td className="px-3 py-3 text-center">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium ${item.ativo !== false ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {item.ativo !== false ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-sky-600" onClick={() => abrirEditar(item)}>
                        <Pencil size={13} />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-red-500" onClick={() => setConfirmDelete(item)}>
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editandoId ? "Editar Região" : "Nova Região"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Nome *</Label>
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Centro-Oeste" />
            </div>
            <div className="space-y-1.5">
              <Label>UF (Estado)</Label>
              <Input value={form.uf} onChange={(e) => setForm({ ...form, uf: e.target.value.toUpperCase().slice(0, 2) })} placeholder="Ex: MS" maxLength={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Descrição opcional" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="ativo" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} className="w-4 h-4 rounded border-slate-300" />
              <Label htmlFor="ativo" className="cursor-pointer">Ativo</Label>
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

      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Confirmar Exclusão</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600 py-2">
            Deseja excluir a região <strong>{confirmDelete?.nome}</strong>? Esta ação não pode ser desfeita.
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