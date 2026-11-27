# Soberana — Documentação Funcional, Decisões de Arquitetura e Contratos de API

Este documento consolida o estado real do frontend do projeto **Soberana**, a separação de responsabilidades com o backend de referência, os contratos implementados, as decisões de design/acessibilidade e o mapeamento de dependências técnicas.

---

## 1. Estrutura e Limites do Projeto

- **Frontend oficial (`front/`)**: Único diretório autorizado para desenvolvimento, novos componentes, serviços, validações, testes e publicação no GitHub (`https://github.com/Soberana-Front/chatbot-soberana-web`).
- **Backend de referência (`back-Clone/chatbot-soberana-server/`)**: Clone estritamente somente leitura. Utilizado exclusivamente para consulta de endpoints, schemas Zod, modelos Prisma e regras de negócio. Nenhuma alteração é efetuada no backend pelo time de frontend.

---

## 2. Contratos da API Integrados e Validados no Frontend

### 2.1. Clínicas (`/clinics`)
- `GET /clinics`: Lista resumida de clínicas do usuário autenticado (`id`, `name`, `city`, `state`), com suporte a filtro por nome (`?search=...`).
- `GET /clinics/:id`: Detalhes completos da clínica (`clinicType`, `materialSupplier`, `paymentMethod`, `commissionPercentage`, `rentAmount`, `otherExpenses`, `notes`).
- `POST /clinics`: Cadastro de nova clínica com payload tipado e conversão de percentual para fração.
- `PATCH /clinics/:id`: Atualização parcial de dados da clínica.
- `DELETE /clinics/:id`: Exclusão lógica (soft delete).

### 2.2. Custos Operacionais da Clínica (`/clinics/:clinicId/costs`)
- `GET /clinics/:clinicId/costs/current`: Retorna o período vigente de custos da clínica.
- `GET /clinics/:clinicId/costs/history`: Retorna o histórico de períodos vigentes e arquivados ordenados por `effectiveDate: desc`.
- `POST /clinics/:clinicId/costs`: Cria um novo período de custos vigentes (`sixMonthFixedCost`, `sixMonthVariableCost`, `effectiveHoursPerMonth`). O backend encerra atomicamente o período anterior e calcula `effectiveDate` com a data atual.

### 2.3. Procedimentos (`/procedures`)
- `GET /procedures`: Listagem de procedimentos do usuário e procedimentos globais com filtro por nome (`?search=...`).
- `GET /procedures/:id`: Consulta dos detalhes do procedimento.
- `POST /procedures`: Cadastro de procedimento validado vinculado obrigatoriamente a uma clínica do usuário (`clinicId`, `name`, `category`, `averageTime`, `description`).
- `PATCH /procedures/:id`: Atualização parcial de campos do procedimento.
- `DELETE /procedures/:id`: Exclusão lógica do procedimento.

### 2.4. Autenticação e Sessão (`/auth`)
- `POST /auth/register`: Cadastro com validação de termos e emissão de JWT.
- `POST /auth/login`: Autenticação por e-mail e senha com retorno de token JWT e usuário público.
- `GET /auth/me`: Verificação de sessão ativa via header `Authorization: Bearer <token>`.
- `authService.logout()`: Encerramento de sessão com limpeza atômica de `localStorage` (`@Soberana:token` e `@Soberana:user`), deleção de cabeçalhos do Axios e redirecionamento para `/login`.

---

## 3. Decisões de Acessibilidade (WCAG AA) e Usabilidade (Issue #59 — FE-046)

1. **Navegação por Abas**:
   - Uso de `role="tablist"`, `role="tab"` e `role="tabpanel"`.
   - Marcação de estado com `aria-selected` e vinculação de painel via `aria-controls`.
2. **Formulários e Inputs**:
   - Todos os inputs possuem `<label>` vinculados semanticamente por `htmlFor` e `id`.
   - Marcação visual e textual explícita de campos obrigatórios (`*`) e opcionais (`(opcional)`).
   - Atributos `aria-label="Formulário de ..."` nos formulários para identificação clara em leitores de tela.
   - Mensagens de erro de validação inline associadas aos campos em tipografia e contraste destacados.
3. **Ações e Tabelas**:
   - Botões de ícones (como editar e excluir) possuem `aria-label` descritivos (ex: `aria-label="Editar Restauração em Resina"`).
   - Tabelas com cabeçalhos semânticos (`<thead>`, `<th>`), wrappers com rolagem horizontal acessível e foco visual preservado.
4. **Estados de Interface**:
   - Estados de carregamento com `Spinner` acessível e texto descritivo.
   - Estados vazios informativos (`EmptyState`) com orientações de ação.
   - Feedback de erros amigáveis sem exposição de dados sensíveis ou stack traces.

