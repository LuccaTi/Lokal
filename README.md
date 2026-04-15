# Webpack Template

Template base para projetos Front-End com Webpack.

O objetivo deste repositório é servir como ponto de partida reutilizável para novos projetos, com uma estrutura limpa, suporte a módulos JavaScript, processamento de CSS/HTML e layout responsivo no formato Holy Grail.

## Descrição

Este projeto usa Webpack com configuração separada para desenvolvimento e produção, com:

- Entrada JS modular em `src/index.js`.
- Injeção automática do bundle no HTML via HtmlWebpackPlugin.
- Suporte a importação de CSS, HTML e imagens.
- Servidor de desenvolvimento com hot reload e abertura automática do navegador.
- Build de produção com source map separado.

## Tecnologias e Conceitos

- JavaScript modular (ES Modules)
- Webpack 5 + webpack-cli + webpack-dev-server
- webpack-merge
- html-webpack-plugin
- css-loader + style-loader
- html-loader
- Asset Modules do Webpack para imagens
- HTML5 semântico
- CSS Grid + Flexbox
- Layout responsivo (mobile first)

## Estrutura do Projeto

```text
webpack-template/
|- src/
|  |- greeting.js
|  |- index.js
|  |- styles.css
|  |- template.html
|- package.json
|- webpack.common.js
|- webpack.dev.js
|- webpack.prod.js
|- .gitignore
```

## Como Executar

### Pré-requisitos

- Node.js 18+ (recomendado)
- npm

### Passos

1. Instale as dependencias:

```bash
npm install
```

2. Rode o servidor de desenvolvimento:

```bash
npm run start
```

3. Gere o build de produção em `dist/`:

```bash
npm run build
```

4. Abra no navegador:

```text
http://localhost:8080
```

## Scripts Disponíveis

- `npm run start`: inicia o webpack-dev-server com `webpack.dev.js` e abre o navegador.
- `npm run build`: gera o bundle de produção usando `webpack.prod.js`.
- `npm run deploy`: publica a pasta `dist/` na branch `gh-pages` via `git subtree`.

## Observações

- A configuração base compartilhada está em `webpack.common.js`.
- O ambiente de desenvolvimento está em `webpack.dev.js` (`mode: development` + `eval-source-map`).
- O ambiente de produção está em `webpack.prod.js` (`mode: production` + `source-map`).
- O bundle de saída é gerado em `dist/` com limpeza automática a cada build.
- O layout base segue o padrão Holy Grail com sidebar esquerda, conteúdo central e sidebar direita em telas maiores.





