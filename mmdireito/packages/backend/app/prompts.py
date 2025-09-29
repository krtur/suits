import os
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

def load_prompt_from_file(filename: str) -> str:
    """Carrega o conteúdo de um prompt a partir de um arquivo de texto."""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(base_dir, 'prompts', filename)
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        # Log do erro seria ideal aqui, mas por simplicidade retornamos uma mensagem
        return f"Erro Crítico: Arquivo de prompt '{filename}' não encontrado."

# --- Prompt para o Analisador de Contratos (RAG) ---
# Carrega os system prompts para cada agente
rag_system_prompt = load_prompt_from_file('rag_system_prompt.txt')
conversational_system_prompt = load_prompt_from_file('conversational_system_prompt.txt')
devil_advocate_system_prompt = load_prompt_from_file('devil_advocate_system_prompt.txt')
agente_civil_system_prompt = load_prompt_from_file('AgenteCivil_system_prompt.txt')

# --- Estruturação dos ChatPrompts ---

# Prompt para o Analisador de Contratos (RAG)
rag_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", rag_system_prompt),
        ("system", """CONTEXTO DO CONTRATO:
{context}

Use SEMPRE as informações do contexto acima para sua análise. O contrato já foi carregado e processado."""),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
    ]
)

# Prompt para o modo de chat conversacional (sem RAG)
conversational_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", conversational_system_prompt),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
    ]
)

# Prompt para o Advogado do Diabo
devil_advocate_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", devil_advocate_system_prompt),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
    ]
)

# Prompt para o Agente Civil
agente_civil_prompt = ChatPromptTemplate.from_messages([
    ("system", agente_civil_system_prompt),
    MessagesPlaceholder(variable_name="history"),
    ("human", "{input}")
])

# Carregamento do prompt do Agente Penal
agente_penal_system_prompt = load_prompt_from_file("AgentePenal_system_prompt.txt")

agente_penal_prompt = ChatPromptTemplate.from_messages([
    ("system", agente_penal_system_prompt),
    MessagesPlaceholder(variable_name="history"),
    ("human", "{input}")
])

# Prompt para reescrever a pergunta do usuário com base no histórico
contextualize_q_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "Dada a conversa abaixo e a pergunta seguinte, reformule a pergunta para ser uma pergunta independente, em seu idioma original. Se a pergunta já for independente, retorne-a como está."),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
    ]
)
