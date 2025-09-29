import os
import sys
import argparse
from dotenv import load_dotenv

# Adiciona o diretório raiz do projeto ao path para permitir importações de módulos da app
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, project_root)

from app.services.knowledge_base_service import knowledge_base_service
from app.logger_config import logger

def main(pdf_path: str, title: str, legal_area: str = 'civil'):
    """Função principal que utiliza o KnowledgeBaseService para indexar um PDF."""
    if not os.path.exists(pdf_path):
        logger.error(f"Arquivo não encontrado: {pdf_path}")
        return

    try:
        knowledge_base_service.process_and_save_pdf(pdf_path, title, legal_area)
    except Exception as e:
        logger.error(f"Ocorreu um erro inesperado durante a indexação: {e}")

if __name__ == '__main__':
    # Garante que as variáveis de ambiente sejam carregadas antes de qualquer outra coisa
    load_dotenv(dotenv_path=os.path.join(project_root, '.env'))

    parser = argparse.ArgumentParser(description="Indexar um documento PDF na base de conhecimento do Supabase.")
    parser.add_argument("pdf_file", type=str, help="Caminho para o arquivo PDF a ser indexado.")
    parser.add_argument("title", type=str, help="Título do documento para referência.")
    parser.add_argument("--legal-area", type=str, default="civil", 
                       choices=["civil", "penal", "processual_penal", "trabalhista", "tributario", "empresarial", "constitucional"],
                       help="Área jurídica do documento (padrão: civil)")
    
    args = parser.parse_args()
    
    main(args.pdf_file, args.title, args.legal_area)
