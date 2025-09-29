# Estrutura de Arquivos do Frontend

Esta documentação detalha a organização dos arquivos e diretórios do projeto frontend.

```
packages/frontend/
├── Documentation/         # Contém todos os arquivos de documentação.
│   ├── README.md
│   └── ...
├── assets/                # Pasta para todos os recursos estáticos.
│   ├── css/
│   │   └── style.css      # Folha de estilos global.
│   ├── js/
│   │   ├── agents/
│   │   │   └── contract_analyzer.js  # Lógica específica do agente.
│   │   └── main.js        # Script principal e lógica global.
│   └── images/            # Repositório para imagens e ícones.
└── index.html             # Ponto de entrada da aplicação.
```

## Descrição dos Componentes

- **`index.html`**: É o único arquivo HTML da aplicação, seguindo o padrão de Single Page Application (SPA). Ele define a estrutura de layout principal, incluindo a barra lateral e a área de chat.

- **`assets/`**: O diretório central para todos os recursos (assets) utilizados pela aplicação.

  - **`css/style.css`**: O único arquivo de folha de estilos do projeto. Ele contém todas as regras de estilização, desde o layout geral até componentes específicos. A metodologia BEM (Block, Element, Modifier) é utilizada para manter as classes CSS organizadas e escaláveis.

  - **`js/`**: Contém todo o código JavaScript da aplicação.
    - **`main.js`**: O coração da lógica do frontend. Ele é carregado como um módulo (`type="module"`) e é responsável por:
      - Inicializar a aplicação.
      - Gerenciar o estado do chat (sessão, histórico).
      - Adicionar `event listeners` para os elementos da UI (formulário, botões).
      - Orquestrar a comunicação com os módulos de agentes específicos.
    - **`agents/contract_analyzer.js`**: Um módulo dedicado à lógica do "Analisador de Contratos". Ele exporta funções que `main.js` importa para:
      - Enviar o conteúdo do contrato para o backend.
      - Processar as respostas específicas deste agente.

  - **`images/`**: Destinado a armazenar todos os recursos visuais, como logotipos, ícones e outras imagens que possam ser usadas na interface.
