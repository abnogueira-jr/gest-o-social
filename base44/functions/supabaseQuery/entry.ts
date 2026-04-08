import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const TOKEN = Deno.env.get("SUPABASE_ACCESS_TOKEN");
const PROJECT_REF = "avqtuoewuodpydpdqvps";
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`;

async function getServiceKey() {
  const keysRes = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/api-keys`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  const keys = await keysRes.json();
  return keys.find(k => k.name === 'service_role')?.api_key;
}

function makeHeaders(serviceKey) {
  return {
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { table, action, filters = '', data, id, select = '*' } = body;

    if (!table) return Response.json({ error: 'table é obrigatório' }, { status: 400 });

    const serviceKey = await getServiceKey();
    if (!serviceKey) return Response.json({ error: 'Service key não encontrada' }, { status: 500 });

    const headers = makeHeaders(serviceKey);

    // LIST
    if (action === 'list') {
      const url = `${SUPABASE_URL}/rest/v1/${table}?select=${select}${filters ? `&${filters}` : ''}&order=created_at.desc`;
      const r = await fetch(url, { headers });
      const result = r.ok ? await r.json() : await r.text();
      return Response.json({ data: result, ok: r.ok, status: r.status });
    }

    // GET by ID
    if (action === 'get') {
      const url = `${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}&select=${select}&limit=1`;
      const r = await fetch(url, { headers });
      const result = r.ok ? await r.json() : await r.text();
      return Response.json({ data: Array.isArray(result) ? result[0] : result, ok: r.ok });
    }

    // CREATE
    if (action === 'create') {
      const payload = { ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify(payload),
      });
      const result = r.ok ? await r.json() : await r.text();
      return Response.json({ data: Array.isArray(result) ? result[0] : result, ok: r.ok, status: r.status });
    }

    // UPDATE
    if (action === 'update') {
      const payload = { ...data, updated_at: new Date().toISOString() };
      const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
        method: 'PATCH',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify(payload),
      });
      const result = r.ok ? await r.json() : await r.text();
      return Response.json({ data: Array.isArray(result) ? result[0] : result, ok: r.ok, status: r.status });
    }

    // DELETE
    if (action === 'delete') {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
        method: 'DELETE',
        headers,
      });
      return Response.json({ ok: r.ok, status: r.status });
    }

    // BULK CREATE
    if (action === 'bulk_create') {
      const payloads = data.map(row => ({
        ...row,
        created_at: row.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
      const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify(payloads),
      });
      const result = r.ok ? await r.json() : await r.text();
      return Response.json({ data: result, ok: r.ok, status: r.status });
    }

    // CHECK table existence
    if (action === 'check') {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?limit=0`, { headers });
      return Response.json({ exists: r.ok, status: r.status });
    }

    return Response.json({ error: 'Ação inválida' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});