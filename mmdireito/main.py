import subprocess
import os
import sys

def run_backend():
    """Inicia o servidor Uvicorn para a aplicação backend."""
    backend_dir = os.path.join(os.path.dirname(__file__), 'packages', 'backend')
    
    if not os.path.isdir(backend_dir):
        print(f"Erro: Diretório do backend não encontrado em '{backend_dir}'")
        return

    print(f"Iniciando o servidor backend em: {backend_dir}")
    print("Pressione CTRL+C para parar o servidor.")

    # Garante que estamos usando o mesmo interpretador Python
    command = [
        sys.executable,
        "-m",
        "uvicorn",
        "main:app",
        "--reload"
    ]
    
    try:
        # O argumento `cwd` executa o comando no diretório especificado
        process = subprocess.Popen(command, cwd=backend_dir)
        process.wait()
    except KeyboardInterrupt:
        print("\nParando o servidor backend.")
        process.terminate()
    except FileNotFoundError:
        print("\nErro: Comando 'uvicorn' não encontrado.")
        print("Certifique-se de que as dependências do backend (de 'packages/backend/requirements.txt') estão instaladas.")
    except Exception as e:
        print(f"\nOcorreu um erro inesperado: {e}")

if __name__ == "__main__":
    run_backend()
