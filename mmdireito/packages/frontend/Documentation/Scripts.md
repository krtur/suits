# Documentação dos Scripts JavaScript

O frontend utiliza JavaScript moderno (ES6 Modules) para modularizar o código e separar as responsabilidades. A lógica está dividida principalmente em um orquestrador (`main.js`) e módulos de agentes específicos.

## `main.js`

Este é o script principal da aplicação, responsável por controlar a interface do usuário e o estado do chat.

### Responsabilidades Principais:

1.  **Inicialização:**
    - Adiciona todos os `event listeners` necessários para os elementos da UI (envio de formulário, clique em botões, etc.).
    - Inicia a primeira conversa com uma mensagem de boas-vindas.

2.  **Gerenciamento de Estado:**
    - Gera e mantém um `sessionId` único para cada nova conversa.
    - Mantém o controle do `activeAgent` (agente atualmente selecionado).

3.  **Manipulação do DOM:**
    - A função `addMessage()` é usada para adicionar novas mensagens (do usuário ou do agente) à janela de chat.
    - Suporta a renderização de conteúdo como texto simples ou HTML (usado para formatar respostas em Markdown).
    - Exibe indicadores de "carregando" enquanto o agente está processando.

4.  **Upload de Arquivos:**
    - Implementa a lógica de clique no botão de anexo e a funcionalidade de arrastar e soltar (drag and drop).
    - Realiza validações no frontend para tipo de arquivo (PDF, DOCX) e tamanho máximo.
    - Utiliza `XMLHttpRequest` para enviar o arquivo para o backend, permitindo o monitoramento do progresso do upload através de uma barra de progresso visual.
    - Exibe mensagens de sucesso ou erro com base na resposta do servidor.

5.  **Orquestração de Agentes:**
    - Utiliza um objeto `agentApi` para mapear o `activeAgent` à função de comunicação correspondente, importada do módulo do agente.
    - A função `submitMessage()` chama a função do agente apropriado, passando o `sessionId` e a mensagem do usuário.

## `agents/contract_analyzer.js`

Este é um módulo de agente, focado exclusivamente na comunicação com o endpoint do "Analisador de Contratos".

### Responsabilidades:

- **Encapsulamento da API:** Define a `API_URL` específica para o endpoint do agente.
- **Comunicação com o Backend:**
  - Exporta a função `sendMessageToContractAnalyzer(sessionId, userMessage)`.
  - Utiliza a `fetch` API para fazer uma requisição `POST` para o backend.
  - Envia os dados no formato JSON esperado pela API (`session_id` e `message`).
  - Realiza o tratamento de erros de rede e de respostas da API (ex: status `!response.ok`).
  - Retorna a resposta do agente ou uma mensagem de erro formatada.

## Fluxo de Interação

1.  O usuário digita uma mensagem e envia o formulário (`main.js`).
2.  `main.js` adiciona a mensagem do usuário à UI e chama `submitMessage()`.
3.  `submitMessage()` identifica o agente ativo (`contract_analyzer`) e chama a função `sendMessageToContractAnalyzer()` importada de `contract_analyzer.js`.
4.  `contract_analyzer.js` envia a requisição para o backend.
5.  `main.js` aguarda a resposta, remove o indicador de "carregando" e adiciona a resposta do agente à UI, renderizando-a como Markdown.
