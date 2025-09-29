// Define a URL da API do backend para o agente Advogado do Diabo
const DEVIL_ADVOCATE_API_URL = 'http://127.0.0.1:8000/agent/chat/devil_advocate';

/**
 * Envia uma mensagem para o agente Advogado do Diabo e retorna a resposta.
 * @param {string} sessionId - O ID da sessão de chat atual.
 * @param {string} userMessage - A tese ou petição do usuário.
 * @returns {Promise<string>} A análise de risco do agente.
 */
async function sendMessageToDevilAdvocate(sessionId, userMessage) {
    try {
        const response = await fetch(DEVIL_ADVOCATE_API_URL, {
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
window.sendMessageToDevilAdvocate = sendMessageToDevilAdvocate;
