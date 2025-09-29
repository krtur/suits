import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
from supabase.client import Client, create_client
from langchain_community.vectorstores import SupabaseVectorStore

from app.routers import agent_routes
from app.logger_config import logger
from app.config import settings
from app.services.embedding_service import embedding_service
from app.services.retriever_service import retriever_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Lógica de Startup ---
    logger.info("Servidor iniciando... Configurando retrievers por área jurídica")
    
    try:
        # Configurar cliente Supabase
        supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        logger.info("Cliente Supabase configurado com sucesso")
        
        # Configurar retrievers por área jurídica
        legal_areas = {
            'civil': 'Código Civil Brasileiro',
            'penal': 'Código Penal Brasileiro', 
            'processual_penal': 'Código de Processo Penal Brasileiro'
        }
        
        for area, title_filter in legal_areas.items():
            try:
                logger.info(f"[DEBUG] Iniciando configuração para área: {area}")
                logger.info(f"[DEBUG] Title filter: {title_filter}")
                
                # Criar função SQL específica para esta área
                area_function_name = f"match_documents_{area}_area"
                logger.info(f"[DEBUG] Criando função SQL específica: {area_function_name}")
                
                # Executar SQL para criar função específica da área
                create_function_sql = f"""
CREATE OR REPLACE FUNCTION {area_function_name}(
  query_embedding vector(384),
  match_count int DEFAULT 10
)
RETURNS TABLE(
  id bigint,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    chunks.id,
    chunks.content,
    (chunks.embedding <=> query_embedding) * -1 + 1 AS similarity
  FROM dir_knowledge_base_chunks chunks
  INNER JOIN dir_knowledge_base kb ON chunks.document_id = kb.id
  WHERE 
    kb.legal_area = '{area}'
  ORDER BY chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

GRANT EXECUTE ON FUNCTION {area_function_name} TO anon, authenticated;
"""
                
                # Executar criação da função
                try:
                    supabase.rpc("exec_sql", {"query": create_function_sql})
                    logger.info(f"[DEBUG] Função SQL criada: {area_function_name}")
                except Exception as sql_error:
                    logger.warning(f"[DEBUG] Erro ao criar função SQL: {sql_error}")
                
                # Criar vector store com função específica da área
                logger.info(f"[DEBUG] Criando SupabaseVectorStore para área: {area}")
                vector_store = SupabaseVectorStore(
                    client=supabase,
                    embedding=embedding_service,
                    table_name="dir_knowledge_base_chunks",
                    query_name=area_function_name,
                    chunk_size=1000
                )
                logger.info(f"[DEBUG] SupabaseVectorStore criado para área: {area}")
                
                # Configurar retriever
                logger.info(f"[DEBUG] Configurando retriever para área: {area}")
                retriever = vector_store.as_retriever(
                    search_type="similarity",
                    search_kwargs={
                        "k": 10
                    }
                )
                logger.info(f"[DEBUG] Retriever configurado para área: {area}")
                
                # Registrar retriever no serviço
                logger.info(f"[DEBUG] Registrando retriever para área: {area}")
                success = retriever_service.set_retriever(area, retriever)
                if success:
                    logger.success(f"Retriever configurado para área: {area}")
                else:
                    logger.warning(f"Falha ao configurar retriever para área: {area}")
                    
            except Exception as e:
                logger.error(f"[ERROR] Erro ao configurar retriever para área {area}: {e}")
                logger.error(f"[ERROR] Tipo do erro: {type(e)}")
                logger.error(f"[ERROR] Detalhes: {str(e)}")
                retriever_service.set_retriever(area, None)
        
        # Log das áreas disponíveis
        available_areas = retriever_service.list_available_areas()
        logger.info(f"Áreas jurídicas disponíveis: {available_areas}")
        
        # Manter compatibilidade com código existente
        civil_retriever = retriever_service.get_retriever('civil')
        retriever_service.set_civil_code_retriever(civil_retriever)
        
        logger.success("Servidor pronto com retrievers multi-área configurados")
            
    except Exception as e:
        logger.error(f"Erro na inicialização dos retrievers: {e}", exc_info=True)
        # Fallback: configurar retrievers como None
        for area in ['civil', 'penal', 'processual_penal']:
            retriever_service.set_retriever(area, None)
        logger.warning("Sistema funcionará sem RAG devido a erro na inicialização")

    yield
    # --- Lógica de Shutdown (se necessário) ---
    logger.info("Servidor finalizado.")

# Cria a instância principal da aplicação FastAPI
app = FastAPI(
    title="M&M Direito - API",
    description="API para os agentes inteligentes e serviços do projeto M&M Direito.",
    version="1.0.0",
    lifespan=lifespan # Adiciona o gerenciador de ciclo de vida
)

# --- Caminho para o Frontend ---
# Define o caminho relativo para a pasta do frontend
frontend_dir = os.path.join(os.path.dirname(__file__), '..', 'frontend')


# --- Inclusão dos Routers da API ---
# As rotas da API devem vir antes das rotas do frontend para terem prioridade
app.include_router(agent_routes.router)

# --- Servir o Frontend ---

# 1. Servir os arquivos estáticos (CSS, JS, Imagens)
app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dir, 'assets')), name="assets")

# 2. Servir o index.html para a rota raiz
@app.get("/", response_class=FileResponse, tags=["Frontend"])
async def read_index():
    """Serve a página principal da aplicação (index.html)."""
    return os.path.join(frontend_dir, 'index.html')

# 3. Servir as outras páginas HTML da pasta /pages
@app.get("/pages/{page_name}.html", response_class=FileResponse, include_in_schema=False)
async def read_other_pages(page_name: str):
    """Serve outras páginas HTML a partir da pasta 'pages'."""
    return os.path.join(frontend_dir, 'pages', f"{page_name}.html")

# Para executar o servidor, use o comando no terminal, dentro da pasta 'packages/backend':
# python -m uvicorn main:app --reload
