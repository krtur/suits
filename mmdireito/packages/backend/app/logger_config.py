import sys
from loguru import logger

# Remove o handler padrão para ter controle total sobre a configuração
logger.remove()

# Define o formato do log, alinhado com o documento LOGS.md
# Usamos uma função para formatar o contexto de forma condicional
def formatter(record):
    log_format = (
        "[{time:YYYY-MM-DDTHH:mm:ss.SSS}Z] "
        "[{level: <7}] "
        "[{name}:{function}:{line}] - "
        "{message}"
    )

    if record["extra"].get("context"):
        log_format += " :: {extra[context]}\n"
    else:
        log_format += "\n"
    
    return log_format

# Adiciona um novo sink (saída) para o console com o formato e cores definidos
logger.add(
    sys.stderr,
    format=formatter,
    level="DEBUG",  # Nível mínimo de log a ser exibido
    colorize=True,
    backtrace=True, # Exibe stack traces completos em caso de erro
    diagnose=True   # Adiciona informações de diagnóstico em exceções
)

# Configuração de cores e níveis para alinhar com LOGS.md
logger.level("INFO", color="<blue>")
logger.level("DEBUG", color="<green>")
logger.level("WARNING", color="<yellow>")
logger.level("ERROR", color="<red>")
logger.level("CRITICAL", color="<bold><red>")

# Exporta o logger configurado para ser usado em outros módulos
__all__ = ["logger"]
