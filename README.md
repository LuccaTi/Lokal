# Lokal - Todo App

Aplicação web MPA (Multi Page Application) para gerenciamento de tarefas, construída com JavaScript puro, Webpack e persistência local no navegador (localStorage).

## Visão geral

O Lokal é um app de organização pessoal com autenticação, dashboard responsivo e fluxo completo de tarefas e projetos. A interface foi pensada para funcionar bem em desktop e mobile, com foco em navegação clara, overlays e estados vazios bem definidos.

## Funcionalidades

- Home com hero, seções de destaque e navegação para o fluxo principal.
- Login e signup com validação, sessão do usuário e armazenamento local.
- Dashboard com views de Hoje, Em breve, Histórico e Projetos.
- Criação, edição, exclusão e conclusão de tarefas.
- Criação e gerenciamento de projetos.
- Overlays para calendário, seleção de projeto e ações de confirmação.
- Interface responsiva com comportamento adaptado para desktop e mobile.

## Tecnologias

- JavaScript (ES Modules)
- HTML e CSS
- Webpack 5
- localStorage para persistência de dados
- sessionStorage para sessão autenticada
- bcryptjs para hash de senha

## Estrutura do projeto

- `src/pages/home`: página inicial da aplicação.
- `src/pages/login`: fluxo de login.
- `src/pages/signup`: fluxo de cadastro.
- `src/pages/dashboard`: interface principal do app.
- `src/core`: domínio, estado e camada de storage.
- `src/shared`: utilitários e componentes reutilizáveis.

## Build Setup

- `npm run build`: gera a build de produção na pasta `dist`.
- `npm run start`: inicia o servidor de desenvolvimento com Webpack.

## Como executar

1. Instale as dependências:

```bash
npm install
```

2. Gere a build de produção:

```bash
npm run build
```

3. Inicie o servidor de desenvolvimento:

```bash
npm run start
```

## Créditos

Todos os ícones utilizados no projeto foram obtidos em https://www.svgrepo.com/.

## Status do projeto

O app está concluído nesta branch principal.
