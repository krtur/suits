# 📋 PLANO DE INTEGRAÇÃO - AGENTE PENAL

**Data:** 21/09/2025  
**Objetivo:** Criar um Agente Penal especializado com RAG contextual e bases de conhecimento separadas por área jurídica.

---

## 🎯 RESUMO EXECUTIVO

### Problema Atual
- Sistema atual não separa bases de conhecimento por área jurídica
- Risco de "vazamento" entre Civil e Penal nas buscas RAG
- Arquitetura não escalável para novas áreas do direito

### Solução Proposta
- Implementar categorização por `legal_area` no banco de dados
- Criar sistema de busca contextual por agente
- Desenvolver Agente Penal especializado com RAG exclusivo

### Benefícios Esperados
- ✅ Separação clara entre áreas jurídicas
- ✅ Busca contextual precisa e relevante
- ✅ Arquitetura escalável para futuras áreas
- ✅ Performance otimizada com índices específicos

---

## 📊 MODIFICAÇÕES NO BANCO DE DADOS

### Alterações Necessárias

```sql
-- 1. Adicionar coluna 'legal_area' na tabela principal
ALTER TABLE dir_knowledge_base 
ADD COLUMN legal_area VARCHAR(50) DEFAULT 'civil';

-- 2. Criar índice para otimizar buscas por área
CREATE INDEX idx_knowledge_base_legal_area ON dir_knowledge_base(legal_area);

-- 3. Atualizar registro existente do Código Civil
UPDATE dir_knowledge_base 
SET legal_area = 'civil' 
WHERE title LIKE '%Civil%';
```

### Estrutura Final das Tabelas

**dir_knowledge_base:**
- `id` (existente)
- `title` (existente)
- `total_chunks` (existente)
- `legal_area` (NOVO) - valores: 'civil', 'penal', 'processual_penal'
- `created_at` (existente)

**dir_knowledge_base_chunks:**
- Mantém estrutura atual
- Herda categorização via `document_id`

---

## 🏗️ NOVA ARQUITETURA DE SERVIÇOS

### RetrieverService Expandido

```python
class RetrieverService:
    """Serviço para gerenciar retrievers por área jurídica."""
    
    def __init__(self):
        self._retrievers = {
            'civil': None,
            'penal': None,
            'processual_penal': None
        }
    
    def set_retriever(self, legal_area: str, retriever):
        """Define retriever para uma área específica."""
        self._retrievers[legal_area] = retriever
    
    def get_retriever(self, legal_area: str):
        """Obtém retriever de uma área específica."""
        return self._retrievers.get(legal_area)
    
    def get_combined_retriever(self, areas: List[str]):
        """Combina retrievers de múltiplas áreas."""
        # Para agentes que precisam de múltiplas áreas
        pass
```

### KnowledgeBaseService Atualizado

```python
def process_and_save_pdf(self, pdf_path: str, document_title: str, legal_area: str = 'civil'):
    """Processa PDF com categorização por área jurídica."""
    # Adiciona legal_area ao registro do documento
    doc_response = self.supabase_client.table('dir_knowledge_base').insert({
        'title': document_title,
        'total_chunks': len(chunks),
        'legal_area': legal_area  # NOVO CAMPO
    }).execute()
```

---

## 🤖 ESPECIFICAÇÕES DO AGENTE PENAL

