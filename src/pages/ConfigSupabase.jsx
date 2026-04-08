import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2, XCircle, AlertTriangle, Database,
  RefreshCw, Copy, ExternalLink, Loader2, ChevronDown, ChevronUp
} from "lucide-react";

const PROJECT_REF = "avqtuoewuodpydpdqvps";
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`;
const SQL_EDITOR_URL = `https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`;

const ALL_TABLES = [
  { key: 'familias',           label: 'Famílias' },
  { key: 'visitas_campo',      label: 'Visitas de Campo' },
  { key: 'programas_sociais',  label: 'Programas Sociais' },
  { key: 'contemplacoes',      label: 'Contemplações' },
  { key: 'pagamentos',         label: 'Pagamentos' },
  { key: 'cartoes',            label: 'Cartões' },
  { key: 'lotes_pix',          label: 'Lotes PIX' },
  { key: 'municipios',         label: 'Municípios' },
  { key: 'regioes',            label: 'Regiões' },
  { key: 'regioes_cg',         label: 'Regiões de Campo Grande' },
  { key: 'agentes_campo',      label: 'Agentes de Campo' },
  { key: 'status_familia',     label: 'Status de Família' },
  { key: 'status_visita',      label: 'Status de Visita' },
  { key: 'status_programa',    label: 'Status de Programa' },
  { key: 'status_pagamento',   label: 'Status de Pagamento' },
  { key: 'status_cartao',      label: 'Status de Cartão' },
  { key: 'historico_familia',  label: 'Histórico de Família' },
  { key: 'atividades_recentes',label: 'Atividades Recentes' },
];

const FULL_SQL = `-- =============================================
-- SCRIPT DE MIGRAÇÃO — GESTÃO SOCIAL ESTADUAL
-- Execute no SQL Editor do Supabase
-- =============================================

CREATE TABLE IF NOT EXISTS municipios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  nome text NOT NULL, uf text NOT NULL, codigo_ibge text, regiao text, status text DEFAULT 'Ativo'
);

CREATE TABLE IF NOT EXISTS regioes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  nome text NOT NULL, descricao text, uf text, ativo boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS regioes_cg (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  nome text NOT NULL, descricao text, bairros text, ativo boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS agentes_campo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  nome text NOT NULL, cpf text NOT NULL, municipio_id text, municipio_nome text,
  regiao_cg_id text, regiao_cg_nome text, ativo boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS status_familia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  nome text NOT NULL, descricao text, cor text, ativo boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS status_visita (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  nome text NOT NULL, descricao text, cor text, ativo boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS status_programa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  nome text NOT NULL, descricao text, cor text, ativo boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS status_pagamento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  nome text NOT NULL, descricao text, cor text, ativo boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS status_cartao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  nome text NOT NULL, descricao text, cor text, ativo boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS familias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(), created_by text,
  numero_nis text, cadastro_unico text, nome_responsavel text NOT NULL, cpf_responsavel text NOT NULL,
  rg_numero text, data_nascimento date, genero text, estado_civil text,
  nacionalidade text DEFAULT 'Brasileira', escolaridade text, ultima_serie text,
  recadastro boolean DEFAULT false, telefone text, email text, situacao_ocupacao text,
  participa_qualifica_ms boolean DEFAULT false, possui_doenca boolean DEFAULT false,
  possui_deficiencia boolean DEFAULT false, possui_beneficio boolean DEFAULT false,
  renda_mensal numeric, renda_per_capita numeric, renda_familiar numeric,
  beneficios_lista jsonb, patrimonios jsonb, endereco text, cep text, bairro text,
  regiao text, estado text DEFAULT 'Mato Grosso do Sul', municipio text,
  situacao_moradia text, tipo_moradia text, tempo_residencia_ms text,
  latitude numeric, longitude numeric, membros_familiares jsonb,
  documentos_obrigatorios jsonb, documentos_especificos jsonb,
  num_membros numeric, tipo_familia text, situacao_cadastral text, faixa_pobreza text,
  status_beneficio text, data_cadastro date, observacoes text,
  criterios_marcados jsonb, faixa_renda_avaliacao text, familia_unipessoal boolean,
  pontuacao_vulnerabilidade numeric, classificacao_vulnerabilidade text,
  prioridade_visita_sugerida text, observacoes_avaliacao text, data_avaliacao timestamptz
);

CREATE TABLE IF NOT EXISTS visitas_campo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(), created_by text,
  familia_id text, familia_nome text NOT NULL, tecnico_responsavel text,
  data_agendamento date NOT NULL, data_visita date, status text, tipo_visita text,
  prioridade_visita text DEFAULT 'Normal', pontuacao_vulnerabilidade numeric,
  endereco text, bairro text, municipio text, regiao text,
  latitude numeric, longitude numeric, observacoes text, resultado text,
  validacao_familia boolean DEFAULT false, fotos jsonb,
  status_familia_atualizado boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS programas_sociais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  nome text NOT NULL, descricao text, tipo text, valor_beneficio numeric,
  limite_orcamentario numeric, status text, data_inicio date, data_fim date,
  total_vagas numeric, vagas_ocupadas numeric
);

