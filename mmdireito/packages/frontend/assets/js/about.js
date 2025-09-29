// about.js - Script para a página Sobre

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const faqItems = document.querySelectorAll('.faq-item');
    const contactForm = document.querySelector('.contact-form');
    
    // Inicializar eventos
    initializeEvents();
    
    /**
     * Inicializa todos os event listeners
     */
    function initializeEvents() {
        // Expandir/colapsar itens do FAQ
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            question.addEventListener('click', function() {
                toggleFaqItem(item);
            });
        });
        
        // Formulário de contato
        if (contactForm) {
            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();
                handleContactFormSubmit();
            });
        }
        
        // Animação de entrada para os elementos da página
        animatePageElements();
    }
    
    /**
     * Expande ou colapsa um item do FAQ
     * @param {HTMLElement} item - O item do FAQ a ser expandido/colapsado
     */
    function toggleFaqItem(item) {
        // Verificar se o item já está expandido
        const isExpanded = item.classList.contains('expanded');
        
        // Colapsar todos os itens
        faqItems.forEach(faqItem => {
            faqItem.classList.remove('expanded');
            const toggle = faqItem.querySelector('.faq-toggle');
            toggle.textContent = 'expand_more';
            
            // Animar o colapso
            const answer = faqItem.querySelector('.faq-answer');
            answer.style.maxHeight = '0';
        });
        
        // Expandir o item clicado (se não estava expandido)
        if (!isExpanded) {
            item.classList.add('expanded');
            const toggle = item.querySelector('.faq-toggle');
            toggle.textContent = 'expand_less';
            
            // Animar a expansão
            const answer = item.querySelector('.faq-answer');
            answer.style.maxHeight = answer.scrollHeight + 'px';
        }
    }
    
    /**
     * Manipula o envio do formulário de contato
     */
    function handleContactFormSubmit() {
        // Obter os valores dos campos
        const name = document.getElementById('contact-name').value;
        const email = document.getElementById('contact-email').value;
        const subject = document.getElementById('contact-subject').value;
        const message = document.getElementById('contact-message').value;
        
        // Validar os campos
        if (!name || !email || !subject || !message) {
            alert('Por favor, preencha todos os campos.');
            return;
        }
        
        // Validar o formato do e-mail
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Por favor, insira um e-mail válido.');
            return;
        }
        
        // Em uma implementação real, isso faria uma requisição ao backend
        // Aqui, apenas exibimos uma mensagem de sucesso
        showSuccessMessage();
        
        // Limpar o formulário
        contactForm.reset();
    }
    
    /**
     * Exibe uma mensagem de sucesso após o envio do formulário
     */
    function showSuccessMessage() {
        // Criar elemento de mensagem
        const messageElement = document.createElement('div');
        messageElement.className = 'success-message';
        messageElement.innerHTML = `
            <div class="success-icon">
                <span class="material-symbols-outlined">check_circle</span>
            </div>
            <div class="success-content">
                <h3>Mensagem Enviada!</h3>
                <p>Agradecemos seu contato. Responderemos em breve.</p>
            </div>
        `;
        
        // Inserir após o formulário
        contactForm.parentNode.insertBefore(messageElement, contactForm.nextSibling);
        
        // Ocultar o formulário
        contactForm.style.display = 'none';
        
        // Remover a mensagem após alguns segundos
        setTimeout(() => {
            messageElement.classList.add('fade-out');
            setTimeout(() => {
                messageElement.remove();
                contactForm.style.display = 'block';
                contactForm.classList.add('fade-in');
            }, 500);
        }, 5000);
    }
    
    /**
     * Animação de entrada para os elementos da página
     */
    function animatePageElements() {
        // Animar o cabeçalho
        const header = document.querySelector('.about-header');
        if (header) {
            header.classList.add('animate-fade-in');
        }
        
        // Animar as seções com delay
        const sections = document.querySelectorAll('.about-section');
        sections.forEach((section, index) => {
            setTimeout(() => {
                section.classList.add('animate-fade-in');
            }, 200 * (index + 1));
        });
        
        // Animar os cards de agentes
        const agentCards = document.querySelectorAll('.agent-info-card');
        agentCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('animate-slide-in-up');
            }, 100 * index);
        });
        
        // Animar os cards de tecnologia
        const techCards = document.querySelectorAll('.tech-card');
        techCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('animate-slide-in-right');
            }, 150 * index);
        });
        
        // Animar os itens de privacidade
        const privacyItems = document.querySelectorAll('.privacy-item');
        privacyItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('animate-fade-in');
            }, 100 * index);
        });
    }
});
