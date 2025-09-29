---
trigger: always_on
---

**Sempre seguir a estrutura de projeto do arquivo documentacaoprojeto.md**
# Documentação da Arquitetura do Projeto

Este documento descreve a estrutura de pastas e a arquitetura do projeto, que é organizado como um **monorepo**. Esta abordagem nos permite gerenciar o código do `frontend` e do `backend` em um único repositório, facilitando a organização.

**Tecnologias Principais:**
* **Frontend:** HTML5, CSS3, JavaScript (Vanilla JS).
* **Backend:** Python (com um framework como Flask ou FastAPI).

## Estrutura de Pastas Principal

```plaintext
meu-projeto-fullstack/
├── 📁 packages/                 # Contêiner para os projetos de frontend e backend.
│   ├── 📁 frontend/             # Código-fonte da aplicação cliente (HTML, CSS, JS).
│   └── 📁 backend/              # Código-fonte do servidor e da API (Python).
│
├── 📄 .gitignore                 # Arquivos e pastas a serem ignorados pelo Git.
└── 📄 README.md                   # Este arquivo de documentação.
```

### Nível Raiz
* **`packages/`**: O coração do monorepo. Cada subpasta é um projeto independente.
* **`README.md`**: Documentação geral do projeto, explicando como configurar o ambiente e a arquitetura geral.

---

## Frontend (`packages/frontend/`)

O frontend é responsável pela interface do usuário. Por usar HTML, CSS e JS puros, a estrutura é direta e focada na organização dos arquivos estáticos.

```plaintext
packages/frontend/
├── 📄 index.html                # Página principal da aplicação.
├── 📁 pages/                    # Outras páginas HTML do site.
│   ├── 📄 sobre.html
│   └── 📄 agente-perfil.html
│
└── 📁 assets/                    # Pasta para todos os recursos estáticos.
    ├── 📁 css/
    │   └── 📄 style.css         # ★ Arquivo CSS central para toda a aplicação.
    │
    ├── 📁 js/
    │   ├── 📄 main.js           # Script principal, lógica global do site.
    │   └── 📁 agents/          # Scripts específicos para a lógica de cada agente.
    │       ├── 📄 chatbot.js
    │       └── 📄 data-analyzer.js
    │
    └── 📁 images/                # Todas as imagens, ícones e SVGs.
```

* **`index.html`**: O ponto de entrada principal do seu site.
* **`pages/`**: Contém os demais arquivos HTML, um para cada página diferente do seu site, mantendo a raiz do projeto limpa.
* **`assets/`**: Pasta "mãe" para todos os recursos.
    * **`css/style.css`**: Conforme solicitado, este é o **único arquivo de folha de estilos**. Ele conterá todas as regras de estilização para o site inteiro, desde o layout geral até os componentes específicos de cada agente.
    * **`js/main.js`**: Para scripts que se aplicam a todo o site, como manipulação do menu de navegação, inicialização de bibliotecas, etc.
    * **`js/agents/`**: Para manter a organização, cada arquivo aqui conterá o código JavaScript responsável pela funcionalidade de um agente específico. Por exemplo, `chatbot.js` terá toda a lógica para interagir com o widget do chatbot.
    * **`images/`**: Repositório para todos os seus recursos visuais.

---

## Backend (`packages/backend/`)

O backend é a API do servidor, construída em Python. Ele lida com a lógica de negócio, autenticação e comunicação com o banco de dados.

```plaintext
packages/backend/
├── 📁 app/                      # Módulo principal da aplicação Python.
│   ├── 📁 routers/              # Definição das rotas/endpoints da API.
│   │   ├── 📄 agent_routes.py
│   │   └── 📄 user_routes.py
│   ├── 📁 services/             # Lógica de negócio principal.
│   ├── 📁 models/              # Definição dos modelos de dados (ex: SQLAlchemy).
│   ├── 📄 config.py             # Configurações da aplicação.
│   └── 📄 __init__.py           # Inicializador do pacote 'app'.
│
├── 📄 main.py                   # Ponto de entrada para iniciar o servidor.
├── 📄 requirements.txt         # Lista de dependências Python para o projeto.
└── 📄 .env                       # Variáveis de ambiente secretas (chaves, senhas).
```

* **`main.py`**: O ponto de entrada da aplicação. É este arquivo que você executará para iniciar o servidor. Ele importa e inicializa a aplicação a partir do pacote `app/`.
* **`requirements.txt`**: Define todas as bibliotecas Python que o projeto precisa (ex: `fastapi`, `uvicorn`, `sqlalchemy`). Você as instala com `pip install -r requirements.txt`.
* **`.env`**: Arquivo para armazenar variáveis de ambiente sensíveis (nunca deve ser enviado para o Git).
* **`app/`**: É o pacote Python principal que contém toda a lógica da aplicação.
    * **`routers/`**: Define os endpoints da API (as "URLs"). Cada arquivo agrupa rotas de um mesmo contexto (ex: `agent_routes.py` para tudo relacionado aos agentes). Eles recebem as requisições e chamam os serviços correspondentes.
    * **`services/`**: Contém a lógica de negócio central. Se uma rota precisa processar dados complexos ou interagir com o banco de dados, ela delega essa tarefa para uma função dentro de um serviço.
    * **`models/`**: Define a estrutura dos dados no banco de dados, geralmente através de um ORM (Object-Relational Mapper) como SQLAlchemy ou Tortoise ORM.
    * **`config.py`**: Centraliza as configurações da aplicação, como conexão com o banco de dados, chaves de API, etc., que podem ser lidas a partir do arquivo `.env`.

**** OBRIGATORIO SEMPRE USAR LOGS, usando a estrutura do arquivo LOGS.md****