"""
Módulo de prompts para os diferentes agentes do sistema.
"""

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

# Prompt para RAG (Analisador de Contratos)
rag_prompt = ChatPromptTemplate.from_messages([
    ("system", """Você é um assistente jurídico especializado em direito civil brasileiro e análise de contratos. 
    
Use as informações fornecidas no contexto abaixo para responder às perguntas de forma precisa e detalhada:

{context}

IMPORTANTE: Baseie suas respostas APENAS nas informações do contexto fornecido. Se não houver informação suficiente no contexto, informe isso claramente."""),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{input}")
])

# Prompt conversacional (sem RAG)
conversational_prompt = ChatPromptTemplate.from_messages([
    ("system", "Você é um assistente jurídico especializado em direito civil brasileiro. Responda de forma educativa e profissional."),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{input}")
])

# Prompt para contextualizar perguntas
contextualize_q_prompt = ChatPromptTemplate.from_messages([
    ("system", "Dada uma conversa e a pergunta mais recente do usuário, reformule a pergunta para que seja compreensível sem o contexto da conversa."),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{input}")
])

# Prompt do Advogado do Diabo
def load_devil_advocate_prompt():
    """Carrega o prompt do Advogado do Diabo do arquivo."""
    try:
        with open("app/prompts/devil_advocate_system_prompt.txt", "r", encoding="utf-8") as f:
            content = f.read()
        return ChatPromptTemplate.from_messages([
            ("system", content),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}")
        ])
    except FileNotFoundError:
        return conversational_prompt

# Prompt do Agente Civil
def load_agente_civil_prompt():
    """Carrega o prompt do Agente Civil do arquivo."""
    try:
        with open("app/prompts/AgenteCivil_system_prompt.txt", "r", encoding="utf-8") as f:
            content = f.read()
        return ChatPromptTemplate.from_messages([
            ("system", content),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}")
        ])
    except FileNotFoundError:
        return conversational_prompt

# Prompt do Agente Penal
def load_agente_penal_prompt():
    """Carrega o prompt do Agente Penal do arquivo."""
    try:
        with open("app/prompts/AgentePenal_system_prompt.txt", "r", encoding="utf-8") as f:
            content = f.read()
        return ChatPromptTemplate.from_messages([
            ("system", content),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}")
        ])
    except FileNotFoundError:
        return conversational_prompt

# Instanciar os prompts
devil_advocate_prompt = load_devil_advocate_prompt()
agente_civil_prompt = load_agente_civil_prompt()
agente_penal_prompt = load_agente_penal_prompt()

# Carregamento direto do prompt penal como string para RAG simples
def load_agente_penal_prompt_text():
    """Carrega apenas o texto do prompt do Agente Penal."""
    try:
        with open("app/prompts/AgentePenal_system_prompt.txt", "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return "Você é um assistente jurídico especializado em Direito Penal e Processual Penal brasileiro."

# Constante para compatibilidade
AGENTE_PENAL_PROMPT = load_agente_penal_prompt_text()
