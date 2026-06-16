# Software Design Document (SDD)

## Gestão Social Estadual — Plataforma de Busca Ativa

**Versão:** 1.0  
**Data:** 16/06/2026  
**Estado:** Mato Grosso do Sul  

---

## 1. Visão Geral do Sistema

### 1.1 Propósito

O Gestão Social Estadual é uma plataforma web integrada para administração de programas sociais estaduais. Sua finalidade principal é gerenciar o ciclo completo de **Busca Ativa Familiar**, desde o cadastro socioeconômico até a contemplação de benefícios, emissão de cartões e pagamentos.

### 1.2 Escopo

| Módulo | Descrição |
|--------|-----------|
| **Cadastro de Famílias** | Registro completo de dados pessoais, endereço, renda, saúde, educação, composição familiar e documentação |
| **Busca Ativa** | Agenda e acompanhamento de visitas de campo para localização e validação de famílias em vulnerabilidade |
| **Visita de Campo** | Agendamento, registro, avaliação de vulnerabilidade e mapeamento geográfico |
| **Programas Sociais** | Cadastro, contemplações, monitoramento de beneficiários e importação de dados federais |
| **Gestão de Cartões** | Ciclo completo: emissão, 2ª via, renovação, entrega, liberação, pagamentos, transferência de saldos, bloqueio/desbloqueio |
| **Gestão de PIX** | Geração, envio e retorno de lotes PIX, bloqueio e desbloqueio |
| **Relatórios** | KPIs, gráficos analíticos e exportação de dados |
| **Painel Dimensional** | Análise dinâmica com tabelas pivot (dimensões × medidas) e exportação CSV |
| **Calendário de Pagamentos** | Controle financeiro com créditos/débitos por data e saldo disponível |
| **Auditoria** | Registro completo de ações (criação, edição, exclusão) por usuário e módulo |
| **Configurações** | Gestão de usuários, agentes de campo e tabelas auxiliares (status, municípios, regiões) |

### 1.3 Arquitetura

```
┌─────────────────────────────────────────────────┐
│                   Frontend                      │
│         React 18 + Tailwind CSS + Vite           │
│    shadcn/ui · Recharts · React-Leaflet · DnD   │
├─────────────────────────────────────────────────┤
│                  Base44 BaaS                     │
│   Autenticação · Entidades · Funções · Storage  │
├─────────────────────────────────────────────────┤
│              Integrações Externas                │
│     ViaCEP · Nominatim · Supabase · WhatsApp    │
└─────────────────────────────────────────────────┘
```

---

## 2. Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| **Frontend** | React 18, Vite, JavaScript (JSX) |
| **Estilização** | Tailwind CSS, shadcn/ui |
| **Roteamento** | React Router DOM v6 |
| **Gráficos** | Recharts |
| **Mapas** | React-Leaflet |
| **Drag & Drop** | @hello-pangea/dnd |
| **Formulários** | react-hook-form |
| **Editor Rico** | react-quill |
| **Markdown** | react-markdown |
| **Backend-as-a-Service** | Base44 SDK v0.8.x |
| **Banco de Dados** | Base44 Entities (JSON Schema) |
| **Autenticação** | Base44 Auth (tokens JWT, roles admin/user) |
| **Funções Serverless** | Deno (funções/ diretório) |
| **APIs Externas** | ViaCEP, Nominatim (OpenStreetMap), Supabase |

---

## 3. Modelo de Dados

### 3.1 Entidade Principal: Familia

