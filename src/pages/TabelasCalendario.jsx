import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, ChevronLeft, ChevronRight, Pencil, Trash2, Loader2 } from "lucide-react";

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function fmt(val) {
  return Number(val || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const EMPTY_FORM = { data_deposito: "", valor_deposito: "", valor_utilizado: "", valor_disponivel: "" };

export default function TabelasCalendario() {
  const [hoje] = useState(new Date());
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
    const data = await base44.entities.CalendarioPagamento.list("-data_deposito", 500);
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

  const registrosPorDia = (dia) => {
    if (!dia) return [];
    const key = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    return registros.filter(r => r.data_deposito === key);
  };

  const mesAtual = `${ano}-${String(mes + 1).padStart(2, "0")}`;
  const registrosMes = registros.filter(r => r.data_deposito?.startsWith(mesAtual));
  const totalDepositado = registrosMes.reduce((s, r) => s + Number(r.valor_deposito || 0), 0);
  const totalUtilizado = registrosMes.reduce((s, r) => s + Number(r.valor_utilizado || 0), 0);
  const totalDisponivel = registrosMes.reduce((s, r) => s + Number(r.valor_disponivel || 0), 0);

  const set = (k, v) => {
    setForm(f => {
      const novo = { ...f, [k]: v };
      // auto-calcular disponível
      if (k === "valor_deposito" || k === "valor_utilizado") {
        const dep = parseFloat(k === "valor_deposito" ? v : novo.valor_deposito) || 0;
        const util = parseFloat(k === "valor_utilizado" ? v : novo.valor_utilizado) || 0;
        novo.valor_disponivel = (dep - util).toFixed(2);
      }
      return novo;
    });
  };

  const abrirNovo = (dia) => {
    const data = dia
      ? `${ano}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`
      : "";
    setForm({ ...EMPTY_FORM, data_deposito: data });
    setEditId(null);
    setModalOpen(true);
  };

  const abrirEditar = (reg) => {
    setForm({
      data_deposito: reg.data_deposito || "",
      valor_deposito: reg.valor_deposito || "",
      valor_utilizado: reg.valor_utilizado || "",
      valor_disponivel: reg.valor_disponivel || "",
    });
    setEditId(reg.id);
    setModalOpen(true);
  };

  const salvar = async () => {
    setSaving(true);
    const payload = {
      data_deposito: form.data_deposito,
      valor_deposito: parseFloat(form.valor_deposito) || 0,
      valor_utilizado: parseFloat(form.valor_utilizado) || 0,
      valor_disponivel: parseFloat(form.valor_disponivel) || 0,
    };
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
          <p className="text-sm text-slate-500 mt-0.5">Controle de depósitos e saldos por data</p>
        </div>
        <Button onClick={() => abrirNovo(null)} className="bg-sky-600 hover:bg-sky-700 gap-2">
          <Plus size={15} /> Inserir
        </Button>
      </div>

      {/* KPIs do mês */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Depositado", value: fmt(totalDepositado), color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
          { label: "Total Utilizado", value: fmt(totalUtilizado), color: "text-red-500 bg-red-50 border-red-200" },
          { label: "Total Disponível", value: fmt(totalDisponivel), color: "text-sky-600 bg-sky-50 border-sky-200" },
        ].map(k => (
          <div key={k.label} className={`border rounded-xl px-4 py-3 ${k.color}`}>
            <p className="text-xs font-medium opacity-70">{k.label} — {MESES[mes]}/{ano}</p>
            <p className="text-lg font-bold mt-0.5">{k.value}</p>
          </div>
        ))}
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
              return (
                <div
                  key={i}
                  onClick={() => dia && setDiaSelecionado(dia === diaSelecionado ? null : dia)}
                  className={`min-h-[72px] border-b border-r border-slate-100 p-1.5 cursor-pointer transition-colors
                    ${!dia ? "bg-slate-50/50" : "hover:bg-sky-50/50"}
                    ${isSel ? "bg-sky-50 ring-2 ring-inset ring-sky-400" : ""}
                  `}
                >
                  {dia && (
                    <>
                      <div className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-1
                        ${isHoje ? "bg-sky-600 text-white" : "text-slate-600"}`}>
                        {dia}
                      </div>
                      {regs.map(r => (
                        <div key={r.id} className="text-[10px] bg-emerald-100 text-emerald-700 rounded px-1 py-0.5 mb-0.5 truncate">
                          {fmt(r.valor_deposito)}
                        </div>
                      ))}
                      {regs.length === 0 && (
                        <button
                          onClick={e => { e.stopPropagation(); abrirNovo(dia); }}
                          className="text-[10px] text-slate-300 hover:text-sky-500 hidden group-hover:block"
                        >+ add</button>
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
                  <th className="text-left py-2 font-medium">Depositado</th>
                  <th className="text-right py-2 font-medium">Utilizado</th>
                  <th className="text-right py-2 font-medium">Disponível</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {regDiaSel.map(r => (
                  <tr key={r.id} className="border-b border-slate-50">
                    <td className="py-2 font-medium text-emerald-700">{fmt(r.valor_deposito)}</td>
                    <td className="py-2 text-right text-red-500">{fmt(r.valor_utilizado)}</td>
                    <td className="py-2 text-right text-sky-700 font-semibold">{fmt(r.valor_disponivel)}</td>
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editId ? "Editar Registro" : "Novo Registro de Pagamento"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Data do Depósito <span className="text-red-500">*</span></Label>
              <Input type="date" value={form.data_deposito} onChange={e => set("data_deposito", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Valor do Depósito (R$)</Label>
              <Input type="number" step="0.01" min="0" value={form.valor_deposito}
                onChange={e => set("valor_deposito", e.target.value)} placeholder="0,00" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Valor Utilizado (R$)</Label>
              <Input type="number" step="0.01" min="0" value={form.valor_utilizado}
                onChange={e => set("valor_utilizado", e.target.value)} placeholder="0,00" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Valor Disponível (R$)</Label>
              <Input type="number" step="0.01" value={form.valor_disponivel}
                onChange={e => set("valor_disponivel", e.target.value)} placeholder="Calculado automaticamente" className="bg-slate-50" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button onClick={salvar} disabled={!form.data_deposito || saving} className="bg-sky-600 hover:bg-sky-700 gap-2">
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