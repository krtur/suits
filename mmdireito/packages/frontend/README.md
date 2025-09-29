# M&M Direito - Frontend

Este é o frontend da plataforma M&M Direito, uma aplicação web para agentes jurídicos inteligentes.

## Tecnologias Utilizadas

- HTML5
- CSS3 (SCSS)
- JavaScript (Vanilla JS)
- Vite (Ferramenta de build)

## Estrutura do Projeto

```
frontend/
├── assets/                # Recursos estáticos
│   ├── css/               # Arquivos CSS compilados
│   ├── scss/              # Arquivos fonte SCSS
│   │   ├── base/          # Estilos base
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── design-system/ # Design system (variáveis, cores, etc.)
│   │   ├── layout/        # Layouts principais
│   │   ├── pages/         # Estilos específicos de páginas
│   │   ├── themes/        # Temas para agentes
│   │   └── utilities/     # Classes utilitárias
│   ├── js/                # Scripts JavaScript
│   │   └── agents/        # Scripts específicos para cada agente
│   └── images/            # Imagens e ícones
├── index.html             # Página principal (chat)
├── dashboard.html         # Dashboard
├── document-analysis.html # Análise de documentos
├── settings.html          # Configurações
├── about.html             # Sobre
├── package.json           # Dependências e scripts
└── vite.config.js         # Configuração do Vite
```

## Instalação

1. Certifique-se de ter o Node.js instalado (versão 16 ou superior)
2. Instale as dependências:

```bash
npm install
```

## Desenvolvimento

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

Isso iniciará o servidor em `http://localhost:3000` com hot-reloading.

## Build

Para gerar a versão de produção:

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`.

## Visualização da Build

Para visualizar a build de produção localmente:

```bash
npm run preview
```

## Agentes Disponíveis

- **Analisador de Contratos**: Analisa contratos e identifica riscos
- **Advogado do Diabo**: Analisa criticamente argumentos jurídicos
- **Agente Civil**: Especialista em Direito Civil
- **Agente Penal**: Especialista em Direito Penal e Processual Penal
