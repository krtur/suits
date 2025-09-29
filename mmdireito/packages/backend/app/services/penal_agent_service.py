# app/services/penal_agent_service.py

from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_community.chat_message_histories import ChatMessageHistory
from app.prompts import agente_penal_prompt
from app.services.retriever_service import retriever_service
from app.logger_config import logger
from typing import Dict

class PenalAgentService:
    """Serviço para o Agente Penal especializado em Direito Penal e Processual Penal."""

    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash-exp",
            temperature=0.1,
            max_tokens=None,
            timeout=None,
            max_retries=2,
        )
        
        # Histórico de sessões
        self.store: Dict[str, BaseChatMessageHistory] = {}
        
        # Inicializar sem RAG (será configurado dinamicamente)
        self.retriever = None
        self.rag_chain = None
        self.simple_chain = None
        
        logger.info("PenalAgentService inicializado com sucesso")

    def _ensure_chain_configured(self):
        """Garante que a cadeia está configurada com RAG se disponível."""
        try:
            logger.info("[DEBUG] Iniciando _ensure_chain_configured")
            
            # Verificar se já está configurado
            if self.rag_chain is not None or self.simple_chain is not None:
                logger.info("[DEBUG] Cadeia já configurada, retornando")
                return
            
            logger.info("[DEBUG] Buscando retrievers para áreas penais")
            # Obter retrievers para áreas penais
            penal_retriever = retriever_service.get_retriever('penal')
            processual_penal_retriever = retriever_service.get_retriever('processual_penal')
            
            logger.info(f"[DEBUG] Penal retriever: {type(penal_retriever) if penal_retriever else None}")
            logger.info(f"[DEBUG] Processual penal retriever: {type(processual_penal_retriever) if processual_penal_retriever else None}")
            
            # Combinar retrievers se ambos estiverem disponíveis
            if penal_retriever and processual_penal_retriever:
                logger.info("[DEBUG] Ambos retrievers disponíveis, combinando")
                
                # TESTE: Verificar se retrievers conseguem buscar documentos
                try:
                    logger.info("[DEBUG] Testando busca no retriever penal")
                    test_docs_penal = penal_retriever.get_relevant_documents("roubo furto crime")
                    logger.info(f"[DEBUG] Retriever penal encontrou {len(test_docs_penal)} documentos")
                    
                    logger.info("[DEBUG] Testando busca no retriever processual penal")
                    test_docs_proc = processual_penal_retriever.get_relevant_documents("roubo furto crime")
                    logger.info(f"[DEBUG] Retriever processual encontrou {len(test_docs_proc)} documentos")
                    
                    # TESTE CRÍTICO: Testar embedding service diretamente
                    logger.info("[DEBUG] Testando embedding service diretamente")
                    from app.services.embedding_service import embedding_service
                    test_embedding = embedding_service.embed_query("Art. 15. O agente que, voluntariamente, desiste")
                    logger.info(f"[DEBUG] Embedding gerado: dimensões={len(test_embedding) if test_embedding else 'None'}")
                    if test_embedding:
                        logger.info(f"[DEBUG] Primeiros 5 valores: {test_embedding[:5]}")
                    
                    # TESTE: Buscar diretamente no vector store
                    logger.info("[DEBUG] Testando busca direta no vector store penal")
                    penal_vector_store = retriever_service.get_retriever('penal').vectorstore
                    logger.info(f"[DEBUG] Vector store tipo: {type(penal_vector_store)}")
                    logger.info(f"[DEBUG] Vector store query_name: {getattr(penal_vector_store, 'query_name', 'None')}")
                    logger.info(f"[DEBUG] Vector store table_name: {getattr(penal_vector_store, 'table_name', 'None')}")
                    
                    # TESTE: Verificar se função SQL existe no Supabase
                    try:
                        logger.info("[DEBUG] Testando função SQL diretamente")
                        test_embedding_list = test_embedding.tolist() if hasattr(test_embedding, 'tolist') else test_embedding
                        
                        # Obter client corretamente do SupabaseVectorStore
                        from supabase import create_client
                        import os
                        supabase_client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))
                        
                        sql_result = supabase_client.rpc("match_documents_penal_area", {
                            "query_embedding": test_embedding_list,
                            "match_threshold": 0.5,
                            "match_count": 3
                        }).execute()
                        logger.info(f"[DEBUG] Função SQL direta retornou: {len(sql_result.data) if sql_result.data else 'None'}")
                        if sql_result.data:
                            logger.info(f"[DEBUG] Primeiro resultado SQL: {sql_result.data[0]}")
                        else:
                            logger.warning("[DEBUG] Função SQL existe mas retornou dados vazios")
                            
                        # TESTE: Verificar se a função existe mesmo
                        logger.info("[DEBUG] Verificando se função SQL existe")
                        function_check = supabase_client.rpc("exec_sql", {
                            "query": "SELECT routine_name FROM information_schema.routines WHERE routine_name = 'match_documents_penal_area'"
                        }).execute()
                        logger.info(f"[DEBUG] Função existe no schema: {function_check.data}")
                        
                    except Exception as sql_error:
                        logger.error(f"[DEBUG] Erro ao chamar função SQL direta: {sql_error}")
                        import traceback
                        logger.error(f"[DEBUG] SQL Traceback: {traceback.format_exc()}")
                    
                    direct_results = penal_vector_store.similarity_search("Art. 15. O agente que, voluntariamente, desiste", k=3)
                    logger.info(f"[DEBUG] Busca direta encontrou: {len(direct_results)} documentos")
                    
                except Exception as e:
                    logger.error(f"[DEBUG] Erro ao testar retrievers individuais: {e}")
                    import traceback
                    logger.error(f"[DEBUG] Traceback: {traceback.format_exc()}")
                
                self.retriever = retriever_service.get_combined_retriever(['penal', 'processual_penal'])
                logger.info("Retriever combinado configurado para áreas: penal e processual_penal")
                logger.info(f"[DEBUG] Retriever combinado tipo: {type(self.retriever)}")
                
                # TESTE: Verificar se retriever combinado funciona
                try:
                    logger.info("[DEBUG] Testando busca no retriever combinado")
                    test_docs_combined = self.retriever.get_relevant_documents("roubo furto crime")
                    logger.info(f"[DEBUG] Retriever combinado encontrou {len(test_docs_combined)} documentos")
                    if test_docs_combined:
                        logger.info(f"[DEBUG] Primeiro doc: {str(test_docs_combined[0])[:200]}...")
                except Exception as e:
                    logger.error(f"[DEBUG] Erro ao testar retriever combinado: {e}")
            elif penal_retriever:
                logger.info("[DEBUG] Apenas retriever penal disponível")
                self.retriever = penal_retriever
                logger.info("Retriever configurado apenas para área: penal")
            elif processual_penal_retriever:
                logger.info("[DEBUG] Apenas retriever processual penal disponível")
                self.retriever = processual_penal_retriever
                logger.info("Retriever configurado apenas para área: processual_penal")
            else:
                logger.warning("[DEBUG] Nenhum retriever disponível")
                self.retriever = None
                logger.warning("Nenhum retriever disponível para áreas penais. Agente funcionará sem RAG.")
            
            # Criar cadeia de chat
            if self.retriever:
                logger.info("[DEBUG] Configurando cadeia RAG")
                # Cadeia com RAG
                from langchain.chains import create_retrieval_chain
                from langchain.chains.combine_documents import create_stuff_documents_chain
                
                logger.info("[DEBUG] Criando document_chain")
                # Cadeia para combinar documentos
                document_chain = create_stuff_documents_chain(self.llm, agente_penal_prompt)
                logger.info(f"[DEBUG] Document chain criada: {type(document_chain)}")
                
                logger.info("[DEBUG] Criando retrieval_chain")
                # Cadeia de recuperação completa
                self.rag_chain = create_retrieval_chain(self.retriever, document_chain)
                logger.info(f"[DEBUG] RAG chain criada: {type(self.rag_chain)}")
                
                logger.info("Cadeia RAG configurada com sucesso")
            else:
                logger.info("[DEBUG] Configurando cadeia simples")
                # Cadeia simples sem RAG
                from langchain_core.prompts import ChatPromptTemplate
                
                simple_prompt = ChatPromptTemplate.from_messages([
                    ("system", agente_penal_prompt.messages[0].prompt.template),
                    ("placeholder", "{chat_history}"),
                    ("human", "{input}")
                ])
                
                self.simple_chain = simple_prompt | self.llm
                
                logger.info("Cadeia simples configurada (sem RAG)")
                
        except Exception as e:
            logger.error(f"[ERROR] Erro ao configurar cadeia de chat: {str(e)}")
            logger.error(f"[ERROR] Tipo do erro: {type(e)}")
            import traceback
            logger.error(f"[ERROR] Traceback: {traceback.format_exc()}")
            raise

    def get_session_history(self, session_id: str) -> BaseChatMessageHistory:
        """Obtém ou cria o histórico de uma sessão."""
        if session_id not in self.store:
            self.store[session_id] = ChatMessageHistory()
            logger.info(f"Nova sessão criada: {session_id}")
        return self.store[session_id]

    async def process_message(self, message: str, session_id: str) -> str:
        """
        Processa uma mensagem do usuário usando RAG SIMPLES para Direito Penal.
        
        Args:
            message: Mensagem do usuário
            session_id: ID da sessão para manter histórico
            
        Returns:
            Resposta do agente baseada no conhecimento jurídico
        """
        try:
            logger.info(f"[SIMPLE RAG] Processando mensagem para sessão {session_id}")
            logger.info(f"[SIMPLE RAG] Pergunta: {message}")
            
            # PASSO 1: Gerar embedding da pergunta
            from app.services.embedding_service import embedding_service
            logger.info("[SIMPLE RAG] Gerando embedding da pergunta...")
            query_embedding = embedding_service.embed_query(message)
            logger.info(f"[SIMPLE RAG] Embedding gerado: {len(query_embedding)} dimensões")
            
            # PASSO 2: Buscar documentos com SQL direto
            from supabase import create_client
            import os
            supabase_client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))
            
            logger.info("[SIMPLE RAG] Buscando documentos no Supabase...")
            
            # Converter embedding para lista se necessário
            embedding_list = query_embedding.tolist() if hasattr(query_embedding, 'tolist') else query_embedding
            
            # Buscar em ambas as áreas (penal e processual_penal)
            context_docs = []
            
            # Buscar área penal
            try:
                penal_results = supabase_client.rpc("match_documents_penal_area", {
                    "query_embedding": embedding_list,
                    "match_count": 3
                }).execute()
                
                if penal_results.data:
                    context_docs.extend(penal_results.data)
                    logger.info(f"[SIMPLE RAG] Encontrados {len(penal_results.data)} docs na área penal")
            except Exception as e:
                logger.warning(f"[SIMPLE RAG] Erro ao buscar área penal: {e}")
            
            # Buscar área processual penal
            try:
                proc_results = supabase_client.rpc("match_documents_processual_penal_area", {
                    "query_embedding": embedding_list,
                    "match_count": 3
                }).execute()
                
                if proc_results.data:
                    context_docs.extend(proc_results.data)
                    logger.info(f"[SIMPLE RAG] Encontrados {len(proc_results.data)} docs na área processual penal")
            except Exception as e:
                logger.warning(f"[SIMPLE RAG] Erro ao buscar área processual penal: {e}")
            
            # PASSO 3: Preparar contexto para o LLM
            logger.info(f"[SIMPLE RAG] Total de documentos encontrados: {len(context_docs)}")
            
            if not context_docs:
                logger.warning("[SIMPLE RAG] Nenhum documento encontrado, gerando resposta sem contexto")
                context_text = "Nenhum documento específico foi encontrado na base de conhecimento."
            else:
                # Ordenar por similaridade e pegar os melhores
                context_docs.sort(key=lambda x: x.get('similarity', 0), reverse=True)
                top_docs = context_docs[:5]  # Top 5 documentos
                
                context_text = "\n\n---\n\n".join([
                    f"Documento (similaridade: {doc.get('similarity', 'N/A'):.3f}):\n{doc['content']}"
                    for doc in top_docs
                ])
                
                logger.info(f"[SIMPLE RAG] Contexto preparado: {len(context_text)} caracteres")
            
            # PASSO 4: Preparar prompt para o LLM
            from app.prompts import AGENTE_PENAL_PROMPT
            
            full_prompt = f"""{AGENTE_PENAL_PROMPT}

CONTEXTO E DOCUMENTOS:
{context_text}

PERGUNTA DO USUÁRIO: {message}

Por favor, responda com base no contexto fornecido, citando os artigos e dispositivos legais específicos quando relevante:"""

            # PASSO 5: Chamar LLM
            logger.info("[SIMPLE RAG] Enviando para LLM...")
            response = await self.llm.ainvoke(full_prompt)
            
            logger.info(f"[SIMPLE RAG] Resposta do LLM: {len(response.content)} caracteres")
            
            # PASSO 6: Processar resposta
            answer = response.content if hasattr(response, 'content') else str(response)
            
            if not answer or answer.strip() == "":
                answer = "Desculpe, não consegui gerar uma resposta adequada. Poderia reformular sua pergunta sobre Direito Penal?"
            
            # Limitar tamanho da resposta
            if len(answer) > 4000:
                answer = answer[:4000] + "..."
                logger.info("[SIMPLE RAG] Resposta truncada por ser muito longa")
            
            logger.info(f"[SIMPLE RAG] Resposta final gerada com sucesso para sessão {session_id}")
            
            return answer
            
        except Exception as e:
            logger.error(f"[SIMPLE RAG] Erro ao processar mensagem: {e}")
            import traceback
            logger.error(f"[SIMPLE RAG] Traceback completo: {traceback.format_exc()}")
            return f"Erro interno ao processar sua solicitação: {str(e)}"

    def clear_session(self, session_id: str) -> bool:
        """Limpa o histórico de uma sessão específica."""
        try:
            if session_id in self.store:
                del self.store[session_id]
                logger.info(f"Sessão {session_id} limpa com sucesso")
                return True
            else:
                logger.warning(f"Tentativa de limpar sessão inexistente: {session_id}")
                return False
        except Exception as e:
            logger.error(f"Erro ao limpar sessão {session_id}: {e}")
            return False

    def get_session_count(self) -> int:
        """Retorna o número de sessões ativas."""
        return len(self.store)

# Instância global do serviço
penal_agent_service = PenalAgentService()
