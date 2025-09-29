from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from langchain_core.output_parsers import StrOutputParser
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_community.callbacks.manager import get_openai_callback
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains.history_aware_retriever import create_history_aware_retriever
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains import create_retrieval_chain
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain.retrievers import MergerRetriever

from app.config import settings
from app.logger_config import logger
from app.services.embedding_service import embedding_service
from app.services.retriever_service import retriever_service
from app.prompts import rag_prompt, conversational_prompt, contextualize_q_prompt

# --- Gerenciador de Sessão --- #
# Em produção, usaríamos Redis ou similar.
store = {}

def get_session_data(session_id: str) -> dict:
    """Obtém ou cria os dados da sessão (histórico e retriever)."""
    if session_id not in store:
        store[session_id] = {"history": ChatMessageHistory(), "retriever": None}
        logger.info(f"Nova sessão criada: {session_id}")
    return store[session_id]

def get_session_history(session_id: str) -> ChatMessageHistory:
    """Obtém o histórico de chat da sessão."""
    return get_session_data(session_id)["history"]

# --- Lógica de RAG (Retrieval-Augmented Generation) --- #

def create_retriever(text: str):
    """Cria um retriever a partir de um texto, usando embeddings e um vector store."""
    logger.info("Criando retriever a partir do texto do documento.")
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1500, chunk_overlap=200)
    documents = text_splitter.create_documents([text])
    
    # Usa o serviço de embedding local centralizado
    embeddings = embedding_service.get_embeddings()
    
    vector_store = FAISS.from_documents(documents, embeddings)
    return vector_store.as_retriever(search_kwargs={"k": 5})

def set_session_retriever(session_id: str, retriever):
    """Armazena o retriever na sessão do usuário."""
    get_session_data(session_id)["retriever"] = retriever
    logger.info(f"Retriever armazenado para a sessão: {session_id}")

def setup_retriever_for_session(session_id: str, contract_text: str):
    """Cria um retriever para o contrato e o combina com o retriever global do Código Civil."""
    logger.info(f"Configurando retriever para a sessão {session_id}.")
    
    # 1. Cria o retriever para o contrato específico
    contract_retriever = create_retriever(contract_text)

    # 2. Obtém o retriever do Código Civil a partir do serviço centralizado
    civil_code_retriever = retriever_service.get_civil_code_retriever()

    # 3. Combina com o retriever do Código Civil, se ele foi carregado
    if civil_code_retriever:
        logger.info(f"Combinando retriever do contrato com a base de conhecimento para a sessão {session_id}")
        merger = MergerRetriever(retrievers=[contract_retriever, civil_code_retriever])
        set_session_retriever(session_id, merger)
    else:
        logger.warning(f"Base de conhecimento do Código Civil não carregada. Usando apenas o retriever do contrato para a sessão {session_id}")
        set_session_retriever(session_id, contract_retriever)


# --- Construção das Cadeias (Chains) --- #

# Inicializa o modelo de chat do Google
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-pro",
    google_api_key=settings.GOOGLE_API_KEY,
    temperature=0.2
)

# Função para obter documentos relevantes
def get_relevant_documents(session_id: str, query: str):
    """Busca documentos relevantes usando o retriever da sessão."""
    logger.debug(f"Buscando documentos para sessão {session_id} com query: {query}")
    try:
        retriever = get_session_data(session_id)["retriever"]
        if retriever:
            docs = retriever.invoke(query)  # Usando invoke em vez do método deprecated
            logger.debug(f"Encontrados {len(docs)} documentos relevantes")
            return docs
        logger.warning(f"Nenhum retriever encontrado para sessão {session_id}")
        return []
    except Exception as e:
        logger.error(f"Erro ao buscar documentos: {e}")
        return []

