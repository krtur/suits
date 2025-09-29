// tutorial.js - Tutorial interativo para novos usuários

class Tutorial {
    constructor() {
        this.steps = [
            {
                target: '.sidebar-header .logo',
                title: 'Bem-vindo ao M&M Direito!',
                content: 'Esta é a plataforma de agentes jurídicos inteligentes que irá auxiliar você em suas necessidades legais.',
                position: 'right',
                nextLabel: 'Próximo'
            },
            {
                target: '.agent-list',
                title: 'Agentes Especializados',
                content: 'Aqui você encontra os agentes jurídicos disponíveis. Cada um é especializado em uma área específica do direito.',
                position: 'right',
                nextLabel: 'Próximo'
            },
            {
                target: '.agent-item[data-agent="contract_analyzer"]',
                title: 'Analisador de Contratos',
                content: 'Este agente analisa contratos, identifica riscos e sugere melhorias com base no Código Civil brasileiro.',
                position: 'right',
                nextLabel: 'Próximo'
            },
            {
                target: '.chat-window',
                title: 'Área de Chat',
                content: 'Aqui você verá as mensagens trocadas com o agente selecionado.',
                position: 'top',
                nextLabel: 'Próximo'
            },
            {
                target: '.chat-form',
                title: 'Envie Mensagens',
                content: 'Digite suas perguntas ou faça upload de documentos para análise.',
                position: 'top',
                nextLabel: 'Próximo'
            },
            {
                target: '#attach-btn',
                title: 'Upload de Documentos',
                content: 'Clique aqui para fazer upload de contratos ou documentos jurídicos para análise.',
                position: 'top',
                nextLabel: 'Próximo'
            },
            {
                target: '.sidebar-nav',
                title: 'Navegação',
                content: 'Use este menu para navegar entre as diferentes seções da plataforma.',
                position: 'right',
                nextLabel: 'Próximo'
            },
            {
                target: '.user-profile',
                title: 'Seu Perfil',
                content: 'Acesse seu perfil e configurações da conta.',
                position: 'top',
                nextLabel: 'Concluir'
            }
        ];
        
        this.currentStep = 0;
        this.overlay = null;
        this.tooltip = null;
        this.isActive = false;
        
        // Verificar se é a primeira visita
        this.checkFirstVisit();
    }
    
    /**
     * Verifica se é a primeira visita do usuário
     */
    checkFirstVisit() {
        const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
        
        if (!hasSeenTutorial) {
            // Mostrar modal de boas-vindas
            this.showWelcomeModal();
        }
    }
    
    /**
     * Exibe o modal de boas-vindas
     */
    showWelcomeModal() {
        // Criar o modal
        const modal = document.createElement('div');
        modal.className = 'welcome-modal';
        modal.innerHTML = `
            <div class="welcome-modal-content">
                <div class="welcome-modal-header">
                    <h2>Bem-vindo ao M&M Direito!</h2>
                </div>
                <div class="welcome-modal-body">
                    <p>Parece que esta é sua primeira visita. Gostaria de fazer um tour rápido pela plataforma?</p>
                    <div class="welcome-modal-image">
                        <img src="assets/images/welcome-illustration.svg" alt="Bem-vindo">
                    </div>
                </div>
                <div class="welcome-modal-footer">
                    <button class="btn btn-outline-primary" id="skip-tutorial-btn">Pular</button>
                    <button class="btn btn-primary" id="start-tutorial-btn">Iniciar Tour</button>
                </div>
            </div>
        `;
        
        // Adicionar o modal ao corpo do documento
        document.body.appendChild(modal);
        
        // Adicionar event listeners
        document.getElementById('skip-tutorial-btn').addEventListener('click', () => {
            this.closeWelcomeModal();
            localStorage.setItem('hasSeenTutorial', 'true');
        });
        
        document.getElementById('start-tutorial-btn').addEventListener('click', () => {
            this.closeWelcomeModal();
            this.start();
            localStorage.setItem('hasSeenTutorial', 'true');
        });
        
        // Animar a entrada do modal
        setTimeout(() => {
            modal.classList.add('active');
        }, 100);
    }
    
