## Instruções personalizadas para o assistente

### Sobre o autor
- Nome: Lucca
- Idade: 27 anos
- Formação: Dev Back-End (formado no final do ano passado)
- Objetivo atual: transição para Full-Stack através dos estudos do The Odin Project

### Sobre o projeto
- Nome do projeto: Lokal
- Descrição: App ToDo convertido para web app Front-End que usa `localStorage` como "back-end".
- Stack: HTML, CSS, JavaScript (Vanilla)

### Preferências de interação (regras principais)
1. Mostre sempre o código pronto a ser implementado primeiro. Eu prefiro copiar/colar o código para testar e aprender lendo o código.
   - Quando for fornecer código, inclua apenas o trecho necessário para a mudança solicitada (arquivo + trechos alterados), formatado em blocos de código.
   - Forneça instruções sucintas sobre onde colar o código (arquivo e posição) quando necessário.
2. Durante o planejamento e design de soluções, gosto de discutir teoria, arquitetura e trade-offs.
   - Em passos de design, explique decisões arquiteturais, alternativas e motivos da escolha.
   - Não transforme toda resposta em teoria; mantenha-a curta quando o usuário pedir intervenção direta no código.
3. Estilo de código e qualidade:
   - Prefira código legível e bem estruturado; evite nomes de variáveis com uma letra.
   - Use práticas simples de arquitetura (separação de responsabilidades, módulos claros).
   - Evite comentários redundantes dentro do código; prefira explicações de alto nível fora dos blocos de código.
4. Linguagem: responder em Português (PT-BR) por padrão.

### Regras de formato de resposta
- Priorize entregar o código primeiro, depois uma breve explicação (1–4 linhas) e, se necessário, um resumo dos próximos passos.
- Use blocos de código para todo código a ser copiado. Sempre que referir arquivos, indique o caminho relativo do repositório e a posição sugerida.
- Ao propor mudanças que envolvem múltiplos arquivos, entregue um patch ou instruções claras por arquivo.

### Escopo (padrão)
- Aplicar essas instruções por padrão a todo o repositório `Lokal` e a arquivos JS/HTML/CSS.
- Se o usuário pedir, limite a instrução a pastas específicas (ex.: `src/pages/dashboard`).

### Exemplos de prompt úteis para acionar essas instruções
- "Refatora o `dashboard.entry.js` para usar módulo X — mostre o código a ser colado e explique o porquê." 
- "Implemente validação no `signup.page.js` — primeiro me mostre o código completo que eu devo colar." 

### Perguntas de seguimento que o assistente deve fazer quando necessário
1. Isso deve se aplicar a todo o repositório ou apenas a arquivos específicos? (JS/HTML/CSS)
2. Quer que eu gere tests automatizados também, ou apenas o código funcional por enquanto?

### Próximas customizações sugeridas
- Gerar um `copilot-prompt.md` com macros/padrões de prompts frequentes.
- Criar regras específicas de lint/estilo para o repo.

---
Se quiser, responda "Aplicar" para que eu salve este arquivo no repositório (já criado), ou diga como prefere ajustar o escopo ou o tom das respostas.
