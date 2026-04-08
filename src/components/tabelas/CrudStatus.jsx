import { useState, useEffect } from "react";
import { db } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

const EMPTY_FORM = { nome: "", descricao: "", cor: "#0ea5e9", ativo: true };

const CORES_SUGERIDAS = [
  "#10b981", "#0ea5e9", "#6366f1", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#64748b"
];

export default function CrudStatus({ titulo, entityName, icone: Icone }) {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editandoId, setEditandoId] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const entity = db[entityName];

  const carregar = async () => {
    setLoading(true);
    const data = await entity.list("nome", 200);
    setItens(data);
    setLoading(false);
  };

  useEffect(() => { carregar(); }, [entityName]);

  const filtrados = itens.filter(i =>
    i.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    i.descricao?.toLowerCase().includes(busca.toLowerCase())
  );

  const abrirNovo = () => {
    setForm(EMPTY_FORM);
    setEditandoId(null);
    setModalAberto(true);
  };

  const abrirEditar = (item) => {
    setForm({ nome: item.nome || "", descricao: item.descricao || "", cor: item.cor || "#0ea5e9", ativo: item.ativo !== false });
    setEditandoId(item.id);
    setModalAberto(true);
  };

  const salvar = async () => {
    if (!form.nome.trim()) { toast.error("Nome é obrigatório."); return; }
    setSalvando(true);
    if (editandoId) {
      await entity.update(editandoId, form);
      toast.success("Status atualizado.");
    } else {
      await entity.create(form);
      toast.success("Status cadastrado.");
    }
    setSalvando(false);
    setModalAberto(false);
    carregar();
  };

  const excluir = async (id) => {
    await entity.delete(id);
    toast.success("Status excluído.");
    setConfirmDelete(null);
    carregar();
  };

  return (
    <div className="space-y-5">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {Icone && <Icone size={20} className="text-sky-600" />}
          <div>
            <h1 className="text-lg font-semibold text-slate-800">{titulo}</h1>
            <p className="text-xs text-slate-400">{itens.length} status cadastrado(s)</p>
          </div>
        </div>
        <Button className="bg-sky-600 hover:bg-sky-700 gap-1.5" onClick={abrirNovo}>
          <Plus size={15} /> Novo Status
        </Button>
      </div>

      {/* Busca */}
      <div className="relative w-full sm:max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input placeholder="Buscar..." className="pl-9" value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16 text-slate-400 text-sm">Carregando...</div>
        ) : filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <p className="text-sm">Nenhum status encontrado.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Cor</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500">Nome</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500">Descrição</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-slate-500">Situação</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((item) => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="w-5 h-5 rounded-full border border-slate-200" style={{ backgroundColor: item.cor || "#94a3b8" }} />
                  </td>
                  <td className="px-3 py-3 font-medium text-slate-800">
                    <span className="inline-flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: item.cor || "#94a3b8" }}>
                        {item.nome}
                      </span>
                    </span>
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

      {/* Modal Criar/Editar */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editandoId ? "Editar Status" : "Novo Status"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Nome *</Label>
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Ativo" />
            </div>
            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Descrição opcional" />
            </div>
            <div className="space-y-1.5">
              <Label>Cor</Label>
              <div className="flex items-center gap-3">
                <input type="color" value={form.cor} onChange={(e) => setForm({ ...form, cor: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer border border-slate-200" />
                <div className="flex flex-wrap gap-2">
                  {CORES_SUGERIDAS.map(c => (
                    <button key={c} onClick={() => setForm({ ...form, cor: c })}
                      className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                      style={{ backgroundColor: c, borderColor: form.cor === c ? "#1e293b" : "transparent" }} />
                  ))}
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: form.cor }}>
                  {form.nome || "Prévia"}
                </span>
                <span className="text-xs text-slate-400">prévia do badge</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="ativo" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300" />
              <Label htmlFor="ativo" className="cursor-pointer">Status ativo</Label>
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

      {/* Modal Confirmação Exclusão */}
      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Confirmar Exclusão</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600 py-2">
            Deseja excluir o status <strong>{confirmDelete?.nome}</strong>? Esta ação não pode ser desfeita.
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