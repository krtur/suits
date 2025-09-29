from fastapi import UploadFile
import pypdf
import docx
import io

from app.logger_config import logger

# Define os tipos de MIME permitidos e o tamanho máximo do arquivo (em bytes)
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

def extract_text_from_file(file: UploadFile) -> str:
    """
    Extrai o texto de um arquivo PDF ou DOCX enviado.

    Args:
        file: O arquivo enviado via FastAPI.

    Returns:
        O texto extraído do arquivo.

    Raises:
        ValueError: Se o tipo de arquivo ou o tamanho for inválido.
        Exception: Para outros erros de extração.
    """
    # 1. Validação de tamanho
    if file.size > MAX_FILE_SIZE:
        logger.warning(f"Tentativa de upload de arquivo muito grande: {file.filename}, {file.size} bytes")
        raise ValueError(f"O arquivo excede o tamanho máximo de {MAX_FILE_SIZE / 1024 / 1024} MB.")

    # 2. Validação de tipo
    if file.content_type not in ALLOWED_MIME_TYPES:
        logger.warning(f"Tentativa de upload de tipo de arquivo inválido: {file.filename}, {file.content_type}")
        raise ValueError(f"Tipo de arquivo não suportado. Apenas PDF e DOCX são permitidos.")

    logger.info(f"Iniciando extração de texto para o arquivo: {file.filename}")

    try:
        content = file.file.read()
        file.file.seek(0) # Retorna o ponteiro para o início do arquivo

        if file.content_type == "application/pdf":
            pdf_reader = pypdf.PdfReader(io.BytesIO(content))
            text = "\n".join(page.extract_text() for page in pdf_reader.pages)
        elif file.content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            doc = docx.Document(io.BytesIO(content))
            text = "\n".join(para.text for para in doc.paragraphs)
        
        logger.info(f"Texto extraído com sucesso do arquivo: {file.filename}")
        return text
    except Exception as e:
        logger.error(f"Falha ao extrair texto do arquivo {file.filename}: {e}")
        raise Exception("Ocorreu um erro ao processar o arquivo. Ele pode estar corrompido.")
