document.addEventListener('DOMContentLoaded', () => {
    // --- Seletores do DOM ---
    const chatWindow = document.getElementById('chat-window');
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const agentList = document.querySelector('.agent-list');
    const addBtn = document.getElementById('add-btn');
    const fileInput = document.getElementById('file-input');
    const sendBtn = document.getElementById('send-btn');
    const micBtn = document.getElementById('mic-btn');
    const appContainer = document.querySelector('.app-container');
    const currentAgentName = document.getElementById('current-agent-name');
    const currentAgentDescription = document.getElementById('current-agent-description');

    if (!chatWindow || !chatForm || !messageInput || !agentList) {
        console.error('Elementos essenciais do chat não foram encontrados.');
        return;
    }

    // --- Constantes ---
    const ALLOWED_FILE_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

    // --- Configuração dos Agentes ---
    const agentDetails = {
        'contract_analyzer': {
            name: 'Analisador de Contratos',
            description: 'Faça upload de um contrato para análise de riscos e cláusulas.',
            welcomeMessage: `
                Olá! Sou seu especialista em análise de contratos. Minhas principais funções são:
                <ul style="margin-top: 10px; padding-left: 20px;">
                    <li>Analisar o contrato</li>
                    <li>Identificar falhas e riscos</li>
                    <li>Apontar oportunidades de melhoria</li>
                    <li>Esclarecer dúvidas sobre cláusulas</li>
                </ul>
                <p style="margin-top: 10px;">Para começar, <strong>envie um arquivo (PDF ou DOCX)</strong>, cole o texto do contrato ou me faça uma pergunta.</p>
            `,
            hasFileUpload: true
        },
        'devil_advocate': {
            name: 'Advogado do Diabo',
            description: 'Apresente sua tese ou petição para encontrar os pontos fracos.',
            welcomeMessage: `
                <p>Apresente sua tese, argumentação ou petição. Irei atuar como a oposição, buscando implacavelmente por falhas, lacunas e vulnerabilidades em sua estratégia.</p>
                <p style="margin-top: 10px;">Meu objetivo é preparar você para os piores contra-argumentos. <strong>Cole sua tese abaixo para começar.</strong></p>
            `,
            hasFileUpload: false
        },
        'agente_civil': {
            name: "Agente Civil",
            description: "Especialista em Direito Civil brasileiro, incluindo contratos, responsabilidade civil, direitos reais e obrigações.",
            welcomeMessage: `
                <p>Olá! Sou seu assistente especializado no <strong>Código Civil Brasileiro</strong>.</p>
                <p style="margin-top: 10px;">Posso ajudá-lo com questões sobre direito civil material, interpretação de artigos e aplicação das normas civis. Como posso auxiliá-lo hoje?</p>
            `,
            hasFileUpload: false
        },
        'agente_penal': {
            name: "Agente Penal",
            description: "Especialista em Direito Penal e Processual Penal brasileiro, crimes, penas, procedimentos e execução penal.",
            welcomeMessage: `
                <p>Olá! Sou seu assistente especializado em Direito Penal e Processual Penal brasileiro.</p>
                <p style="margin-top: 10px;">Posso ajudá-lo com questões sobre crimes, penas, procedimentos e execução penal. Como posso auxiliá-lo hoje?</p>
            `,
            hasFileUpload: false
        }
    };

    // --- Estado da Aplicação ---
    let sessionId = '';
    let activeAgent = 'contract_analyzer';

    // Funções (addMessage, submitMessage, etc. - completas aqui)

    function addMessage(content, type, { isHtml = false, id = null } = {}) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', type);
        if (id) messageElement.id = id;

        if (type === 'loading') {
            messageElement.innerHTML = `<span class="loading-text">Pensando...</span><div class="loading-dots"><span></span><span></span><span></span></div>`;
        } else if (isHtml) {
            messageElement.innerHTML = content;
        } else {
            messageElement.textContent = content;
        }

        chatWindow.appendChild(messageElement);
        chatWindow.scrollTop = chatWindow.scrollHeight;
        return messageElement;
    }

    async function submitMessage(messageText) {
        const loadingMessageId = `loading-${Date.now()}`;
        addMessage('', 'loading', { id: loadingMessageId });
        setFormDisabled(true);

        try {
            const agentIdForApi = activeAgent.replace('_', '-');
            const response = await fetch(`/agent/chat/${agentIdForApi}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                                        message: messageText,
                    session_id: sessionId
                }),
            });

            const loadingElement = document.getElementById(loadingMessageId);
            if (loadingElement) {
                loadingElement.remove();
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Ocorreu um erro na comunicação com o servidor.' }));
                throw new Error(errorData.detail || 'Erro desconhecido.');
            }

            const data = await response.json();
            
            // Renderiza a resposta do agente, que pode conter Markdown
            const formattedResponse = marked.parse(data.response);
            addMessage(formattedResponse, 'agent', { isHtml: true });

        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            addMessage(`Desculpe, não consegui processar sua mensagem. Motivo: ${error.message}`, 'agent', { isHtml: true });
        } finally {
            setFormDisabled(false);
            messageInput.focus();
        }
    }

    async function handleFormSubmit(event) {
        event.preventDefault();
        const userMessage = messageInput.value.trim();
        if (!userMessage) return;

        addMessage(userMessage, 'user');
        messageInput.value = '';
        messageInput.dispatchEvent(new Event('input'));
        
        submitMessage(userMessage);
    }

    function startNewChat() {
        chatWindow.innerHTML = '';
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        
        const agent = agentDetails[activeAgent];
        addMessage(agent.welcomeMessage, 'agent', { isHtml: true });
        messageInput.focus();
    }

    function switchAgent(newAgentId) {
        if (newAgentId === activeAgent && sessionId) return;

        activeAgent = newAgentId;

        const agent = agentDetails[activeAgent];
        currentAgentName.textContent = agent.name;
        currentAgentDescription.textContent = agent.description;

        document.querySelectorAll('.agent-item').forEach(item => {
            item.classList.toggle('active', item.dataset.agent === activeAgent);
        });

        appContainer.dataset.activeAgent = activeAgent;

        // Mostra ou esconde o botão de anexo com base na capacidade do agente
        if (addBtn) {
            addBtn.style.display = agent.hasFileUpload ? 'flex' : 'none';
        }

        startNewChat();
    }

    function handleFileUpload(file) {
        // Lógica de upload (simplificada para o exemplo)
        addMessage(`Arquivo "${file.name}" selecionado. A lógica de upload seria acionada aqui.`, 'agent');
    }

    function setFormDisabled(disabled) {
        messageInput.disabled = disabled;
        sendBtn.disabled = disabled;
        addBtn.disabled = disabled;
    }

    function autoResizeTextarea() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    }

    // --- Lógica para alternar botões de Enviar e Microfone ---
    function updateButtonVisibility() {
        const hasText = messageInput.value.trim().length > 0;
        if (sendBtn && micBtn) {
            sendBtn.classList.toggle('hidden', !hasText);
            micBtn.classList.toggle('hidden', hasText);
        }
    }

    // --- Inicialização dos Ouvintes de Evento ---
    chatForm.addEventListener('submit', handleFormSubmit);
    messageInput.addEventListener('input', () => {
        autoResizeTextarea.call(messageInput);
        updateButtonVisibility();
    });

    // Adiciona os ouvintes de evento apenas se os botões existirem
    const attachDocBtn = document.getElementById('attach-doc-btn');
    const attachImgBtn = document.getElementById('attach-img-btn');

    if (addBtn) {
        addBtn.addEventListener('click', () => {
            // Esta é uma implementação simples para o botão '+'. 
            // Ele pode ser usado para mostrar/esconder outras opções de anexo.
            console.log('Botão de mais opções clicado');
            fileInput.click(); // Ação padrão: abrir seletor de arquivo
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                handleFileUpload(fileInput.files[0]);
                fileInput.value = ''; // Limpa o input para permitir o mesmo arquivo novamente
            }
        });
    }

    agentList.addEventListener('click', (e) => {
        const agentItem = e.target.closest('.agent-item');
        if (agentItem && !agentItem.classList.contains('disabled')) {
            const newAgentId = agentItem.dataset.agent;
            switchAgent(newAgentId);
        }
    });

    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chatForm.dispatchEvent(new Event('submit'));
        }
    });

    // Lógica de Drag and Drop
    const dragOverlay = document.createElement('div');
    dragOverlay.className = 'drag-overlay';
    dragOverlay.textContent = 'Solte o arquivo para analisar';
    appContainer.appendChild(dragOverlay);

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        appContainer.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        appContainer.addEventListener(eventName, () => dragOverlay.classList.add('visible'));
    });

    ['dragleave', 'drop'].forEach(eventName => {
        appContainer.addEventListener(eventName, () => dragOverlay.classList.remove('visible'));
    });

    appContainer.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        if (dt.files.length > 0) {
            handleFileUpload(dt.files[0]);
        }
    });

    // --- Inicialização --- 
    // Função para obter o agente da URL ou usar um padrão
    function getInitialAgent() {
        const urlParams = new URLSearchParams(window.location.search);
        const agentFromUrl = urlParams.get('agent');

        // Verifica se o agente da URL é válido
        if (agentFromUrl && agentDetails[agentFromUrl]) {
            return agentFromUrl;
        }

        // Retorna o agente padrão se nenhum agente válido for encontrado na URL
        return 'contract_analyzer'; 
    }

    // Inicia com o agente determinado pela URL ou o padrão
    switchAgent(getInitialAgent());

    // Define o estado inicial dos botões de ação
    updateButtonVisibility();
});
