# Plano de Execução: Frontend do Chat de Agentes

Este documento detalha o plano de ação para desenvolver a interface de usuário (frontend) para interagir com os agentes de chat. A estrutura seguirá as diretrizes do documento de arquitetura, utilizando HTML, CSS e JavaScript ("Vanilla JS").

## Fase 1: Estrutura Base e Estilo Visual

O objetivo desta fase é criar a estrutura de arquivos e o layout visual principal da aplicação, incluindo a área de chat e a seleção de agentes.

- [x] **1.1: Criar Estrutura de Arquivos do Frontend**
  - [x] Criar o arquivo `packages/frontend/index.html`.
  - [x] Criar as pastas `packages/frontend/assets/css/`, `packages/frontend/assets/js/agents/` e `packages/frontend/assets/images/`.
  - [x] Criar os arquivos `packages/frontend/assets/css/style.css` e `packages/frontend/assets/js/main.js`.

- [x] **1.2: Desenvolver o Layout HTML (`index.html`)**
  - [x] Criar uma estrutura semântica com um cabeçalho (`<header>`), uma área principal (`<main>`) que conterá a interface de chat e uma barra lateral (`<aside>`) para a seleção de agentes.

- [x] **1.3: Estilizar a Interface (`style.css`)**
  - [x] Aplicar um estilo base (reset, fontes, cores) para a página.
  - [x] Estilizar o layout principal, a barra de seleção de agentes e a área de chat para ser moderna, limpa e responsiva.

## Fase 2: Lógica de Interação e Comunicação com a API

Nesta fase, o foco é implementar a interatividade do chat e a comunicação com o backend.

- [x] **2.1: Implementar a Lógica do Chat (`main.js`)**
  - [x] Adicionar a lógica para capturar o envio de mensagens do usuário (pelo formulário).
  - [x] Criar funções para adicionar as mensagens do usuário e do agente à janela de chat dinamicamente.
  - [x] Gerar e armazenar um `session_id` único para cada nova conversa.

- [x] **2.2: Criar o Módulo do Agente (`assets/js/agents/contract_analyzer.js`)**
  - [x] Criar uma função que será responsável por se comunicar com o endpoint do backend (`http://127.0.0.1:8000/agent/chat/contract-analyzer`).
  - [x] A função receberá a mensagem do usuário e o `session_id`, fará a requisição `POST` usando `fetch()` e retornará a resposta da API.

- [x] **2.3: Integrar Módulo do Agente ao Chat (`main.js`)**
  - [x] Importar e chamar a função do módulo do agente quando o usuário enviar uma mensagem.
  - [x] Exibir uma indicação de "carregando" enquanto espera a resposta da API.
  - [x] Exibir a resposta do agente na tela quando ela for recebida.

## Fase 3: Seleção de Agentes (Escalabilidade)

O objetivo é garantir que a estrutura suporte múltiplos agentes no futuro.

- [x] **3.1: Implementar a Seleção de Agentes**
  - [x] Na barra lateral do `index.html`, adicionar o primeiro agente: "Analisador de Contratos".
  - [x] Em `main.js`, adicionar a lógica para (no futuro) carregar dinamicamente o script do agente selecionado e configurar a interface para se comunicar com o endpoint correto.

---

Por favor, revise o plano. Se estiver de acordo, me avise para que eu possa começar a execução da **Fase 1**.

---

## Fase 4: Backend - Upload de Contratos

O objetivo é permitir que o backend receba arquivos, extraia seu texto e o incorpore na sessão de chat do usuário.

- [ ] **4.1: Adicionar Dependências**
  - [ ] Adicionar `python-multipart` ao `requirements.txt` para manipulação de formulários/uploads em FastAPI.
  - [ ] Adicionar `pypdf` ao `requirements.txt` para extrair texto de arquivos PDF.
  - [ ] Adicionar `python-docx` ao `requirements.txt` para extrair texto de arquivos DOCX.

