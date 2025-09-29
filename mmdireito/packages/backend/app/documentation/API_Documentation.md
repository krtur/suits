# Documentação da API - M&M Direito Backend

## 1. Visão Geral

Este documento detalha a arquitetura, configuração e uso do backend do projeto M&M Direito. O sistema consiste em uma API construída com **FastAPI** que serve um agente de chat inteligente, especializado em análise de contratos legais. O agente utiliza **LangChain** e o modelo **Gemini 1.5 Flash** do Google.

O projeto segue uma estrutura de monorepo e adere a padrões estritos de arquitetura e logging, definidos nos documentos na raiz do projeto.

---

## 2. Arquitetura do Backend

O código-fonte do backend está localizado em `packages/backend/` e segue a seguinte estrutura:

```plaintext
packages/backend/
├── app/                      # Módulo principal da aplicação
│   ├── documentation/        # Esta documentação
│   ├── routers/              # Definição dos endpoints da API
│   │   └── agent_routes.py
│   ├── services/             # Lógica de negócio principal
│   │   └── contract_chat_service.py
│   ├── config.py             # Carregamento de variáveis de ambiente
│   └── logger_config.py      # Configuração do sistema de logs (Loguru)
│
├── .env                      # Arquivo com variáveis de ambiente (ex: API keys)
├── main.py                   # Ponto de entrada da aplicação FastAPI
└── requirements.txt          # Dependências Python do projeto
```

### Componentes Principais

*   **`main.py`**: Inicializa a aplicação FastAPI, registra as rotas e define um endpoint de health check (`/`).
*   **`app/config.py`**: Carrega de forma segura as variáveis de ambiente (como a `GOOGLE_API_KEY`) do arquivo `.env` usando `python-dotenv`.
*   **`app/logger_config.py`**: Configura o `Loguru` para seguir o padrão de logging definido em `LOGS.md`, com formatos e cores padronizados.
*   **`app/services/contract_chat_service.py`**: Contém a lógica central do agente de chat. Ele usa `RunnableWithMessageHistory` do LangChain para manter o contexto da conversa e interage com o modelo Gemini.
*   **`app/routers/agent_routes.py`**: Define os endpoints da API usando `APIRouter` do FastAPI. É aqui que as requisições HTTP são recebidas e direcionadas para o serviço correspondente.

---

## 3. Configuração e Execução

### 3.1. Pré-requisitos

*   Python 3.9+
*   Um arquivo `.env` na pasta `packages/backend/` com a seguinte variável:
    ```
    GOOGLE_API_KEY="sua_chave_de_api_do_google"
    ```

### 3.2. Instalação

Navegue até a raiz do projeto e instale as dependências:

```bash
pip install -r packages/backend/requirements.txt
```

### 3.3. Execução do Servidor

Para iniciar o servidor em modo de desenvolvimento (com recarregamento automático), execute o seguinte comando de dentro da pasta `packages/backend/`:

```bash
python -m uvicorn main:app --reload
```

O servidor estará disponível em `http://127.0.0.1:8000`.

---

## 4. Documentação da API

O FastAPI gera automaticamente uma documentação interativa (Swagger UI). Após iniciar o servidor, acesse:

**[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**

### Endpoint Principal

#### `POST /agent/chat/contract-analyzer`

Este é o endpoint para interagir com o agente de análise de contratos.

*   **Corpo da Requisição (Request Body):**

    ```json
    {
      "session_id": "string",
      "message": "string"
    }
    ```

    *   `session_id` (string, obrigatório): Um identificador único para a sessão de chat. Permite que o agente mantenha o contexto de conversas separadas.
    *   `message` (string, obrigatório): A mensagem do usuário para o agente.

*   **Resposta de Sucesso (Response `200 OK`):**

    ```json
    {
      "session_id": "string",
      "response": "string"
    }
    ```

    *   `response`: A resposta gerada pelo agente.

*   **Exemplo de uso com `curl`:**

    ```bash
    curl -X 'POST' \
      'http://127.0.0.1:8000/agent/chat/contract-analyzer' \
      -H 'accept: application/json' \
      -H 'Content-Type: application/json' \
      -d '{
        "session_id": "conversa_cliente_123",
        "message": "Olá, gostaria de analisar um contrato."
      }'
    ```

---

## 5. Agente de Chat e Logging

*   **Agente (`ContractChatService`):** O agente é construído com um *prompt de sistema* que o instrui a atuar como um especialista em contratos. Ele é projetado para primeiro solicitar o texto do contrato e, em seguida, responder a perguntas sobre ele, mantendo o histórico da conversa para perguntas de acompanhamento.

*   **Gerenciamento de Memória:** O histórico de cada sessão é armazenado em um dicionário em memória (`store`). Para um ambiente de produção, isso deve ser substituído por uma solução mais robusta, como um banco de dados ou um cache (ex: Redis).

*   **Logging:** Todos os eventos importantes, como o recebimento de uma requisição, a criação de uma nova sessão de memória e a geração de uma resposta, são registrados usando o logger configurado, com níveis e cores apropriados para facilitar a depuração.