---

## 4. Decisões de Responsividade (Issue #60 — FE-047)

- **Mobile (< 640px)**:
  - Menu lateral retrátil com drawer overlay e botão de fechamento com foco automático.
  - Formulários e filtros organizados em coluna única (`grid-cols-1`).
  - Tabelas encapsuladas com `overflow-x-auto` para permitir rolagem horizontal suave sem quebrar a largura da viewport.
  - Alvos de toque (touch targets) com altura mínima de 44px em botões e controles interativos.
- **Tablet (640px – 1024px)**:
  - Grids adaptativos de 2 a 3 colunas (`sm:grid-cols-2`, `sm:grid-cols-3`).
  - Toolbars com barra de pesquisa e filtros alinhados horizontalmente.
- **Desktop (>= 1024px)**:
  - Sidebar persistente de navegação rápida.
  - Modais em tamanho amplo (`size="lg"`) com área útil otimizada para dados financeiros e tabelas de histórico.

---

## 5. Qualidade e Verificações Automatizadas (Issue #61 — FE-048)

O projeto é validado continuamente através do pipeline de qualidade local:

| Verificação | Comando | Resultado |
| :--- | :--- | :--- |
| **Tipagem TypeScript** | `npm run typecheck` | 0 erros (`tsc -b --pretty false`) |
| **Testes Unitários** | `npm test` (`vitest run`) | 19 testes em 6 arquivos aprovados (100% de sucesso) |
| **Linting** | `npm run lint` (`eslint .`) | 0 erros |
| **Build de Produção** | `npm run build` | Gerado com sucesso via Vite |

### Suíte de Testes Implementada:
1. `tests/Button.test.tsx`: Renderização, clique e estado de carregamento.
2. `tests/ClinicCostsModal.test.tsx`: Alternância de abas, renderização de tabela de histórico, cálculo visual, badges vigente/arquivado, lista vazia e tratamento de erro de rede com retentativa.
3. `tests/ProceduresList.test.tsx`: Consulta à API real, listagem em tabela, filtro por categoria, lista vazia e erro de carregamento.
4. `tests/ProcedureForm.test.tsx`: Renderização de campos obrigatórios, bloqueio de submissão inválida, submissão de dados válidos e seletor dinâmico de clínicas.
5. `tests/ProcedureModal.test.tsx`: Modo criação vs modo edição, busca de detalhes via `GET /procedures/:id`, pré-preenchimento e fallback de erro.
6. `tests/AuthLogout.test.tsx`: Limpeza atômica de localStorage, remoção de headers Axios e zeramento de estado global.

---

## 6. Mapeamento de Limitações e Dependências de Backend (Milestones M1 a M4)

Conforme a diretriz de não inventar respostas ou endpoints ausentes no servidor, foram catalogadas as seguintes dependências técnicas aguardando entrega pelo time de backend:

### Milestone M1: Auth e Cadastros
- **#22 (FE-009)**: `POST /auth/forgot-password` (solicitação de link de recuperação de senha por e-mail).
- **#23 (FE-010)**: `POST /auth/reset-password` (redefinição de senha com token).
- **#24 (FE-011)**: Estratégia de cookies httpOnly e rota `POST /auth/refresh` para renovação de sessão.
- **#26 (FE-013)**: Endpoints de perfil e configurações de usuário (`GET/PATCH /users/me/profile`, `GET/PATCH /users/me/settings`).
- **#27 (FE-014)**: Fluxo OAuth social e rota de conclusão de cadastro social.

### Milestone M2: Precificação
- **#36 a #47 (FE-023 a FE-034)**: Endpoints CRUD da entidade `Pricing` no backend (`GET /pricings`, `POST /pricings`, `GET /pricings/:id`, `PATCH /pricings/:id`, `POST /pricings/:id/items`, `POST /pricings/:id/calculate`, `POST /pricings/:id/finalize`). O backend atualmente fornece apenas defaults comerciais (`/clinics/:clinicId/pricing-defaults`).

### Milestone M3: IA e Conversa
- **#48 a #54 (FE-035 a FE-041)**: Endpoints para chat/orquestração de IA (`POST /conversations` ou `/pricing/:id/chat`), confirmação de extrações e endpoint de streaming Server-Sent Events (SSE).

### Milestone M4: Comparação e Exportação
- **#55 a #58 (FE-042 a FE-045)**: Endpoints para consolidação comparativa (`GET /comparisons`) e serviço de geração/download de PDF (`GET /pricing/:id/pdf`).