- [ ] **4.2: Criar Endpoint de Upload com Validação**
  - [ ] Em `app/routers/agent_routes.py`, criar um novo endpoint `POST /agent/upload-contract`.
  - [ ] O endpoint receberá um `UploadFile` e um `session_id`.
  - [ ] **Validação no Backend:** Implementar validação para aceitar apenas `application/pdf` e `application/vnd.openxmlformats-officedocument.wordprocessingml.document`.
  - [ ] Adicionar um limite de tamanho de arquivo (ex: 10MB) e retornar um erro claro (ex: 413 Payload Too Large) se excedido.

- [ ] **4.3: Implementar Extração de Texto Segura**
  - [ ] Criar um novo serviço em `app/services/` (ex: `file_processing_service.py`) para lidar com a extração de texto.
  - [ ] A função de serviço detectará o tipo de arquivo e usará a biblioteca apropriada.
  - [ ] **Tratamento de Erros:** Implementar blocos `try-except` para lidar com arquivos corrompidos ou que falhem na extração.

- [ ] **4.4: Integrar Texto ao Histórico de Chat**
  - [ ] Após a extração, o texto do contrato será adicionado ao histórico da sessão (`ChatMessageHistory`) como uma mensagem do sistema, fornecendo contexto para as perguntas futuras do usuário.

## Fase 5: Frontend - Experiência de Upload (UI/UX)

O objetivo é criar uma interface de upload de arquivos moderna, intuitiva e robusta.

- [ ] **5.1: Adicionar Elementos de UI**
  - [ ] Em `index.html`, adicionar um botão de anexo e um campo de input de arquivo oculto.
  - [ ] Configurar o input de arquivo com `accept=".pdf,.docx"`.

- [ ] **5.2: Estilizar Novos Elementos**
  - [ ] Em `style.css`, estilizar o botão de anexo.
  - [ ] Adicionar estilos para a funcionalidade de arrastar e soltar (ex: borda tracejada na área de chat ao arrastar um arquivo sobre ela).
  - [ ] Estilizar a barra de progresso do upload.

- [ ] **5.3: Implementar Lógica de Upload Avançada**
  - [ ] Em `main.js`, implementar a lógica para acionar o seletor de arquivos ao clicar no botão de anexo.
  - [ ] **Arrastar e Soltar (Drag and Drop):** Adicionar ouvintes de evento à área de chat para capturar arquivos arrastados, com feedback visual.
  - [ ] **Validação no Frontend:** Antes do envio, validar tipo e tamanho do arquivo. Exibir erro claro no chat em caso de falha.
  - [ ] **Lógica de Envio com Progresso:** Ao enviar o arquivo, usar `XMLHttpRequest` (em vez de `fetch` simples) para monitorar o progresso do upload e atualizar a barra de progresso em tempo real.
  - [ ] **Desabilitar Ações:** Desabilitar a caixa de texto e os botões de envio durante o upload.
  - [ ] **Feedback Visual Aprimorado:** Após o sucesso, exibir uma mensagem de confirmação com o nome e ícone do arquivo. Em caso de erro, exibir uma mensagem clara e reabilitar a interface.

---

## Fase 7: Backend - Integração com Base de Conhecimento Jurídico (Código Civil)

O objetivo é enriquecer a análise do agente, permitindo que ele cruze as informações do contrato com a legislação do Código Civil.

- [ ] **7.1: Carregar e Indexar o Código Civil**
  - [ ] No `main.py` do backend, implementar uma função que será executada na inicialização do servidor.
  - [ ] Esta função irá carregar o arquivo `packages/backend/knowledge_base/CodigoCivil.pdf`, extrair seu texto e criar um "retriever" global para o Código Civil.
  - [ ] Este retriever base será armazenado em uma variável global para ser acessado por todas as requisições.

- [ ] **7.2: Combinar Fontes de Conhecimento (Merger Retriever)**
  - [ ] No `contract_chat_service.py`, modificar a lógica de criação da cadeia RAG.
  - [ ] Quando um contrato é enviado, o retriever específico do contrato será combinado com o retriever global do Código Civil usando o `MergerRetriever` do LangChain.
  - [ ] Este "super-retriever" será então armazenado na sessão do usuário, dando ao agente acesso a ambas as fontes de conhecimento.

