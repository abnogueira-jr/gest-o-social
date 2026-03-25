import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Data de amanhã
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    const dataAmanha = amanha.toISOString().split("T")[0]; // "YYYY-MM-DD"

    // Busca todas visitas agendadas para amanhã
    const visitas = await base44.asServiceRole.entities.VisitaCampo.filter({
      data_agendamento: dataAmanha,
      status: "Agendada",
    });

    const resultados = [];

    for (const visita of visitas) {
      // Chama a função de envio para cada visita
      const res = await base44.asServiceRole.functions.invoke("enviarWhatsapp", {
        visita_id: visita.id,
        tipo: "lembrete",
      });
      resultados.push({ visita_id: visita.id, familia: visita.familia_nome, resultado: res });
    }

    return Response.json({
      processadas: visitas.length,
      data_referencia: dataAmanha,
      resultados,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});