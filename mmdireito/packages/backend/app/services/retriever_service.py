# app/services/retriever_service.py
from typing import Dict, List, Optional
from langchain.retrievers import MergerRetriever
from app.logger_config import logger

class RetrieverService:
    """Serviço para gerenciar retrievers por área jurídica."""

    def __init__(self):
        self._retrievers: Dict[str, any] = {
            'civil': None,
            'penal': None,
            'processual_penal': None,
            'trabalhista': None,
            'tributario': None
        }

    def set_retriever(self, legal_area: str, retriever):
        """Armazena retriever para uma área jurídica específica."""
        if legal_area not in self._retrievers:
            logger.warning(f"Área jurídica '{legal_area}' não reconhecida. Áreas válidas: {list(self._retrievers.keys())}")
            return False
        
        self._retrievers[legal_area] = retriever
        logger.info(f"Retriever configurado para área: {legal_area}")
        return True

    def get_retriever(self, legal_area: str):
        """Obtém retriever de uma área jurídica específica."""
        retriever = self._retrievers.get(legal_area)
        if not retriever:
            logger.warning(f"Retriever não encontrado para área: {legal_area}")
        return retriever

    def get_combined_retriever(self, legal_areas: List[str]):
        """Combina retrievers de múltiplas áreas jurídicas."""
        available_retrievers = []
        
        for area in legal_areas:
            retriever = self.get_retriever(area)
            if retriever:
                available_retrievers.append(retriever)
            else:
                logger.warning(f"Retriever não disponível para área: {area}")
        
        if not available_retrievers:
            logger.error(f"Nenhum retriever disponível para as áreas: {legal_areas}")
            return None
        
        if len(available_retrievers) == 1:
            return available_retrievers[0]
        
        # Combina múltiplos retrievers
        logger.info(f"Combinando retrievers das áreas: {legal_areas}")
        return MergerRetriever(retrievers=available_retrievers)

    def list_available_areas(self) -> List[str]:
        """Lista áreas jurídicas com retrievers configurados."""
        return [area for area, retriever in self._retrievers.items() if retriever is not None]

    # Métodos de compatibilidade com código existente
    def set_civil_code_retriever(self, retriever):
        """Compatibilidade: armazena retriever do Código Civil."""
        return self.set_retriever('civil', retriever)

    def get_civil_code_retriever(self):
        """Compatibilidade: obtém retriever do Código Civil."""
        return self.get_retriever('civil')

# Instância global para ser usada como um singleton
retriever_service = RetrieverService()