    /**
     * Fecha o modal de boas-vindas
     */
    closeWelcomeModal() {
        const modal = document.querySelector('.welcome-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    }
    
    /**
     * Inicia o tutorial
     */
    start() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.currentStep = 0;
        this.createOverlay();
        this.showStep(this.currentStep);
        
        // Adicionar botão para reabrir o tutorial
        this.addTutorialButton();
    }
    
    /**
     * Cria o overlay do tutorial
     */
    createOverlay() {
        // Criar o overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'tutorial-overlay';
        
        // Criar o tooltip
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'tutorial-tooltip';
        
        // Adicionar ao corpo do documento
        document.body.appendChild(this.overlay);
        document.body.appendChild(this.tooltip);
    }
    
    /**
     * Exibe um passo do tutorial
     * @param {number} stepIndex - O índice do passo a ser exibido
     */
    showStep(stepIndex) {
        if (stepIndex >= this.steps.length) {
            this.end();
            return;
        }
        
        const step = this.steps[stepIndex];
        const targetElement = document.querySelector(step.target);
        
        if (!targetElement) {
            console.error(`Elemento alvo não encontrado: ${step.target}`);
            this.nextStep();
            return;
        }
        
        // Posicionar o highlight
        this.positionHighlight(targetElement);
        
        // Configurar o tooltip
        this.tooltip.innerHTML = `
            <div class="tutorial-tooltip-header">
                <h3>${step.title}</h3>
                <button class="tutorial-close-btn">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <div class="tutorial-tooltip-body">
                <p>${step.content}</p>
            </div>
            <div class="tutorial-tooltip-footer">
                <div class="tutorial-progress">
                    ${stepIndex + 1} de ${this.steps.length}
                </div>
                <div class="tutorial-buttons">
                    ${stepIndex > 0 ? `<button class="tutorial-prev-btn">Anterior</button>` : ''}
                    <button class="tutorial-next-btn">${step.nextLabel || 'Próximo'}</button>
                </div>
            </div>
        `;
        
        // Posicionar o tooltip
        this.positionTooltip(targetElement, step.position);
        
        // Adicionar event listeners
        const closeBtn = this.tooltip.querySelector('.tutorial-close-btn');
        const nextBtn = this.tooltip.querySelector('.tutorial-next-btn');
        const prevBtn = this.tooltip.querySelector('.tutorial-prev-btn');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.end());
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextStep());
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevStep());
        }
        
        // Animar a entrada do tooltip
        this.tooltip.classList.add('active');
    }
    
    /**
     * Posiciona o highlight em torno do elemento alvo
     * @param {HTMLElement} targetElement - O elemento alvo
     */
    positionHighlight(targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        // Criar o recorte no overlay
        this.overlay.style.clipPath = `
            polygon(
                0% 0%, 
                0% 100%, 
                ${rect.left + scrollLeft}px 100%, 
                ${rect.left + scrollLeft}px ${rect.top + scrollTop}px, 
                ${rect.right + scrollLeft}px ${rect.top + scrollTop}px, 
                ${rect.right + scrollLeft}px ${rect.bottom + scrollTop}px, 
                ${rect.left + scrollLeft}px ${rect.bottom + scrollTop}px, 
                ${rect.left + scrollLeft}px 100%, 
                100% 100%, 
                100% 0%
            )
        `;
        
        // Garantir que o elemento alvo esteja visível
        targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
    
    /**
     * Posiciona o tooltip em relação ao elemento alvo
     * @param {HTMLElement} targetElement - O elemento alvo
     * @param {string} position - A posição do tooltip (top, right, bottom, left)
     */
    positionTooltip(targetElement, position) {
        const rect = targetElement.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        const tooltipRect = this.tooltip.getBoundingClientRect();
        
        let top, left;
        
        switch (position) {
            case 'top':
                top = rect.top + scrollTop - tooltipRect.height - 10;
                left = rect.left + scrollLeft + (rect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'right':
                top = rect.top + scrollTop + (rect.height / 2) - (tooltipRect.height / 2);
                left = rect.right + scrollLeft + 10;
                break;
            case 'bottom':
                top = rect.bottom + scrollTop + 10;
                left = rect.left + scrollLeft + (rect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'left':
                top = rect.top + scrollTop + (rect.height / 2) - (tooltipRect.height / 2);
                left = rect.left + scrollLeft - tooltipRect.width - 10;
                break;
            default:
                top = rect.bottom + scrollTop + 10;
                left = rect.left + scrollLeft;
        }
        
        // Ajustar para garantir que o tooltip esteja dentro da janela
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        if (left < 0) left = 10;
        if (left + tooltipRect.width > windowWidth) left = windowWidth - tooltipRect.width - 10;
        if (top < 0) top = 10;
        if (top + tooltipRect.height > windowHeight + scrollTop) top = windowHeight + scrollTop - tooltipRect.height - 10;
        
        // Aplicar posição
        this.tooltip.style.top = `${top}px`;
        this.tooltip.style.left = `${left}px`;
        
        // Adicionar classe de posição para estilização
        this.tooltip.className = `tutorial-tooltip position-${position}`;
    }
    
    /**
     * Avança para o próximo passo
     */
    nextStep() {
        this.currentStep++;
        this.showStep(this.currentStep);
    }
    
    /**
     * Retorna ao passo anterior
     */
    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.showStep(this.currentStep);
        }
    }
    
    /**
     * Finaliza o tutorial
     */
    end() {
        if (!this.isActive) return;
        
        this.isActive = false;
        
        // Remover o overlay e o tooltip
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
        
        if (this.tooltip) {
            this.tooltip.remove();
            this.tooltip = null;
        }
    }
    
    /**
     * Adiciona um botão para reabrir o tutorial
     */
    addTutorialButton() {
        // Verificar se o botão já existe
        if (document.getElementById('reopen-tutorial-btn')) return;
        
        // Criar o botão
        const button = document.createElement('button');
        button.id = 'reopen-tutorial-btn';
        button.className = 'tutorial-button';
        button.innerHTML = `
            <span class="material-symbols-outlined">help</span>
            <span class="tutorial-button-tooltip">Reabrir Tutorial</span>
        `;
        
        // Adicionar ao corpo do documento
        document.body.appendChild(button);
        
        // Adicionar event listener
        button.addEventListener('click', () => {
            this.start();
        });
    }
}

// Inicializar o tutorial quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    window.tutorial = new Tutorial();
});
