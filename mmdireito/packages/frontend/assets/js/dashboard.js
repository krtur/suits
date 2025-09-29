// Dashboard.js - Script para a página inicial

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar variáveis
    const startChatButtons = document.querySelectorAll('.start-chat-btn');
    const conversationCards = document.querySelectorAll('.conversation-card');
    const historyItems = document.querySelectorAll('.history-item');
    
    // Adicionar event listeners aos botões de iniciar chat
    startChatButtons.forEach(button => {
        button.addEventListener('click', function() {
            const agentId = this.dataset.agent;
            startChatWithAgent(agentId);
        });
    });
    
    // Adicionar event listeners aos cards de conversas recentes
    conversationCards.forEach(card => {
        card.addEventListener('click', function() {
            // Aqui você pode adicionar lógica para abrir uma conversa existente
            // Por enquanto, vamos apenas redirecionar para a página de chat
            window.location.href = 'index.html';
        });
    });
    
    // Adicionar event listeners aos itens do histórico
    historyItems.forEach(item => {
        item.addEventListener('click', function() {
            // Aqui você pode adicionar lógica para abrir uma conversa existente
            // Por enquanto, vamos apenas redirecionar para a página de chat
            window.location.href = 'index.html';
        });
    });
    
    /**
     * Inicia um chat com o agente especificado
     * @param {string} agentId - O ID do agente
     */
    function startChatWithAgent(agentId) {
        // Redirecionar para a página de chat com o agente como parâmetro de URL
        window.location.href = `pages/chat.html?agent=${agentId}`;
    }
    
    /**
     * Adiciona efeito de hover aos cards de agente
     */
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
    
    // Inicializar efeitos de hover
    setupAgentCardHover();
    
    /**
     * Animação de entrada para os elementos da página
     */
    function animatePageElements() {
        // Animar o cabeçalho
        const header = document.querySelector('.dashboard-header');
        header.classList.add('animate-fade-in');
        
        // Animar os cards de agente com delay
        const agentCards = document.querySelectorAll('.agent-card');
        agentCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('animate-slide-in-up');
            }, 100 * index);
        });
        
        // Animar as seções com delay
        const sections = document.querySelectorAll('.dashboard-section');
        sections.forEach((section, index) => {
            setTimeout(() => {
                section.classList.add('animate-fade-in');
            }, 200 * (index + 1));
        });
    }
    
    // Iniciar animações após um pequeno delay
    setTimeout(animatePageElements, 100);
});
