import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ChevronLeft, ChevronRight, Pencil, Trash2, Loader2 } from "lucide-react";

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DIAS_SEMANA = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

function fmt(val) {
  return Number(val || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const EMPTY_FORM = { data: "", operacao: "Crédito", valor: "" };

export default function TabelasCalendario() {
  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth());
  const [ano, setAno] = useState(hoje.getFullYear());
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [diaSelecionado, setDiaSelecionado] = useState(null);

  const carregar = async () => {
    setLoading(true);
    const data = await base44.entities.CalendarioPagamento.list("-data", 1000);
    setRegistros(data);
    setLoading(false);
  };

  useEffect(() => { carregar(); }, []);

  // Calendário
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const celulas = Array.from({ length: primeiroDia + diasNoMes }, (_, i) =>
    i < primeiroDia ? null : i - primeiroDia + 1
  );
  while (celulas.length % 7 !== 0) celulas.push(null);

  const chaveData = (dia) =>
    `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

  const registrosPorDia = (dia) => {
    if (!dia) return [];
    return registros.filter(r => r.data === chaveData(dia));
  };

  // KPIs do mês
  const mesAtual = `${ano}-${String(mes + 1).padStart(2, "0")}`;
  const registrosMes = registros.filter(r => r.data?.startsWith(mesAtual));
  const totalCredito = registrosMes.filter(r => r.operacao === "Crédito").reduce((s, r) => s + Number(r.valor || 0), 0);
  const totalDebito = registrosMes.filter(r => r.operacao === "Débito").reduce((s, r) => s + Number(r.valor || 0), 0);
  const totalDisponivel = totalCredito - totalDebito;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const abrirNovo = (dia) => {
    setForm({ ...EMPTY_FORM, data: dia ? chaveData(dia) : "" });
    setEditId(null);
    setModalOpen(true);
  };

  const abrirEditar = (reg) => {
    setForm({ data: reg.data || "", operacao: reg.operacao || "Crédito", valor: reg.valor || "" });
    setEditId(reg.id);
    setModalOpen(true);
  };

  const salvar = async () => {
    setSaving(true);
    const payload = { data: form.data, operacao: form.operacao, valor: parseFloat(form.valor) || 0 };
    if (editId) {
      await base44.entities.CalendarioPagamento.update(editId, payload);
    } else {
      await base44.entities.CalendarioPagamento.create(payload);
    }
    await carregar();
    setSaving(false);
    setModalOpen(false);
  };

  const excluir = async (id) => {
    if (!confirm("Confirmar exclusão?")) return;
    await base44.entities.CalendarioPagamento.delete(id);
    await carregar();
  };

  const navMes = (dir) => {
    let nm = mes + dir, na = ano;
    if (nm < 0) { nm = 11; na--; }
    if (nm > 11) { nm = 0; na++; }
    setMes(nm); setAno(na); setDiaSelecionado(null);
  };

  const regDiaSel = diaSelecionado ? registrosPorDia(diaSelecionado) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Calendário de Pagamentos</h1>
          <p className="text-sm text-slate-500 mt-0.5">Controle de créditos e débitos por data</p>
        </div>
        <Button onClick={() => abrirNovo(null)} className="bg-sky-600 hover:bg-sky-700 gap-2">
          <Plus size={15} /> Inserir
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="border border-emerald-200 bg-emerald-50 rounded-xl px-4 py-3">
          <p className="text-xs font-medium text-emerald-600 opacity-80">Total Crédito — {MESES[mes]}/{ano}</p>
          <p className="text-lg font-bold text-emerald-700 mt-0.5">{fmt(totalCredito)}</p>
        </div>
        <div className="border border-red-200 bg-red-50 rounded-xl px-4 py-3">
          <p className="text-xs font-medium text-red-500 opacity-80">Total Débito — {MESES[mes]}/{ano}</p>
          <p className="text-lg font-bold text-red-600 mt-0.5">{fmt(totalDebito)}</p>
        </div>
        <div className={`border rounded-xl px-4 py-3 ${totalDisponivel >= 0 ? "border-sky-200 bg-sky-50" : "border-orange-200 bg-orange-50"}`}>
          <p className={`text-xs font-medium opacity-80 ${totalDisponivel >= 0 ? "text-sky-600" : "text-orange-500"}`}>
            Saldo Disponível — {MESES[mes]}/{ano}
          </p>
          <p className={`text-lg font-bold mt-0.5 ${totalDisponivel >= 0 ? "text-sky-700" : "text-orange-600"}`}>
            {fmt(totalDisponivel)}
          </p>
        </div>
      </div>

      {/* Calendário */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {/* Nav mês */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <button onClick={() => navMes(-1)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600">
            <ChevronLeft size={18} />
          </button>
          <span className="font-semibold text-slate-800">{MESES[mes]} {ano}</span>
          <button onClick={() => navMes(1)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Dias da semana */}
        <div className="grid grid-cols-7 border-b border-slate-100">
          {DIAS_SEMANA.map(d => (
            <div key={d} className="text-center text-xs font-semibold text-slate-400 py-2">{d}</div>
          ))}
        </div>

        {/* Células */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
            <Loader2 size={18} className="animate-spin" /> Carregando...
          </div>
        ) : (
          <div className="grid grid-cols-7">
            {celulas.map((dia, i) => {
              const regs = registrosPorDia(dia);
              const isHoje = dia === hoje.getDate() && mes === hoje.getMonth() && ano === hoje.getFullYear();
              const isSel = dia === diaSelecionado;
              const credDia = regs.filter(r => r.operacao === "Crédito").reduce((s, r) => s + Number(r.valor || 0), 0);
              const debDia = regs.filter(r => r.operacao === "Débito").reduce((s, r) => s + Number(r.valor || 0), 0);
              return (
                <div
                  key={i}
                  onClick={() => dia && setDiaSelecionado(dia === diaSelecionado ? null : dia)}
                  className={`min-h-[76px] border-b border-r border-slate-100 p-1.5 transition-colors
                    ${!dia ? "bg-slate-50/50" : "cursor-pointer hover:bg-sky-50/40"}
                    ${isSel ? "bg-sky-50 ring-2 ring-inset ring-sky-400" : ""}
                  `}
                >
                  {dia && (
                    <>
                      <div className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-1
                        ${isHoje ? "bg-sky-600 text-white" : "text-slate-600"}`}>
                        {dia}
                      </div>
                      {credDia > 0 && (
                        <div className="text-[10px] bg-emerald-100 text-emerald-700 rounded px-1 py-0.5 mb-0.5 truncate">
                          + {fmt(credDia)}
                        </div>
                      )}
                      {debDia > 0 && (
                        <div className="text-[10px] bg-red-100 text-red-600 rounded px-1 py-0.5 truncate">
                          - {fmt(debDia)}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detalhes do dia selecionado */}
      {diaSelecionado && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-800">
              {String(diaSelecionado).padStart(2, "0")}/{String(mes + 1).padStart(2, "0")}/{ano}
            </h2>
            <Button size="sm" onClick={() => abrirNovo(diaSelecionado)} className="bg-sky-600 hover:bg-sky-700 gap-1 h-7 text-xs">
              <Plus size={12} /> Inserir neste dia
            </Button>
          </div>

          {regDiaSel.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Nenhum registro para este dia.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-500">
                  <th className="text-left py-2 font-medium">Operação</th>
                  <th className="text-right py-2 font-medium">Valor</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {regDiaSel.map(r => (
                  <tr key={r.id} className="border-b border-slate-50">
                    <td className="py-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        r.operacao === "Crédito"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-600"
                      }`}>{r.operacao}</span>
                    </td>
                    <td className={`py-2 text-right font-semibold ${r.operacao === "Crédito" ? "text-emerald-700" : "text-red-600"}`}>
                      {r.operacao === "Crédito" ? "+" : "-"} {fmt(r.valor)}
                    </td>
                    <td className="py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => abrirEditar(r)} className="p-1 text-slate-400 hover:text-sky-600 rounded">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => excluir(r.id)} className="p-1 text-slate-400 hover:text-red-500 rounded">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editId ? "Editar Lançamento" : "Novo Lançamento"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Data <span className="text-red-500">*</span></Label>
              <Input type="date" value={form.data} onChange={e => set("data", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Operação</Label>
              <Select value={form.operacao} onValueChange={v => set("operacao", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Crédito">Crédito</SelectItem>
                  <SelectItem value="Débito">Débito</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Valor (R$)</Label>
              <Input type="number" step="0.01" min="0" value={form.valor}
                onChange={e => set("valor", e.target.value)} placeholder="0,00" />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button onClick={salvar} disabled={!form.data || !form.valor || saving} className="bg-sky-600 hover:bg-sky-700 gap-2">
                {saving && <Loader2 size={13} className="animate-spin" />}
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}