# Lokal - Todo App

Aplicação web MPA (Multi Page Application) focada em construir um gerenciador de tarefas com JavaScript puro, localStorage e estrutura multi-página com Webpack.

## Descrição:

Este projeto ainda está em desenvolvimento e nao está completo.

## Funcionalidades implementadas:

- Home: implementada e refinada visualmente (header, main, seção de citações e rodapé).
- Login: estrutura inicial criada (template, entry, css e módulo de página).
- Dashboard: scaffold básico presente, ainda pendente de implementação de funcionalidades.
- Funcionalidades principais de tarefas/projetos (CRUD): ainda nao finalizadas.

## Tecnologias e Conceitos

- JavaScript (ES Modules)
- Webpack 5
- HTML + CSS
- Arquitetura MPA com entradas separadas para Home, Login e Dashboard.
- Módulos de renderização no lado do cliente por página.
- Camada de persistência planejada com localStorage.

## Estrutura do projeto

(Todo)

## Build Setup

- `npm run start`: inicia o servidor de desenvolvimento com Webpack.
- `npm run build`: gera build de produção na pasta `dist`.
- `npm run deploy`: publica o subtree de `dist` na branch `gh-pages`.

## Como Executar

1. Instale as dependências:

```bash
npm install
```

2. Inicie o servidor de desenvolvimento:

```bash
npm run start
```

3. Gere a build de produção:

```bash
npm run build
```

  ## Próximos Passos

  - Conectar os botões de CTA da Home ao fluxo da página de Login.
  - Implementar a lógica de Login (formulário + validação + ponto de entrada de persistência).
  - Iniciar o conjunto de funcionalidades do Dashboard para gestão de projetos e tarefas.
  - Integrar as paginas de UI com os módulos de domínio/estado/storage em `core`.