CREATE TABLE IF NOT EXISTS contemplacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(), created_by text,
  familia_id text, familia_nome text NOT NULL, programa_id text, programa_nome text NOT NULL,
  data_contemplacao date, valor numeric, status text DEFAULT 'Rascunho',
  mes_referencia text, observacoes text, parecer_tecnico text, tecnico_responsavel text,
  data_parecer timestamptz, decisao_gestor text, gestor_responsavel text,
  data_decisao timestamptz, motivo_reprovacao text
);

CREATE TABLE IF NOT EXISTS pagamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  familia_id text, familia_nome text NOT NULL, programa_nome text,
  tipo_pagamento text, valor numeric NOT NULL, mes_referencia text,
  data_pagamento date, status text, numero_cartao text, chave_pix text, observacoes text
);

CREATE TABLE IF NOT EXISTS cartoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  familia_id text, familia_nome text NOT NULL, numero_cartao text, status text,
  data_emissao date, data_entrega date, data_vencimento date,
  saldo numeric, tipo text, motivo_bloqueio text, observacoes text
);

CREATE TABLE IF NOT EXISTS lotes_pix (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  numero_lote text NOT NULL, data_geracao date, data_envio date, status text,
  total_registros numeric, valor_total numeric, arquivo_retorno text, observacoes text
);

CREATE TABLE IF NOT EXISTS historico_familia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  familia_id text NOT NULL, familia_nome text, tipo text DEFAULT 'Nota',
  titulo text, descricao text NOT NULL, data_evento timestamptz, usuario text
);

