import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const TOKEN = Deno.env.get("SUPABASE_ACCESS_TOKEN");
const PROJECT_REF = "avqtuoewuodpydpdqvps";
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'info';

    // Busca service_role key
    const keysRes = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/api-keys`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    const keys = await keysRes.json();
    const serviceKey = keys.find(k => k.name === 'service_role')?.api_key;
    if (!serviceKey) return Response.json({ error: 'Service role key não encontrada' }, { status: 500 });

    const headers = {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    };

    if (action === 'info') {
      // Lista tabelas existentes via information_schema
      const tablesRes = await fetch(
        `${SUPABASE_URL}/rest/v1/rpc/get_tables`,
        { method: 'POST', headers, body: JSON.stringify({}) }
      ).catch(() => null);

      // Fallback: lista via information_schema através de query
      const schemaRes = await fetch(
        `${SUPABASE_URL}/rest/v1/information_schema_tables?table_schema=eq.public&select=table_name`,
        { headers }
      );
      const existingTables = schemaRes.ok ? (await schemaRes.json()).map(t => t.table_name) : [];

      return Response.json({
        project_ref: PROJECT_REF,
        supabase_url: SUPABASE_URL,
        service_key_found: true,
        existing_tables: existingTables,
      });
    }

    if (action === 'create_tables') {
      const results = {};

      // SQL para criação de todas as tabelas do sistema
      const tables = getSQLStatements();

      for (const [tableName, sql] of Object.entries(tables)) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ query: sql }),
        });
        results[tableName] = res.ok ? 'ok' : `erro ${res.status}`;
      }

      return Response.json({ results });
    }

    if (action === 'check_tables') {
      // Verifica quais tabelas existem
      const tableNames = [
        'familias', 'visitas_campo', 'programas_sociais', 'contemplacoes',
        'pagamentos', 'cartoes', 'lotes_pix', 'municipios', 'regioes',
        'regioes_cg', 'agentes_campo', 'status_familia', 'status_visita',
        'status_programa', 'status_pagamento', 'status_cartao',
        'historico_familia', 'atividades_recentes'
      ];

      const checks = await Promise.all(tableNames.map(async (t) => {
        const r = await fetch(`${SUPABASE_URL}/rest/v1/${t}?limit=0`, { headers });
        return { table: t, exists: r.ok, status: r.status };
      }));

      return Response.json({ tables: checks });
    }

    // Operações CRUD genéricas
    if (action === 'query') {
      const { table, method = 'GET', filters = '', body: reqBody, upsert } = body;
      let url = `${SUPABASE_URL}/rest/v1/${table}${filters ? `?${filters}` : ''}`;
      const fetchHeaders = { ...headers };
      if (upsert) fetchHeaders['Prefer'] = 'resolution=merge-duplicates,return=representation';

      const r = await fetch(url, {
        method,
        headers: fetchHeaders,
        body: reqBody ? JSON.stringify(reqBody) : undefined,
      });
      const data = r.ok ? await r.json() : await r.text();
      return Response.json({ data, status: r.status, ok: r.ok });
    }

    return Response.json({ error: 'Ação inválida' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getSQLStatements() {
  return {
    municipios: `
      CREATE TABLE IF NOT EXISTS municipios (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        nome text NOT NULL,
        uf text NOT NULL,
        codigo_ibge text,
        regiao text,
        status text DEFAULT 'Ativo'
      );
    `,
    regioes: `
      CREATE TABLE IF NOT EXISTS regioes (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        nome text NOT NULL,
        descricao text,
        uf text,
        ativo boolean DEFAULT true
      );
    `,
    regioes_cg: `
      CREATE TABLE IF NOT EXISTS regioes_cg (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        nome text NOT NULL,
        descricao text,
        bairros text,
        ativo boolean DEFAULT true
      );
    `,
    agentes_campo: `
      CREATE TABLE IF NOT EXISTS agentes_campo (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        nome text NOT NULL,
        cpf text NOT NULL,
        municipio_id text,
        municipio_nome text,
        regiao_cg_id text,
        regiao_cg_nome text,
        ativo boolean DEFAULT true
      );
    `,
    status_familia: `
      CREATE TABLE IF NOT EXISTS status_familia (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        nome text NOT NULL,
        descricao text,
        cor text,
        ativo boolean DEFAULT true
      );
    `,
    status_visita: `
      CREATE TABLE IF NOT EXISTS status_visita (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        nome text NOT NULL,
        descricao text,
        cor text,
        ativo boolean DEFAULT true
      );
    `,
    status_programa: `
      CREATE TABLE IF NOT EXISTS status_programa (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        nome text NOT NULL,
        descricao text,
        cor text,
        ativo boolean DEFAULT true
      );
    `,
    status_pagamento: `
      CREATE TABLE IF NOT EXISTS status_pagamento (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        nome text NOT NULL,
        descricao text,
        cor text,
        ativo boolean DEFAULT true
      );
    `,
    status_cartao: `
      CREATE TABLE IF NOT EXISTS status_cartao (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        nome text NOT NULL,
        descricao text,
        cor text,
        ativo boolean DEFAULT true
      );
    `,
    familias: `
      CREATE TABLE IF NOT EXISTS familias (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        created_by text,
        numero_nis text,
        cadastro_unico text,
        nome_responsavel text NOT NULL,
        cpf_responsavel text NOT NULL,
        rg_numero text,
        data_nascimento date,
        genero text,
        estado_civil text,
        nacionalidade text DEFAULT 'Brasileira',
        escolaridade text,
        ultima_serie text,
        recadastro boolean DEFAULT false,
        telefone text,
        email text,
        situacao_ocupacao text,
        participa_qualifica_ms boolean DEFAULT false,
        possui_doenca boolean DEFAULT false,
        possui_deficiencia boolean DEFAULT false,
        possui_beneficio boolean DEFAULT false,
        renda_mensal numeric,
        renda_per_capita numeric,
        renda_familiar numeric,
        beneficios_lista jsonb,
        patrimonios jsonb,
        endereco text,
        cep text,
        bairro text,
        regiao text,
        estado text DEFAULT 'Mato Grosso do Sul',
        municipio text,
        situacao_moradia text,
        tipo_moradia text,
        tempo_residencia_ms text,
        latitude numeric,
        longitude numeric,
        membros_familiares jsonb,
        documentos_obrigatorios jsonb,
        documentos_especificos jsonb,
        num_membros numeric,
        tipo_familia text,
        situacao_cadastral text,
        faixa_pobreza text,
        status_beneficio text,
        data_cadastro date,
        observacoes text,
        criterios_marcados jsonb,
        faixa_renda_avaliacao text,
        familia_unipessoal boolean,
        pontuacao_vulnerabilidade numeric,
        classificacao_vulnerabilidade text,
        prioridade_visita_sugerida text,
        observacoes_avaliacao text,
        data_avaliacao timestamptz
      );
    `,
    visitas_campo: `
      CREATE TABLE IF NOT EXISTS visitas_campo (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        created_by text,
        familia_id text,
        familia_nome text NOT NULL,
        tecnico_responsavel text,
        data_agendamento date NOT NULL,
        data_visita date,
        status text,
        tipo_visita text,
        prioridade_visita text DEFAULT 'Normal',
        pontuacao_vulnerabilidade numeric,
        endereco text,
        bairro text,
        municipio text,
        regiao text,
        latitude numeric,
        longitude numeric,
        observacoes text,
        resultado text,
        validacao_familia boolean DEFAULT false,
        fotos jsonb,
        status_familia_atualizado boolean DEFAULT false
      );
    `,
    programas_sociais: `
      CREATE TABLE IF NOT EXISTS programas_sociais (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        nome text NOT NULL,
        descricao text,
        tipo text,
        valor_beneficio numeric,
        limite_orcamentario numeric,
        status text,
        data_inicio date,
        data_fim date,
        total_vagas numeric,
        vagas_ocupadas numeric
      );
    `,
    contemplacoes: `
      CREATE TABLE IF NOT EXISTS contemplacoes (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        created_by text,
        familia_id text,
        familia_nome text NOT NULL,
        programa_id text,
        programa_nome text NOT NULL,
        data_contemplacao date,
        valor numeric,
        status text DEFAULT 'Rascunho',
        mes_referencia text,
        observacoes text,
        parecer_tecnico text,
        tecnico_responsavel text,
        data_parecer timestamptz,
        decisao_gestor text,
        gestor_responsavel text,
        data_decisao timestamptz,
        motivo_reprovacao text
      );
    `,
    pagamentos: `
      CREATE TABLE IF NOT EXISTS pagamentos (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        familia_id text,
        familia_nome text NOT NULL,
        programa_nome text,
        tipo_pagamento text,
        valor numeric NOT NULL,
        mes_referencia text,
        data_pagamento date,
        status text,
        numero_cartao text,
        chave_pix text,
        observacoes text
      );
    `,
    cartoes: `
      CREATE TABLE IF NOT EXISTS cartoes (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        familia_id text,
        familia_nome text NOT NULL,
        numero_cartao text,
        status text,
        data_emissao date,
        data_entrega date,
        data_vencimento date,
        saldo numeric,
        tipo text,
        motivo_bloqueio text,
        observacoes text
      );
    `,
    lotes_pix: `
      CREATE TABLE IF NOT EXISTS lotes_pix (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        numero_lote text NOT NULL,
        data_geracao date,
        data_envio date,
        status text,
        total_registros numeric,
        valor_total numeric,
        arquivo_retorno text,
        observacoes text
      );
    `,
    historico_familia: `
      CREATE TABLE IF NOT EXISTS historico_familia (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        familia_id text NOT NULL,
        familia_nome text,
        tipo text DEFAULT 'Nota',
        titulo text,
        descricao text NOT NULL,
        data_evento timestamptz,
        usuario text
      );
    `,
    atividades_recentes: `
      CREATE TABLE IF NOT EXISTS atividades_recentes (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        tipo text NOT NULL,
        descricao text NOT NULL,
        familia_nome text,
        usuario text,
        data_hora timestamptz,
        referencia_id text
      );
    `,
  };
}