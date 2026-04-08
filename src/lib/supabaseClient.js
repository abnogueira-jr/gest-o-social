/**
 * Cliente centralizado para operações no Supabase via backend function.
 * Todas as páginas devem importar daqui em vez de usar base44.entities diretamente.
 */
import { base44 } from "@/api/base44Client";

const invoke = (payload) => base44.functions.invoke('supabaseQuery', payload);

// Mapa de nome de entidade Base44 → nome de tabela Supabase
export const TABLE_MAP = {
  Familia:          'familias',
  VisitaCampo:      'visitas_campo',
  ProgramaSocial:   'programas_sociais',
  Contemplacao:     'contemplacoes',
  Pagamento:        'pagamentos',
  Cartao:           'cartoes',
  LotePix:          'lotes_pix',
  Municipio:        'municipios',
  Regiao:           'regioes',
  RegiaoCG:         'regioes_cg',
  AgenteCampo:      'agentes_campo',
  StatusFamilia:    'status_familia',
  StatusVisita:     'status_visita',
  StatusPrograma:   'status_programa',
  StatusPagamento:  'status_pagamento',
  StatusCartao:     'status_cartao',
  HistoricoFamilia: 'historico_familia',
  AtividadeRecente: 'atividades_recentes',
};

/**
 * Cria um objeto de acesso a uma tabela Supabase com métodos CRUD.
 * API compatível com base44.entities para facilitar migração gradual.
 */
export function supabaseTable(entityName) {
  const table = TABLE_MAP[entityName] || entityName;

  return {
    async list(orderBy = '-created_at', limit = 500) {
      const col = orderBy.startsWith('-') ? orderBy.slice(1) : orderBy;
      const dir = orderBy.startsWith('-') ? 'desc' : 'asc';
      const res = await invoke({ table, action: 'list', filters: `order=${col}.${dir}&limit=${limit}` });
      return res.data?.data || [];
    },

    async filter(query = {}, orderBy = '-created_at', limit = 500) {
      const col = orderBy.startsWith('-') ? orderBy.slice(1) : orderBy;
      const dir = orderBy.startsWith('-') ? 'desc' : 'asc';
      const filterStr = Object.entries(query)
        .map(([k, v]) => `${k}=eq.${encodeURIComponent(v)}`)
        .join('&');
      const filters = `${filterStr ? filterStr + '&' : ''}order=${col}.${dir}&limit=${limit}`;
      const res = await invoke({ table, action: 'list', filters });
      return res.data?.data || [];
    },

    async get(id) {
      const res = await invoke({ table, action: 'get', id });
      return res.data?.data;
    },

    async create(data) {
      const res = await invoke({ table, action: 'create', data });
      if (!res.data?.ok) throw new Error(JSON.stringify(res.data?.data));
      return res.data?.data;
    },

    async update(id, data) {
      const res = await invoke({ table, action: 'update', id, data });
      if (!res.data?.ok) throw new Error(JSON.stringify(res.data?.data));
      return res.data?.data;
    },

    async delete(id) {
      const res = await invoke({ table, action: 'delete', id });
      return res.data?.ok;
    },

    async bulkCreate(rows) {
      const res = await invoke({ table, action: 'bulk_create', data: rows });
      if (!res.data?.ok) throw new Error(JSON.stringify(res.data?.data));
      return res.data?.data;
    },
  };
}

// Instâncias prontas para uso — drop-in replacement de base44.entities.X
export const db = Object.fromEntries(
  Object.keys(TABLE_MAP).map(name => [name, supabaseTable(name)])
);

export default db;