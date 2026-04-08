import { useState } from "react";
import { Search, Database, ChevronDown, ChevronRight, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const TIPO_COLORS = {
  string: "bg-blue-100 text-blue-700",
  number: "bg-emerald-100 text-emerald-700",
  boolean: "bg-purple-100 text-purple-700",
  array: "bg-orange-100 text-orange-700",
  object: "bg-rose-100 text-rose-700",
  date: "bg-amber-100 text-amber-700",
};

const BUILT_IN_FIELDS = [
  { nome: "id", tipo: "string", descricao: "Identificador único do registro (gerado automaticamente)", obrigatorio: true },
  { nome: "created_date", tipo: "date", descricao: "Data e hora de criação do registro", obrigatorio: false },
  { nome: "updated_date", tipo: "date", descricao: "Data e hora da última atualização", obrigatorio: false },
  { nome: "created_by", tipo: "string", descricao: "E-mail do usuário que criou o registro", obrigatorio: false },
];

const ENTIDADES = [
  {
    nome: "Familia",
    descricao: "Armazena os dados completos do núcleo familiar, incluindo responsável, membros, renda, endereço, documentos e situação cadastral no CadÚnico.",
    modulo: "Famílias",
    campos: [
      { nome: "numero_nis", tipo: "string", descricao: "Número NIS da família" },
      { nome: "cadastro_unico", tipo: "string", descricao: "Número do Cadastro Único" },
      { nome: "nome_responsavel", tipo: "string", descricao: "Nome do responsável familiar", obrigatorio: true },
      { nome: "cpf_responsavel", tipo: "string", descricao: "CPF do responsável familiar", obrigatorio: true },
      { nome: "rg_numero", tipo: "string", descricao: "RG do responsável" },
      { nome: "data_nascimento", tipo: "date", descricao: "Data de nascimento do responsável" },
      { nome: "genero", tipo: "string", descricao: "Gênero: Masculino | Feminino | Outro" },
      { nome: "estado_civil", tipo: "string", descricao: "Estado civil: Solteiro(a) | Casado(a) | Divorciado(a) | Viúvo(a) | União Estável" },
      { nome: "nacionalidade", tipo: "string", descricao: "Nacionalidade (padrão: Brasileira)" },
      { nome: "escolaridade", tipo: "string", descricao: "Nível de escolaridade do responsável" },
      { nome: "ultima_serie", tipo: "string", descricao: "Última série cursada" },
      { nome: "recadastro", tipo: "boolean", descricao: "Indica se a família passou por recadastramento" },
      { nome: "telefone", tipo: "string", descricao: "Telefone de contato" },
      { nome: "email", tipo: "string", descricao: "E-mail de contato" },
      { nome: "situacao_ocupacao", tipo: "string", descricao: "Situação de ocupação: Empregado | Desempregado | Autônomo | Aposentado | Do Lar | Estudante" },
      { nome: "participa_qualifica_ms", tipo: "boolean", descricao: "Indica se participa do programa Qualifica MS" },
      { nome: "possui_doenca", tipo: "boolean", descricao: "Indica se o responsável possui doença" },
      { nome: "possui_deficiencia", tipo: "boolean", descricao: "Indica se o responsável possui deficiência" },
      { nome: "possui_beneficio", tipo: "boolean", descricao: "Indica se a família possui benefício social ativo" },
      { nome: "renda_mensal", tipo: "number", descricao: "Renda mensal total da família (R$)" },
      { nome: "renda_per_capita", tipo: "number", descricao: "Renda per capita familiar (R$)" },
      { nome: "beneficios_lista", tipo: "array", descricao: "Lista de benefícios sociais recebidos (nome, valor, do_beneficiário)" },
      { nome: "patrimonios", tipo: "array", descricao: "Lista de patrimônios declarados pela família" },
      { nome: "endereco", tipo: "string", descricao: "Logradouro e número do endereço" },
      { nome: "cep", tipo: "string", descricao: "CEP do endereço" },
      { nome: "bairro", tipo: "string", descricao: "Bairro do endereço" },
      { nome: "regiao", tipo: "string", descricao: "Região geográfica" },
      { nome: "estado", tipo: "string", descricao: "Estado (padrão: Mato Grosso do Sul)" },
      { nome: "municipio", tipo: "string", descricao: "Município de residência" },
      { nome: "situacao_moradia", tipo: "string", descricao: "Situação da moradia: Própria | Alugada | Cedida | Irregular | Financiada" },
      { nome: "tipo_moradia", tipo: "string", descricao: "Tipo da moradia: Casa | Apartamento | Cômodo | Improvisada" },
      { nome: "tempo_residencia_ms", tipo: "string", descricao: "Tempo de residência no estado" },
      { nome: "latitude", tipo: "number", descricao: "Latitude geográfica para localização no mapa" },
      { nome: "longitude", tipo: "number", descricao: "Longitude geográfica para localização no mapa" },
      { nome: "membros_familiares", tipo: "array", descricao: "Lista de membros do núcleo familiar (nome, nascimento, parentesco, escolaridade, renda, deficiência, autismo etc.)" },
      { nome: "documentos_obrigatorios", tipo: "object", descricao: "Checklist de documentos obrigatórios (termo de veracidade, identidade, comprovante de residência/renda)" },
      { nome: "documentos_especificos", tipo: "object", descricao: "Checklist de documentos específicos (laudo médico, deficiência, autismo, carteira de vacinação)" },
      { nome: "num_membros", tipo: "number", descricao: "Número total de membros familiares" },
      { nome: "renda_familiar", tipo: "number", descricao: "Renda familiar total bruta (R$)" },
      { nome: "tipo_familia", tipo: "string", descricao: "Tipo da família: Solo | Com Crianças | Com Idosos | Com Deficientes | Com Gestantes" },
      { nome: "situacao_cadastral", tipo: "string", descricao: "Situação cadastral: Ativo | Inativo | Pendente | Suspenso | Cancelado" },
      { nome: "faixa_pobreza", tipo: "string", descricao: "Faixa de pobreza: Extrema Pobreza | Pobreza | Baixa Renda" },
      { nome: "status_beneficio", tipo: "string", descricao: "Status do benefício: Ativo | Suspenso | Cancelado | Em Análise | Aguardando" },
      { nome: "data_cadastro", tipo: "date", descricao: "Data de cadastro da família no sistema" },
      { nome: "observacoes", tipo: "string", descricao: "Observações adicionais sobre a família" },
    ],
  },
  {
    nome: "VisitaCampo",
    descricao: "Registra os agendamentos e realizações de visitas domiciliares de campo, incluindo geolocalização, fotos, resultado e pontuação de vulnerabilidade.",
    modulo: "Visita de Campo",
    campos: [
      { nome: "familia_id", tipo: "string", descricao: "ID da família visitada (referência à entidade Familia)" },
      { nome: "familia_nome", tipo: "string", descricao: "Nome do responsável familiar visitado", obrigatorio: true },
      { nome: "tecnico_responsavel", tipo: "string", descricao: "Nome do técnico responsável pela visita" },
      { nome: "data_agendamento", tipo: "date", descricao: "Data em que a visita foi agendada", obrigatorio: true },
      { nome: "data_visita", tipo: "date", descricao: "Data efetiva de realização da visita" },
      { nome: "status", tipo: "string", descricao: "Status: Agendada | Realizada | Cancelada | Reagendada | Não Localizada" },
      { nome: "tipo_visita", tipo: "string", descricao: "Tipo: Busca Ativa | Acompanhamento | Validação | Monitoramento" },
      { nome: "prioridade_visita", tipo: "string", descricao: "Prioridade calculada pela escala de vulnerabilidade: Urgente | Alta | Normal | Baixa" },
      { nome: "pontuacao_vulnerabilidade", tipo: "number", descricao: "Pontuação numérica calculada pela Escala de Vulnerabilidade" },
      { nome: "endereco", tipo: "string", descricao: "Endereço do local visitado" },
      { nome: "bairro", tipo: "string", descricao: "Bairro do local visitado" },
      { nome: "municipio", tipo: "string", descricao: "Município do local visitado" },
      { nome: "regiao", tipo: "string", descricao: "Região do local visitado" },
      { nome: "latitude", tipo: "number", descricao: "Latitude para localização geográfica da visita" },
      { nome: "longitude", tipo: "number", descricao: "Longitude para localização geográfica da visita" },
      { nome: "observacoes", tipo: "string", descricao: "Observações registradas durante ou após a visita" },
      { nome: "resultado", tipo: "string", descricao: "Resultado/parecer da visita realizada" },
      { nome: "validacao_familia", tipo: "boolean", descricao: "Indica se a visita validou os dados da família" },
      { nome: "fotos", tipo: "array", descricao: "Lista de URLs de fotos registradas durante a visita" },
      { nome: "status_familia_atualizado", tipo: "boolean", descricao: "Indica se o status da família foi atualizado automaticamente após a visita" },
    ],
  },
  {
    nome: "ProgramaSocial",
    descricao: "Cadastro dos programas sociais gerenciados pelo sistema, com controle de vagas, orçamento e vigência.",
    modulo: "Programas Sociais",
    campos: [
      { nome: "nome", tipo: "string", descricao: "Nome do programa social", obrigatorio: true },
      { nome: "descricao", tipo: "string", descricao: "Descrição do objetivo e público-alvo do programa" },
      { nome: "tipo", tipo: "string", descricao: "Abrangência: Federal | Estadual | Municipal" },
      { nome: "valor_beneficio", tipo: "number", descricao: "Valor do benefício concedido (R$)" },
      { nome: "limite_orcamentario", tipo: "number", descricao: "Limite orçamentário total do programa (R$)" },
      { nome: "status", tipo: "string", descricao: "Status: Ativo | Inativo | Suspenso" },
      { nome: "data_inicio", tipo: "date", descricao: "Data de início do programa" },
      { nome: "data_fim", tipo: "date", descricao: "Data de encerramento do programa" },
      { nome: "total_vagas", tipo: "number", descricao: "Número total de vagas disponíveis" },
      { nome: "vagas_ocupadas", tipo: "number", descricao: "Número de vagas atualmente ocupadas" },
    ],
  },
  {
    nome: "Contemplacao",
    descricao: "Registra a concessão de benefícios a famílias em programas sociais, com fluxo de aprovação técnico e gestor.",
    modulo: "Programas Sociais",
    campos: [
      { nome: "familia_id", tipo: "string", descricao: "ID da família contemplada (referência à entidade Familia)" },
      { nome: "familia_nome", tipo: "string", descricao: "Nome do responsável familiar contemplado", obrigatorio: true },
      { nome: "programa_id", tipo: "string", descricao: "ID do programa social (referência à entidade ProgramaSocial)" },
      { nome: "programa_nome", tipo: "string", descricao: "Nome do programa social contemplado", obrigatorio: true },
      { nome: "data_contemplacao", tipo: "date", descricao: "Data da contemplação" },
      { nome: "valor", tipo: "number", descricao: "Valor do benefício concedido nesta contemplação (R$)" },
      { nome: "status", tipo: "string", descricao: "Status: Rascunho | Pendente Aprovação | Aprovado | Reprovado | Suspenso | Cancelado | Encerrado" },
      { nome: "mes_referencia", tipo: "string", descricao: "Mês de referência da contemplação (ex: 2024-01)" },
      { nome: "observacoes", tipo: "string", descricao: "Observações gerais sobre a contemplação" },
      { nome: "parecer_tecnico", tipo: "string", descricao: "Parecer emitido pelo técnico responsável" },
      { nome: "tecnico_responsavel", tipo: "string", descricao: "Nome do técnico que emitiu o parecer" },
      { nome: "data_parecer", tipo: "date", descricao: "Data e hora do parecer técnico" },
      { nome: "decisao_gestor", tipo: "string", descricao: "Decisão do gestor (Aprovado/Reprovado)" },
      { nome: "gestor_responsavel", tipo: "string", descricao: "Nome do gestor que tomou a decisão" },
      { nome: "data_decisao", tipo: "date", descricao: "Data e hora da decisão do gestor" },
      { nome: "motivo_reprovacao", tipo: "string", descricao: "Motivo da reprovação, quando aplicável" },
    ],
  },
  {
    nome: "Cartao",
    descricao: "Controla a emissão, entrega, bloqueio e ciclo de vida dos cartões de benefício das famílias.",
    modulo: "Gestão de Cartões",
    campos: [
      { nome: "familia_id", tipo: "string", descricao: "ID da família titular do cartão" },
      { nome: "familia_nome", tipo: "string", descricao: "Nome do responsável familiar", obrigatorio: true },
      { nome: "numero_cartao", tipo: "string", descricao: "Número do cartão de benefício" },
      { nome: "status", tipo: "string", descricao: "Status: Ativo | Bloqueado | Cancelado | Aguardando Emissão | Emitido | Entregue" },
      { nome: "data_emissao", tipo: "date", descricao: "Data de emissão do cartão" },
      { nome: "data_entrega", tipo: "date", descricao: "Data de entrega do cartão ao beneficiário" },
      { nome: "data_vencimento", tipo: "date", descricao: "Data de vencimento do cartão" },
      { nome: "saldo", tipo: "number", descricao: "Saldo disponível no cartão (R$)" },
      { nome: "tipo", tipo: "string", descricao: "Tipo: 1ª Via | 2ª Via | Renovação" },
      { nome: "motivo_bloqueio", tipo: "string", descricao: "Motivo do bloqueio, quando aplicável" },
      { nome: "observacoes", tipo: "string", descricao: "Observações adicionais sobre o cartão" },
    ],
  },
  {
    nome: "Pagamento",
    descricao: "Registra os pagamentos realizados às famílias via cartão, PIX ou depósito, com referência mensal e status.",
    modulo: "Gestão de Cartões / PIX",
    campos: [
      { nome: "familia_id", tipo: "string", descricao: "ID da família beneficiária" },
      { nome: "familia_nome", tipo: "string", descricao: "Nome do responsável familiar", obrigatorio: true },
      { nome: "programa_nome", tipo: "string", descricao: "Nome do programa social vinculado ao pagamento" },
      { nome: "tipo_pagamento", tipo: "string", descricao: "Modalidade: Cartão | PIX | Depósito" },
      { nome: "valor", tipo: "number", descricao: "Valor pago (R$)", obrigatorio: true },
      { nome: "mes_referencia", tipo: "string", descricao: "Mês de referência do pagamento (ex: 2024-01)" },
      { nome: "data_pagamento", tipo: "date", descricao: "Data em que o pagamento foi realizado" },
      { nome: "status", tipo: "string", descricao: "Status: Pago | Pendente | Cancelado | Devolvido | Bloqueado" },
      { nome: "numero_cartao", tipo: "string", descricao: "Número do cartão utilizado (se pagamento via cartão)" },
      { nome: "chave_pix", tipo: "string", descricao: "Chave PIX do beneficiário (se pagamento via PIX)" },
      { nome: "observacoes", tipo: "string", descricao: "Observações sobre o pagamento" },
    ],
  },
  {
    nome: "LotePix",
    descricao: "Controla os lotes de pagamento via PIX gerados para envio em lote ao sistema bancário.",
    modulo: "Gestão de PIX",
    campos: [
      { nome: "numero_lote", tipo: "string", descricao: "Número identificador do lote PIX", obrigatorio: true },
      { nome: "data_geracao", tipo: "date", descricao: "Data de geração do lote" },
      { nome: "data_envio", tipo: "date", descricao: "Data de envio do lote ao banco" },
      { nome: "status", tipo: "string", descricao: "Status: Gerado | Enviado | Processado | Erro | Cancelado" },
      { nome: "total_registros", tipo: "number", descricao: "Quantidade de registros/pagamentos no lote" },
      { nome: "valor_total", tipo: "number", descricao: "Valor total do lote (R$)" },
      { nome: "arquivo_retorno", tipo: "string", descricao: "URL ou referência do arquivo de retorno bancário" },
      { nome: "observacoes", tipo: "string", descricao: "Observações sobre o lote" },
    ],
  },
  {
    nome: "HistoricoFamilia",
    descricao: "Linha do tempo de eventos relacionados a uma família: atendimentos, visitas, benefícios, atualizações cadastrais e notas técnicas.",
    modulo: "Famílias",
    campos: [
      { nome: "familia_id", tipo: "string", descricao: "ID da família relacionada", obrigatorio: true },
      { nome: "familia_nome", tipo: "string", descricao: "Nome do responsável familiar" },
      { nome: "tipo", tipo: "string", descricao: "Tipo do evento: Nota | Atendimento | Visita | Benefício | Cadastro | Atualização" },
      { nome: "titulo", tipo: "string", descricao: "Título resumido do evento" },
      { nome: "descricao", tipo: "string", descricao: "Descrição detalhada do evento", obrigatorio: true },
      { nome: "data_evento", tipo: "date", descricao: "Data e hora em que o evento ocorreu" },
      { nome: "usuario", tipo: "string", descricao: "Usuário/técnico que registrou o evento" },
    ],
  },
  {
    nome: "AtividadeRecente",
    descricao: "Log de atividades recentes no sistema para exibição no Dashboard, como visitas, contemplações, pagamentos e alterações cadastrais.",
    modulo: "Dashboard",
    campos: [
      { nome: "tipo", tipo: "string", descricao: "Tipo: Visita | Contemplação | Pagamento | Cadastro | Bloqueio | Desbloqueio", obrigatorio: true },
      { nome: "descricao", tipo: "string", descricao: "Descrição da atividade realizada", obrigatorio: true },
      { nome: "familia_nome", tipo: "string", descricao: "Nome da família envolvida na atividade" },
      { nome: "usuario", tipo: "string", descricao: "Usuário que realizou a atividade" },
      { nome: "data_hora", tipo: "date", descricao: "Data e hora da atividade" },
      { nome: "referencia_id", tipo: "string", descricao: "ID do registro relacionado (visita, pagamento etc.)" },
    ],
  },
  {
    nome: "Municipio",
    descricao: "Tabela de municípios cadastrados para uso nos formulários e filtros do sistema.",
    modulo: "Tabelas",
    campos: [
      { nome: "nome", tipo: "string", descricao: "Nome do município", obrigatorio: true },
      { nome: "uf", tipo: "string", descricao: "Sigla do estado (ex: MS)", obrigatorio: true },
      { nome: "codigo_ibge", tipo: "string", descricao: "Código IBGE do município" },
      { nome: "regiao", tipo: "string", descricao: "Região geográfica do município" },
      { nome: "status", tipo: "string", descricao: "Status: Ativo | Inativo" },
    ],
  },
  {
    nome: "Regiao",
    descricao: "Tabela de regiões geográficas estaduais utilizadas para segmentação e filtros.",
    modulo: "Tabelas",
    campos: [
      { nome: "nome", tipo: "string", descricao: "Nome da região", obrigatorio: true },
      { nome: "descricao", tipo: "string", descricao: "Descrição da região" },
      { nome: "uf", tipo: "string", descricao: "Estado (UF) ao qual a região pertence" },
      { nome: "ativo", tipo: "boolean", descricao: "Indica se a região está ativa no sistema" },
    ],
  },
  {
    nome: "RegiaoCG",
    descricao: "Regiões administrativas específicas do município de Campo Grande, usadas para segmentação local.",
    modulo: "Tabelas",
    campos: [
      { nome: "nome", tipo: "string", descricao: "Nome da região de Campo Grande", obrigatorio: true },
      { nome: "descricao", tipo: "string", descricao: "Descrição da região" },
      { nome: "bairros", tipo: "string", descricao: "Bairros abrangidos pela região (separados por vírgula)" },
      { nome: "ativo", tipo: "boolean", descricao: "Indica se a região está ativa" },
    ],
  },
  {
    nome: "StatusFamilia",
    descricao: "Tabela de domínio com os status possíveis para famílias, com cores para exibição visual.",
    modulo: "Tabelas",
    campos: [
      { nome: "nome", tipo: "string", descricao: "Nome do status", obrigatorio: true },
      { nome: "descricao", tipo: "string", descricao: "Descrição do significado do status" },
      { nome: "cor", tipo: "string", descricao: "Cor hexadecimal para exibição (ex: #10b981)" },
      { nome: "ativo", tipo: "boolean", descricao: "Indica se o status está em uso" },
    ],
  },
  {
    nome: "StatusVisita",
    descricao: "Tabela de domínio com os status possíveis para visitas de campo.",
    modulo: "Tabelas",
    campos: [
      { nome: "nome", tipo: "string", descricao: "Nome do status de visita", obrigatorio: true },
      { nome: "descricao", tipo: "string", descricao: "Descrição do status" },
      { nome: "cor", tipo: "string", descricao: "Cor hexadecimal para exibição visual" },
      { nome: "ativo", tipo: "boolean", descricao: "Indica se o status está ativo" },
    ],
  },
  {
    nome: "StatusPrograma",
    descricao: "Tabela de domínio com os status possíveis para programas sociais.",
    modulo: "Tabelas",
    campos: [
      { nome: "nome", tipo: "string", descricao: "Nome do status do programa", obrigatorio: true },
      { nome: "descricao", tipo: "string", descricao: "Descrição do status" },
      { nome: "cor", tipo: "string", descricao: "Cor hexadecimal para exibição visual" },
      { nome: "ativo", tipo: "boolean", descricao: "Indica se o status está ativo" },
    ],
  },
  {
    nome: "StatusCartao",
    descricao: "Tabela de domínio com os status possíveis para cartões de benefício.",
    modulo: "Tabelas",
    campos: [
      { nome: "nome", tipo: "string", descricao: "Nome do status do cartão", obrigatorio: true },
      { nome: "descricao", tipo: "string", descricao: "Descrição do status" },
      { nome: "cor", tipo: "string", descricao: "Cor hexadecimal para exibição visual" },
      { nome: "ativo", tipo: "boolean", descricao: "Indica se o status está ativo" },
    ],
  },
  {
    nome: "StatusPagamento",
    descricao: "Tabela de domínio com os status possíveis para pagamentos.",
    modulo: "Tabelas",
    campos: [
      { nome: "nome", tipo: "string", descricao: "Nome do status de pagamento", obrigatorio: true },
      { nome: "descricao", tipo: "string", descricao: "Descrição do status" },
      { nome: "cor", tipo: "string", descricao: "Cor hexadecimal para exibição visual" },
      { nome: "ativo", tipo: "boolean", descricao: "Indica se o status está ativo" },
    ],
  },
];

const MODULOS = ["Todos", ...Array.from(new Set(ENTIDADES.map(e => e.modulo)))];

function TipoBadge({ tipo }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-medium ${TIPO_COLORS[tipo] || "bg-slate-100 text-slate-600"}`}>
      {tipo}
    </span>
  );
}

function EntidadeCard({ entidade }) {
  const [aberto, setAberto] = useState(false);
  const totalCampos = entidade.campos.length + BUILT_IN_FIELDS.length;
  const obrigatorios = entidade.campos.filter(c => c.obrigatorio).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <button
        onClick={() => setAberto(!aberto)}
        className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Database size={16} className="text-sky-600" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-800 font-mono text-base">{entidade.nome}</h3>
              <span className="text-xs bg-sky-50 text-sky-700 border border-sky-200 rounded-full px-2 py-0.5">{entidade.modulo}</span>
              {obrigatorios > 0 && (
                <span className="text-xs bg-red-50 text-red-600 border border-red-200 rounded-full px-2 py-0.5">{obrigatorios} obrigatório(s)</span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-0.5 leading-snug">{entidade.descricao}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs text-slate-400 hidden sm:block">{totalCampos} campos</span>
          {aberto ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
        </div>
      </button>

      {aberto && (
        <div className="border-t border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-[220px]">Campo</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-[90px]">Tipo</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Descrição</th>
                  <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide w-[100px]">Obrigatório</th>
                </tr>
              </thead>
              <tbody>
                {/* Campos built-in */}
                {BUILT_IN_FIELDS.map((c, i) => (
                  <tr key={`bi-${i}`} className="border-b border-slate-100 bg-slate-50/50">
                    <td className="px-4 py-2.5 font-mono text-xs text-slate-500 flex items-center gap-1.5">
                      <Tag size={10} className="text-slate-400 flex-shrink-0" />
                      {c.nome}
                    </td>
                    <td className="px-4 py-2.5"><TipoBadge tipo={c.tipo} /></td>
                    <td className="px-4 py-2.5 text-slate-500 text-xs italic">{c.descricao}</td>
                    <td className="px-4 py-2.5 text-center">{c.obrigatorio ? <span className="text-red-500 font-bold">✕</span> : <span className="text-slate-300">—</span>}</td>
                  </tr>
                ))}
                {/* Campos da entidade */}
                {entidade.campos.map((c, i) => (
                  <tr key={i} className={`border-b border-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/30"} hover:bg-sky-50/40 transition-colors`}>
                    <td className="px-4 py-2.5 font-mono text-xs text-sky-800 font-medium">{c.nome}</td>
                    <td className="px-4 py-2.5"><TipoBadge tipo={c.tipo} /></td>
                    <td className="px-4 py-2.5 text-slate-600 text-xs">{c.descricao}</td>
                    <td className="px-4 py-2.5 text-center">
                      {c.obrigatorio ? <span className="text-red-500 font-bold text-sm">✓</span> : <span className="text-slate-300">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DicionarioDados() {
  const [busca, setBusca] = useState("");
  const [moduloAtivo, setModuloAtivo] = useState("Todos");

  const filtradas = ENTIDADES.filter(e => {
    const termoBusca = busca.toLowerCase();
    const matchModulo = moduloAtivo === "Todos" || e.modulo === moduloAtivo;
    const matchBusca = !busca ||
      e.nome.toLowerCase().includes(termoBusca) ||
      e.descricao.toLowerCase().includes(termoBusca) ||
      e.campos.some(c => c.nome.toLowerCase().includes(termoBusca) || c.descricao.toLowerCase().includes(termoBusca));
    return matchModulo && matchBusca;
  });

  const totalCampos = ENTIDADES.reduce((acc, e) => acc + e.campos.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Database size={22} className="text-sky-600" />
            Dicionário de Dados
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Documentação completa de todas as tabelas e campos do sistema
          </p>
        </div>
        <div className="flex gap-3 text-center">
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
            <p className="text-xl font-bold text-sky-600">{ENTIDADES.length}</p>
            <p className="text-xs text-slate-500">Tabelas</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
            <p className="text-xl font-bold text-sky-600">{totalCampos}</p>
            <p className="text-xs text-slate-500">Campos</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
            <p className="text-xl font-bold text-sky-600">{MODULOS.length - 1}</p>
            <p className="text-xs text-slate-500">Módulos</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar tabela ou campo..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {MODULOS.map(m => (
            <button
              key={m}
              onClick={() => setModuloAtivo(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                moduloAtivo === m
                  ? "bg-sky-600 text-white border-sky-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-sky-300 hover:text-sky-600"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Legenda tipos */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-slate-400 font-medium">Tipos:</span>
        {Object.entries(TIPO_COLORS).map(([tipo, cls]) => (
          <span key={tipo} className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-medium ${cls}`}>{tipo}</span>
        ))}
      </div>

      {/* Lista de entidades */}
      <div className="space-y-3">
        {filtradas.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Database size={40} className="mx-auto mb-3 opacity-30" />
            <p>Nenhuma tabela encontrada para "{busca}"</p>
          </div>
        ) : (
          filtradas.map(e => <EntidadeCard key={e.nome} entidade={e} />)
        )}
      </div>
    </div>
  );
}