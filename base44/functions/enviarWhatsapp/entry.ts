import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const EVOLUTION_URL = Deno.env.get("EVOLUTION_API_URL");
const EVOLUTION_KEY = Deno.env.get("EVOLUTION_API_KEY");
const EVOLUTION_INSTANCE = Deno.env.get("EVOLUTION_INSTANCE");

async function enviarMensagem(numero, mensagem) {
  // Formata o número: remove não-dígitos e garante código do país
  let tel = numero.replace(/\D/g, "");
  if (tel.startsWith("0")) tel = tel.slice(1);
  if (!tel.startsWith("55")) tel = "55" + tel;

  const response = await fetch(
    `${EVOLUTION_URL}/message/sendText/${EVOLUTION_INSTANCE}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": EVOLUTION_KEY,
      },
      body: JSON.stringify({
        number: tel,
        text: mensagem,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Evolution API error: ${response.status} - ${err}`);
  }

  return await response.json();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { visita_id, tipo } = await req.json();
    // tipo: "confirmacao" | "lembrete"

    if (!visita_id) return Response.json({ error: "visita_id obrigatório" }, { status: 400 });

    // Busca dados da visita
    const visitas = await base44.asServiceRole.entities.VisitaCampo.filter({ id: visita_id });
    const visita = visitas[0];
    if (!visita) return Response.json({ error: "Visita não encontrada" }, { status: 404 });

    // Busca telefone da família
    const familias = await base44.asServiceRole.entities.Familia.filter({ id: visita.familia_id });
    const familia = familias[0];
    if (!familia?.telefone) {
      return Response.json({ error: "Família sem telefone cadastrado", enviado: false });
    }

    // Formata data
    const dataFormatada = visita.data_agendamento
      ? new Date(visita.data_agendamento + "T00:00:00").toLocaleDateString("pt-BR", {
          day: "2-digit", month: "2-digit", year: "numeric"
        })
      : "data a confirmar";

    let mensagem;
    if (tipo === "lembrete") {
      mensagem =
        `⏰ *Lembrete de Visita Amanhã*\n\n` +
        `Olá, *${familia.nome_responsavel}*!\n\n` +
        `Este é um lembrete de que amanhã, *${dataFormatada}*, um técnico da equipe de Gestão Social estará visitando sua residência.\n\n` +
        `👤 Técnico: *${visita.tecnico_responsavel || "a definir"}*\n` +
        `📋 Tipo: ${visita.tipo_visita || "Visita de Campo"}\n\n` +
        `Por favor, certifique-se de estar em casa. Em caso de dúvidas, entre em contato conosco.`;
    } else {
      mensagem =
        `✅ *Visita Agendada com Sucesso!*\n\n` +
        `Olá, *${familia.nome_responsavel}*!\n\n` +
        `Sua visita de campo foi agendada:\n\n` +
        `📅 Data: *${dataFormatada}*\n` +
        `👤 Técnico: *${visita.tecnico_responsavel || "a definir"}*\n` +
        `📋 Tipo: ${visita.tipo_visita || "Visita de Campo"}\n\n` +
        `Por favor, certifique-se de estar em casa no dia agendado.\n\n` +
        `_Gestão Social Estadual_`;
    }

    const resultado = await enviarMensagem(familia.telefone, mensagem);
    return Response.json({ enviado: true, resultado });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});