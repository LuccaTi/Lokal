# Lokal - Todo App

## 1) Definição do projeto

O Lokal será uma aplicação web para gerenciamento de projetos pessoais e suas tarefas.

A arquitetura de entrega será uma **MPA (Multi-Page Application)** com três páginas principais:

1. Home
2. Login
3. Dashboard

Cada página pode ter comportamento de SPA internamente (renderização dinâmica sem reload interno), mas tecnicamente o projeto será entregue como MPA com múltiplas entradas.

Os projetos registrados no app podem ser de qualquer tipo, por exemplo: "Projeto corpo sarado 2027", com tarefas como "jejum todo dia pela manha", "salada no almoço e na janta" etc.

Persistência de dados: **localStorage**.

## 2) Estrutura geral da aplicação

### Home (página de entrada)

Responsável por apresentar o app e iniciar o fluxo.

Elementos iniciais:

- Nome do aplicativo
- Descrição
- Botao "Get Started"

Fluxo inicial:

1. Usuário acessa Home
2. Clica em "Get Started"
3. Formulário solicita nome, sobrenome, data de nascimento e identificador
4. Sistema verifica o localStorage:
5. Se existir estado para o identificador: carrega
6. Se não existir: cria estado inicial
7. Usuário é redirecionado para Dashboard

### Dashboard (página principal)

Responsável por gerenciamento de projetos e tarefas.

Layout inicial:

- Sidebar fixa para navegação
- Área principal de conteúdo
- Sem rodapé
- Cabeçalho opcional

Funcionalidades iniciais:

- Estado inicial vazio
- Botão para criar projeto
- Listar projetos
- Acessar tarefas de um projeto

Cada tarefa terá inicialmente:

- Titulo
- Descrição
- Radio buttons (Em andamento/concluída)

Fora do escopo inicial: prioridade, lembretes e outras features avançadas.

Navegação prevista na sidebar:

- Lista de projetos
- Tarefas para hoje
- Tarefas futuras
- Projetos e tarefas concluidos

## 3) Arquitetura de codigo recomendada

Estrutura de pastas sugerida:

```text
src/
	pages/
		home/
			home.entry.js
			home.template.html
			home.css
			home.page.js
		dashboard/
			dashboard.entry.js
			dashboard.template.html
			dashboard.css
			dashboard.page.js

	core/
		storage/
			keys.js
			userStorage.js
			projectStorage.js
		domain/
			user.js
			project.js
			task.js
		state/
			appState.js

	shared/
		ui/
			createButton.js
			createEmptyState.js
			createInput.js
		utils/
			generateId.js
			formatDate.js
			validations.js
```

### Responsabilidades por camada

`pages/`

- Montagem de tela
- Eventos de UI
- Fluxo de navegação da página

`core/storage/`

- Leitura e escrita no localStorage
- Chaves de armazenamento
- Serialização e desserialização

`core/domain/`

- Modelos e regras de negócio (Projeto, Tarefa, Usuário)
- Validações e funções de domínio

`core/state/`

- Estado em memória da aplicação durante uso
- Sincronização com storage quando necessário

`shared/ui/`

- Componentes reutilizáveis entre Home e Dashboard

`shared/utils/`

- Funções utilitárias gerais (id, data, validações, helpers)

## 4) Persistência de dados

O estado será salvo em localStorage e atualizado a cada alteração relevante.

Dados persistidos inicialmente:

- Usuário atual (identificador)
- Projetos
- Tarefas

Regra de inicialização:

1. Ao entrar no app, verificar se existe estado salvo para o identificador informado
2. Se existir, carregar
3. Se não existir, criar estado inicial padrão

## 5) Estratégia de build e webpack

Será mantido **um único conjunto de configurações webpack**:

- `webpack.common.js`
- `webpack.dev.js`
- `webpack.prod.js`

Não será criado um webpack para cada página.

O `webpack.common.js` será evoluido para:

- Suportar múltiplos entry points (home e dashboard)
- Gerar múltiplos HTMLs (um por página)
- Compartilhar código comum entre bundles

## 6) Escopo do projeto

- Aplicação individual
- Foco em funcionalidades essenciais
- Persistência local via localStorage
- Entrega como MPA com duas páginas principais (Home e Dashboard)

## 7) Roadmap incremental

1. Definir estrutura de pastas base
2. Separar Home e Dashboard em entradas independentes
3. Configurar webpack para múltiplas páginas
4. Implementar fluxo de identificação e redirecionamento
5. Implementar criação e listagem de projetos
6. Implementar criação e listagem de tarefas
7. Implementar filtros da sidebar