| Grupo | Campos |
|-------|--------|
| **Identificação** | `nome_responsavel`, `cpf_responsavel`, `rg_numero`, `numero_nis`, `cadastro_unico` |
| **Perfil** | `data_nascimento`, `genero`, `estado_civil`, `nacionalidade`, `escolaridade`, `ultima_serie` |
| **Contato** | `telefone`, `email` |
| **Ocupação/Renda** | `situacao_ocupacao`, `participa_qualifica_ms`, `renda_mensal`, `renda_per_capita` |
| **Saúde** | `possui_doenca`, `possui_deficiencia` |
| **Benefícios** | `possui_beneficio`, `beneficios_lista[]` (nome, valor, do_beneficiario) |
| **Patrimônio** | `patrimonios[]` (descricao, valor) |
| **Endereço** | `endereco`, `cep`, `bairro`, `regiao`, `estado`, `municipio` |
| **Moradia** | `situacao_moradia`, `tipo_moradia`, `tempo_residencia_ms` |
| **Geolocalização** | `latitude`, `longitude` (via CEP — Nominatim) |
| **Grupo Familiar** | `membros_familiares[]` (nome, data_nascimento, estado_civil, parentesco, escolaridade, saúde, renda) |
| **Documentos** | `documentos_obrigatorios{}`, `documentos_especificos{}`, `documentos_arquivos{}` (URLs) |
| **Classificação** | `tipo_familia`, `situacao_cadastral`, `faixa_pobreza`, `status_beneficio`, `num_membros` |
| **Datas** | `data_cadastro` |

### 3.2 Entidades de Apoio

| Entidade | Finalidade |
|----------|------------|
| **VisitaCampo** | Agendamento e registro de visitas com geolocalização, fotos e avaliação de vulnerabilidade |
| **AgenteCampo** | Cadastro de agentes com CPF, município/região de atuação |
| **ProgramaSocial** | Programas com valor, vagas, status e limites orçamentários |
| **Contemplacao** | Fluxo de aprovação: rascunho → parecer técnico → decisão do gestor |
| **Cartao** | Ciclo completo com status, saldo, datas e motivos de bloqueio |
| **Pagamento** | Pagamentos por cartão/PIX/depósito com status e mês de referência |
| **LotePix** | Lotes de pagamento PIX com total de registros e valor |
| **AlteracaoBeneficio** | Histórico de alterações de status de benefícios com motivo e justificativa |
| **HistoricoFamilia** | Notas, atendimentos e eventos do histórico familiar |
| **AtividadeRecente** | Feed de atividades recentes do sistema |
| **AuditoriaLog** | Registro imutável de ações com usuário, IP, dados anteriores/novos |
| **CalendarioPagamento** | Lançamentos financeiros (crédito/débito) com data e valor |

### 3.3 Entidades de Tabelas Auxiliares

| Entidade | Campos |
|----------|--------|
| **StatusFamilia** | nome, descricao, cor, ativo |
| **StatusVisita** | nome, descricao, cor, ativo |
| **StatusPrograma** | nome, descricao, cor, ativo |
| **StatusPagamento** | nome, descricao, cor, ativo |
| **StatusCartao** | nome, descricao, cor, ativo |
| **Municipio** | nome, uf, codigo_ibge, regiao, status |
| **Regiao** | nome, descricao, uf, ativo |
| **RegiaoCG** | Regiões específicas de Campo Grande |

---

## 4. Fluxos Principais

### 4.1 Cadastro de Família (Formulário em 6 Etapas)

```
Etapa 1: Perfil Pessoal      → CPF, Nome, Nascimento, Contato, Educação
Etapa 2: Ocupação e Renda    → Renda, Situação Ocupacional, Saúde, Benefícios
Etapa 3: Benefícios/Patrimônio → Visualização de benefícios e patrimônios
Etapa 4: Documentos           → Check + Upload de documentos obrigatórios e específicos
Etapa 5: Endereço             → CEP (auto-preenchimento ViaCEP + coords Nominatim)
Etapa 6: Grupo Familiar       → Membros com perfil, saúde, educação e renda
```

### 4.2 Ciclo de Visita de Campo

```
Agendamento → Registro da Visita → Avaliação de Vulnerabilidade
     ↓                                    ↓
Prioridade calculada              Atualização automática
(Pontuação de vulnerabilidade)     do status da família
```

### 4.3 Fluxo de Contemplação (Workflow de Aprovação)

```
Rascunho → Pendente Aprovação → Parecer Técnico → Decisão do Gestor
                                         ↓                ↓
                                    Aprovado          Reprovado
                                         ↓
                                    Pagamento (Cartão/PIX)
```

### 4.4 Ciclo de Cartão

```
Emissão → Entrega → Liberação → Pagamentos → (Bloqueio ⇄ Desbloqueio)
   ↓          ↓
2ª Via    Renovação
```

