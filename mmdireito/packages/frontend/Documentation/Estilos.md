# Documentação de Estilos (CSS)

O arquivo `assets/css/style.css` é a única folha de estilos do projeto, responsável por toda a aparência da aplicação. A abordagem visa a manutenibilidade e a consistência visual.

## Paleta de Cores e Variáveis Globais

O tema da aplicação é definido no seletor `:root` através de variáveis CSS. Isso permite uma fácil customização e garante consistência em toda a interface.

```css
:root {
    --background-primary: #f0f2f5;
    --background-secondary: #ffffff;
    --background-tertiary: #e9ecef;
    --primary-color: #0d6efd;
    --primary-text: #212529;
    --secondary-text: #6c757d;
    --border-color: #dee2e6;
    --font-family: 'Roboto', sans-serif;
    --box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
```

- **Cores de Fundo:** Uma paleta de cinzas claros e branco para criar uma interface limpa e profissional.
- **Cor Primária:** Um azul (`#0d6efd`) usado para elementos de destaque, como botões, links e o item de agente ativo.
- **Cores de Texto:** Preto suave para o texto principal e cinza para informações secundárias.
- **Tipografia:** A fonte padrão é a 'Roboto', importada do Google Fonts.

## Metodologia e Estrutura

Embora não siga formalmente uma metodologia como BEM, a nomeação de classes adota uma abordagem semelhante, facilitando a compreensão da relação entre os elementos.

**Exemplo:**
- `.chat-container` (Bloco)
- `.chat-header` (Elemento)
- `.agent-item.active` (Modificador)

O CSS é estruturado nas seguintes seções principais:

1.  **Reset e Estilos Globais:** Define estilos básicos para `html`, `body` e remove margens/preenchimentos padrão.
2.  **Layout Principal:** Estiliza o `.app-container` usando `display: flex` para criar o layout de duas colunas (sidebar e chat).
3.  **Barra Lateral (Sidebar):** Estilos para o cabeçalho, logo, botão de novo chat e a lista de agentes.
4.  **Área de Chat:** Layout do contêiner de chat, cabeçalho e janela de mensagens.
5.  **Mensagens do Chat:** Estilização dos balões de mensagem para `user` e `agent`, incluindo o indicador de "carregando" com uma animação CSS.
6.  **Conteúdo Markdown:** Estilos específicos para listas, negrito, etc., dentro das mensagens do agente, garantindo uma boa legibilidade.
7.  **Componentes Interativos:**
    - **Drag and Drop Overlay:** Um overlay que aparece quando o usuário arrasta um arquivo sobre a janela.
    - **Ações Sugeridas:** Botões que aparecem após o upload de um arquivo.
    - **Barra de Progresso:** Estilos para a barra que indica o progresso do upload.
8.  **Área de Input:** Estilos para o formulário de chat, o `textarea` com auto-resize e os botões de anexo e envio.