CREATE TABLE IF NOT EXISTS atividades_recentes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  tipo text NOT NULL, descricao text NOT NULL, familia_nome text,
  usuario text, data_hora timestamptz, referencia_id text
);`;

export default function ConfigSupabase() {
  const [tableStatus, setTableStatus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSQL, setShowSQL] = useState(false);

  const checkTables = async () => {
    setLoading(true);
    const res = await base44.functions.invoke('supabaseSetup', { action: 'check_tables' });
    setTableStatus(res.data?.tables || []);
    setLoading(false);
  };

  useEffect(() => { checkTables(); }, []);

  const existing = tableStatus.filter(t => t.exists).length;
  const missing = tableStatus.filter(t => !t.exists).length;
  const allOk = missing === 0 && tableStatus.length > 0;

  const copySQL = () => {
    navigator.clipboard.writeText(FULL_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Database size={22} className="text-emerald-600" />
          Integração Supabase
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Projeto: <strong>{PROJECT_REF}</strong> · {SUPABASE_URL}
        </p>
      </div>

      {/* Status card */}
      <div className={`rounded-xl border-2 p-5 ${allOk ? 'border-emerald-300 bg-emerald-50' : 'border-amber-300 bg-amber-50'}`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {allOk
              ? <CheckCircle2 size={24} className="text-emerald-600" />
              : <AlertTriangle size={24} className="text-amber-600" />}
            <div>
              <p className={`font-bold text-lg ${allOk ? 'text-emerald-700' : 'text-amber-700'}`}>
                {allOk ? 'Supabase totalmente configurado' : `${missing} tabela(s) pendente(s) de criação`}
              </p>
              <p className="text-sm text-slate-600 mt-0.5">
                {existing}/{ALL_TABLES.length} tabelas encontradas no Supabase
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={checkTables} disabled={loading} className="gap-1.5">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Verificar
          </Button>
        </div>
      </div>

      {/* Instruções se faltar tabelas */}
      {missing > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-slate-700 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">!</span>
            Como criar as tabelas no Supabase
          </h2>

          <ol className="space-y-3 text-sm text-slate-600">
            <li className="flex gap-2">
              <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
              <span>Acesse o <strong>SQL Editor</strong> do seu projeto Supabase</span>
            </li>
            <li className="flex gap-2">
              <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
              <span>Copie o script SQL abaixo e cole no editor</span>
            </li>
            <li className="flex gap-2">
              <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
              <span>Clique em <strong>Run</strong> para executar e criar todas as tabelas</span>
            </li>
            <li className="flex gap-2">
              <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
              <span>Volte aqui e clique em <strong>Verificar</strong> para confirmar</span>
            </li>
          </ol>

          <div className="flex flex-wrap gap-2">
            <Button onClick={copySQL} variant="outline" className="gap-1.5">
              <Copy size={14} />
              {copied ? 'Copiado!' : 'Copiar Script SQL'}
            </Button>
            <a href={SQL_EDITOR_URL} target="_blank" rel="noopener noreferrer">
              <Button className="bg-emerald-600 hover:bg-emerald-700 gap-1.5">
                <ExternalLink size={14} />
                Abrir SQL Editor
              </Button>
            </a>
          </div>

          {/* SQL accordion */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setShowSQL(s => !s)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 text-sm font-medium text-slate-700"
            >
              <span>Ver Script SQL Completo</span>
              {showSQL ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {showSQL && (
              <pre className="bg-slate-900 text-slate-100 text-xs p-4 overflow-x-auto max-h-96 overflow-y-auto leading-relaxed">
                {FULL_SQL}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* Lista de tabelas */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
          <p className="text-sm font-semibold text-slate-600">Status das Tabelas ({ALL_TABLES.length} total)</p>
        </div>
        <div className="divide-y divide-slate-100">
          {ALL_TABLES.map(t => {
            const status = tableStatus.find(s => s.table === t.key);
            const exists = status?.exists;
            const checking = tableStatus.length === 0 && loading;
            return (
              <div key={t.key} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-700">{t.label}</p>
                  <p className="text-xs text-slate-400 font-mono">{t.key}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {checking ? (
                    <Loader2 size={14} className="animate-spin text-slate-400" />
                  ) : exists ? (
                    <><CheckCircle2 size={16} className="text-emerald-500" /><span className="text-xs text-emerald-600 font-medium">OK</span></>
                  ) : (
                    <><XCircle size={16} className="text-red-400" /><span className="text-xs text-red-500 font-medium">Pendente</span></>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info de conexão */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500 space-y-1">
        <p><strong>Projeto:</strong> {PROJECT_REF}</p>
        <p><strong>URL:</strong> {SUPABASE_URL}</p>
        <p><strong>Região:</strong> sa-east-1 (São Paulo)</p>
        <p className="text-emerald-600 font-medium">✓ Service Role Key configurada automaticamente via SUPABASE_ACCESS_TOKEN</p>
      </div>
    </div>
  );
}