"""Memory manager for cross-application context storage and retrieval."""

from typing import List, Optional, Dict
from datetime import datetime, timezone
import uuid
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue
import structlog

from cortex.config import settings

logger = structlog.get_logger()


class MemoryManager:
    """
    Manages storage and retrieval of cross-application context using Vector Database.
    
    Uses Qdrant for vector storage and sentence-transformers for embeddings.
    """
    
    def __init__(
        self,
        qdrant_url: Optional[str] = None,
        collection_name: Optional[str] = None,
        embedding_model: str = "all-MiniLM-L6-v2"
    ):
        """
        Initialize memory manager.
        
        Args:
            qdrant_url: Qdrant server URL (defaults to settings)
            collection_name: Collection name (defaults to settings)
            embedding_model: Sentence transformer model name
        """
        self.qdrant_url = qdrant_url or settings.qdrant_url
        self.collection_name = collection_name or settings.qdrant_collection
        self._client: Optional[QdrantClient] = None
        self._embedding_model = SentenceTransformer(embedding_model)
        self._embedding_dim = 384  # Dimension for all-MiniLM-L6-v2
        
        logger.info(
            "memory_manager_initialized",
            qdrant_url=self.qdrant_url,
            collection=self.collection_name
        )
    
    async def connect(self):
        """Establish connection to Qdrant and ensure collection exists."""
        if self._client is None:
            # Initialize Qdrant client
            if settings.qdrant_api_key:
                self._client = QdrantClient(
                    url=self.qdrant_url,
                    api_key=settings.qdrant_api_key
                )
            else:
                self._client = QdrantClient(url=self.qdrant_url)
            
            # Create collection if it doesn't exist
            try:
                self._client.get_collection(self.collection_name)
                logger.info("qdrant_collection_exists", collection=self.collection_name)
            except Exception:
                self._client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(
                        size=self._embedding_dim,
                        distance=Distance.COSINE
                    )
                )
                logger.info("qdrant_collection_created", collection=self.collection_name)
    
    async def disconnect(self):
        """Close Qdrant connection."""
        if self._client:
            self._client.close()
            self._client = None
            logger.info("qdrant_disconnected")
    
    async def retrieve_context(
        self,
        user_id: str,
        query: str,
        top_k: int = 3
    ) -> List[str]:
        """
        Queries vector DB for relevant memories.
        
        Args:
            user_id: User identifier
            query: Query text for semantic search
            top_k: Number of results to return (default: 3)
            
        Returns:
            List of context strings (summaries)
        """
        if not self._client:
            await self.connect()
        
        if not query:
            return []
        
        # Generate query embedding
        query_embedding = self._embed_text(query)
        
        try:
            # Search with user_id filter
            results = self._client.search(
                collection_name=self.collection_name,
                query_vector=query_embedding.tolist(),
                query_filter=Filter(
                    must=[
                        FieldCondition(
                            key="user_id",
                            match=MatchValue(value=user_id)
                        )
                    ]
                ),
                limit=top_k
            )
            
            # Extract summaries from results (limit to top_k in case mock returns more)
            contexts = []
            for result in results[:top_k]:
                summary = result.payload.get("summary", "")
                if summary:
                    contexts.append(summary)
                    logger.debug(
                        "memory_retrieved",
                        user_id=user_id,
                        score=result.score,
                        summary_length=len(summary)
                    )
            
            logger.info(
                "context_retrieval_complete",
                user_id=user_id,
                count=len(contexts),
                requested=top_k
            )
            
            return contexts
        
        except Exception as e:
            logger.error(
                "context_retrieval_failed",
                user_id=user_id,
                error=str(e)
            )
            return []
    
    async def store_memory(
        self,
        user_id: str,
        summary: str,
        conversation: Optional[Dict] = None,
        source_app: str = "cortex"
    ):
        """
        Embeds and stores distilled memory with metadata.
        
        Args:
            user_id: User identifier
            summary: Distilled fact/summary to store
            conversation: Optional conversation context
            source_app: Source application name
        """
        if not self._client:
            await self.connect()
        
        if not summary:
            logger.warning("empty_summary_skipped", user_id=user_id)
            return
        
        # Generate embedding
        embedding = self._embed_text(summary)
        
        # Create point
        point_id = str(uuid.uuid4())
        point = PointStruct(
            id=point_id,
            vector=embedding.tolist(),
            payload={
                "user_id": user_id,
                "summary": summary,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "source_app": source_app,
                "conversation_snippet": str(conversation) if conversation else ""
            }
        )
        
        try:
            self._client.upsert(
                collection_name=self.collection_name,
                points=[point]
            )
            
            logger.info(
                "memory_stored",
                user_id=user_id,
                point_id=point_id,
                summary_length=len(summary)
            )
        
        except Exception as e:
            logger.error(
                "memory_storage_failed",
                user_id=user_id,
                error=str(e)
            )
    
    def _embed_text(self, text: str):
        """
        Generates embedding using sentence-transformers.
        
        Args:
            text: Text to embed
            
        Returns:
            Numpy array of embeddings
        """
        return self._embedding_model.encode(text, convert_to_numpy=True)


# Global memory manager instance
memory_manager = MemoryManager()