- [ ] **7.3: Atualizar o Prompt do Agente**
  - [ ] Modificar o `rag_system_prompt` para instruir o agente a utilizar o contexto legal fornecido (os artigos do Código Civil) para fundamentar suas análises, citar artigos relevantes e identificar possíveis conflitos entre as cláusulas do contrato e a lei.

---

## Fase 8: Backend - Sugestão de Análise Proativa

O objetivo é fazer com que o agente sugira proativamente os próximos passos após o upload de um contrato.

- [ ] **8.1: Modificar Resposta do Endpoint de Upload**
  - [ ] Em `app/routers/agent_routes.py`, alterar o `UploadResponse` para incluir uma lista opcional de ações sugeridas.
  - [ ] O endpoint `/upload-contract` retornará uma mensagem de sucesso, uma pergunta de acompanhamento (ex: "O que deseja fazer com este contrato?") e uma lista de ações (ex: ["Análise detalhada de riscos", "Tirar dúvidas específicas"]).

- [ ] **8.2: Refinar o Prompt do Agente**
  - [ ] Em `contract_chat_service.py`, aprimorar o `rag_system_prompt` para que o agente saiba como executar uma "Análise detalhada de riscos", focando em encontrar cláusulas problemáticas, omissões e potenciais conflitos com o Código Civil.

## Fase 9: Frontend - Interface de Ações Sugeridas

O objetivo é exibir as ações sugeridas pelo agente como botões interativos.

- [ ] **9.1: Estilizar Botões de Ação**
  - [ ] Em `style.css`, adicionar estilos para os botões de ação sugerida, para que apareçam de forma clara e clicável no chat.

- [ ] **9.2: Implementar Lógica de Ações Sugeridas**
  - [ ] Em `main.js`, na função de callback do upload, verificar se a resposta da API contém ações sugeridas.
  - [ ] Se houver, criar e exibir os botões de ação no chat, abaixo da mensagem do agente.
  - [ ] Adicionar um ouvinte de evento para esses botões. Ao serem clicados, o texto do botão é enviado como uma nova mensagem do usuário, e os botões são removidos para evitar cliques duplicados.

---

## Fase 10: Correção de Bug - Importação Circular

O objetivo é resolver o erro `Could not import module "main"` que impede o servidor de iniciar.

- [ ] **10.1: Centralizar Lógica no Serviço (`contract_chat_service.py`)**
  - [ ] Garantir que a função `setup_retriever_for_session` está correta e combina o retriever do contrato com o retriever global do Código Civil.
  - [ ] Assegurar que a importação do `civil_code_retriever` de `main.py` é feita de forma segura, com `try-except` para evitar falhas.
  - [ ] **Corrigir `NameError`:** Adicionar a importação de `RunnableWithMessageHistory` que está faltando.

- [ ] **10.2: Simplificar a Rota (`agent_routes.py`)**
  - [ ] Remover qualquer importação direta de `main` ou de componentes que criem uma dependência circular.
  - [ ] Garantir que o endpoint `/upload-contract` apenas chame a função `setup_retriever_for_session` do serviço, sem replicar a lógica.

- [ ] **10.3: Teste de Execução**
  - [ ] Fornecer o comando correto para executar o servidor a partir do diretório `packages/backend` e confirmar que a aplicação inicia sem erros.

---

## Fase 44: Criação do Agente Especialista em Código Civil

O objetivo é adicionar um novo agente focado em responder questões sobre o Código Civil Brasileiro, utilizando o prompt fornecido.

- [ ] **44.1: Carregar o Prompt do Novo Agente**
  - [ ] Em `app/prompts.py`, carregar o `AgenteCivil_system_prompt.txt` para uma nova variável.

- [ ] **44.2: Criar o Serviço do Agente Civil**
  - [ ] Criar um novo arquivo de serviço, `app/services/civil_agent_service.py`.
  - [ ] Implementar a lógica do chat para este agente, similar aos serviços existentes, usando o prompt carregado.

- [ ] **44.3: Registrar o Novo Agente no Roteador**
  - [ ] Em `app/routers/agent_routes.py`, importar o novo serviço.
  - [ ] Adicionar o "agente_civil" ao dicionário `agent_services`.