### 4.5 Ciclo de PIX

```
Geração do Lote → Envio do Lote → Retorno do Lote
                                        ↓
                              (Bloqueio ⇄ Desbloqueio)
```

---

## 5. Integrações Externas

| Integração | Uso |
|------------|-----|
| **ViaCEP** | Consulta de endereço por CEP (preenchimento automático no formulário) |
| **Nominatim (OSM)** | Geocodificação reversa do CEP → coordenadas latitude/longitude |
| **Supabase** | Banco externo para consultas e armazenamento complementar |
| **WhatsApp (função)** | Envio de notificações via backend function |

---

## 6. Segurança e Auditoria

### 6.1 Autenticação

- Base44 Auth com JWT tokens
- Roles: `admin` (acesso total) e `user` (restrito)
- Convite de usuários via `base44.users.inviteUser()`

### 6.2 Auditoria

Todas as operações de criação, edição e exclusão são registradas na entidade `AuditoriaLog` com:

- Usuário (email e nome)
- Tipo de ação (Criação/Edição/Exclusão/Visualização/Login/Exportação)
- Módulo afetado
- Entidade e ID do registro
- Dados anteriores e novos (JSON)
- Endereço IP
- Data/hora precisa

### 6.3 Privacidade

- Aplicação privada: apenas usuários convidados por admin têm acesso
- Registro de auditoria imutável para conformidade LGPD

---

## 7. Estrutura do Projeto

```
src/
├── api/
│   └── base44Client.js          # SDK Base44 pré-inicializado
├── components/
│   ├── ui/                      # shadcn/ui (button, input, select, dialog, etc.)
│   ├── familias/                # FamiliaModal, FamiliaTabela, FamiliaFiltros, etc.
│   ├── visitas/                 # AgendamentoCalendario, AgendamentoForm, UploadFotos
│   ├── dashboard/               # KPIs, Gráficos, Mapas, Atividades
│   ├── contemplacoes/           # Tabela, ModalDecisao, ModalParecer, StatusBadge
│   ├── relatorios/              # Filtros, Gráficos, Tabelas
│   ├── programas/               # ProgramaModal
│   ├── tabelas/                 # CrudStatus (reutilizável)
│   └── beneficio/               # TimelineBeneficiario
├── pages/
│   ├── Dashboard.jsx
│   ├── FamiliasCadastro.jsx
│   ├── FamiliasBuscaAtiva.jsx
│   ├── AgendaBuscaAtiva.jsx
│   ├── VisitaAgendamento.jsx
│   ├── VisitaRegistro.jsx
│   ├── FamiliasAvaliacaoVulnerabilidade.jsx
│   ├── ProgramasCadastro.jsx
│   ├── ProgramasContemplacoes.jsx
│   ├── ProgramasAlteracaoBeneficio.jsx
│   ├── ProgramasHistorico.jsx
│   ├── ProgramasImportar.jsx
│   ├── RelatorioAlteracaoBeneficio.jsx
│   ├── CartoesEmissao.jsx (e demais Cartoes*)
│   ├── PixGeracaoLote.jsx (e demais Pix*)
│   ├── Relatorios.jsx
│   ├── PainelDimensional.jsx
│   ├── TabelasCalendario.jsx
│   ├── TabelasStatus*.jsx
│   ├── TabelasMunicipios.jsx
│   ├── TabelasRegioes.jsx
│   ├── TabelasRegioesCG.jsx
│   ├── DicionarioDados.jsx
│   ├── AuditoriaLog.jsx
│   ├── ConfigUsuarios.jsx
│   ├── ConfigAgentesCampo.jsx
│   └── ConfigSupabase.jsx
├── entities/                    # Schemas JSON de todas as entidades
├── functions/                   # Backend functions (Deno)
├── lib/
│   ├── AuthContext.jsx          # Provedor de autenticação
│   ├── utils.js                 # Utilitários
│   └── query-client.js          # React Query config
├── utils/
│   └── auditoria.js             # Helper para registro de auditoria
├── App.jsx                      # Router principal
├── index.css                    # Design tokens (Tailwind)
└── tailwind.config.js           # Configuração Tailwind
```

