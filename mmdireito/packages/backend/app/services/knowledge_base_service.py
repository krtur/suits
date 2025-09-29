import pypdf
from typing import List, Dict, Any
from langchain.text_splitter import RecursiveCharacterTextSplitter
from supabase.client import Client, create_client

from app.config import settings
from app.logger_config import logger
from app.services.embedding_service import embedding_service

class KnowledgeBaseService:
    """Serviço para gerenciar a base de conhecimento no Supabase."""

    def __init__(self):
        self.supabase_client: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        self.embedding_service = embedding_service

    def _extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extrai texto de um arquivo PDF."""
        logger.info(f"Extraindo texto de: {pdf_path}")
        try:
            with open(pdf_path, 'rb') as f:
                pdf_reader = pypdf.PdfReader(f)
                text = "\n".join(page.extract_text() for page in pdf_reader.pages)
            logger.success(f"Texto extraído com sucesso ({len(text)} caracteres).")
            return text
        except Exception as e:
            logger.error(f"Falha ao extrair texto do PDF: {e}")
            raise

    def _split_text_into_chunks(self, text: str) -> List[str]:
        """Divide o texto em chunks."""
        logger.info("Dividindo texto em chunks...")
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len
        )
        chunks = text_splitter.split_text(text)
        logger.success(f"Texto dividido em {len(chunks)} chunks.")
        return chunks

    def process_and_save_pdf(self, pdf_path: str, document_title: str, legal_area: str = 'civil') -> None:
        """Orquestra o processo completo de indexação de um PDF."""
        # Validar área jurídica
        valid_areas = ['civil', 'penal', 'processual_penal', 'trabalhista', 'tributario', 'empresarial', 'constitucional']
        if legal_area not in valid_areas:
            logger.error(f"Área jurídica inválida: {legal_area}. Áreas válidas: {valid_areas}")
            raise ValueError(f"Área jurídica '{legal_area}' não é válida. Use uma das seguintes: {', '.join(valid_areas)}")
        
        logger.info(f"Iniciando indexação do documento '{document_title}' na área jurídica: {legal_area}")
        
        # 1. Extrair e dividir o texto
        text = self._extract_text_from_pdf(pdf_path)
        chunks = self._split_text_into_chunks(text)

        # 2. Criar o documento principal
        logger.info("Criando registro do documento principal...")
        try:
            doc_response = self.supabase_client.table('dir_knowledge_base').insert({
                'title': document_title,
                'total_chunks': len(chunks),
                'legal_area': legal_area
            }).execute()

            if not doc_response.data:
                raise Exception("Falha ao criar o registro do documento principal no Supabase.")
            
            document_id = doc_response.data[0]['id']
            logger.success(f"Documento principal criado com ID: {document_id}")

        except Exception as e:
            logger.error(f"Erro ao salvar documento principal: {e}")
            return

        # 3. Gerar embeddings e salvar os chunks
        logger.info("Gerando embeddings e salvando chunks...")
        try:
            embeddings_model = self.embedding_service.get_embeddings()
            embeddings = embeddings_model.embed_documents(chunks)

            chunk_records = []
            for i, chunk in enumerate(chunks):
                chunk_records.append({
                    'document_id': document_id,
                    'content': chunk,
                    'embedding': embeddings[i],
                    'chunk_index': i
                })
            
            # Inserir todos os chunks de uma vez
            self.supabase_client.table('dir_knowledge_base_chunks').insert(chunk_records).execute()
            logger.success(f"{len(chunk_records)} chunks salvos com sucesso no Supabase.")

        except Exception as e:
            logger.error(f"Erro ao gerar embeddings ou salvar chunks: {e}")
            # Limpeza: se a inserção dos chunks falhar, remove o documento principal
            logger.warning(f"Removendo documento principal (ID: {document_id}) devido a falha na indexação dos chunks.")
            self.supabase_client.table('dir_knowledge_base').delete().eq('id', document_id).execute()
            return

        logger.info("Processo de indexação concluído.")

# Instância global do serviço
knowledge_base_service = KnowledgeBaseService()
