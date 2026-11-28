# Documento Oficial de Dependências do Back-end — Projeto Soberana

> **Data de Atualização**: 27/11/2026  
> **Status do Frontend**: 100% implementado, testado e validado para os fluxos independentes.  
> **Objetivo**: Este documento descreve as **17 issues do projeto** que dependem de endpoints, contratos ou regras a serem entregues pela equipe responsável pelo servidor (`chatbot-soberana-server`), especificando contratos esperados, payloads, códigos HTTP e procedimentos de validação de ponta a ponta.

---

## Índice das Issues Mapeadas

1. [Issue #172 — Upload de foto de perfil](#1-issue-172--upload-de-foto-de-perfil)
2. [Issue #173 — Unificação de rotas de dados do usuário](#2-issue-173--unificao-de-rotas-de-dados-do-usurio)
3. [Issue #24 — Gestão de sessão por cookies e refresh token](#3-issue-24--gesto-de-sesso-por-cookies-e-refresh-token)
4. [Issue #27 — Finalização de cadastro social](#4-issue-27--finalizao-de-cadastro-social)
5. [Issue #36 — Listagem e histórico de precificações](#5-issue-36--listagem-e-histrico-de-precificaes)
6. [Issue #37 — Criação de rascunho de precificação](#6-issue-37--criao-de-rascunho-de-precificao)
7. [Issue #39 — Atualização de parâmetros da precificação](#7-issue-39--atualizao-de-parmetros-da-precificao)
8. [Issue #42 — Retomada e edição de rascunho](#8-issue-42--retomada-e-edio-de-rascunho)
9. [Issue #43 — Processamento financeiro e matemático no back-end](#9-issue-43--processamento-financeiro-e-matemtico-no-back-end)
10. [Issue #44 — Geração de sugestões via Inteligência Artificial](#10-issue-44--gerao-de-sugestes-via-inteligncia-artificial)
11. [Issue #45 — Finalização de precificação](#11-issue-45--finalizao-de-precificao)
12. [Issue #47 — Versionamento e resolução de conflitos concorrentes](#12-issue-47--versionamento-e-resoluo-de-conflitos-concorrentes)
13. [Issue #54 — Streaming da conversa via Server-Sent Events (SSE)](#13-issue-54--streaming-da-conversa-via-server-sent-events-sse)
14. [Issue #55 — Seletor de precificações para comparação cruzada](#14-issue-55--seletor-de-precificaes-para-comparao-cruzada)
15. [Issue #56 — Comparação textual e tabular de duas precificações](#15-issue-56--comparao-textual-e-tabular-de-duas-precificaes)
16. [Issue #57 — Gráficos analíticos comparativos de custos e lucros](#16-issue-57--grficos-analticos-comparativos-de-custos-e-lucros)
17. [Issue #58 — Geração e download do relatório PDF](#17-issue-58--gerao-e-download-do-relatrio-pdf)

---

### 1. Issue #172 — Upload de foto de perfil
- **Milestone**: `08 — EP8: Correções e Ajustes`
- **Funcionalidade Ausente**: Endpoint para envio de arquivo de imagem (avatar) associado ao usuário autenticado.
- **Endpoint Esperado**: `POST /profile/avatar` ou `PATCH /auth/me/avatar` (`multipart/form-data`).
- **Entrada (Request)**:
  - Header: `Authorization: Bearer <token>`
  - Body: `file` (imagem JPEG, PNG ou WebP, máx 2MB).
- **Saída Esperada (Response 200)**:
  ```json
  {
    "status": true,
    "message": "Avatar atualizado com sucesso",
    "data": {
      "avatarUrl": "https://cdn.soberana.com/avatars/user-123.jpg"
    }
  }
  ```
- **Critérios de Aceite**:
  - Validar tipo MIME e tamanho máximo.
  - Armazenar arquivo em storage persistente.
  - Retornar URL pública segura para renderização no frontend (`AvatarUpload.tsx`).
- **Validação no Frontend**:
  - Na página `ProfilePage`, selecionar imagem no componente `AvatarUpload`.
  - Confirmar upload e exibição imediata da foto com notificação via Toast.

---

### 2. Issue #173 — Unificação de rotas de dados do usuário
- **Milestone**: `08 — EP8: Correções e Ajustes`
- **Funcionalidade Ausente**: Rota RESTful consolidada de dados de perfil ou alinhamento com `GET /auth/me`.
- **Endpoint Esperado**: `GET /profile` ou inclusão dos dados de perfil e configurações completas em `GET /auth/me`.
- **Entrada**: Header `Authorization: Bearer <token>`.
- **Saída Esperada (Response 200)**:
  ```json
  {
    "status": true,
    "data": {
      "id": "usr-123",
      "name": "Dra. Ana Silva",
      "email": "ana@soberana.com",
      "phone": "11999998888",
      "specialty": "Ortodontia",
      "avatarUrl": "https://...",
      "settings": {
        "currency": "BRL",
        "profitMargin": 30.0,
        "taxRate": 15.0,
        "cardFee": 2.5,
        "averageServiceTime": 60
      }
    }
  }
  ```
- **Validação no Frontend**:
  - Acessar `ProfilePage` e verificar carregamento sem fallbacks mockados em `useProfile`.

---

### 3. Issue #24 — Gestão de sessão por cookies e refresh token
- **Milestone**: `10 — M1: Auth e cadastros`
- **Funcionalidade Ausente**: Renovação silenciosa de token via refresh token em cookies HTTP-only.
- **Endpoint Esperado**: `POST /auth/refresh`.
- **Entrada**: Cookie seguro `refreshToken` enviado automaticamente pelo navegador (`withCredentials: true`).
- **Saída Esperada (Response 200)**:
  ```json
  {
    "status": true,
    "data": {
      "token": "eyJhbGciOi...",
      "expiresIn": 3600
    }
  }
  ```
- **Comportamento Esperado**:
  - Emissão de cookie `Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict`.
  - Em resposta 401 de endpoints protegidos, interceptor do Axios tenta renovar uma única vez antes de redirecionar para `/login`.
- **Validação no Frontend**:
  - Expirar propositalmente o access token no `localStorage` e verificar renovação automática sem desconectar o usuário.

---

### 4. Issue #27 — Finalização de cadastro social
- **Milestone**: `10 — M1: Auth e cadastros`
- **Funcionalidade Ausente**: Suporte a OAuth para Google e GitHub e endpoint de complementação de cadastro.
- **Endpoints Esperados**: `GET /auth/google`, `GET /auth/github`, `POST /auth/social/complete`.
- **Entrada no Complete**:
  ```json
  {
    "socialToken": "oauth-temp-token",
    "userType": "professional",
    "phone": "11999998888",
    "cpf": "12345678901",
    "termsAccepted": true,
    "privacyPolicyAccepted": true
  }
  ```
- **Validação no Frontend**:
  - Clicar nos botões sociais em `SocialLoginButtons` e concluir o redirecionamento OAuth.

---

### 5. Issue #36 — Listagem e histórico de precificações
- **Milestone**: `11 — M2: Precificação`
- **Funcionalidade Ausente**: Endpoint para listar precificações persistidas com filtros e paginação.
- **Endpoint Esperado**: `GET /pricing?clinicId=&procedureId=&page=1&limit=10`.
- **Saída Esperada (Response 200)**:
  ```json
  {
    "status": true,
    "data": {
      "items": [
        {
          "id": "prc-101",
          "clinicId": "cln-1",
          "clinicName": "Clínica Centro",
          "procedureId": "prc-1",
          "procedureName": "Limpeza",
          "finalPrice": 250.0,
          "status": "completed",
          "createdAt": "2026-11-20T14:30:00Z"
        }
      ],
      "pagination": {
        "page": 1,
        "totalPages": 3,
        "totalItems": 28
      }
    }
  }
  ```
- **Validação no Frontend**:
  - Navegar até `/historico`, filtrar por clínica e procedimento e navegar entre páginas.

---

### 6. Issue #37 — Criação de rascunho de precificação
- **Milestone**: `11 — M2: Precificação`
- **Funcionalidade Ausente**: Endpoint para registrar uma precificação em estado de rascunho ao selecionar clínica e procedimento.
- **Endpoint Esperado**: `POST /pricing`.
- **Entrada (Request Body)**:
  ```json
  {
    "clinicId": "uuid-da-clinica",
    "procedureId": "uuid-do-procedimento",
    "status": "draft"
  }
  ```
- **Saída Esperada (Response 201)**:
  ```json
  {
    "status": true,
    "data": {
      "id": "prc-novo-id",
      "clinicId": "uuid-da-clinica",
      "procedureId": "uuid-do-procedimento",
      "status": "draft",
      "createdAt": "2026-11-27T20:00:00Z"
    }
  }
  ```
- **Validação no Frontend**:
  - No `PricingWizard`, selecionar clínica e procedimento e confirmar persistência do ID.

---

### 7. Issue #39 — Atualização de parâmetros da precificação
- **Milestone**: `11 — M2: Precificação`
- **Funcionalidade Ausente**: Rota para atualizar parâmetros operacionais ou itens de custo adicionados manualmente.
- **Endpoint Esperado**: `PATCH /pricing/:id`.
- **Entrada (Request Body)**:
  ```json
  {
    "materialCost": 85.50,
    "fixedCosts": 40.00,
    "commission": 10.0,
    "taxes": 15.0,
    "margin": 30.0
  }
  ```
- **Saída Esperada (Response 200)**: Dados parciais atualizados e status 200.
- **Validação no Frontend**:
  - Adicionar itens no modal `AdicionarItem` ou no `ManualPricingForm` e verificar atualização sem perdas.

---

### 8. Issue #42 — Retomada e edição de rascunho
- **Milestone**: `11 — M2: Precificação`
- **Funcionalidade Ausente**: Rota para consultar estado completo de precificação inacabada.
- **Endpoint Esperado**: `GET /pricing/:id`.
- **Saída Esperada (Response 200)**: Retornar todos os custos, mensagens trocadas no chat e status atual (`draft` ou `completed`).
- **Validação no Frontend**:
  - Clicar em "Continuar rascunho" e verificar preenchimento automático das etapas 1, 2 e 3.

---

### 9. Issue #43 — Processamento financeiro e matemático no back-end
- **Milestone**: `11 — M2: Precificação`
- **Funcionalidade Ausente**: Rota de cálculo oficial das regras de negócio (markup, incidências, custo/hora da clínica).
- **Endpoint Esperado**: `POST /pricing/:id/calculate`.
- **Saída Esperada (Response 200)**:
  ```json
  {
    "status": true,
    "data": {
      "clinicCosts": 120.0,
      "procedureCost": 50.0,
      "taxIncidences": 35.5,
      "profit": 95.0,
      "result": 300.5,
      "directCost": 170.0,
      "correctedCost": 205.5,
      "finalPrice": 395.5
    }
  }
  ```
- **Validação no Frontend**:
  - Verificar se a tela de Resultado exibe os números calculados pelo servidor em conformidade com o DTO.

---

### 10. Issue #44 — Geração de sugestões via Inteligência Artificial
- **Milestone**: `11 — M2: Precificação`
- **Funcionalidade Ausente**: Rota de integração com LLM para extração de componentes de custo a partir de texto livre.
- **Endpoint Esperado**: `POST /pricing/:id/chat`.
- **Entrada**: `{ "message": "Gastei 2 ampolas de anestésico e 1 par de luvas cirúrgicas" }`.
- **Saída Esperada**:
  ```json
  {
    "status": true,
    "data": {
      "reply": "Entendido. Extraí 2 itens de material para o cálculo.",
      "extractedItems": [
        { "id": "ext-1", "label": "Anestésico (2 ampolas)", "value": 30.0, "unit": "R$" },
        { "id": "ext-2", "label": "Luvas cirúrgicas", "value": 8.0, "unit": "R$" }
      ]
    }
  }
  ```
- **Validação no Frontend**:
  - O componente `ExtractedDataConfirmation.tsx` exibe os itens retornados pela IA com badges de sugestão.

---

### 11. Issue #45 — Finalização de precificação
- **Milestone**: `11 — M2: Precificação`
- **Funcionalidade Ausente**: Rota para congelar a precificação, impedindo alterações posteriores e registrando no histórico.
- **Endpoint Esperado**: `POST /pricing/:id/finish`.
- **Saída Esperada**: `{ "status": true, "message": "Precificação finalizada com sucesso" }`.
- **Validação no Frontend**:
  - Clicar em "Finalizar" no `PricingResult` e verificar redirecionamento para o dashboard com toast de sucesso.

---

### 12. Issue #47 — Versionamento e resolução de conflitos concorrentes
- **Milestone**: `11 — M2: Precificação`
- **Funcionalidade Ausente**: Controle otimista de concorrência com cabeçalho `ETag` ou campo `version`.
- **Comportamento Esperado**:
  - Ao atualizar uma precificação, se o cliente enviar uma versão defasada, o servidor responde com código **`HTTP 409 Conflict`**.
  - O frontend já está configurado em `src/services/api.ts` para normalizar o erro 409 com a mensagem amigável: *"Conflito de versão detectado. Os dados foram alterados em outra sessão."*.
- **Validação no Frontend**:
  - Simular alteração simultânea em duas abas e verificar apresentação do aviso de conflito sem perda de integridade.

---

### 13. Issue #54 — Streaming da conversa via Server-Sent Events (SSE)
- **Milestone**: `12 — M3: IA e conversa`
- **Funcionalidade Ausente**: Conexão persistente unidirecional para recebimento em tempo real dos tokens da resposta da IA.
- **Endpoint Esperado**: `GET /pricing/:id/stream` (`Content-Type: text/event-stream`).
- **Formato dos Eventos**:
  ```
  event: token
  data: {"token": "Olá! "}

  event: token
  data: {"token": "Vamos "}

  event: complete
  data: {"status": "done"}
  ```
- **Validação no Frontend**:
  - O chat deve renderizar a resposta progressivamente sem bloqueio de interface.

---

### 14. Issue #55 — Seletor de precificações para comparação cruzada
- **Milestone**: `13 — M4: Comparação e fechamento`
- **Funcionalidade Ausente**: Endpoint para buscar e parear dois IDs de precificação distintos.
- **Endpoint Esperado**: `GET /pricing/compare?firstId=...&secondId=...`.
- **Validação no Frontend**:
  - Selecionar duas precificações em `ComparisonSelector` e renderizar comparativo em tela.

---

### 15. Issue #56 — Comparação textual e tabular de duas precificações
- **Milestone**: `13 — M4: Comparação e fechamento`
- **Funcionalidade Ausente**: Resumo consolidado de divergências absolutas e relativas entre precificações no servidor.
- **Validação no Frontend**:
  - O componente `ComparisonTable.tsx` renderiza a tabela de diferenças linha a linha.

---

### 16. Issue #57 — Gráficos analíticos comparativos de custos e lucros
- **Milestone**: `13 — M4: Comparação e fechamento`
- **Funcionalidade Ausente**: Estrutura de agregação de custos diretos, custos corrigidos e margens das precificações selecionadas.
- **Validação no Frontend**:
  - O componente `ComparisonCharts.tsx` plota os gráficos comparativos com Recharts.

---

### 17. Issue #58 — Geração e download do relatório PDF
- **Milestone**: `13 — M4: Comparação e fechamento`
- **Funcionalidade Ausente**: Endpoint gerador de documento binário PDF com cabeçalho, detalhamento e resumo da precificação.
- **Endpoint Esperado**: `GET /pricing/:id/pdf`.
- **Headers**:
  - `Content-Type: application/pdf`
  - `Content-Disposition: attachment; filename="precificacao-<id>.pdf"`
- **Tratamento de Erros**:
  - Caso o servidor falhe ou retorne erro, o componente `ExportPDFButton.tsx` (testado em `tests/ExportPDFButton.test.tsx`) já trata a indisponibilidade exibindo notificação de erro sem travar a aplicação.
- **Validação no Frontend**:
  - Clicar em "Exportar PDF" e confirmar download do arquivo no navegador.
