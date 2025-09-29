const CIVIL_AGENT_API_URL = 'http://127.0.0.1:8000/agent/chat/agente_civil';

/**
 * Envia uma mensagem para o Agente Civil e retorna a resposta.
 * @param {string} sessionId - O ID da sessão de chat.
 * @param {string} message - A mensagem do usuário.
 * @returns {Promise<string>} A resposta do agente.
 */
async function sendMessageToCivilAgent(sessionId, message) {
    try {
        const response = await fetch(CIVIL_AGENT_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                session_id: sessionId, 
                message: message 
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error('Erro ao se comunicar com o Agente Civil:', error);
        throw error;
    }
}

// Global export (browser compatible)
window.sendMessageToCivilAgent = sendMessageToCivilAgent;
