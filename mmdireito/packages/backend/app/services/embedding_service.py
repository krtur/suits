from langchain_huggingface import HuggingFaceEmbeddings
from app.logger_config import logger

class EmbeddingService:
    """Serviço para encapsular a geração de embeddings com um modelo local."""
    
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        """Inicializa o serviço com o modelo de embedding local."""
        try:
            # O modelo será baixado do Hugging Face Hub na primeira execução
            # e ficará em cache para usos futuros.
            self.embeddings_model = HuggingFaceEmbeddings(
                model_name=model_name,
                model_kwargs={'device': 'cpu'} # Garante que rode em CPU
            )
            logger.info(f"Modelo de embedding local '{model_name}' carregado com sucesso.")
        except Exception as e:
            logger.error(f"Erro ao carregar modelo de embedding local: {e}")
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