### Características Técnicas
- **Nome:** "Agente Penal"
- **ID:** `agente_penal`
- **Cor:** Laranja (#e67e22)
- **Modelo:** Gemini-2.5-flash
- **Temperatura:** 0.1 (precisão jurídica)
- **RAG:** Busca exclusiva em documentos penais

### Áreas de Conhecimento
- Direito Penal (Código Penal)
- Direito Processual Penal (Código de Processo Penal)
- Lei de Execução Penal (opcional)

### Documentos Base Necessários
- `CodigoPenal.pdf`
- `CodigoProcessoPenal.pdf`
- `LeiExecucaoPenal.pdf` (opcional)

---

## 🔍 ESTRATÉGIA DE BUSCA CONTEXTUAL

### Mapeamento Agente → Área Jurídica

```python
AGENT_LEGAL_AREAS = {
    'contract_analyzer': ['civil'],           # Contratos usam direito civil
    'agente_civil': ['civil'],               # Apenas direito civil
    'agente_penal': ['penal', 'processual_penal'],  # Direito penal completo
    'devil_advocate': []                     # Sem RAG, apenas conversacional
}
```

### Fluxo de Isolamento de Busca

1. **Identificação:** Agente solicita busca RAG
2. **Filtragem:** Sistema identifica área(s) do agente
3. **Busca:** RAG opera apenas nos documentos da área específica
4. **Resultado:** Zero "vazamento" entre áreas jurídicas

### Exemplo Prático

```python
# Agente Civil busca sobre "contratos"
retriever = retriever_service.get_retriever('civil')
docs = retriever.invoke("cláusulas contratuais")
# Resultado: Apenas documentos do Código Civil

# Agente Penal busca sobre "homicídio"
retriever = retriever_service.get_retriever('penal')
docs = retriever.invoke("crime de homicídio")
# Resultado: Apenas documentos do Código Penal
```

---

## 📋 PLANO DE EXECUÇÃO

### Fase 53: Implementação do Agente Penal

#### 53.1 - Modificar Estrutura do Banco
- [ ] Executar ALTER TABLE para adicionar `legal_area`
- [ ] Criar índice de performance
- [ ] Atualizar registro do Código Civil existente
- [ ] Validar integridade dos dados

#### 53.2 - Expandir RetrieverService
- [ ] Refatorar para suportar múltiplas áreas
- [ ] Implementar métodos de busca contextual
- [ ] Manter compatibilidade com código existente
- [ ] Adicionar testes unitários

#### 53.3 - Atualizar KnowledgeBaseService e Script de Upload
- [ ] Adicionar parâmetro `legal_area` na indexação
- [ ] Modificar `create_knowledge_base.py` para aceitar `--legal-area`
- [ ] Implementar validação de categorias
- [ ] Manter compatibilidade com uploads existentes
- [ ] Atualizar logs e tratamento de erros
- [ ] Documentar nova interface

#### 53.4 - Criar Prompt Especializado
- [ ] Desenvolver `AgentePenal_system_prompt.txt`
- [ ] Definir especialização em direito penal
- [ ] Incluir guard rails específicos
- [ ] Testar qualidade das respostas

#### 53.5 - Implementar Serviço do Agente
- [ ] Criar `penal_agent_service.py`
- [ ] Seguir padrão dos agentes existentes
- [ ] Integrar com RetrieverService atualizado
- [ ] Implementar tratamento de erros

#### 53.6 - Integração no Backend
- [ ] Adicionar rota em `agent_routes.py`
- [ ] Registrar no dicionário de serviços
- [ ] Atualizar `prompts.py` com novo prompt
- [ ] Validar endpoints da API

#### 53.7 - Atualizar Frontend
- [ ] Adicionar "Agente Penal" na interface
- [ ] Implementar tema laranja
- [ ] Criar módulo `agente_penal.js`
- [ ] Testar interação do usuário

#### 53.8 - Indexar Documentos Penais
- [ ] Obter PDFs do Código Penal e Processual Penal
- [ ] Executar indexação com `legal_area = 'penal'`
- [ ] Validar embeddings e chunks
- [ ] Configurar retrievers específicos

#### 53.9 - Testes de Integração
- [ ] Testar busca contextual por área
- [ ] Validar isolamento entre agentes
- [ ] Verificar performance das consultas
- [ ] Executar testes de regressão

---

## 🎨 ESPECIFICAÇÕES DE UI/UX

### Tema Visual do Agente Penal

```css
/* Paleta Agente Penal */
--agente-penal-primary: #e67e22; /* Laranja profissional */
--agente-penal-agent-bg: #fdf2e9; /* Fundo claro laranja */

.app-container[data-active-agent="agente_penal"] {
    --primary-color: var(--agente-penal-primary);
    --agent-message-bg: var(--agente-penal-agent-bg);
}
```

### Mensagem de Boas-vindas

```javascript
welcomeMessage: `
    <p>Olá! Sou seu assistente especializado em <strong>Direito Penal e Processual Penal</strong>.</p>
    <p style="margin-top: 10px;">Posso ajudá-lo com questões sobre crimes, penas, procedimentos penais e execução penal. Como posso auxiliá-lo hoje?</p>
`
```

---

## 📈 MÉTRICAS DE SUCESSO

### Critérios de Aceitação
- [ ] Agente Penal responde apenas com base em documentos penais
- [ ] Agente Civil não acessa documentos penais
- [ ] Performance de busca mantida ou melhorada
- [ ] Interface visual consistente com outros agentes
- [ ] Zero erros de importação ou execução

### Testes de Validação
1. **Teste de Isolamento:** Perguntar sobre "homicídio" para Agente Civil (deve recusar/redirecionar)
2. **Teste de Especialização:** Perguntar sobre "crime de furto" para Agente Penal (deve responder com base no CP)
3. **Teste de Performance:** Medir tempo de resposta antes/depois das modificações
4. **Teste de Regressão:** Validar que agentes existentes continuam funcionando

---

## 📁 MODIFICAÇÕES NO SCRIPT DE UPLOAD

### Script Atual vs Modificado

**Antes:**
```bash
python create_knowledge_base.py "caminho/arquivo.pdf" "Título do Documento"
```

**Depois:**
```bash
python create_knowledge_base.py "caminho/arquivo.pdf" "Título do Documento" --legal-area "area_juridica"
```

### Modificações no `create_knowledge_base.py`

```python
def main(pdf_path: str, title: str, legal_area: str = 'civil'):
    """Função principal que utiliza o KnowledgeBaseService para indexar um PDF."""
    if not os.path.exists(pdf_path):
        logger.error(f"Arquivo não encontrado: {pdf_path}")
        return

    try:
        knowledge_base_service.process_and_save_pdf(pdf_path, title, legal_area)
    except Exception as e:
        logger.error(f"Ocorreu um erro inesperado durante a indexação: {e}")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Indexar um documento PDF na base de conhecimento do Supabase.")
    parser.add_argument("pdf_file", type=str, help="Caminho para o arquivo PDF a ser indexado.")
    parser.add_argument("title", type=str, help="Título do documento para referência.")
    parser.add_argument("--legal-area", type=str, default="civil", 
                       choices=["civil", "penal", "processual_penal", "trabalhista", "tributario"],
                       help="Área jurídica do documento (padrão: civil)")
    
    args = parser.parse_args()
    main(args.pdf_file, args.title, args.legal_area)
```

### Compatibilidade Garantida

- ✅ **Uploads existentes:** Continuam funcionando sem modificação
- ✅ **Padrão:** Documentos sem `--legal-area` são categorizados como 'civil'
- ✅ **Validação:** Apenas áreas jurídicas válidas são aceitas

---

## 📚 EXEMPLOS DE USO - BASES DE CONHECIMENTO

### Documentos Atuais

```bash
# Código Civil (já indexado - será atualizado via SQL)
python create_knowledge_base.py "knowledge_base/CodigoCivil.pdf" "Código Civil Brasileiro"
```

### Novos Documentos Penais

```bash
# Código Penal
python create_knowledge_base.py "knowledge_base/CodigoPenal.pdf" "Código Penal Brasileiro" --legal-area "penal"

# Código de Processo Penal
python create_knowledge_base.py "knowledge_base/CodigoProcessoPenal.pdf" "Código de Processo Penal" --legal-area "processual_penal"

# Lei de Execução Penal (opcional)
python create_knowledge_base.py "knowledge_base/LeiExecucaoPenal.pdf" "Lei de Execução Penal" --legal-area "penal"
```

### Futuras Expansões (Exemplos)

```bash
# Direito Trabalhista
python create_knowledge_base.py "knowledge_base/CLT.pdf" "Consolidação das Leis do Trabalho" --legal-area "trabalhista"

# Direito Tributário
python create_knowledge_base.py "knowledge_base/CodigoTributario.pdf" "Código Tributário Nacional" --legal-area "tributario"

# Direito Empresarial
python create_knowledge_base.py "knowledge_base/LeiSociedades.pdf" "Lei das Sociedades Anônimas" --legal-area "empresarial"

# Direito Constitucional
python create_knowledge_base.py "knowledge_base/ConstituicaoFederal.pdf" "Constituição Federal" --legal-area "constitucional"
```

### Estrutura de Diretórios Recomendada

```
knowledge_base/
├── civil/
│   ├── CodigoCivil.pdf
│   └── LeiInquilinato.pdf
├── penal/
│   ├── CodigoPenal.pdf
│   ├── CodigoProcessoPenal.pdf
│   └── LeiExecucaoPenal.pdf
├── trabalhista/
│   ├── CLT.pdf
│   └── LeiTerceirizacao.pdf
└── tributario/
    ├── CodigoTributario.pdf
    └── LeiResponsabilidade.pdf
```

### Comandos de Indexação por Lote

```bash
# Script para indexar todos os documentos penais
cd packages/backend/scripts

python create_knowledge_base.py "../knowledge_base/penal/CodigoPenal.pdf" "Código Penal Brasileiro" --legal-area "penal"
python create_knowledge_base.py "../knowledge_base/penal/CodigoProcessoPenal.pdf" "Código de Processo Penal" --legal-area "processual_penal"
python create_knowledge_base.py "../knowledge_base/penal/LeiExecucaoPenal.pdf" "Lei de Execução Penal" --legal-area "penal"
```

### Verificação de Indexação

```sql
-- Consultar documentos por área jurídica
SELECT id, title, legal_area, total_chunks, created_at 
FROM dir_knowledge_base 
ORDER BY legal_area, title;

-- Contar documentos por área
SELECT legal_area, COUNT(*) as total_documentos, SUM(total_chunks) as total_chunks
FROM dir_knowledge_base 
GROUP BY legal_area;
```

---

## 🚀 PRÓXIMOS PASSOS

### Após Validação do Plano
1. **Aprovação:** Revisar e aprovar este documento
2. **Preparação:** Obter arquivos PDF dos códigos penais
3. **Execução:** Iniciar implementação pela Fase 53.1
4. **Monitoramento:** Acompanhar progresso via TODO list

### Considerações Futuras
- Expansão para outras áreas (Trabalhista, Tributário, etc.)
- Implementação de busca cross-área quando necessário
- Otimizações de performance com cache de retrievers
- Interface administrativa para gerenciar áreas jurídicas

---

**Documento criado em:** 21/09/2025  
**Versão:** 1.0  
**Status:** Aguardando validação
