// document-analysis.js - Script para a página de análise de documentos

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const uploadContainer = document.getElementById('upload-container');
    const fileInput = document.getElementById('file-input');
    const uploadProgress = document.getElementById('upload-progress');
    const progressBar = uploadProgress.querySelector('.progress-bar');
    const progressPercentage = uploadProgress.querySelector('.progress-percentage');
    const progressStatus = uploadProgress.querySelector('.progress-status');
    const fileName = uploadProgress.querySelector('.file-name');
    const analysisSection = document.getElementById('analysis-section');
    const documentName = document.getElementById('document-name');
    const tabItems = document.querySelectorAll('.tab-item');
    const tabContents = document.querySelectorAll('.tab-content');
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const chatMessages = document.getElementById('chat-messages');
    const suggestedActions = document.querySelectorAll('.suggested-actions button');
    
    // Configurações
    const ALLOWED_FILE_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    
    // Inicializar eventos
    initializeEvents();
    
    /**
     * Inicializa todos os event listeners
     */
    function initializeEvents() {
        // Evento de clique no container de upload
        uploadContainer.addEventListener('click', function() {
            fileInput.click();
        });
        
        // Evento de mudança no input de arquivo
        fileInput.addEventListener('change', function() {
            if (fileInput.files.length > 0) {
                handleFileUpload(fileInput.files[0]);
            }
        });
        
        // Eventos de arrastar e soltar
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadContainer.addEventListener(eventName, preventDefaults, false);
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadContainer.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            uploadContainer.addEventListener(eventName, unhighlight, false);
        });
        
        uploadContainer.addEventListener('drop', handleDrop, false);
        
        // Eventos das tabs
        tabItems.forEach(item => {
            item.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                switchTab(tabId);
            });
        });
        
        // Evento do formulário de chat
        if (chatForm) {
            chatForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const message = messageInput.value.trim();
                if (message) {
                    sendMessage(message);
                    messageInput.value = '';
                }
            });
        }
        
        // Eventos para os botões de ações sugeridas
        suggestedActions.forEach(button => {
            button.addEventListener('click', function() {
                const message = this.textContent;
                sendMessage(message);
            });
        });
        
        // Auto-resize para textarea
        if (messageInput) {
            messageInput.addEventListener('input', autoResizeTextarea);
        }
    }
    
    /**
     * Previne comportamento padrão de eventos
     */
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    /**
     * Destaca o container de upload durante o arrasto
     */
    function highlight() {
        uploadContainer.classList.add('highlight');
    }
    
    /**
     * Remove o destaque do container de upload
     */
    function unhighlight() {
        uploadContainer.classList.remove('highlight');
    }
    
    /**
     * Manipula o evento de soltar arquivo
     */
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        handleFileUpload(file);
    }
    
    /**
     * Manipula o upload de arquivo
     * @param {File} file - O arquivo a ser enviado
     */
    function handleFileUpload(file) {
        // Validação do arquivo
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            showError('Tipo de arquivo não permitido. Por favor, envie um arquivo PDF ou DOCX.');
            return;
        }
        
        if (file.size > MAX_FILE_SIZE) {
            showError(`O arquivo é muito grande. O tamanho máximo permitido é ${MAX_FILE_SIZE / 1024 / 1024} MB.`);
            return;
        }
        
        // Iniciar o upload
        fileName.textContent = file.name;
        uploadContainer.style.display = 'none';
        uploadProgress.style.display = 'block';
        
        // Simular o progresso do upload (em um caso real, isso seria feito com XMLHttpRequest)
        simulateUpload(file);
    }
    
    /**
     * Simula o upload de um arquivo com progresso
     * @param {File} file - O arquivo a ser enviado
     */
    function simulateUpload(file) {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;
            progressBar.style.width = `${progress}%`;
            progressPercentage.textContent = `${progress}%`;
            
            if (progress >= 100) {
                clearInterval(interval);
                progressStatus.textContent = 'Processando documento...';
                
                // Simular o processamento do documento
                setTimeout(() => {
                    uploadProgress.style.display = 'none';
                    analysisSection.style.display = 'block';
                    documentName.textContent = file.name;
                    
                    // Animar a entrada da seção de análise
                    analysisSection.classList.add('animate-fade-in');
                }, 1500);
            }
        }, 100);
    }
    
    /**
     * Exibe uma mensagem de erro
     * @param {string} message - A mensagem de erro
     */
    function showError(message) {
        alert(message); // Em uma implementação real, isso seria um toast ou modal
    }
    
    /**
     * Alterna entre as tabs
     * @param {string} tabId - O ID da tab a ser exibida
     */
    function switchTab(tabId) {
        // Atualizar as classes das tabs
        tabItems.forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-tab') === tabId);
        });
        
        // Atualizar o conteúdo visível
        tabContents.forEach(content => {
            const isActive = content.id === `${tabId}-tab`;
            content.classList.toggle('active', isActive);
            
            // Animar a entrada do conteúdo ativo
            if (isActive) {
                content.classList.add('animate-fade-in');
            } else {
                content.classList.remove('animate-fade-in');
            }
        });
    }
    
    /**
     * Envia uma mensagem para o chat
     * @param {string} message - A mensagem a ser enviada
     */
    function sendMessage(message) {
        // Adicionar mensagem do usuário
        const userMessageElement = document.createElement('div');
        userMessageElement.classList.add('message', 'user');
        userMessageElement.textContent = message;
        chatMessages.appendChild(userMessageElement);
        
        // Rolar para o final do chat
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Remover ações sugeridas após o envio da mensagem
        const suggestedActionsElement = chatMessages.querySelector('.suggested-actions');
        if (suggestedActionsElement) {
            suggestedActionsElement.remove();
        }
        
        // Adicionar indicador de carregamento
        const loadingElement = document.createElement('div');
        loadingElement.classList.add('message', 'loading');
        loadingElement.innerHTML = `
            <span class="loading-text">Pensando...</span>
            <div class="loading-dots"><span></span><span></span><span></span></div>
        `;
        chatMessages.appendChild(loadingElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Simular resposta do agente (em um caso real, isso seria uma chamada à API)
        setTimeout(() => {
            // Remover indicador de carregamento
            loadingElement.remove();
            
            // Adicionar resposta do agente
            const agentResponse = getAgentResponse(message);
            const agentMessageElement = document.createElement('div');
            agentMessageElement.classList.add('message', 'agent');
            agentMessageElement.innerHTML = `
                <div class="agent-header">
                    <div class="agent-avatar">AC</div>
                    <div class="agent-name">Analisador de Contratos</div>
                </div>
                ${agentResponse}
            `;
            chatMessages.appendChild(agentMessageElement);
            
            // Rolar para o final do chat
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1500);
    }
    
    /**
     * Obtém uma resposta simulada do agente com base na mensagem do usuário
     * @param {string} message - A mensagem do usuário
     * @returns {string} - A resposta do agente
     */
    function getAgentResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('risco') || lowerMessage.includes('problema')) {
            return `
                <p>Identifiquei três principais riscos no contrato:</p>
                <ol>
                    <li><strong>Multa por rescisão desproporcional (Alto Risco)</strong>: A cláusula 5.2 estabelece multa de 50% do valor restante do contrato em caso de rescisão antecipada pelo locatário, o que pode ser considerado abusivo segundo a Súmula 472 do STJ.</li>
                    <li><strong>Ausência de cláusula sobre benfeitorias (Médio Risco)</strong>: O contrato não especifica claramente como serão tratadas as benfeitorias realizadas pelo locatário.</li>
                    <li><strong>Prazo para comunicação de defeitos (Baixo Risco)</strong>: A cláusula 8.3 estabelece prazo de apenas 24 horas para comunicação de defeitos no imóvel.</li>
                </ol>
                <p>Gostaria que eu explicasse algum desses riscos em mais detalhes?</p>
            `;
        } else if (lowerMessage.includes('rescisão') || lowerMessage.includes('rescindir')) {
            return `
                <p>Sobre a cláusula de rescisão do contrato:</p>
                <p>A cláusula 5 estabelece que:</p>
                <ol>
                    <li>O contrato poderá ser rescindido pelo locatário antes do término mediante notificação por escrito com 30 dias de antecedência.</li>
                    <li>Em caso de rescisão antecipada, o locatário deverá pagar multa de 50% do valor dos aluguéis restantes.</li>
                </ol>
                <p><strong>Problema:</strong> Esta multa é considerada abusiva segundo a Súmula 472 do STJ, que estabelece: "A cobrança de multa de 50% sobre o valor dos aluguéis durante o período de cumprimento do contrato, na hipótese de resilição unilateral, é abusiva."</p>
                <p><strong>Recomendação:</strong> Negociar a redução desta multa para no máximo 3 meses de aluguel, conforme jurisprudência consolidada.</p>
            `;
        } else if (lowerMessage.includes('reajuste')) {
            return `
                <p>Sobre o reajuste do aluguel:</p>
                <p>A cláusula 4 estabelece que:</p>
                <ol>
                    <li>O valor do aluguel será reajustado anualmente pelo índice IGPM/FGV.</li>
                    <li>O primeiro reajuste ocorrerá em 01/10/2026 (12 meses após o início do contrato).</li>
                    <li>Em caso de extinção do IGPM, será utilizado o IPCA como índice substituto.</li>
                </ol>
                <p><strong>Observação:</strong> Esta cláusula está em conformidade com a Lei do Inquilinato (Lei 8.245/91), que permite o reajuste anual do aluguel.</p>
                <p><strong>Dica:</strong> Você pode negociar a troca do índice para IPCA, que geralmente apresenta variações menores que o IGPM.</p>
            `;
        } else {
            return `
                <p>Analisando o contrato de locação, posso destacar os seguintes pontos importantes:</p>
                <ul>
                    <li>É um contrato de locação residencial com duração de 30 meses.</li>
                    <li>O valor do aluguel é de R$ 2.500,00, com reajuste anual pelo IGPM.</li>
                    <li>Há uma cláusula de multa por rescisão antecipada que pode ser considerada abusiva.</li>
                    <li>O contrato não especifica claramente como serão tratadas as benfeitorias.</li>
                </ul>
                <p>Há algum aspecto específico do contrato que você gostaria que eu explicasse em mais detalhes?</p>
            `;
        }
    }
    
    /**
     * Redimensiona automaticamente a altura da textarea
     */
    function autoResizeTextarea() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    }
});