# 1. Cadeia RAG simplificada
def create_rag_response(session_id: str, query: str, chat_history: list):
    """Cria resposta RAG combinando contrato + leis civis."""
    logger.debug(f"Criando resposta RAG para sessão {session_id}")
    
    try:
        # Busca documentos relevantes (contrato + leis civis)
        logger.debug("Iniciando busca de documentos...")
        docs = get_relevant_documents(session_id, query)
        logger.debug(f"Busca concluída. Documentos encontrados: {len(docs) if docs else 0}")
        
        if not docs:
            logger.warning("Nenhum documento encontrado")
            return "Não foi possível encontrar informações relevantes para sua consulta."
        
        # Combina os documentos
        logger.debug("Combinando documentos...")
        context = "\n\n".join([doc.page_content for doc in docs])
        logger.debug(f"Contexto criado com {len(context)} caracteres")
    except Exception as e:
        logger.error(f"Erro na busca/combinação de documentos: {e}", exc_info=True)
        return f"Erro ao buscar informações: {str(e)}"
    
    try:
        # Monta a cadeia RAG usando o prompt importado
        rag_chain_with_context = (
            RunnablePassthrough.assign(
                context=(lambda x: context) # Injeta o contexto dos documentos
            )
            | rag_prompt
            | llm
            | StrOutputParser()
        )

        logger.debug("Invocando a cadeia RAG com contexto...")
        # Invoca a cadeia com os dados necessários
        response = rag_chain_with_context.invoke({
            "input": query,
            "chat_history": chat_history
        })
        
        logger.debug("Resposta RAG gerada com sucesso")
        return response
        
    except Exception as e:
        logger.error(f"Erro na criação da resposta RAG: {e}", exc_info=True)
        return f"Erro ao processar a análise: {str(e)}"

# Chain simples que funciona
rag_chain = RunnableLambda(lambda x: create_rag_response(
    x["session_id"], 
    x["input"], 
    x.get("chat_history", [])
))

# 2. Cadeia Conversacional (padrão, sem documento)
conversational_chain = conversational_prompt | llm

# 3. Cadeia principal com lógica de roteamento e gerenciamento de histórico
def route(info):
    """Decide qual cadeia (RAG ou conversacional) executar com base na presença de um retriever."""
    session_id = info.get("session_id")
    logger.debug(f"Roteando para a sessão: {session_id}. Info recebido: {info}")
    
    if session_id and get_session_data(session_id)["retriever"]:
        logger.debug(f"Sessão {session_id}: Roteando para RAG chain (retriever encontrado).")
        return rag_chain
    
    logger.debug(f"Sessão {session_id}: Roteando para Conversational chain (sem retriever).")
    return conversational_chain

chain_with_history = RunnableWithMessageHistory(
    RunnableLambda(route),
    get_session_history,
    input_messages_key="input",
    history_messages_key="chat_history",
    output_messages_key="answer",
)


class ContractChatService:
    """Serviço para gerenciar a lógica de chat de análise de contratos."""

    async def process_message(self, user_message: str, session_id: str) -> str:
        """Processa a mensagem do usuário e retorna a resposta do agente."""
        logger.debug(
            f"Processando mensagem para a sessão {session_id}", 
            context=f'user_message="{user_message[:50]}..."'
        )
        
        try:
            config = {"configurable": {"session_id": session_id}}
            input_data = {"input": user_message, "session_id": session_id}
            logger.debug(f"Input data preparado: {input_data}")
            logger.debug(f"Config preparado: {config}")
            
            with get_openai_callback() as cb:
                logger.debug("Iniciando chamada para chain_with_history.invoke...")
                # Passa a session_id diretamente no dicionário de input
                response = await chain_with_history.ainvoke(input_data, config=config)
                logger.debug(f"Resposta recebida: {type(response)} = {response}")
                
                # A resposta pode ser string (nossa função) ou dict/AIMessage (chains complexas)
                if isinstance(response, str):
                    logger.debug("Resposta é uma string direta")
                    response_content = response
                elif isinstance(response, dict):
                    logger.debug("Resposta é um dicionário, buscando chave 'answer'")
                    response_content = response.get("answer", str(response))
                else:
                    logger.debug("Resposta é um AIMessage, acessando .content")
                    response_content = response.content
                
                logger.debug(f"Conteúdo final extraído: {response_content[:100]}...")

                # Log de uso de tokens
                history = get_session_history(session_id)
                logger.info(
                    f"Estatísticas de uso para a sessão {session_id}",
                    context={
                        "history_length": len(history.messages),
                        "input_tokens": cb.prompt_tokens,
                        "output_tokens": cb.completion_tokens,
                        "total_tokens": cb.total_tokens,
                        "total_cost_usd": f"${cb.total_cost:.6f}"
                    }
                )

            logger.info(
                f"Resposta gerada com sucesso para a sessão {session_id}",
                context=f'response="{response_content[:50]}..."'
            )
            return response_content
        except Exception as e:
            logger.error(
                f"Erro ao processar a mensagem na sessão {session_id}: {e}",
                context=f'user_message="{user_message[:50]}..."', 
                exc_info=True
            )
            return "Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente."


# Função auxiliar para limpar a memória
def clear_session_memory(session_id: str):
    if session_id in store:
        del store[session_id]
        logger.info(f"Sessão {session_id} foi limpa.")
        return True
    return False

# Instância única do serviço
contract_chat_service = ContractChatService()
