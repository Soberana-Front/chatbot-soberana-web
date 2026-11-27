# Soberana — Front-end

Front-end da aplicação de precificação de procedimentos odontológicos, desenvolvida em parceria pela Codi Academy e pela Faculdade Soberana.

## Requisitos

- Node.js 24 ou superior
- npm 10 ou superior
- API Soberana em execução em `http://localhost:8081` para integrações reais

## Executar localmente

```bash
cp .env.example .env
npm ci
npm run dev
```

## Comandos

```bash
npm run dev          # ambiente de desenvolvimento
npm run typecheck    # checagem TypeScript
npm run build        # checagem TypeScript e build de produção
npm run test         # executa suíte completa de testes com Vitest
npm run lint         # análise estática com ESLint
npm run api:types    # atualiza os tipos a partir do OpenAPI da API
```

## Contrato da API

O front usa `VITE_API_URL=http://localhost:8081/api`. A API publica o OpenAPI em `http://localhost:8081/api/docs/json`, valor padrão do comando `api:types`. Para usar outro servidor, execute `VITE_API_OPENAPI_URL=https://seu-servidor/api/docs/json npm run api:types`.

Os tipos de request e response são gerados com `openapi-typescript` e versionados em `src/api/generated/schema.d.ts`. Não edite o arquivo gerado manualmente. Quando o contrato da API mudar, inicie a API, execute `npm run api:types` e revise o diff antes de commitar.

O `FormattedField` mantém moeda como número em reais, CPF e telefone como dígitos e duração como minutos inteiros. Para percentual, use `percentScale={100}` quando a API espera fração de 0 a 1 e `percentScale={1}` quando espera valores de 0 a 100.

O arquivo `.env` é local e não deve ser commitado. O arquivo `.env.example` lista as variáveis públicas necessárias. As variáveis `VITE_` são expostas no navegador; nunca coloque segredos nelas.

## Estado da integração

### Módulos Concluídos e Integrados à API Real:
- **Clínicas (`/clinics`)**: Listagem com busca, cadastro de clínicas, detalhes e edição parcial via `PATCH`, e exclusão lógica (Issues #28, #29, #30).
- **Custos da Clínica (`/clinics/:clinicId/costs`)**: Consulta de custo vigente, registro de novo período semestral e histórico completo de períodos vigentes e arquivados (Issues #31, #32).
- **Procedimentos (`/procedures`)**: Listagem integrada com busca e filtros, cadastro de procedimento vinculado a clínica do usuário, consulta de detalhes e edição parcial (Issues #33, #34, #35).
- **Autenticação e Sessão**: Login, registro, validação de token `/auth/me` e logout seguro com limpeza completa de estado e headers (Issue #25).

### Dependências Técnicas de Backend Documentadas:
- **M1 (Auth e cadastros)**: Recuperação e redefinição de senha (`/auth/forgot-password`, `/auth/reset-password`), sessão com cookies/refresh e perfil/configurações de usuário aguardam rotas dedicadas no backend.
- **M2 (Precificação)**: Endpoints `/pricings` (CRUD, itens de custo, cálculo e finalização) pendentes no backend.
- **M3 (IA e conversa)**: Endpoints `/conversations` e streaming SSE pendentes no backend.
- **M4 (Comparação e fechamento)**: Endpoints `/comparisons` e geração de PDF pendentes no backend.

Para detalhes completos de arquitetura, acessibilidade (WCAG AA), responsividade e contratos, consulte [docs/DECISOES_ARQUITETURA_E_CONTRATOS.md](docs/DECISOES_ARQUITETURA_E_CONTRATOS.md).

## Estrutura dos componentes

Os componentes estão organizados por responsabilidade:

- `src/components/ui/`: componentes genéricos e reutilizáveis, como Button, Input, Modal, Card e Select.
- `src/components/domain/`: componentes específicos do domínio, agrupados por área:
  - `auth/`: autenticação e seleção do tipo de usuário.
  - `clinics/`: formulários, modais e tabelas de clínicas.
  - `history/`: cartões e filtros do histórico.
  - `procedures/`: formulários, modais, tabelas e filtros de procedimentos.
  - `profile/`: formulário de perfil e envio de avatar.
- `src/components/dashboard/`: componentes específicos do painel.
- `src/components/forms/`: seções e campos de formulários.
- `src/components/layout/`: layouts e elementos de navegação.
- `src/components/shared/`: componentes compartilhados entre áreas.

Mantenha componentes genéricos em `ui/` e componentes vinculados a uma funcionalidade específica em `domain/`, dentro da respectiva área.
