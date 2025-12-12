"""Semantic routing for intent classification and model selection."""

import os
from enum import Enum
from typing import Optional, List
import structlog

# BRAIN TRANSPLANT: Use LiteLLM for cloud embeddings instead of local models
try:
    from litellm import embedding
    import numpy as np
    LITELLM_AVAILABLE = True
except ImportError:
    logger.warning("litellm_not_available", message="Semantic routing disabled")
    LITELLM_AVAILABLE = False

logger = structlog.get_logger()


class IntentCategory(str, Enum):
    """Intent categories for prompt classification."""
    SIMPLE_CHAT = "Simple_Chat"
    CODE_GEN = "Code_Gen"
    COMPLEX_REASONING = "Complex_Reasoning"
    CREATIVE_STORY = "Creative_Story"


class SemanticRouter:
    """
    Classifies prompt intent and selects appropriate model tier.
    
    BRAIN TRANSPLANT: Uses cloud embeddings via LiteLLM for semantic similarity matching.
    """
    
    # Model mapping from category to LiteLLM model name
    MODEL_MAPPING = {
        IntentCategory.SIMPLE_CHAT: "reflex-model",
        IntentCategory.CODE_GEN: "analyst-model",
        IntentCategory.COMPLEX_REASONING: "genius-model",
        IntentCategory.CREATIVE_STORY: "genius-model",
    }
    
    # Category descriptions for semantic matching
    CATEGORY_DESCRIPTIONS = {
        IntentCategory.SIMPLE_CHAT: (
            "Simple conversational questions, greetings, basic information requests, "
            "casual chat, small talk, simple factual queries"
        ),
        IntentCategory.CODE_GEN: (
            "Programming tasks, code generation, debugging, code review, "
            "software development, writing functions, fixing bugs, technical implementation"
        ),
        IntentCategory.COMPLEX_REASONING: (
            "Complex analysis, deep reasoning, mathematical proofs, strategic planning, "
            "multi-step problem solving, research, detailed explanations, philosophical questions"
        ),
        IntentCategory.CREATIVE_STORY: (
            "Creative writing, storytelling, fiction, poetry, narrative generation, "
            "imaginative content, character development, plot creation"
        ),
    }
    
    def __init__(self, model_name: str = "gemini/text-embedding-004"):
        """
        Initialize semantic router with cloud embedding model.
        
        Args:
            model_name: Name of the cloud embedding model to use
        """
        self._model_name = model_name
        self._category_embeddings = {}
        
        logger.info(
            "semantic_router_initialized", 
            model=model_name,
            cloud_native=True
        )
    
    async def classify_intent(self, prompt: str) -> IntentCategory:
        """
        Classifies prompt into one of the defined categories.
        
        Uses cosine similarity between prompt embedding and category embeddings.
        
        Args:
            prompt: User prompt to classify
            
        Returns:
            IntentCategory enum value
        """
        if not LITELLM_AVAILABLE or not prompt:
            return IntentCategory.SIMPLE_CHAT
        
        try:
            # Lazy load category embeddings on first use
            if not self._category_embeddings:
                await self._precompute_category_embeddings()
            
            # Encode the prompt using cloud API
            prompt_embedding = await self._get_cloud_embedding(prompt)
            
            # Calculate cosine similarity with each category
            similarities = {}
            for category, category_embedding in self._category_embeddings.items():
                similarity = self._cosine_similarity(prompt_embedding, category_embedding)
                similarities[category] = similarity
            
            # Select category with highest similarity
            best_category = max(similarities, key=similarities.get)
            best_score = similarities[best_category]
            
            logger.info(
                "intent_classified",
                category=best_category.value,
                confidence=best_score,
                prompt_length=len(prompt),
                cloud_native=True
            )
            
            return best_category
            
        except Exception as e:
            logger.error(
                "intent_classification_failed",
                error=str(e),
                fallback="SIMPLE_CHAT"
            )
            return IntentCategory.SIMPLE_CHAT
    
    def select_model(
        self,
        category: IntentCategory,
        sentiment_override: bool = False
    ) -> str:
        """
        Maps category to model name.
        
        Returns genius-model if sentiment_override is True.
        
        Args:
            category: Classified intent category
            sentiment_override: Whether sentiment circuit breaker is triggered
            
        Returns:
            LiteLLM model name
        """
        if sentiment_override:
            logger.info("model_selection_overridden", reason="sentiment_circuit_breaker")
            return "genius-model"
        
        model = self.MODEL_MAPPING[category]
        
        logger.info(
            "model_selected",
            category=category.value,
            model=model
        )
        
        return model
    
    async def _precompute_category_embeddings(self):
        """Pre-compute embeddings for all category descriptions."""
        for category, description in self.CATEGORY_DESCRIPTIONS.items():
            embedding = await self._get_cloud_embedding(description)
            self._category_embeddings[category] = embedding
        
        logger.info(
            "category_embeddings_precomputed",
            count=len(self._category_embeddings),
            model=self._model_name
        )
    
    async def _get_cloud_embedding(self, text: str) -> List[float]:
        """
        Get embedding from cloud API via LiteLLM.
        
        Args:
            text: Text to embed
            
        Returns:
            List of embedding floats
        """
        response = await embedding(
            model=self._model_name,
            input=[text],
            api_key=os.getenv("GOOGLE_API_KEY")
        )
        
        return response['data'][0]['embedding']
    
    @staticmethod
    def _cosine_similarity(a: List[float], b: List[float]) -> float:
        """
        Calculate cosine similarity between two vectors.
        
        Args:
            a: First vector
            b: Second vector
            
        Returns:
            Cosine similarity score between -1 and 1
        """
        if not LITELLM_AVAILABLE:
            return 0.0
            
        a_np = np.array(a)
        b_np = np.array(b)
        return float(np.dot(a_np, b_np) / (np.linalg.norm(a_np) * np.linalg.norm(b_np)))