- [ ] **44.4: Adicionar Agente no Frontend**
  - [ ] Em `packages/frontend/index.html`, adicionar "Agente Civil" à lista de agentes selecionáveis na barra lateral.
  - [ ] Garantir que o frontend envie a requisição para o endpoint correto (ex: `/agent/chat/agente_civil`).

---

## Fase 12: Refatoração para Arquitetura de Serviços

O objetivo é reestruturar o backend para seguir o padrão de serviços desacoplados dos arquivos de referência, usando um modelo de embedding local para garantir robustez e velocidade.

- [ ] **12.1: Criar o Serviço de Embedding (`embedding_service.py`)**
  - [ ] Criar o arquivo `app/services/embedding_service.py`.
  - [ ] Implementar uma classe `EmbeddingService` que encapsula o `HuggingFaceEmbeddings` (`sentence-transformers/all-MiniLM-L6-v2`), tornando o modelo facilmente substituível.

- [ ] **12.2: Criar o Serviço da Base de Conhecimento (`knowledge_base_service.py`)**
  - [ ] Criar o arquivo `app/services/knowledge_base_service.py`.
  - [ ] Implementar uma classe `KnowledgeBaseService` que utiliza o `EmbeddingService` para orquestrar a extração de texto, divisão em chunks e salvamento no Supabase.

- [ ] **12.3: Atualizar Scripts SQL (Schema de Duas Tabelas)**
  - **Atenção:** Os scripts a seguir irão apagar a tabela antiga. Execute-os no SQL Editor do Supabase.

  - **Script 1: Remover estrutura antiga e criar novas tabelas**
    ```sql
    -- 1. Remover a função e a tabela antigas (se existirem)
    DROP FUNCTION IF EXISTS match_dir_documents;
    DROP TABLE IF EXISTS dir_documents;

    -- 2. Habilitar a extensão pgvector
    CREATE EXTENSION IF NOT EXISTS vector;

    -- 3. Criar a tabela para os documentos principais
    CREATE TABLE dir_knowledge_base (
        id BIGSERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        total_chunks INT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 4. Criar a tabela para os chunks e embeddings
    CREATE TABLE dir_knowledge_base_chunks (
        id BIGSERIAL PRIMARY KEY,
        document_id BIGINT NOT NULL REFERENCES dir_knowledge_base(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        embedding VECTOR(384), -- Tamanho do vetor para all-MiniLM-L6-v2
        chunk_index INT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );
    ```

  - **Script 2: Criar a nova função de match**
    ```sql
    -- Cria a função para buscar chunks por similaridade
    CREATE OR REPLACE FUNCTION match_dir_knowledge_base_chunks (
      query_embedding VECTOR(384),
      match_threshold FLOAT,
      match_count INT
    )
    RETURNS TABLE (id BIGINT, content TEXT, similarity FLOAT) 
    AS $$
    BEGIN
      RETURN QUERY 
      SELECT
        chunks.id,
        chunks.content,
        1 - (chunks.embedding <=> query_embedding) AS similarity
      FROM dir_knowledge_base_chunks AS chunks
      WHERE 1 - (chunks.embedding <=> query_embedding) > match_threshold
      ORDER BY chunks.embedding <=> query_embedding
      LIMIT match_count;
    END;
    $$ LANGUAGE plpgsql;
    ```

- [ ] **12.4: Refatorar o Script de Indexação (`create_knowledge_base.py`)**
  - [ ] O script `scripts/create_knowledge_base.py` será simplificado para importar e usar o `KnowledgeBaseService`, delegando toda a lógica complexa.

- [ ] **12.5: Refatorar a Inicialização do Servidor (`main.py`)**
  - [ ] A função `lifespan` será atualizada para usar o `SupabaseVectorStore` apontando para a nova tabela `dir_knowledge_base_chunks`.

- [ ] **12.6: Instruções de Execução**
  - [ ] Fornecer um guia claro para executar os novos scripts SQL no Supabase e, em seguida, rodar o script de indexação refatorado.

