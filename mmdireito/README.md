# M&M Direito - Plataforma de Agentes Jurídicos Inteligentes

Bem-vindo ao projeto M&M Direito. Esta é uma plataforma full-stack projetada para fornecer assistência jurídica através de agentes de inteligência artificial especializados. A aplicação permite, por exemplo, que um usuário faça o upload de um contrato e receba uma análise de riscos detalhada com base no Código Civil brasileiro.

## Arquitetura: Monorepo

O projeto é organizado como um **monorepo**, contendo o código do `frontend` e do `backend` em um único repositório para facilitar o gerenciamento e o desenvolvimento integrado. As duas partes principais do projeto estão localizadas na pasta `packages/`.

- `packages/backend/`: Aplicação do servidor em Python (FastAPI).
- `packages/frontend/`: Aplicação do cliente em HTML, CSS e JavaScript (Vanilla).

---

## Backend (`packages/backend/`)

A API do backend é responsável por toda a lógica de negócio, processamento de linguagem natural, comunicação com o banco de dados vetorial (Supabase) e a geração de respostas pelos agentes.

### Tecnologias

- **Python 3.11+**
- **FastAPI:** Para a construção da API web.
- **Uvicorn:** Como servidor ASGI.
- **LangChain:** Para orquestrar as interações com os modelos de linguagem e bases de conhecimento.
- **Supabase:** Como banco de dados vetorial para a base de conhecimento.
- **Sentence-Transformers:** Para a geração de embeddings de texto localmente.
- **Google Gemini:** Como modelo de linguagem generativa (LLM) para o chat.

### Setup e Execução

1.  **Navegue até o diretório do backend:**
    ```bash
    cd packages/backend
    ```

2.  **Crie e ative um ambiente virtual:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # No Linux/macOS
    .\venv\Scripts\activate    # No Windows
    ```

3.  **Instale as dependências:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure as variáveis de ambiente:**
    - Renomeie o arquivo `.env.example` para `.env`.
    - Preencha as variáveis `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` e `GOOGLE_API_KEY` com suas credenciais.

5.  **Execute o servidor:**
    ```bash
    uvicorn main:app --reload
    ```
    O servidor estará disponível em `http://127.0.0.1:8000`.

---

## Frontend (`packages/frontend/`)

A aplicação frontend é uma interface de chat estática (Single Page Application) que consome os serviços da API do backend.

### Tecnologias

- **HTML5**
- **CSS3 (Flexbox, Grid)**
- **JavaScript (ES6 Modules, Vanilla JS)**

### Execução

Por ser uma aplicação estática, não há um processo de build. A forma mais simples de executá-la é com um servidor web local.

**Usando a extensão Live Server (VS Code):**

1.  Instale a extensão [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) no Visual Studio Code.
2.  Abra a pasta do projeto.
3.  Clique com o botão direito no arquivo `packages/frontend/index.html`.
4.  Selecione **"Open with Live Server"**.

A aplicação será aberta no seu navegador padrão.