---

## 8. Design System

### 8.1 Cores

| Token | Uso |
|-------|-----|
| `slate-900` | Sidebar |
| `sky-600` | Links ativos, botões primários, ações |
| `emerald-600` | Status positivos, créditos, concluído |
| `red-500` | Status negativos, débitos, exclusão |
| `violet-600` | Seções secundárias |
| `amber-600` | Alertas, avisos |
| `white` / `slate-100` | Backgrounds |

### 8.2 Componentes

- **shadcn/ui**: Button, Input, Select, Dialog, Textarea, Badge, Card, Table, Tabs, Calendar, Accordion, Progress
- **Ícones**: Lucide React (exclusivamente)
- **Fontes**: Inter (Google Fonts)

---

## 9. Funcionalidades Específicas

### 9.1 Auto-preenchimento de Endereço por CEP

Ao digitar o CEP no formulário de cadastro (Etapa 5), o sistema:
1. Consulta a API ViaCEP (`viacep.com.br/ws/{cep}/json/`)
2. Preenche automaticamente: logradouro, bairro, cidade, estado
3. Consulta o Nominatim (OpenStreetMap) para obter coordenadas geográficas do CEP
4. Preenche latitude e longitude automaticamente (editáveis)

### 9.2 Avaliação de Vulnerabilidade

Sistema de pontuação que classifica famílias por nível de vulnerabilidade:
- **Critérios**: faixa etária, condições de saúde, deficiências, situação de moradia, segurança alimentar
- **Classificação**: Extrema, Alta, Média, Baixa
- **Impacto**: define a prioridade das visitas de campo

### 9.3 Painel Dimensional (Pivot Table)

Ferramenta de análise dinâmica que permite:
- Selecionar dimensões (linhas e colunas) dos campos da família
- Selecionar medidas para agregação (contagem, soma)
- Filtrar por período
- Exportar resultado em CSV

### 9.4 Calendário de Pagamentos

Controle financeiro com:
- Lançamentos de crédito (+) e débito (-) por data
- KPIs mensais: total crédito, total débito, saldo disponível
- Visualização em calendário com totais diários
- CRUD completo direto no calendário

### 9.5 Dicionário de Dados

Documentação viva do modelo de dados:
- Listagem de todas as entidades com descrição e módulo
- Campos com tipo, descrição e obrigatoriedade
- Filtro por módulo e busca textual

---

## 10. Backend Functions

| Função | Tipo | Descrição |
|--------|------|-----------|
| `enviarWhatsapp` | Integração | Envio de notificações via WhatsApp |
| `lembreteVisitas` | Agendada | Lembretes automáticos de visitas |
| `supabaseQuery` | Utilidade | Consultas ao banco Supabase |
| `supabaseSetup` | Admin | Configuração de tabelas Supabase |
| `supabaseStatus` | Admin | Verificação de status do Supabase |

---

## 11. Considerações Técnicas

### 11.1 Performance

- React Query para cache e estado de servidor
- Paginação em listagens grandes
- Componentes lazy-loaded via React Router
- Imagens e documentos armazenados via Base44 UploadFile (URLs)

### 11.2 Responsividade

- Layout adaptativo: grid columns de 1 a 3 colunas conforme viewport
- Sidebar colapsável em desktop, drawer em mobile
- Tabelas com scroll horizontal em dispositivos menores

### 11.3 Acessibilidade

- Componentes shadcn/ui com suporte a keyboard navigation
- Labels e descrições em todos os formulários
- Estados de loading e erro visíveis

---

## 12. Glossário

| Termo | Definição |
|-------|-----------|
| **Busca Ativa** | Processo de identificação proativa de famílias em situação de vulnerabilidade social |
| **NIS** | Número de Identificação Social |
| **Cadastro Único** | Cadastro Único para Programas Sociais do Governo Federal |
| **PBF** | Programa Bolsa Família |
| **Qualifica MS** | Programa estadual de qualificação profissional |
| **Contemplação** | Aprovação de uma família para receber benefício de um programa social |
| **Lote PIX** | Conjunto de pagamentos PIX agrupados para processamento bancário |