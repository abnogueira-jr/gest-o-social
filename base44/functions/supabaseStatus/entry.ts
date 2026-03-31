import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const TOKEN = Deno.env.get("SUPABASE_ACCESS_TOKEN");

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!TOKEN) {
      return Response.json({ error: 'SUPABASE_ACCESS_TOKEN não configurado' }, { status: 500 });
    }

    // Busca lista de projetos
    const projectsRes = await fetch('https://api.supabase.com/v1/projects', {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });

    if (!projectsRes.ok) {
      const err = await projectsRes.text();
      return Response.json({ error: `Erro ao conectar ao Supabase: ${projectsRes.status} - ${err}` }, { status: 400 });
    }

    const projects = await projectsRes.json();

    // Para cada projeto, busca detalhes de status
    const detalhes = await Promise.all(
      projects.map(async (p) => {
        // Busca API keys do projeto
        const keysRes = await fetch(`https://api.supabase.com/v1/projects/${p.ref}/api-keys`, {
          headers: { Authorization: `Bearer ${TOKEN}` },
        });
        const keys = keysRes.ok ? await keysRes.json() : [];
        const anonKey = keys.find(k => k.name === 'anon')?.api_key || null;

        return {
          id: p.id,
          ref: p.ref,
          name: p.name,
          status: p.status,
          region: p.region,
          organization_id: p.organization_id,
          created_at: p.created_at,
          database: {
            host: p.db_host || `db.${p.ref}.supabase.co`,
            port: p.db_port || 5432,
            version: p.db_version || null,
          },
          anon_key: anonKey,
        };
      })
    );

    return Response.json({ projetos: detalhes, total: detalhes.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});