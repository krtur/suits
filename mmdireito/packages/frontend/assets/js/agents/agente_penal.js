// agente_penal.js - Módulo de API para o Agente Penal

/**
 * Envia uma mensagem para o Agente Penal e retorna a resposta.
 * @param {string} sessionId - ID da sessão de chat.
 * @param {string} message - A mensagem do usuário.
 * @returns {Promise<string>} - A resposta do agente.
 */
async function sendMessageToPenalAgent(sessionId, message) {
    try {
        const response = await fetch('/agent/chat/agente_penal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                session_id: sessionId
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        return data.response;

    } catch (error) {
        console.error('Erro ao comunicar com o Agente Penal:', error);
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return 'Erro de conexão. Verifique se o servidor está rodando e tente novamente.';
        }
        
        return `Erro ao processar sua mensagem sobre direito penal: ${error.message}`;
    }
}

// Global export (browser compatible)
window.sendMessageToPenalAgent = sendMessageToPenalAgent;
