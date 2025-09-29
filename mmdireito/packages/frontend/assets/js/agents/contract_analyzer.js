// Define a URL da API do backend
const CONTRACT_ANALYZER_API_URL = 'http://127.0.0.1:8000/agent/chat/contract-analyzer';

/**
 * Envia uma mensagem para o agente de análise de contratos e retorna a resposta.
 * @param {string} sessionId - O ID da sessão de chat atual.
 * @param {string} userMessage - A mensagem do usuário.
 * @returns {Promise<string>} A resposta do agente.
 */
async function sendMessageToContractAnalyzer(sessionId, userMessage) {
    try {
        const response = await fetch(CONTRACT_ANALYZER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                session_id: sessionId,
                message: userMessage
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Erro na API:', errorData);
            return 'Desculpe, ocorreu um erro ao se comunicar com o servidor. Por favor, tente novamente.';
        }

        const data = await response.json();
        return data.response;

    } catch (error) {
        console.error('Erro de conexão:', error);
        return 'Não foi possível conectar ao servidor. Verifique se o backend está em execução.';
    }
}

// Global export (browser compatible)
window.sendMessageToContractAnalyzer = sendMessageToContractAnalyzer;
