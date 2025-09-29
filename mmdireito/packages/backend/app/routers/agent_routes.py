from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional
from langchain_core.messages import SystemMessage

from app.services.contract_chat_service import contract_chat_service
from app.services.devil_advocate_service import devil_advocate_service
from app.services.civil_agent_service import civil_agent_service
from app.services.penal_agent_service import penal_agent_service
from app.services.file_processing_service import extract_text_from_file
from app.logger_config import logger

# Cria um novo router para os endpoints do agente
router = APIRouter(
    prefix="/agent",
    tags=["Agent Endpoints"]
)

# --- Modelos de Dados (Data Models) ---

class ChatRequest(BaseModel):
    """Modelo para o corpo da requisição de chat."""
    session_id: str
    message: str

class ChatResponse(BaseModel):
    """Modelo para o corpo da resposta do chat."""
    session_id: str
    response: str

class UploadResponse(BaseModel):
    """Modelo para a resposta do endpoint de upload."""
    filename: str
    message: str
    follow_up_question: Optional[str] = None
    suggested_actions: Optional[List[str]] = Field(default_factory=list)

# Mapeamento de agentes para seus respectivos serviços
agent_services = {
    "contract-analyzer": contract_chat_service,
    "devil-advocate": devil_advocate_service,
    "agente-civil": civil_agent_service,
    "agente-penal": penal_agent_service,
}

@router.post("/chat/{agent_name}")
async def chat_with_agent(agent_name: str, request: ChatRequest):
    """
    Endpoint genérico para chat com qualquer agente.
    """
    session_id = request.session_id
    user_message = request.message
    logger.info(
        f"Recebida requisição de chat para o agente '{agent_name}' na sessão: {session_id}",
        context=f'message="{user_message[:50]}..."'
    )
    logger.info(f"[DEBUG] Request completo - session_id: '{session_id}', message: '{user_message}'")

    # Verifica se o agente solicitado existe
    if agent_name not in agent_services:
        raise HTTPException(status_code=404, detail=f"Agente '{agent_name}' não encontrado.")

    try:
        # Seleciona o serviço do agente e processa a mensagem
        service = agent_services[agent_name]
        response_content = await service.process_message(user_message, session_id)
        return JSONResponse(content={"response": response_content})
    
    except Exception as e:
        logger.error(
            f"Erro crítico no endpoint de chat para o agente '{agent_name}' na sessão {session_id}: '{e}'",
            context=f'request="{request.model_dump_json()}"',
            exc_info=True
        )
        return JSONResponse(
            status_code=500, 
            content={"detail": "Ocorreu um erro interno no servidor."}
        )

@router.post("/upload-contract", response_model=UploadResponse)
async def upload_contract(session_id: str = Form(...), file: UploadFile = File(...)):
    """
    Endpoint para fazer upload de um arquivo de contrato (PDF ou DOCX).
    Extrai o texto e o adiciona ao histórico da sessão de chat.
    """
    logger.info(f"Recebido upload de arquivo para a sessão: {session_id}, arquivo: {file.filename}")

    try:
        # 1. Extrai o texto do arquivo usando o serviço
        extracted_text = extract_text_from_file(file)

        # 2. Configura o retriever para a sessão, combinando o contrato com o Código Civil
        setup_retriever_for_session(session_id, extracted_text)

        logger.info(f"Retriever para o arquivo {file.filename} criado para a sessão {session_id}")

        return UploadResponse(
            filename=file.filename,
            message=f"O contrato '{file.filename}' foi carregado e está pronto para análise.",
            follow_up_question="O que você gostaria de fazer com este contrato?",
            suggested_actions=[
                "Faça uma análise detalhada de riscos",
                "Liste as principais obrigações das partes",
                "Tire uma dúvida específica"
            ]
        )

    except ValueError as e:
        # Erro de validação (tipo/tamanho)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Outros erros de extração
        logger.error(f"Erro crítico no endpoint de upload para a sessão {session_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
