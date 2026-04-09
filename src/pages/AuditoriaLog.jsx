import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, Search, Filter, X, RefreshCw, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const ACOES = ["Criação", "Edição", "Exclusão", "Visualização", "Login", "Exportação", "Alteração de Status"];
const MODULOS = ["Famílias", "Visitas", "Programas Sociais", "Benefícios", "Cartões", "PIX", "Contemplações", "Relatórios", "Configurações", "Sistema"];

const ACAO_COR = {
  "Criação": "bg-emerald-100 text-emerald-700",
  "Edição": "bg-blue-100 text-blue-700",
  "Exclusão": "bg-red-100 text-red-700",
  "Visualização": "bg-slate-100 text-slate-600",
  "Login": "bg-purple-100 text-purple-700",
  "Exportação": "bg-orange-100 text-orange-700",
  "Alteração de Status": "bg-yellow-100 text-yellow-700",
};

function DetalheRow({ log }) {
  const [open, setOpen] = useState(false);
  const temDetalhes = log.dados_anteriores || log.dados_novos || log.detalhes;

  return (
    <>
      <tr className="hover:bg-slate-50 cursor-pointer" onClick={() => temDetalhes && setOpen(o => !o)}>
        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">
          {log.data_hora ? format(new Date(log.data_hora), "dd/MM/yyyy HH:mm:ss", { locale: ptBR }) : "—"}
        </td>
        <td className="px-4 py-3">
          <div className="text-sm font-medium text-slate-800">{log.usuario_nome || log.usuario_email || "—"}</div>
          <div className="text-xs text-slate-400">{log.usuario_email}</div>
        </td>
        <td className="px-4 py-3">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ACAO_COR[log.acao] || "bg-slate-100 text-slate-600"}`}>
            {log.acao}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-slate-600">{log.modulo}</td>
        <td className="px-4 py-3">
          <div className="text-sm text-slate-700">{log.entidade_descricao || log.entidade || "—"}</div>
          {log.entidade_id && <div className="text-xs text-slate-400 font-mono">ID: {log.entidade_id.substring(0, 12)}…</div>}
        </td>
        <td className="px-4 py-3 text-sm text-slate-500 max-w-[200px] truncate">{log.detalhes || "—"}</td>
        <td className="px-4 py-3 text-center">
          {temDetalhes && (
            <button className="text-slate-400 hover:text-slate-600">
              {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          )}
        </td>
      </tr>
      {open && temDetalhes && (
        <tr className="bg-slate-50">
          <td colSpan={7} className="px-6 py-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {log.dados_anteriores && (
                <div>
                  <p className="font-semibold text-slate-600 mb-1">Dados Anteriores:</p>
                  <pre className="bg-white border border-slate-200 rounded-lg p-2 overflow-auto max-h-32 text-slate-500 whitespace-pre-wrap">
                    {(() => { try { return JSON.stringify(JSON.parse(log.dados_anteriores), null, 2); } catch { return log.dados_anteriores; } })()}
                  </pre>
                </div>
              )}
              {log.dados_novos && (
                <div>
                  <p className="font-semibold text-slate-600 mb-1">Dados Novos:</p>
                  <pre className="bg-white border border-slate-200 rounded-lg p-2 overflow-auto max-h-32 text-slate-500 whitespace-pre-wrap">
                    {(() => { try { return JSON.stringify(JSON.parse(log.dados_novos), null, 2); } catch { return log.dados_novos; } })()}
                  </pre>
                </div>
              )}
              {!log.dados_anteriores && !log.dados_novos && log.detalhes && (
                <div className="md:col-span-2">
                  <p className="font-semibold text-slate-600 mb-1">Detalhes:</p>
                  <p className="text-slate-500">{log.detalhes}</p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AuditoriaLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({ busca: "", acao: "", modulo: "", dataInicio: "", dataFim: "", usuario: "" });

  const carregar = async () => {
    setLoading(true);
    const data = await base44.entities.AuditoriaLog.list("-data_hora", 500);
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => { carregar(); }, []);

  const setFiltro = (k, v) => setFiltros(p => ({ ...p, [k]: v }));
  const limpar = () => setFiltros({ busca: "", acao: "", modulo: "", dataInicio: "", dataFim: "", usuario: "" });
  const temFiltro = Object.values(filtros).some(v => v !== "");

  const filtrados = useMemo(() => {
    return logs.filter(l => {
      if (filtros.acao && l.acao !== filtros.acao) return false;
      if (filtros.modulo && l.modulo !== filtros.modulo) return false;
      if (filtros.usuario && !(l.usuario_email || "").toLowerCase().includes(filtros.usuario.toLowerCase()) &&
          !(l.usuario_nome || "").toLowerCase().includes(filtros.usuario.toLowerCase())) return false;
      if (filtros.busca) {
        const b = filtros.busca.toLowerCase();
        if (!(l.entidade_descricao || "").toLowerCase().includes(b) &&
            !(l.detalhes || "").toLowerCase().includes(b) &&
            !(l.entidade || "").toLowerCase().includes(b)) return false;
      }
      if (filtros.dataInicio && l.data_hora && new Date(l.data_hora) < new Date(filtros.dataInicio)) return false;
      if (filtros.dataFim && l.data_hora) {
        const fim = new Date(filtros.dataFim); fim.setHours(23, 59, 59);
        if (new Date(l.data_hora) > fim) return false;
      }
      return true;
    });
  }, [logs, filtros]);

  // KPIs por ação
  const kpis = useMemo(() => ACOES.map(a => ({ label: a, count: filtrados.filter(l => l.acao === a).length }))
    .filter(k => k.count > 0), [filtrados]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Shield size={20} className="text-sky-600" />
            Histórico de Auditoria
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">{filtrados.length} registro(s) encontrado(s)</p>
        </div>
        <Button variant="outline" onClick={carregar} disabled={loading} className="gap-1.5">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Atualizar
        </Button>
      </div>

      {/* KPIs resumo */}
      {kpis.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {kpis.map(k => (
            <button key={k.label}
              onClick={() => setFiltro("acao", filtros.acao === k.label ? "" : k.label)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                ${filtros.acao === k.label ? "border-sky-400 bg-sky-50 text-sky-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}
                ${ACAO_COR[k.label] ? "" : ""}`}>
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${ACAO_COR[k.label] || "bg-slate-100"}`}>{k.count}</span>
              {k.label}
            </button>
          ))}
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5"><Filter size={13} /> Filtros</p>
          {temFiltro && (
            <Button variant="ghost" size="sm" onClick={limpar} className="text-slate-400 gap-1 h-7"><X size={12} /> Limpar</Button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <label className="text-xs text-slate-500 block mb-1">Data Início</label>
            <Input type="date" value={filtros.dataInicio} onChange={e => setFiltro("dataInicio", e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Data Fim</label>
            <Input type="date" value={filtros.dataFim} onChange={e => setFiltro("dataFim", e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Ação</label>
            <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background h-9"
              value={filtros.acao} onChange={e => setFiltro("acao", e.target.value)}>
              <option value="">Todas</option>
              {ACOES.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Módulo</label>
            <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background h-9"
              value={filtros.modulo} onChange={e => setFiltro("modulo", e.target.value)}>
              <option value="">Todos</option>
              {MODULOS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Usuário</label>
            <Input placeholder="Nome ou email" value={filtros.usuario} onChange={e => setFiltro("usuario", e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Busca</label>
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input className="pl-8" placeholder="Registro, detalhe..." value={filtros.busca} onChange={e => setFiltro("busca", e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Data/Hora</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Usuário</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Ação</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Módulo</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Registro</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Detalhes</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-12 text-slate-400"><Loader2 size={20} className="animate-spin inline" /></td></tr>
            ) : filtrados.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-slate-400">
                <Shield size={32} className="mx-auto mb-2 opacity-30" />
                <p>Nenhum log de auditoria encontrado</p>
                <p className="text-xs mt-1 opacity-60">Os logs serão registrados conforme os usuários realizam ações no sistema</p>
              </td></tr>
            ) : filtrados.map(log => (
              <DetalheRow key={log.id} log={log} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Instrução para devs */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
        <p className="font-semibold mb-1">Como registrar ações de auditoria nas páginas:</p>
        <code className="block bg-amber-100 rounded p-2 mt-1 text-amber-700 whitespace-pre">{`import { registrarAuditoria } from "@/utils/auditoria";

// Exemplo ao salvar uma família:
await registrarAuditoria({
  acao: "Criação",           // ou "Edição", "Exclusão", "Alteração de Status"...
  modulo: "Famílias",
  entidade: "Familia",
  entidade_id: familia.id,
  entidade_descricao: familia.nome_responsavel,
  detalhes: "Cadastro de nova família",
  dados_novos: familia,      // opcional: objeto com os dados salvos
});`}</code>
      </div>
    </div>
  );
}