import os
from dotenv import load_dotenv

# Carrega as variáveis de ambiente do arquivo .env que está na pasta 'backend'
# O caminho é relativo à localização deste arquivo (app/config.py)
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path=dotenv_path)

class Settings:
    """Classe para centralizar as configurações da aplicação."""
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY")
    SUPABASE_URL: str = os.getenv("SUPABASE_URL")
    SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY")

settings = Settings()

# Validação para garantir que as variáveis de ambiente foram carregadas
if not settings.GOOGLE_API_KEY:
    raise ValueError("A variável de ambiente GOOGLE_API_KEY não foi definida no arquivo .env")
if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
    raise ValueError("As variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_KEY devem ser definidas no arquivo .env")
