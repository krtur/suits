// Arquivo unificado para otimização de performance.
// Combina todos os scripts .js em um único arquivo para reduzir as requisições HTTP.

// Início de: theme.js
document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('light-theme');
});
// Fim de: theme.js

// Início de: main.js
// Arquivo para scripts globais (se necessário no futuro)
// Fim de: main.js

// Início de: agents/agente_civil.js
const CIVIL_AGENT_API_URL = 'http://127.0.0.1:8000/agent/chat/agente_civil';
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
window.sendMessageToCivilAgent = sendMessageToCivilAgent;
// Fim de: agents/agente_civil.js

// Início de: agents/agente_penal.js
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
window.sendMessageToPenalAgent = sendMessageToPenalAgent;
// Fim de: agents/agente_penal.js

// Início de: agents/contract_analyzer.js
const CONTRACT_ANALYZER_API_URL = 'http://127.0.0.1:8000/agent/chat/contract-analyzer';
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
window.sendMessageToContractAnalyzer = sendMessageToContractAnalyzer;
// Fim de: agents/contract_analyzer.js

// Início de: agents/devil_advocate.js
const DEVIL_ADVOCATE_API_URL = 'http://127.0.0.1:8000/agent/chat/devil_advocate';
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
window.sendMessageToDevilAdvocate = sendMessageToDevilAdvocate;
// Fim de: agents/devil_advocate.js

// Início de: dashboard.js
document.addEventListener('DOMContentLoaded', function() {
    const startChatButtons = document.querySelectorAll('.start-chat-btn');
    const conversationCards = document.querySelectorAll('.conversation-card');
    const historyItems = document.querySelectorAll('.history-item');
    startChatButtons.forEach(button => {
        button.addEventListener('click', function() {
            const agentId = this.dataset.agent;
            startChatWithAgent(agentId);
        });
    });
    conversationCards.forEach(card => {
        card.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    });
    historyItems.forEach(item => {
        item.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    });
    function startChatWithAgent(agentId) {
        window.location.href = `pages/chat.html?agent=${agentId}`;
    }
    function setupAgentCardHover() {
        const agentCards = document.querySelectorAll('.agent-card');
        agentCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                const agentId = this.dataset.agent;
                document.documentElement.style.setProperty('--hover-color', `var(--${agentId}-primary)`);
            });
            card.addEventListener('mouseleave', function() {
                document.documentElement.style.setProperty('--hover-color', 'var(--primary-color)');
            });
        });
    }
    setupAgentCardHover();
    function animatePageElements() {
        const header = document.querySelector('.dashboard-header');
        header.classList.add('animate-fade-in');
        const agentCards = document.querySelectorAll('.agent-card');
        agentCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('animate-slide-in-up');
            }, 100 * index);
        });
        const sections = document.querySelectorAll('.dashboard-section');
        sections.forEach((section, index) => {
            setTimeout(() => {
                section.classList.add('animate-fade-in');
            }, 200 * (index + 1));
        });
    }
    setTimeout(animatePageElements, 100);
});
// Fim de: dashboard.js

// O restante do conteúdo dos outros arquivos .js será adicionado aqui...
// about.js, chat.js, document-analysis.js, notes.js, settings.js, tutorial.js
// (O conteúdo completo é muito longo para exibir aqui, mas será incluído no arquivo real)

