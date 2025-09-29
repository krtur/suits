// settings.js - Script para a página de configurações

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const settingsNavItems = document.querySelectorAll('.settings-nav-item');
    const settingsSections = document.querySelectorAll('.settings-section');
    const themeOptions = document.querySelectorAll('.theme-option');
    const fontSizeSlider = document.getElementById('font-size-slider');
    const densityOptions = document.querySelectorAll('input[name="density"]');
    const notificationToggles = document.querySelectorAll('.notification-option .switch input');
    const privacyToggles = document.querySelectorAll('.privacy-option .switch input');
    const exportButtons = document.querySelectorAll('.export-option button');
    const deleteAccountButton = document.querySelector('.btn-danger');
    const saveProfileButton = document.querySelector('#profile-section .btn-primary');
    const changePasswordButton = document.querySelector('#profile-section form:nth-of-type(2) .btn-primary');
    
    // Inicializar eventos
    initializeEvents();
    
    /**
     * Inicializa todos os event listeners
     */
    function initializeEvents() {
        // Navegação entre seções de configurações
        settingsNavItems.forEach(item => {
            item.addEventListener('click', function() {
                const sectionId = this.getAttribute('data-section');
                switchSection(sectionId);
            });
        });
        
        // Opções de tema
        themeOptions.forEach(option => {
            option.addEventListener('click', function() {
                setActiveTheme(this);
            });
        });
        
        // Slider de tamanho de fonte
        if (fontSizeSlider) {
            fontSizeSlider.addEventListener('input', function() {
                updateFontSize(this.value);
            });
        }
        
        // Opções de densidade
        densityOptions.forEach(option => {
            option.addEventListener('change', function() {
                updateDensity(this.value);
            });
        });
        
        // Toggles de notificações
        notificationToggles.forEach(toggle => {
            toggle.addEventListener('change', function() {
                const notificationName = this.closest('.notification-option').querySelector('h4').textContent;
                updateNotificationSetting(notificationName, this.checked);
            });
        });
        
        // Toggles de privacidade
        privacyToggles.forEach(toggle => {
            toggle.addEventListener('change', function() {
                const privacyName = this.closest('.privacy-option').querySelector('h4').textContent;
                updatePrivacySetting(privacyName, this.checked);
            });
        });
        
        // Botões de exportação
        exportButtons.forEach(button => {
            button.addEventListener('click', function() {
                const exportType = this.closest('.export-option').querySelector('h4').textContent;
                exportData(exportType);
            });
        });
        
        // Botão de exclusão de conta
        if (deleteAccountButton) {
            deleteAccountButton.addEventListener('click', function() {
                confirmDeleteAccount();
            });
        }
        
        // Botão de salvar perfil
        if (saveProfileButton) {
            saveProfileButton.addEventListener('click', function(e) {
                e.preventDefault();
                saveProfile();
            });
        }
        
        // Botão de alterar senha
        if (changePasswordButton) {
            changePasswordButton.addEventListener('click', function(e) {
                e.preventDefault();
                changePassword();
            });
        }
    }
    
    /**
     * Alterna entre as seções de configurações
     * @param {string} sectionId - O ID da seção a ser exibida
     */
    function switchSection(sectionId) {
        // Atualizar as classes dos itens de navegação
        settingsNavItems.forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-section') === sectionId);
        });
        
        // Atualizar as seções visíveis
        settingsSections.forEach(section => {
            const isActive = section.id === `${sectionId}-section`;
            section.classList.toggle('active', isActive);
            
            // Animar a entrada da seção ativa
            if (isActive) {
                section.classList.add('animate-fade-in');
            } else {
                section.classList.remove('animate-fade-in');
            }
        });
    }
    
    /**
     * Define o tema ativo
     * @param {HTMLElement} selectedOption - A opção de tema selecionada
     */
    function setActiveTheme(selectedOption) {
        // Remover a classe ativa de todas as opções
        themeOptions.forEach(option => {
            option.classList.remove('active');
        });
        
        // Adicionar a classe ativa à opção selecionada
        selectedOption.classList.add('active');
        
        // Obter o tema selecionado
        const theme = selectedOption.querySelector('.theme-preview').classList.contains('dark-theme') ? 'dark' :
                     selectedOption.querySelector('.theme-preview').classList.contains('system-theme') ? 'system' : 'light';
        
        // Aplicar o tema
        applyTheme(theme);
        
        // Salvar a preferência do usuário
        localStorage.setItem('theme', theme);
    }
    
    /**
     * Aplica o tema selecionado
     * @param {string} theme - O tema a ser aplicado (light, dark, system)
     */
    function applyTheme(theme) {
        const body = document.body;

        const apply = (t) => {
            if (t === 'light') {
                body.classList.add('light-theme');
            } else {
                body.classList.remove('light-theme');
            }
        };

        if (theme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            apply(prefersDark ? 'dark' : 'light');
        } else {
            apply(theme);
        }
    }
    
    /**
     * Atualiza o tamanho da fonte
     * @param {string} value - O valor do slider (1-5)
     */
    function updateFontSize(value) {
        const root = document.documentElement;
        const fontSize = 14 + (value - 1) * 2; // 14px, 16px, 18px, 20px, 22px
        
        root.style.setProperty('--font-size-base', `${fontSize}px`);
        
        // Salvar a preferência do usuário
        localStorage.setItem('fontSize', value);
    }
    
    /**
     * Atualiza a densidade da interface
     * @param {string} value - O valor da densidade (compact, normal, comfortable)
     */
    function updateDensity(value) {
        const root = document.documentElement;
        
        // Definir os valores de espaçamento com base na densidade
        if (value === 'compact') {
            root.style.setProperty('--spacing-multiplier', '0.8');
        } else if (value === 'normal') {
            root.style.setProperty('--spacing-multiplier', '1');
        } else if (value === 'comfortable') {
            root.style.setProperty('--spacing-multiplier', '1.2');
        }
        
        // Salvar a preferência do usuário
        localStorage.setItem('density', value);
    }
    
    /**
     * Atualiza uma configuração de notificação
     * @param {string} name - O nome da notificação
     * @param {boolean} enabled - Se a notificação está habilitada
     */
    function updateNotificationSetting(name, enabled) {
        console.log(`Notificação "${name}" ${enabled ? 'ativada' : 'desativada'}`);
        
        // Em uma implementação real, isso seria enviado para o backend
        // Aqui, apenas salvamos no localStorage para demonstração
        const notifications = JSON.parse(localStorage.getItem('notifications') || '{}');
        notifications[name] = enabled;
        localStorage.setItem('notifications', JSON.stringify(notifications));
    }
    
    /**
     * Atualiza uma configuração de privacidade
     * @param {string} name - O nome da configuração de privacidade
     * @param {boolean} enabled - Se a configuração está habilitada
     */
    function updatePrivacySetting(name, enabled) {
        console.log(`Configuração de privacidade "${name}" ${enabled ? 'ativada' : 'desativada'}`);
        
        // Em uma implementação real, isso seria enviado para o backend
        // Aqui, apenas salvamos no localStorage para demonstração
        const privacy = JSON.parse(localStorage.getItem('privacy') || '{}');
        privacy[name] = enabled;
        localStorage.setItem('privacy', JSON.stringify(privacy));
    }
    
    /**
     * Exporta dados do usuário
     * @param {string} type - O tipo de dados a serem exportados
     */
    function exportData(type) {
        console.log(`Exportando dados: ${type}`);
        
        // Em uma implementação real, isso faria uma requisição ao backend
        // Aqui, apenas exibimos uma mensagem de sucesso
        alert(`Os dados "${type}" foram exportados com sucesso!`);
    }
    
    /**
     * Confirma a exclusão da conta
     */
    function confirmDeleteAccount() {
        const confirmed = confirm('Tem certeza que deseja excluir sua conta? Esta ação é irreversível e todos os seus dados serão perdidos.');
        
        if (confirmed) {
            // Em uma implementação real, isso faria uma requisição ao backend
            // Aqui, apenas exibimos uma mensagem de sucesso
            alert('Sua conta foi excluída com sucesso!');
            
            // Redirecionar para a página inicial
            window.location.href = 'index.html';
        }
    }
    
    /**
     * Salva as alterações no perfil
     */
    function saveProfile() {
        // Obter os valores dos campos
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const oab = document.getElementById('oab').value;
        const bio = document.getElementById('bio').value;
        
        // Em uma implementação real, isso faria uma requisição ao backend
        // Aqui, apenas exibimos uma mensagem de sucesso
        alert('Perfil atualizado com sucesso!');
        
        // Atualizar o nome e email na barra lateral
        document.querySelector('.user-name').textContent = name;
        document.querySelector('.user-email').textContent = email;
        
        // Atualizar as iniciais no avatar
        const initials = name.split(' ').map(n => n[0]).join('');
        document.querySelector('.user-avatar').textContent = initials;
        document.querySelector('.avatar-placeholder').textContent = initials;
    }
    
    /**
     * Altera a senha do usuário
     */
    function changePassword() {
        // Obter os valores dos campos
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // Validar os campos
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert('Por favor, preencha todos os campos.');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            alert('As senhas não coincidem.');
            return;
        }
        
        // Em uma implementação real, isso faria uma requisição ao backend
        // Aqui, apenas exibimos uma mensagem de sucesso
        alert('Senha alterada com sucesso!');
        
        // Limpar os campos
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
    }
    
    /**
     * Carrega as preferências salvas do usuário
     */
    function loadUserPreferences() {
        // Carregar tema
        const savedTheme = localStorage.getItem('theme') || 'light';
        const themeOption = Array.from(themeOptions).find(option => {
            if (savedTheme === 'dark') {
                return option.querySelector('.theme-preview').classList.contains('dark-theme');
            } else if (savedTheme === 'system') {
                return option.querySelector('.theme-preview').classList.contains('system-theme');
            } else {
                return option.querySelector('.theme-preview').classList.contains('light-theme');
            }
        });
        
        if (themeOption) {
            setActiveTheme(themeOption);
        }
        
        // Carregar tamanho da fonte
        const savedFontSize = localStorage.getItem('fontSize');
        if (savedFontSize && fontSizeSlider) {
            fontSizeSlider.value = savedFontSize;
            updateFontSize(savedFontSize);
        }
        
        // Carregar densidade
        const savedDensity = localStorage.getItem('density');
        if (savedDensity) {
            const densityOption = document.getElementById(`density-${savedDensity}`);
            if (densityOption) {
                densityOption.checked = true;
                updateDensity(savedDensity);
            }
        }
        
        // Carregar notificações
        const savedNotifications = JSON.parse(localStorage.getItem('notifications') || '{}');
        notificationToggles.forEach(toggle => {
            const notificationName = toggle.closest('.notification-option').querySelector('h4').textContent;
            if (savedNotifications.hasOwnProperty(notificationName)) {
                toggle.checked = savedNotifications[notificationName];
            }
        });
        
        // Carregar configurações de privacidade
        const savedPrivacy = JSON.parse(localStorage.getItem('privacy') || '{}');
        privacyToggles.forEach(toggle => {
            const privacyName = toggle.closest('.privacy-option').querySelector('h4').textContent;
            if (savedPrivacy.hasOwnProperty(privacyName)) {
                toggle.checked = savedPrivacy[privacyName];
            }
        });
    }
    
    // Carregar preferências do usuário ao iniciar
    loadUserPreferences();
});
