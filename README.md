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
npm run test:unit    # conversão de campos e normalização de erros da API
npm run api:types    # atualiza os tipos a partir do OpenAPI da API
```


## Contrato da API

O front usa `VITE_API_URL=http://localhost:8081/api`. A API publica o OpenAPI em `http://localhost:8081/api/docs/json`, valor padrão do comando `api:types`. Para usar outro servidor, execute `VITE_API_OPENAPI_URL=https://seu-servidor/api/docs/json npm run api:types`.

Os tipos de request e response são gerados com `openapi-typescript` e versionados em `src/api/generated/schema.d.ts`. Não edite o arquivo gerado manualmente. Quando o contrato da API mudar, inicie a API, execute `npm run api:types` e revise o diff antes de commitar.

O `FormattedField` mantém moeda como número em reais, CPF e telefone como dígitos e duração como minutos inteiros. Para percentual, use `percentScale={100}` quando a API espera fração de 0 a 1 e `percentScale={1}` quando espera valores de 0 a 100.

O arquivo `.env` é local e não deve ser commitado. O arquivo `.env.example` lista as variáveis públicas necessárias. As variáveis `VITE_` são expostas no navegador; nunca coloque segredos nelas.

## Estado da integração

As páginas de clínicas, procedimentos, perfil, configurações, precificação e comparação ainda incluem dados simulados. Elas serão ligadas à API nos milestones M1 a M4. O build da M0 não comprova esses fluxos de ponta a ponta.
