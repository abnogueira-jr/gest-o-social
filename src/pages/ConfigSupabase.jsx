import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Database, RefreshCw, CheckCircle, XCircle, AlertCircle, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

function StatusBadge({ status }) {
  const map = {
    ACTIVE_HEALTHY: { label: "Ativo e Saudável", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
    ACTIVE_UNHEALTHY: { label: "Ativo com Problemas", color: "bg-yellow-100 text-yellow-700", icon: AlertCircle },
    INACTIVE: { label: "Inativo", color: "bg-slate-100 text-slate-500", icon: XCircle },
    COMING_UP: { label: "Iniciando...", color: "bg-blue-100 text-blue-600", icon: RefreshCw },
    GOING_DOWN: { label: "Desligando...", color: "bg-orange-100 text-orange-600", icon: AlertCircle },
    PAUSED: { label: "Pausado", color: "bg-slate-100 text-slate-500", icon: XCircle },
  };
  const cfg = map[status] || { label: status || "Desconhecido", color: "bg-slate-100 text-slate-500", icon: AlertCircle };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
      <Icon size={12} />
      {cfg.label}
    </span>
  );
}

function InfoRow({ label, value, copyable }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-500 w-36 flex-shrink-0">{label}</span>
      <span className="text-xs text-slate-800 font-mono flex-1 truncate mr-2">{value || "—"}</span>
      {copyable && value && (
        <button onClick={handleCopy} className="text-slate-400 hover:text-sky-600 transition-colors flex-shrink-0">
          <Copy size={13} />
        </button>
      )}
    </div>
  );
}

export default function ConfigSupabase() {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const buscar = async () => {
    setLoading(true);
    setErro(null);
    try {
      const res = await base44.functions.invoke("supabaseStatus", {});
      if (res.data?.error) throw new Error(res.data.error);
      setDados(res.data);
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { buscar(); }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Database size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-800">Configuração Supabase</h1>
            <p className="text-xs text-slate-500">Status e configuração dos projetos conectados</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={buscar}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "Verificando..." : "Atualizar"}
        </Button>
      </div>

      {/* Token info */}
      <div className="bg-sky-50 border border-sky-200 rounded-lg px-4 py-3 flex items-start gap-3">
        <AlertCircle size={15} className="text-sky-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-sky-700">
          <p className="font-medium mb-0.5">Personal Access Token configurado</p>
          <p>Para alterar o token, acesse <strong>Dashboard → Settings → Environment Variables</strong> e atualize a variável <code className="bg-sky-100 px-1 rounded">SUPABASE_ACCESS_TOKEN</code>.</p>
          <a href="https://app.supabase.com/account/tokens" target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1 mt-1 text-sky-600 hover:text-sky-800 font-medium">
            Gerenciar tokens no Supabase <ExternalLink size={11} />
          </a>
        </div>
      </div>

      {/* Erro */}
      {erro && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-3">
          <XCircle size={16} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{erro}</p>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !dados && (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 animate-pulse">
              <div className="h-4 w-48 bg-slate-200 rounded mb-3" />
              <div className="h-3 w-32 bg-slate-100 rounded mb-4" />
              <div className="space-y-2">
                {[1, 2, 3].map(j => <div key={j} className="h-3 w-full bg-slate-100 rounded" />)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Projetos */}
      {dados && !loading && (
        <>
          <p className="text-xs text-slate-500">{dados.total} projeto(s) encontrado(s)</p>
          <div className="space-y-4">
            {dados.projetos.map((p) => (
              <div key={p.ref} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                {/* Cabeçalho do projeto */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <div>
                    <p className="font-semibold text-slate-800">{p.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Ref: <span className="font-mono">{p.ref}</span></p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>

                <div className="px-5 py-3 grid grid-cols-1 md:grid-cols-2 gap-x-8">
                  {/* Coluna 1 */}
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Informações Gerais</p>
                    <InfoRow label="Região" value={p.region} />
                    <InfoRow label="Criado em" value={p.created_at ? new Date(p.created_at).toLocaleDateString("pt-BR") : null} />
                    <InfoRow label="Org. ID" value={p.organization_id} copyable />
                  </div>
                  {/* Coluna 2 */}
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Banco de Dados</p>
                    <InfoRow label="Host" value={p.database.host} copyable />
                    <InfoRow label="Porta" value={String(p.database.port)} />
                    <InfoRow label="Versão PG" value={p.database.version} />
                  </div>
                </div>

                {/* Anon Key */}
                {p.anon_key && (
                  <div className="px-5 pb-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Chave Pública (anon)</p>
                    <InfoRow label="anon key" value={p.anon_key} copyable />
                  </div>
                )}

                {/* Link externo */}
                <div className="px-5 pb-4">
                  <a
                    href={`https://app.supabase.com/project/${p.ref}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-sky-600 hover:text-sky-800 font-medium"
                  >
                    Abrir no Supabase <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}