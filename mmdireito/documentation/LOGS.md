# Padrão e Estrutura de Logs do Servidor

## 1. Introdução

Este documento define o padrão oficial para a geração de logs em todos os serviços do backend. A adesão a este padrão é crucial para garantir que os logs sejam consistentes, informativos e facilmente analisáveis por desenvolvedores e sistemas de monitoramento automatizado.

O objetivo é permitir a rápida identificação de problemas, auditorias de eventos e análise de performance.

## 2. Formato do Log

Cada entrada de log deve seguir um formato estruturado para garantir a consistência. O formato padrão é:

`[TIMESTAMP] [LOG_LEVEL] [MÓDULO] - Mensagem Principal :: {contexto}`

**Exemplo:**
`[2025-09-14T17:30:05.123Z] [INFO] [AuthService] - Tentativa de login para o usuário 'ana.silva' iniciada :: {ip="192.168.1.10"}`

### Detalhes dos Componentes:

* **`[TIMESTAMP]`**: Data e hora exatas em que o evento ocorreu.
    * **Formato:** Padrão ISO 8601 `YYYY-MM-DDTHH:MM:SS.sssZ`.
    * **Motivo:** É um formato universal, não ambíguo e facilmente interpretado por máquinas e humanos.

* **`[LOG_LEVEL]`**: O nível de severidade do log. Define a importância e a urgência do evento.

* **`[MÓDULO]`**: Identifica a origem do log dentro da aplicação. Pode ser um serviço, um controller ou um componente específico (ex: `[Database]`, `[AgentChatbotService]`, `[UserRoutes]`).

* **`Mensagem Principal`**: Uma descrição curta, clara e legível por humanos sobre o que aconteceu.

* **`{contexto}`**: (Opcional, mas altamente recomendado) Um conjunto de pares `chave=valor` contendo informações detalhadas e estruturadas sobre o evento. Isso é essencial para uma depuração eficaz.
    * **Exemplos de contexto:** `userId`, `requestId`, `ip`, `parametrosDeEntrada`, `duracaoMs`, etc.

## 3. Níveis de Log e Cores

Os seguintes níveis de log devem ser utilizados. As cores são uma diretriz para a **visualização no console** em ambiente de desenvolvimento, para facilitar a identificação visual.

---

### 🟢 `[DEBUG]` - Cor Verde
* **Uso:** Informações detalhadas e de baixo nível, úteis apenas durante o desenvolvimento e a depuração de um problema específico. Geralmente são desativados em produção.
* **Exemplo:**
    ```log
    [2025-09-14T17:32:10.450Z] [DEBUG] [AgentChatbotService] - Payload recebido para processamento :: {userId="usr_123", message="Qual o status do meu pedido?"}
    ```

---

### 🟡 `[WARNING]` - Cor Amarela
* **Uso:** Eventos inesperados ou problemas que não interrompem o funcionamento do sistema, mas que devem ser observados. Podem indicar potenciais falhas futuras.
* **Exemplos:**
    * Tentativa de login com senha incorreta.
    * Uso de uma função obsoleta (deprecated).
    * Uma chamada de API externa demorando mais que o esperado.
* **Exemplo de Log:**
    ```log
    [2025-09-14T17:35:15.800Z] [WARNING] [AuthService] - Falha na tentativa de login :: {user="admin", reason="Senha inválida", ip="203.0.113.75"}
    ```

---

### 🔴 `[ERROR]` - Cor Vermelha
* **Uso:** Erros graves que impediram a execução normal de uma operação. Exigem atenção imediata.
* **Exemplos:**
    * Falha na conexão com o banco de dados.
    * Uma exceção não tratada no código (`Crash`).
    * Falha ao processar uma transação crítica.
* **Exemplo de Log (com stack trace):**
    ```log
    [2025-09-14T17:40:02.112Z] [ERROR] [Database] - Não foi possível conectar ao banco de dados primário :: {host="db.prod.internal", retryAttempts=3, error="ConnectionRefusedError"}
    Traceback (most recent call last):
      File "/app/services/user_service.py", line 42, in get_user_profile
        db.connect()
      File "/app/db/connection.py", line 15, in connect
        raise ConnectionRefusedError("Host não encontrado")
    ConnectionRefusedError: Host não encontrado
    ```
---
*Observação: É comum também utilizar o nível `[INFO]` (Cor: Azul ou Branco) para registrar eventos normais e importantes do fluxo da aplicação, como "Servidor iniciado na porta 8000" ou "Usuário 'joao' cadastrado com sucesso".*

## 4. Boas Práticas e Ferramentas

1.  **Não Logar Informações Sensíveis:** Nunca inclua senhas, chaves de API, tokens de sessão ou dados pessoais de usuários em texto puro nos logs. Use técnicas de mascaramento de dados se necessário.
2.  **Logs Estruturados em Produção (JSON):** Para ambientes de produção, considere configurar o logger para emitir logs em formato JSON. Embora menos legível para humanos diretamente, é o formato ideal para ser ingerido por plataformas de gerenciamento de logs como **Datadog, Splunk ou o Stack ELK (Elasticsearch, Logstash, Kibana)**.
3.  **Ferramentas (Python):**
    * **Logging (Nativo):** O módulo `logging` da biblioteca padrão do Python é robusto e totalmente configurável para atender a este padrão.
    * **Loguru:** Uma excelente biblioteca de terceiros que torna a configuração de logs, incluindo cores e formatação estruturada, muito mais simples e intuitiva.