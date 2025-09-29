# Documentação do Frontend - M&M Direito

Este documento fornece uma visão geral da aplicação frontend do projeto M&M Direito. A aplicação é uma interface de chat moderna, construída com HTML, CSS e JavaScript puros (Vanilla JS), projetada para permitir a interação com agentes de inteligência artificial especializados em tarefas jurídicas.

## Visão Geral

A interface principal consiste em:

- **Barra Lateral (Sidebar):** Permite ao usuário selecionar o agente com o qual deseja interagir. Atualmente, o "Analisador de Contratos" está ativo, com planos para futuros agentes como o "Pesquisador Jurídico".
- **Área de Chat:** Onde a interação com o agente acontece. Inclui:
  - Um cabeçalho que identifica o agente ativo.
  - Uma janela de chat para exibir o histórico da conversa.
  - Uma área de entrada que permite o envio de mensagens de texto e o upload de arquivos (contratos em `.pdf` ou `.docx`).

## Tecnologias

- **HTML5:** Para a estrutura semântica da página.
- **CSS3:** Para estilização, utilizando um layout baseado em Flexbox e Grid para responsividade.
- **JavaScript (ES6 Modules):** Para toda a lógica de interatividade, incluindo:
  - Manipulação do DOM.
  - Comunicação com a API do backend.
  - Gerenciamento de estado da sessão de chat.
  - Renderização de mensagens (incluindo Markdown).

## Como Executar

Como a aplicação é construída com arquivos estáticos, ela pode ser servida por qualquer servidor web simples. A forma mais fácil é usar a extensão **Live Server** no Visual Studio Code:

1.  Abra a pasta `packages/frontend` no VS Code.
2.  Clique com o botão direito no arquivo `index.html`.
3.  Selecione "Open with Live Server".

Isso iniciará um servidor de desenvolvimento local e abrirá a aplicação no seu navegador padrão.
