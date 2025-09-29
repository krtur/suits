from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_community.chat_message_histories import ChatMessageHistory

from app.config import settings
from app.prompts import agente_civil_prompt
from app.logger_config import logger


# --- Gerenciador de Sessão --- #
# Em produção, usaríamos Redis ou similar.
store = {}

def get_session_history(session_id: str):
    """Obtém o histórico da sessão ou cria um novo."""
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
        logger.info(f"Nova sessão criada para Agente Civil: {session_id}")
    return store[session_id]

# --- Construção da Chain --- #

# Inicializa o modelo de chat com gemini-2.5-flash
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=settings.GOOGLE_API_KEY,
    temperature=0.1  # Mais preciso para questões jurídicas
)

# Cria a cadeia de conversação simples
conversational_chain = agente_civil_prompt | llm

# Adiciona o gerenciamento de histórico à cadeia
chain_with_history = RunnableWithMessageHistory(
    conversational_chain,
    get_session_history,
    input_messages_key="input",
    history_messages_key="chat_history",
)

class CivilAgentService:
    """Serviço para gerenciar a lógica do agente Especialista em Código Civil."""

    async def process_message(self, user_message: str, session_id: str) -> str:
        """Processa a mensagem do usuário e retorna a resposta do agente."""
        logger.debug(f"Processando mensagem para Agente Civil na sessão {session_id}")
        
        try:
            config = {"configurable": {"session_id": session_id}}
            response = await chain_with_history.ainvoke(
                {"input": user_message},
                config=config
            )
            return response.content
        except Exception as e:
            logger.error(
                f"Erro ao processar mensagem para Agente Civil na sessão {session_id}: {e}",
                exc_info=True
            )
            return "Desculpe, ocorreu um erro ao processar sua consulta sobre o Código Civil. Por favor, tente novamente."

# Instância única do serviço
civil_agent_service = CivilAgentService()
