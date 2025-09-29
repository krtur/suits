import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from app.logger_config import logger
from app.config import settings

class EmbeddingService:
    """Serviço para encapsular a geração de embeddings com a API do Google."""
    
    def __init__(self, model_name: str = "models/embedding-001"):
        """Inicializa o serviço com o modelo de embedding do Google."""
        if not settings.GOOGLE_API_KEY:
            logger.error("A variável de ambiente GOOGLE_API_KEY não está configurada.")
            raise ValueError("GOOGLE_API_KEY não encontrada.")
        
        try:
            self.embeddings_model = GoogleGenerativeAIEmbeddings(
                model=model_name,
                google_api_key=settings.GOOGLE_API_KEY
            )
            logger.info(f"Modelo de embedding do Google '{model_name}' configurado com sucesso.")
        except Exception as e:
            logger.error(f"Erro ao configurar o modelo de embedding do Google: {e}")
            raise

    def get_embeddings(self):
        """Retorna a instância do modelo de embedding."""
        return self.embeddings_model
    
    def embed_query(self, text: str):
        """Gera embedding para uma query de texto."""
        return self.embeddings_model.embed_query(text)
    
    def embed_documents(self, texts: list):
        """Gera embeddings para uma lista de documentos."""
        return self.embeddings_model.embed_documents(texts)

# Instância global do serviço para ser usada em toda a aplicação
embedding_service = EmbeddingService()
