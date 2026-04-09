import { base44 } from "@/api/base44Client";

/**
 * Registra uma ação de auditoria no sistema.
 *
 * @param {Object} params
 * @param {"Criação"|"Edição"|"Exclusão"|"Visualização"|"Login"|"Exportação"|"Alteração de Status"} params.acao
 * @param {"Famílias"|"Visitas"|"Programas Sociais"|"Benefícios"|"Cartões"|"PIX"|"Contemplações"|"Relatórios"|"Configurações"|"Sistema"} params.modulo
 * @param {string} [params.entidade] - Nome da entidade (ex: "Familia")
 * @param {string} [params.entidade_id]
 * @param {string} [params.entidade_descricao] - Texto legível (ex: nome da família)
 * @param {string} [params.detalhes] - Descrição da ação
 * @param {Object} [params.dados_anteriores] - Objeto com dados antes da edição
 * @param {Object} [params.dados_novos] - Objeto com dados após a edição
 */
export async function registrarAuditoria(params) {
  try {
    const user = await base44.auth.me().catch(() => null);
    await base44.entities.AuditoriaLog.create({
      usuario_email: user?.email || "desconhecido",
      usuario_nome: user?.full_name || user?.email || "desconhecido",
      acao: params.acao,
      modulo: params.modulo,
      entidade: params.entidade || "",
      entidade_id: params.entidade_id || "",
      entidade_descricao: params.entidade_descricao || "",
      detalhes: params.detalhes || "",
      dados_anteriores: params.dados_anteriores ? JSON.stringify(params.dados_anteriores) : "",
      dados_novos: params.dados_novos ? JSON.stringify(params.dados_novos) : "",
      data_hora: new Date().toISOString(),
    });
  } catch (e) {
    // Não bloqueia a operação principal se a auditoria falhar
    console.warn("Auditoria: falha ao registrar log", e);
  }
}