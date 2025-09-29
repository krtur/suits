document.addEventListener('DOMContentLoaded', () => {
    const notesSidebar = document.querySelector('.notes-sidebar');
    const toggleNotesBtn = document.querySelector('.toggle-notes-btn');
    const chatWindow = document.getElementById('chat-window');
    const notesContent = document.getElementById('notes-content');
    const emptyPlaceholder = document.querySelector('.empty-notes-placeholder');

    // Adiciona o botão de abrir flutuante dinamicamente
    const openNotesBtn = document.createElement('button');
    openNotesBtn.classList.add('open-notes-btn');
    openNotesBtn.title = 'Abrir Anotações';
    openNotesBtn.innerHTML = `<span class="material-symbols-outlined">chevron_left</span>`;
    document.body.appendChild(openNotesBtn);

    const NOTE_SIDEBAR_STATE_KEY = 'noteSidebarState';
    const NOTES_KEY = 'savedNotes';

    // --- Funções de Estado e Renderização ---

    const saveNotes = () => {
        const notes = Array.from(notesContent.querySelectorAll('.note-item')).map(noteEl => noteEl.innerHTML);
        localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    };

    const renderNote = (noteHTML) => {
        const noteItem = document.createElement('div');
        noteItem.classList.add('note-item');
        noteItem.innerHTML = noteHTML;

        // Adiciona o botão de deletar se não existir
        if (!noteItem.querySelector('.delete-note-btn')) {
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-note-btn');
            deleteBtn.title = 'Excluir anotação';
            deleteBtn.innerHTML = '<span class="material-symbols-outlined">close</span>';
            noteItem.appendChild(deleteBtn);
        }

        notesContent.appendChild(noteItem);
    };

    const loadNotes = () => {
        const savedNotes = JSON.parse(localStorage.getItem(NOTES_KEY) || '[]');
        notesContent.innerHTML = ''; // Limpa o conteúdo antes de carregar
        if (savedNotes.length > 0) {
            savedNotes.forEach(noteHTML => renderNote(noteHTML));
            if(emptyPlaceholder) emptyPlaceholder.classList.add('hidden');
        } else {
            if(emptyPlaceholder) {
                notesContent.appendChild(emptyPlaceholder);
                emptyPlaceholder.classList.remove('hidden');
            }
        }
    };

    const addNote = (text) => {
        if(emptyPlaceholder) emptyPlaceholder.classList.add('hidden');
        
        const noteHTML = `<p>${text}</p>`;
        renderNote(noteHTML);
        saveNotes();
    };

    // --- Funções de UI ---

    const setSidebarState = (isCollapsed) => {
        notesSidebar.classList.toggle('collapsed', isCollapsed);
        openNotesBtn.classList.toggle('visible', isCollapsed);
        localStorage.setItem(NOTE_SIDEBAR_STATE_KEY, isCollapsed ? 'collapsed' : 'expanded');
    };

    const toggleSidebar = () => {
        const isCollapsed = notesSidebar.classList.contains('collapsed');
        setSidebarState(!isCollapsed);
    };

    const initializeSidebarState = () => {
        const savedState = localStorage.getItem(NOTE_SIDEBAR_STATE_KEY);
        const isCollapsed = savedState === 'collapsed';
        setSidebarState(isCollapsed);
    };

    // --- Event Listeners ---

    if (toggleNotesBtn) {
        toggleNotesBtn.addEventListener('click', toggleSidebar);
    }

    if (openNotesBtn) {
        openNotesBtn.addEventListener('click', toggleSidebar);
    }

    if (chatWindow) {
        chatWindow.addEventListener('mouseup', (e) => {
            const selection = window.getSelection();
            const selectedText = selection.toString().trim();

            if (selectedText.length > 0) {
                // Evita adicionar texto de dentro da própria sidebar de notas
                if (notesSidebar.contains(selection.anchorNode)) return;

                // Cria um botão temporário para adicionar a nota
                const button = document.createElement('button');
                button.innerHTML = 'Salvar Anotação';
                button.className = 'add-note-btn';
                document.body.appendChild(button);

                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                
                button.style.position = 'absolute';
                button.style.top = `${window.scrollY + rect.bottom + 5}px`;
                button.style.left = `${window.scrollX + rect.left}px`;
                button.style.zIndex = '1001';

                button.onclick = () => {
                    addNote(selectedText);
                    document.body.removeChild(button);
                    window.getSelection().removeAllRanges();
                };

                // Remove o botão se o usuário clicar em outro lugar
                setTimeout(() => {
                    document.addEventListener('click', (event) => {
                        if (event.target !== button) {
                            if (document.body.contains(button)) {
                                document.body.removeChild(button);
                            }
                        }
                    }, { once: true });
                }, 100);
            }
        });
    }

    if (notesContent) {
        notesContent.addEventListener('click', (e) => {
            if (e.target.closest('.delete-note-btn')) {
                const noteItem = e.target.closest('.note-item');
                noteItem.remove();
                saveNotes();
                if (notesContent.children.length === 1 && emptyPlaceholder) { // Apenas o placeholder sobrou
                    emptyPlaceholder.classList.remove('hidden');
                }
            }
        });
    }

    // --- Inicialização ---
    initializeSidebarState();
    loadNotes();
});
